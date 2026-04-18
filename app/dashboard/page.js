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
  const [originalUsername, setOriginalUsername] = useState('')
  const [dbUser, setDbUser] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showUidTooltip, setShowUidTooltip] = useState(false)
  const [copied, setCopied] = useState(false)
  const [profileViews, setProfileViews] = useState(0)
  const [viewsToday, setViewsToday] = useState(0)

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
        setOriginalUsername(data.username || '')
        setDbUser(data)
        if (data.bg_url) setBgPreview(data.bg_url)
        if (data.cursor_url) setCursorPreview(data.cursor_url)
        if (data.audio_url) setAudioName('Uploaded ✓')
        setUid(data.id ? String(data.id) : '')
        if (data.username) fetchViewCounts(data.username)
      }
      setLoading(false)
    }
    init()
  }, [router])

  const fetchViewCounts = async (uname) => {
    const { count: total } = await supabase
      .from('profile_views')
      .select('*', { count: 'exact', head: true })
      .eq('username', uname)

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const { count: today } = await supabase
      .from('profile_views')
      .select('*', { count: 'exact', head: true })
      .eq('username', uname)
      .gte('viewed_at', todayStart.toISOString())

    setProfileViews(total || 0)
    setViewsToday(today || 0)
  }

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
        .graph-legend { margin-top: 8px; font-size: 11px; color: #7a7a8a; }
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
        .analytics-bar-wrap { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; }
        .analytics-bar-track { width: 100%; background: #0d0d10; border-radius: 4px; overflow: hidden; position: relative; }
        .analytics-bar-fill { background: linear-gradient(180deg, #ff2340, #c4001d); border-radius: 4px; transition: height 0.6s ease; width: 100%; position: absolute; bottom: 0; }
        .analytics-bar-label { font-size: 10px; color: #7a7a8a; }
        .analytics-bar-val { font-size: 11px; color: #b8b8c4; font-weight: 600; min-height: 16px; }
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

      <div className="mobile-topbar">
        <div className="mobile-logo"><span className="fate">FATE.</span><span className="rip">RIP</span></div>
        <button className="hamburger" onClick={() => setSidebarOpen(o => !o)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

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

        <div className="sidebar-bottom">
          <div className="sidebar-support-panel">
            <div>
              <div className="support-label" style={{ marginBottom: 6 }}>Have a question or need support?</div>
              <a href="https://discord.gg/faterip" target="_blank" rel="noopener noreferrer" className="support-btn">
                <div className="support-btn-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#b8b8c4"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
                </div>
                Help Center
              </a>
            </div>
            <div>
              <div className="support-label" style={{ marginBottom: 6 }}>Check out your page</div>
              <a href={username ? `/${username}` : '/'} target="_blank" rel="noopener noreferrer" className="support-btn">
                <div className="support-btn-icon">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#b8b8c4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </div>
                My Page
              </a>
            </div>
          </div>
          <button className="share-profile-btn" onClick={handleShareProfile}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Share Your Profile
          </button>
          <div className="sidebar-user-row">
            <div className="sidebar-user-info" onMouseEnter={() => setShowUidTooltip(true)} onMouseLeave={() => setShowUidTooltip(false)} onClick={handleCopyUid}>
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

      <div className="main">

      {activePage === 'overview' && (
          <div>
            <style>{`
              .ov-title { font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 18px; }
              .ov-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px; }
              .ov-card { background: #111114; border: 1px solid rgba(196,0,29,0.25); border-radius: 14px; padding: 18px 20px; position: relative; overflow: hidden; transition: border-color .15s, transform .15s; cursor: default; }
              .ov-card:hover { border-color: rgba(196,0,29,0.5); transform: translateY(-2px); }
              .ov-card::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(196,0,29,0.05) 0%, transparent 60%); pointer-events: none; }
              .ov-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
              .ov-card-label { font-size: 13px; color: #b8b8c4; font-weight: 500; }
              .ov-card-icon { width: 32px; height: 32px; border-radius: 9px; background: rgba(196,0,29,0.12); border: 1px solid rgba(196,0,29,0.2); display: flex; align-items: center; justify-content: center; color: #ff2340; flex-shrink: 0; }
              .ov-card-value { font-size: 26px; font-weight: 700; color: #fff; line-height: 1; margin-bottom: 5px; }
              .ov-card-sub { font-size: 12px; color: #555; }
              .ov-stats-title { font-size: 17px; font-weight: 600; color: #fff; margin-bottom: 14px; }
              .ov-grid { display: grid; grid-template-columns: 1fr 280px; gap: 18px; align-items: start; }
              .ov-completion-panel { background: #111114; border: 1px solid rgba(196,0,29,0.25); border-radius: 14px; padding: 20px; }
              .ov-completion-label { font-size: 15px; font-weight: 600; color: #fff; margin-bottom: 14px; }
              .ov-progress-wrap { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
              .ov-progress-bar { flex: 1; height: 8px; background: #0d0d10; border-radius: 999px; overflow: hidden; border: 1px solid rgba(196,0,29,0.2); }
              .ov-progress-fill { height: 100%; background: linear-gradient(90deg, #c4001d, #ff2340); border-radius: 999px; transition: width .5s; }
              .ov-progress-pct { font-size: 12px; color: #7a7a8a; flex-shrink: 0; }
              .ov-warning { background: rgba(196,0,29,0.07); border: 1px solid rgba(196,0,29,0.2); border-radius: 10px; padding: 12px 14px; margin-bottom: 14px; display: flex; align-items: flex-start; gap: 10px; }
              .ov-warning-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
              .ov-warning-title { font-size: 13px; font-weight: 600; color: #fff; margin-bottom: 2px; }
              .ov-warning-sub { font-size: 12px; color: #7a7a8a; }
              .ov-steps-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; }
              .ov-step { display: flex; align-items: center; gap: 10px; background: #0c0c10; border: 1px solid rgba(196,0,29,0.15); border-radius: 10px; padding: 11px 14px; cursor: pointer; transition: border-color .15s, background .15s; }
              .ov-step:hover { border-color: rgba(196,0,29,0.35); background: rgba(196,0,29,0.05); }
              .ov-step.done { border-color: rgba(34,197,94,0.2); background: rgba(34,197,94,0.04); cursor: default; }
              .ov-step.full-width { grid-column: 1 / -1; }
              .ov-step-dot { width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; }
              .ov-step-dot.active { background: rgba(196,0,29,0.1); border: 1px solid rgba(196,0,29,0.3); color: #ff2340; }
              .ov-step-dot.done { background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.4); color: #22c55e; }
              .ov-step-label { font-size: 13px; color: #b8b8c4; flex: 1; }
              .ov-step.done .ov-step-label { color: #22c55e; }
              .ov-step-arrow { font-size: 12px; color: #333; flex-shrink: 0; }
              .ov-step-progress { font-size: 11px; color: #444; flex-shrink: 0; }
              .ov-manage-panel { background: #111114; border: 1px solid rgba(196,0,29,0.25); border-radius: 14px; padding: 20px; }
              .ov-manage-title { font-size: 15px; font-weight: 600; color: #fff; margin-bottom: 4px; }
              .ov-manage-sub { font-size: 12px; color: #7a7a8a; margin-bottom: 16px; }
              .ov-manage-btn { display: flex; align-items: center; gap: 10px; width: 100%; padding: 11px 14px; margin-bottom: 8px; background: #0c0c10; border: 1px solid rgba(196,0,29,0.15); border-radius: 10px; cursor: pointer; font-family: inherit; color: #b8b8c4; font-size: 13px; text-align: left; transition: all .15s; }
              .ov-manage-btn:hover { border-color: rgba(196,0,29,0.4); background: rgba(196,0,29,0.06); color: #fff; transform: translateX(2px); }
              .ov-manage-btn:last-child { margin-bottom: 0; }
              .ov-manage-btn-icon { width: 28px; height: 28px; border-radius: 8px; background: rgba(196,0,29,0.1); border: 1px solid rgba(196,0,29,0.2); display: flex; align-items: center; justify-content: center; color: #ff2340; flex-shrink: 0; }
              .ov-section-divider { font-size: 13px; font-weight: 600; color: #7a7a8a; letter-spacing: 0.08em; text-transform: uppercase; margin: 18px 0 12px; }
              @media (max-width: 900px) { .ov-cards { grid-template-columns: 1fr 1fr; } .ov-grid { grid-template-columns: 1fr; } }
              @media (max-width: 480px) { .ov-cards { grid-template-columns: 1fr 1fr; } .ov-steps-row { grid-template-columns: 1fr; } }
            `}</style>

            <div className="ov-title">Account Overview</div>

            {/* Top stat cards */}
            <div className="ov-cards">
              <div className="ov-card">
                <div className="ov-card-top">
                  <div className="ov-card-label">Username</div>
                  <div className="ov-card-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </div>
                </div>
                <div className="ov-card-value">{username || '—'}</div>
                <div className="ov-card-sub">Change available now</div>
              </div>
              <div className="ov-card">
                <div className="ov-card-top">
                  <div className="ov-card-label">Alias</div>
                  <div className="ov-card-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                </div>
                <div className="ov-card-value">0 Aliases Used</div>
                <div className="ov-card-sub">1 Alias Slot Remaining</div>
              </div>
              <div className="ov-card">
                <div className="ov-card-top">
                  <div className="ov-card-label">UID</div>
                  <div className="ov-card-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>
                  </div>
                </div>
                <div className="ov-card-value" style={{ fontSize: 22 }}>{uid || '—'}</div>
                <div className="ov-card-sub">Your unique ID</div>
              </div>
              <div className="ov-card">
                <div className="ov-card-top">
                  <div className="ov-card-label">Profile Views</div>
                  <div className="ov-card-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </div>
                </div>
                <div className="ov-card-value">{profileViews.toLocaleString()}</div>
                <div className="ov-card-sub">{viewsToday > 0 ? `+${viewsToday} views since last 7 days` : '+0 views since last 7 days'}</div>
              </div>
            </div>

            <div className="ov-stats-title">Account Statistics</div>

            <div className="ov-grid">
              {/* Left: completion panel */}
              <div className="ov-completion-panel">
                <div className="ov-completion-label">Profile Completion</div>
                {(() => {
                  const steps = [!!bio, links.length > 0, !!avatarPreview]
                  const pct = Math.round((steps.filter(Boolean).length / steps.length) * 100)
                  return (
                    <>
                      <div className="ov-progress-wrap">
                        <div className="ov-progress-bar">
                          <div className="ov-progress-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="ov-progress-pct">{pct}% completed</span>
                      </div>
                      <div className="ov-warning">
                        <span className="ov-warning-icon">⚠️</span>
                        <div>
                          <div className="ov-warning-title">Your profile isn't complete yet!</div>
                          <div className="ov-warning-sub">Complete your profile to make it more discoverable and appealing.</div>
                        </div>
                      </div>
                      <div className="ov-steps-row">
                        {[
                          { label: 'Upload An Avatar', done: !!avatarPreview, onClick: () => navTo('customize') },
                          { label: 'Add A Description', done: !!bio, onClick: () => navTo('customize') },
                          { label: 'Add Links', done: links.length > 0, onClick: () => navTo('links') },
                        ].map((step, i) => (
                          <div key={i} className={`ov-step ${step.done ? 'done' : ''}`} onClick={step.onClick || undefined}>
                            <div className={`ov-step-dot ${step.done ? 'done' : 'active'}`}>
                              {step.done ? '✓' : '!'}
                            </div>
                            <span className="ov-step-label">{step.label}</span>
                            {!step.done && <span className="ov-step-arrow">›</span>}
                          </div>
                        ))}
                      </div>
                      <div className="ov-steps-row">
                        <div className={`ov-step full-width ${profileViews >= 10 ? 'done' : ''}`}>
                          <div className={`ov-step-dot ${profileViews >= 10 ? 'done' : 'active'}`}>
                            {profileViews >= 10 ? '✓' : '!'}
                          </div>
                          <span className="ov-step-label">Reach 10 Profile Views</span>
                          {profileViews < 10 && <span className="ov-step-progress">{profileViews}/10</span>}
                        </div>
                      </div>
                    </>
                  )
                })()}
              </div>

              {/* Right: manage account panel */}
              <div className="ov-manage-panel">
                <div className="ov-manage-title">Manage your account</div>
                <div className="ov-manage-sub">Change your email, username and more.</div>
                {[
                  { label: 'Change Username', page: 'settings', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
                  { label: 'Change Display Name', page: 'settings', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
                  { label: 'Manage Aliases', page: 'settings', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> },
                  { label: 'Account Settings', page: 'settings', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
                ].map((item, i) => (
                  <button key={i} className="ov-manage-btn" onClick={() => navTo(item.page)}>
                    <div className="ov-manage-btn-icon">{item.icon}</div>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activePage === 'analytics' && (
          <AnalyticsPage username={username} profileViews={profileViews} viewsToday={viewsToday} onBack={() => navTo('overview')} />
        )}

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

{activePage === 'settings' && (
  <div>
    <style>{`
      .st-wrap { max-width: 680px; margin: 0 auto; }
      .st-page-title { font-size: 22px; font-weight: 700; color: #fff; text-align: center; margin-bottom: 28px; }
      .st-section-title { font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 14px; }
      .st-panel { background: #111114; border: 1px solid rgba(196,0,29,0.2); border-radius: 16px; padding: 22px; margin-bottom: 20px; }
      .st-field { margin-bottom: 18px; }
      .st-field:last-child { margin-bottom: 0; }
      .st-label { font-size: 13px; color: #b8b8c4; font-weight: 500; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
      .st-cooldown { font-size: 11px; padding: 2px 8px; border-radius: 999px; font-weight: 600; }
      .st-cooldown.available { background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.3); color: #22c55e; }
      .st-cooldown.locked { background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.3); color: #f59e0b; }
      .st-input-wrap { background: #0c0c10; border: 1px solid rgba(196,0,29,0.25); border-radius: 12px; display: flex; align-items: center; gap: 10px; padding: 0 14px; transition: border-color .15s; }
      .st-input-wrap:focus-within { border-color: #c4001d; }
      .st-input-wrap.disabled { opacity: 0.5; }
      .st-input-icon { color: #555; flex-shrink: 0; display: flex; align-items: center; }
      .st-input { background: transparent; border: none; outline: none; color: #fff; font-size: 14px; font-family: inherit; padding: 12px 0; flex: 1; min-width: 0; }
      .st-input::placeholder { color: #333; }
      .st-input:disabled { cursor: not-allowed; }
      .st-input-action { background: none; border: none; color: #555; cursor: pointer; padding: 4px; display: flex; align-items: center; transition: color .15s; flex-shrink: 0; }
      .st-input-action:hover { color: #b8b8c4; }
      .st-save-btn { background: linear-gradient(135deg, #c4001d, #ff2340); border: none; border-radius: 10px; color: #fff; font-size: 13px; font-weight: 600; padding: 10px 18px; cursor: pointer; font-family: inherit; transition: opacity .15s, transform .15s; white-space: nowrap; flex-shrink: 0; }
      .st-save-btn:hover { opacity: .9; transform: translateY(-1px); }
      .st-save-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
      .st-input-row { display: flex; gap: 10px; align-items: flex-start; }
      .st-input-row .st-input-wrap { flex: 1; }
      .st-msg { font-size: 12px; font-weight: 500; margin-top: 8px; }
      .st-msg.success { color: #22c55e; }
      .st-msg.error { color: #ff2340; }
      .st-divider { height: 1px; background: rgba(196,0,29,0.1); margin: 18px 0; }
      .st-danger-zone { background: rgba(196,0,29,0.04); border: 1px solid rgba(196,0,29,0.2); border-radius: 16px; padding: 22px; margin-bottom: 20px; }
      .st-danger-title { font-size: 14px; font-weight: 600; color: #ff2340; margin-bottom: 4px; }
      .st-danger-sub { font-size: 12px; color: #7a7a8a; margin-bottom: 14px; }
      .st-logout-btn { background: transparent; border: 1px solid rgba(196,0,29,0.35); border-radius: 10px; color: #b8b8c4; font-size: 13px; padding: 10px 18px; cursor: pointer; font-family: inherit; transition: all .15s; }
      .st-logout-btn:hover { border-color: #c4001d; background: rgba(196,0,29,0.1); color: #fff; }
    `}</style>

    <div className="st-wrap">
      <div className="st-page-title">Account Settings</div>

      <div className="st-section-title">General Information</div>
      <div className="st-panel">

        {/* USERNAME */}
        <div className="st-field">
          {(() => {
            const lastChanged = dbUser?.username_changed_at ? new Date(dbUser.username_changed_at) : null
            const daysLeft = lastChanged ? 7 - Math.floor((Date.now() - lastChanged.getTime()) / 86400000) : 0
            const locked = daysLeft > 0
            return (
              <>
                <div className="st-label">
                  Username
                  {locked
                    ? <span className="st-cooldown locked">Locked for {daysLeft} day{daysLeft !== 1 ? 's' : ''}</span>
                    : <span className="st-cooldown available">Available to change</span>
                  }
                </div>
                <div className="st-input-row">
                  <div className={`st-input-wrap ${locked ? 'disabled' : ''}`}>
                    <div className="st-input-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </div>
                    <input
                      className="st-input"
                      value={username}
                      disabled={locked}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="Username"
                    />
                  </div>
                  <button className="st-save-btn" disabled={locked} onClick={async () => {
                    if (!username.trim()) { setSaveMsg('error:username:Username cannot be empty'); setTimeout(() => setSaveMsg(''), 2000); return }
                    const { data: existing } = await supabase.from('users').select('username').eq('username', username.trim()).neq('email', user.email).single()
                    if (existing) { setSaveMsg('error:username:Username already taken'); setTimeout(() => setSaveMsg(''), 2000); return }
                    const { error } = await supabase.from('users').update({ username: username.trim(), username_changed_at: new Date().toISOString() }).eq('email', user.email)
if (!error) { setOriginalUsername(username.trim()); setDbUser(prev => ({ ...prev, username_changed_at: new Date().toISOString() })) }
setSaveMsg(error ? 'error:username:Failed to save.' : 'success:username:Username updated!')
                    setTimeout(() => setSaveMsg(''), 2000)
                  }}>Save</button>
                </div>
                {saveMsg.includes(':username:') && (
                  <div className={`st-msg ${saveMsg.startsWith('success') ? 'success' : 'error'}`}>
                    {saveMsg.split(':username:')[1]}
                  </div>
                )}
              </>
            )
          })()}
        </div>

        <div className="st-divider" />

        {/* DISPLAY NAME */}
        <div className="st-field">
          <div className="st-label">
            Display Name
            <span className="st-cooldown available">Can always change</span>
          </div>
          <div className="st-input-row">
            <div className="st-input-wrap">
              <div className="st-input-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <input className="st-input" placeholder="Display Name" value={displayName} onChange={e => setDisplayName(e.target.value)} />
            </div>
            <button className="st-save-btn" onClick={async () => {
              const { error } = await supabase.from('users').update({ display_name: displayName, display_name_changed_at: new Date().toISOString() }).eq('email', user.email)
              setSaveMsg(error ? 'error:displayname:Failed to save.' : 'success:displayname:Display name saved!')
              setTimeout(() => setSaveMsg(''), 2000)
            }}>Save</button>
          </div>
          {saveMsg.includes(':displayname:') && (
            <div className={`st-msg ${saveMsg.startsWith('success') ? 'success' : 'error'}`}>
              {saveMsg.split(':displayname:')[1]}
            </div>
          )}
        </div>

        <div className="st-divider" />

        {/* EMAIL */}
        <div className="st-field">
          {(() => {
            const lastChanged = dbUser?.email_changed_at ? new Date(dbUser.email_changed_at) : null
            const daysLeft = lastChanged ? 3 - Math.floor((Date.now() - lastChanged.getTime()) / 86400000) : 0
            const locked = daysLeft > 0
            return (
              <>
                <div className="st-label">
                  Email
                  {locked
                    ? <span className="st-cooldown locked">Locked for {daysLeft} day{daysLeft !== 1 ? 's' : ''}</span>
                    : <span className="st-cooldown available">Available to change</span>
                  }
                </div>
                <div className="st-input-row">
                  <div className={`st-input-wrap ${locked ? 'disabled' : ''}`}>
                    <div className="st-input-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    </div>
                    <input
                      className="st-input"
                      type="email"
                      value={user?.email || ''}
                      disabled={locked}
                      placeholder="New email"
                      onChange={e => setUser(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <button className="st-save-btn" disabled={locked} onClick={async () => {
                    const { error } = await supabase.auth.updateUser({ email: user.email })
                    if (!error) {
                      await supabase.from('users').update({ email: user.email, email_changed_at: new Date().toISOString() }).eq('username', username)
                      setSaveMsg('success:email:Confirmation sent! Check your inbox.')
                    } else {
                      setSaveMsg('error:email:Failed to update email.')
                    }
                    setTimeout(() => setSaveMsg(''), 3000)
                  }}>Save</button>
                </div>
                {saveMsg.includes(':email:') && (
                  <div className={`st-msg ${saveMsg.startsWith('success') ? 'success' : 'error'}`}>
                    {saveMsg.split(':email:')[1]}
                  </div>
                )}
              </>
            )
          })()}
        </div>

        <div className="st-divider" />

        {/* PASSWORD */}
        <div className="st-field">
          {(() => {
            const lastChanged = dbUser?.password_changed_at ? new Date(dbUser.password_changed_at) : null
            const hoursLeft = lastChanged ? 24 - Math.floor((Date.now() - lastChanged.getTime()) / 3600000) : 0
            const locked = hoursLeft > 0
            return (
              <>
                <div className="st-label">
                  Password
                  {locked
                    ? <span className="st-cooldown locked">Locked for {hoursLeft} hour{hoursLeft !== 1 ? 's' : ''}</span>
                    : <span className="st-cooldown available">Available to change</span>
                  }
                </div>
                <div className="st-input-row">
                  <div className={`st-input-wrap ${locked ? 'disabled' : ''}`}>
                    <div className="st-input-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <input className="st-input" type={showPassword ? 'text' : 'password'} placeholder="New password" value={newPassword} disabled={locked} onChange={e => setNewPassword(e.target.value)} />
                    <button className="st-input-action" onClick={() => setShowPassword(p => !p)}>
                      {showPassword
                        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                  <button className="st-save-btn" disabled={locked} onClick={async () => {
                    if (!newPassword || newPassword.length < 6) { setSaveMsg('error:password:Password must be 6+ characters'); setTimeout(() => setSaveMsg(''), 2000); return }
                    const { error } = await supabase.auth.updateUser({ password: newPassword })
                    if (!error) {
                      setNewPassword('')
                      await supabase.from('users').update({ password_changed_at: new Date().toISOString() }).eq('username', username)
                      setSaveMsg('success:password:Password updated!')
                    } else {
                      setSaveMsg('error:password:Failed to update password.')
                    }
                    setTimeout(() => setSaveMsg(''), 2000)
                  }}>Update</button>
                </div>
                {saveMsg.includes(':password:') && (
                  <div className={`st-msg ${saveMsg.startsWith('success') ? 'success' : 'error'}`}>
                    {saveMsg.split(':password:')[1]}
                  </div>
                )}
              </>
            )
          })()}
        </div>

      </div>

      <div className="st-danger-zone">
        <div className="st-danger-title">Session</div>
        <div className="st-danger-sub">Sign out of your current session on this device.</div>
        <button className="st-logout-btn" onClick={handleLogout}>← Log Out</button>
      </div>

    </div>
  </div>
)}

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
                      <span style={{ fontSize: 11, color: '#7a7a8a' }}>Opacity</span><span className="slider-value">{opacity}%</span>
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
                      <span style={{ fontSize: 11, color: '#7a7a8a' }}>Blur</span><span className="slider-value">{blur}px</span>
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
                    {avatarPreview ? <img src={avatarPreview} crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} alt="avatar" onError={e => { e.target.style.display = 'none' }} /> : initial}
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

// Analytics sub-page with live chart
function AnalyticsPage({ username, profileViews, viewsToday, onBack }) {
  const [weekData, setWeekData] = useState([])
  const [loadingWeek, setLoadingWeek] = useState(true)
  const [timeRange, setTimeRange] = useState('7')
  const [lastUpdated, setLastUpdated] = useState('')

  useEffect(() => {
    if (!username) return
    const fetchWeek = async () => {
      setLoadingWeek(true)
      const days = []
      const numDays = parseInt(timeRange)
      for (let i = numDays - 1; i >= 0; i--) {
        const d = new Date()
        d.setHours(0, 0, 0, 0)
        d.setDate(d.getDate() - i)
        const nextD = new Date(d)
        nextD.setDate(nextD.getDate() + 1)
        const { count } = await supabase
          .from('profile_views')
          .select('*', { count: 'exact', head: true })
          .eq('username', username)
          .gte('viewed_at', d.toISOString())
          .lt('viewed_at', nextD.toISOString())
        days.push({
          label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          count: count || 0,
        })
      }
      setWeekData(days)
      setLastUpdated('less than a minute ago')
      setLoadingWeek(false)
    }
    fetchWeek()
  }, [username, timeRange])

  const weekTotal = weekData.reduce((a, b) => a + b.count, 0)
  const avgDaily = weekData.length > 0 ? (weekTotal / weekData.length).toFixed(1) : '0'
  const maxCount = Math.max(...weekData.map(d => d.count), 1)

  // Build SVG line chart path
  const chartW = 1000
  const chartH = 200
  const linePath = (() => {
    if (weekData.length < 2) return ''
    const pts = weekData.map((d, i) => {
      const x = (i / (weekData.length - 1)) * chartW
      const y = chartH - (d.count / maxCount) * (chartH - 20) - 10
      return `${x},${y}`
    })
    return `M ${pts.join(' L ')}`
  })()

  const areaPath = (() => {
    if (weekData.length < 2) return ''
    const pts = weekData.map((d, i) => {
      const x = (i / (weekData.length - 1)) * chartW
      const y = chartH - (d.count / maxCount) * (chartH - 20) - 10
      return `${x},${y}`
    })
    return `M 0,${chartH} L ${pts.join(' L ')} L ${chartW},${chartH} Z`
  })()

  const stats = [
    {
      label: 'Profile Views',
      value: profileViews.toLocaleString(),
      sub: `All time unique`,
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    },
    {
      label: 'Views This Period',
      value: weekTotal.toLocaleString(),
      sub: `Last ${timeRange} days`,
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    },
    {
      label: 'Average Daily Views',
      value: avgDaily,
      sub: `Per day`,
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    },
    {
      label: 'Views Today',
      value: viewsToday.toLocaleString(),
      sub: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
    },
  ]

  return (
    <div>
      <style>{`
        .an2-wrap { display: flex; flex-direction: column; gap: 0; }
        .an2-top { background: #111114; border: 1px solid rgba(196,0,29,0.25); border-radius: 16px; padding: 24px 28px; margin-bottom: 20px; }
        .an2-top-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
        .an2-top-title { font-size: 20px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
        .an2-top-sub { font-size: 12px; color: #7a7a8a; }
        .an2-time-row { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; flex-wrap: wrap; }
        .an2-updated { font-size: 11px; color: #7a7a8a; background: rgba(196,0,29,0.1); border: 1px solid rgba(196,0,29,0.25); border-radius: 999px; padding: 4px 12px; }
        .an2-select { background: #0c0c10; border: 1px solid rgba(196,0,29,0.3); border-radius: 10px; color: #b8b8c4; font-size: 12px; padding: 8px 32px 8px 12px; outline: none; font-family: inherit; cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%237a7a8a'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; width: 100%; max-width: 200px; }
        .an2-select:focus { border-color: #c4001d; }
        .an2-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
        .an2-stat { background: #111114; border: 1px solid rgba(196,0,29,0.2); border-radius: 14px; padding: 20px; transition: border-color .15s, transform .15s; position: relative; overflow: hidden; }
        .an2-stat:hover { border-color: rgba(196,0,29,0.5); transform: translateY(-2px); }
        .an2-stat::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(196,0,29,0.05) 0%, transparent 60%); pointer-events: none; }
        .an2-stat-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .an2-stat-label { font-size: 13px; color: #b8b8c4; font-weight: 500; }
        .an2-stat-icon { width: 36px; height: 36px; border-radius: 10px; background: rgba(196,0,29,0.12); border: 1px solid rgba(196,0,29,0.2); display: flex; align-items: center; justify-content: center; color: #ff2340; flex-shrink: 0; }
        .an2-stat-value { font-size: 32px; font-weight: 700; color: #fff; line-height: 1; margin-bottom: 6px; }
        .an2-stat-sub { font-size: 12px; color: #555; }
        .an2-chart-panel { background: #111114; border: 1px solid rgba(196,0,29,0.2); border-radius: 14px; padding: 24px; }
        .an2-chart-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 10px; }
        .an2-chart-title { font-size: 16px; font-weight: 600; color: #fff; }
        .an2-chart-badge { font-size: 11px; color: #7a7a8a; background: rgba(196,0,29,0.08); border: 1px solid rgba(196,0,29,0.2); border-radius: 999px; padding: 4px 12px; }
        .an2-chart-svg-wrap { width: 100%; position: relative; }
        .an2-x-labels { display: flex; justify-content: space-between; margin-top: 8px; padding: 0 2px; }
        .an2-x-label { font-size: 10px; color: #444; }
        .an2-chart-footer { font-size: 11px; color: #3a3a3a; margin-top: 12px; }
        .an2-empty { height: 200px; display: flex; align-items: center; justify-content: center; color: #2a2a2a; font-size: 13px; }
        @media (max-width: 900px) { .an2-stats { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 480px) { .an2-stats { grid-template-columns: 1fr 1fr; } .an2-stat-value { font-size: 24px; } }
      `}</style>

      <div className="an2-wrap">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div>
            <div className="an2-top-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff2340" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              Account Analytics
            </div>
            <div className="an2-top-sub">Track your profile performance and see how many people are visiting your profile.</div>
          </div>
          <button className="back-button" onClick={onBack}>← Back</button>
        </div>

        {/* Time range row */}
        <div className="an2-time-row">
          <span style={{ fontSize: 13, color: '#7a7a8a' }}>Time Range</span>
          {lastUpdated && <span className="an2-updated">Last updated {lastUpdated}</span>}
          <select className="an2-select" value={timeRange} onChange={e => setTimeRange(e.target.value)}>
            <option value="3">Last 3 days</option>
            <option value="7">Last 7 days</option>
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
          </select>
        </div>

        {/* Stat cards */}
        <div className="an2-stats">
          {stats.map((s, i) => (
            <div key={i} className="an2-stat">
              <div className="an2-stat-top">
                <div className="an2-stat-label">{s.label}</div>
                <div className="an2-stat-icon">{s.icon}</div>
              </div>
              <div className="an2-stat-value">{s.value}</div>
              <div className="an2-stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Line chart */}
        <div className="an2-chart-panel">
          <div className="an2-chart-header">
            <div className="an2-chart-title">Profile Views</div>
            <div className="an2-chart-badge">Unique visitors only</div>
          </div>
          {loadingWeek ? (
            <div className="an2-empty">Loading...</div>
          ) : weekTotal === 0 ? (
            <div className="an2-empty">No views yet in this period — share your profile to get started!</div>
          ) : (
            <div className="an2-chart-svg-wrap">
              <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff2340" stopOpacity="0.25"/>
                    <stop offset="100%" stopColor="#ff2340" stopOpacity="0.02"/>
                  </linearGradient>
                </defs>
                {/* Grid lines */}
                {[0.25, 0.5, 0.75, 1].map((v, i) => (
                  <line key={i} x1="0" y1={chartH - v * (chartH - 20) - 10} x2={chartW} y2={chartH - v * (chartH - 20) - 10} stroke="rgba(196,0,29,0.08)" strokeWidth="1"/>
                ))}
                {/* Area fill */}
                {areaPath && <path d={areaPath} fill="url(#areaGrad)"/>}
                {/* Line */}
                {linePath && <path d={linePath} fill="none" stroke="#ff2340" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>}
                {/* Dots */}
                {weekData.map((d, i) => {
                  const x = (i / (weekData.length - 1)) * chartW
                  const y = chartH - (d.count / maxCount) * (chartH - 20) - 10
                  return d.count > 0 ? (
                    <g key={i}>
                      <circle cx={x} cy={y} r="5" fill="#ff2340" stroke="#111114" strokeWidth="2"/>
                    </g>
                  ) : null
                })}
              </svg>
              {/* X axis labels */}
              <div className="an2-x-labels">
                {weekData.map((d, i) => (
                  <span key={i} className="an2-x-label">{d.label}</span>
                ))}
              </div>
            </div>
          )}
          <div className="an2-chart-footer">Each data point represents unique visitor count per day — repeat visits from the same browser don't count.</div>
        </div>
      </div>
    </div>
  )
}