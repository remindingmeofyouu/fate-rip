'use client'
import { useState, useEffect, useRef } from 'react'

const MAX_WIDGETS = 4
const LASTFM_API_KEY = process.env.NEXT_PUBLIC_LASTFM_API_KEY || ''
const HENRIK_API_KEY = process.env.NEXT_PUBLIC_HENRIK_API_KEY || ''

async function safeFetch(url, opts = {}) {
  const ctrl = new AbortController()
  const tid  = setTimeout(() => ctrl.abort(), 8000)
  try {
    const res = await fetch(url, { signal: ctrl.signal, ...opts })
    clearTimeout(tid)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (e) { clearTimeout(tid); throw e }
}

const STATUS_COLORS = { online:'#23d18b', idle:'#f0b232', dnd:'#f04747', offline:'#747f8d' }

function StatusDot({ status, size=12, border='#0d0505' }) {
  return <div style={{ width:size, height:size, borderRadius:'50%', background:STATUS_COLORS[status]||STATUS_COLORS.offline, border:`2px solid ${border}`, flexShrink:0 }} />
}

function Skeleton({ w='100%', h=14, r=6, style={} }) {
  return <div style={{ width:w, height:h, borderRadius:r, background:'rgba(255,255,255,0.06)', animation:'skeletonPulse 1.4s ease-in-out infinite', ...style }} />
}

function WidgetBadge({ color, children }) {
  return <span style={{ fontSize:9, fontWeight:800, color, background:`${color}18`, border:`1px solid ${color}35`, padding:'3px 7px', borderRadius:99, whiteSpace:'nowrap', flexShrink:0, letterSpacing:'0.04em' }}>{children}</span>
}

function WidgetSkeleton({ color, label }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:44, height:44, borderRadius:12, background:`${color}18`, flexShrink:0, animation:'skeletonPulse 1.4s ease-in-out infinite' }} />
        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:6 }}><Skeleton w="60%" h={13} /><Skeleton w="40%" h={11} /></div>
        <WidgetBadge color={color}>{label}</WidgetBadge>
      </div>
      <Skeleton w="100%" h={36} r={8} />
    </div>
  )
}

function WidgetError({ color, label, msg }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:40, height:40, borderRadius:10, background:`${color}15`, border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <svg width="18" height="18" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div>
          <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.6)' }}>Could not load widget</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:2, lineHeight:1.4 }}>{msg}</div>
        </div>
        <WidgetBadge color={color}>{label}</WidgetBadge>
      </div>
    </div>
  )
}

function fmt(n)    { if (n==null) return '—'; return Number(n).toLocaleString() }
function fmtBig(n) { if (!n) return '—'; if (n>=1e9) return (n/1e9).toFixed(1)+'B'; if (n>=1e6) return (n/1e6).toFixed(1)+'M'; if (n>=1e3) return (n/1e3).toFixed(1)+'K'; return String(n) }

