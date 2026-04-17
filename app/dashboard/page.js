'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [uid, setUid] = useState('')
  const [bio, setBio] = useState('')
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [activePage, setActivePage] = useState('overview')
  const [newLinkTitle, setNewLinkTitle] = useState('')
  const [newLinkUrl, setNewLinkUrl] = useState('')
  const [uploadingType, setUploadingType] = useState(null)
  const [displayName, setDisplayName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showUidTooltip, setShowUidTooltip] = useState(false)
  const [copied, setCopied] = useState(false)

  const [appBio, setAppBio] = useState('')
  const [discordPresence, setDiscordPresence] = useState('Enabled')
  const [usernameFx, setUsernameFx] = useState('')
  const [opacity, setOpacity] = useState(100)
  const [bgFx, setBgFx] = useState('none')
  const [blur, setBlur] = useState(0)
  const [location, setLocation] = useState('')
  const [glowState, setGlowState] = useState({ username: true, socials: true, badges: false })
  const [bgPreview, setBgPreview] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [cursorPreview, setCursorPreview] = useState(null)
  const [audioName, setAudioName] = useState(null)
  const [appSaveMsg, setAppSaveMsg] = useState('')

  const fileBgRef = useRef()
  const fileAvatarRef = useRef()
  const fileCursorRef = useRef()
  const fileAudioRef = useRef()

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      // UID is now pulled from the DB row id (auto-increment), not auth UUID
      const { data } = await supabase
        .from('users').select('*').eq('email', session.user.email).single()
      if (data) {
        setUsername(data.username || '')
        setBio(data.bio || '')
        setLinks(data.links || [])
        setAppBio(data.bio || '')
        setOpacity(data.opacity ?? 100)
        setBlur(data.blur ?? 0)
        setUsernameFx(data.username_fx || '')
        setBgFx(data.bg_fx || 'none')
        setLocation(data.location || '')
        setGlowState(data.glow_settings || { username: true, socials: true, badges: false })
        setDiscordPresence(data.discord_presence || 'Enabled')
        if (data.avatar_url) setAvatarPreview(data.avatar_url)
        setDisplayName(data.display_name || '')
        if (data.bg_url) setBgPreview(data.bg_url)
        if (data.cursor_url) setCursorPreview(data.cursor_url)
        if (data.audio_url) setAudioName('Uploaded ✓')
        // FIX: use the table's auto-increment id as UID
        setUid(data.id ? String(data.id) : '')
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
    setSaving(true); setSaveMsg('')
    const { error } = await supabase.from('users').update({ bio, links }).eq('username', username)
    setSaving(false)
    if (error) { setSaveMsg('Failed to save.') }
    else { setSaveMsg('Saved!'); setTimeout(() => setSaveMsg(''), 2000) }
  }

  const saveAppearance = async () => {
    setSaving(true); setAppSaveMsg('')
    const { error } = await supabase.from('users').update({
      bio: appBio, opacity, blur, username_fx: usernameFx,
      bg_fx: bgFx, location, glow_settings: glowState, discord_presence: discordPresence,
    }).eq('username', username)
    setSaving(false)
    if (!error) setBio(appBio)
    setAppSaveMsg(error ? 'Failed to save.' : 'Saved!')
    setTimeout(() => setAppSaveMsg(''), 2000)
  }

  const handleFileUpload = async (type, file) => {
    if (!file) return
    setUploadingType(type)
    const ext = file.name.split('.').pop()
    const bucket = type === 'audio' ? 'audio' : 'images'
    const path = `${username}/${type}-${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    if (uploadError) { console.error('Upload error:', uploadError); setUploadingType(null); return }
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)
    const url = urlData.publicUrl
    const colMap = { bg: 'bg_url', avatar: 'avatar_url', cursor: 'cursor_url', audio: 'audio_url' }
    await supabase.from('users').update({ [colMap[type]]: url }).eq('username', username)
    if (type === 'bg') setBgPreview(url)
    else if (type === 'avatar') setAvatarPreview(url)
    else if (type === 'cursor') setCursorPreview(url)
    else if (type === 'audio') setAudioName(file.name)
    setUploadingType(null)
  }

  const removeAsset = async (type) => {
    const colMap = { bg: 'bg_url', avatar: 'avatar_url', cursor: 'cursor_url', audio: 'audio_url' }
    await supabase.from('users').update({ [colMap[type]]: null }).eq('username', username)
    if (type === 'bg') setBgPreview(null)
    else if (type === 'avatar') setAvatarPreview(null)
    else if (type === 'cursor') setCursorPreview(null)
    else if (type === 'audio') setAudioName(null)
  }

  const addLink = () => {
    if (!newLinkTitle.trim()) return
    const url = newLinkUrl.trim().startsWith('http') ? newLinkUrl.trim() : `https://${newLinkUrl.trim()}`
    setLinks([...links, { title: newLinkTitle.trim(), url: newLinkUrl.trim() ? url : '#' }])
    setNewLinkTitle(''); setNewLinkUrl('')
  }
  const removeLink = (i) => setLinks(links.filter((_, idx) => idx !== i))
  const moveLink = (i, dir) => {
    const arr = [...links]; const swap = i + dir
    if (swap < 0 || swap >= arr.length) return
    ;[arr[i], arr[swap]] = [arr[swap], arr[i]]; setLinks(arr)
  }
  const toggleGlow = (key) => setGlowState(prev => ({ ...prev, [key]: !prev[key] }))

  const navTo = (page) => { setActivePage(page); setSidebarOpen(false) }

  const handleCopyUid = () => {
    if (uid) {
      navigator.clipboard.writeText(uid).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      })
    }
  }

  const handleShareProfile = () => {
    const url = `${window.location.origin}/${username}`
    if (navigator.share) {
      navigator.share({ title: `${username}'s profile`, url })
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setSaveMsg('Profile link copied!')
        setTimeout(() => setSaveMsg(''), 2000)
      })
    }
  }

  const previewNameStyle = (() => {
    if (usernameFx === 'rainbow') return { background: 'linear-gradient(90deg,#ff0,#0f0,#0ff,#f0f,#f00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }
    if (usernameFx === 'gold') return { background: 'linear-gradient(90deg,#b8860b,#ffd700,#b8860b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }
    if (usernameFx === 'neon') return { color: '#ff2340', textShadow: '0 0 8px rgba(255,35,64,0.8)' }
    if (usernameFx === 'glitch') return { color: '#fff', animation: 'glitch 0.4s infinite' }
    if (glowState.username) return { textShadow: '0 0 12px rgba(196,0,29,0.5)' }
    return {}
  })()

  const previewOverlayStyle = (() => {
    if (bgFx === 'nighttime') return { background: 'linear-gradient(180deg, rgba(5,5,12,0.3) 0%, rgba(20,0,40,0.4) 100%)' }
    if (bgFx === 'particles') return { background: 'radial-gradient(circle at 20% 80%, rgba(196,0,29,0.15) 0%, transparent 50%)' }
    if (bgFx === 'matrix') return { background: 'linear-gradient(180deg, rgba(0,30,10,0.4) 0%, rgba(0,60,20,0.2) 100%)' }
    if (bgFx === 'rain') return { background: 'linear-gradient(180deg, rgba(0,10,30,0.4) 0%, rgba(0,20,60,0.2) 100%)' }
    if (bgFx === 'snow') return { background: 'linear-gradient(180deg, rgba(200,220,255,0.05) 0%, rgba(180,200,255,0.1) 100%)' }
    return {}
  })()

  const initial = username ? username[0].toUpperCase() : '?'

  if (loading) return (
    <div style={{ background: '#050506', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#7a7a8a', fontFamily: 'system-ui, sans-serif', fontSize: '14px' }}>Loading...</div>
    </div>
  )

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
      { id: 'templates', label: 'Templates' },
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
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(196,0,29,0.3); border-radius: 4px; }

        .mobile-topbar { display: none; position: fixed; top: 0; left: 0; right: 0; height: 56px; background: #050506; border-bottom: 1px solid rgba(196,0,29,0.35); z-index: 200; align-items: center; justify-content: space-between; padding: 0 16px; }
        .mobile-logo { font-size: 20px; font-weight: 800; letter-spacing: 1px; }
        .mobile-logo .fate { color: #ff2340; } .mobile-logo .rip { color: #fff; }
        .hamburger { background: none; border: none; cursor: pointer; display: flex; flex-direction: column; gap: 5px; padding: 4px; }
        .hamburger span { display: block; width: 22px; height: 2px; background: #fff; border-radius: 2px; transition: all .2s; }

        .sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 149; }
        .sidebar-overlay.open { display: block; }

        .sidebar { width: 250px; background: linear-gradient(180deg,#050506 0%,#09090d 40%,#050506 100%); border-right: 1px solid rgba(196,0,29,0.35); padding: 26px 20px 20px; display: flex; flex-direction: column; gap: 26px; flex-shrink: 0; overflow-y: auto; height: 100vh; transition: transform .25s ease; }
        .logo { font-size: 26px; font-weight: 800; letter-spacing: 1.2px; text-decoration: none; display: block; }
        .logo .fate { color: #ff2340; } .logo .rip { color: #fff; }
        .logo-sub { font-size: 11px; color: #b8b8c4; margin-top: 4px; letter-spacing: 0.16em; text-transform: uppercase; }
        .nav-section { display: flex; flex-direction: column; gap: 8px; }
        .nav-title { font-size: 12px; color: #7a7a8a; margin-bottom: 4px; letter-spacing: 0.16em; text-transform: uppercase; }
        .nav-item { padding: 9px 11px; border-radius: 10px; border: 1px solid transparent; cursor: pointer; transition: border .15s, background .15s, color .15s; font-size: 13px; color: #b8b8c4; display: flex; align-items: center; justify-content: space-between; background: none; width: 100%; text-align: left; font-family: inherit; }
        .nav-item:hover, .nav-item.active { border-color: #c4001d; background: rgba(196,0,29,0.08); color: #fff; }
        .nav-item .chevron { font-size: 11px; opacity: 0.7; }

        .sidebar-bottom { margin-top: auto; display: flex; flex-direction: column; gap: 0; }
        .sidebar-support-panel { border: 1px solid rgba(196,0,29,0.3); border-radius: 14px; background: rgba(196,0,29,0.04); padding: 14px 14px 12px; margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px; }
        .support-label { font-size: 11px; color: #7a7a8a; }
        .support-btn { display: flex; align-items: center; gap: 8px; width: 100%; padding: 9px 12px; border-radius: 10px; border: 1px solid rgba(196,0,29,0.3); background: rgba(196,0,29,0.06); color: #b8b8c4; font-size: 12px; font-weight: 500; cursor: pointer; font-family: inherit; transition: all .15s; text-decoration: none; }
        .support-btn:hover { border-color: #c4001d; background: rgba(196,0,29,0.15); color: #fff; transform: translateY(-1px); }
        .support-btn svg { flex-shrink: 0; }
        .support-btn-icon { width: 24px; height: 24px; border-radius: 7px; background: rgba(196,0,29,0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .share-profile-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 10px 14px; border-radius: 12px; border: none; background: linear-gradient(135deg, #c4001d, #ff2340); color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all .15s; margin-bottom: 10px; }
        .share-profile-btn:hover { opacity: 0.9; transform: translateY(-1px); }

        .sidebar-user-row { border-top: 1px solid rgba(196,0,29,0.2); padding-top: 10px; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .sidebar-user-info { position: relative; cursor: pointer; flex: 1; min-width: 0; }
        .sidebar-username { font-size: 13px; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 5px; }
        .sidebar-uid { font-size: 11px; color: #7a7a8a; }
        .uid-tooltip { position: absolute; bottom: calc(100% + 8px); left: 0; background: #111114; border: 1px solid rgba(196,0,29,0.5); border-radius: 10px; padding: 8px 12px; font-size: 11px; color: #b8b8c4; white-space: nowrap; z-index: 100; box-shadow: 0 4px 20px rgba(0,0,0,0.6); animation: fadeInUp .15s ease; pointer-events: none; }
        .uid-tooltip .uid-val { color: #ff2340; font-weight: 600; font-family: monospace; font-size: 12px; }
        .uid-tooltip::after { content: ''; position: absolute; top: 100%; left: 14px; border: 5px solid transparent; border-top-color: rgba(196,0,29,0.5); }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .logout-link { color: #7a7a8a; cursor: pointer; font-size: 11px; background: none; border: none; font-family: inherit; padding: 0; transition: color .15s; flex-shrink: 0; }
        .logout-link:hover { color: #ff2340; }

        .main { flex: 1; padding: 32px 40px; overflow-y: auto; }
        .page-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 22px; flex-wrap: wrap; }
        .page-breadcrumb { font-size: 11px; color: #7a7a8a; letter-spacing: 0.16em; text-transform: uppercase; }
        .page-title { font-size: 24px; font-weight: 600; color: #ff2340; letter-spacing: 0.4px; margin: 2px 0; }
        .page-subtitle { font-size: 12px; color: #b8b8c4; }
        .back-button { border-radius: 999px; border: 1px solid rgba(196,0,29,0.35); background: rgba(10,10,13,0.9); color: #b8b8c4; font-size: 11px; padding: 6px 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all .15s; font-family: inherit; flex-shrink: 0; margin-top: 4px; }
        .back-button:hover { border-color: #c4001d; background: rgba(196,0,29,0.12); color: #fff; transform: translateY(-1px); }
        .panel { background: #111114; border: 1px solid rgba(196,0,29,0.35); border-radius: 16px; padding: 20px; margin-bottom: 22px; }
        .panel-header { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
        .panel h2 { margin: 0; font-size: 17px; color: #ff2340; }
        .panel-note { font-size: 11px; color: #7a7a8a; }
        .panel-body { font-size: 13px; color: #b8b8c4; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 14px; margin-bottom: 22px; }
        .stat-card { background: #141419; border-radius: 12px; border: 1px solid rgba(196,0,29,0.35); padding: 10px 12px; font-size: 12px; }
        .stat-label { color: #7a7a8a; margin-bottom: 4px; }
        .stat-value { font-size: 16px; font-weight: 600; color: #fff; }
        .stat-sub { font-size: 11px; color: #b8b8c4; margin-top: 2px; }
        .overview-grid { display: grid; grid-template-columns: 1fr 280px; gap: 18px; align-items: start; }
        .progress-bar-bg { width: 100%; height: 8px; border-radius: 999px; background: #15151c; overflow: hidden; border: 1px solid rgba(196,0,29,0.35); margin: 8px 0 4px; }
        .progress-bar-fill { height: 100%; background: linear-gradient(90deg,#c4001d,#ff2340); transition: width 0.5s; }
        .progress-label { font-size: 11px; color: #7a7a8a; }
        .button-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
        .field { display: flex; flex-direction: column; margin-bottom: 14px; }
        .field label { font-size: 13px; margin-bottom: 6px; color: #b8b8c4; }
        .input { background: #0c0c10; border: 1px solid rgba(196,0,29,0.35); border-radius: 12px; padding: 10px 12px; color: #fff; font-size: 13px; outline: none; transition: border .15s, background .15s; font-family: inherit; width: 100%; resize: none; }
        .input:focus { border-color: #c4001d; background: #101018; }
        .input:disabled { opacity: 0.3; cursor: not-allowed; }
        .input::placeholder { color: #2a2a2a; }
        .button { background: linear-gradient(135deg,#c4001d,#ff2340); border: none; padding: 11px 16px; border-radius: 14px; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity .15s, transform .15s; font-family: inherit; }
        .button:hover { opacity: .9; transform: translateY(-1px); }
        .button:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .button-secondary { background: transparent; border-radius: 999px; border: 1px solid rgba(196,0,29,0.35); color: #b8b8c4; padding: 8px 14px; font-size: 12px; cursor: pointer; transition: all .15s; font-family: inherit; }
        .button-secondary:hover { border-color: #c4001d; background: rgba(196,0,29,0.12); color: #fff; transform: translateY(-1px); }
        .save-bar { margin-top: 10px; display: flex; align-items: center; gap: 12px; justify-content: flex-end; flex-wrap: wrap; }
        .save-msg { font-size: 12px; color: #22c55e; font-weight: 500; }
        .link-item { display: flex; align-items: center; gap: 10px; background: #0c0c10; border: 1px solid rgba(196,0,29,0.2); border-radius: 10px; padding: 10px 14px; margin-bottom: 8px; }
        .link-item-title { font-size: 13px; color: #ddd; font-weight: 500; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .link-item-url { font-size: 11px; color: #444; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .link-actions { display: flex; gap: 4px; flex-shrink: 0; }
        .link-action-btn { width: 28px; height: 28px; border-radius: 7px; border: none; background: rgba(255,255,255,0.05); color: #555; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px; transition: all .15s; }
        .link-action-btn:hover { background: rgba(255,255,255,0.1); color: #aaa; }
        .link-action-btn.del:hover { background: rgba(196,0,29,0.15); color: #ff2340; }
        .badge-grid { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 10px; }
        .badge-card { border-radius: 12px; border: 1px dashed rgba(196,0,29,0.35); padding: 10px; font-size: 11px; color: #7a7a8a; text-align: center; }
        .settings-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
        .settings-pill { border-radius: 999px; border: 1px solid rgba(196,0,29,0.35); padding: 7px 12px; font-size: 12px; color: #b8b8c4; }
        .graph-legend { margin-top: 8px; font-size: 11px; color: #7a7a8a; }
        .theme-row { display: flex; gap: 12px; margin-top: 10px; }
        .theme-box { width: 60px; height: 40px; border-radius: 10px; border: 2px solid rgba(196,0,29,0.35); cursor: pointer; transition: all .15s; }
        .theme-box:hover { border-color: #c4001d; transform: translateY(-1px); }
        .section-title { font-size: 16px; font-weight: 600; color: #fff; margin: 0 0 14px; }
        .assets-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 22px; }
        .asset-card { background: #111114; border: 1px solid rgba(196,0,29,0.3); border-radius: 12px; padding: 14px 12px 12px; cursor: pointer; transition: border-color .15s, background .15s; }
        .asset-card:hover { border-color: #ff2340; background: #16161c; }
        .asset-label { font-size: 12px; color: #b8b8c4; margin-bottom: 10px; font-weight: 500; }
        .asset-drop { border: 1px dashed rgba(196,0,29,0.4); border-radius: 10px; padding: 24px 10px; display: flex; flex-direction: column; align-items: center; gap: 7px; cursor: pointer; transition: border-color .15s, background .15s; min-height: 90px; height: 90px; justify-content: center; position: relative; overflow: hidden; }
        .asset-drop:hover { border-color: #ff2340; background: rgba(196,0,29,0.05); }
        .asset-drop.has-preview { border-style: solid; border-color: rgba(196,0,29,0.5); padding: 0; }
        .asset-drop-text { font-size: 11px; color: #7a7a8a; text-align: center; line-height: 1.4; }
        .asset-preview-img { width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; border-radius: 9px; display: block; }
        .asset-remove-btn { position: absolute; top: 5px; right: 5px; width: 20px; height: 20px; background: rgba(196,0,29,0.8); border: none; border-radius: 50%; color: #fff; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 2; }
        .premium-banner { background: linear-gradient(135deg,#1a0a2e 0%,#0d0516 50%,#120818 100%); border: 1px solid rgba(130,60,255,0.3); border-radius: 999px; padding: 14px 28px; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 22px; cursor: pointer; transition: border-color .15s; flex-wrap: wrap; }
        .premium-banner:hover { border-color: rgba(160,100,255,0.6); }
        .premium-banner span { font-size: 14px; color: #ccc; }
        .premium-banner .prem { color: #b06aff; font-weight: 600; display: flex; align-items: center; gap: 5px; }
        .customization-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 14px; }
        .custom-group { display: flex; flex-direction: column; gap: 7px; }
        .custom-label { font-size: 12px; color: #7a7a8a; font-weight: 500; display: flex; align-items: center; gap: 5px; }
        .custom-label .info { width: 14px; height: 14px; border-radius: 50%; border: 1px solid #7a7a8a; display: inline-flex; align-items: center; justify-content: center; font-size: 9px; cursor: default; }
        .custom-input { background: #0c0c10; border: 1px solid rgba(196,0,29,0.3); border-radius: 9px; padding: 9px 10px; color: #fff; font-size: 12px; outline: none; font-family: inherit; width: 100%; transition: border-color .15s; resize: none; }
        .custom-input:focus { border-color: #c4001d; }
        .custom-input::placeholder { color: #333; }
        .custom-select { background: #0c0c10; border: 1px solid rgba(196,0,29,0.3); border-radius: 9px; padding: 9px 10px; color: #fff; font-size: 12px; outline: none; font-family: inherit; width: 100%; appearance: none; cursor: pointer; transition: border-color .15s; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%237a7a8a'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; }
        .custom-select:focus { border-color: #c4001d; }
        .slider-row { display: flex; flex-direction: column; gap: 6px; }
        .slider-value { font-size: 11px; color: #b8b8c4; font-weight: 600; }
        .slider-ticks { display: flex; justify-content: space-between; font-size: 10px; color: #7a7a8a; margin-top: 2px; }
        input[type="range"] { width: 100%; accent-color: #c4001d; cursor: pointer; height: 3px; }
        .glow-btn { background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.35); border-radius: 9px; color: #22c55e; font-size: 12px; font-weight: 600; padding: 9px 12px; cursor: pointer; transition: all .15s; font-family: inherit; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .glow-btn:hover { background: rgba(34,197,94,0.25); }
        .glow-btn.inactive { background: #0c0c10; border-color: rgba(196,0,29,0.3); color: #7a7a8a; }
        .glow-btn.inactive:hover { border-color: #c4001d; color: #b8b8c4; }
        .live-preview-box { background: #111114; border: 1px solid rgba(196,0,29,0.35); border-radius: 14px; padding: 18px; margin-top: 14px; }
        .live-preview-title { font-size: 12px; color: #7a7a8a; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
        .live-dot { width: 7px; height: 7px; border-radius: 50%; background: #ff2340; animation: pulse 1.5s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)} }
        @keyframes glitch { 0%,100%{text-shadow:2px 0 #ff0000,-2px 0 #0000ff} 25%{text-shadow:-2px 0 #ff0000,2px 0 #0000ff} 50%{text-shadow:2px 2px #ff0000,-2px -2px #0000ff} 75%{text-shadow:-2px 2px #ff0000,2px -2px #0000ff} }
        .profile-preview { background: #09090d; border-radius: 14px; padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 10px; min-height: 140px; position: relative; overflow: hidden; transition: all .3s; }
        .prev-avatar { width: 64px; height: 64px; border-radius: 50%; background: radial-gradient(circle at 30% 0%,#ff4d5f,#c4001d 50%,#5a000c); display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; flex-shrink: 0; transition: all .3s; overflow: hidden; }
        .prev-name { font-size: 15px; font-weight: 700; transition: all .3s; }
        .prev-desc { font-size: 12px; color: #b8b8c4; text-align: center; max-width: 200px; }
        .prev-bg-overlay { position: absolute; inset: 0; pointer-events: none; transition: all .3s; }
        .prev-bg-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; border-radius: 14px; z-index: 0; }
        .prev-content { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; }
        .app-save-row { display: flex; align-items: center; justify-content: flex-end; gap: 10px; margin-top: 16px; flex-wrap: wrap; }
        .uploading-indicator { font-size: 11px; color: #f59e0b; display: flex; align-items: center; gap: 4px; }
        .settings-field-row { display: flex; gap: 8px; }

        @media (max-width: 768px) {
          .mobile-topbar { display: flex; }
          .sidebar { position: fixed; top: 0; left: 0; height: 100vh; z-index: 150; transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); }
          .main { padding: 80px 16px 24px; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .overview-grid { grid-template-columns: 1fr; }
          .assets-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .customization-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
          .badge-grid { grid-template-columns: repeat(2, 1fr); }
          .premium-banner { border-radius: 14px; padding: 12px 16px; text-align: center; }
          .page-title { font-size: 20px; }
          .settings-field-row { flex-direction: column; }
          .save-bar { justify-content: flex-start; }
          .app-save-row { justify-content: flex-start; }
          .panel { padding: 14px; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr 1fr; }
          .customization-grid { grid-template-columns: 1fr; }
          .assets-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      {/* Mobile Top Bar */}
      <div className="mobile-topbar">
        <div className="mobile-logo"><span className="fate">FATE.</span><span className="rip">RIP</span></div>
        <button className="hamburger" onClick={() => setSidebarOpen(o => !o)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>

      {/* Overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div>
          <a href="/" className="logo"><span className="fate">FATE.</span><span className="rip">RIP</span></a>
          <div className="logo-sub">Profile Control Surface</div>
        </div>
        {navSections.map(({ section, items }) => (
          <div className="nav-section" key={section}>
            <div className="nav-title">{section}</div>
            {items.map(item => (
              <button key={item.id} className={`nav-item ${activePage === item.id ? 'active' : ''}`} onClick={() => navTo(item.id)}>
                <span>{item.label}</span><span className="chevron">›</span>
              </button>
            ))}
          </div>
        ))}

        {/* Bottom Panel */}
        <div className="sidebar-bottom">
          <div className="sidebar-support-panel">
            <div>
              <div className="support-label" style={{ marginBottom: 6 }}>Have a question or need support?</div>
              <a href="https://discord.gg/faterip" target="_blank" rel="noopener noreferrer" className="support-btn">
                <div className="support-btn-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#b8b8c4">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                  </svg>
                </div>
                Help Center
              </a>
            </div>
            <div>
              <div className="support-label" style={{ marginBottom: 6 }}>Check out your page</div>
              <a href={username ? `/${username}` : '/'} target="_blank" rel="noopener noreferrer" className="support-btn">
                <div className="support-btn-icon">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#b8b8c4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </div>
                My Page
              </a>
            </div>
          </div>

          <button className="share-profile-btn" onClick={handleShareProfile}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Share Your Profile
          </button>

          <div className="sidebar-user-row">
            <div
              className="sidebar-user-info"
              onMouseEnter={() => setShowUidTooltip(true)}
              onMouseLeave={() => setShowUidTooltip(false)}
              onClick={handleCopyUid}
              title="Click to copy UID"
            >
              {showUidTooltip && (
                <div className="uid-tooltip">
                  {copied ? <span style={{ color: '#22c55e' }}>✓ Copied!</span> : <>UID: <span className="uid-val">{uid || 'N/A'}</span> · click to copy</>}
                </div>
              )}
              <div className="sidebar-username">
                <span>{username || 'User'}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#7a7a8a" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
              </div>
              <div className="sidebar-uid">UID {uid || '—'}</div>
            </div>
            <button className="logout-link" onClick={handleLogout}>← Log Out</button>
          </div>
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
            <div className="stats-grid">
              <div className="stat-card"><div className="stat-label">Username</div><div className="stat-value">{username || '—'}</div><div className="stat-sub">Primary Handle</div></div>
              <div className="stat-card"><div className="stat-label">Alias</div><div className="stat-value">0 Used</div><div className="stat-sub">1 Slot Remaining</div></div>
              <div className="stat-card"><div className="stat-label">Links</div><div className="stat-value">{links.length}</div><div className="stat-sub">Active Links</div></div>
              <div className="stat-card"><div className="stat-label">Profile Views</div><div className="stat-value">0</div><div className="stat-sub">Last 7 Days</div></div>
            </div>
            <div className="overview-grid">
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 14 }}>Account Statistics</div>
                <div className="panel">
                  {(() => {
                    const steps = [!!bio, links.length > 0, !!avatarPreview]
                    const pct = Math.round((steps.filter(Boolean).length / steps.length) * 100)
                    return (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                          <div className="progress-bar-bg" style={{ flex: 1, margin: 0 }}>
                            <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <span style={{ fontSize: 12, color: '#7a7a8a', flexShrink: 0 }}>{pct}% completed</span>
                        </div>
                        <div style={{ background: 'rgba(196,0,29,0.07)', border: '1px solid rgba(196,0,29,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                            <span style={{ fontSize: 14, color: '#f59e0b' }}>⚠</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Your profile isn't complete yet!</span>
                          </div>
                          <div style={{ fontSize: 12, color: '#7a7a8a' }}>Complete your profile to make it more discoverable.</div>
                        </div>
                        {[
                          { label: 'Upload An Avatar', done: !!avatarPreview, onClick: () => navTo('customize') },
                          { label: 'Add A Description', done: !!bio, onClick: () => navTo('customize') },
                          { label: 'Add Links', done: links.length > 0, onClick: () => navTo('links') },
                          { label: 'Reach 10 Profile Views', done: false, onClick: null },
                        ].map((step, i) => (
                          <div key={i} onClick={step.onClick || undefined} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#0d0d10', border: '1px solid rgba(196,0,29,0.15)', borderRadius: 10, padding: '10px 14px', marginBottom: 8, cursor: step.onClick ? 'pointer' : 'default' }}>
                            <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, background: step.done ? 'rgba(34,197,94,0.15)' : 'rgba(196,0,29,0.1)', border: `1px solid ${step.done ? 'rgba(34,197,94,0.4)' : 'rgba(196,0,29,0.3)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: step.done ? '#22c55e' : '#ff2340' }}>
                              {step.done ? '✓' : '!'}
                            </div>
                            <span style={{ fontSize: 13, color: step.done ? '#22c55e' : '#b8b8c4' }}>{step.label}</span>
                            {!step.done && step.onClick && <span style={{ marginLeft: 'auto', fontSize: 12, color: '#444' }}>›</span>}
                          </div>
                        ))}
                      </>
                    )
                  })()}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="panel" style={{ padding: '18px 16px' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Manage your account</div>
                  <div style={{ fontSize: 11, color: '#7a7a8a', marginBottom: 14 }}>Change your email, username and more.</div>
                  {[{ label: 'Change Username', page: 'settings' }, { label: 'Change Display Name', page: 'customize' }, { label: 'Account Settings', page: 'settings' }].map((item, i) => (
                    <button key={i} onClick={() => navTo(item.page)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', marginBottom: 6, background: '#0d0d10', border: '1px solid rgba(196,0,29,0.2)', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', color: '#b8b8c4', fontSize: 12, textAlign: 'left' }}>
                      ✎ {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS */}
        {activePage === 'analytics' && (
          <div>
            <div className="page-title-row">
              <div><div className="page-breadcrumb">ACCOUNT • ANALYTICS</div><div className="page-title">Analytics</div></div>
              <button className="back-button" onClick={() => navTo('overview')}>← Back</button>
            </div>
            <div className="panel">
              <div className="panel-header"><h2>Profile Views (Last 7 Days)</h2><div className="panel-note">Coming Soon</div></div>
              <div className="panel-body">
                <div style={{ height: 160, background: 'linear-gradient(180deg,#0d0d10,#09090d)', border: '1px solid rgba(196,0,29,0.35)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2a2a2a', fontSize: 13 }}>Analytics tracking coming soon</div>
                <div className="graph-legend">View counts, click-throughs and referrers will appear here.</div>
              </div>
            </div>
          </div>
        )}

        {/* BADGES */}
        {activePage === 'badges' && (
          <div>
            <div className="page-title-row">
              <div><div className="page-breadcrumb">ACCOUNT • BADGES</div><div className="page-title">Badges</div></div>
              <button className="back-button" onClick={() => navTo('overview')}>← Back</button>
            </div>
            <div className="panel">
              <div className="panel-header"><h2>Your Badges</h2><div className="panel-note">None unlocked yet</div></div>
              <div className="panel-body">
                <div className="badge-grid">
                  {['First View', 'Ten Views', 'Linked Socials', 'Custom Theme'].map(b => <div key={b} className="badge-card">{b}</div>)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {activePage === 'settings' && (
          <div>
            <div className="page-title-row">
              <div><div className="page-breadcrumb">ACCOUNT • SETTINGS</div><div className="page-title">Settings</div></div>
              <button className="back-button" onClick={() => navTo('overview')}>← Back</button>
            </div>
            <div className="panel">
              <div className="panel-header"><h2>General Information</h2></div>
              <div className="panel-body">
                <div className="field">
                  <label>Username
                    {(() => {
                      const lastChanged = user?.username_changed_at ? new Date(user.username_changed_at) : null
                      if (lastChanged) {
                        const remaining = 7 - Math.floor((Date.now() - lastChanged.getTime()) / 86400000)
                        if (remaining > 0) return <span style={{ fontSize: 11, color: '#f59e0b', marginLeft: 8 }}>Can change in {remaining} day{remaining !== 1 ? 's' : ''}</span>
                      }
                      return <span style={{ fontSize: 11, color: '#22c55e', marginLeft: 8 }}>Available to change</span>
                    })()}
                  </label>
                  <input className="input" value={username} disabled />
                </div>
                <div className="field">
                  <label>Display Name <span style={{ fontSize: 11, color: '#22c55e', marginLeft: 8 }}>Can always change</span></label>
                  <div className="settings-field-row">
                    <input className="input" placeholder="Display Name" value={displayName} onChange={e => setDisplayName(e.target.value)} />
                    <button className="button" style={{ flexShrink: 0 }} onClick={async () => {
                      const { error } = await supabase.from('users').update({ display_name: displayName, display_name_changed_at: new Date().toISOString() }).eq('username', username)
                      if (!error) setSaveMsg('Display name saved!')
                      setTimeout(() => setSaveMsg(''), 2000)
                    }}>Save</button>
                  </div>
                </div>
                <div className="field">
                  <label>Email
                    {(() => {
                      const lastChanged = user?.email_changed_at ? new Date(user.email_changed_at) : null
                      if (lastChanged) {
                        const diffDays = Math.floor((Date.now() - lastChanged.getTime()) / 86400000)
                        if (diffDays < 1) return <span style={{ fontSize: 11, color: '#f59e0b', marginLeft: 8 }}>Can change in 1 day</span>
                      }
                      return <span style={{ fontSize: 11, color: '#22c55e', marginLeft: 8 }}>Available to change</span>
                    })()}
                  </label>
                  <input className="input" value={user?.email || ''} disabled />
                </div>
                <div className="field">
                  <label>Password</label>
                  <div className="settings-field-row">
                    <input className="input" type={showPassword ? 'text' : 'password'} placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    <button className="button-secondary" style={{ flexShrink: 0 }} onClick={() => setShowPassword(p => !p)}>{showPassword ? 'Hide' : 'Show'}</button>
                    <button className="button" style={{ flexShrink: 0 }} onClick={async () => {
                      if (!newPassword || newPassword.length < 6) { setSaveMsg('Password must be 6+ characters'); setTimeout(() => setSaveMsg(''), 2000); return }
                      const { error } = await supabase.auth.updateUser({ password: newPassword })
                      if (!error) { setNewPassword(''); setSaveMsg('Password updated!') }
                      else setSaveMsg('Failed to update password.')
                      setTimeout(() => setSaveMsg(''), 2000)
                    }}>Update</button>
                  </div>
                </div>
                <div className="save-bar">
                  {saveMsg && <span className="save-msg">{saveMsg}</span>}
                  <button className="button-secondary" onClick={handleLogout}>Log Out</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOMIZE / APPEARANCE */}
        {activePage === 'customize' && (
          <div>
            <div className="page-title-row">
              <div><div className="page-breadcrumb">CUSTOMIZE • APPEARANCE</div><div className="page-title">Appearance</div><div className="page-subtitle">Customize how your public profile looks and feels.</div></div>
              <button className="back-button" onClick={() => navTo('overview')}>← Back</button>
            </div>

            <input type="file" ref={fileBgRef} accept="image/*,video/*" style={{ display: 'none' }} onChange={e => handleFileUpload('bg', e.target.files[0])} />
            <input type="file" ref={fileAvatarRef} accept="image/*" style={{ display: 'none' }} onChange={e => handleFileUpload('avatar', e.target.files[0])} />
            <input type="file" ref={fileCursorRef} accept="image/*" style={{ display: 'none' }} onChange={e => handleFileUpload('cursor', e.target.files[0])} />
            <input type="file" ref={fileAudioRef} accept="audio/*" style={{ display: 'none' }} onChange={e => handleFileUpload('audio', e.target.files[0])} />

            <div className="section-title">Assets Uploader</div>
            {uploadingType && <div className="uploading-indicator" style={{ marginBottom: 12 }}>⏳ Uploading {uploadingType}...</div>}
            <div className="assets-grid">
              <div className="asset-card" onClick={() => fileBgRef.current.click()}>
                <div className="asset-label">Background</div>
                <div className={`asset-drop ${bgPreview ? 'has-preview' : ''}`}>
                  {!bgPreview && <><svg style={{ width: 26, height: 26, opacity: 0.4 }} viewBox="0 0 24 24" fill="none" stroke="#7a7a8a" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><div className="asset-drop-text">{uploadingType === 'bg' ? 'Uploading...' : 'Click to upload'}</div></>}
                  {bgPreview && <img src={bgPreview} crossOrigin="anonymous" className="asset-preview-img" alt="bg" onError={e => { e.target.style.display = 'none' }} />}
                  {bgPreview && <button className="asset-remove-btn" onClick={e => { e.stopPropagation(); removeAsset('bg') }}>✕</button>}
                </div>
              </div>
              <div className="asset-card" onClick={() => fileAudioRef.current.click()}>
                <div className="asset-label">Audio</div>
                <div className={`asset-drop ${audioName ? 'has-preview' : ''}`}>
                  <svg style={{ width: 26, height: 26, opacity: 0.4 }} viewBox="0 0 24 24" fill="none" stroke="#7a7a8a" strokeWidth="1.5"><path d="M3 6h4l3-3v18l-3-3H3z"/><path d="M16 8.5a5 5 0 0 1 0 7M19.5 5a10 10 0 0 1 0 14"/></svg>
                  <div className="asset-drop-text">{uploadingType === 'audio' ? 'Uploading...' : audioName ? `🎵 ${audioName}` : 'Click to upload audio'}</div>
                  {audioName && <button className="asset-remove-btn" onClick={e => { e.stopPropagation(); removeAsset('audio') }}>✕</button>}
                </div>
              </div>
              <div className="asset-card" onClick={() => fileAvatarRef.current.click()}>
                <div className="asset-label">Profile Avatar</div>
                <div className={`asset-drop ${avatarPreview ? 'has-preview' : ''}`}>
                  {!avatarPreview && <><svg style={{ width: 26, height: 26, opacity: 0.4 }} viewBox="0 0 24 24" fill="none" stroke="#7a7a8a" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><div className="asset-drop-text">{uploadingType === 'avatar' ? 'Uploading...' : 'Click to upload'}</div></>}
                  {avatarPreview && <img src={avatarPreview} crossOrigin="anonymous" className="asset-preview-img" alt="avatar" onError={e => { e.target.style.display = 'none' }} />}
                  {avatarPreview && <button className="asset-remove-btn" onClick={e => { e.stopPropagation(); removeAsset('avatar') }}>✕</button>}
                </div>
              </div>
              <div className="asset-card" onClick={() => fileCursorRef.current.click()}>
                <div className="asset-label">Custom Cursor</div>
                <div className={`asset-drop ${cursorPreview ? 'has-preview' : ''}`}>
                  {!cursorPreview && <><svg style={{ width: 26, height: 26, opacity: 0.4 }} viewBox="0 0 24 24" fill="none" stroke="#7a7a8a" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><div className="asset-drop-text">{uploadingType === 'cursor' ? 'Uploading...' : 'Click to upload'}</div></>}
                  {cursorPreview && <img src={cursorPreview} crossOrigin="anonymous" className="asset-preview-img" alt="cursor" onError={e => { e.target.style.display = 'none' }} />}
                  {cursorPreview && <button className="asset-remove-btn" onClick={e => { e.stopPropagation(); removeAsset('cursor') }}>✕</button>}
                </div>
              </div>
            </div>

            <div className="premium-banner" onClick={() => navTo('premium')}>
              <span>Want exclusive features? Unlock more with</span>
              <span className="prem"><svg width="14" height="14" viewBox="0 0 24 24" fill="#b06aff"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>Premium</span>
            </div>

            <div className="section-title">General Customization</div>
            <div className="customization-grid">
              <div className="custom-group">
                <div className="custom-label">Description</div>
                <textarea className="custom-input" rows={3} placeholder="this is my description" value={appBio} onChange={e => setAppBio(e.target.value)} />
              </div>
              <div className="custom-group">
                <div className="custom-label">Discord Presence</div>
                <select className="custom-select" value={discordPresence} onChange={e => setDiscordPresence(e.target.value)}>
                  <option>Enabled</option><option>Disabled</option><option>Only when online</option>
                </select>
                <div className="custom-label" style={{ marginTop: 8 }}>Username Effects</div>
                <select className="custom-select" value={usernameFx} onChange={e => setUsernameFx(e.target.value)}>
                  <option value="">None</option><option value="rainbow">🌈 Rainbow</option><option value="glitch">⚡ Glitch</option><option value="neon">✨ Neon</option><option value="gold">🏆 Gold</option>
                </select>
              </div>
              <div>
                <div className="custom-group" style={{ marginBottom: 12 }}>
                  <div className="custom-label">Profile Opacity <span className="info">?</span></div>
                  <div className="slider-row">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: '#7a7a8a' }}>Opacity</span>
                      <span className="slider-value">{opacity}%</span>
                    </div>
                    <input type="range" min="20" max="100" value={opacity} step="1" onChange={e => setOpacity(Number(e.target.value))} />
                    <div className="slider-ticks"><span>20%</span><span>60%</span><span>100%</span></div>
                  </div>
                </div>
                <div className="custom-group">
                  <div className="custom-label">Background Effects</div>
                  <select className="custom-select" value={bgFx} onChange={e => setBgFx(e.target.value)}>
                    <option value="none">None</option><option value="nighttime">Night Time</option><option value="particles">Particles</option><option value="rain">Rain</option><option value="snow">Snow</option><option value="matrix">Matrix</option>
                  </select>
                </div>
              </div>
              <div>
                <div className="custom-group" style={{ marginBottom: 12 }}>
                  <div className="custom-label">Profile Blur <span className="info">?</span></div>
                  <div className="slider-row">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: '#7a7a8a' }}>Blur</span>
                      <span className="slider-value">{blur}px</span>
                    </div>
                    <input type="range" min="0" max="80" value={blur} step="1" onChange={e => setBlur(Number(e.target.value))} />
                    <div className="slider-ticks"><span>0px</span><span>40px</span><span>80px</span></div>
                  </div>
                </div>
                <div className="custom-group" style={{ marginBottom: 10 }}>
                  <div className="custom-label">Location</div>
                  <input className="custom-input" placeholder="My Location" value={location} onChange={e => setLocation(e.target.value)} />
                </div>
                <div className="custom-label">Glow Settings <span className="info">?</span></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginTop: 6 }}>
                  <button className={`glow-btn ${!glowState.username ? 'inactive' : ''}`} onClick={() => toggleGlow('username')}>✦ Username</button>
                  <button className={`glow-btn ${!glowState.socials ? 'inactive' : ''}`} onClick={() => toggleGlow('socials')}>✦ Socials</button>
                </div>
                <button className={`glow-btn ${!glowState.badges ? 'inactive' : ''}`} style={{ width: '100%', marginTop: 7 }} onClick={() => toggleGlow('badges')}>✦ Badges</button>
              </div>
            </div>

            <div className="live-preview-box">
              <div className="live-preview-title"><div className="live-dot" /> Live Preview</div>
              <div className="profile-preview" style={{ opacity: opacity / 100 }}>
                {bgPreview && <img src={bgPreview} crossOrigin="anonymous" className="prev-bg-img" alt="bg" style={{ filter: blur > 0 ? `blur(${Math.round(blur / 10)}px)` : 'none' }} onError={e => { e.target.style.display = 'none' }} />}
                <div className="prev-bg-overlay" style={previewOverlayStyle} />
                <div className="prev-content">
                  <div className="prev-avatar">
                    {avatarPreview
                      ? <img src={avatarPreview} crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} alt="avatar" onError={e => { e.target.style.display = 'none' }} />
                      : initial}
                  </div>
                  <div className="prev-name" style={previewNameStyle}>@{username}</div>
                  {appBio && <div className="prev-desc">{appBio}</div>}
                  {location && (
                    <div style={{ fontSize: 11, color: '#7a7a8a', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                      {location}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="app-save-row">
              {appSaveMsg && <span className="save-msg">{appSaveMsg}</span>}
              <button className="button-secondary" onClick={() => { setAppBio(''); setOpacity(100); setBlur(0); setUsernameFx(''); setBgFx('none'); setLocation('') }}>Reset</button>
              <button className="button" onClick={saveAppearance} disabled={saving}>{saving ? 'Saving...' : 'Save Appearance'}</button>
            </div>
          </div>
        )}

        {/* LINKS */}
        {activePage === 'links' && (
          <div>
            <div className="page-title-row">
              <div><div className="page-breadcrumb">CUSTOMIZE • LINKS</div><div className="page-title">Links</div><div className="page-subtitle">Configure links on your public profile.</div></div>
              <button className="back-button" onClick={() => navTo('overview')}>← Back</button>
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
                <div className="field"><label>Label</label><input className="input" placeholder="e.g. Twitter" value={newLinkTitle} onChange={e => setNewLinkTitle(e.target.value)} /></div>
                <div className="field"><label>URL</label><input className="input" placeholder="https://twitter.com/you" value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && addLink()} /></div>
                <div className="save-bar">
                  {saveMsg && <span className="save-msg">{saveMsg}</span>}
                  <button className="button-secondary" onClick={addLink}>+ Add Link</button>
                  <button className="button" onClick={saveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save Links'}</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TEMPLATES */}
        {activePage === 'templates' && (
          <div>
            <div className="page-title-row">
              <div><div className="page-breadcrumb">CUSTOMIZE • TEMPLATES</div><div className="page-title">Templates</div><div className="page-subtitle">Choose a profile template layout.</div></div>
              <button className="back-button" onClick={() => navTo('overview')}>← Back</button>
            </div>
            <div className="panel">
              <div className="panel-header"><h2>Template Presets</h2><div className="panel-note">Coming Soon</div></div>
              <div className="panel-body">
                <div style={{ height: 160, background: 'linear-gradient(180deg,#0d0d10,#09090d)', border: '1px solid rgba(196,0,29,0.35)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2a2a2a', fontSize: 13 }}>Templates are coming soon</div>
                <div className="graph-legend" style={{ marginTop: 10 }}>Profile templates will apply a full layout and style to your public page.</div>
              </div>
            </div>
          </div>
        )}

        {/* PREMIUM */}
        {activePage === 'premium' && (
          <div>
            <div className="page-title-row">
              <div><div className="page-breadcrumb">PREMIUM</div><div className="page-title">Premium</div><div className="page-subtitle">Unlock extended features.</div></div>
              <button className="back-button" onClick={() => navTo('overview')}>← Back</button>
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