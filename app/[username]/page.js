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

export default function ProfilePage() {
  const params = useParams()
  const username = params?.username
  const [profile, setProfile]     = useState(null)
  const [notFound, setNotFound]   = useState(false)
  const [loading, setLoading]     = useState(true)
  const [entered, setEntered]     = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [viewCount, setViewCount] = useState(null)
  const audioRef = useRef(null)

  const spawnClickEffect = useCallback((e, type) => {
    if (type === 'None' || !type) return
    const symbols = { Sparks:['✦','✧','⋆'], Hearts:['♥','❤','💕'], Stars:['★','✦','✧'], Explosion:['💥','✦','●'], Ripple:['○','◎','●'] }
    const chars = symbols[type] || ['✦']
    for (let i = 0; i < 6; i++) {
      const el = document.createElement('div')
      el.textContent = chars[Math.floor(Math.random() * chars.length)]
      el.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;pointer-events:none;z-index:9999;font-size:${12+Math.random()*12}px;color:#e03030;animation:clickFly 0.8s ease-out forwards;`
      const angle = (i / 6) * 360 * (Math.PI / 180)
      const dist  = 30 + Math.random() * 40
      el.style.setProperty('--tx', `${Math.cos(angle)*dist}px`)
      el.style.setProperty('--ty', `${Math.sin(angle)*dist-20}px`)
      document.body.appendChild(el)
      setTimeout(() => el.remove(), 800)
    }
  }, [])

  useEffect(() => {
    if (!username) return
    const load = async () => {
      const { data, error } = await supabase.from('users').select('*').eq('username', username)
      if (error || !data || data.length === 0) setNotFound(true)
      else setProfile(data[0])
      setLoading(false)
    }
    load()
  }, [username])

  useEffect(() => {
    if (!username) return
    trackView(username)
    const fetchViews = async () => {
      await new Promise(r => setTimeout(r, 600))
      const { count } = await supabase.from('profile_views').select('*', { count: 'exact', head: true }).eq('username', username)
      setViewCount(count || 0)
    }
    fetchViews()
  }, [username])

  useEffect(() => {
    if (!profile) return
    let link = document.querySelector("link[rel~='icon']")
    if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link) }
    link.href = '/scythe.png'
    if (profile.cursor_url) {
      document.body.style.cursor = `url('${profile.cursor_url}'), auto`
    } else {
      const s = profile.settings || {}
      const cursorMap = { 'Dot':'crosshair','Ring':'cell','Crosshair':'crosshair','Arrow':'default','Default':'auto' }
      document.body.style.cursor = cursorMap[s.cursorStyle] || 'auto'
    }
    const fullText = `@${profile.username}`
    let i = 0, deleting = false, timeout
    const tick = () => {
      if (!deleting) {
        i++; document.title = fullText.slice(0, i)
        if (i === fullText.length) timeout = setTimeout(() => { deleting = true; timeout = setTimeout(tick, 200) }, 2500)
        else timeout = setTimeout(tick, 200)
      } else {
        i--; document.title = fullText.slice(0, i)
        if (i === 0) { deleting = false; timeout = setTimeout(tick, 1200) }
        else timeout = setTimeout(tick, 120)
      }
    }
    timeout = setTimeout(tick, 1200)
    return () => { clearTimeout(timeout); document.body.style.cursor = '' }
  }, [profile])

  // Try silent autoplay on load (works if user has interacted with the page before)
  useEffect(() => {
    if (!profile) return
    const s   = profile.settings || {}
    const m   = s.music || {}
    const src = m.url || profile.audio_url
    if (!src) return
    // Wait for audio element to be ready
    const tryPlay = () => {
      if (audioRef.current) {
        audioRef.current.volume = 1
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
      }
    }
    const t = setTimeout(tryPlay, 300)
    return () => clearTimeout(t)
  }, [profile])

  // The entrance-screen click IS a user gesture — safe to play audio here
  const handleEnter = useCallback(() => {
    setEntered(true)
    // Delay slightly so React finishes re-rendering before we call play()
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.volume = 1
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
      }
    }, 100)
  }, [])

  if (loading) return (
    <div style={{ background:'#080808', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ color:'#333', fontFamily:'sans-serif', fontSize:14, fontWeight:700 }}>Loading...</div>
    </div>
  )

  if (notFound) return (
    <div style={{ background:'#080808', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'sans-serif' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:64, fontWeight:900, color:'#fff', lineHeight:1 }}>404</div>
        <div style={{ fontSize:15, color:'#444', margin:'10px 0 28px', fontWeight:600 }}>This profile doesn&apos;t exist.</div>
        <a href="/" style={{ color:'#CC0000', fontWeight:800, fontSize:13, textDecoration:'none', background:'rgba(204,0,0,0.1)', padding:'10px 20px', borderRadius:999, border:'1px solid rgba(204,0,0,0.2)' }}>← Back to fate.rip</a>
      </div>
    </div>
  )

  const settings       = profile.settings || {}
  const fontFamily     = settings.font || 'Nunito'
  const accentColor    = settings.accentColor || '#CC0000'
  const bgColor        = settings.bgColor || '#080808'
  const glowIntensity  = settings.glowIntensity !== undefined ? settings.glowIntensity : 50
  const particleEnabled = settings.particleEnabled || false
  const particleStyle  = settings.particleStyle || 'Dots'
  const clickEffect    = settings.clickEffect || 'None'
  const entranceAnim   = settings.entranceAnim || 'Fade In'
  const music          = settings.music || {}
  const layout         = settings.layout || {}
  const entrance       = settings.entrance || {}
  const btns           = Array.isArray(settings.buttons) ? settings.buttons : []
  const typingBio      = layout.typingBio || false
  const showAvatarPref = layout.showAvatar !== false
  const avatarPos      = layout.avatarPos || 'center'
  const panelSize      = layout.panelSize || 'medium'
  const entranceEnabled = entrance.enabled !== false
  const panelMaxW      = { compact:380, medium:480, wide:580, full:680 }[panelSize] || 480
  const iconSize       = settings.iconSize || 44
  const initial        = profile.username[0].toUpperCase()
  const links          = Array.isArray(profile.links) ? profile.links : []
  const opacity        = profile.opacity ?? 100
  const blur           = profile.blur ?? 0
  const usernameFx     = profile.username_fx || ''
  const bgFx           = profile.bg_fx || 'none'
  const location       = profile.location || ''
  const glowState      = profile.glow_settings || { username:true, socials:true, badges:false }
  const avatarUrl      = profile.avatar_url || null
  const bgUrl          = profile.bg_url || null
  const displayName    = profile.display_name || ''
  const audioSrc       = music.url || profile.audio_url || null
  const fontQuery      = FONT_MAP[fontFamily] || FONT_MAP['Nunito']
  const glowAlpha      = glowIntensity / 100

  const nameStyle = (() => {
    if (usernameFx === 'rainbow') return { background:'linear-gradient(90deg,#ff0,#0f0,#0ff,#f0f,#f00)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }
    if (usernameFx === 'gold')    return { background:'linear-gradient(90deg,#b8860b,#ffd700,#b8860b)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }
    if (usernameFx === 'neon')    return { color:accentColor, textShadow:`0 0 12px ${accentColor}dd, 0 0 24px ${accentColor}66` }
    if (usernameFx === 'glitch')  return { color:'#fff', animation:'glitch 0.4s infinite' }
    if (glowState.username)       return { color:'#fff', textShadow:`0 0 ${12+glowIntensity*0.2}px ${accentColor}${Math.round(glowAlpha*99).toString(16).padStart(2,'0')}` }
    return { color:'#fff' }
  })()

  const overlayStyle = (() => {
    if (bgFx === 'nighttime') return { background:'linear-gradient(180deg,rgba(5,5,12,0.5) 0%,rgba(20,0,40,0.6) 100%)' }
    if (bgFx === 'particles') return { background:`radial-gradient(circle at 20% 80%,${accentColor}33 0%,transparent 50%),radial-gradient(circle at 80% 20%,${accentColor}1a 0%,transparent 40%)` }
    if (bgFx === 'matrix')    return { background:'linear-gradient(180deg,rgba(0,30,10,0.6) 0%,rgba(0,60,20,0.3) 100%)' }
    if (bgFx === 'rain')      return { background:'linear-gradient(180deg,rgba(0,10,40,0.6) 0%,rgba(0,20,80,0.3) 100%)' }
    if (bgFx === 'snow')      return { background:'linear-gradient(180deg,rgba(200,220,255,0.08) 0%,rgba(180,200,255,0.12) 100%)' }
    return {}
  })()

  const entranceAnimStyle = (() => {
    if (!entered) return {}
    if (entranceAnim === 'Slide Up') return { animation:'slideUp 0.5s ease forwards' }
    if (entranceAnim === 'Zoom In')  return { animation:'zoomIn 0.4s ease forwards' }
    if (entranceAnim === 'Glitch')   return { animation:'glitchIn 0.5s ease forwards' }
    return { animation:'fadeIn 0.4s ease forwards' }
  })()

  // ── Entrance screen ───────────────────────────────────────────────────────────
  if (!entered && entranceEnabled) {
    const enterTitle    = entrance.title    || profile.username
    const enterSubtitle = entrance.subtitle || 'Click anywhere to enter'
    const showAvtr      = entrance.showAvatar   !== false
    const showTtl       = entrance.showTitle    !== false
    const showSub       = entrance.showSubtitle !== false
    return (
      <div onClick={handleEnter} style={{ background:bgColor, minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', position:'relative', overflow:'hidden', fontFamily:`'${fontFamily}', sans-serif` }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=${fontQuery}&display=swap');`}</style>
        {bgUrl && (bgUrl.match(/\.(mp4|webm|ogg|mov)$/i)
          ? <video src={bgUrl} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:opacity/100, filter:blur>0?`blur(${blur}px)`:'none' }} autoPlay loop muted playsInline />
          : <img src={bgUrl} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:opacity/100, filter:blur>0?`blur(${blur}px)`:'none' }} />
        )}
        <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.55)', zIndex:1 }} />
        <div style={{ position:'relative', zIndex:2, display:'flex', flexDirection:'column', alignItems:'center', gap:16, textAlign:'center', padding:'0 24px', animation:'entrancePulse 2s ease-in-out infinite' }}>
          {showAvtr && avatarUrl  && <div style={{ width:88, height:88, borderRadius:'50%', border:`3px solid ${accentColor}88`, overflow:'hidden', marginBottom:4 }}><img src={avatarUrl} alt={profile.username} style={{ width:'100%', height:'100%', objectFit:'cover' }} /></div>}
          {showAvtr && !avatarUrl && <div style={{ width:88, height:88, borderRadius:'50%', background:`${accentColor}22`, border:`3px solid ${accentColor}88`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, fontWeight:900, color:accentColor }}>{initial}</div>}
          {showTtl && <div style={{ fontSize:28, fontWeight:900, color:'#fff', letterSpacing:'-0.5px' }}>{enterTitle}</div>}
          {showSub && <div style={{ fontSize:14, color:'rgba(255,255,255,0.5)', fontWeight:600 }}>{enterSubtitle}</div>}
          <div style={{ marginTop:8, width:32, height:2, borderRadius:1, background:accentColor, animation:'lineGrow 1.5s ease-in-out infinite' }} />
        </div>
        <style>{`
          @keyframes entrancePulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.02)} }
          @keyframes lineGrow { 0%,100%{width:32px;opacity:0.5} 50%{width:64px;opacity:1} }
        `}</style>
      </div>
    )
  }

  return (
    <>
      {/* Audio lives here — always mounted, never unmounts between entrance/profile screens */}
      {audioSrc && <audio ref={audioRef} src={audioSrc} loop preload="auto" style={{ display:'none' }} />}
      <ProfileContent
        profile={profile} fontFamily={fontFamily} fontQuery={fontQuery}
      accentColor={accentColor} bgColorSetting={bgColor} glowIntensity={glowIntensity}
      particleEnabled={particleEnabled} particleStyle={particleStyle} clickEffect={clickEffect}
      music={music} btns={btns} typingBio={typingBio}
      showAvatarPref={showAvatarPref} avatarPos={avatarPos} panelMaxW={panelMaxW}
      initial={initial} links={links} opacity={opacity} blur={blur} usernameFx={usernameFx}
      bgFx={bgFx} location={location} glowState={glowState} avatarUrl={avatarUrl} bgUrl={bgUrl}
      displayName={displayName} audioSrc={audioSrc} nameStyle={nameStyle} overlayStyle={overlayStyle}
      entranceAnimStyle={entranceAnimStyle} audioRef={audioRef} isPlaying={isPlaying}
      setIsPlaying={setIsPlaying} spawnClickEffect={spawnClickEffect}
      iconSize={iconSize} viewCount={viewCount}
    />
    </>
  )
}

// ─── Profile Content ───────────────────────────────────────────────────────────
function ProfileContent({
  profile, fontFamily, fontQuery, accentColor, bgColorSetting,
  glowIntensity, particleEnabled, particleStyle, clickEffect,
  music, btns, typingBio, showAvatarPref, avatarPos, panelMaxW,
  initial, links, opacity, blur, bgFx, location, glowState,
  avatarUrl, bgUrl, displayName, audioSrc, nameStyle, overlayStyle,
  entranceAnimStyle, audioRef, isPlaying, setIsPlaying, spawnClickEffect,
  viewCount, iconSize,
}) {
  const bioDisplayed = useTypewriter(profile.bio || '', typingBio)
  const hexToRgb = (hex) => {
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)
  return `${r},${g},${b}`
}
const accentRgb = hexToRgb(accentColor || '#CC0000')
const bgRgb = hexToRgb(bgColorSetting || '#080808')
  const alignItems   = avatarPos === 'left' ? 'flex-start' : avatarPos === 'right' ? 'flex-end' : 'center'
  const textAlign    = avatarPos === 'left' ? 'left'       : avatarPos === 'right' ? 'right'    : 'center'
  const handleClick  = (e) => { if (clickEffect !== 'None') spawnClickEffect(e, clickEffect) }

  // Music player state
  const [currentTime, setCurrentTime] = useState(0)
  const [duration,    setDuration]    = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTime    = () => setCurrentTime(audio.currentTime)
    const onMeta    = () => setDuration(isNaN(audio.duration) ? 0 : audio.duration)
    const onPlay    = () => setIsPlaying(true)
    const onPause   = () => setIsPlaying(false)
    audio.addEventListener('timeupdate',     onTime)
    audio.addEventListener('durationchange', onMeta)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('play',  onPlay)
    audio.addEventListener('pause', onPause)
    return () => {
      audio.removeEventListener('timeupdate',     onTime)
      audio.removeEventListener('durationchange', onMeta)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('play',  onPlay)
      audio.removeEventListener('pause', onPause)
    }
  }, [audioRef, setIsPlaying])

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00'
    return `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,'0')}`
  }

  const togglePlay = (e) => {
    e.stopPropagation()
    if (!audioRef.current) return
    audioRef.current.paused
      ? audioRef.current.play().catch(()=>{})
      : audioRef.current.pause()
  }

  const handleSeek = (e) => {
    e.stopPropagation()
    if (!audioRef.current || !duration) return
    const rect  = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    audioRef.current.currentTime = ratio * duration
  }

  const restart = (e) => {
    e.stopPropagation()
    if (audioRef.current) audioRef.current.currentTime = 0
  }

  const skipEnd = (e) => {
    e.stopPropagation()
    if (audioRef.current && duration) audioRef.current.currentTime = Math.max(0, duration - 0.1)
  }

  const progress      = duration ? (currentTime / duration) * 100 : 0
  const trackTitle    = music.showTitle !== false ? (music.title || music.musicTitle || 'Unknown') : ''
  const trackArtist   = music.showArtist !== false ? (music.artist || music.musicArtist || 'Unknown') : ''

  return (
    <div onClick={handleClick} style={{ background:bgColorSetting, minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:`'${fontFamily}', sans-serif`, padding:'40px 16px', position:'relative', overflow:'hidden' }}>
      <link rel="icon" href="/scythe.png" />
      {/* NOTE: No <audio> tag here — it lives in the entrance screen so autoplay works on click */}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=${fontQuery}&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        @keyframes glitch { 0%,100%{text-shadow:2px 0 #ff0000,-2px 0 #0000ff} 25%{text-shadow:-2px 0 #ff0000,2px 0 #0000ff} 50%{text-shadow:2px 2px #ff0000,-2px -2px #0000ff} 75%{text-shadow:-2px 2px #ff0000,2px -2px #0000ff} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes slideUp  { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes zoomIn   { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
        @keyframes glitchIn { 0%{opacity:0;transform:skewX(-10deg)} 30%{transform:skewX(5deg)} 60%{transform:skewX(-2deg)} 100%{opacity:1;transform:skewX(0)} }
        @keyframes floatParticle { 0%{transform:translateY(100vh) scale(0);opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{transform:translateY(-10vh) scale(1);opacity:0} }
        @keyframes rainDrop  { 0%{transform:translateY(-10px);opacity:0} 10%{opacity:0.6} 100%{transform:translateY(100vh);opacity:0} }
        @keyframes snowFlake { 0%{transform:translateY(-10px) translateX(0);opacity:0} 10%{opacity:0.8} 50%{transform:translateY(50vh) translateX(20px)} 100%{transform:translateY(100vh) translateX(-10px);opacity:0} }
        @keyframes matrixChar { 0%{opacity:0;transform:translateY(-20px)} 50%{opacity:1} 100%{opacity:0;transform:translateY(20px)} }
        @keyframes starFloat  { 0%{transform:translateY(0) rotate(0deg);opacity:0} 20%{opacity:1} 80%{opacity:1} 100%{transform:translateY(-80vh) rotate(360deg);opacity:0} }
        @keyframes bubbleRise { 0%{transform:translateY(100vh) scale(0.5);opacity:0} 10%{opacity:0.7} 100%{transform:translateY(-20px) scale(1);opacity:0} }
        @keyframes firefly   { 0%,100%{transform:translate(0,0);opacity:0.2} 25%{transform:translate(20px,-30px);opacity:1} 50%{transform:translate(-10px,-60px);opacity:0.5} 75%{transform:translate(30px,-40px);opacity:0.8} }
        @keyframes clickFly  { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(var(--tx),var(--ty)) scale(0);opacity:0} }
        @keyframes barPulse  { 0%,100%{transform:scaleY(0.3)} 50%{transform:scaleY(1)} }
        .profile-outer { display:flex; flex-direction:column; align-items:center; position:relative; z-index:2; }
        .profile-avatar-float { position:relative; z-index:3; margin-bottom:-46px; }
        .profile-panel { width:100%; background:rgba(${bgRgb},0.5); backdrop-filter:blur(24px) saturate(160%); -webkit-backdrop-filter:blur(24px) saturate(160%); border:1px solid rgba(255,255,255,0.08); border-radius:24px; padding:64px 28px 28px; display:flex; flex-direction:column; box-shadow:0 8px 40px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.06); }
        .avatar-ring  { border-radius:50%; padding:3px; flex-shrink:0; }
        .avatar-inner { width:100%; height:100%; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:34px; font-weight:900; overflow:hidden; }
        .avatar-inner img { width:100%; height:100%; object-fit:cover; border-radius:50%; }
        .action-btn { width:100%; padding:12px 20px; border-radius:14px; font-family:inherit; font-size:14px; font-weight:700; text-align:center; text-decoration:none; transition:all 0.2s; display:flex; align-items:center; justify-content:center; cursor:pointer; border:none; }
        .action-btn:hover { transform:translateY(-2px); filter:brightness(1.1); }
        .footer { margin-top:36px; font-size:12px; color:#252525; font-weight:700; letter-spacing:0.5px; display:flex; align-items:center; gap:6px; }
        .footer a { color:${accentColor}; text-decoration:none; opacity:0.7; transition:opacity 0.15s; }
        .footer a:hover { opacity:1; }
        .bg-img     { position:fixed; inset:0; width:100%; height:100%; object-fit:cover; z-index:0; }
        .bg-overlay { position:fixed; inset:0; z-index:1; pointer-events:none; }
        .fx-layer   { position:fixed; inset:0; z-index:1; pointer-events:none; overflow:hidden; }

        /* ── Music Player ───────────────────────────────────────────── */
        .music-player {
          width: 100%;
          background: rgba(10,10,10,0.55);
          backdrop-filter: blur(24px) saturate(160%);
          -webkit-backdrop-filter: blur(24px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          padding: 16px 20px 14px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05);
        }
        .music-ctrl {
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.5); padding: 4px;
          display: flex; align-items: center; justify-content: center;
          transition: color .15s, transform .15s; border-radius: 50%;
        }
        .music-ctrl:hover { color: #fff; transform: scale(1.18); }
        .music-play {
          width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.12);
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          color: #fff; transition: background .15s, transform .15s;
        }
        .music-play:hover { background: rgba(255,255,255,0.2); transform: scale(1.1); }
        .seek-track {
          width: 100%; height: 3px; background: rgba(255,255,255,0.1);
          border-radius: 99px; cursor: pointer; margin: 10px 0 6px;
          transition: height .15s;
          position: relative;
        }
        .seek-track:hover { height: 5px; margin: 9px 0 5px; }
        .seek-fill {
          height: 100%; border-radius: 99px; pointer-events: none;
          background: ${accentColor}; position: relative;
        }
        .seek-fill::after {
          content:''; position:absolute; right:-5px; top:50%;
          transform:translateY(-50%); width:11px; height:11px;
          border-radius:50%; background:#fff; opacity:0; transition:opacity .15s;
        }
        .seek-track:hover .seek-fill::after { opacity:1; }
        .bar { width:3px; border-radius:2px; background:${accentColor}; }
        .bar:nth-child(1){animation:barPulse .65s ease-in-out 0.00s infinite}
        .bar:nth-child(2){animation:barPulse .65s ease-in-out 0.20s infinite}
        .bar:nth-child(3){animation:barPulse .65s ease-in-out 0.10s infinite}
        .bar:nth-child(4){animation:barPulse .65s ease-in-out 0.30s infinite}

        @media(max-width:480px){ .profile-outer{max-width:100%!important;padding:0 12px;} }
      `}</style>

      {bgUrl && (bgUrl.match(/\.(mp4|webm|ogg|mov)$/i)
        ? <video src={bgUrl} className="bg-img" autoPlay loop muted playsInline style={{ filter:blur>0?`blur(${blur}px)`:'none' }} />
        : <img src={bgUrl} className="bg-img" alt="" style={{ filter:blur>0?`blur(${blur}px)`:'none' }} />
      )}
      <div className="bg-overlay" style={overlayStyle} />

      {/* Particles */}
      {(bgFx === 'particles' || (particleEnabled && particleStyle === 'Dots')) && (
        <div className="fx-layer">
          {Array.from({length:20}).map((_,i) => (
            <div key={i} style={{ position:'absolute', left:`${Math.random()*100}%`, width:`${2+Math.random()*4}px`, height:`${2+Math.random()*4}px`, borderRadius:'50%', background:`${accentColor}${Math.round((0.3+Math.random()*0.5)*255).toString(16).padStart(2,'00')}`, animation:`floatParticle ${4+Math.random()*6}s linear ${Math.random()*5}s infinite`, bottom:'-10px' }} />
          ))}
        </div>
      )}
      {particleEnabled && particleStyle === 'Stars' && (
        <div className="fx-layer">
          {Array.from({length:25}).map((_,i) => (
            <div key={i} style={{ position:'absolute', left:`${Math.random()*100}%`, bottom:`${Math.random()*20}%`, fontSize:`${8+Math.random()*12}px`, color:accentColor, opacity:0.6, animation:`starFloat ${5+Math.random()*8}s linear ${Math.random()*6}s infinite` }}>★</div>
          ))}
        </div>
      )}
      {particleEnabled && particleStyle === 'Bubbles' && (
        <div className="fx-layer">
          {Array.from({length:15}).map((_,i) => (
            <div key={i} style={{ position:'absolute', left:`${Math.random()*100}%`, bottom:'-20px', width:`${10+Math.random()*20}px`, height:`${10+Math.random()*20}px`, borderRadius:'50%', border:`1px solid ${accentColor}88`, animation:`bubbleRise ${4+Math.random()*6}s ease-in ${Math.random()*5}s infinite` }} />
          ))}
        </div>
      )}
      {particleEnabled && particleStyle === 'Fireflies' && (
        <div className="fx-layer">
          {Array.from({length:20}).map((_,i) => (
            <div key={i} style={{ position:'absolute', left:`${Math.random()*90}%`, top:`${Math.random()*90}%`, width:4, height:4, borderRadius:'50%', background:accentColor, boxShadow:`0 0 6px ${accentColor}`, animation:`firefly ${3+Math.random()*4}s ease-in-out ${Math.random()*4}s infinite` }} />
          ))}
        </div>
      )}
      {bgFx === 'rain' && (
        <div className="fx-layer">
          {Array.from({length:40}).map((_,i) => (
            <div key={i} style={{ position:'absolute', left:`${Math.random()*100}%`, top:0, width:'1px', height:`${15+Math.random()*25}px`, background:'linear-gradient(180deg,transparent,rgba(130,170,255,0.5))', animation:`rainDrop ${0.5+Math.random()}s linear ${Math.random()*2}s infinite` }} />
          ))}
        </div>
      )}
      {bgFx === 'snow' && (
        <div className="fx-layer">
          {Array.from({length:30}).map((_,i) => (
            <div key={i} style={{ position:'absolute', left:`${Math.random()*100}%`, top:'-10px', width:`${3+Math.random()*5}px`, height:`${3+Math.random()*5}px`, borderRadius:'50%', background:'rgba(255,255,255,0.8)', animation:`snowFlake ${3+Math.random()*5}s linear ${Math.random()*4}s infinite` }} />
          ))}
        </div>
      )}
      {bgFx === 'matrix' && (
        <div className="fx-layer" style={{ fontFamily:'monospace', fontSize:14 }}>
          {Array.from({length:15}).map((_,i) => (
            <div key={i} style={{ position:'absolute', left:`${(i/15)*100}%`, top:`${Math.random()*100}%`, color:'#00ff41', opacity:0.3, animation:`matrixChar ${1+Math.random()*2}s ease-in-out ${Math.random()*2}s infinite` }}>
              {String.fromCharCode(0x30A0+Math.floor(Math.random()*96))}
            </div>
          ))}
        </div>
      )}

      {/* ── Profile panel + music player stacked ─────────────────────────────── */}
      <div className="profile-outer" style={{ width:'100%', maxWidth:panelMaxW, opacity:opacity/100, ...entranceAnimStyle }}>

        {/* Floating avatar */}
        {showAvatarPref && (
          <div className="profile-avatar-float" style={{ alignSelf:alignItems==='flex-start'?'flex-start':alignItems==='flex-end'?'flex-end':'center', marginLeft:avatarPos==='left'?28:0, marginRight:avatarPos==='right'?28:0 }}>
            <div className="avatar-ring" style={{ width:90, height:90, background:`linear-gradient(135deg,${accentColor},${accentColor}66)`, boxShadow:`0 0 0 4px rgba(10,10,10,0.6),0 4px 20px ${accentColor}44` }}>
              <div className="avatar-inner" style={{ background:'#0a0a0a', color:accentColor }}>
                {avatarUrl ? <img src={avatarUrl} alt={profile.username} /> : initial}
              </div>
            </div>
          </div>
        )}

        {/* Main glass card */}
        <div className="profile-panel" style={{ alignItems, position:'relative', paddingTop:showAvatarPref?64:28 }}>

          <div style={{ position:'relative', display:'inline-block' }} className="uid-hover-wrap">
            <div style={{ fontSize:22, fontWeight:900, letterSpacing:'-0.5px', marginBottom:4, textAlign, cursor:'default', ...nameStyle }}>
              {displayName || `@${profile.username}`}
            </div>
            {profile.id && (
              <div className="uid-tooltip" style={{ position:'absolute', left:'50%', top:'110%', transform:'translateX(-50%)', background:'rgba(10,10,10,0.92)', border:`1px solid ${accentColor}44`, borderRadius:8, padding:'4px 10px', fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.6)', whiteSpace:'nowrap', pointerEvents:'none', zIndex:10, backdropFilter:'blur(8px)', opacity:0, transition:'opacity .15s' }}>
                UID {profile.id}
              </div>
            )}
          </div>

          {displayName && (
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', fontWeight:600, marginBottom:6, textAlign }}>@{profile.username}</div>
          )}

          {viewCount !== null && (
            <div style={{ position:'absolute', top:14, right:16, display:'flex', alignItems:'center', gap:4, fontSize:11, color:'rgba(255,255,255,0.3)', fontWeight:600, userSelect:'none' }}>
              <svg width="12" height="12" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              <span>{viewCount >= 1000 ? `${(viewCount/1000).toFixed(1)}k` : viewCount}</span>
            </div>
          )}

          {profile.bio && (
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.5)', fontWeight:600, textAlign, lineHeight:1.6, marginBottom:12, minHeight:'1.6em' }}>
              {typingBio ? bioDisplayed : profile.bio}
              {typingBio && <span style={{ borderRight:`2px solid ${accentColor}`, marginLeft:1, animation:'cursorBlink 0.8s step-end infinite' }} />}
            </div>
          )}

          {location && (
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', fontWeight:600, display:'flex', alignItems:'center', gap:5, marginBottom:16, alignSelf:alignItems }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
              {location}
            </div>
          )}

          {(links.length > 0 || btns.length > 0) && (
            <div style={{ width:'100%', height:1, background:'rgba(255,255,255,0.06)', margin:'8px 0 16px' }} />
          )}

          {links.length > 0 && (
            <div style={{ width:'100%', display:'flex', flexWrap:'wrap', gap:16, justifyContent:textAlign==='center'?'center':textAlign==='right'?'flex-end':'flex-start' }}>
              {links.map((link,i) => {
                const p = link.platform || { id:'custom', name:link.title, color:'#e03030' }
                const ABBR = { discord:'Di',twitter:'X',github:'Gh',gitlab:'Gl',instagram:'Ig',facebook:'Fb',spotify:'Sp',soundcloud:'Sc',applemusic:'♪',youtube:'Yt',twitch:'Tv',tiktok:'Tt',snapchat:'Sn',linkedin:'Li',reddit:'Re',telegram:'Tg',bluesky:'Bs',vk:'VK',pinterest:'Pi',dribbble:'Dr',deviantart:'Da',steam:'St',itchio:'It',kickstarter:'Ks',patreon:'Pa',kofi:'Ko',buymeacoffee:'Bm',paypal:'Pp',bitcoin:'₿',ethereum:'Ξ',solana:'◎',roblox:'R',email:'✉',custom:'✦' }
                const LIGHT = new Set(['snapchat','buymeacoffee','bitcoin'])
                const abbr = ABBR[p.id] || p.name?.[0] || '?'
                const tc   = LIGHT.has(p.id) ? '#1a1a1a' : '#fff'
                return (
                  <a key={i} href={link.url||'#'} target="_blank" rel="noopener noreferrer"
                    style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, cursor:'pointer', textDecoration:'none', width:Math.max(iconSize,48) }}>
                    <div style={{ width:iconSize, height:iconSize, borderRadius:Math.round(iconSize*0.27), background:link.iconDataUrl?'transparent':p.color, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:link.iconDataUrl?'none':glowState.socials?`0 4px 16px ${p.color}88`:`0 4px 16px ${p.color}55`, transition:'transform .15s', overflow:'hidden', flexShrink:0 }}
                      onMouseEnter={e=>e.currentTarget.style.transform='scale(1.1)'}
                      onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
                      {link.iconDataUrl
                        ? <img src={link.iconDataUrl} alt="icon" style={{ width:'100%', height:'100%', objectFit:'contain' }} />
                        : p.id==='email'
                          ? <svg width="55%" height="55%" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
                          : SIMPLE_ICONS[p.id]
                            ? <img src={`https://cdn.simpleicons.org/${SIMPLE_ICONS[p.id]}/ffffff`} alt={p.name} style={{ width:'55%', height:'55%', objectFit:'contain' }} />
                            : <span style={{ fontSize:14, fontWeight:800, color:tc }}>{abbr}</span>
                      }
                    </div>
                    <span style={{ fontSize:10, color:'rgba(255,255,255,0.45)', textAlign:'center', lineHeight:1.3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:Math.max(iconSize,48) }}>
                      {link.title || p.name}
                    </span>
                  </a>
                )
              })}
            </div>
          )}

          {btns.length > 0 && (
            <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:8, marginTop:links.length>0?8:0 }}>
              {btns.map((btn,i) => (
                <a key={i} href={btn.url} className="action-btn" target="_blank" rel="noopener noreferrer"
                  style={{ background:accentColor, color:'#fff', boxShadow:`0 4px 20px ${accentColor}44` }}>
                  {btn.label}
                </a>
              ))}
            </div>
          )}

          {links.length === 0 && btns.length === 0 && (
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.15)', fontWeight:600, marginTop:4 }}>No links yet.</div>
          )}

          <div className="footer" style={{ alignSelf:'center', marginTop:20 }}>powered by <a href="/">fate.rip</a></div>
        </div>

        {/* ── Music Player — directly below the panel ─────────────────────────── */}
        {audioSrc && music.showPlayer !== false && (
          <div className="music-player" style={{ marginTop:10, background:`rgba(${bgRgb},0.55)`, border:`1px solid rgba(${accentRgb},0.10)` }} onClick={e=>e.stopPropagation()}>
            {/* Track info row */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
              <div style={{ minWidth:0, flex:1, paddingRight:12 }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#fff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {trackTitle}
                </div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {trackArtist}
                </div>
              </div>
              {/* Animated EQ bars */}
              {isPlaying && (
                <div style={{ display:'flex', alignItems:'flex-end', gap:2, height:14, flexShrink:0 }}>
                  <div className="bar" style={{ height:5  }} />
                  <div className="bar" style={{ height:10 }} />
                  <div className="bar" style={{ height:7  }} />
                  <div className="bar" style={{ height:12 }} />
                </div>
              )}
            </div>

            {/* Seek bar */}
            <div className="seek-track" onClick={handleSeek}>
              <div className="seek-fill" style={{ width:`${progress}%` }} />
            </div>

            {/* Controls row */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)', fontVariantNumeric:'tabular-nums', minWidth:30 }}>
                {fmt(currentTime)}
              </span>

              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                {/* Restart */}
                <button className="music-ctrl" onClick={restart} title="Restart">
                  <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
                  </svg>
                </button>

                {/* Play / Pause */}
                <button className="music-play" onClick={togglePlay} title={isPlaying?'Pause':'Play'}>
                  {isPlaying
                    ? <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    : <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  }
                </button>

                {/* Skip to end (it's looped so it just wraps) */}
                <button className="music-ctrl" onClick={skipEnd} title="Skip">
                  <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z"/>
                  </svg>
                </button>
              </div>

              <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)', fontVariantNumeric:'tabular-nums', minWidth:30, textAlign:'right' }}>
                {fmt(duration)}
              </span>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html:`.uid-hover-wrap:hover .uid-tooltip{opacity:1!important;} @keyframes cursorBlink{0%,100%{opacity:1}50%{opacity:0}}` }} />
    </div>
  )
}