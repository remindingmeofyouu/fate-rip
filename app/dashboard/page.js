'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Head from 'next/head'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      setUser(session.user)

      const { data } = await supabase
        .from('users')
        .select('username')
        .eq('email', session.user.email)
        .single()

      if (data?.username) setUsername(data.username)
      setLoading(false)
    }

    init()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const initial = username ? username[0].toUpperCase() : '?'

  if (loading) {
    return (
      <div style={{ background: '#0d0d0d', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');`}</style>
        <div style={{ color: '#444', fontFamily: 'DM Sans, sans-serif', fontSize: '14px' }}>Loading...</div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>fate.rip | Dashboard</title>
      </Head>
      <div style={{ background: '#0d0d0d', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #0d0d0d; }
          .dash { display: flex; height: 100vh; width: 100%; }
          .sidebar { width: 200px; background: #111; padding: 16px 10px; flex-shrink: 0; display: flex; flex-direction: column; gap: 2px; }
          .logo { padding: 4px 10px 16px; font-size: 17px; font-weight: 600; color: #fff; letter-spacing: -0.5px; text-decoration: none; display: block; }
          .logo span { color: #e02020; }
          .nav-btn { width: 100%; display: flex; align-items: center; gap: 10px; padding: 9px 12px; background: none; border: none; color: #888; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; border-radius: 8px; transition: background 0.15s, color 0.15s; text-align: left; }
          .nav-btn:hover { background: #1e1e1e; color: #fff; }
          .nav-btn.active { background: #1e1e1e; color: #fff; }
          .nav-btn svg { width: 15px; height: 15px; flex-shrink: 0; opacity: 0.7; }
          .nav-btn:hover svg, .nav-btn.active svg { opacity: 1; }
          .sidebar-spacer { flex: 1; }
          .logout-btn { width: 100%; display: flex; align-items: center; gap: 10px; padding: 9px 12px; background: none; border: none; color: #555; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; border-radius: 8px; transition: background 0.15s, color 0.15s; text-align: left; }
          .logout-btn:hover { background: #1e1e1e; color: #e02020; }
          .logout-btn svg { width: 15px; height: 15px; flex-shrink: 0; opacity: 0.7; }
          .logout-btn:hover svg { opacity: 1; }
          .main { flex: 1; padding: 28px; display: flex; flex-direction: column; gap: 16px; overflow: auto; }
          .top-bar { display: flex; align-items: center; justify-content: space-between; }
          .page-title { font-size: 20px; font-weight: 600; color: #fff; }
          .top-right { display: flex; align-items: center; gap: 10px; }
          .profile-url { font-size: 12px; color: #444; background: #1a1a1a; border: 1px solid #222; border-radius: 6px; padding: 5px 10px; cursor: pointer; transition: color 0.15s, border-color 0.15s; text-decoration: none; }
          .profile-url:hover { color: #fff; border-color: #333; }
          .avatar { width: 32px; height: 32px; border-radius: 50%; background: #e02020; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; color: #fff; flex-shrink: 0; }
          .cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
          .card { background: #1a1a1a; border-radius: 10px; padding: 16px; border: 1px solid #222; }
          .card-label { font-size: 12px; color: #555; margin-bottom: 6px; }
          .card-val { font-size: 22px; font-weight: 600; color: #fff; }
          .card-val span { font-size: 13px; color: #e02020; font-weight: 400; margin-left: 4px; }
          .card-val .neutral { color: #555; }
          .preview { background: #1a1a1a; border-radius: 10px; padding: 20px; flex: 1; border: 1px solid #222; }
          .preview-label { font-size: 11px; color: #444; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.8px; }
          .profile-mock { background: #111; border-radius: 8px; padding: 24px; text-align: center; max-width: 340px; margin: 0 auto; }
          .mock-avatar { width: 56px; height: 56px; border-radius: 50%; background: #e02020; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 600; color: #fff; }
          .mock-name { color: #fff; font-weight: 600; font-size: 15px; }
          .mock-bio { color: #555; font-size: 12px; margin: 4px 0 16px; }
          .mock-link { background: #1a1a1a; border-radius: 6px; padding: 10px; margin-bottom: 8px; font-size: 12px; color: #888; border: 1px solid #222; transition: background 0.15s, color 0.15s; cursor: pointer; }
          .mock-link:hover { background: #222; color: #fff; }
        `}</style>

        <div className="dash">
          <nav className="sidebar">
            <a href="/" className="logo">fate<span>.rip</span></a>

            <button className="nav-btn active" onClick={(e) => { document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active')); e.currentTarget.classList.add('active'); }}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
              </svg>
              Account
            </button>

            <button className="nav-btn" onClick={(e) => { document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active')); e.currentTarget.classList.add('active'); }}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="8" r="5"/><path d="M8 5v3l2 2"/>
              </svg>
              Customize
            </button>

            <button className="nav-btn" onClick={(e) => { document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active')); e.currentTarget.classList.add('active'); }}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 8a2 2 0 0 1 2-2h2a2 2 0 1 1 0 4H8"/>
                <path d="M10 8a2 2 0 0 1-2 2H6a2 2 0 1 1 0-4h2"/>
              </svg>
              Links
            </button>

            <button className="nav-btn" onClick={(e) => { document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active')); e.currentTarget.classList.add('active'); }}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="5" height="5" rx="1"/>
                <rect x="9" y="2" width="5" height="5" rx="1"/>
                <rect x="2" y="9" width="5" height="5" rx="1"/>
                <rect x="9" y="9" width="5" height="5" rx="1"/>
              </svg>
              Templates
            </button>

            <div className="sidebar-spacer" />

            <button className="logout-btn" onClick={handleLogout}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 3H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3"/>
                <path d="M10 11l3-3-3-3"/><path d="M13 8H6"/>
              </svg>
              Log out
            </button>
          </nav>

          <div className="main">
            <div className="top-bar">
              <div className="page-title">Overview</div>
              <div className="top-right">
                <a className="profile-url" href={`/${username}`} target="_blank">
                  fate.rip/{username}
                </a>
                <div className="avatar">{initial}</div>
              </div>
            </div>

            <div className="cards">
              <div className="card">
                <div className="card-label">Profile views</div>
                <div className="card-val">0<span>+0%</span></div>
              </div>
              <div className="card">
                <div className="card-label">Link clicks</div>
                <div className="card-val">0<span>+0%</span></div>
              </div>
              <div className="card">
                <div className="card-label">Links</div>
                <div className="card-val">0<span className="neutral">active</span></div>
              </div>
            </div>

            <div className="preview">
              <div className="preview-label">Profile preview</div>
              <div className="profile-mock">
                <div className="mock-avatar">{initial}</div>
                <div className="mock-name">@{username}</div>
                <div className="mock-bio">your bio goes here</div>
                <div className="mock-link">Twitter / X</div>
                <div className="mock-link">Discord</div>
                <div className="mock-link">GitHub</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}