// ─── DISCORD WIDGET (reads from Supabase presence table) ──────────────────────
function DiscordWidget({ config, supabase }) {
  const [data, setData] = useState(null)
  const [err,  setErr]  = useState('')
  const [load, setLoad] = useState(true)

  useEffect(() => {
    const id = config?.discordId?.trim()
    if (!id) { setErr('No Discord ID configured'); setLoad(false); return }
    if (!supabase) { setErr('Supabase not available'); setLoad(false); return }

    supabase.from('presence').select('*').eq('discord_id', id).single()
      .then(({ data: row, error }) => {
        if (error || !row) { setErr('User not found — they must join discord.gg/faterip'); setLoad(false); return }
        setData(row); setLoad(false)
      })

    const channel = supabase
      .channel(`presence-dashboard-${id}`)
      .on('postgres_changes', { event:'*', schema:'public', table:'presence', filter:`discord_id=eq.${id}` },
        (payload) => { if (payload.new) setData(payload.new) })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [config?.discordId, supabase])

  if (load) return <WidgetSkeleton color="#5865F2" label="DISCORD" />
  if (err)  return <WidgetError color="#5865F2" label="DISCORD" msg={err} />

  const status = data.status || 'offline'

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ position:'relative', flexShrink:0 }}>
          <div style={{ width:44, height:44, borderRadius:'50%', background:'rgba(88,101,242,0.2)', border:'1px solid rgba(88,101,242,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:'#5865F2', overflow:'hidden' }}>
            {data.avatar ? <img src={data.avatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} /> : (data.global_name||data.username||'D')[0].toUpperCase()}
          </div>
          <div style={{ position:'absolute', bottom:0, right:0 }}><StatusDot status={status} /></div>
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{data.global_name||data.username||'Unknown'}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:1 }}>{data.username ? `@${data.username}` : ''}</div>
          <div style={{ fontSize:11, color:STATUS_COLORS[status], fontWeight:600, marginTop:2, textTransform:'capitalize' }}>{status}</div>
        </div>
        <WidgetBadge color="#5865F2">DISCORD</WidgetBadge>
      </div>
      {data.activity_type === 'spotify' && (
        <div style={{ background:'rgba(29,185,84,0.08)', border:'1px solid rgba(29,185,84,0.2)', borderRadius:10, padding:'8px 10px', display:'flex', alignItems:'center', gap:8 }}>
          {data.spotify_album_art && <img src={data.spotify_album_art} alt="" style={{ width:32, height:32, borderRadius:6, flexShrink:0 }} />}
          <div style={{ minWidth:0, flex:1 }}>
            <div style={{ fontSize:11, color:'#1DB954', fontWeight:700, marginBottom:1 }}>♪ Listening on Spotify</div>
            <div style={{ fontSize:12, fontWeight:600, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{data.spotify_song}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{data.spotify_artist}</div>
          </div>
        </div>
      )}
      {data.activity_type && data.activity_type !== 'spotify' && data.activity_name && (
        <div style={{ background:'rgba(88,101,242,0.08)', border:'1px solid rgba(88,101,242,0.18)', borderRadius:10, padding:'8px 10px', display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ minWidth:0, flex:1 }}>
            <div style={{ fontSize:11, color:'#5865F2', fontWeight:700, marginBottom:1 }}>
              {{ playing:'🎮 Playing', watching:'📺 Watching', listening:'🎵 Listening', streaming:'🔴 Streaming', competing:'🏆 Competing' }[data.activity_type] || '● Activity'}
            </div>
            <div style={{ fontSize:12, fontWeight:600, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{data.activity_name}</div>
            {data.activity_details && <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{data.activity_details}</div>}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── GITHUB ───────────────────────────────────────────────────────────────────
function GitHubWidget({ config }) {
  const [data, setData] = useState(null)
  const [err,  setErr]  = useState('')
  const [load, setLoad] = useState(true)

  useEffect(() => {
    const u = config?.githubUsername?.trim()
    if (!u) { setErr('No username configured'); setLoad(false); return }
    ;(async () => {
      try {
        const [user, repos] = await Promise.all([
          safeFetch(`https://api.github.com/users/${u}`),
          safeFetch(`https://api.github.com/users/${u}/repos?sort=updated&per_page=3`),
        ])
        setData({ user, repos })
      } catch { setErr('User not found or API limit reached') }
      setLoad(false)
    })()
  }, [config?.githubUsername])

  if (load) return <WidgetSkeleton color="#c9d1d9" label="GITHUB" />
  if (err)  return <WidgetError color="#c9d1d9" label="GITHUB" msg={err} />

  const { user, repos } = data
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <img src={user.avatar_url} alt="" style={{ width:44, height:44, borderRadius:'50%', border:'1px solid rgba(201,209,217,0.2)', flexShrink:0 }} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{user.name||user.login}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:1 }}>@{user.login}</div>
          {user.bio && <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.bio}</div>}
        </div>
        <WidgetBadge color="#c9d1d9">GITHUB</WidgetBadge>
      </div>
      <div style={{ display:'flex', gap:8 }}>
        {[{label:'Followers',val:fmt(user.followers)},{label:'Following',val:fmt(user.following)},{label:'Repos',val:fmt(user.public_repos)}].map(s => (
          <div key={s.label} style={{ flex:1, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:8, padding:'6px 8px', textAlign:'center' }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#fff' }}>{s.val}</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{s.label}</div>
          </div>
        ))}
      </div>
      {repos?.length > 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
          {repos.map(r => (
            <a key={r.id} href={r.html_url} target="_blank" rel="noopener noreferrer"
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 10px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:8, textDecoration:'none' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(201,209,217,0.2)'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.05)'}
            >
              <span style={{ fontSize:12, fontWeight:600, color:'#c9d1d9', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'70%' }}>{r.name}</span>
              <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:10, color:'rgba(255,255,255,0.3)', flexShrink:0 }}>
                {r.language && <span>{r.language}</span>}
                <span>★ {r.stargazers_count}</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── WEATHER ─────────────────────────────────────────────────────────────────
const WMO_CODES = {0:'Clear sky',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',45:'Foggy',48:'Rime fog',51:'Light drizzle',53:'Drizzle',55:'Dense drizzle',61:'Slight rain',63:'Moderate rain',65:'Heavy rain',71:'Slight snow',73:'Moderate snow',75:'Heavy snow',80:'Showers',81:'Moderate showers',82:'Violent showers',95:'Thunderstorm',96:'Thunderstorm w/ hail',99:'Heavy thunderstorm'}
const WMO_ICON = {0:'☀️',1:'🌤️',2:'⛅',3:'☁️',45:'🌫️',48:'🌫️',51:'🌦️',53:'🌦️',55:'🌧️',61:'🌧️',63:'🌧️',65:'🌧️',71:'❄️',73:'❄️',75:'❄️',80:'🌦️',81:'🌧️',82:'⛈️',95:'⛈️',96:'⛈️',99:'⛈️'}

function WeatherWidget({ config }) {
  const [data, setData] = useState(null)
  const [err,  setErr]  = useState('')
  const [load, setLoad] = useState(true)
  const isFahr = config?.units === 'Fahrenheit'

  useEffect(() => {
    const city = config?.city?.trim()
    if (!city) { setErr('No city configured'); setLoad(false); return }
    ;(async () => {
      try {
        const geo = await safeFetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`)
        if (!geo?.results?.length) throw new Error('City not found')
        const { latitude, longitude, name, country } = geo.results[0]
        const wx = await safeFetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weathercode&temperature_unit=${isFahr?'fahrenheit':'celsius'}&wind_speed_unit=kmh&timezone=auto`)
        setData({ ...wx.current, city:name, country })
      } catch (e) { setErr(e.message||'Could not load weather') }
      setLoad(false)
    })()
  }, [config?.city, config?.units])

  if (load) return <WidgetSkeleton color="#38bdf8" label="WEATHER" />
  if (err)  return <WidgetError color="#38bdf8" label="WEATHER" msg={err} />

  const code = data.weathercode
  const unit = isFahr ? '°F' : '°C'
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:52, height:52, borderRadius:12, background:'rgba(56,189,248,0.12)', border:'1px solid rgba(56,189,248,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>{WMO_ICON[code]||'🌡️'}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:22, fontWeight:800, color:'#fff', lineHeight:1 }}>{Math.round(data.temperature_2m)}{unit}</div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)', marginTop:2 }}>{data.city}, {data.country}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:1 }}>{WMO_CODES[code]||'Unknown'}</div>
        </div>
        <WidgetBadge color="#38bdf8">WEATHER</WidgetBadge>
      </div>
      <div style={{ display:'flex', gap:8 }}>
        {[{label:'Feels like',val:`${Math.round(data.apparent_temperature)}${unit}`},{label:'Humidity',val:`${data.relative_humidity_2m}%`},{label:'Wind',val:`${Math.round(data.wind_speed_10m)} km/h`}].map(s => (
          <div key={s.label} style={{ flex:1, background:'rgba(56,189,248,0.05)', border:'1px solid rgba(56,189,248,0.12)', borderRadius:8, padding:'6px 8px', textAlign:'center' }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#38bdf8' }}>{s.val}</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── LAST.FM ──────────────────────────────────────────────────────────────────
function LastfmWidget({ config }) {
  const [data,   setData]   = useState(null)
  const [tracks, setTracks] = useState([])
  const [err,    setErr]    = useState('')
  const [load,   setLoad]   = useState(true)

  useEffect(() => {
    const u   = config?.lastfmUsername?.trim()
    const key = LASTFM_API_KEY
    if (!u) { setErr('No username configured'); setLoad(false); return }
    if (!key) { setErr('Add NEXT_PUBLIC_LASTFM_API_KEY to .env'); setLoad(false); return }
    ;(async () => {
      try {
        const [info, recent] = await Promise.all([
          safeFetch(`https://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${u}&api_key=${key}&format=json`),
          safeFetch(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${u}&limit=3&api_key=${key}&format=json`),
        ])
        if (info.error) throw new Error(info.message)
        setData(info.user)
        setTracks(recent.recenttracks?.track||[])
      } catch (e) { setErr(e.message||'Could not load Last.fm') }
      setLoad(false)
    })()
  }, [config?.lastfmUsername])

  if (load) return <WidgetSkeleton color="#d51007" label="LAST.FM" />
  if (err)  return <WidgetError color="#d51007" label="LAST.FM" msg={err} />

  const nowPlaying = tracks[0]?.['@attr']?.nowplaying === 'true' ? tracks[0] : null
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:44, height:44, borderRadius:'50%', background:'rgba(213,16,7,0.15)', border:'1px solid rgba(213,16,7,0.3)', overflow:'hidden', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
          {data.image?.[2]?.['#text'] ? <img src={data.image[2]['#text']} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '🎵'}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{data.realname||data.name}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>{fmt(parseInt(data.playcount))} scrobbles</div>
        </div>
        <WidgetBadge color="#d51007">LAST.FM</WidgetBadge>
      </div>
      {nowPlaying && (
        <div style={{ background:'rgba(213,16,7,0.08)', border:'1px solid rgba(213,16,7,0.2)', borderRadius:10, padding:'8px 10px', display:'flex', alignItems:'center', gap:8 }}>
          {nowPlaying.image?.[1]?.['#text'] && <img src={nowPlaying.image[1]['#text']} alt="" style={{ width:36, height:36, borderRadius:6, flexShrink:0 }} />}
          <div style={{ minWidth:0, flex:1 }}>
            <div style={{ fontSize:11, color:'#d51007', fontWeight:700, marginBottom:1 }}>♪ Now Playing</div>
            <div style={{ fontSize:12, fontWeight:600, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{nowPlaying.name}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{nowPlaying.artist?.['#text']}</div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── ROBLOX ───────────────────────────────────────────────────────────────────
function RobloxWidget({ config }) {
  const [data, setData] = useState(null)
  const [err,  setErr]  = useState('')
  const [load, setLoad] = useState(true)

  useEffect(() => {
    const u = config?.robloxUsername?.trim()
    if (!u) { setErr('No username configured'); setLoad(false); return }
    ;(async () => {
      try {
        const users = await safeFetch('https://users.roblox.com/v1/usernames/users', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ usernames:[u], excludeBannedUsers:true }),
        })
        const user = users?.data?.[0]
        if (!user) throw new Error('User not found')
        const [profile, friends, followers] = await Promise.all([
          safeFetch(`https://users.roblox.com/v1/users/${user.id}`),
          safeFetch(`https://friends.roblox.com/v1/users/${user.id}/friends/count`),
          safeFetch(`https://friends.roblox.com/v1/users/${user.id}/followers/count`),
        ])
        let thumb = null
        try {
          const tb = await safeFetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${user.id}&size=150x150&format=Png`)
          thumb = tb?.data?.[0]?.imageUrl||null
        } catch {}
        setData({ ...profile, friendsCount:friends.count, followersCount:followers.count, thumb })
      } catch (e) { setErr(e.message||'Could not load Roblox data') }
      setLoad(false)
    })()
  }, [config?.robloxUsername])

  if (load) return <WidgetSkeleton color="#e00000" label="ROBLOX" />
  if (err)  return <WidgetError color="#e00000" label="ROBLOX" msg={err} />

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:48, height:48, borderRadius:12, background:'rgba(224,0,0,0.12)', border:'1px solid rgba(224,0,0,0.25)', overflow:'hidden', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          {data.thumb ? <img src={data.thumb} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <svg width="24" height="24" viewBox="0 0 24 24" fill="#e00000"><path d="M5.24 3L3 18.76 18.76 21 21 5.24 5.24 3zm9.12 10.9l-3.88-.6.6-3.88 3.88.6-.6 3.88z"/></svg>}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{data.displayName||data.name}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:1 }}>@{data.name}</div>
        </div>
        <WidgetBadge color="#e00000">ROBLOX</WidgetBadge>
      </div>
      <div style={{ display:'flex', gap:8 }}>
        {[{label:'Friends',val:fmt(data.friendsCount)},{label:'Followers',val:fmt(data.followersCount)}].map(s => (
          <div key={s.label} style={{ flex:1, background:'rgba(224,0,0,0.06)', border:'1px solid rgba(224,0,0,0.15)', borderRadius:8, padding:'7px 10px', textAlign:'center' }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#e00000' }}>{s.val}</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── VALORANT ─────────────────────────────────────────────────────────────────
const VAL_TIER_COLORS = {'Iron':'#a0a0a0','Bronze':'#8c5a28','Silver':'#b4b4b4','Gold':'#f0c040','Platinum':'#40c8b4','Diamond':'#a060f0','Ascendant':'#40c860','Immortal':'#e04060','Radiant':'#f0e060'}

function ValorantWidget({ config }) {
  const [data, setData] = useState(null)
  const [err,  setErr]  = useState('')
  const [load, setLoad] = useState(true)

  useEffect(() => {
    const riot = config?.riotId?.trim()
    const reg  = (config?.region||'NA').toLowerCase()
    if (!riot) { setErr('No Riot ID configured (e.g. Name#TAG)'); setLoad(false); return }
    const [name, tag] = riot.split('#')
    if (!name||!tag) { setErr('Format must be Name#TAG'); setLoad(false); return }
    ;(async () => {
      try {
        const headers = HENRIK_API_KEY ? { 'Authorization':HENRIK_API_KEY } : {}
        const mmr = await safeFetch(`https://api.henrikdev.xyz/valorant/v3/mmr/${reg}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`, { headers })
        if (mmr.status===404) throw new Error('Player not found')
        if (mmr.errors?.length) throw new Error(mmr.errors[0].message)
        setData(mmr.data)
      } catch (e) { setErr(e.message?.includes('429')?'Rate limited — try again':(e.message||'Could not load VALORANT')) }
      setLoad(false)
    })()
  }, [config?.riotId, config?.region])

  if (load) return <WidgetSkeleton color="#FF4655" label="VALORANT" />
  if (err)  return <WidgetError color="#FF4655" label="VALORANT" msg={err} />

  const current   = data?.current
  const tier      = current?.tier?.name||'Unrated'
  const rr        = current?.rr??0
  const peak      = data?.peak
  const tierColor = Object.entries(VAL_TIER_COLORS).find(([k])=>tier.startsWith(k))?.[1]||'#FF4655'

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:52, height:52, borderRadius:12, background:`${tierColor}22`, border:`1px solid ${tierColor}44`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden' }}>
          {current?.tier?.large_icon ? <img src={current.tier.large_icon} alt={tier} style={{ width:40, height:40, objectFit:'contain' }} /> : <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l2 10 8 5 8-5 2-10L12 2z" stroke="#FF4655" strokeWidth="1.5"/><path d="M8 9l4 7 4-7" stroke="#FF4655" strokeWidth="1.5" strokeLinecap="round"/></svg>}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{config.riotId}</div>
          <div style={{ fontSize:16, fontWeight:800, color:tierColor, marginTop:1 }}>{tier}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:1 }}>{rr} RR · {config?.region?.toUpperCase()}</div>
        </div>
        <WidgetBadge color="#FF4655">VALORANT</WidgetBadge>
      </div>
      {peak && (
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', background:'rgba(255,70,85,0.06)', border:'1px solid rgba(255,70,85,0.15)', borderRadius:9 }}>
          {peak.tier?.large_icon && <img src={peak.tier.large_icon} alt="" style={{ width:22, height:22, objectFit:'contain', flexShrink:0 }} />}
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)' }}>Peak: <span style={{ fontWeight:700, color:Object.entries(VAL_TIER_COLORS).find(([k])=>peak.tier?.name?.startsWith(k))?.[1]||'#FF4655' }}>{peak.tier?.name}</span>{peak.season && <span style={{ marginLeft:6, color:'rgba(255,255,255,0.3)' }}>({peak.season})</span>}</div>
        </div>
      )}
    </div>
  )
}

// ─── CHESS.COM ────────────────────────────────────────────────────────────────
function ChessWidget({ config }) {
  const [data, setData] = useState(null)
  const [err,  setErr]  = useState('')
  const [load, setLoad] = useState(true)

  useEffect(() => {
    const u = config?.chessUsername?.trim()
    if (!u) { setErr('No username configured'); setLoad(false); return }
    ;(async () => {
      try {
        const [profile, stats] = await Promise.all([
          safeFetch(`https://api.chess.com/pub/player/${u}`),
          safeFetch(`https://api.chess.com/pub/player/${u}/stats`),
        ])
        if (profile.code===0) throw new Error('Player not found')
        setData({ profile, stats })
      } catch (e) { setErr(e.message||'Could not load Chess.com') }
      setLoad(false)
    })()
  }, [config?.chessUsername])

  if (load) return <WidgetSkeleton color="#81b64c" label="CHESS" />
  if (err)  return <WidgetError color="#81b64c" label="CHESS" msg={err} />

  const { profile, stats } = data
  const modes = [{key:'chess_bullet',e:'⚡',l:'Bullet'},{key:'chess_blitz',e:'🔥',l:'Blitz'},{key:'chess_rapid',e:'⏱',l:'Rapid'},{key:'chess_daily',e:'📅',l:'Daily'}].filter(m=>stats[m.key])

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:44, height:44, borderRadius:'50%', overflow:'hidden', border:'1px solid rgba(129,182,76,0.3)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(129,182,76,0.1)', fontSize:18 }}>
          {profile.avatar ? <img src={profile.avatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '♟'}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{profile.name||profile.username}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>@{profile.username}</div>
        </div>
        <WidgetBadge color="#81b64c">CHESS</WidgetBadge>
      </div>
      {modes.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:6 }}>
          {modes.slice(0,4).map(({key,e,l}) => {
            const m    = stats[key]
            const last = m.last?.rating||m.best?.rating||'—'
            const best = m.best?.rating
            return (
              <div key={key} style={{ background:'rgba(129,182,76,0.06)', border:'1px solid rgba(129,182,76,0.14)', borderRadius:8, padding:'7px 10px' }}>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', marginBottom:3 }}>{e} {l}</div>
                <div style={{ fontSize:16, fontWeight:800, color:'#81b64c' }}>{last}</div>
                {best && best!==last && <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', marginTop:1 }}>Best: {best}</div>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── TIKTOK ───────────────────────────────────────────────────────────────────
function TikTokWidget({ config }) {
  const [data, setData] = useState(null)
  const [err,  setErr]  = useState('')
  const [load, setLoad] = useState(true)

  useEffect(() => {
    const u = config?.tiktokUsername?.trim().replace(/^@/,'')
    if (!u) { setErr('No username configured'); setLoad(false); return }
    ;(async () => {
      try {
        const raw = await safeFetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.tiktok.com/@${u}`)}`)
        const html = raw.contents||''
        const statsMatch = html.match(/"followerCount":(\d+),"followingCount":(\d+).*?"heartCount":(\d+).*?"videoCount":(\d+)/)
        const nickMatch  = html.match(/"nickname":"([^"]+)"/)
        if (!statsMatch) throw new Error('Could not parse TikTok stats')
        setData({
          username: u,
          nickname: nickMatch?.[1]?.replace(/\\u[\dA-F]{4}/gi, m=>String.fromCharCode(parseInt(m.replace(/\\u/,''),16)))||u,
          followers: parseInt(statsMatch[1]),
          following: parseInt(statsMatch[2]),
          likes:     parseInt(statsMatch[3]),
          videos:    parseInt(statsMatch[4]),
        })
      } catch (e) { setErr(e.message?.includes('parse')?'TikTok blocked the request':(e.message||'Could not load TikTok')) }
      setLoad(false)
    })()
  }, [config?.tiktokUsername])

  if (load) return <WidgetSkeleton color="#ff0050" label="TIKTOK" />
  if (err)  return <WidgetError color="#ff0050" label="TIKTOK" msg={err} />

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:44, height:44, borderRadius:'50%', background:'rgba(255,0,80,0.15)', border:'1px solid rgba(255,0,80,0.3)', overflow:'hidden', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🎵</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{data.nickname}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>@{data.username}</div>
        </div>
        <WidgetBadge color="#ff0050">TIKTOK</WidgetBadge>
      </div>
      <div style={{ display:'flex', gap:8 }}>
        {[{label:'Followers',val:fmtBig(data.followers)},{label:'Following',val:fmtBig(data.following)},{label:'Likes',val:fmtBig(data.likes)},{label:'Videos',val:fmt(data.videos)}].map(s => (
          <div key={s.label} style={{ flex:1, background:'rgba(255,0,80,0.06)', border:'1px solid rgba(255,0,80,0.14)', borderRadius:8, padding:'6px 4px', textAlign:'center' }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#ff0050' }}>{s.val}</div>
            <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── DISCORD SERVER ───────────────────────────────────────────────────────────
function DiscordServerWidget({ config }) {
  const [data, setData] = useState(null)
  const [err,  setErr]  = useState('')
  const [load, setLoad] = useState(true)

  useEffect(() => {
    const id = config?.serverId?.trim()
    if (!id) { setErr('No Server ID configured'); setLoad(false); return }
    ;(async () => {
      try {
        const d = await safeFetch(`https://discord.com/api/guilds/${id}/widget.json`)
        if (d.code===50004||d.message) throw new Error('Enable Widget in Server Settings → Widget')
        setData(d)
      } catch (e) { setErr(e.message||'Could not load server data') }
      setLoad(false)
    })()
  }, [config?.serverId])

  if (load) return <WidgetSkeleton color="#5865F2" label="SERVER" />
  if (err)  return <WidgetError color="#5865F2" label="SERVER" msg={err} />

  const invite = config?.inviteLink||data.instant_invite

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:48, height:48, borderRadius:14, background:'rgba(88,101,242,0.15)', border:'1px solid rgba(88,101,242,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:20 }}>🏰</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{data.name}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:1 }}><span style={{ color:'#23d18b' }}>● </span>{fmt(data.presence_count)} online</div>
        </div>
        <WidgetBadge color="#5865F2">DISCORD</WidgetBadge>
      </div>
      {data.members?.length > 0 && (
        <div style={{ display:'flex', gap:4, alignItems:'center' }}>
          {data.members.slice(0,8).map((m,i) => (
            <div key={i} title={m.username} style={{ position:'relative', width:28, height:28, flexShrink:0 }}>
              <div style={{ width:28, height:28, borderRadius:'50%', overflow:'hidden', background:'rgba(88,101,242,0.2)', border:'1px solid rgba(88,101,242,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#5865F2' }}>
                {m.avatar_url ? <img src={m.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : m.username?.[0]?.toUpperCase()}
              </div>
              <div style={{ position:'absolute', bottom:0, right:0 }}><StatusDot status={m.status} size={8} border="#0a0202" /></div>
            </div>
          ))}
          {data.members.length > 8 && <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginLeft:2 }}>+{data.members.length-8}</div>}
        </div>
      )}
      {invite && (
        <a href={invite} target="_blank" rel="noopener noreferrer"
          style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'8px 12px', background:'#5865F2', borderRadius:10, color:'#fff', fontSize:12, fontWeight:700, textDecoration:'none' }}
          onMouseEnter={e=>e.currentTarget.style.opacity='0.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}
        >Join Server ↗</a>
      )}
    </div>
  )
}

// ─── WIDGET REGISTRY ──────────────────────────────────────────────────────────
const WIDGET_DEFS = [
  { id:'discord',       name:'Discord Presence', desc:'Live status from your server', color:'#5865F2', note:'User must join discord.gg/faterip', icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.055a19.9 19.9 0 0 0 5.993 3.03.077.077 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>, fields:[{key:'discordId',label:'Discord User ID',placeholder:'123456789012345678'}], Component: DiscordWidget },
  { id:'github',        name:'GitHub',            desc:'Followers, repos and activity',  color:'#c9d1d9', icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>, fields:[{key:'githubUsername',label:'GitHub Username',placeholder:'username'}], Component: GitHubWidget },
  { id:'weather',       name:'Weather',           desc:'Current conditions, no API key', color:'#38bdf8', icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>, fields:[{key:'city',label:'City',placeholder:'New York'},{key:'units',label:'Units',type:'select',options:['Celsius','Fahrenheit']}], Component: WeatherWidget },
  { id:'lastfm',        name:'Last.fm',           desc:'Now playing + scrobble count',   color:'#d51007', note:'Add NEXT_PUBLIC_LASTFM_API_KEY to .env', icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M10.84 17.42l-.9-2.45s-1.46 1.63-3.65 1.63c-1.94 0-3.32-1.69-3.32-4.38 0-3.45 1.74-4.69 3.44-4.69 2.45 0 3.22 1.59 3.87 3.65l.9 2.81c.9 2.73 2.58 4.93 7.44 4.93 3.48 0 5.83-1.07 5.83-3.87 0-2.26-1.29-3.44-3.71-4l-1.79-.39c-1.24-.28-1.6-.77-1.6-1.6 0-.94.74-1.49 1.96-1.49 1.32 0 2.03.49 2.14 1.68l2.74-.33C23.87 7.07 22.57 6 20.01 6c-2.38 0-4.89.9-4.89 4.05 0 1.93.93 3.15 3.27 3.72l1.9.46c1.39.34 1.9.93 1.9 1.77 0 1.06-.98 1.49-2.96 1.49-2.87 0-4.07-1.5-4.77-3.57l-.93-2.83C13.67 7.93 12.11 6 8.47 6 4.58 6 2 8.55 2 12.27c0 3.57 1.87 6.42 5.39 6.42 2.79 0 3.45-1.27 3.45-1.27z"/></svg>, fields:[{key:'lastfmUsername',label:'Last.fm Username',placeholder:'username'}], Component: LastfmWidget },
  { id:'roblox',        name:'Roblox',            desc:'Avatar, friends and followers',   color:'#e00000', icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M5.24 3L3 18.76 18.76 21 21 5.24 5.24 3zm9.12 10.9l-3.88-.6.6-3.88 3.88.6-.6 3.88z"/></svg>, fields:[{key:'robloxUsername',label:'Roblox Username',placeholder:'username'}], Component: RobloxWidget },
  { id:'valorant',      name:'VALORANT',          desc:'Rank, RR and peak rank',          color:'#FF4655', note:"Powered by Henrik's API", icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l2 10 8 5 8-5 2-10L12 2z" stroke="currentColor" strokeWidth="1.5"/><path d="M8 9l4 7 4-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>, fields:[{key:'riotId',label:'Riot ID',placeholder:'Name#TAG'},{key:'region',label:'Region',type:'select',options:['NA','EU','AP','KR','BR','LATAM']}], Component: ValorantWidget },
  { id:'chess',         name:'Chess.com',         desc:'Ratings across all time controls',color:'#81b64c', icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M9 2v2H7v2h2v1H6v2h1l1 2H7l-1 3h1v1H5v2h14v-2h-2v-1h1l-1-3h-1l1-2h1V9h-3V8h2V6h-2V2h-2v1h-2V2H9zm3 3a1 1 0 0 1 0 2 1 1 0 0 1 0-2z"/></svg>, fields:[{key:'chessUsername',label:'Chess.com Username',placeholder:'username'}], Component: ChessWidget },
  { id:'tiktok',        name:'TikTok',            desc:'Followers, likes and videos',     color:'#ff0050', note:'Uses unofficial scraper — may be unreliable', icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg>, fields:[{key:'tiktokUsername',label:'TikTok Username',placeholder:'@username'}], Component: TikTokWidget },
  { id:'discordserver', name:'Discord Server',    desc:'Online members + join button',    color:'#5865F2', note:'Enable Widget in Server Settings → Widget', icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, fields:[{key:'serverId',label:'Server ID',placeholder:'123456789012345678'},{key:'inviteLink',label:'Invite Link',placeholder:'https://discord.gg/...'}], Component: DiscordServerWidget },
]

// ─── POSITION OPTIONS ─────────────────────────────────────────────────────────
const POSITION_OPTIONS = [
  { value:'above_name',  label:'Above Name' },
  { value:'below_name',  label:'Below Name' },
  { value:'below_bio',   label:'Below Bio' },
  { value:'above_links', label:'Above Links' },
  { value:'below_links', label:'Below Links (default)' },
]

// ─── CONFIGURE MODAL ──────────────────────────────────────────────────────────
function ConfigureModal({ def, existing, onSave, onClose, supabase }) {
  const [cfg, setCfg] = useState(existing?.config || {})
  if (!def) return null
  const { Component } = def

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.82)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 16px' }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'#0d0505', border:'1px solid rgba(255,255,255,0.1)', borderRadius:18, padding:28, width:480, maxWidth:'95vw', position:'relative', maxHeight:'90vh', overflowY:'auto' }}>
        <button onClick={onClose} style={{ position:'absolute', top:14, right:14, background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', padding:4 }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>

        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
          <div style={{ width:40, height:40, borderRadius:12, background:`${def.color}22`, border:`1px solid ${def.color}44`, display:'flex', alignItems:'center', justifyContent:'center', color:def.color, flexShrink:0 }}>{def.icon}</div>
          <div>
            <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:16, fontWeight:700, margin:0 }}>Configure <span style={{ color:'#e03030' }}>{def.name}</span></h2>
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.4)', margin:0, marginTop:2 }}>{def.desc}</p>
          </div>
        </div>

        {def.note && (
          <div style={{ display:'flex', alignItems:'flex-start', gap:8, fontSize:11, color:'rgba(245,158,11,0.8)', background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.18)', borderRadius:9, padding:'8px 12px', marginBottom:16 }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink:0, marginTop:1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {def.note}
          </div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:20 }}>
          {def.fields.map(field => (
            <div key={field.key}>
              <label style={{ fontSize:11, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', display:'block', marginBottom:6 }}>{field.label}</label>
              {field.type === 'select' ? (
                <select value={cfg[field.key]||field.options[0]} onChange={e=>setCfg(p=>({...p,[field.key]:e.target.value}))}
                  style={{ width:'100%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:'11px 14px', fontSize:13, color:'#fff', fontFamily:'Inter, sans-serif', outline:'none', height:44, appearance:'none' }}>
                  {field.options.map(o=><option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input value={cfg[field.key]||''} onChange={e=>setCfg(p=>({...p,[field.key]:e.target.value}))} placeholder={field.placeholder}
                  style={{ width:'100%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:'11px 14px', fontSize:13, color:'#fff', fontFamily:'Inter, sans-serif', outline:'none', height:44, boxSizing:'border-box' }} />
              )}
            </div>
          ))}
        </div>

        <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:'14px 16px', marginBottom:20 }}>
          <div style={{ fontSize:10, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.25)', marginBottom:10 }}>Live Preview</div>
          <Component config={cfg} supabase={supabase} />
        </div>

        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:10, fontSize:13, fontWeight:500, cursor:'pointer', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.03)', color:'rgba(255,255,255,0.5)', fontFamily:'inherit' }}>Cancel</button>
          <button onClick={()=>{ onSave(def,cfg); onClose() }} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:10, fontSize:13, fontWeight:500, cursor:'pointer', border:'none', background:'#e03030', color:'#fff', fontFamily:'inherit' }}>
            {existing ? '✓ Update Widget' : '+ Add Widget'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── ACTIVE WIDGET CARD ───────────────────────────────────────────────────────
function ActiveWidgetCard({ widget, onRemove, onConfigure, supabase }) {
  const def = WIDGET_DEFS.find(d=>d.id===widget.id)
  if (!def) return null
  const { Component } = def

  return (
    <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, padding:16, display:'flex', flexDirection:'column', gap:14, transition:'border-color .15s' }}
      onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'}
      onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'}
    >
      <Component config={widget.config||{}} supabase={supabase} />
      <div style={{ display:'flex', gap:8, borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:10 }}>
        <button onClick={()=>onConfigure(def,widget)}
          style={{ flex:1, padding:'7px', borderRadius:8, border:'1px solid rgba(255,255,255,0.07)', background:'rgba(255,255,255,0.03)', color:'rgba(255,255,255,0.5)', fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}
          onMouseEnter={e=>{e.currentTarget.style.color='#fff';e.currentTarget.style.background='rgba(255,255,255,0.06)'}}
          onMouseLeave={e=>{e.currentTarget.style.color='rgba(255,255,255,0.5)';e.currentTarget.style.background='rgba(255,255,255,0.03)'}}
        >⚙ Configure</button>
        <button onClick={()=>onRemove(widget.id)}
          style={{ width:32, borderRadius:8, border:'1px solid rgba(255,255,255,0.07)', background:'rgba(255,255,255,0.03)', color:'rgba(255,100,100,0.5)', fontSize:11, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s', flexShrink:0 }}
          onMouseEnter={e=>{e.currentTarget.style.color='#ff6464';e.currentTarget.style.background='rgba(255,50,50,0.08)'}}
          onMouseLeave={e=>{e.currentTarget.style.color='rgba(255,100,100,0.5)';e.currentTarget.style.background='rgba(255,255,255,0.03)'}}
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>
      </div>
    </div>
  )
}

function AvailableTile({ def, isActive, isDisabled, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button onClick={onClick} disabled={isDisabled&&!isActive}
      onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', gap:10, padding:'16px 14px', borderRadius:14, border:`1px solid ${isActive?`${def.color}44`:hovered?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.06)'}`, background:isActive?`${def.color}10`:hovered?'rgba(255,255,255,0.03)':'rgba(255,255,255,0.015)', cursor:(isDisabled&&!isActive)?'not-allowed':'pointer', opacity:(isDisabled&&!isActive)?0.4:1, textAlign:'left', fontFamily:'inherit', transition:'all .15s', width:'100%' }}
    >
      <div style={{ width:40, height:40, borderRadius:11, background:`${def.color}20`, border:`1px solid ${def.color}40`, display:'flex', alignItems:'center', justifyContent:'center', color:def.color, flexShrink:0 }}>{def.icon}</div>
      <div>
        <div style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:2 }}>{def.name}</div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', lineHeight:1.4 }}>{def.desc}</div>
      </div>
      {isActive && <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, fontWeight:700, color:def.color }}><svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>Added</div>}
    </button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN WIDGETS PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function WidgetsPage({ username, supabase, showToast }) {
  const [activeWidgets,     setActiveWidgets]     = useState([])
  const [widgetPosition,    setWidgetPosition]    = useState('below_links')
  const [widgetOpacity,     setWidgetOpacity]     = useState(85)
  const [configuringDef,    setConfiguringDef]    = useState(null)
  const [configuringWidget, setConfiguringWidget] = useState(null)
  const [saving,            setSaving]            = useState(false)
  const [loadingInit,       setLoadingInit]       = useState(true)

  useEffect(() => {
    if (!username || !supabase) { setLoadingInit(false); return }
    supabase.from('users').select('widgets, widget_position, widget_opacity').eq('username', username).single()
      .then(({ data }) => {
        if (data?.widgets?.length)   setActiveWidgets(data.widgets)
        if (data?.widget_position)   setWidgetPosition(data.widget_position)
        if (data?.widget_opacity != null) setWidgetOpacity(data.widget_opacity)
        setLoadingInit(false)
      })
      .catch(() => setLoadingInit(false))
  }, [username, supabase])

  const handleOpenConfigure = (def, existingWidget=null) => {
    setConfiguringDef(def)
    setConfiguringWidget(existingWidget)
  }

  const handleSave = (def, cfg) => {
    if (configuringWidget) {
      setActiveWidgets(prev => prev.map(w => w.id===def.id ? {...w, config:cfg} : w))
    } else {
      setActiveWidgets(prev => [...prev, { id:def.id, config:cfg }])
    }
    showToast?.('Widget updated — save to apply!')
  }

  const handleRemove = (id) => {
    setActiveWidgets(prev => prev.filter(w => w.id!==id))
    showToast?.('Widget removed')
  }

  const saveWidgets = async () => {
    setSaving(true)
    try {
      const { error } = await supabase.from('users').update({
        widgets:        activeWidgets,
        widget_position: widgetPosition,
        widget_opacity:  widgetOpacity,
      }).eq('username', username)
      if (error) throw error
      showToast?.('Widgets saved!')
    } catch {
      showToast?.('Failed to save widgets')
    }
    setSaving(false)
  }

  const isAtMax = activeWidgets.length >= MAX_WIDGETS

  const BtnAccent = ({ children, onClick, disabled, style }) => (
    <button onClick={onClick} disabled={disabled}
      style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:10, fontSize:13, fontWeight:500, cursor:disabled?'not-allowed':'pointer', border:'none', background:disabled?'rgba(224,48,48,0.4)':'#e03030', color:'#fff', fontFamily:'inherit', opacity:disabled?0.6:1, ...style }}>
      {children}
    </button>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
      <style>{`@keyframes skeletonPulse{0%,100%{opacity:0.5}50%{opacity:1}} .widget-tile-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;} .widget-active-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;} @media(max-width:900px){.widget-tile-grid{grid-template-columns:repeat(2,1fr)!important;}.widget-active-grid{grid-template-columns:1fr!important;}} @media(max-width:600px){.widget-tile-grid{grid-template-columns:1fr!important;}}`}</style>

      {/* Header */}
      <div>
        <div style={{ fontSize:11, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', marginBottom:8 }}>Dashboard · Widgets</div>
        <h1 style={{ fontSize:22, fontWeight:700, margin:'0 0 4px', fontFamily:'Syne, sans-serif' }}>Profile <span style={{ color:'#e03030' }}>Widgets</span></h1>
        <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)' }}>Add live data widgets powered by real APIs</p>
      </div>

      {/* ── WIDGET SETTINGS ── */}
      <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16, overflow:'hidden' }}>
        <div style={{ padding:'18px 22px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:38, height:38, borderRadius:12, background:'rgba(224,48,48,0.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="20" height="20" fill="none" stroke="#e03030" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </div>
          <div>
            <div style={{ fontSize:15, fontWeight:600, color:'#fff' }}>Widget Settings</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginTop:2 }}>Position and appearance on your profile</div>
          </div>
        </div>
        <div style={{ padding:'20px 22px', display:'flex', flexDirection:'column', gap:20 }}>

          {/* Position */}
          <div>
            <label style={{ fontSize:11, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', display:'block', marginBottom:10 }}>Widget Position</label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
              {POSITION_OPTIONS.map(opt => (
                <button key={opt.value} onClick={()=>setWidgetPosition(opt.value)}
                  style={{ padding:'10px 8px', borderRadius:10, border:`1px solid ${widgetPosition===opt.value?'rgba(224,48,48,0.4)':'rgba(255,255,255,0.07)'}`, background:widgetPosition===opt.value?'rgba(224,48,48,0.1)':'rgba(255,255,255,0.02)', color:widgetPosition===opt.value?'#e03030':'rgba(255,255,255,0.45)', fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all .15s', textAlign:'center' }}>
                  {opt.label}
                </button>
              ))}
            </div>
            <div style={{ marginTop:10, padding:'10px 14px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:10, fontSize:11, color:'rgba(255,255,255,0.35)', lineHeight:1.5 }}>
              <span style={{ color:'rgba(255,255,255,0.5)', fontWeight:600 }}>Selected: </span>
              {POSITION_OPTIONS.find(o=>o.value===widgetPosition)?.label}
              {' — '}
              {{ above_name:'Widgets appear at the very top of your panel, above your name and avatar.', below_name:'Widgets appear directly below your name and username.', below_bio:'Widgets appear after your bio and location.', above_links:'Widgets appear above your social links.', 'below_links':'Widgets appear at the bottom of your panel, after links and buttons.' }[widgetPosition]}
            </div>
          </div>

          {/* Opacity */}
          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
              <label style={{ fontSize:11, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)' }}>Widget Opacity</label>
              <span style={{ fontSize:13, fontWeight:700, color:'#fff', background:'rgba(224,48,48,0.15)', border:'1px solid rgba(224,48,48,0.3)', borderRadius:8, padding:'2px 10px' }}>{widgetOpacity}%</span>
            </div>
            <input type="range" min={20} max={100} value={widgetOpacity} onChange={e=>setWidgetOpacity(Number(e.target.value))} style={{ width:'100%', accentColor:'#e03030', height:6, cursor:'pointer' }} />
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'rgba(255,255,255,0.25)', marginTop:4 }}>
              <span>Subtle (20%)</span><span>Solid (100%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── YOUR WIDGETS ── */}
      <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16, overflow:'hidden' }}>
        <div style={{ padding:'18px 22px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:12, background:'rgba(224,48,48,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="20" height="20" fill="none" stroke="#e03030" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            </div>
            <div>
              <div style={{ fontSize:15, fontWeight:600, color:'#fff' }}>Your Widgets</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginTop:2 }}>{activeWidgets.length}/{MAX_WIDGETS} slots used</div>
            </div>
          </div>
          <BtnAccent onClick={saveWidgets} disabled={saving}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            {saving ? 'Saving…' : 'Save Widgets'}
          </BtnAccent>
        </div>

        <div style={{ padding:'20px 22px' }}>
          {loadingInit ? (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              {[0,1].map(i=><div key={i} style={{ height:100, borderRadius:12, background:'rgba(255,255,255,0.03)', animation:'skeletonPulse 1.4s ease-in-out infinite' }} />)}
            </div>
          ) : activeWidgets.length === 0 ? (
            <div style={{ padding:'36px 0', textAlign:'center', border:'1px dashed rgba(255,255,255,0.07)', borderRadius:12 }}>
              <div style={{ fontSize:28, marginBottom:10 }}>📦</div>
              <div style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.35)' }}>No widgets yet</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.2)', marginTop:4 }}>Pick one below to show live data on your profile</div>
            </div>
          ) : (
            <div className="widget-active-grid">
              {activeWidgets.map(w => (
                <ActiveWidgetCard key={w.id} widget={w} onRemove={handleRemove} onConfigure={handleOpenConfigure} supabase={supabase} />
              ))}
            </div>
          )}

          {isAtMax && (
            <div style={{ marginTop:14, display:'flex', alignItems:'center', gap:8, fontSize:12, color:'rgba(245,158,11,0.8)', background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.18)', borderRadius:10, padding:'10px 14px' }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Maximum {MAX_WIDGETS} widgets reached. Remove one to add another.
            </div>
          )}
        </div>
      </div>

      {/* ── ADD WIDGET ── */}
      <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16, overflow:'hidden' }}>
        <div style={{ padding:'18px 22px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:38, height:38, borderRadius:12, background:'rgba(224,48,48,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="20" height="20" fill="none" stroke="#e03030" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          </div>
          <div>
            <div style={{ fontSize:15, fontWeight:600, color:'#fff' }}>Add Widget</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginTop:2 }}>Click to configure and add</div>
          </div>
        </div>
        <div style={{ padding:'20px 22px' }}>
          <div className="widget-tile-grid">
            {WIDGET_DEFS.map(def => {
              const isActive = activeWidgets.some(w=>w.id===def.id)
              return (
                <AvailableTile key={def.id} def={def} isActive={isActive} isDisabled={isAtMax&&!isActive}
                  onClick={()=>handleOpenConfigure(def, isActive?activeWidgets.find(w=>w.id===def.id):null)} />
              )
            })}
          </div>
        </div>
      </div>

      {configuringDef && (
        <ConfigureModal def={configuringDef} existing={configuringWidget} onSave={handleSave} onClose={()=>{ setConfiguringDef(null); setConfiguringWidget(null) }} supabase={supabase} />
      )}
    </div>
  )
}