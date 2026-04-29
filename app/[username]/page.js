'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { trackView } from '../../lib/trackView'

// ─── Typewriter hook ───────────────────────────────────────────────────────────
function useTypewriter(text, enabled) {
  const [displayed, setDisplayed] = useState(enabled ? '' : text)
  useEffect(() => {
    if (!enabled || !text) { setDisplayed(text || ''); return }
    setDisplayed('')
    let i = 0, deleting = false, timeout
    const tick = () => {
      if (!deleting) {
        i++; setDisplayed(text.slice(0, i))
        if (i >= text.length) timeout = setTimeout(() => { deleting = true; tick() }, 2000)
        else timeout = setTimeout(tick, 55)
      } else {
        i--; setDisplayed(text.slice(0, i))
        if (i <= 0) { deleting = false; timeout = setTimeout(tick, 800) }
        else timeout = setTimeout(tick, 30)
      }
    }
    timeout = setTimeout(tick, 800)
    return () => clearTimeout(timeout)
  }, [text, enabled])
  return displayed
}

// ─── Google Fonts ──────────────────────────────────────────────────────────────
const FONT_MAP = {
  'Inter': 'Inter:wght@400;600;700;800;900',
  'Syne': 'Syne:wght@400;600;700;800',
  'Space Mono': 'Space+Mono:wght@400;700',
  'Roboto': 'Roboto:wght@400;500;700;900',
  'Poppins': 'Poppins:wght@400;500;600;700;800',
  'Montserrat': 'Montserrat:wght@400;600;700;800;900',
  'Sora': 'Sora:wght@400;600;700;800',
  'DM Sans': 'DM+Sans:wght@400;600;700;800',
  'Manrope': 'Manrope:wght@400;600;700;800',
  'JetBrains Mono': 'JetBrains+Mono:wght@400;600;700',
  'Bebas Neue': 'Bebas+Neue',
  'Playfair Display': 'Playfair+Display:wght@400;600;700;800',
  'Nunito': 'Nunito:wght@400;600;700;800;900',
}

const SIMPLE_ICONS = {
  discord:'discord', twitter:'x', github:'github', gitlab:'gitlab',
  instagram:'instagram', facebook:'facebook', spotify:'spotify', soundcloud:'soundcloud',
  applemusic:'applemusic', youtube:'youtube', twitch:'twitch', tiktok:'tiktok',
  snapchat:'snapchat', linkedin:'linkedin', reddit:'reddit', telegram:'telegram',
  bluesky:'bluesky', vk:'vk', pinterest:'pinterest', dribbble:'dribbble',
  deviantart:'deviantart', steam:'steam', itchio:'itchio', kickstarter:'kickstarter',
  patreon:'patreon', kofi:'kofi', buymeacoffee:'buymeacoffee', paypal:'paypal',
  bitcoin:'bitcoin', ethereum:'ethereum', solana:'solana', roblox:'roblox',
}

