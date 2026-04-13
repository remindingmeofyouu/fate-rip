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
  const [activeTab, setActiveTab] = useState('overview')
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
      <div style={{ background: '#080808', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');`}</style>
        <div style={{ color: '#333', fontFamily: 'DM Sans, sans-serif', fontSize: '14px' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ background: '#080808', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif', display: 'flex' }}>
      <title>fate.rip | Dashboard</title>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* Sidebar */
        .sidebar { width: 220px; background: #0d0d0d; border-right: 1px solid #161616; display: flex; flex-direction: column; padding: 24px 12px; flex-shrink: 0; height: 100vh; position: sticky; top: 0; }
        .logo { font-size: 18px; font-weight: 700; color: #fff; padding: 4px 12px 24px; letter-spacing: -0.5px; text-decoration: none; display: block; }
        .logo span { color: #e02020; }
        .nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; font-size: 13px; font-weight: 500; color: #555; cursor: pointer; transition: all 0.15s; border: none; background: none; width: 100%; text-align: left; }
        .nav-item:hover { background: #141414; color: #aaa; }
        .nav-item.active { background: #161616; color: #fff; }
        .nav-item svg { width: 15px; height: 15px; flex-shrink: 0; }
        .nav-section { font-size: 10px; color: #2a2a2a; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; padding: 16px 12px 6px; }
        .sidebar-spacer { flex: 1; }
        .logout-btn { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; font-size: 13px; font-weight: 500; color: #333; cursor: pointer; transition: all 0.15s; border: none; background: none; width: 100%; text-align: left; }
        .logout-btn:hover { color: #e02020; background: rgba(224,32,32,0.06); }

        /* Main */
        .main { flex: 1; padding: 32px 36px; overflow: auto; }
        .topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
        .page-title { font-size: 22px; font-weight: 700; color: #fff; letter-spacing: -0.5px; }
        .topbar-right { display: flex; align-items: center; gap: 10px; }
        .profile-chip { font-size: 12px; color: #333; background: #111; border: 1px solid #1a1a1a; border-radius: 999px; padding: 6px 14px; text-decoration: none; transition: all 0.15s; font-weight: 500; }
        .profile-chip:hover { color: #fff; border-color: #2a2a2a; }
        .avatar { width: 34px; height: 34px; border-radius: 50%; background: #e02020; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff; flex-shrink: 0; }

        /* Stats */
        .stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-bottom: 24px; }
        .stat-card { background: #0d0d0d; border: 1px solid #161616; border-radius: 12px; padding: 18px 20px; }
        .stat-label { font-size: 11px; color: #333; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .stat-val { font-size: 26px; font-weight: 700; color: #fff; letter-spacing: -0.5px; }
        .stat-badge { font-size: 12px; color: #e02020; font-weight: 500; margin-left: 6px; }

        /* Tabs */
        .tabs { display: flex; gap: 4px; margin-bottom: 24px; background: #0d0d0d; border: 1px solid #161616; border-radius: 10px; padding: 4px; width: fit-content; }
        .tab { padding: 7px 16px; border-radius: 7px; font-size: 13px; font-weight: 500; color: #444; cursor: pointer; transition: all 0.15s; border: none; background: none; }
        .tab.active { background: #161616; color: #fff; }
        .tab:hover:not(.active) { color: #888; }

        /* Editor */
        .editor-grid { display: grid; grid-template-columns: 1fr 320px; gap: 20px; }
        .editor-panel { background: #0d0d0d; border: 1px solid #161616; border-radius: 14px; padding: 24px; display: flex; flex-direction: column; gap: 20px; }
        .editor-section-title { font-size: 12px; color: #333; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
        .field-label { font-size: 12px; color: #444; font-weight: 500; margin-bottom: 6px; }
        .input { width: 100%; background: #111; border: 1px solid #1e1e1e; border-radius: 8px; padding: 10px 14px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; color: #fff; outline: none; transition: border-color 0.15s; resize: none; }
        .input:focus { border-color: rgba(224,32,32,0.4); }
        .input::placeholder { color: #2a2a2a; }
        .save-btn { padding: 10px 20px; background: #e02020; border: none; border-radius: 8px; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; align-self: flex-start; }
        .save-btn:hover { background: #c01010; }
        .save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .save-msg { font-size: 12px; color: #22c55e; font-weight: 500; }

        /* Links editor */
        .link-item { display: flex; align-items: center; gap: 10px; background: #111; border: 1px solid #1a1a1a; border-radius: 8px; padding: 10px 14px; }
        .link-item-title { font-size: 13px; color: #fff; font-weight: 500; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .link-item-url { font-size: 11px; color: #333; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .link-actions { display: flex; gap: 4px; flex-shrink: 0; }
        .link-action-btn { width: 26px; height: 26px; border-radius: 6px; border: none; background: #1a1a1a; color: #444; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 11px; transition: all 0.15s; }
        .link-action-btn:hover { background: #222; color: #fff; }
        .link-action-btn.del:hover { background: rgba(224,32,32,0.15); color: #e02020; }
        .add-link-row { display: flex; gap: 8px; }
        .add-link-btn { padding: 10px 16px; background: #161616; border: 1px solid #1e1e1e; border-radius: 8px; color: #888; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
        .add-link-btn:hover { background: #1e1e1e; color: #fff; }

        /* Preview */
        .preview-panel { background: #0d0d0d; border: 1px solid #161616; border-radius: 14px; padding: 20px; position: sticky; top: 32px; }
        .preview-label { font-size: 10px; color: #2a2a2a; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px; }
        .preview-card { background: #080808; border-radius: 12px; padding: 24px 20px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
        .preview-avatar-ring { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #CC0000, #ff4444); padding: 2px; margin-bottom: 4px; }
        .preview-avatar-inner { width: 100%; height: 100%; border-radius: 50%; background: #111; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 700; color: #fff; }
        .preview-name { font-size: 15px; font-weight: 700; color: #fff; }
        .preview-bio { font-size: 12px; color: #444; text-align: center; max-width: 220px; line-height: 1.5; }
        .preview-link { width: 100%; padding: 10px 16px; border-radius: 8px; background: #111; border: 1px solid #1a1a1a; color: #666; font-size: 12px; font-weight: 600; text-align: center; }
        .preview-powered { font-size: 10px; color: #1e1e1e; font-weight: 600; margin-top: 4px; }
        .preview-powered span { color: #e02020; opacity: 0.5; }
      `}</style>

      {/* Sidebar */}
      <nav className="sidebar">
        <a href="/" className="logo">fate<span>.rip</span></a>

        <div className="nav-section">Menu</div>

        <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></svg>
          Overview
        </button>

        <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>
          Profile
        </button>

        <button className={`nav-item ${activeTab === 'links' ? 'active' : ''}`} onClick={() => setActiveTab('links')}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 8a2 2 0 0 1 2-2h2a2 2 0 1 1 0 4H8"/><path d="M10 8a2 2 0 0 1-2 2H6a2 2 0 1 1 0-4h2"/></svg>
          Links
        </button>

        <button className={`nav-item ${activeTab === 'appearance' ? 'active' : ''}`} onClick={() => setActiveTab('appearance')}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 4v4l3 2"/></svg>
          Appearance
        </button>

        <div className="sidebar-spacer" />

        <button className="logout-btn" onClick={handleLogout}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="15" height="15"><path d="M6 3H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3"/><path d="M10 11l3-3-3-3"/><path d="M13 8H6"/></svg>
          Log out
        </button>
      </nav>

      {/* Main */}
      <div className="main">
        <div className="topbar">
          <div className="page-title">
            {activeTab === 'overview' && 'Overview'}
            {activeTab === 'profile' && 'Edit Profile'}
            {activeTab === 'links' && 'Manage Links'}
            {activeTab === 'appearance' && 'Appearance'}
          </div>
          <div className="topbar-right">
            <a className="profile-chip" href={`/${username}`} target="_blank">fate.rip/{username}</a>
            <div className="avatar">{initial}</div>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <div className="stats">
              <div className="stat-card">
                <div className="stat-label">Profile Views</div>
                <div className="stat-val">0<span className="stat-badge">+0%</span></div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Link Clicks</div>
                <div className="stat-val">0<span className="stat-badge">+0%</span></div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Links</div>
                <div className="stat-val">{links.length}</div>
              </div>
            </div>

            {/* Quick preview */}
            <div style={{ background: '#0d0d0d', border: '1px solid #161616', borderRadius: '14px', padding: '24px' }}>
              <div className="editor-section-title">Profile Preview</div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div className="preview-card" style={{ width: '100%', maxWidth: '340px' }}>
                  <div className="preview-avatar-ring">
                    <div className="preview-avatar-inner">{initial}</div>
                  </div>
                  <div className="preview-name">@{username}</div>
                  <div className="preview-bio">{bio || 'No bio yet.'}</div>
                  {links.length === 0 && <div className="preview-bio" style={{ color: '#222', marginTop: 8 }}>No links added yet.</div>}
                  {links.map((l, i) => <div key={i} className="preview-link">{l.title}</div>)}
                  <div className="preview-powered">powered by <span>fate.rip</span></div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="editor-grid">
            <div className="editor-panel">
              <div>
                <div className="editor-section-title">Profile Info</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <div className="field-label">Username</div>
                    <input className="input" value={username} disabled style={{ opacity: 0.4, cursor: 'not-allowed' }} />
                    <div style={{ fontSize: '11px', color: '#2a2a2a', marginTop: 4 }}>Username cannot be changed.</div>
                  </div>
                  <div>
                    <div className="field-label">Bio</div>
                    <textarea className="input" rows={4} placeholder="Tell the world about yourself..." value={bio} onChange={e => setBio(e.target.value)} maxLength={160} />
                    <div style={{ fontSize: '11px', color: '#2a2a2a', marginTop: 4 }}>{bio.length}/160</div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button className="save-btn" onClick={saveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                {saveMsg && <span className="save-msg">{saveMsg}</span>}
              </div>
            </div>

            {/* Live Preview */}
            <div className="preview-panel">
              <div className="preview-label">Live Preview</div>
              <div className="preview-card">
                <div className="preview-avatar-ring">
                  <div className="preview-avatar-inner">{initial}</div>
                </div>
                <div className="preview-name">@{username}</div>
                <div className="preview-bio">{bio || 'No bio yet.'}</div>
                {links.map((l, i) => <div key={i} className="preview-link">{l.title}</div>)}
                <div className="preview-powered">powered by <span>fate.rip</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Links Tab */}
        {activeTab === 'links' && (
          <div className="editor-grid">
            <div className="editor-panel">
              <div>
                <div className="editor-section-title">Your Links</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  {links.length === 0 && <div style={{ fontSize: '13px', color: '#2a2a2a', padding: '12px 0' }}>No links yet. Add one below!</div>}
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

                <div className="editor-section-title">Add Link</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input className="input" placeholder="Label (e.g. Twitter)" value={newLinkTitle} onChange={e => setNewLinkTitle(e.target.value)} />
                  <input className="input" placeholder="URL (e.g. https://twitter.com/you)" value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && addLink()} />
                  <button className="add-link-btn" onClick={addLink}>+ Add Link</button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button className="save-btn" onClick={saveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save Links'}</button>
                {saveMsg && <span className="save-msg">{saveMsg}</span>}
              </div>
            </div>

            {/* Live Preview */}
            <div className="preview-panel">
              <div className="preview-label">Live Preview</div>
              <div className="preview-card">
                <div className="preview-avatar-ring">
                  <div className="preview-avatar-inner">{initial}</div>
                </div>
                <div className="preview-name">@{username}</div>
                <div className="preview-bio">{bio || 'No bio yet.'}</div>
                {links.length === 0 && <div className="preview-bio" style={{ color: '#222' }}>No links added yet.</div>}
                {links.map((l, i) => <div key={i} className="preview-link">{l.title}</div>)}
                <div className="preview-powered">powered by <span>fate.rip</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div style={{ background: '#0d0d0d', border: '1px solid #161616', borderRadius: '14px', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: '28px' }}>🎨</div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>Appearance Editor</div>
            <div style={{ fontSize: '13px', color: '#333', textAlign: 'center' }}>Custom themes, fonts, and colors are coming soon.</div>
          </div>
        )}
      </div>
    </div>
  )
}