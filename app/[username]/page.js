'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function ProfilePage() {
  const params = useParams()
  const username = params?.username
  const [profile, setProfile] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)
  const audioRef = useRef(null)

  useEffect(() => {
    if (!username) return
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
      if (error || !data || data.length === 0) {
        setNotFound(true)
      } else {
        setProfile(data[0])
      }
      setLoading(false)
    }
    fetchProfile()
  }, [username])

  useEffect(() => {
    if (!profile) return

    let link = document.querySelector("link[rel~='icon']")
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = '/scythe.png'

    // Apply custom cursor if set
    if (profile.cursor_url) {
      document.body.style.cursor = `url('${profile.cursor_url}'), auto`
    }

    // Typewriter on title
    const fullText = `@${profile.username}`
    let i = 0
    let deleting = false
    let timeout

    const tick = () => {
      if (!deleting) {
        i++
        document.title = fullText.slice(0, i)
        if (i === fullText.length) {
          timeout = setTimeout(() => { deleting = true; timeout = setTimeout(tick, 200) }, 2500)
        } else {
          timeout = setTimeout(tick, 200)
        }
      } else {
        i--
        document.title = fullText.slice(0, i)
        if (i === 0) {
          deleting = false
          timeout = setTimeout(tick, 1200)
        } else {
          timeout = setTimeout(tick, 120)
        }
      }
    }

    timeout = setTimeout(tick, 1200)
    return () => {
      clearTimeout(timeout)
      document.body.style.cursor = ''
    }
  }, [profile])

  // Try audio autoplay on first interaction
  useEffect(() => {
    if (!profile?.audio_url) return
    const tryPlay = () => {
      if (audioRef.current) {
        audioRef.current.volume = 0.4
        audioRef.current.play().catch(() => {})
      }
      document.removeEventListener('click', tryPlay)
    }
    document.addEventListener('click', tryPlay)
    // Also try immediately (works in some browsers)
    if (audioRef.current) {
      audioRef.current.volume = 0.4
      audioRef.current.play().catch(() => {})
    }
    return () => document.removeEventListener('click', tryPlay)
  }, [profile])

  if (loading) {
    return (
      <div style={{ background: '#080808', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');`}</style>
        <div style={{ color: '#333', fontFamily: 'Nunito, sans-serif', fontSize: '14px', fontWeight: 700 }}>Loading...</div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div style={{ background: '#080808', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, sans-serif' }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');`}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', fontWeight: 900, color: '#fff', lineHeight: 1 }}>404</div>
          <div style={{ fontSize: '15px', color: '#444', margin: '10px 0 28px', fontWeight: 600 }}>This profile doesn't exist.</div>
          <a href="/" style={{ color: '#CC0000', fontWeight: 800, fontSize: '13px', textDecoration: 'none', background: 'rgba(204,0,0,0.1)', padding: '10px 20px', borderRadius: '999px', border: '1px solid rgba(204,0,0,0.2)' }}>← Back to fate.rip</a>
        </div>
      </div>
    )
  }

  const initial = profile.username[0].toUpperCase()
  const links = Array.isArray(profile.links) ? profile.links : []
  const opacity = profile.opacity ?? 100
  const blur = profile.blur ?? 0
  const usernameFx = profile.username_fx || ''
  const bgFx = profile.bg_fx || 'nighttime'
  const location = profile.location || ''
  const glowState = profile.glow_settings || { username: true, socials: true, badges: false }
  const avatarUrl = profile.avatar_url || null
  const bgUrl = profile.bg_url || null
  const audioUrl = profile.audio_url || null

  // Username style
  const nameStyle = (() => {
    if (usernameFx === 'rainbow') return { background: 'linear-gradient(90deg,#ff0,#0f0,#0ff,#f0f,#f00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }
    if (usernameFx === 'gold') return { background: 'linear-gradient(90deg,#b8860b,#ffd700,#b8860b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }
    if (usernameFx === 'neon') return { color: '#ff2340', textShadow: '0 0 12px rgba(255,35,64,0.9), 0 0 24px rgba(255,35,64,0.4)' }
    if (usernameFx === 'glitch') return { color: '#fff', animation: 'glitch 0.4s infinite' }
    if (glowState.username) return { color: '#fff', textShadow: '0 0 16px rgba(196,0,29,0.6)' }
    return { color: '#fff' }
  })()

  // Background overlay
  const overlayStyle = (() => {
    if (bgFx === 'nighttime') return { background: 'linear-gradient(180deg, rgba(5,5,12,0.5) 0%, rgba(20,0,40,0.6) 100%)' }
    if (bgFx === 'particles') return { background: 'radial-gradient(circle at 20% 80%, rgba(196,0,29,0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(196,0,29,0.1) 0%, transparent 40%)' }
    if (bgFx === 'matrix') return { background: 'linear-gradient(180deg, rgba(0,30,10,0.6) 0%, rgba(0,60,20,0.3) 100%)' }
    if (bgFx === 'rain') return { background: 'linear-gradient(180deg, rgba(0,10,40,0.6) 0%, rgba(0,20,80,0.3) 100%)' }
    if (bgFx === 'snow') return { background: 'linear-gradient(180deg, rgba(200,220,255,0.08) 0%, rgba(180,200,255,0.12) 100%)' }
    return {}
  })()

  return (
    <div style={{ background: '#080808', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, sans-serif', padding: '40px 16px', position: 'relative', overflow: 'hidden' }}>
      <link rel="icon" href="/scythe.png" />

      {/* Audio player */}
      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} loop style={{ display: 'none' }} />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        @keyframes glitch {
          0%, 100% { text-shadow: 2px 0 #ff0000, -2px 0 #0000ff; }
          25% { text-shadow: -2px 0 #ff0000, 2px 0 #0000ff; }
          50% { text-shadow: 2px 2px #ff0000, -2px -2px #0000ff; }
          75% { text-shadow: -2px 2px #ff0000, 2px -2px #0000ff; }
        }

        @keyframes floatParticle {
          0% { transform: translateY(100vh) scale(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-10vh) scale(1); opacity: 0; }
        }

        @keyframes rainDrop {
          0% { transform: translateY(-10px); opacity: 0; }
          10% { opacity: 0.6; }
          100% { transform: translateY(100vh); opacity: 0; }
        }

        @keyframes snowFlake {
          0% { transform: translateY(-10px) translateX(0); opacity: 0; }
          10% { opacity: 0.8; }
          50% { transform: translateY(50vh) translateX(20px); }
          100% { transform: translateY(100vh) translateX(-10px); opacity: 0; }
        }

        @keyframes matrixChar {
          0% { opacity: 0; transform: translateY(-20px); }
          50% { opacity: 1; }
          100% { opacity: 0; transform: translateY(20px); }
        }

        .profile-wrap { width: 100%; max-width: 480px; display: flex; flex-direction: column; align-items: center; gap: 0; position: relative; z-index: 2; }
        .avatar-ring { width: 90px; height: 90px; border-radius: 50%; background: linear-gradient(135deg, #CC0000, #ff4444); padding: 2px; margin-bottom: 16px; flex-shrink: 0; }
        .avatar-inner { width: 100%; height: 100%; border-radius: 50%; background: #0f0f0f; display: flex; align-items: center; justify-content: center; font-size: 34px; font-weight: 900; color: #fff; overflow: hidden; }
        .avatar-inner img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
        .profile-name { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; margin-bottom: 6px; }
        .profile-bio { font-size: 13px; color: #888; font-weight: 600; text-align: center; max-width: 300px; line-height: 1.6; margin-bottom: 10px; }
        .profile-location { font-size: 12px; color: #555; font-weight: 600; display: flex; align-items: center; gap: 5px; margin-bottom: 20px; }
        .links { width: 100%; display: flex; flex-direction: column; gap: 10px; margin-top: 10px; }
        .link-btn { width: 100%; padding: 14px 20px; border-radius: 14px; background: rgba(17,17,17,0.85); border: 1px solid #1e1e1e; color: #888; font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 700; text-align: center; text-decoration: none; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; position: relative; backdrop-filter: blur(8px); }
        .link-btn:hover { background: rgba(24,24,24,0.95); color: #fff; border-color: #2a2a2a; transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
        .link-btn:active { transform: translateY(0); }
        .link-arrow { position: absolute; right: 18px; opacity: 0; transition: opacity 0.2s; font-size: 12px; }
        .link-btn:hover .link-arrow { opacity: 1; }
        .footer { margin-top: 36px; font-size: 12px; color: #252525; font-weight: 700; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px; }
        .footer a { color: #CC0000; text-decoration: none; opacity: 0.7; transition: opacity 0.15s; }
        .footer a:hover { opacity: 1; }
        .bg-layer { position: fixed; inset: 0; z-index: 0; }
        .bg-img { position: fixed; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
        .bg-overlay { position: fixed; inset: 0; z-index: 1; pointer-events: none; }
        .fx-layer { position: fixed; inset: 0; z-index: 1; pointer-events: none; overflow: hidden; }
        .audio-btn { position: fixed; bottom: 20px; right: 20px; z-index: 10; width: 40px; height: 40px; border-radius: 50%; background: rgba(17,17,17,0.8); border: 1px solid rgba(196,0,29,0.4); color: #ff2340; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 16px; backdrop-filter: blur(8px); transition: all .2s; }
        .audio-btn:hover { background: rgba(196,0,29,0.2); transform: scale(1.1); }
      `}</style>

      {/* Background image */}
      {bgUrl && (
        <img
          src={bgUrl}
          className="bg-img"
          alt=""
          style={{ filter: blur > 0 ? `blur(${blur * 0.3}px)` : 'none' }}
        />
      )}

      {/* Background overlay tint */}
      <div className="bg-overlay" style={overlayStyle} />

      {/* Background FX particles/rain/snow/matrix */}
      {bgFx === 'particles' && (
        <div className="fx-layer">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              borderRadius: '50%',
              background: `rgba(196,0,29,${0.3 + Math.random() * 0.5})`,
              animation: `floatParticle ${4 + Math.random() * 6}s linear ${Math.random() * 5}s infinite`,
              bottom: '-10px',
            }} />
          ))}
        </div>
      )}

      {bgFx === 'rain' && (
        <div className="fx-layer">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: 0,
              width: '1px',
              height: `${15 + Math.random() * 25}px`,
              background: 'linear-gradient(180deg, transparent, rgba(130,170,255,0.5))',
              animation: `rainDrop ${0.5 + Math.random() * 1}s linear ${Math.random() * 2}s infinite`,
            }} />
          ))}
        </div>
      )}

      {bgFx === 'snow' && (
        <div className="fx-layer">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: '-10px',
              width: `${3 + Math.random() * 5}px`,
              height: `${3 + Math.random() * 5}px`,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.8)',
              animation: `snowFlake ${3 + Math.random() * 5}s linear ${Math.random() * 4}s infinite`,
            }} />
          ))}
        </div>
      )}

      {bgFx === 'matrix' && (
        <div className="fx-layer" style={{ fontFamily: 'monospace', fontSize: 14 }}>
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${(i / 15) * 100}%`,
              top: `${Math.random() * 100}%`,
              color: '#00ff41',
              opacity: 0.3,
              animation: `matrixChar ${1 + Math.random() * 2}s ease-in-out ${Math.random() * 2}s infinite`,
            }}>
              {String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96))}
            </div>
          ))}
        </div>
      )}

      {/* Audio toggle button */}
      {audioUrl && (
        <button
          className="audio-btn"
          onClick={() => {
            if (audioRef.current) {
              if (audioRef.current.paused) audioRef.current.play()
              else audioRef.current.pause()
            }
          }}
          title="Toggle music"
        >
          🎵
        </button>
      )}

      {/* Profile card */}
      <div className="profile-wrap" style={{ opacity: opacity / 100 }}>
        <div className="avatar-ring">
          <div className="avatar-inner">
            {avatarUrl
              ? <img src={avatarUrl} alt={profile.username} />
              : initial
            }
          </div>
        </div>

        <div className="profile-name" style={nameStyle}>@{profile.username}</div>

        {profile.bio && (
          <div className="profile-bio">{profile.bio}</div>
        )}

        {location && (
          <div className="profile-location">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
            {location}
          </div>
        )}

        {links.length > 0 && (
          <div className="links">
            {links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                className="link-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.title}
                <span className="link-arrow">↗</span>
              </a>
            ))}
          </div>
        )}

        {links.length === 0 && (
          <div style={{ fontSize: 13, color: '#333', fontWeight: 600, marginTop: 10 }}>No links yet.</div>
        )}

        <div className="footer">powered by <a href="/">fate.rip</a></div>
      </div>
    </div>
  )
}