// ─── Badge definitions ─────────────────────────────────────────────────────────
const BADGE_DEFS = [
  { id:'owner',     name:'Owner',         color:'#e03030', bg:'rgba(224,48,48,0.15)',    border:'rgba(224,48,48,0.35)',    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M2 20h20v-2H2v2zm0-4h20L19 7l-5 4-4-6-4 6-5-4 2 9z"/></svg> },
  { id:'staff',     name:'Staff',         color:'#378ADD', bg:'rgba(55,138,221,0.12)',   border:'rgba(55,138,221,0.3)',    icon:<img src="/Discord_Staff.png" width="18" height="18" style={{objectFit:'contain'}} /> },
  { id:'verified',  name:'Verified',      color:'#1D9E75', bg:'rgba(29,158,117,0.12)',  border:'rgba(29,158,117,0.3)',    icon:<img src="/blurple_verified.png" width="18" height="18" style={{objectFit:'contain'}} /> },
  { id:'og',        name:'OG',            color:'#EF9F27', bg:'rgba(239,159,39,0.12)',  border:'rgba(239,159,39,0.3)',    icon:<img src="/Star_blue.png" width="18" height="18" style={{objectFit:'contain'}} /> },
  { id:'booster',   name:'Server Booster',color:'#f97316', bg:'rgba(249,115,22,0.12)',  border:'rgba(249,115,22,0.3)',    icon:<img src="/d_boost.png" width="18" height="18" style={{objectFit:'contain'}} /> },
  { id:'donator',   name:'Donator',       color:'#5DCAA5', bg:'rgba(93,202,165,0.12)',  border:'rgba(93,202,165,0.3)',    icon:<img src="/Money.png" width="18" height="18" style={{objectFit:'contain'}} /> },
  { id:'premium',   name:'Premium',       color:'#8b5cf6', bg:'rgba(139,92,246,0.12)',  border:'rgba(139,92,246,0.3)',    icon:<img src="/Premium_Diamond.png" width="18" height="18" style={{objectFit:'contain'}} /> },
  { id:'bug_hunter',name:'Bug Hunter',    color:'#84cc16', bg:'rgba(132,204,22,0.12)',  border:'rgba(132,204,22,0.3)',    icon:<img src="/bug_hunter.png" width="18" height="18" style={{objectFit:'contain'}} /> },
  { id:'gifter',    name:'Gifter',        color:'#fb7185', bg:'rgba(251,113,133,0.12)', border:'rgba(251,113,133,0.3)',   icon:<img src="/Presente.png" width="18" height="18" style={{objectFit:'contain'}} /> },
  { id:'friend',    name:'Friend',        color:'#e8e8e8', bg:'rgba(255,255,255,0.07)', border:'rgba(255,255,255,0.18)', icon:<img src="/black_bat.png" width="18" height="18" style={{objectFit:'contain'}} /> },
  { id:'cool_user', name:'Cool User',     color:'#b0b0b0', bg:'rgba(200,200,200,0.07)', border:'rgba(200,200,200,0.18)', icon:<img src="/Aura.png"      width="18" height="18" style={{objectFit:'contain'}} /> },
  { id:'known',     name:'Known',         color:'#3b9fef', bg:'rgba(59,159,239,0.12)',  border:'rgba(59,159,239,0.3)',   icon:<img src="/known.png"     width="18" height="18" style={{objectFit:'contain'}} /> },
]

// ─── Badge Strip ───────────────────────────────────────────────────────────────
function BadgeStrip({ badges, align }) {
  if (!badges || badges.length === 0) return null
  const justify = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center'
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:6, justifyContent:justify, marginBottom:10 }}>
      {badges.map(b => {
        const def = BADGE_DEFS.find(d => d.id === b.badge)
        if (!def) return null
        return (
          <div key={b.badge} title={def.name} style={{ position:'relative', display:'inline-flex' }} className="badge-pill">
            <div style={{ display:'flex', alignItems:'center', padding:'4px 8px', borderRadius:99, background:def.bg, border:`1px solid ${def.border}`, color:def.color, cursor:'default' }}>
              {def.icon}
            </div>
            <div className="badge-tooltip">{def.name}</div>
          </div>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIVE WIDGET COMPONENTS (rendered on profile page)
// ═══════════════════════════════════════════════════════════════════════════════

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

function fmt(n)    { if (n == null) return '—'; return Number(n).toLocaleString() }
function fmtBig(n) { if (!n) return '—'; if (n>=1e9) return (n/1e9).toFixed(1)+'B'; if (n>=1e6) return (n/1e6).toFixed(1)+'M'; if (n>=1e3) return (n/1e3).toFixed(1)+'K'; return String(n) }

const STATUS_COLORS = { online:'#23d18b', idle:'#f0b232', dnd:'#f04747', offline:'#747f8d' }

function WBadge({ color, children }) {
  return <span style={{ fontSize:9, fontWeight:800, color, background:`${color}18`, border:`1px solid ${color}35`, padding:'3px 7px', borderRadius:99, whiteSpace:'nowrap', flexShrink:0, letterSpacing:'0.04em' }}>{children}</span>
}

function WSkeleton({ color, label }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <div style={{ width:40, height:40, borderRadius:10, background:`${color}18`, flexShrink:0, animation:'wSkPulse 1.4s ease-in-out infinite' }} />
      <div style={{ flex:1, display:'flex', flexDirection:'column', gap:6 }}>
        <div style={{ height:12, width:'55%', borderRadius:6, background:'rgba(255,255,255,0.06)', animation:'wSkPulse 1.4s ease-in-out infinite' }} />
        <div style={{ height:10, width:'35%', borderRadius:6, background:'rgba(255,255,255,0.04)', animation:'wSkPulse 1.4s ease-in-out infinite' }} />
      </div>
      <WBadge color={color}>{label}</WBadge>
    </div>
  )
}

function WError({ color, label, msg }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <div style={{ width:36, height:36, borderRadius:10, background:`${color}15`, border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <svg width="16" height="16" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.5)' }}>Widget unavailable</div>
        <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:2, lineHeight:1.4 }}>{msg}</div>
      </div>
      <WBadge color={color}>{label}</WBadge>
    </div>
  )
}

// ─── Discord Presence ──────────────────────────────────────────────────────────
function LiveDiscordWidget({ config }) {
  const [data, setData] = useState(null)
  const [err,  setErr]  = useState('')
  const [load, setLoad] = useState(true)

  useEffect(() => {
    const id = config?.discordId?.trim()
    if (!id) { setErr('Not configured'); setLoad(false); return }

    supabase.from('presence').select('*').eq('discord_id', id).single()
      .then(({ data: row, error }) => {
        if (error || !row) { setErr('User not found — join discord.gg/faterip'); setLoad(false); return }
        setData(row); setLoad(false)
      })

    const channel = supabase
      .channel(`presence-profile-${id}`)
      .on('postgres_changes', { event:'*', schema:'public', table:'presence', filter:`discord_id=eq.${id}` },
        (payload) => { if (payload.new) setData(payload.new) })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [config?.discordId])

  if (load) return <WSkeleton color="#5865F2" label="DISCORD" />
  if (err)  return <WError color="#5865F2" label="DISCORD" msg={err} />

  const status = data.status || 'offline'

return (
  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
      <div style={{ position:'relative', flexShrink:0 }}>
        <img src={data.avatar||(data.global_name||data.username||'D')[0]} alt=""
          style={{ width:48, height:48, borderRadius:'50%', background:'rgba(88,101,242,0.3)', display:'block', objectFit:'cover' }}
          onError={e=>{ e.target.style.display='none' }}
        />
        {!data.avatar && (
          <div style={{ width:48, height:48, borderRadius:'50%', background:'#5865F2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:800, color:'#fff', position:'absolute', top:0, left:0 }}>
            {(data.global_name||data.username||'D')[0].toUpperCase()}
          </div>
        )}
        <div style={{ position:'absolute', bottom:0, right:0, width:14, height:14, borderRadius:'50%', background:STATUS_COLORS[status]||STATUS_COLORS.offline, border:'2px solid rgba(0,0,0,0.6)' }} />
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:14, fontWeight:700, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{data.global_name||data.username||'Unknown'}</div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:1 }}>@{data.username}</div>
        <div style={{ fontSize:11, color:STATUS_COLORS[status], fontWeight:600, marginTop:2, textTransform:'capitalize' }}>{status.replace('dnd','Do Not Disturb')}</div>
      </div>
      <WBadge color="#5865F2">DISCORD</WBadge>
    </div>
    {data.activity_type === 'custom' && data.activity_name && (
      <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', paddingLeft:2 }}>{data.activity_name}</div>
    )}
    {data.activity_type === 'spotify' && (
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', background:'rgba(29,185,84,0.08)', border:'1px solid rgba(29,185,84,0.18)', borderRadius:8 }}>
        {data.spotify_album_art && <img src={data.spotify_album_art} alt="" style={{ width:36, height:36, borderRadius:6, flexShrink:0 }} />}
        <div style={{ minWidth:0, flex:1 }}>
          <div style={{ fontSize:10, color:'#1DB954', fontWeight:700, marginBottom:2 }}>LISTENING TO SPOTIFY</div>
          <div style={{ fontSize:12, fontWeight:600, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{data.spotify_song}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>by {data.spotify_artist}</div>
        </div>
      </div>
    )}
    {data.activity_type && data.activity_type !== 'spotify' && data.activity_type !== 'custom' && data.activity_name && (
      <div style={{ padding:'8px 10px', background:'rgba(88,101,242,0.08)', border:'1px solid rgba(88,101,242,0.15)', borderRadius:8 }}>
        <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>
          {{ playing:'Playing a game', watching:'Watching', listening:'Listening', streaming:'Live on Twitch', competing:'Competing' }[data.activity_type]||'Activity'}
        </div>
        <div style={{ fontSize:12, fontWeight:600, color:'#fff' }}>{data.activity_name}</div>
        {data.activity_details && <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:2 }}>{data.activity_details}</div>}
      </div>
    )}
  </div>
)
}

// ─── GitHub ────────────────────────────────────────────────────────────────────
function LiveGitHubWidget({ config }) {
  const [data, setData] = useState(null)
  const [err,  setErr]  = useState('')
  const [load, setLoad] = useState(true)

  useEffect(() => {
    const u = config?.githubUsername?.trim()
    if (!u) { setErr('Not configured'); setLoad(false); return }
    ;(async () => {
      try {
        const [user, repos] = await Promise.all([
          safeFetch(`https://api.github.com/users/${u}`),
          safeFetch(`https://api.github.com/users/${u}/repos?sort=updated&per_page=3`),
        ])
        setData({ user, repos })
      } catch { setErr('User not found') }
      setLoad(false)
    })()
  }, [config?.githubUsername])

  if (load) return <WSkeleton color="#c9d1d9" label="GITHUB" />
  if (err)  return <WError color="#c9d1d9" label="GITHUB" msg={err} />

  const { user, repos } = data
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <img src={user.avatar_url} alt="" style={{ width:42, height:42, borderRadius:'50%', border:'1px solid rgba(201,209,217,0.2)', flexShrink:0 }} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{user.name||user.login}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:1 }}>@{user.login}</div>
        </div>
        <WBadge color="#c9d1d9">GITHUB</WBadge>
      </div>
      <div style={{ display:'flex', gap:6 }}>
        {[{l:'Followers',v:fmtBig(user.followers)},{l:'Repos',v:fmt(user.public_repos)},{l:'Following',v:fmt(user.following)}].map(s => (
          <div key={s.l} style={{ flex:1, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:7, padding:'5px 6px', textAlign:'center' }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{s.v}</div>
            <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{s.l}</div>
          </div>
        ))}
      </div>
      {repos?.slice(0,2).map(r => (
        <a key={r.id} href={r.html_url} target="_blank" rel="noopener noreferrer"
          style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 9px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:7, textDecoration:'none' }}>
          <span style={{ fontSize:11, fontWeight:600, color:'#c9d1d9', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'65%' }}>{r.name}</span>
          <span style={{ fontSize:10, color:'rgba(255,255,255,0.3)', flexShrink:0 }}>★ {r.stargazers_count}</span>
        </a>
      ))}
    </div>
  )
}

