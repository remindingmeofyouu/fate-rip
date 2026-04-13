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
  const [activeTab, setActiveTab] = useState('customize')
  const [accountOpen, setAccountOpen] = useState(true)
  const [newLinkTitle, setNewLinkTitle] = useState('')
  const [newLinkUrl, setNewLinkUrl] = useState('')
  const [copied, setCopied] = useState(false)

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

  const shareProfile = () => {
    const url = `https://fate.rip/${username}`
    if (navigator.share) {
      navigator.share({ title: `@${username} on fate.rip`, url })
    } else {
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const initial = username ? username[0].toUpperCase() : '?'

  if (loading) {
    return (
      <div style={{ background: '#13111a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`}</style>
        <div style={{ color: '#555', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ background: '#13111a', minHeight: '100vh', fontFamily: 'Inter, sans-serif', display: 'flex' }}>
      <title>fate.rip | Dashboard</title>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* Sidebar */
        .sidebar { width: 240px; background: #1a1724; display: flex; flex-direction: column; flex-shrink: 0; height: 100vh; position: sticky; top: 0; overflow-y: auto; }
        .sidebar-top { padding: 20px 16px 8px; }
        .logo { font-size: 17px; font-weight: 700; color: #fff; letter-spacing: -0.3px; text-decoration: none; display: block; padding: 4px 8px 20px; }
        .logo span { color: #e02020; }

        /* Nav sections */
        .nav-section-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; border-radius: 10px; cursor: pointer; user-select: none; color: #aaa; font-size: 13px; font-weight: 600; transition: background 0.15s; }
        .nav-section-header:hover { background: rgba(255,255,255,0.05); }
        .nav-section-header svg { width: 14px; height: 14px; transition: transform 0.2s; }
        .nav-section-header.open svg { transform: rotate(180deg); }
        .nav-section-header-left { display: flex; align-items: center; gap: 10px; }
        .nav-section-header-left svg { width: 16px; height: 16px; opacity: 0.6; }

        .sub-nav { padding: 2px 0 6px 36px; display: flex; flex-direction: column; gap: 1px; }
        .sub-nav-item { padding: 6px 10px; border-radius: 8px; font-size: 12.5px; color: #666; cursor: pointer; transition: all 0.15s; border: none; background: none; text-align: left; width: 100%; }
        .sub-nav-item:hover { color: #aaa; background: rgba(255,255,255,0.04); }
        .sub-nav-item.active { color: #ddd; background: rgba(255,255,255,0.07); }

        .nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 10px; font-size: 13px; font-weight: 500; color: #777; cursor: pointer; transition: all 0.15s; border: none; background: none; width: 100%; text-align: left; }
        .nav-item:hover { background: rgba(255,255,255,0.05); color: #bbb; }
        .nav-item.active { background: #4a2d8a; color: #fff; }
        .nav-item svg { width: 16px; height: 16px; flex-shrink: 0; opacity: 0.8; }
        .nav-item.active svg { opacity: 1; }
        .nav-divider { height: 1px; background: rgba(255,255,255,0.05); margin: 8px 16px; }

        /* Sidebar bottom */
        .sidebar-bottom { margin-top: auto; padding: 16px; }
        .help-box { background: rgba(255,255,255,0.04); border-radius: 12px; padding: 14px; margin-bottom: 10px; }
        .help-title { font-size: 12px; color: #aaa; font-weight: 500; margin-bottom: 10px; line-height: 1.4; }
        .help-btn { display: flex; align-items: center; gap: 8px; width: 100%; padding: 9px 14px; border-radius: 8px; background: #4a2d8a; border: none; color: #fff; font-family: 'Inter', sans-serif; font-size: 12.5px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .help-btn:hover { background: #5a35a8; }
        .mypage-btn { display: flex; align-items: center; gap: 8px; width: 100%; padding: 9px 14px; border-radius: 8px; background: rgba(255,255,255,0.06); border: none; color: #bbb; font-family: 'Inter', sans-serif; font-size: 12.5px; font-weight: 600; cursor: pointer; transition: all 0.15s; margin-top: 8px; text-decoration: none; justify-content: center; }
        .mypage-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }

        .share-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 11px 14px; border-radius: 10px; background: #4a2d8a; border: none; color: #fff; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; margin-top: 10px; }
        .share-btn:hover { background: #5a35a8; }
        .share-btn.copied { background: #1a6b3c; }

        .user-row { display: flex; align-items: center; gap: 10px; padding: 12px 4px 4px; border-top: 1px solid rgba(255,255,255,0.06); margin-top: 10px; }
        .user-avatar { width: 34px; height: 34px; border-radius: 50%; background: #e02020; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff; flex-shrink: 0; }
        .user-name { font-size: 13px; font-weight: 600; color: #ddd; }
        .user-meta { font-size: 11px; color: #444; }
        .user-more { margin-left: auto; color: #333; font-size: 16px; cursor: pointer; padding: 4px; }
        .user-more:hover { color: #666; }

        /* Main */
        .main { flex: 1; padding: 32px 40px; overflow: auto; }
        .page-title { font-size: 20px; font-weight: 700; color: #fff; letter-spacing: -0.3px; margin-bottom: 24px; }

        /* Cards */
        .card { background: #1e1b2e; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; margin-bottom: 16px; }
        .card-title { font-size: 11px; color: #444; font-weight: 600; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 16px; }
        .field-label { font-size: 12px; color: #555; font-weight: 500; margin-bottom: 6px; }
        .input { width: 100%; background: #13111a; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 10px 14px; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; color: #ddd; outline: none; transition: border-color 0.15s; resize: none; }
        .input:focus { border-color: rgba(90,53,168,0.6); }
        .input::placeholder { color: #333; }
        .input:disabled { opacity: 0.3; cursor: not-allowed; }

        /* Link items */
        .link-item { display: flex; align-items: center; gap: 10px; background: #13111a; border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 11px 14px; margin-bottom: 8px; }
        .link-item-title { font-size: 13px; color: #ccc; font-weight: 500; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .link-item-url { font-size: 11px; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .link-actions { display: flex; gap: 4px; flex-shrink: 0; }
        .link-action-btn { width: 28px; height: 28px; border-radius: 7px; border: none; background: rgba(255,255,255,0.05); color: #444; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px; transition: all 0.15s; }
        .link-action-btn:hover { background: rgba(255,255,255,0.1); color: #aaa; }
        .link-action-btn.del:hover { background: rgba(224,32,32,0.12); color: #e02020; }

        .save-btn { padding: 10px 22px; background: #4a2d8a; border: none; border-radius: 9px; color: #fff; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .save-btn:hover { background: #5a35a8; }
        .save-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .save-msg { font-size: 12px; color: #22c55e; font-weight: 500; }

        .add-link-btn { padding: 10px 18px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 9px; color: #777; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; }
        .add-link-btn:hover { background: rgba(255,255,255,0.09); color: #ccc; }

        /* Overview stats */
        .stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
        .stat-card { background: #1e1b2e; border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 18px 20px; }
        .stat-label { font-size: 11px; color: #444; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .stat-val { font-size: 28px; font-weight: 700; color: #fff; letter-spacing: -0.5px; }

        /* Preview */
        .editor-grid { display: grid; grid-template-columns: 1fr 300px; gap: 16px; }
        .preview-panel { background: #1e1b2e; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 20px; position: sticky; top: 32px; }
        .preview-label { font-size: 10px; color: #333; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 14px; }
        .preview-card { background: #13111a; border-radius: 12px; padding: 24px 16px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
        .preview-avatar-ring { width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #CC0000, #ff4444); padding: 2px; margin-bottom: 4px; }
        .preview-avatar-inner { width: 100%; height: 100%; border-radius: 50%; background: #1a1724; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; color: #fff; }
        .preview-name { font-size: 14px; font-weight: 700; color: #fff; }
        .preview-bio { font-size: 11.5px; color: #444; text-align: center; max-width: 200px; line-height: 1.5; }
        .preview-link { width: 100%; padding: 9px 14px; border-radius: 8px; background: #1e1b2e; border: 1px solid rgba(255,255,255,0.07); color: #555; font-size: 12px; font-weight: 600; text-align: center; }
        .preview-powered { font-size: 10px; color: #222; font-weight: 600; margin-top: 4px; }
        .preview-powered span { color: #e02020; opacity: 0.4; }
      `}</style>

      {/* Sidebar */}
      <nav className="sidebar">
        <div className="sidebar-top">
          <a href="/" className="logo">fate<span>.rip</span></a>

          {/* Account collapsible */}
          <div
            className={`nav-section-header ${accountOpen ? 'open' : ''}`}
            onClick={() => setAccountOpen(!accountOpen)}
          >
            <div className="nav-section-header-left">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>
              Account
            </div>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6l4 4 4-4"/></svg>
          </div>

          {accountOpen && (
            <div className="sub-nav">
              <button className={`sub-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
              <button className="sub-nav-item">Analytics</button>
              <button className="sub-nav-item">Badges</button>
              <button className="sub-nav-item">Settings</button>
            </div>
          )}

          <div className="nav-divider" />

          <button className={`nav-item ${activeTab === 'customize' ? 'active' : ''}`} onClick={() => setActiveTab('customize')}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="5.5"/><circle cx="8" cy="8" r="2"/></svg>
            Customize
          </button>

          <button className={`nav-item ${activeTab === 'links' ? 'active' : ''}`} onClick={() => setActiveTab('links')}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 8a2 2 0 0 1 2-2h2a2 2 0 1 1 0 4H8"/><path d="M10 8a2 2 0 0 1-2 2H6a2 2 0 1 1 0-4h2"/></svg>
            Links
          </button>

          <button className="nav-item">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.3 5.3 12.3l.7-4.1-3-2.9 4.2-.7z"/></svg>
            Premium
          </button>

          <button className="nav-item">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="12" height="10" rx="1.5"/><path d="M5 7h6M5 10h4"/></svg>
            Image Host
          </button>

          <button className="nav-item">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></svg>
            Templates
          </button>
        </div>

        {/* Bottom */}
        <div className="sidebar-bottom">
          <div className="help-box">
            <div className="help-title">Have a question or need support?</div>
            <button className="help-btn">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14"><circle cx="8" cy="8" r="6"/><path d="M8 10v1"/><path d="M8 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>
              Help Center
            </button>
            <a className="mypage-btn" href={`/${username}`} target="_blank">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="13" height="13"><path d="M10 3h3v3"/><path d="M13 3L8 8"/><path d="M6 4H4a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-2"/></svg>
              My Page
            </a>
          </div>

          <button className={`share-btn ${copied ? 'copied' : ''}`} onClick={shareProfile}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14"><circle cx="12" cy="4" r="1.5"/><circle cx="4" cy="8" r="1.5"/><circle cx="12" cy="12" r="1.5"/><path d="M5.5 7.1l5 -2.2M5.5 8.9l5 2.2"/></svg>
            {copied ? 'Copied!' : 'Share Your Profile'}
          </button>

          <div className="user-row">
            <div className="user-avatar">{initial}</div>
            <div>
              <div className="user-name">{username}</div>
              <div className="user-meta">fate.rip/{username}</div>
            </div>
            <button className="user-more" onClick={handleLogout} title="Log out">···</button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="main">

        {/* Overview */}
        {activeTab === 'overview' && (
          <>
            <div className="page-title">Overview</div>
            <div className="stats">
              <div className="stat-card">
                <div className="stat-label">Profile Views</div>
                <div className="stat-val">0</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Link Clicks</div>
                <div className="stat-val">0</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Links</div>
                <div className="stat-val">{links.length}</div>
              </div>
            </div>
            <div className="card">
              <div className="card-title">Profile Preview</div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div className="preview-card" style={{ width: '100%', maxWidth: '320px' }}>
                  <div className="preview-avatar-ring">
                    <div className="preview-avatar-inner">{initial}</div>
                  </div>
                  <div className="preview-name">@{username}</div>
                  <div className="preview-bio">{bio || 'No bio yet.'}</div>
                  {links.length === 0 && <div className="preview-bio" style={{ color: '#222', marginTop: 4 }}>No links added yet.</div>}
                  {links.map((l, i) => <div key={i} className="preview-link">{l.title}</div>)}
                  <div className="preview-powered">powered by <span>fate.rip</span></div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Customize (profile editor) */}
        {activeTab === 'customize' && (
          <>
            <div className="page-title">Customize</div>
            <div className="editor-grid">
              <div>
                <div className="card">
                  <div className="card-title">Profile Info</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <div className="field-label">Username</div>
                      <input className="input" value={username} disabled />
                      <div style={{ fontSize: '11px', color: '#333', marginTop: 4 }}>Username cannot be changed.</div>
                    </div>
                    <div>
                      <div className="field-label">Bio</div>
                      <textarea className="input" rows={4} placeholder="Tell the world about yourself..." value={bio} onChange={e => setBio(e.target.value)} maxLength={160} />
                      <div style={{ fontSize: '11px', color: '#333', marginTop: 4 }}>{bio.length}/160</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 20 }}>
                    <button className="save-btn" onClick={saveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                    {saveMsg && <span className="save-msg">{saveMsg}</span>}
                  </div>
                </div>
              </div>

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
          </>
        )}

        {/* Links */}
        {activeTab === 'links' && (
          <>
            <div className="page-title">Links</div>
            <div className="editor-grid">
              <div>
                <div className="card">
                  <div className="card-title">Your Links</div>
                  {links.length === 0 && <div style={{ fontSize: '13px', color: '#333', padding: '8px 0 16px' }}>No links yet. Add one below!</div>}
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

                  <div className="card-title" style={{ marginTop: 20 }}>Add Link</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input className="input" placeholder="Label (e.g. Twitter)" value={newLinkTitle} onChange={e => setNewLinkTitle(e.target.value)} />
                    <input className="input" placeholder="URL (e.g. https://twitter.com/you)" value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && addLink()} />
                    <button className="add-link-btn" onClick={addLink}>+ Add Link</button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 20 }}>
                    <button className="save-btn" onClick={saveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save Links'}</button>
                    {saveMsg && <span className="save-msg">{saveMsg}</span>}
                  </div>
                </div>
              </div>

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
          </>
        )}
      </div>
    </div>
  )
}