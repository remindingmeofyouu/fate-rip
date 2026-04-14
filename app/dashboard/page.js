'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [activePage, setActivePage] = useState('overview')
  const [newLinkTitle, setNewLinkTitle] = useState('')
  const [newLinkUrl, setNewLinkUrl] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setUser(session.user)

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('email', session.user.email)
        .single()

      if (data) {
        setUsername(data.username || '')
        setBio(data.bio || '')
        setLinks(data.links || [])
      }
      setLoading(false)
    }
    init()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const saveProfile = async () => {
    setSaving(true)
    setSaveMsg('')
    const { error } = await supabase
      .from('users')
      .update({ bio, links })
      .eq('username', username)
    setSaving(false)
    if (error) {
      setSaveMsg('Failed to save.')
    } else {
      setSaveMsg('Saved!')
      setTimeout(() => setSaveMsg(''), 2000)
    }
  }

  const addLink = () => {
    if (!newLinkTitle.trim()) return
    const url = newLinkUrl.trim().startsWith('http') ? newLinkUrl.trim() : `https://${newLinkUrl.trim()}`
    setLinks([...links, { title: newLinkTitle.trim(), url: newLinkUrl.trim() ? url : '#' }])
    setNewLinkTitle('')
    setNewLinkUrl('')
  }

  const removeLink = (i) => setLinks(links.filter((_, idx) => idx !== i))

  const moveLink = (i, dir) => {
    const arr = [...links]
    const swap = i + dir
    if (swap < 0 || swap >= arr.length) return
    ;[arr[i], arr[swap]] = [arr[swap], arr[i]]
    setLinks(arr)
  }

  const initial = username ? username[0].toUpperCase() : '?'

  if (loading) {
    return (
      <div style={{ background: '#050506', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#7a7a8a', fontFamily: 'system-ui, sans-serif', fontSize: '14px' }}>Loading...</div>
      </div>
    )
  }

  const navSections = [
    { section: 'ACCOUNT', items: [
      { id: 'overview', label: 'Overview' },
      { id: 'analytics', label: 'Analytics' },
      { id: 'badges', label: 'Badges' },
      { id: 'settings', label: 'Settings' },
    ]},
    { section: 'CUSTOMIZE', items: [
      { id: 'customize', label: 'Appearance' },
      { id: 'links', label: 'Links' },
      { id: 'themes', label: 'Themes' },
    ]},
    { section: 'PREMIUM', items: [
      { id: 'premium', label: 'Upgrade' },
    ]},
  ]

  return (
    <div style={{ margin: 0, background: 'radial-gradient(circle at top, #09090d 0%, #050506 45%, #020203 100%)', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#fff', display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <title>fate.rip | Dashboard</title>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(196,0,29,0.3); border-radius: 4px; }

        .sidebar { width: 250px; background: linear-gradient(180deg, #050506 0%, #09090d 40%, #050506 100%); border-right: 1px solid rgba(196,0,29,0.35); padding: 26px 20px 20px; display: flex; flex-direction: column; gap: 26px; flex-shrink: 0; overflow-y: auto; height: 100vh; }
        .logo { font-size: 26px; font-weight: 800; letter-spacing: 1.2px; text-decoration: none; display: block; }
        .logo .fate { color: #ff2340; }
        .logo .rip { color: #fff; }
        .logo-sub { font-size: 11px; color: #b8b8c4; margin-top: 4px; letter-spacing: 0.16em; text-transform: uppercase; }
        .nav-section { display: flex; flex-direction: column; gap: 8px; }
        .nav-title { font-size: 12px; color: #7a7a8a; margin-bottom: 4px; letter-spacing: 0.16em; text-transform: uppercase; }
        .nav-item { padding: 9px 11px; border-radius: 10px; border: 1px solid transparent; cursor: pointer; transition: border .15s, background .15s, color .15s; font-size: 13px; color: #b8b8c4; display: flex; align-items: center; justify-content: space-between; background: none; width: 100%; text-align: left; font-family: inherit; }
        .nav-item:hover, .nav-item.active { border-color: #c4001d; background: rgba(196,0,29,0.08); color: #fff; }
        .nav-item .chevron { font-size: 11px; opacity: 0.7; }
        .sidebar-footer { margin-top: auto; font-size: 11px; color: #7a7a8a; border-top: 1px solid rgba(196,0,29,0.25); padding-top: 12px; }
        .logout-link { color: #7a7a8a; cursor: pointer; font-size: 11px; background: none; border: none; font-family: inherit; padding: 0; margin-top: 8px; transition: color .15s; display: block; }
        .logout-link:hover { color: #ff2340; }

        .main { flex: 1; padding: 32px 40px; overflow-y: auto; }
        .page-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 22px; }
        .page-breadcrumb { font-size: 11px; color: #7a7a8a; letter-spacing: 0.16em; text-transform: uppercase; }
        .page-title { font-size: 24px; font-weight: 600; color: #ff2340; letter-spacing: 0.4px; margin: 2px 0; }
        .page-subtitle { font-size: 12px; color: #b8b8c4; }
        .back-button { border-radius: 999px; border: 1px solid rgba(196,0,29,0.35); background: rgba(10,10,13,0.9); color: #b8b8c4; font-size: 11px; padding: 6px 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all .15s; font-family: inherit; flex-shrink: 0; margin-top: 4px; }
        .back-button:hover { border-color: #c4001d; background: rgba(196,0,29,0.12); color: #fff; transform: translateY(-1px); }

        .panel { background: #111114; border: 1px solid rgba(196,0,29,0.35); border-radius: 16px; padding: 20px; margin-bottom: 22px; }
        .panel-header { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
        .panel h2 { margin: 0; font-size: 17px; color: #ff2340; }
        .panel-note { font-size: 11px; color: #7a7a8a; }
        .panel-body { font-size: 13px; color: #b8b8c4; }

        .stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 14px; margin-bottom: 10px; }
        .stat-card { background: #141419; border-radius: 12px; border: 1px solid rgba(196,0,29,0.35); padding: 10px 12px; font-size: 12px; }
        .stat-label { color: #7a7a8a; margin-bottom: 4px; }
        .stat-value { font-size: 16px; font-weight: 600; color: #fff; }
        .stat-sub { font-size: 11px; color: #b8b8c4; margin-top: 2px; }

        .progress-bar-bg { width: 100%; height: 8px; border-radius: 999px; background: #15151c; overflow: hidden; border: 1px solid rgba(196,0,29,0.35); margin: 8px 0 4px; }
        .progress-bar-fill { height: 100%; background: linear-gradient(90deg, #c4001d, #ff2340); transition: width 0.5s; }
        .progress-label { font-size: 11px; color: #7a7a8a; }
        .button-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }

        .field { display: flex; flex-direction: column; margin-bottom: 14px; }
        .field label { font-size: 13px; margin-bottom: 6px; color: #b8b8c4; }
        .input { background: #0c0c10; border: 1px solid rgba(196,0,29,0.35); border-radius: 12px; padding: 10px 12px; color: #fff; font-size: 13px; outline: none; transition: border .15s, background .15s; font-family: inherit; width: 100%; resize: none; }
        .input:focus { border-color: #c4001d; background: #101018; }
        .input:disabled { opacity: 0.3; cursor: not-allowed; }
        .input::placeholder { color: #2a2a2a; }

        .button { background: linear-gradient(135deg, #c4001d, #ff2340); border: none; padding: 11px 16px; border-radius: 14px; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity .15s, transform .15s; font-family: inherit; }
        .button:hover { opacity: .9; transform: translateY(-1px); }
        .button:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .button-secondary { background: transparent; border-radius: 999px; border: 1px solid rgba(196,0,29,0.35); color: #b8b8c4; padding: 8px 14px; font-size: 12px; cursor: pointer; transition: all .15s; font-family: inherit; }
        .button-secondary:hover { border-color: #c4001d; background: rgba(196,0,29,0.12); color: #fff; transform: translateY(-1px); }
        .save-bar { margin-top: 10px; display: flex; align-items: center; gap: 12px; justify-content: flex-end; }
        .save-msg { font-size: 12px; color: #22c55e; font-weight: 500; }

        .link-item { display: flex; align-items: center; gap: 10px; background: #0c0c10; border: 1px solid rgba(196,0,29,0.2); border-radius: 10px; padding: 10px 14px; margin-bottom: 8px; }
        .link-item-title { font-size: 13px; color: #ddd; font-weight: 500; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .link-item-url { font-size: 11px; color: #444; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .link-actions { display: flex; gap: 4px; flex-shrink: 0; }
        .link-action-btn { width: 28px; height: 28px; border-radius: 7px; border: none; background: rgba(255,255,255,0.05); color: #555; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px; transition: all .15s; }
        .link-action-btn:hover { background: rgba(255,255,255,0.1); color: #aaa; }
        .link-action-btn.del:hover { background: rgba(196,0,29,0.15); color: #ff2340; }

        .avatar-orb { width: 90px; height: 90px; border-radius: 50%; background: radial-gradient(circle at 30% 0%, #ff4d5f 0%, #c4001d 50%, #5a000c 100%); box-shadow: 0 0 20px rgba(196,0,29,0.4); margin-bottom: 12px; display: flex; align-items: center; justify-content: center; font-size: 34px; font-weight: 700; }
        .theme-row { display: flex; gap: 12px; margin-top: 10px; }
        .theme-box { width: 60px; height: 40px; border-radius: 10px; border: 2px solid rgba(196,0,29,0.35); cursor: pointer; transition: all .15s; }
        .theme-box:hover { border-color: #c4001d; transform: translateY(-1px); }
        .badge-grid { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 10px; }
        .badge-card { border-radius: 12px; border: 1px dashed rgba(196,0,29,0.35); padding: 10px; font-size: 11px; color: #7a7a8a; text-align: center; }
        .settings-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
        .settings-pill { border-radius: 999px; border: 1px solid rgba(196,0,29,0.35); padding: 7px 12px; font-size: 12px; color: #b8b8c4; }
        .graph-legend { margin-top: 8px; font-size: 11px; color: #7a7a8a; }
      `}</style>

      {/* Sidebar */}
      <nav className="sidebar">
        <div>
          <a href="/" className="logo">
            <span className="fate">FATE.</span><span className="rip">RIP</span>
          </a>
          <div className="logo-sub">Profile Control Surface</div>
        </div>

        {navSections.map(({ section, items }) => (
          <div className="nav-section" key={section}>
            <div className="nav-title">{section}</div>
            {items.map(item => (
              <button
                key={item.id}
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => setActivePage(item.id)}
              >
                <span>{item.label}</span>
                <span className="chevron">›</span>
              </button>
            ))}
          </div>
        ))}

        <div className="sidebar-footer">
          <div>Powered By <span style={{ color: '#ff2340' }}>FATE.</span>RIP</div>
          <div style={{ marginTop: 4 }}>No Tracking. Just Signal.</div>
          <div style={{ marginTop: 6 }}>
            <a href={`/${username}`} target="_blank" style={{ color: '#444', fontSize: 11, textDecoration: 'none' }}>
              fate.rip/{username} ↗
            </a>
          </div>
          <button className="logout-link" onClick={handleLogout}>← Log Out</button>
        </div>
      </nav>

      {/* Main */}
      <div className="main">

        {/* OVERVIEW */}
        {activePage === 'overview' && (
          <div>
            <div style={{ marginBottom: 22 }}>
              <div className="page-breadcrumb">ACCOUNT • OVERVIEW</div>
              <div className="page-title">Account Overview</div>
            </div>

            {/* Top 4 stat cards */}
            <div className="stats-grid" style={{ marginBottom: 22 }}>
              <div className="stat-card" style={{ position: 'relative' }}>
                <div className="stat-label">Username</div>
                <div className="stat-value">{username || '—'}</div>
                <div className="stat-sub">Change available now</div>
                <span style={{ position: 'absolute', top: 10, right: 12, fontSize: 14, color: '#444' }}>✎</span>
              </div>
              <div className="stat-card" style={{ position: 'relative' }}>
                <div className="stat-label">Alias</div>
                <div className="stat-value">0 Aliases Used</div>
                <div className="stat-sub">1 Alias Slot Remaining</div>
                <span style={{ position: 'absolute', top: 10, right: 12, fontSize: 14, color: '#444' }}>👤</span>
              </div>
              <div className="stat-card" style={{ position: 'relative' }}>
                <div className="stat-label">UID</div>
                <div className="stat-value">—</div>
                <div className="stat-sub">Profile Identifier</div>
                <span style={{ position: 'absolute', top: 10, right: 12, fontSize: 14, color: '#444' }}>#</span>
              </div>
              <div className="stat-card" style={{ position: 'relative' }}>
                <div className="stat-label">Profile Views</div>
                <div className="stat-value">0</div>
                <div className="stat-sub">+0 views since last 7 days</div>
                <span style={{ position: 'absolute', top: 10, right: 12, fontSize: 14, color: '#444' }}>👁</span>
              </div>
            </div>

            {/* Two-column layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 18, alignItems: 'start' }}>

              {/* Left: Account Statistics */}
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 14 }}>Account Statistics</div>
                <div className="panel">
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: '#b8b8c4', fontWeight: 500 }}>Profile Completion</span>
                    </div>
                    {(() => {
                      const steps = [!!bio, links.length > 0]
                      const pct = Math.round((steps.filter(Boolean).length / steps.length) * 100)
                      return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div className="progress-bar-bg" style={{ flex: 1, margin: 0 }}>
                            <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <span style={{ fontSize: 12, color: '#7a7a8a', flexShrink: 0 }}>{pct}% completed</span>
                        </div>
                      )
                    })()}
                  </div>

                  {/* Incomplete warning */}
                  <div style={{ background: 'rgba(196,0,29,0.07)', border: '1px solid rgba(196,0,29,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 14, color: '#f59e0b' }}>⚠</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Your profile isn't complete yet!</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#7a7a8a' }}>Complete your profile to make it more discoverable and appealing.</div>
                  </div>

                  {/* Checklist items */}
                  {[
                    { label: 'Upload An Avatar', done: false, onClick: () => setActivePage('customize') },
                    { label: 'Add A Description', done: !!bio, onClick: () => setActivePage('customize') },
                    { label: 'Add Links', done: links.length > 0, onClick: () => setActivePage('links') },
                    { label: 'Reach 10 Profile Views', done: false, onClick: null },
                  ].map((step, i) => (
                    <div
                      key={i}
                      onClick={step.onClick || undefined}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: '#0d0d10', border: '1px solid rgba(196,0,29,0.15)',
                        borderRadius: 10, padding: '10px 14px', marginBottom: 8,
                        cursor: step.onClick ? 'pointer' : 'default',
                        transition: 'border-color .15s',
                      }}
                      onMouseEnter={e => { if (step.onClick) e.currentTarget.style.borderColor = 'rgba(196,0,29,0.4)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(196,0,29,0.15)' }}
                    >
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                        background: step.done ? 'rgba(34,197,94,0.15)' : 'rgba(196,0,29,0.1)',
                        border: `1px solid ${step.done ? 'rgba(34,197,94,0.4)' : 'rgba(196,0,29,0.3)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, color: step.done ? '#22c55e' : '#ff2340',
                      }}>
                        {step.done ? '✓' : '!'}
                      </div>
                      <span style={{ fontSize: 13, color: step.done ? '#22c55e' : '#b8b8c4' }}>{step.label}</span>
                      {!step.done && step.onClick && (
                        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#444' }}>›</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Manage account + Connections */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="panel" style={{ padding: '18px 16px' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Manage your account</div>
                  <div style={{ fontSize: 11, color: '#7a7a8a', marginBottom: 14 }}>Change your email, username and more.</div>
                  {[
                    { label: 'Change Username', icon: '✎', page: 'settings' },
                    { label: 'Change Display Name', icon: '✎', page: 'customize' },
                    { label: 'Manage Aliases', icon: '⚙', page: 'settings' },
                    { label: 'Account Settings', icon: '⚙', page: 'settings' },
                  ].map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePage(item.page)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        width: '100%', padding: '9px 12px', marginBottom: 6,
                        background: '#0d0d10', border: '1px solid rgba(196,0,29,0.2)',
                        borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
                        color: '#b8b8c4', fontSize: 12, textAlign: 'left',
                        transition: 'border-color .15s, color .15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#c4001d'; e.currentTarget.style.color = '#fff' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(196,0,29,0.2)'; e.currentTarget.style.color = '#b8b8c4' }}
                    >
                      <span style={{ fontSize: 12, color: '#555' }}>{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="panel" style={{ padding: '18px 16px' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Connections</div>
                  <div style={{ fontSize: 11, color: '#7a7a8a', marginBottom: 14 }}>Link external accounts to your profile.</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{
                      flex: 1, display: 'flex', alignItems: 'center', gap: 8,
                      background: '#5865F2', borderRadius: 10, padding: '9px 12px',
                      fontSize: 12, fontWeight: 600, color: '#fff',
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                      </svg>
                      Discord Connected
                    </div>
                    <button style={{
                      width: 34, height: 34, border: 'none', borderRadius: 8,
                      background: 'rgba(196,0,29,0.2)', color: '#ff2340',
                      cursor: 'pointer', fontSize: 14, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>✕</button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ANALYTICS */}
        {activePage === 'analytics' && (
          <div>
            <div className="page-title-row">
              <div>
                <div className="page-breadcrumb">ACCOUNT • ANALYTICS</div>
                <div className="page-title">Analytics</div>
                <div className="page-subtitle">Profile activity overview.</div>
              </div>
              <button className="back-button" onClick={() => setActivePage('overview')}>← Back To Overview</button>
            </div>
            <div className="panel">
              <div className="panel-header"><h2>Profile Views (Last 7 Days)</h2><div className="panel-note">Coming Soon</div></div>
              <div className="panel-body">
                <div style={{ height: 160, background: 'linear-gradient(180deg,#0d0d10,#09090d)', border: '1px solid rgba(196,0,29,0.35)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2a2a2a', fontSize: 13 }}>
                  Analytics tracking coming soon
                </div>
                <div className="graph-legend">View counts, click-throughs and referrers will appear here.</div>
              </div>
            </div>
          </div>
        )}

        {/* BADGES */}
        {activePage === 'badges' && (
          <div>
            <div className="page-title-row">
              <div>
                <div className="page-breadcrumb">ACCOUNT • BADGES</div>
                <div className="page-title">Badges</div>
                <div className="page-subtitle">Achievements and milestones.</div>
              </div>
              <button className="back-button" onClick={() => setActivePage('overview')}>← Back To Overview</button>
            </div>
            <div className="panel">
              <div className="panel-header"><h2>Your Badges</h2><div className="panel-note">None unlocked yet</div></div>
              <div className="panel-body">
                <div className="badge-grid">
                  <div className="badge-card">First View</div>
                  <div className="badge-card">Ten Views</div>
                  <div className="badge-card">Linked Socials</div>
                  <div className="badge-card">Custom Theme</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {activePage === 'settings' && (
          <div>
            <div className="page-title-row">
              <div>
                <div className="page-breadcrumb">ACCOUNT • SETTINGS</div>
                <div className="page-title">Settings</div>
                <div className="page-subtitle">Account configuration.</div>
              </div>
              <button className="back-button" onClick={() => setActivePage('overview')}>← Back To Overview</button>
            </div>
            <div className="panel">
              <div className="panel-header"><h2>Account Settings</h2></div>
              <div className="panel-body">
                <div className="field">
                  <label>Email</label>
                  <input className="input" value={user?.email || ''} disabled />
                </div>
                <div className="settings-row">
                  <div className="settings-pill">Two-Factor Authentication</div>
                  <div className="settings-pill">Session Management</div>
                  <div className="settings-pill">Export Data</div>
                </div>
                <div className="save-bar" style={{ marginTop: 16 }}>
                  <button className="button-secondary" onClick={handleLogout}>Log Out</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOMIZE */}
        {activePage === 'customize' && (
          <div>
            <div className="page-title-row">
              <div>
                <div className="page-breadcrumb">CUSTOMIZE • APPEARANCE</div>
                <div className="page-title">Customize Profile</div>
                <div className="page-subtitle">Control how your public profile looks.</div>
              </div>
              <button className="back-button" onClick={() => setActivePage('overview')}>← Back To Overview</button>
            </div>
            <div className="panel">
              <div className="panel-header"><h2>Profile Information</h2></div>
              <div className="panel-body">
                <div className="field">
                  <label>Username</label>
                  <input className="input" value={username} disabled />
                  <div style={{ fontSize: 11, color: '#2a2a2a', marginTop: 4 }}>Username cannot be changed.</div>
                </div>
                <div className="field">
                  <label>Bio</label>
                  <textarea className="input" rows={4} placeholder="Short description..." value={bio} onChange={e => setBio(e.target.value)} maxLength={160} />
                  <div style={{ fontSize: 11, color: '#2a2a2a', marginTop: 4 }}>{bio.length}/160</div>
                </div>
                <div className="save-bar">
                  {saveMsg && <span className="save-msg">{saveMsg}</span>}
                  <button className="button" onClick={saveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</button>
                </div>
              </div>
            </div>
            <div className="panel">
              <div className="panel-header"><h2>Avatar</h2><div className="panel-note">Upload coming soon</div></div>
              <div className="panel-body">
                <div className="avatar-orb">{initial}</div>
                <button className="button" style={{ opacity: 0.4, cursor: 'not-allowed' }}>Upload Avatar</button>
              </div>
            </div>
          </div>
        )}

        {/* LINKS */}
        {activePage === 'links' && (
          <div>
            <div className="page-title-row">
              <div>
                <div className="page-breadcrumb">CUSTOMIZE • LINKS</div>
                <div className="page-title">Links</div>
                <div className="page-subtitle">Configure links on your public profile.</div>
              </div>
              <button className="back-button" onClick={() => setActivePage('overview')}>← Back To Overview</button>
            </div>
            <div className="panel">
              <div className="panel-header"><h2>Your Links</h2><div className="panel-note">{links.length} link{links.length !== 1 ? 's' : ''}</div></div>
              <div className="panel-body">
                {links.length === 0 && <div style={{ color: '#2a2a2a', padding: '8px 0 16px', fontSize: 13 }}>No links yet. Add one below!</div>}
                {links.map((l, i) => (
                  <div key={i} className="link-item">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="link-item-title">{l.title}</div>
                      <div className="link-item-url">{l.url}</div>
                    </div>
                    <div className="link-actions">
                      <button className="link-action-btn" onClick={() => moveLink(i, -1)}>↑</button>
                      <button className="link-action-btn" onClick={() => moveLink(i, 1)}>↓</button>
                      <button className="link-action-btn del" onClick={() => removeLink(i)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="panel">
              <div className="panel-header"><h2>Add Link</h2></div>
              <div className="panel-body">
                <div className="field">
                  <label>Label</label>
                  <input className="input" placeholder="e.g. Twitter" value={newLinkTitle} onChange={e => setNewLinkTitle(e.target.value)} />
                </div>
                <div className="field">
                  <label>URL</label>
                  <input className="input" placeholder="https://twitter.com/you" value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && addLink()} />
                </div>
                <div className="save-bar">
                  {saveMsg && <span className="save-msg">{saveMsg}</span>}
                  <button className="button-secondary" onClick={addLink}>+ Add Link</button>
                  <button className="button" onClick={saveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save Links'}</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* THEMES */}
        {activePage === 'themes' && (
          <div>
            <div className="page-title-row">
              <div>
                <div className="page-breadcrumb">CUSTOMIZE • THEMES</div>
                <div className="page-title">Themes</div>
                <div className="page-subtitle">Choose your profile theme.</div>
              </div>
              <button className="back-button" onClick={() => setActivePage('overview')}>← Back To Overview</button>
            </div>
            <div className="panel">
              <div className="panel-header"><h2>Theme Presets</h2><div className="panel-note">Coming Soon</div></div>
              <div className="panel-body">
                <div className="theme-row">
                  <div className="theme-box" style={{ background: 'linear-gradient(180deg,#050506,#0a0a0d)' }} />
                  <div className="theme-box" style={{ background: 'linear-gradient(180deg,#1a0004,#3a0008)' }} />
                  <div className="theme-box" style={{ background: 'linear-gradient(180deg,#0d0d0d,#1a1a1a)' }} />
                </div>
                <div className="graph-legend" style={{ marginTop: 10 }}>Custom themes will apply to your public profile page.</div>
              </div>
            </div>
          </div>
        )}

        {/* PREMIUM */}
        {activePage === 'premium' && (
          <div>
            <div className="page-title-row">
              <div>
                <div className="page-breadcrumb">PREMIUM</div>
                <div className="page-title">Premium</div>
                <div className="page-subtitle">Unlock extended features.</div>
              </div>
              <button className="back-button" onClick={() => setActivePage('overview')}>← Back To Overview</button>
            </div>
            <div className="panel">
              <div className="panel-header"><h2>Upgrade</h2><div className="panel-note">Coming Soon</div></div>
              <div className="panel-body">
                <p style={{ marginBottom: 12 }}>Unlock additional customization, advanced analytics, and more profile slots.</p>
                <div className="button-row">
                  <button className="button" style={{ opacity: 0.5, cursor: 'not-allowed' }}>Upgrade Now</button>
                  <button className="button-secondary">View Benefits</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}