// ─── Weather ───────────────────────────────────────────────────────────────────
const WMO_ICON = {0:'☀️',1:'🌤️',2:'⛅',3:'☁️',45:'🌫️',48:'🌫️',51:'🌦️',53:'🌦️',55:'🌧️',61:'🌧️',63:'🌧️',65:'🌧️',71:'❄️',73:'❄️',75:'❄️',80:'🌦️',81:'🌧️',82:'⛈️',95:'⛈️',96:'⛈️',99:'⛈️'}
const WMO_CODES = {0:'Clear sky',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',45:'Foggy',48:'Rime fog',51:'Light drizzle',53:'Drizzle',55:'Dense drizzle',61:'Slight rain',63:'Moderate rain',65:'Heavy rain',71:'Slight snow',73:'Moderate snow',75:'Heavy snow',80:'Showers',81:'Moderate showers',82:'Violent showers',95:'Thunderstorm',96:'Thunderstorm',99:'Thunderstorm'}

function LiveWeatherWidget({ config }) {
  const [data, setData] = useState(null)
  const [err,  setErr]  = useState('')
  const [load, setLoad] = useState(true)
  const isFahr = config?.units === 'Fahrenheit'

  useEffect(() => {
    const city = config?.city?.trim()
    if (!city) { setErr('No city set'); setLoad(false); return }
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

  if (load) return <WSkeleton color="#38bdf8" label="WEATHER" />
  if (err)  return <WError color="#38bdf8" label="WEATHER" msg={err} />

  const code = data.weathercode
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:48, height:48, borderRadius:12, background:'rgba(56,189,248,0.12)', border:'1px solid rgba(56,189,248,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{WMO_ICON[code]||'🌡️'}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:20, fontWeight:800, color:'#fff', lineHeight:1 }}>{Math.round(data.temperature_2m)}{isFahr?'°F':'°C'}</div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)', marginTop:2 }}>{data.city}, {data.country}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:1 }}>{WMO_CODES[code]||'Unknown'}</div>
        </div>
        <WBadge color="#38bdf8">WEATHER</WBadge>
      </div>
      <div style={{ display:'flex', gap:6 }}>
        {[{l:'Feels like',v:`${Math.round(data.apparent_temperature)}${isFahr?'°F':'°C'}`},{l:'Humidity',v:`${data.relative_humidity_2m}%`},{l:'Wind',v:`${Math.round(data.wind_speed_10m)} km/h`}].map(s => (
          <div key={s.l} style={{ flex:1, background:'rgba(56,189,248,0.05)', border:'1px solid rgba(56,189,248,0.12)', borderRadius:7, padding:'5px 6px', textAlign:'center' }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#38bdf8' }}>{s.v}</div>
            <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Last.fm ───────────────────────────────────────────────────────────────────
function LiveLastfmWidget({ config }) {
  const [data,   setData]   = useState(null)
  const [tracks, setTracks] = useState([])
  const [err,    setErr]    = useState('')
  const [load,   setLoad]   = useState(true)

  useEffect(() => {
    const u = config?.lastfmUsername?.trim()
    if (!u) { setErr('Not configured'); setLoad(false); return }
    if (!LASTFM_API_KEY) { setErr('Add NEXT_PUBLIC_LASTFM_API_KEY to .env'); setLoad(false); return }
    ;(async () => {
      try {
        const [info, recent] = await Promise.all([
          safeFetch(`https://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${u}&api_key=${LASTFM_API_KEY}&format=json`),
          safeFetch(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${u}&limit=3&api_key=${LASTFM_API_KEY}&format=json`),
        ])
        if (info.error) throw new Error(info.message)
        setData(info.user)
        setTracks(recent.recenttracks?.track||[])
      } catch (e) { setErr(e.message||'Could not load Last.fm') }
      setLoad(false)
    })()
  }, [config?.lastfmUsername])

  if (load) return <WSkeleton color="#d51007" label="LAST.FM" />
  if (err)  return <WError color="#d51007" label="LAST.FM" msg={err} />

  const nowPlaying = tracks[0]?.['@attr']?.nowplaying === 'true' ? tracks[0] : null

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:42, height:42, borderRadius:'50%', background:'rgba(213,16,7,0.15)', border:'1px solid rgba(213,16,7,0.3)', overflow:'hidden', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
          {data.image?.[2]?.['#text'] ? <img src={data.image[2]['#text']} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '🎵'}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{data.realname||data.name}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:1 }}>{fmtBig(parseInt(data.playcount))} scrobbles</div>
        </div>
        <WBadge color="#d51007">LAST.FM</WBadge>
      </div>
      {nowPlaying && (
        <div style={{ background:'rgba(213,16,7,0.08)', border:'1px solid rgba(213,16,7,0.2)', borderRadius:9, padding:'7px 10px', display:'flex', alignItems:'center', gap:8 }}>
          {nowPlaying.image?.[1]?.['#text'] && <img src={nowPlaying.image[1]['#text']} alt="" style={{ width:30, height:30, borderRadius:5, flexShrink:0 }} />}
          <div style={{ minWidth:0, flex:1 }}>
            <div style={{ fontSize:10, color:'#d51007', fontWeight:700 }}>♪ Now Playing</div>
            <div style={{ fontSize:11, fontWeight:600, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{nowPlaying.name}</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{nowPlaying.artist?.['#text']}</div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Roblox ────────────────────────────────────────────────────────────────────
function LiveRobloxWidget({ config }) {
  const [data, setData] = useState(null)
  const [err,  setErr]  = useState('')
  const [load, setLoad] = useState(true)

  useEffect(() => {
    const u = config?.robloxUsername?.trim()
    if (!u) { setErr('Not configured'); setLoad(false); return }
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

  if (load) return <WSkeleton color="#e00000" label="ROBLOX" />
  if (err)  return <WError color="#e00000" label="ROBLOX" msg={err} />

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:42, height:42, borderRadius:10, background:'rgba(224,0,0,0.12)', border:'1px solid rgba(224,0,0,0.25)', overflow:'hidden', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          {data.thumb ? <img src={data.thumb} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <svg width="22" height="22" viewBox="0 0 24 24" fill="#e00000"><path d="M5.24 3L3 18.76 18.76 21 21 5.24 5.24 3zm9.12 10.9l-3.88-.6.6-3.88 3.88.6-.6 3.88z"/></svg>}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{data.displayName||data.name}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:1 }}>@{data.name}</div>
        </div>
        <WBadge color="#e00000">ROBLOX</WBadge>
      </div>
      <div style={{ display:'flex', gap:6 }}>
        {[{l:'Friends',v:fmt(data.friendsCount)},{l:'Followers',v:fmt(data.followersCount)}].map(s => (
          <div key={s.l} style={{ flex:1, background:'rgba(224,0,0,0.06)', border:'1px solid rgba(224,0,0,0.15)', borderRadius:7, padding:'6px 8px', textAlign:'center' }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#e00000' }}>{s.v}</div>
            <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── VALORANT ──────────────────────────────────────────────────────────────────
const VAL_TIER_COLORS = {'Iron':'#a0a0a0','Bronze':'#8c5a28','Silver':'#b4b4b4','Gold':'#f0c040','Platinum':'#40c8b4','Diamond':'#a060f0','Ascendant':'#40c860','Immortal':'#e04060','Radiant':'#f0e060'}

function LiveValorantWidget({ config }) {
  const [data, setData] = useState(null)
  const [err,  setErr]  = useState('')
  const [load, setLoad] = useState(true)

  useEffect(() => {
    const riot = config?.riotId?.trim()
    const reg  = (config?.region||'NA').toLowerCase()
    if (!riot) { setErr('Not configured'); setLoad(false); return }
    const [name, tag] = riot.split('#')
    if (!name||!tag) { setErr('Format: Name#TAG'); setLoad(false); return }
    ;(async () => {
      try {
        const headers = HENRIK_API_KEY ? { Authorization:HENRIK_API_KEY } : {}
        const mmr = await safeFetch(`https://api.henrikdev.xyz/valorant/v3/mmr/${reg}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`, { headers })
        if (mmr.status===404) throw new Error('Player not found')
        if (mmr.errors?.length) throw new Error(mmr.errors[0].message)
        setData(mmr.data)
      } catch (e) { setErr(e.message?.includes('429')?'Rate limited — try again':(e.message||'Could not load VALORANT')) }
      setLoad(false)
    })()
  }, [config?.riotId, config?.region])

  if (load) return <WSkeleton color="#FF4655" label="VALORANT" />
  if (err)  return <WError color="#FF4655" label="VALORANT" msg={err} />

  const current = data?.current
  const tier    = current?.tier?.name||'Unrated'
  const rr      = current?.rr??0
  const peak    = data?.peak
  const tierColor = Object.entries(VAL_TIER_COLORS).find(([k]) => tier.startsWith(k))?.[1]||'#FF4655'

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:48, height:48, borderRadius:12, background:`${tierColor}22`, border:`1px solid ${tierColor}44`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden' }}>
          {current?.tier?.large_icon ? <img src={current.tier.large_icon} alt={tier} style={{ width:38, height:38, objectFit:'contain' }} /> : <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l2 10 8 5 8-5 2-10L12 2z" stroke="#FF4655" strokeWidth="1.5"/><path d="M8 9l4 7 4-7" stroke="#FF4655" strokeWidth="1.5" strokeLinecap="round"/></svg>}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{config.riotId}</div>
          <div style={{ fontSize:15, fontWeight:800, color:tierColor, marginTop:1 }}>{tier}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:1 }}>{rr} RR · {config?.region?.toUpperCase()}</div>
        </div>
        <WBadge color="#FF4655">VALORANT</WBadge>
      </div>
      {peak && (
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 10px', background:'rgba(255,70,85,0.06)', border:'1px solid rgba(255,70,85,0.15)', borderRadius:8 }}>
          {peak.tier?.large_icon && <img src={peak.tier.large_icon} alt="" style={{ width:18, height:18, objectFit:'contain', flexShrink:0 }} />}
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)' }}>Peak: <span style={{ fontWeight:700, color:Object.entries(VAL_TIER_COLORS).find(([k])=>peak.tier?.name?.startsWith(k))?.[1]||'#FF4655' }}>{peak.tier?.name}</span>{peak.season && <span style={{ marginLeft:6, color:'rgba(255,255,255,0.3)' }}>({peak.season})</span>}</div>
        </div>
      )}
    </div>
  )
}

// ─── Chess.com ─────────────────────────────────────────────────────────────────
function LiveChessWidget({ config }) {
  const [data, setData] = useState(null)
  const [err,  setErr]  = useState('')
  const [load, setLoad] = useState(true)

  useEffect(() => {
    const u = config?.chessUsername?.trim()
    if (!u) { setErr('Not configured'); setLoad(false); return }
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

  if (load) return <WSkeleton color="#81b64c" label="CHESS" />
  if (err)  return <WError color="#81b64c" label="CHESS" msg={err} />

  const { profile, stats } = data
  const modes = [
    {key:'chess_bullet',e:'⚡',l:'Bullet'},{key:'chess_blitz',e:'🔥',l:'Blitz'},
    {key:'chess_rapid',e:'⏱',l:'Rapid'},{key:'chess_daily',e:'📅',l:'Daily'},
  ].filter(m => stats[m.key])

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:42, height:42, borderRadius:'50%', overflow:'hidden', border:'1px solid rgba(129,182,76,0.3)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(129,182,76,0.1)', fontSize:18 }}>
          {profile.avatar ? <img src={profile.avatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '♟'}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{profile.name||profile.username}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>@{profile.username}</div>
        </div>
        <WBadge color="#81b64c">CHESS</WBadge>
      </div>
      {modes.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:5 }}>
          {modes.slice(0,4).map(({key,e,l}) => {
            const m = stats[key]
            const rating = m.last?.rating||m.best?.rating||'—'
            return (
              <div key={key} style={{ background:'rgba(129,182,76,0.06)', border:'1px solid rgba(129,182,76,0.14)', borderRadius:7, padding:'6px 9px' }}>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', marginBottom:2 }}>{e} {l}</div>
                <div style={{ fontSize:15, fontWeight:800, color:'#81b64c' }}>{rating}</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── TikTok ────────────────────────────────────────────────────────────────────
function LiveTikTokWidget({ config }) {
  const [data, setData] = useState(null)
  const [err,  setErr]  = useState('')
  const [load, setLoad] = useState(true)

  useEffect(() => {
    const u = config?.tiktokUsername?.trim().replace(/^@/,'')
    if (!u) { setErr('Not configured'); setLoad(false); return }
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
      } catch (e) { setErr(e.message?.includes('parse')?'TikTok blocked — may be unavailable':(e.message||'Could not load TikTok')) }
      setLoad(false)
    })()
  }, [config?.tiktokUsername])

  if (load) return <WSkeleton color="#ff0050" label="TIKTOK" />
  if (err)  return <WError color="#ff0050" label="TIKTOK" msg={err} />

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:42, height:42, borderRadius:'50%', background:'rgba(255,0,80,0.15)', border:'1px solid rgba(255,0,80,0.3)', overflow:'hidden', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🎵</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{data.nickname}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>@{data.username}</div>
        </div>
        <WBadge color="#ff0050">TIKTOK</WBadge>
      </div>
      <div style={{ display:'flex', gap:5 }}>
        {[{l:'Followers',v:fmtBig(data.followers)},{l:'Likes',v:fmtBig(data.likes)},{l:'Videos',v:fmt(data.videos)}].map(s => (
          <div key={s.l} style={{ flex:1, background:'rgba(255,0,80,0.06)', border:'1px solid rgba(255,0,80,0.14)', borderRadius:7, padding:'5px 4px', textAlign:'center' }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#ff0050' }}>{s.v}</div>
            <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Discord Server ────────────────────────────────────────────────────────────
function LiveDiscordServerWidget({ config }) {
  const [data, setData] = useState(null)
  const [err,  setErr]  = useState('')
  const [load, setLoad] = useState(true)

  useEffect(() => {
    const id = config?.serverId?.trim()
    if (!id) { setErr('Not configured'); setLoad(false); return }
    ;(async () => {
      try {
        const d = await safeFetch(`https://discord.com/api/guilds/${id}/widget.json`)
        if (d.code===50004||d.message) throw new Error('Enable Widget in Server Settings → Widget')
        setData(d)
      } catch (e) { setErr(e.message||'Could not load server') }
      setLoad(false)
    })()
  }, [config?.serverId])

  if (load) return <WSkeleton color="#5865F2" label="SERVER" />
  if (err)  return <WError color="#5865F2" label="SERVER" msg={err} />

  const invite = config?.inviteLink||data.instant_invite

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:42, height:42, borderRadius:12, background:'rgba(88,101,242,0.15)', border:'1px solid rgba(88,101,242,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:20 }}>🏰</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{data.name}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:1 }}>
            <span style={{ color:'#23d18b' }}>● </span>{fmt(data.presence_count)} online
          </div>
        </div>
        <WBadge color="#5865F2">DISCORD</WBadge>
      </div>
      {data.members?.length>0 && (
        <div style={{ display:'flex', gap:4, alignItems:'center', flexWrap:'wrap' }}>
          {data.members.slice(0,8).map((m,i) => (
            <div key={i} title={m.username} style={{ position:'relative', width:26, height:26, flexShrink:0 }}>
              <div style={{ width:26, height:26, borderRadius:'50%', background:'rgba(88,101,242,0.2)', border:'1px solid rgba(88,101,242,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'#5865F2', overflow:'hidden' }}>
                {m.avatar_url ? <img src={m.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : m.username?.[0]?.toUpperCase()}
              </div>
              <div style={{ position:'absolute', bottom:0, right:0, width:8, height:8, borderRadius:'50%', background:STATUS_COLORS[m.status]||STATUS_COLORS.offline, border:'1px solid rgba(0,0,0,0.5)' }} />
            </div>
          ))}
        </div>
      )}
      {invite && (
        <a href={invite} target="_blank" rel="noopener noreferrer"
          style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'7px 12px', background:'#5865F2', borderRadius:9, color:'#fff', fontSize:12, fontWeight:700, textDecoration:'none' }}>
          Join Server ↗
        </a>
      )}
    </div>
  )
}

// ─── Widget router ─────────────────────────────────────────────────────────────
function ProfileWidget({ widget, accentColor, bgRgb, panelOpacity, panelBlur }) {
  const map = {
    discord:       LiveDiscordWidget,
    github:        LiveGitHubWidget,
    weather:       LiveWeatherWidget,
    lastfm:        LiveLastfmWidget,
    roblox:        LiveRobloxWidget,
    valorant:      LiveValorantWidget,
    chess:         LiveChessWidget,
    tiktok:        LiveTikTokWidget,
    discordserver: LiveDiscordServerWidget,
  }
  const Component = map[widget.id]
  if (!Component) return null

  return (
    <div style={{
      width: '100%',
      background: `rgba(${bgRgb},${Math.max(0.4, (panelOpacity||85)/100 - 0.1)})`,
      backdropFilter: `blur(${panelBlur||24}px)`,
      WebkitBackdropFilter: `blur(${panelBlur||24}px)`,
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16,
      padding: '14px 16px',
      boxSizing: 'border-box',
    }}>
      <Component config={widget.config||{}} accentColor={accentColor} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PROFILE PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function ProfilePage() {
  const params   = useParams()
  const username = params?.username
  const [profile,   setProfile]   = useState(null)
  const [notFound,  setNotFound]  = useState(false)
  const [loading,   setLoading]   = useState(true)
  const [entered,   setEntered]   = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [viewCount, setViewCount] = useState(null)
  const [badges,    setBadges]    = useState([])
  const audioRef = useRef(null)

  const spawnClickEffect = useCallback((e, type) => {
    if (type==='None'||!type) return
    const symbols = { Sparks:['✦','✧','⋆'], Hearts:['♥','❤','💕'], Stars:['★','✦','✧'], Explosion:['💥','✦','●'], Ripple:['○','◎','●'] }
    const chars = symbols[type]||['✦']
    for (let i=0;i<6;i++) {
      const el = document.createElement('div')
      el.textContent = chars[Math.floor(Math.random()*chars.length)]
      el.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;pointer-events:none;z-index:9999;font-size:${12+Math.random()*12}px;color:#e03030;animation:clickFly 0.8s ease-out forwards;`
      const angle = (i/6)*360*(Math.PI/180)
      const dist  = 30+Math.random()*40
      el.style.setProperty('--tx',`${Math.cos(angle)*dist}px`)
      el.style.setProperty('--ty',`${Math.sin(angle)*dist-20}px`)
      document.body.appendChild(el)
      setTimeout(()=>el.remove(),800)
    }
  },[])

  useEffect(() => {
    if (!username) return
    const load = async () => {
      const { data, error } = await supabase.from('users').select('*').eq('username', username)
      if (error||!data||data.length===0) { setNotFound(true); setLoading(false); return }
      setProfile(data[0])
      const { data:badgeRows } = await supabase.from('user_badges').select('badge, hidden').eq('username', username).eq('hidden', false)
      setBadges(badgeRows||[])
      setLoading(false)
    }
    load()
  }, [username])

  useEffect(() => {
    if (!username) return
    trackView(username)
    const fetchViews = async () => {
      await new Promise(r=>setTimeout(r,600))
      const { count } = await supabase.from('profile_views').select('*',{count:'exact',head:true}).eq('username',username)
      setViewCount(count||0)
    }
    fetchViews()
  }, [username])

  useEffect(() => {
    if (!profile) return
    let link = document.querySelector("link[rel~='icon']")
    if (!link) { link=document.createElement('link'); link.rel='icon'; document.head.appendChild(link) }
    link.href = '/scythe.png'
    if (profile.cursor_url) {
      const img = new Image(); img.crossOrigin='anonymous'
      img.onload = () => { const c=document.createElement('canvas'); c.width=32; c.height=32; c.getContext('2d').drawImage(img,0,0,32,32); document.body.style.cursor=`url('${c.toDataURL()}') 16 16, auto` }
      img.src = profile.cursor_url
    } else {
      const s = profile.settings||{}
      const cursorMap = {'Dot':'crosshair','Ring':'cell','Crosshair':'crosshair','Arrow':'default','Default':'auto'}
      document.body.style.cursor = cursorMap[s.cursorStyle]||'auto'
    }
    const fullText = `@${profile.username}`
    let i=0,deleting=false,timeout
    const tick = () => {
      if (!deleting) { i++; document.title=fullText.slice(0,i); if (i===fullText.length) timeout=setTimeout(()=>{deleting=true;timeout=setTimeout(tick,200)},2500); else timeout=setTimeout(tick,200) }
      else { i--; document.title=fullText.slice(0,i); if (i===0){deleting=false;timeout=setTimeout(tick,1200)}else timeout=setTimeout(tick,120) }
    }
    timeout = setTimeout(tick,1200)
    return ()=>{ clearTimeout(timeout); document.body.style.cursor='' }
  }, [profile])

  useEffect(() => {
    if (!profile) return
    const s=profile.settings||{}; const m=s.music||{}
    const src = m.url||profile.audio_url
    if (!src) return
    const t = setTimeout(()=>{ if (audioRef.current) audioRef.current.play().then(()=>setIsPlaying(true)).catch(()=>{}) },300)
    return ()=>clearTimeout(t)
  }, [profile])

  const handleEnter = useCallback(()=>{
    setEntered(true)
    setTimeout(()=>{ if (audioRef.current) audioRef.current.play().then(()=>setIsPlaying(true)).catch(()=>{}) },100)
  },[])

  if (loading) return (
    <div style={{background:'#080808',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{color:'#333',fontFamily:'sans-serif',fontSize:14,fontWeight:700}}>Loading...</div>
    </div>
  )

  if (notFound) return (
    <div style={{background:'#080808',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'sans-serif'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:64,fontWeight:900,color:'#fff',lineHeight:1}}>404</div>
        <div style={{fontSize:15,color:'#444',margin:'10px 0 28px',fontWeight:600}}>This profile doesn&apos;t exist.</div>
        <a href="/" style={{color:'#CC0000',fontWeight:800,fontSize:13,textDecoration:'none',background:'rgba(204,0,0,0.1)',padding:'10px 20px',borderRadius:999,border:'1px solid rgba(204,0,0,0.2)'}}>← Back to fate.rip</a>
      </div>
    </div>
  )

  const settings        = profile.settings||{}
  const fontFamily      = settings.font||'Nunito'
  const accentColor     = settings.accentColor||'#CC0000'
  const bgColor         = settings.bgColor||'#080808'
  const glowIntensity   = settings.glowIntensity!==undefined?settings.glowIntensity:50
  const particleEnabled = settings.particleEnabled||false
  const particleStyle   = settings.particleStyle||'Dots'
  const clickEffect     = settings.clickEffect||'None'
  const entranceAnim    = settings.entranceAnim||'Fade In'
  const music           = settings.music||{}
  const layout          = settings.layout||{}
  const entrance        = settings.entrance||{}
  const btns            = Array.isArray(settings.buttons)?settings.buttons:[]
  const widgets         = Array.isArray(profile.widgets)?profile.widgets:[]
  const typingBio       = layout.typingBio||false
  const followCursor    = layout.followCursor||false
  const panelOpacity    = layout.panelOpacity!==undefined?layout.panelOpacity:85
  const panelBlur       = layout.panelBlur!==undefined?layout.panelBlur:24
  const showAvatarPref  = layout.showAvatar!==false
  const avatarPos       = layout.avatarPos||'center'
  const panelSize       = layout.panelSize||'medium'
  const entranceEnabled = entrance.enabled!==false
  const panelMaxW       = {compact:380,medium:480,wide:580,full:680}[panelSize]||480
  const iconSize        = settings.iconSize||44
  const showLinkLabels  = settings.showLinkLabels!==false
  const initial         = profile.username[0].toUpperCase()
  const links           = Array.isArray(profile.links)?profile.links:[]
  const opacity         = profile.opacity??100
  const blur            = profile.blur??0
  const usernameFx      = profile.username_fx||''
  const bgFx            = profile.bg_fx||'none'
  const location        = profile.location||''
  const glowState       = profile.glow_settings||{username:true,socials:true,badges:false}
  const avatarUrl       = profile.avatar_url||null
  const bgUrl           = profile.bg_url||null
  const displayName     = profile.display_name||''
  const audioSrc        = music.url||profile.audio_url||null
  const fontQuery       = FONT_MAP[fontFamily]||FONT_MAP['Nunito']
  const glowAlpha       = glowIntensity/100
  const badgePosition   = profile.badge_position||'below_bio'

  const nameStyle = (() => {
    if (usernameFx==='rainbow') return {background:'linear-gradient(90deg,#ff0,#0f0,#0ff,#f0f,#f00)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}
    if (usernameFx==='gold')    return {background:'linear-gradient(90deg,#b8860b,#ffd700,#b8860b)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}
    if (usernameFx==='neon')    return {color:accentColor,textShadow:`0 0 12px ${accentColor}dd, 0 0 24px ${accentColor}66`}
    if (usernameFx==='glitch')  return {color:'#fff',animation:'glitch 0.4s infinite'}
    if (glowState.username)     return {color:'#fff',textShadow:`0 0 ${12+glowIntensity*0.2}px ${accentColor}${Math.round(glowAlpha*99).toString(16).padStart(2,'0')}`}
    return {color:'#fff'}
  })()

  const overlayStyle = (() => {
    if (bgFx==='nighttime') return {background:'linear-gradient(180deg,rgba(5,5,12,0.5) 0%,rgba(20,0,40,0.6) 100%)'}
    if (bgFx==='particles') return {background:`radial-gradient(circle at 20% 80%,${accentColor}33 0%,transparent 50%),radial-gradient(circle at 80% 20%,${accentColor}1a 0%,transparent 40%)`}
    if (bgFx==='matrix')    return {background:'linear-gradient(180deg,rgba(0,30,10,0.6) 0%,rgba(0,60,20,0.3) 100%)'}
    if (bgFx==='rain')      return {background:'linear-gradient(180deg,rgba(0,10,40,0.6) 0%,rgba(0,20,80,0.3) 100%)'}
    if (bgFx==='snow')      return {background:'linear-gradient(180deg,rgba(200,220,255,0.08) 0%,rgba(180,200,255,0.12) 100%)'}
    return {}
  })()

  const entranceAnimStyle = (() => {
    if (!entered) return {}
    if (entranceAnim==='Slide Up') return {animation:'slideUp 0.5s ease forwards'}
    if (entranceAnim==='Zoom In')  return {animation:'zoomIn 0.4s ease forwards'}
    if (entranceAnim==='Glitch')   return {animation:'glitchIn 0.5s ease forwards'}
    return {animation:'fadeIn 0.4s ease forwards'}
  })()

  const hexToRgb = (hex) => { const r=parseInt(hex.slice(1,3),16); const g=parseInt(hex.slice(3,5),16); const b=parseInt(hex.slice(5,7),16); return `${r},${g},${b}` }
  const accentRgb = hexToRgb(accentColor||'#CC0000')
  const bgRgb     = hexToRgb(bgColor||'#080808')

  if (!entered && entranceEnabled) {
    const enterTitle    = entrance.title||profile.username
    const enterSubtitle = entrance.subtitle||'Click anywhere to enter'
    const showAvtr      = entrance.showAvatar!==false
    const showTtl       = entrance.showTitle!==false
    const showSub       = entrance.showSubtitle!==false
    return (
      <div onClick={handleEnter} style={{background:bgColor,minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:'pointer',position:'relative',overflow:'hidden',fontFamily:`'${fontFamily}', sans-serif`}}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=${fontQuery}&display=swap');`}</style>
        {bgUrl && (bgUrl.match(/\.(mp4|webm|ogg|mov)$/i)
          ? <video src={bgUrl} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:opacity/100,filter:blur>0?`blur(${blur}px)`:''}} autoPlay loop muted playsInline />
          : <img src={bgUrl} alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:opacity/100,filter:blur>0?`blur(${blur}px)`:''}} />
        )}
        <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.55)',zIndex:1}} />
        <div style={{position:'relative',zIndex:2,display:'flex',flexDirection:'column',alignItems:'center',gap:16,textAlign:'center',padding:'0 24px',animation:'entrancePulse 2s ease-in-out infinite'}}>
          {showAvtr && avatarUrl  && <div style={{width:88,height:88,borderRadius:'50%',border:`3px solid ${accentColor}88`,overflow:'hidden',marginBottom:4}}><img src={avatarUrl} alt={profile.username} style={{width:'100%',height:'100%',objectFit:'cover'}} /></div>}
          {showAvtr && !avatarUrl && <div style={{width:88,height:88,borderRadius:'50%',background:`${accentColor}22`,border:`3px solid ${accentColor}88`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,fontWeight:900,color:accentColor}}>{initial}</div>}
          {showTtl && <div style={{fontSize:28,fontWeight:900,color:'#fff',letterSpacing:'-0.5px'}}>{enterTitle}</div>}
          {showSub && <div style={{fontSize:14,color:'rgba(255,255,255,0.5)',fontWeight:600}}>{enterSubtitle}</div>}
          <div style={{marginTop:8,width:32,height:2,borderRadius:1,background:accentColor,animation:'lineGrow 1.5s ease-in-out infinite'}} />
        </div>
        <style>{`@keyframes entrancePulse{0%,100%{transform:scale(1)}50%{transform:scale(1.02)}} @keyframes lineGrow{0%,100%{width:32px;opacity:0.5}50%{width:64px;opacity:1}}`}</style>
      </div>
    )
  }

  const alignItems = avatarPos==='left'?'flex-start':avatarPos==='right'?'flex-end':'center'
  const textAlign  = avatarPos==='left'?'left':avatarPos==='right'?'right':'center'
  const handleClick = (e) => { if (clickEffect!=='None') spawnClickEffect(e, clickEffect) }
  const badgeStrip  = <BadgeStrip badges={badges} align={avatarPos} />

  return (
    <>
      {audioSrc && <audio ref={audioRef} src={audioSrc} loop preload="auto" style={{display:'none'}} />}
      <ProfileContent
        profile={profile} fontFamily={fontFamily} fontQuery={fontQuery}
        accentColor={accentColor} bgColorSetting={bgColor} bgRgb={bgRgb} accentRgb={accentRgb}
        glowIntensity={glowIntensity} particleEnabled={particleEnabled} particleStyle={particleStyle}
        clickEffect={clickEffect} music={music} btns={btns} widgets={widgets}
        typingBio={typingBio} showAvatarPref={showAvatarPref} avatarPos={avatarPos}
        panelMaxW={panelMaxW} initial={initial} links={links} opacity={opacity} blur={blur}
        bgFx={bgFx} location={location} glowState={glowState} avatarUrl={avatarUrl} bgUrl={bgUrl}
        displayName={displayName} audioSrc={audioSrc} nameStyle={nameStyle} overlayStyle={overlayStyle}
        entranceAnimStyle={entranceAnimStyle} audioRef={audioRef} isPlaying={isPlaying}
        setIsPlaying={setIsPlaying} spawnClickEffect={spawnClickEffect}
        iconSize={iconSize} viewCount={viewCount} showLinkLabels={showLinkLabels}
        badges={badges} badgePosition={badgePosition} followCursor={followCursor}
        panelOpacity={panelOpacity} panelBlur={panelBlur} handleClick={handleClick}
        badgeStrip={badgeStrip}
      />
    </>
  )
}

// ─── Profile Content ───────────────────────────────────────────────────────────
function ProfileContent({
  profile, fontFamily, fontQuery, accentColor, bgColorSetting, bgRgb, accentRgb,
  glowIntensity, particleEnabled, particleStyle, clickEffect,
  music, btns, widgets, typingBio, showAvatarPref, avatarPos, panelMaxW,
  initial, links, opacity, blur, bgFx, location, glowState,
  avatarUrl, bgUrl, displayName, audioSrc, nameStyle, overlayStyle,
  entranceAnimStyle, audioRef, isPlaying, setIsPlaying, spawnClickEffect,
  viewCount, iconSize, showLinkLabels, badges, badgePosition, followCursor,
  panelOpacity, panelBlur, handleClick, badgeStrip,
}) {
  const bioDisplayed = useTypewriter(profile.bio||'', typingBio)
  const alignItems   = avatarPos==='left'?'flex-start':avatarPos==='right'?'flex-end':'center'
  const textAlign    = avatarPos==='left'?'left':avatarPos==='right'?'right':'center'

  const [tilt, setTilt]           = useState({x:0,y:0})
  const [currentTime, setCurrentTime] = useState(0)
  const [duration,    setDuration]    = useState(0)
  const tiltRef = useRef(null)

  useEffect(() => {
    const audio = audioRef.current; if (!audio) return
    const onTime  = () => setCurrentTime(audio.currentTime)
    const onMeta  = () => setDuration(isNaN(audio.duration)?0:audio.duration)
    const onPlay  = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    audio.addEventListener('timeupdate',onTime); audio.addEventListener('durationchange',onMeta)
    audio.addEventListener('loadedmetadata',onMeta); audio.addEventListener('play',onPlay); audio.addEventListener('pause',onPause)
    return ()=>{ audio.removeEventListener('timeupdate',onTime); audio.removeEventListener('durationchange',onMeta); audio.removeEventListener('loadedmetadata',onMeta); audio.removeEventListener('play',onPlay); audio.removeEventListener('pause',onPause) }
  },[audioRef,setIsPlaying])

  const fmt2 = (s) => { if (!s||isNaN(s)) return '0:00'; return `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,'0')}` }
  const togglePlay = (e) => { e.stopPropagation(); if (!audioRef.current) return; audioRef.current.paused?audioRef.current.play().catch(()=>{}):audioRef.current.pause() }
  const handleSeek = (e) => { e.stopPropagation(); if (!audioRef.current||!duration) return; const rect=e.currentTarget.getBoundingClientRect(); audioRef.current.currentTime=Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width))*duration }
  const progress = duration?(currentTime/duration)*100:0
  const trackTitle  = music.showTitle !==false?(music.title ||music.musicTitle ||'Unknown'):''
  const trackArtist = music.showArtist!==false?(music.artist||music.musicArtist||'Unknown'):''

  const onTiltMove  = followCursor?(e)=>{ const el=tiltRef.current; if (!el) return; const rect=el.getBoundingClientRect(); setTilt({x:((e.clientY-rect.top-rect.height/2)/(rect.height/2))*-10,y:((e.clientX-rect.left-rect.width/2)/(rect.width/2))*10}) }:undefined
  const onTiltLeave = followCursor?()=>setTilt({x:0,y:0}):undefined

  return (
    <div onClick={handleClick} style={{background:bgColorSetting,minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:`'${fontFamily}', sans-serif`,padding:'40px 16px',position:'relative',overflow:'hidden'}}>
      <link rel="icon" href="/scythe.png" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=${fontQuery}&display=swap');
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
        @keyframes wSkPulse{0%,100%{opacity:0.5}50%{opacity:1}}
        @keyframes glitch{0%,100%{text-shadow:2px 0 #ff0000,-2px 0 #0000ff}25%{text-shadow:-2px 0 #ff0000,2px 0 #0000ff}50%{text-shadow:2px 2px #ff0000,-2px -2px #0000ff}75%{text-shadow:-2px 2px #ff0000,2px -2px #0000ff}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes zoomIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}
        @keyframes glitchIn{0%{opacity:0;transform:skewX(-10deg)}30%{transform:skewX(5deg)}60%{transform:skewX(-2deg)}100%{opacity:1;transform:skewX(0)}}
        @keyframes floatParticle{0%{transform:translateY(100vh) scale(0);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translateY(-10vh) scale(1);opacity:0}}
        @keyframes rainDrop{0%{transform:translateY(-10px);opacity:0}10%{opacity:0.6}100%{transform:translateY(100vh);opacity:0}}
        @keyframes snowFlake{0%{transform:translateY(-10px) translateX(0);opacity:0}10%{opacity:0.8}50%{transform:translateY(50vh) translateX(20px)}100%{transform:translateY(100vh) translateX(-10px);opacity:0}}
        @keyframes matrixChar{0%{opacity:0;transform:translateY(-20px)}50%{opacity:1}100%{opacity:0;transform:translateY(20px)}}
        @keyframes starFloat{0%{transform:translateY(0) rotate(0deg);opacity:0}20%{opacity:1}80%{opacity:1}100%{transform:translateY(-80vh) rotate(360deg);opacity:0}}
        @keyframes bubbleRise{0%{transform:translateY(100vh) scale(0.5);opacity:0}10%{opacity:0.7}100%{transform:translateY(-20px) scale(1);opacity:0}}
        @keyframes firefly{0%,100%{transform:translate(0,0);opacity:0.2}25%{transform:translate(20px,-30px);opacity:1}50%{transform:translate(-10px,-60px);opacity:0.5}75%{transform:translate(30px,-40px);opacity:0.8}}
        @keyframes clickFly{0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(var(--tx),var(--ty)) scale(0);opacity:0}}
        @keyframes barPulse{0%,100%{transform:scaleY(0.3)}50%{transform:scaleY(1)}}
        .profile-outer{display:flex;flex-direction:column;align-items:center;position:relative;z-index:2;width:100%;}
        .profile-avatar-float{position:relative;z-index:3;margin-bottom:-46px;}
        .profile-panel{width:100%;background:rgba(${bgRgb},${panelOpacity/100});backdrop-filter:blur(${panelBlur}px) saturate(160%);-webkit-backdrop-filter:blur(${panelBlur}px) saturate(160%);border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:64px 28px 28px;display:flex;flex-direction:column;box-shadow:0 8px 40px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.06);}
        .avatar-ring{border-radius:50%;padding:3px;flex-shrink:0;}
        .avatar-inner{width:100%;height:100%;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:900;overflow:hidden;}
        .avatar-inner img{width:100%;height:100%;object-fit:cover;border-radius:50%;}
        .action-btn{width:100%;padding:12px 20px;border-radius:14px;font-family:inherit;font-size:14px;font-weight:700;text-align:center;text-decoration:none;transition:all 0.2s;display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;}
        .action-btn:hover{transform:translateY(-2px);filter:brightness(1.1);}
        .footer{margin-top:24px;font-size:12px;color:#252525;font-weight:700;letter-spacing:0.5px;display:flex;align-items:center;gap:6px;}
        .footer a{color:${accentColor};text-decoration:none;opacity:0.7;transition:opacity 0.15s;}
        .footer a:hover{opacity:1;}
        .bg-img{position:fixed;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;}
        .bg-overlay{position:fixed;inset:0;z-index:1;pointer-events:none;}
        .fx-layer{position:fixed;inset:0;z-index:1;pointer-events:none;overflow:hidden;}
        .music-player{width:100%;background:rgba(${bgRgb},${panelOpacity/100});backdrop-filter:blur(${panelBlur}px) saturate(160%);-webkit-backdrop-filter:blur(24px) saturate(160%);border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:16px 20px 14px;box-shadow:0 8px 32px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.05);}
        .music-ctrl{background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.5);padding:4px;display:flex;align-items:center;justify-content:center;transition:color .15s,transform .15s;border-radius:50%;}
        .music-ctrl:hover{color:#fff;transform:scale(1.18);}
        .music-play{width:34px;height:34px;border-radius:50%;flex-shrink:0;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.12);cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;transition:background .15s,transform .15s;}
        .music-play:hover{background:rgba(255,255,255,0.2);transform:scale(1.1);}
        .seek-track{width:100%;height:3px;background:rgba(255,255,255,0.1);border-radius:99px;cursor:pointer;margin:10px 0 6px;transition:height .15s;position:relative;}
        .seek-track:hover{height:5px;margin:9px 0 5px;}
        .seek-fill{height:100%;border-radius:99px;pointer-events:none;background:${accentColor};position:relative;}
        .seek-fill::after{content:'';position:absolute;right:-5px;top:50%;transform:translateY(-50%);width:11px;height:11px;border-radius:50%;background:#fff;opacity:0;transition:opacity .15s;}
        .seek-track:hover .seek-fill::after{opacity:1;}
        .bar{width:3px;border-radius:2px;background:${accentColor};}
        .bar:nth-child(1){animation:barPulse .65s ease-in-out 0.00s infinite}
        .bar:nth-child(2){animation:barPulse .65s ease-in-out 0.20s infinite}
        .bar:nth-child(3){animation:barPulse .65s ease-in-out 0.10s infinite}
        .bar:nth-child(4){animation:barPulse .65s ease-in-out 0.30s infinite}
        @media(max-width:480px){.tilt-wrapper{max-width:100%!important;padding:0 12px;}}
        .badge-tooltip{position:absolute;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);background:rgba(10,10,10,0.92);border:1px solid rgba(255,255,255,0.1);color:#fff;font-size:11px;font-weight:700;padding:3px 8px;border-radius:6px;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity .15s;}
        .badge-pill:hover .badge-tooltip{opacity:1;}
        .uid-hover-wrap:hover .uid-tooltip{opacity:1!important;}
      `}</style>

      {/* Background */}
      {bgUrl && (bgUrl.match(/\.(mp4|webm|ogg|mov)$/i)
        ? <video src={bgUrl} className="bg-img" autoPlay loop muted playsInline style={{filter:blur>0?`blur(${blur}px)`:'',opacity:opacity/100}} />
        : <img src={bgUrl} className="bg-img" alt="" style={{filter:blur>0?`blur(${blur}px)`:'',opacity:opacity/100}} />
      )}
      <div className="bg-overlay" style={overlayStyle} />

      {/* Particles */}
      {(bgFx==='particles'||(particleEnabled&&particleStyle==='Dots')) && <div className="fx-layer">{Array.from({length:20}).map((_,i)=><div key={i} style={{position:'absolute',left:`${Math.random()*100}%`,width:`${2+Math.random()*4}px`,height:`${2+Math.random()*4}px`,borderRadius:'50%',background:`${accentColor}${Math.round((0.3+Math.random()*0.5)*255).toString(16).padStart(2,'00')}`,animation:`floatParticle ${4+Math.random()*6}s linear ${Math.random()*5}s infinite`,bottom:'-10px'}} />)}</div>}
      {particleEnabled&&particleStyle==='Stars' && <div className="fx-layer">{Array.from({length:25}).map((_,i)=><div key={i} style={{position:'absolute',left:`${Math.random()*100}%`,bottom:`${Math.random()*20}%`,fontSize:`${8+Math.random()*12}px`,color:accentColor,opacity:0.6,animation:`starFloat ${5+Math.random()*8}s linear ${Math.random()*6}s infinite`}}>★</div>)}</div>}
      {particleEnabled&&particleStyle==='Bubbles' && <div className="fx-layer">{Array.from({length:15}).map((_,i)=><div key={i} style={{position:'absolute',left:`${Math.random()*100}%`,bottom:'-20px',width:`${10+Math.random()*20}px`,height:`${10+Math.random()*20}px`,borderRadius:'50%',border:`1px solid ${accentColor}88`,animation:`bubbleRise ${4+Math.random()*6}s ease-in ${Math.random()*5}s infinite`}} />)}</div>}
      {particleEnabled&&particleStyle==='Fireflies' && <div className="fx-layer">{Array.from({length:20}).map((_,i)=><div key={i} style={{position:'absolute',left:`${Math.random()*90}%`,top:`${Math.random()*90}%`,width:4,height:4,borderRadius:'50%',background:accentColor,boxShadow:`0 0 6px ${accentColor}`,animation:`firefly ${3+Math.random()*4}s ease-in-out ${Math.random()*4}s infinite`}} />)}</div>}
      {bgFx==='rain' && <div className="fx-layer">{Array.from({length:40}).map((_,i)=><div key={i} style={{position:'absolute',left:`${Math.random()*100}%`,top:0,width:'1px',height:`${15+Math.random()*25}px`,background:'linear-gradient(180deg,transparent,rgba(130,170,255,0.5))',animation:`rainDrop ${0.5+Math.random()}s linear ${Math.random()*2}s infinite`}} />)}</div>}
      {bgFx==='snow' && <div className="fx-layer">{Array.from({length:30}).map((_,i)=><div key={i} style={{position:'absolute',left:`${Math.random()*100}%`,top:'-10px',width:`${3+Math.random()*5}px`,height:`${3+Math.random()*5}px`,borderRadius:'50%',background:'rgba(255,255,255,0.8)',animation:`snowFlake ${3+Math.random()*5}s linear ${Math.random()*4}s infinite`}} />)}</div>}
      {bgFx==='matrix' && <div className="fx-layer" style={{fontFamily:'monospace',fontSize:14}}>{Array.from({length:15}).map((_,i)=><div key={i} style={{position:'absolute',left:`${(i/15)*100}%`,top:`${Math.random()*100}%`,color:'#00ff41',opacity:0.3,animation:`matrixChar ${1+Math.random()*2}s ease-in-out ${Math.random()*2}s infinite`}}>{String.fromCharCode(0x30A0+Math.floor(Math.random()*96))}</div>)}</div>}

      {/* Tilt wrapper */}
      <div ref={tiltRef} className="tilt-wrapper" onMouseMove={onTiltMove} onMouseLeave={onTiltLeave}
        style={{width:'100%',maxWidth:panelMaxW,perspective:'800px',perspectiveOrigin:'center center',position:'relative',zIndex:2}}>
        <div className="profile-outer" style={{...entranceAnimStyle,transform:`rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,transition:'transform 0.12s ease-out',transformOrigin:'center center',willChange:'transform'}}>

          {/* Avatar */}
          {showAvatarPref && (
            <div className="profile-avatar-float" style={{alignSelf:alignItems==='flex-start'?'flex-start':alignItems==='flex-end'?'flex-end':'center',marginLeft:avatarPos==='left'?28:0,marginRight:avatarPos==='right'?28:0}}>
              <div className="avatar-ring" style={{width:90,height:90,background:`linear-gradient(135deg,${accentColor},${accentColor}66)`,boxShadow:`0 0 0 4px rgba(10,10,10,0.6),0 4px 20px ${accentColor}44`}}>
                <div className="avatar-inner" style={{background:'#0a0a0a',color:accentColor}}>
                  {avatarUrl?<img src={avatarUrl} alt={profile.username} />:initial}
                </div>
              </div>
            </div>
          )}

          {/* Main panel */}
          <div className="profile-panel" style={{alignItems,position:'relative',paddingTop:showAvatarPref?64:28}}>

            {/* Name */}
            <div style={{position:'relative',display:'inline-block'}} className="uid-hover-wrap">
              <div style={{fontSize:22,fontWeight:900,letterSpacing:'-0.5px',marginBottom:4,textAlign,cursor:'default',...nameStyle}}>
                {displayName||`@${profile.username}`}
              </div>
              {profile.id && (
                <div className="uid-tooltip" style={{position:'absolute',left:'50%',top:'110%',transform:'translateX(-50%)',background:'rgba(10,10,10,0.92)',border:`1px solid ${accentColor}44`,borderRadius:8,padding:'4px 10px',fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.6)',whiteSpace:'nowrap',pointerEvents:'none',zIndex:10,backdropFilter:'blur(8px)',opacity:0,transition:'opacity .15s'}}>
                  UID {profile.id}
                </div>
              )}
            </div>

            {displayName && <div style={{fontSize:12,color:'rgba(255,255,255,0.3)',fontWeight:600,marginBottom:6,textAlign}}>@{profile.username}</div>}

            {badgePosition==='below_username' && badgeStrip}

            {/* View count */}
            {viewCount!==null && (
              <div style={{position:'absolute',top:14,right:16,display:'flex',alignItems:'center',gap:4,fontSize:11,color:'rgba(255,255,255,0.3)',fontWeight:600,userSelect:'none'}}>
                <svg width="12" height="12" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <span>{viewCount>=1000?`${(viewCount/1000).toFixed(1)}k`:viewCount}</span>
              </div>
            )}

            {/* Bio */}
            {profile.bio && (
              <div style={{fontSize:13,color:'rgba(255,255,255,0.5)',fontWeight:600,textAlign,lineHeight:1.6,marginBottom:12,minHeight:'1.6em'}}>
                {typingBio?bioDisplayed:profile.bio}
                {typingBio && <span style={{borderRight:`2px solid ${accentColor}`,marginLeft:1,animation:'cursorBlink 0.8s step-end infinite'}} />}
              </div>
            )}

            {badgePosition==='below_bio' && badgeStrip}

            {/* Location */}
            {location && (
              <div style={{fontSize:12,color:'rgba(255,255,255,0.3)',fontWeight:600,display:'flex',alignItems:'center',gap:5,marginBottom:16,alignSelf:alignItems}}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                {location}
              </div>
            )}

            {(links.length>0||btns.length>0||widgets.length>0) && <div style={{width:'100%',height:1,background:'rgba(255,255,255,0.06)',margin:'8px 0 16px'}} />}

            {badgePosition==='above_links' && badgeStrip}

            {/* Social links */}
            {links.length>0 && (
              <div style={{width:'100%',display:'flex',flexWrap:'wrap',gap:16,justifyContent:textAlign==='center'?'center':textAlign==='right'?'flex-end':'flex-start'}}>
                {links.map((link,i)=>{
                  const p = link.platform||{id:'custom',name:link.title,color:'#e03030'}
                  const ABBR = {discord:'Di',twitter:'X',github:'Gh',gitlab:'Gl',instagram:'Ig',facebook:'Fb',spotify:'Sp',soundcloud:'Sc',applemusic:'♪',youtube:'Yt',twitch:'Tv',tiktok:'Tt',snapchat:'Sn',linkedin:'Li',reddit:'Re',telegram:'Tg',bluesky:'Bs',vk:'VK',pinterest:'Pi',dribbble:'Dr',deviantart:'Da',steam:'St',itchio:'It',kickstarter:'Ks',patreon:'Pa',kofi:'Ko',buymeacoffee:'Bm',paypal:'Pp',bitcoin:'₿',ethereum:'Ξ',solana:'◎',roblox:'R',email:'✉',custom:'✦'}
                  const LIGHT = new Set(['snapchat','buymeacoffee','bitcoin'])
                  const abbr = ABBR[p.id]||p.name?.[0]||'?'
                  const tc   = LIGHT.has(p.id)?'#1a1a1a':'#fff'
                  return (
                    <a key={i} href={link.url||'#'} target="_blank" rel="noopener noreferrer"
                      style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6,cursor:'pointer',textDecoration:'none',width:Math.max(iconSize,48)}}>
                      <div style={{width:iconSize,height:iconSize,borderRadius:Math.round(iconSize*0.27),background:link.iconDataUrl?'transparent':p.color,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:link.iconDataUrl?'none':glowState.socials?`0 4px 16px ${p.color}88`:`0 4px 16px ${p.color}55`,transition:'transform .15s',overflow:'hidden',flexShrink:0}}
                        onMouseEnter={e=>e.currentTarget.style.transform='scale(1.1)'}
                        onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
                        {link.iconDataUrl ? <img src={link.iconDataUrl} alt="icon" style={{width:'100%',height:'100%',objectFit:'contain'}} />
                          : p.id==='email' ? <svg width="55%" height="55%" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
                          : SIMPLE_ICONS[p.id] ? <img src={`https://cdn.simpleicons.org/${SIMPLE_ICONS[p.id]}/ffffff`} alt={p.name} style={{width:'55%',height:'55%',objectFit:'contain'}} />
                          : <span style={{fontSize:14,fontWeight:800,color:tc}}>{abbr}</span>}
                      </div>
                      {showLinkLabels && <span style={{fontSize:10,color:'rgba(255,255,255,0.45)',textAlign:'center',lineHeight:1.3,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:Math.max(iconSize,48)}}>{link.title||p.name}</span>}
                    </a>
                  )
                })}
              </div>
            )}

            {/* CTA buttons */}
            {btns.length>0 && (
              <div style={{width:'100%',display:'flex',flexDirection:'column',gap:8,marginTop:links.length>0?8:0}}>
                {btns.map((btn,i)=>(
                  <a key={i} href={btn.url} className="action-btn" target="_blank" rel="noopener noreferrer"
                    style={{background:accentColor,color:'#fff',boxShadow:`0 4px 20px ${accentColor}44`}}>{btn.label}</a>
                ))}
              </div>
            )}

            {/* ── WIDGETS ── */}
            {widgets.length>0 && (
              <div style={{width:'100%',display:'flex',flexDirection:'column',gap:10,marginTop:(links.length>0||btns.length>0)?12:0}}>
                {widgets.map((w,i)=>(
                  <ProfileWidget key={i} widget={w} accentColor={accentColor} bgRgb={bgRgb} panelOpacity={panelOpacity} panelBlur={panelBlur} />
                ))}
              </div>
            )}

            {links.length===0&&btns.length===0&&widgets.length===0 && <div style={{fontSize:13,color:'rgba(255,255,255,0.15)',fontWeight:600,marginTop:4}}>No links yet.</div>}

            <div className="footer" style={{alignSelf:'center',marginTop:20}}>powered by <a href="/">fate.rip</a></div>
          </div>

          {/* Music player */}
          {audioSrc&&music.showPlayer!==false && (
            <div className="music-player" style={{marginTop:10,background:`rgba(${bgRgb},${panelOpacity/100})`,border:`1px solid rgba(${accentRgb},0.10)`}} onClick={e=>e.stopPropagation()}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
                <div style={{minWidth:0,flex:1,paddingRight:12}}>
                  <div style={{fontSize:13,fontWeight:700,color:'#fff',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{trackTitle}</div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.35)',marginTop:1,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{trackArtist}</div>
                </div>
                {isPlaying && <div style={{display:'flex',alignItems:'flex-end',gap:2,height:14,flexShrink:0}}><div className="bar" style={{height:5}} /><div className="bar" style={{height:10}} /><div className="bar" style={{height:7}} /><div className="bar" style={{height:12}} /></div>}
              </div>
              <div className="seek-track" onClick={handleSeek}><div className="seek-fill" style={{width:`${progress}%`}} /></div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span style={{fontSize:11,color:'rgba(255,255,255,0.35)',fontVariantNumeric:'tabular-nums',minWidth:30}}>{fmt2(currentTime)}</span>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <button className="music-ctrl" onClick={e=>{e.stopPropagation();if(audioRef.current)audioRef.current.currentTime=0}} title="Restart"><svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg></button>
                  <button className="music-play" onClick={togglePlay} title={isPlaying?'Pause':'Play'}>{isPlaying?<svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>:<svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>}</button>
                  <button className="music-ctrl" onClick={e=>{e.stopPropagation();if(audioRef.current&&duration)audioRef.current.currentTime=Math.max(0,duration-0.1)}} title="Skip"><svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z"/></svg></button>
                </div>
                <span style={{fontSize:11,color:'rgba(255,255,255,0.35)',fontVariantNumeric:'tabular-nums',minWidth:30,textAlign:'right'}}>{fmt2(duration)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}