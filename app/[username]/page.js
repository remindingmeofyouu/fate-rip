'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function ProfilePage() {
  const params = useParams()
  const username = params?.username
  const [profile, setProfile] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)

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

    const fullText = `@${profile.username}`
    let i = 0
    let deleting = false
    let timeout

    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext('2d')

    const drawFavicon = (text) => {
      ctx.clearRect(0, 0, 32, 32)
      ctx.fillStyle = '#080808'
      ctx.fillRect(0, 0, 32, 32)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 13px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, 16, 16)

      let link = document.querySelector("link[rel~='icon']")
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      link.href = canvas.toDataURL()
    }

    const type = () => {
      if (!deleting) {
        i++
        const current = fullText.slice(0, i)
        drawFavicon(current)
        document.title = current
        if (i === fullText.length) {
          deleting = false
          timeout = setTimeout(() => { deleting = true; timeout = setTimeout(type, 80) }, 1500)
        } else {
          timeout = setTimeout(type, 120)
        }
      } else {
        i--
        const current = fullText.slice(0, i)
        drawFavicon(current || '@')
        document.title = current || `@${profile.username}`
        if (i === 0) {
          deleting = false
          timeout = setTimeout(type, 400)
        } else {
          timeout = setTimeout(type, 60)
        }
      }
    }

    timeout = setTimeout(type, 600)
    return () => clearTimeout(timeout)
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

  return (
    <div style={{ background: '#080808', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, sans-serif', padding: '40px 16px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        .profile-wrap { width: 100%; max-width: 480px; display: flex; flex-direction: column; align-items: center; gap: 0; }
        .avatar-ring { width: 90px; height: 90px; border-radius: 50%; background: linear-gradient(135deg, #CC0000, #ff4444); padding: 2px; margin-bottom: 16px; }
        .avatar-inner { width: 100%; height: 100%; border-radius: 50%; background: #0f0f0f; display: flex; align-items: center; justify-content: center; font-size: 34px; font-weight: 900; color: #fff; }
        .profile-name { font-size: 22px; font-weight: 900; color: #fff; letter-spacing: -0.5px; margin-bottom: 6px; }
        .profile-bio { font-size: 13px; color: #444; font-weight: 600; text-align: center; max-width: 300px; line-height: 1.6; margin-bottom: 28px; }
        .links { width: 100%; display: flex; flex-direction: column; gap: 10px; }
        .link-btn { width: 100%; padding: 14px 20px; border-radius: 14px; background: #111; border: 1px solid #1e1e1e; color: #888; font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 700; text-align: center; text-decoration: none; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; position: relative; }
        .link-btn:hover { background: #181818; color: #fff; border-color: #2a2a2a; transform: translateY(-2px); }
        .link-btn:active { transform: translateY(0); }
        .link-arrow { position: absolute; right: 18px; opacity: 0; transition: opacity 0.2s; font-size: 12px; }
        .link-btn:hover .link-arrow { opacity: 1; }
        .footer { margin-top: 36px; font-size: 12px; color: #252525; font-weight: 700; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px; }
        .footer a { color: #CC0000; text-decoration: none; opacity: 0.7; transition: opacity 0.15s; }
        .footer a:hover { opacity: 1; }
      `}</style>

      <div className="profile-wrap">
        <div className="avatar-ring">
          <div className="avatar-inner">{initial}</div>
        </div>
        <div className="profile-name">@{profile.username}</div>
        <div className="profile-bio">{profile.bio || 'No bio yet.'}</div>
        <div className="links">
          <a href="#" className="link-btn">Twitter / X<span className="link-arrow">↗</span></a>
          <a href="#" className="link-btn">Discord<span className="link-arrow">↗</span></a>
          <a href="#" className="link-btn">GitHub<span className="link-arrow">↗</span></a>
        </div>
        <div className="footer">powered by <a href="/">fate.rip</a></div>
      </div>
    </div>
  )
}