'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function ProfilePage({ params }) {
  const { username } = params
  const [profile, setProfile] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single()

      if (!data) {
        setNotFound(true)
      } else {
        setProfile(data)
      }
    }

    fetchProfile()
  }, [username])

  if (notFound) {
    return (
      <div style={{ background: '#0A0A0A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, sans-serif' }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');`}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', fontWeight: 900, color: '#fff', marginBottom: '8px' }}>404</div>
          <div style={{ fontSize: '16px', color: '#555', marginBottom: '24px' }}>This profile doesn't exist.</div>
          <a href="/" style={{ color: '#CC0000', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>← Back to fate.rip</a>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div style={{ background: '#0A0A0A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#444', fontFamily: 'DM Sans, sans-serif', fontSize: '14px' }}>Loading...</div>
      </div>
    )
  }

  const initial = profile.username[0].toUpperCase()

  return (
    <div style={{ background: '#0A0A0A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, sans-serif' }}>
      <title>{`${profile.username} — fate.rip`}</title>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        .card { background: #0f0f0f; border: 1px solid #1e1e1e; border-radius: 22px; padding: 40px 32px; width: 100%; max-width: 400px; display: flex; flex-direction: column; align-items: center; gap: 12px; box-shadow: 0 0 80px rgba(204,0,0,0.06); }
        .avatar { width: 80px; height: 80px; border-radius: 50%; background: #CC0000; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 900; color: #fff; margin-bottom: 4px; }
        .username { font-size: 20px; font-weight: 800; color: #F0F0F0; }
        .bio { font-size: 13px; color: #555; text-align: center; max-width: 280px; line-height: 1.5; }
        .links { width: 100%; display: flex; flex-direction: column; gap: 10px; margin-top: 8px; }
        .link-btn { width: 100%; padding: 13px; border-radius: 12px; background: #1a1a1a; border: 1px solid #272727; color: #aaa; font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 700; text-align: center; text-decoration: none; transition: all 0.15s; display: block; }
        .link-btn:hover { background: #222; color: #fff; border-color: #333; transform: translateY(-1px); }
        .footer { font-size: 11px; color: #333; margin-top: 8px; font-weight: 700; letter-spacing: 0.5px; }
        .footer a { color: #CC0000; text-decoration: none; }
        .footer a:hover { color: #ff2222; }
      `}</style>
      <div className="card">
        <div className="avatar">{initial}</div>
        <div className="username">@{profile.username}</div>
        <div className="bio">{profile.bio || 'No bio yet.'}</div>
        <div className="links">
          <a href="#" className="link-btn">Twitter / X</a>
          <a href="#" className="link-btn">Discord</a>
          <a href="#" className="link-btn">GitHub</a>
        </div>
        <div className="footer">powered by <a href="/">fate.rip</a></div>
      </div>
    </div>
  )
}