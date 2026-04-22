'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

// ─── Analytics Sub-Page ───────────────────────────────────────────────────────
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
        const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - i)
        const nextD = new Date(d); nextD.setDate(nextD.getDate() + 1)
        const { count } = await supabase.from('profile_views').select('*', { count: 'exact', head: true })
          .eq('username', username).gte('viewed_at', d.toISOString()).lt('viewed_at', nextD.toISOString())
        days.push({ label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count: count || 0 })
      }
      setWeekData(days); setLastUpdated('less than a minute ago'); setLoadingWeek(false)
    }
    fetchWeek()
  }, [username, timeRange])

  const weekTotal = weekData.reduce((a, b) => a + b.count, 0)
  const avgDaily = weekData.length > 0 ? (weekTotal / weekData.length).toFixed(1) : '0'
  const maxCount = Math.max(...weekData.map(d => d.count), 1)
  const chartW = 1000, chartH = 200

  const linePath = (() => {
    if (weekData.length < 2) return ''
    const pts = weekData.map((d, i) => `${(i / (weekData.length - 1)) * chartW},${chartH - (d.count / maxCount) * (chartH - 20) - 10}`)
    return `M ${pts.join(' L ')}`
  })()
  const areaPath = (() => {
    if (weekData.length < 2) return ''
    const pts = weekData.map((d, i) => `${(i / (weekData.length - 1)) * chartW},${chartH - (d.count / maxCount) * (chartH - 20) - 10}`)
    return `M 0,${chartH} L ${pts.join(' L ')} L ${chartW},${chartH} Z`
  })()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <style>{`
        .an-stat { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 14px; padding: 20px; transition: border-color .15s, transform .15s; position: relative; overflow: hidden; }
        .an-stat:hover { border-color: rgba(224,48,48,0.3); transform: translateY(-2px); }
        .an-stat-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 20px; }
        @media(max-width:900px){ .an-stat-grid { grid-template-columns: 1fr 1fr; } }
        @media(max-width:480px){ .an-stat-grid { grid-template-columns: 1fr 1fr; } }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>Dashboard · Analytics</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Syne, sans-serif', margin: 0 }}>View <span style={{ color: '#e03030' }}>Analytics</span></h1>
          <p style={{ marginTop: 4, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Track your profile performance</p>
        </div>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>← Back</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Time Range</span>
        {lastUpdated && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', background: 'rgba(224,48,48,0.08)', border: '1px solid rgba(224,48,48,0.2)', borderRadius: 999, padding: '4px 12px' }}>Updated {lastUpdated}</span>}
        <select value={timeRange} onChange={e => setTimeRange(e.target.value)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, color: '#fff', fontSize: 12, padding: '8px 12px', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
          <option value="3">Last 3 days</option>
          <option value="7">Last 7 days</option>
          <option value="14">Last 14 days</option>
          <option value="30">Last 30 days</option>
        </select>
      </div>

      <div className="an-stat-grid">
        {[
          { label: 'Total Views', value: profileViews.toLocaleString(), sub: 'All time' },
          { label: 'Period Views', value: weekTotal.toLocaleString(), sub: `Last ${timeRange} days` },
          { label: 'Daily Average', value: avgDaily, sub: 'Per day' },
          { label: 'Today', value: viewsToday.toLocaleString(), sub: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) },
        ].map((s, i) => (
          <div key={i} className="an-stat">
            <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>{s.label}</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', lineHeight: 1, marginBottom: 6 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Profile Views</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', background: 'rgba(224,48,48,0.06)', border: '1px solid rgba(224,48,48,0.15)', borderRadius: 999, padding: '4px 12px' }}>Unique visitors only</div>
        </div>
        {loadingWeek ? (
          <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>Loading…</div>
        ) : weekTotal === 0 ? (
          <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No views yet — share your profile to get started!</div>
        ) : (
          <div style={{ width: '100%', position: 'relative' }}>
            <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }} preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e03030" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#e03030" stopOpacity="0.02"/>
                </linearGradient>
              </defs>
              {[0.25,0.5,0.75,1].map((v,i) => (
                <line key={i} x1="0" y1={chartH - v*(chartH-20)-10} x2={chartW} y2={chartH - v*(chartH-20)-10} stroke="rgba(224,48,48,0.06)" strokeWidth="1"/>
              ))}
              {areaPath && <path d={areaPath} fill="url(#areaGrad2)"/>}
              {linePath && <path d={linePath} fill="none" stroke="#e03030" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>}
              {weekData.map((d, i) => {
                if (!d.count) return null
                const x = (i / (weekData.length - 1)) * chartW
                const y = chartH - (d.count / maxCount) * (chartH - 20) - 10
                return <circle key={i} cx={x} cy={y} r="5" fill="#e03030" stroke="#050202" strokeWidth="2"/>
              })}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, padding: '0 2px' }}>
              {weekData.map((d, i) => <span key={i} style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{d.label}</span>)}
            </div>
          </div>
        )}
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 12 }}>Each data point represents unique visitor count per day.</div>
      </div>
    </div>
  )
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [uid, setUid] = useState('')
  const [bio, setBio] = useState('')
  const [links, setLinks] = useState([])
  const [buttons, setButtons] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [activePage, setActivePage] = useState('overview')
  const [displayName, setDisplayName] = useState('')
  const [dbUser, setDbUser] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [profileViews, setProfileViews] = useState(0)
  const [viewsToday, setViewsToday] = useState(0)

  // Appearance state
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
  const [uploadingType, setUploadingType] = useState(null)

  // Appearance tabs
  const [appearTab, setAppearTab] = useState('Presets')
  const [selectedPreset, setSelectedPreset] = useState('Crimson')
  const [bgType, setBgType] = useState('Solid')
  const [selectedFont, setSelectedFont] = useState('Inter')
  const [glowIntensity, setGlowIntensity] = useState(50)
  const [accentColor, setAccentColor] = useState('#e03030')
  const [bgColor, setBgColor] = useState('#050202')

  // Effects state
  const [effectsTab, setEffectsTab] = useState('Particles')
  const [particleEnabled, setParticleEnabled] = useState(false)
  const [particleStyle, setParticleStyle] = useState('Dots')
  const [cursorStyle, setCursorStyle] = useState('Default')
  const [entranceAnim, setEntranceAnim] = useState('Fade In')
  const [clickEffect, setClickEffect] = useState('None')

  // Music state
  const [musicEnabled, setMusicEnabled] = useState(false)
  const [musicType, setMusicType] = useState('direct')
  const [musicUrl, setMusicUrl] = useState('')
  const [musicTitle, setMusicTitle] = useState('')
  const [musicArtist, setMusicArtist] = useState('')
  const [musicAutoplay, setMusicAutoplay] = useState(false)
  const [musicVolume, setMusicVolume] = useState(50)
  const [musicShowTitle, setMusicShowTitle] = useState(true)
  const [musicShowArtist, setMusicShowArtist] = useState(true)

  // Profile editor state
  const [profileTab, setProfileTab] = useState('Identity')
  const [panelSize, setPanelSize] = useState('medium')
  const [showAvatar, setShowAvatar] = useState(true)
  const [avatarPos, setAvatarPos] = useState('center')
  const [typingBio, setTypingBio] = useState(false)
  const [enterEnabled, setEnterEnabled] = useState(true)
  const [enterTitle, setEnterTitle] = useState('')
  const [enterSubtitle, setEnterSubtitle] = useState('Click anywhere to enter')
  const [enterShowAvatar, setEnterShowAvatar] = useState(true)
  const [enterShowTitle, setEnterShowTitle] = useState(true)
  const [enterShowSubtitle, setEnterShowSubtitle] = useState(true)

  // Links/Buttons modals
  const [showAddLinkModal, setShowAddLinkModal] = useState(false)
  const [showAddBtnModal, setShowAddBtnModal] = useState(false)
  const [newLinkLabel, setNewLinkLabel] = useState('')
  const [newLinkUrl, setNewLinkUrl] = useState('')
  const [newBtnLabel, setNewBtnLabel] = useState('')
  const [newBtnUrl, setNewBtnUrl] = useState('')

  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [avatarDDOpen, setAvatarDDOpen] = useState(false)

  const fileBgRef = useRef()
  const fileAvatarRef = useRef()
  const fileCursorRef = useRef()
  const fileAudioRef = useRef()

  const showToast = (msg) => {
    setToast(msg); setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2500)
  }

  // ── Build settings object from current state ──────────────────────────────
  const buildSettings = () => ({
    font: selectedFont,
    accentColor,
    bgColor,
    bgType,
    glowIntensity,
    particleEnabled,
    particleStyle,
    cursorStyle,
    entranceAnim,
    clickEffect,
    music: {
      enabled: musicEnabled,
      type: musicType,
      url: musicUrl,
      title: musicTitle,
      artist: musicArtist,
      autoplay: musicAutoplay,
      volume: musicVolume,
      showTitle: musicShowTitle,
      showArtist: musicShowArtist,
    },
    layout: {
      panelSize,
      showAvatar,
      avatarPos,
      typingBio,
    },
    entrance: {
      enabled: enterEnabled,
      title: enterTitle,
      subtitle: enterSubtitle,
      showAvatar: enterShowAvatar,
      showTitle: enterShowTitle,
      showSubtitle: enterShowSubtitle,
    },
    buttons,
  })

  // ── Load settings from DB settings JSONB ─────────────────────────────────
  const applySettings = (s) => {
    if (!s) return
    if (s.font) setSelectedFont(s.font)
    if (s.accentColor) setAccentColor(s.accentColor)
    if (s.bgColor) setBgColor(s.bgColor)
    if (s.bgType) setBgType(s.bgType)
    if (s.glowIntensity !== undefined) setGlowIntensity(s.glowIntensity)
    if (s.particleEnabled !== undefined) setParticleEnabled(s.particleEnabled)
    if (s.particleStyle) setParticleStyle(s.particleStyle)
    if (s.cursorStyle) setCursorStyle(s.cursorStyle)
    if (s.entranceAnim) setEntranceAnim(s.entranceAnim)
    if (s.clickEffect) setClickEffect(s.clickEffect)
    if (s.music) {
      const m = s.music
      if (m.enabled !== undefined) setMusicEnabled(m.enabled)
      if (m.type) setMusicType(m.type)
      if (m.url) setMusicUrl(m.url)
      if (m.title) setMusicTitle(m.title)
      if (m.artist) setMusicArtist(m.artist)
      if (m.autoplay !== undefined) setMusicAutoplay(m.autoplay)
      if (m.volume !== undefined) setMusicVolume(m.volume)
      if (m.showTitle !== undefined) setMusicShowTitle(m.showTitle)
      if (m.showArtist !== undefined) setMusicShowArtist(m.showArtist)
    }
    if (s.layout) {
      const l = s.layout
      if (l.panelSize) setPanelSize(l.panelSize)
      if (l.showAvatar !== undefined) setShowAvatar(l.showAvatar)
      if (l.avatarPos) setAvatarPos(l.avatarPos)
      if (l.typingBio !== undefined) setTypingBio(l.typingBio)
    }
    if (s.entrance) {
      const e = s.entrance
      if (e.enabled !== undefined) setEnterEnabled(e.enabled)
      if (e.title) setEnterTitle(e.title)
      if (e.subtitle) setEnterSubtitle(e.subtitle)
      if (e.showAvatar !== undefined) setEnterShowAvatar(e.showAvatar)
      if (e.showTitle !== undefined) setEnterShowTitle(e.showTitle)
      if (e.showSubtitle !== undefined) setEnterShowSubtitle(e.showSubtitle)
    }
    if (Array.isArray(s.buttons)) setButtons(s.buttons)
  }

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      const { data } = await supabase.from('users').select('*').eq('email', session.user.email).single()
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
        setDbUser(data)
        if (data.bg_url) setBgPreview(data.bg_url)
        if (data.cursor_url) setCursorPreview(data.cursor_url)
        if (data.audio_url) setAudioName('Uploaded ✓')
        setUid(data.id ? String(data.id) : '')
        // Load settings JSONB
        if (data.settings) applySettings(data.settings)
        else setEnterTitle(data.username || '')
        if (data.username) fetchViewCounts(data.username)
      }
      setLoading(false)
    }
    init()
  }, [router])

  const fetchViewCounts = async (uname) => {
    const { count: total } = await supabase.from('profile_views').select('*', { count: 'exact', head: true }).eq('username', uname)
    const todayStart = new Date(); todayStart.setHours(0,0,0,0)
    const { count: today } = await supabase.from('profile_views').select('*', { count: 'exact', head: true }).eq('username', uname).gte('viewed_at', todayStart.toISOString())
    setProfileViews(total || 0); setViewsToday(today || 0)
  }

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/') }

  const handleFileUpload = async (type, file) => {
    if (!file) return
    setUploadingType(type)
    const ext = file.name.split('.').pop()
    const bucket = type === 'audio' ? 'audio' : 'images'
    const path = `${username}/${type}-${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    if (uploadError) { showToast('Upload failed'); setUploadingType(null); return }
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)
    const url = urlData.publicUrl
    const colMap = { bg: 'bg_url', avatar: 'avatar_url', cursor: 'cursor_url', audio: 'audio_url' }
    await supabase.from('users').update({ [colMap[type]]: url }).eq('username', username)
    if (type === 'bg') setBgPreview(url)
    else if (type === 'avatar') setAvatarPreview(url)
    else if (type === 'cursor') setCursorPreview(url)
    else if (type === 'audio') setAudioName(file.name)
    showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded!`)
    setUploadingType(null)
  }

  const removeAsset = async (type) => {
    const colMap = { bg: 'bg_url', avatar: 'avatar_url', cursor: 'cursor_url', audio: 'audio_url' }
    await supabase.from('users').update({ [colMap[type]]: null }).eq('username', username)
    if (type === 'bg') setBgPreview(null)
    else if (type === 'avatar') setAvatarPreview(null)
    else if (type === 'cursor') setCursorPreview(null)
    else if (type === 'audio') setAudioName(null)
    showToast('Removed')
  }

  // ── Save functions ────────────────────────────────────────────────────────

  const saveProfile = async () => {
    setSaving(true)
    const settings = buildSettings()
    const { error } = await supabase.from('users').update({
      bio: appBio,
      links,
      display_name: displayName,
      location,
      settings,
    }).eq('username', username)
    setSaving(false)
    if (!error) setBio(appBio)
    showToast(error ? 'Failed to save' : 'Profile saved!')
  }

  const saveAppearance = async () => {
    setSaving(true)
    const settings = buildSettings()
    const { error } = await supabase.from('users').update({
      bio: appBio,
      opacity,
      blur,
      username_fx: usernameFx,
      bg_fx: bgFx,
      location,
      glow_settings: glowState,
      discord_presence: discordPresence,
      settings,
    }).eq('username', username)
    setSaving(false)
    if (!error) setBio(appBio)
    showToast(error ? 'Failed to save' : 'Appearance saved!')
  }

  const saveEffects = async () => {
    setSaving(true)
    const settings = buildSettings()
    const { error } = await supabase.from('users').update({ settings }).eq('username', username)
    setSaving(false)
    showToast(error ? 'Failed to save' : 'Effects saved!')
  }

  const saveMusic = async () => {
    setSaving(true)
    const settings = buildSettings()
    // If direct URL provided, also update audio_url column for backwards compat
    const extraUpdate = musicEnabled && musicType === 'direct' && musicUrl ? { audio_url: musicUrl } : {}
    const { error } = await supabase.from('users').update({ settings, ...extraUpdate }).eq('username', username)
    setSaving(false)
    showToast(error ? 'Failed to save' : 'Music saved!')
  }

  const saveButtons = async () => {
    setSaving(true)
    const settings = buildSettings()
    const { error } = await supabase.from('users').update({ settings }).eq('username', username)
    setSaving(false)
    showToast(error ? 'Failed to save' : 'Buttons saved!')
  }

  const addLink = () => {
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) { showToast('Please fill in both fields'); return }
    const url = newLinkUrl.trim().startsWith('http') ? newLinkUrl.trim() : `https://${newLinkUrl.trim()}`
    setLinks(prev => [...prev, { title: newLinkLabel.trim(), url, id: Date.now() }])
    setNewLinkLabel(''); setNewLinkUrl(''); setShowAddLinkModal(false)
    showToast('Link added! Remember to save.')
  }

  // FIX: was using wrong filter logic before
  const deleteLink = (idx) => {
    setLinks(prev => prev.filter((_, i) => i !== idx))
    showToast('Link removed')
  }

  const addButton = () => {
    if (!newBtnLabel.trim() || !newBtnUrl.trim()) { showToast('Please fill in both fields'); return }
    const url = newBtnUrl.trim().startsWith('http') ? newBtnUrl.trim() : `https://${newBtnUrl.trim()}`
    setButtons(prev => [...prev, { label: newBtnLabel.trim(), url, id: Date.now() }])
    setNewBtnLabel(''); setNewBtnUrl(''); setShowAddBtnModal(false)
    showToast('Button added! Remember to save.')
  }

  const navTo = (page) => { setActivePage(page); setSidebarOpen(false); setNotifOpen(false); setAvatarDDOpen(false) }
  const initial = username ? username[0].toUpperCase() : '?'

  const presets = [
    ['Crimson','#1a0000','#e03030'],['Obsidian','#050505','#6366f1'],
    ['Sunset','#1a0800','#f97316'],['Rose','#240b1a','#fb7185'],
    ['Lime','#060b02','#84cc16'],['Ice','#07131d','#7dd3fc'],
    ['Gold','#140f02','#facc15'],['Cherry','#15030b','#f43f5e'],
    ['Ocean','#03111c','#0ea5e9'],['Violet','#0a0517','#8b5cf6'],
  ]

  const fonts = ['Inter','Syne','Space Mono','Roboto','Poppins','Montserrat','Sora','DM Sans','Manrope','JetBrains Mono','Bebas Neue','Playfair Display']
  const particles = ['Dots','Stars','Snow','Bubbles','Fireflies','Sparks','Matrix','Confetti']
  const cursors = ['Default','Dot','Ring','Crosshair','Skull','Star','Heart','Arrow']
  const entranceAnims = ['Fade In','Slide Up','Zoom In','Glitch','None']
  const clickEffects = ['None','Sparks','Hearts','Stars','Explosion','Ripple']
  const platforms = ['Twitter','GitHub','Instagram','Discord','YouTube','TikTok','Twitch','Spotify','LinkedIn','Reddit','Steam','Kick']

  if (loading) return (
    <div style={{ background: '#050202', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>Loading…</div>
    </div>
  )

  const navLinks = [
    { section: null, items: [
      { id: 'overview', label: 'Overview', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
    ]},
    { section: 'PROFILE', items: [
      { id: 'profile', label: 'Edit Profile', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
      { id: 'appearance', label: 'Appearance', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8H12"/></svg> },
      { id: 'links', label: 'Links', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/></svg> },
      { id: 'buttons', label: 'Buttons', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="10" rx="2"/></svg> },
    ]},
    { section: 'FEATURES', items: [
      { id: 'effects', label: 'Effects', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg> },
      { id: 'music', label: 'Music', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg> },
      { id: 'widgets', label: 'Widgets', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="4" rx="1"/><rect x="14" y="3" width="7" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="17" width="7" height="4" rx="1"/><rect x="14" y="17" width="7" height="4" rx="1"/></svg> },
      { id: 'templates', label: 'Templates', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg> },
    ]},
    { section: 'ACCOUNT', items: [
      { id: 'analytics', label: 'Analytics', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
      { id: 'settings', label: 'Settings', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
      { id: 'premium', label: 'Premium', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
    ]},
  ]

  const PageHeader = ({ breadcrumb, title, subtitle }) => (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>{breadcrumb}</div>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, fontFamily: 'Syne, sans-serif' }} dangerouslySetInnerHTML={{ __html: title }} />
      {subtitle && <p style={{ marginTop: 4, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{subtitle}</p>}
    </div>
  )

  const Card = ({ children, style }) => (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, overflow: 'hidden', ...style }}>{children}</div>
  )

  const CardHeader = ({ icon, title, sub, action }) => (
    <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {icon && <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(224,48,48,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>}
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{title}</div>
          {sub && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{sub}</div>}
        </div>
      </div>
      {action}
    </div>
  )

  const Input = ({ style, ...props }) => (
    <input style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '11px 14px', fontSize: 13, color: '#fff', fontFamily: 'Inter, sans-serif', outline: 'none', height: 44, boxSizing: 'border-box', ...style }} {...props} />
  )

  const Textarea = ({ style, ...props }) => (
    <textarea style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '11px 14px', fontSize: 13, color: '#fff', fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'vertical', boxSizing: 'border-box', ...style }} {...props} />
  )

  const BtnAccent = ({ children, onClick, style, disabled }) => (
    <button onClick={onClick} disabled={disabled} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer', border: 'none', background: disabled ? 'rgba(224,48,48,0.4)' : '#e03030', color: '#fff', fontFamily: 'inherit', transition: 'all .15s', opacity: disabled ? 0.6 : 1, ...style }}>{children}</button>
  )

  const BtnGhost = ({ children, onClick, style }) => (
    <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.5)', fontFamily: 'inherit', transition: 'all .15s', ...style }}>{children}</button>
  )

  const SaveBar = ({ onSave, onDiscard }) => (
    <div style={{ position: 'sticky', bottom: 0, background: 'rgba(5,2,2,0.92)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
      {onDiscard && <BtnGhost onClick={onDiscard}>Discard</BtnGhost>}
      <BtnAccent onClick={onSave} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</BtnAccent>
    </div>
  )

  const Toggle = ({ checked, onChange }) => (
    <label style={{ position: 'relative', width: 34, height: 20, flexShrink: 0, cursor: 'pointer', display: 'inline-block' }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: 20, background: checked ? '#e03030' : 'rgba(255,255,255,0.1)', transition: 'background .2s' }} />
      <div style={{ position: 'absolute', top: 3, left: checked ? 17 : 3, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left .2s' }} />
    </label>
  )

  const ToggleRow = ({ label, sub, checked, onChange }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10 }}>
      <div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 500, margin: 0 }}>{label}</p>
        {sub && <small style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', display: 'block', marginTop: 1 }}>{sub}</small>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )

  const TabBar = ({ tabs, active, onSelect, cols }) => (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols || tabs.length},1fr)`, border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: 4, gap: 2 }}>
      {tabs.map(t => (
        <button key={t} onClick={() => onSelect(t)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 12px', borderRadius: 9, border: active === t ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent', background: active === t ? 'rgba(255,255,255,0.07)' : 'transparent', color: active === t ? '#fff' : 'rgba(255,255,255,0.35)', fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>{t}</button>
      ))}
    </div>
  )

  const PreviewPanel = () => (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, overflow: 'hidden', position: 'sticky', top: 70 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="15" height="15" fill="none" stroke="#e03030" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          Live Preview
        </span>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#e03030', display: 'inline-block' }} />
      </div>
      <div style={{ height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', background: bgColor || '#0a0202', position: 'relative', overflow: 'hidden' }}>
        {bgPreview && <img src={bgPreview} alt="bg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: opacity / 100, filter: blur > 0 ? `blur(${Math.round(blur/8)}px)` : 'none' }} />}
        <div style={{ position: 'relative', zIndex: 1, width: 200, background: 'rgba(255,255,255,0.03)', border: `1px solid ${accentColor}33`, borderRadius: 16, padding: 20, textAlign: avatarPos === 'left' ? 'left' : avatarPos === 'right' ? 'right' : 'center', display: 'flex', flexDirection: 'column', alignItems: avatarPos === 'left' ? 'flex-start' : avatarPos === 'right' ? 'flex-end' : 'center', gap: 10, opacity: opacity / 100, fontFamily: selectedFont }}>
          {showAvatar && <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${accentColor}22`, border: `2px solid ${accentColor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, color: accentColor, overflow: 'hidden' }}>
            {avatarPreview ? <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : initial}
          </div>}
          <div style={{ fontSize: 14, fontWeight: 700, color: accentColor }}>{displayName || username}</div>
          {appBio && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{appBio.slice(0, 60)}{appBio.length > 60 ? '…' : ''}</div>}
          {links.slice(0,2).map((l, i) => <div key={i} style={{ width: '100%', padding: 8, background: `${accentColor}11`, border: `1px solid ${accentColor}22`, borderRadius: 8, fontSize: 10, color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>{l.title}</div>)}
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ margin: 0, background: '#050202', fontFamily: 'Inter, sans-serif', color: '#fff', display: 'flex', minHeight: '100vh' }}>
      <title>fate.rip | Dashboard</title>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { color-scheme: dark; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(224,48,48,0.2); border-radius: 2px; }
        .nav-link-btn { display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:10px; font-size:13px; font-weight:500; color:rgba(255,255,255,0.35); cursor:pointer; border:none; background:transparent; width:100%; text-align:left; transition:background .15s, color .15s; font-family:inherit; }
        .nav-link-btn:hover { background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.7); }
        .nav-link-btn.active { background:rgba(224,48,48,0.10); color:#e03030; }
        .action-card { border:1px solid rgba(255,255,255,0.05); background:rgba(255,255,255,0.02); border-radius:12px; padding:20px; cursor:pointer; display:block; transition:transform .2s, border-color .15s, background .15s; }
        .action-card:hover { transform:translateY(-2px); border-color:rgba(224,48,48,0.25); background:rgba(224,48,48,0.04); }
        .stat-card-h { border:1px solid rgba(255,255,255,0.05); background:rgba(255,255,255,0.02); border-radius:12px; padding:20px; backdrop-filter:blur(4px); transition:transform .2s, border-color .2s; }
        .stat-card-h:hover { transform:translateY(-2px); border-color:rgba(255,255,255,0.09); }
        .effect-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
        .effect-btn { padding:10px 6px; border-radius:10px; border:1px solid rgba(255,255,255,0.07); background:rgba(255,255,255,0.02); color:rgba(255,255,255,0.45); font-size:12px; font-weight:500; cursor:pointer; transition:all .15s; text-align:center; font-family:inherit; }
        .effect-btn:hover { background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.7); }
        .effect-btn.active { border-color:rgba(224,48,48,0.4); background:rgba(224,48,48,0.1); color:#e03030; }
        .platform-btn { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; border-radius:12px; border:1px solid rgba(255,255,255,0.07); background:rgba(255,255,255,0.02); padding:12px 8px; cursor:pointer; transition:all .15s; font-size:11px; color:rgba(255,255,255,0.5); font-family:inherit; }
        .platform-btn:hover { border-color:rgba(224,48,48,0.3); background:rgba(224,48,48,0.06); color:#fff; }
        .preset-btn { display:flex; flex-direction:column; align-items:center; gap:8px; border-radius:12px; border:1px solid rgba(255,255,255,0.07); background:rgba(255,255,255,0.02); padding:10px; cursor:pointer; transition:all .15s; font-family:inherit; }
        .preset-btn:hover { border-color:rgba(255,255,255,0.09); background:rgba(255,255,255,0.04); }
        .preset-btn.selected { border-color:rgba(224,48,48,0.4); background:rgba(224,48,48,0.1); }
        .link-item-row { display:flex; align-items:center; gap:12px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:10px; padding:10px 14px; transition:border-color .15s; }
        .link-item-row:hover { border-color:rgba(255,255,255,0.09); }
        .modal-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:1000; align-items:center; justify-content:center; }
        .modal-overlay.open { display:flex; }
        @keyframes toastIn { from{transform:translateX(-50%) translateY(60px);opacity:0} to{transform:translateX(-50%) translateY(0);opacity:1} }
        @media(max-width:900px){ .sidebar-desktop{display:none!important;} .actions-grid-3{grid-template-columns:1fr 1fr!important;} .stats-grid-3{grid-template-columns:1fr 1fr!important;} .editor-layout{grid-template-columns:1fr!important;} .effect-grid{grid-template-columns:repeat(3,1fr)!important;} }
        @media(max-width:600px){ .actions-grid-3{grid-template-columns:1fr!important;} .stats-grid-3{grid-template-columns:1fr!important;} .effect-grid{grid-template-columns:repeat(2,1fr)!important;} }
      `}</style>

      {/* ── SIDEBAR ── */}
      <div className="sidebar-desktop" style={{ width: 270, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.05)', background: 'rgba(5,2,2,0.97)', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', zIndex: 20 }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', gap: 8, padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>
            fate<span style={{ color: 'rgba(255,255,255,0.18)' }}>.</span><span style={{ color: '#e03030' }}>rip</span>
          </span>
        </div>
        <nav style={{ flex: 1, padding: 12, paddingTop: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {navLinks.map(({ section, items }) => (
            <div key={section || 'root'}>
              {section && <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', padding: '0 12px', marginBottom: 4 }}>{section}</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {items.map(item => (
                  <button key={item.id} className={`nav-link-btn ${activePage === item.id ? 'active' : ''}`} onClick={() => navTo(item.id)}>
                    {item.icon}{item.label}
                    {activePage === item.id && <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#e03030', flexShrink: 0 }} />}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: 12 }}>
          <a href={username ? `/${username}` : '/'} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(224,48,48,0.22)', background: 'rgba(224,48,48,0.10)', color: '#e03030', fontSize: 13, fontWeight: 500, textDecoration: 'none', marginBottom: 8 }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            View Profile
          </a>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(224,48,48,0.15)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, color: '#e03030' }}>{initial}</div>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>{username || 'User'}</span>
            </div>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>Log out</button>
          </div>
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', minWidth: 0, position: 'relative', zIndex: 1 }}>
        <header style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(5,2,2,0.88)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 10, gap: 8 }}>
          <button onClick={() => { navigator.clipboard.writeText(`${typeof window !== 'undefined' ? window.location.origin : 'https://fate.rip'}/${username}`); showToast('Profile URL copied!') }} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Copy profile URL">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          </button>
          <button onClick={() => { setAvatarDDOpen(!avatarDDOpen); setNotifOpen(false) }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px 4px 4px', borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', position: 'relative' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(224,48,48,0.15)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, color: '#e03030', overflow: 'hidden' }}>
              {avatarPreview ? <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : initial}
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>{username || 'User'}</span>
            <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
            {avatarDDOpen && (
              <div style={{ position: 'absolute', top: 48, right: 0, width: 200, background: '#0d0505', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12, overflow: 'hidden', zIndex: 50 }} onClick={e => e.stopPropagation()}>
                {[['Edit Profile','profile'],['Settings','settings']].map(([label, page]) => (
                  <button key={page} onClick={() => { navTo(page); setAvatarDDOpen(false) }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', fontSize: 13, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', border: 'none', background: 'none', width: '100%', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)', fontFamily: 'inherit' }}>{label}</button>
                ))}
                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', fontSize: 13, color: '#e03030', cursor: 'pointer', border: 'none', background: 'none', width: '100%', textAlign: 'left', fontFamily: 'inherit' }}>Log out</button>
              </div>
            )}
          </button>
        </header>

        <div style={{ flex: 1, padding: 32, maxWidth: 1100, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }} onClick={() => { setNotifOpen(false); setAvatarDDOpen(false) }}>

          {/* ═══ OVERVIEW ═══ */}
          {activePage === 'overview' && (
            <>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>Dashboard · Overview</div>
                <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, fontFamily: 'Syne, sans-serif' }}>Welcome back, <span style={{ color: '#e03030' }}>{username}</span></h1>
                <p style={{ marginTop: 4, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Here&apos;s what&apos;s happening with your profile</p>
              </div>
              <div style={{ border: '1px solid rgba(224,48,48,0.22)', background: 'rgba(224,48,48,0.05)', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Your profile URL</div>
                    <div style={{ marginTop: 6, fontFamily: 'Space Mono, monospace', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>fate.rip/{username}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <BtnGhost onClick={() => { navigator.clipboard.writeText(`https://fate.rip/${username}`); showToast('URL copied!') }}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                      Copy
                    </BtnGhost>
                    <a href={`/${username}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, border: 'none', background: '#e03030', color: '#fff', textDecoration: 'none' }}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                      View
                    </a>
                  </div>
                </div>
              </div>
              <div className="stats-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                {[
                  { label: 'Total Views', value: profileViews.toLocaleString(), color: '#e03030' },
                  { label: 'Username', value: `@${username}`, color: '#f05050' },
                  { label: 'UID', value: `#${uid || '0001'}`, color: '#b41414' },
                ].map((s, i) => (
                  <div key={i} className="stat-card-h">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ minWidth: 0, flex: 1, paddingRight: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.4)' }}>{s.label}</div>
                        <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.value}</div>
                      </div>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,rgba(224,48,48,0.2),rgba(180,20,20,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="24" height="24" fill="none" stroke={s.color} strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>Quick Actions</div>
                <div className="actions-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                  {[
                    { page: 'links', title: 'Links', desc: 'Add or edit your social links' },
                    { page: 'profile', title: 'Edit Profile', desc: 'Update bio, avatar, and display name' },
                    { page: 'buttons', title: 'Custom Buttons', desc: 'Create call-to-action buttons' },
                    { page: 'appearance', title: 'Appearance', desc: 'Colors, fonts, and themes' },
                    { page: 'effects', title: 'Effects', desc: 'Particles, cursors, and animations' },
                    { page: 'music', title: 'Music', desc: 'Add background music' },
                  ].map((item, i) => (
                    <div key={i} className="action-card" onClick={() => navTo(item.page)}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,rgba(224,48,48,0.2),rgba(180,20,20,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e03030' }}>
                          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>
                        </div>
                        <span style={{ color: 'rgba(255,255,255,0.2)' }}><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg></span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ═══ ANALYTICS ═══ */}
          {activePage === 'analytics' && (
            <AnalyticsPage username={username} profileViews={profileViews} viewsToday={viewsToday} onBack={() => navTo('overview')} />
          )}

          {/* ═══ PROFILE EDITOR ═══ */}
          {activePage === 'profile' && (
            <>
              <PageHeader breadcrumb="Dashboard · Profile" title='Edit <span style="color:#e03030">Profile</span>' subtitle="Update your bio, avatar, and display name" />
              <div className="editor-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <TabBar tabs={['Identity','Layout','Entrance']} active={profileTab} onSelect={setProfileTab} />

                  {profileTab === 'Identity' && (
                    <Card>
                      <CardHeader title="Profile Identity" sub="Your public-facing info" icon={<svg width="20" height="20" fill="none" stroke="#e03030" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} />
                      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 24, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, textAlign: 'center' }}>
                          <input type="file" ref={fileAvatarRef} accept="image/*" style={{ display: 'none' }} onChange={e => handleFileUpload('avatar', e.target.files[0])} />
                          <div style={{ position: 'relative', width: 96, height: 96, cursor: 'pointer' }} onClick={() => fileAvatarRef.current.click()}>
                            <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'rgba(224,48,48,0.12)', border: '3px solid rgba(224,48,48,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, color: '#e03030', overflow: 'hidden' }}>
                              {avatarPreview ? <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : initial}
                            </div>
                          </div>
                          <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>{uploadingType === 'avatar' ? 'Uploading…' : 'Click to change avatar'}</p>
                          <small style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)' }}>JPG, PNG, GIF or WebP · Max 5MB</small>
                          {avatarPreview && <BtnGhost onClick={() => removeAsset('avatar')} style={{ fontSize: 11 }}>Remove</BtnGhost>}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Display Name</label>
                            <Input placeholder="Your name" value={displayName} onChange={e => setDisplayName(e.target.value)} />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Location</label>
                            <Input placeholder="City, Country" value={location} onChange={e => setLocation(e.target.value)} />
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Bio</label>
                          <Textarea placeholder="Tell visitors about yourself…" value={appBio} onChange={e => setAppBio(e.target.value)} rows={4} />
                        </div>
                        <ToggleRow label="Typing Bio Effect" sub="Animate bio text as it types in" checked={typingBio} onChange={e => setTypingBio(e.target.checked)} />
                      </div>
                    </Card>
                  )}

                  {profileTab === 'Layout' && (
                    <Card>
                      <CardHeader title="Profile Layout" sub="Control the structure of your page" icon={<svg width="20" height="20" fill="none" stroke="#e03030" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>} />
                      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Panel Size</label>
                          <div style={{ display: 'flex', gap: 8 }}>
                            {['compact','medium','wide','full'].map(s => (
                              <button key={s} onClick={() => setPanelSize(s)} style={{ flex: 1, padding: '10px 8px', borderRadius: 10, border: `1px solid ${panelSize === s ? 'rgba(224,48,48,0.4)' : 'rgba(255,255,255,0.07)'}`, background: panelSize === s ? 'rgba(224,48,48,0.1)' : 'rgba(255,255,255,0.02)', color: panelSize === s ? '#e03030' : 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'inherit', transition: 'all .15s' }}>{s}</button>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Avatar Position</label>
                          <div style={{ display: 'flex', gap: 8 }}>
                            {['left','center','right'].map(p => (
                              <button key={p} onClick={() => setAvatarPos(p)} style={{ flex: 1, padding: '10px 8px', borderRadius: 10, border: `1px solid ${avatarPos === p ? 'rgba(224,48,48,0.4)' : 'rgba(255,255,255,0.07)'}`, background: avatarPos === p ? 'rgba(224,48,48,0.1)' : 'rgba(255,255,255,0.02)', color: avatarPos === p ? '#e03030' : 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'inherit', transition: 'all .15s' }}>{p}</button>
                            ))}
                          </div>
                        </div>
                        <ToggleRow label="Show Avatar" sub="Display your avatar on your profile" checked={showAvatar} onChange={e => setShowAvatar(e.target.checked)} />
                      </div>
                    </Card>
                  )}

                  {profileTab === 'Entrance' && (
                    <Card>
                      <CardHeader title="Entrance Screen" sub="Show a splash screen before visitors see your profile"
                        icon={<svg width="20" height="20" fill="none" stroke="#e03030" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>}
                        action={<Toggle checked={enterEnabled} onChange={e => setEnterEnabled(e.target.checked)} />}
                      />
                      {enterEnabled && (
                        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Title</label>
                              <Input placeholder="Enter title" value={enterTitle} onChange={e => setEnterTitle(e.target.value)} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Subtitle</label>
                              <Input placeholder="Click anywhere to enter" value={enterSubtitle} onChange={e => setEnterSubtitle(e.target.value)} />
                            </div>
                          </div>
                          <ToggleRow label="Show Avatar" checked={enterShowAvatar} onChange={e => setEnterShowAvatar(e.target.checked)} />
                          <ToggleRow label="Show Title" checked={enterShowTitle} onChange={e => setEnterShowTitle(e.target.checked)} />
                          <ToggleRow label="Show Subtitle" checked={enterShowSubtitle} onChange={e => setEnterShowSubtitle(e.target.checked)} />
                        </div>
                      )}
                    </Card>
                  )}

                  <SaveBar onSave={saveProfile} onDiscard={() => { setAppBio(bio); setDisplayName(dbUser?.display_name || ''); setLocation(dbUser?.location || '') }} />
                </div>
                <PreviewPanel />
              </div>
            </>
          )}

          {/* ═══ APPEARANCE ═══ */}
          {activePage === 'appearance' && (
            <>
              <PageHeader breadcrumb="Dashboard · Appearance" title='Customize <span style="color:#e03030">Appearance</span>' subtitle="Colors, fonts, and themes" />
              <div className="editor-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <input type="file" ref={fileBgRef} accept="image/*,video/*" style={{ display: 'none' }} onChange={e => handleFileUpload('bg', e.target.files[0])} />
                  <TabBar tabs={['Presets','Colors','Fonts','Background','Glow']} active={appearTab} onSelect={setAppearTab} cols={5} />

                  {appearTab === 'Presets' && (
                    <Card>
                      <CardHeader title="Theme Presets" sub="One-click themes with coordinated colors and effects" />
                      <div style={{ padding: 24 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
                          {presets.map(([name, bg, acc]) => (
                            <button key={name} className={`preset-btn ${selectedPreset === name ? 'selected' : ''}`} onClick={() => { setSelectedPreset(name); setAccentColor(acc); setBgColor(bg); showToast(`${name} applied! Save to keep it.`) }}>
                              <div style={{ width: '100%', height: 36, borderRadius: 8, overflow: 'hidden', display: 'flex' }}>
                                <div style={{ flex: 1, background: bg }} />
                                <div style={{ width: 20, background: acc }} />
                              </div>
                              <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>{name}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </Card>
                  )}

                  {appearTab === 'Colors' && (
                    <Card>
                      <CardHeader title="Color Settings" sub="Customize accent and background colors" />
                      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {[['Accent Color', accentColor, setAccentColor],['Background Color', bgColor, setBgColor]].map(([lbl, val, setter]) => (
                          <div key={lbl} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{lbl}</div>
                              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Mono, monospace', marginTop: 4 }}>{val}</div>
                            </div>
                            <input type="color" value={val} onChange={e => setter(e.target.value)} style={{ width: 44, height: 44, border: 'none', borderRadius: 10, background: 'rgba(255,255,255,0.05)', cursor: 'pointer', padding: 4 }} />
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {appearTab === 'Fonts' && (
                    <Card>
                      <CardHeader title="Font Family" sub="Choose a font for your profile text" />
                      <div style={{ padding: 24 }}>
                        <div className="effect-grid">
                          {fonts.map(f => (
                            <button key={f} className={`effect-btn ${selectedFont === f ? 'active' : ''}`} style={{ fontFamily: `'${f}', sans-serif` }} onClick={() => setSelectedFont(f)}>{f}</button>
                          ))}
                        </div>
                      </div>
                    </Card>
                  )}

                  {appearTab === 'Background' && (
                    <Card>
                      <CardHeader title="Background" sub="Choose how your profile background looks" />
                      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Type</label>
                          <div style={{ display: 'flex', gap: 8 }}>
                            {['Solid','Gradient','Image','Video'].map(t => (
                              <button key={t} onClick={() => setBgType(t)} style={{ flex: 1, padding: '10px 8px', borderRadius: 10, border: `1px solid ${bgType === t ? 'rgba(224,48,48,0.4)' : 'rgba(255,255,255,0.07)'}`, background: bgType === t ? 'rgba(224,48,48,0.1)' : 'rgba(255,255,255,0.02)', color: bgType === t ? '#e03030' : 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}>{t}</button>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Background Effect</label>
                          <select value={bgFx} onChange={e => setBgFx(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '11px 14px', fontSize: 13, color: '#fff', fontFamily: 'inherit', outline: 'none', height: 44, appearance: 'none' }}>
                            <option value="none">None</option><option value="nighttime">Night Time</option><option value="particles">Particles</option><option value="rain">Rain</option><option value="snow">Snow</option><option value="matrix">Matrix</option>
                          </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Opacity — {opacity}%</label>
                          <input type="range" min={20} max={100} value={opacity} onChange={e => setOpacity(Number(e.target.value))} style={{ width: '100%', accentColor: '#e03030' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Blur — {blur}px</label>
                          <input type="range" min={0} max={80} value={blur} onChange={e => setBlur(Number(e.target.value))} style={{ width: '100%', accentColor: '#e03030' }} />
                        </div>
                        <div onClick={() => fileBgRef.current.click()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 12, padding: '32px 24px', fontSize: 13, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', background: 'rgba(255,255,255,0.01)' }}>
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>
                          {uploadingType === 'bg' ? 'Uploading…' : bgPreview ? 'Replace background media' : 'Upload background media (max 25MB)'}
                        </div>
                        {bgPreview && <BtnGhost onClick={() => removeAsset('bg')} style={{ alignSelf: 'flex-start' }}>Remove Background</BtnGhost>}
                      </div>
                    </Card>
                  )}

                  {appearTab === 'Glow' && (
                    <Card>
                      <CardHeader title="Glow Effects" sub="Add glowing highlights to profile elements" />
                      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <ToggleRow label="Glow Username" checked={glowState.username} onChange={e => setGlowState(p => ({ ...p, username: e.target.checked }))} />
                        <ToggleRow label="Glow Social Links" checked={glowState.socials} onChange={e => setGlowState(p => ({ ...p, socials: e.target.checked }))} />
                        <ToggleRow label="Glow Badges" checked={glowState.badges} onChange={e => setGlowState(p => ({ ...p, badges: e.target.checked }))} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                          <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Glow Intensity — {glowIntensity}%</label>
                          <input type="range" min={0} max={100} value={glowIntensity} onChange={e => setGlowIntensity(Number(e.target.value))} style={{ width: '100%', accentColor: '#e03030' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Username Effect</label>
                          <select value={usernameFx} onChange={e => setUsernameFx(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '11px 14px', fontSize: 13, color: '#fff', fontFamily: 'inherit', outline: 'none', height: 44, appearance: 'none' }}>
                            <option value="">None</option><option value="rainbow">🌈 Rainbow</option><option value="glitch">⚡ Glitch</option><option value="neon">✨ Neon</option><option value="gold">🏆 Gold</option>
                          </select>
                        </div>
                      </div>
                    </Card>
                  )}

                  <SaveBar onSave={saveAppearance} onDiscard={() => showToast('Changes discarded')} />
                </div>
                <PreviewPanel />
              </div>
            </>
          )}

          {/* ═══ LINKS ═══ */}
          {activePage === 'links' && (
            <>
              <PageHeader breadcrumb="Dashboard · Links" title='Manage <span style="color:#e03030">Links</span>' subtitle="Add or edit your social links" />
              <Card>
                <CardHeader title="Quick Add" sub="Click a platform to add your link" icon={<svg width="20" height="20" fill="none" stroke="#e03030" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/></svg>} />
                <div style={{ padding: 24 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 8 }}>
                    {platforms.map(p => (
                      <button key={p} className="platform-btn" onClick={() => { setNewLinkLabel(p); setNewLinkUrl(''); setShowAddLinkModal(true) }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(224,48,48,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#e03030', fontWeight: 700 }}>{p[0]}</div>
                        <span>{p}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
              <Card>
                <CardHeader title="Your Links" sub={`${links.length} link${links.length !== 1 ? 's' : ''}`}
                  action={<BtnAccent onClick={() => { setNewLinkLabel(''); setNewLinkUrl(''); setShowAddLinkModal(true) }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                    Add Link
                  </BtnAccent>}
                />
                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {links.length === 0 && <div style={{ padding: '32px 0', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No links yet — add one above!</div>}
                  {links.map((l, i) => (
                    <div key={i} className="link-item-row">
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(224,48,48,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e03030', flexShrink: 0 }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/></svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{l.title}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono, monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.url}</div>
                      </div>
                      {/* FIX: use index-based delete */}
                      <button onClick={() => deleteLink(i)} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
              {links.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <BtnAccent onClick={async () => {
                    setSaving(true)
                    const { error } = await supabase.from('users').update({ links }).eq('username', username)
                    setSaving(false)
                    showToast(error ? 'Failed to save' : 'Links saved!')
                  }} disabled={saving}>Save Links</BtnAccent>
                </div>
              )}
            </>
          )}

          {/* ═══ BUTTONS ═══ */}
          {activePage === 'buttons' && (
            <>
              <PageHeader breadcrumb="Dashboard · Buttons" title='Custom <span style="color:#e03030">Buttons</span>' subtitle="Create call-to-action buttons" />
              <Card>
                <CardHeader title="Your Buttons" sub={`${buttons.length} button${buttons.length !== 1 ? 's' : ''}`}
                  action={<BtnAccent onClick={() => setShowAddBtnModal(true)}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                    Add Button
                  </BtnAccent>}
                />
                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {buttons.length === 0 && <div style={{ padding: '32px 0', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No buttons yet — create one above!</div>}
                  {buttons.map((b, i) => (
                    <div key={i} className="link-item-row">
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{b.label}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono, monospace' }}>{b.url}</div>
                      </div>
                      <button onClick={() => { setButtons(prev => prev.filter((_, idx) => idx !== i)); showToast('Button removed') }} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
              <SaveBar onSave={saveButtons} />
            </>
          )}

          {/* ═══ EFFECTS ═══ */}
          {activePage === 'effects' && (
            <>
              <PageHeader breadcrumb="Dashboard · Effects" title='Visual <span style="color:#e03030">Effects</span>' subtitle="Particles, cursors, and animations" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <TabBar tabs={['Particles','Cursor','Animations','Click Effects']} active={effectsTab} onSelect={setEffectsTab} cols={4} />

                {effectsTab === 'Particles' && (
                  <Card>
                    <CardHeader title="Particle Effects" sub="Background particles on your profile"
                      action={<Toggle checked={particleEnabled} onChange={e => setParticleEnabled(e.target.checked)} />}
                    />
                    {particleEnabled && (
                      <div style={{ padding: 24 }}>
                        <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Style</label>
                        <div className="effect-grid">
                          {particles.map(p => <button key={p} className={`effect-btn ${particleStyle === p ? 'active' : ''}`} onClick={() => setParticleStyle(p)}>{p}</button>)}
                        </div>
                      </div>
                    )}
                  </Card>
                )}

                {effectsTab === 'Cursor' && (
                  <Card>
                    <CardHeader title="Custom Cursor" sub="Replace the default cursor on your profile" />
                    <div style={{ padding: 24 }}>
                      <div className="effect-grid">
                        {cursors.map(c => <button key={c} className={`effect-btn ${cursorStyle === c ? 'active' : ''}`} onClick={() => setCursorStyle(c)}>{c}</button>)}
                      </div>
                    </div>
                    <div style={{ padding: '0 24px 24px' }}>
                      <input type="file" ref={fileCursorRef} accept="image/*" style={{ display: 'none' }} onChange={e => handleFileUpload('cursor', e.target.files[0])} />
                      <div onClick={() => fileCursorRef.current.click()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 12, padding: '24px', fontSize: 13, color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>
                        {uploadingType === 'cursor' ? 'Uploading…' : cursorPreview ? 'Replace cursor image' : 'Upload a custom cursor image'}
                      </div>
                      {cursorPreview && <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}><img src={cursorPreview} alt="cursor" style={{ width: 32, height: 32, objectFit: 'contain' }} /><BtnGhost onClick={() => removeAsset('cursor')}>Remove</BtnGhost></div>}
                    </div>
                  </Card>
                )}

                {effectsTab === 'Animations' && (
                  <Card>
                    <CardHeader title="Entrance Animation" sub="How your profile animates in for visitors" />
                    <div style={{ padding: 24 }}>
                      <div className="effect-grid">
                        {entranceAnims.map(a => <button key={a} className={`effect-btn ${entranceAnim === a ? 'active' : ''}`} onClick={() => setEntranceAnim(a)}>{a}</button>)}
                      </div>
                    </div>
                  </Card>
                )}

                {effectsTab === 'Click Effects' && (
                  <Card>
                    <CardHeader title="Click Effects" sub="What happens when visitors click on your profile" />
                    <div style={{ padding: 24 }}>
                      <div className="effect-grid">
                        {clickEffects.map(e => <button key={e} className={`effect-btn ${clickEffect === e ? 'active' : ''}`} onClick={() => setClickEffect(e)}>{e}</button>)}
                      </div>
                    </div>
                  </Card>
                )}

                {/* FIX: now actually calls saveEffects */}
                <SaveBar onSave={saveEffects} onDiscard={() => showToast('Changes discarded')} />
              </div>
            </>
          )}

          {/* ═══ MUSIC ═══ */}
          {activePage === 'music' && (
            <>
              <PageHeader breadcrumb="Dashboard · Music" title='Background <span style="color:#e03030">Music</span>' subtitle="Add a track that plays when visitors view your profile" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 80 }}>
                <Card>
                  <CardHeader title="Background Music" sub="Add a track that plays when visitors view your profile"
                    icon={<svg width="20" height="20" fill="none" stroke="#e03030" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>}
                    action={<Toggle checked={musicEnabled} onChange={e => setMusicEnabled(e.target.checked)} />}
                  />
                  {musicEnabled && (
                    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {['direct','spotify','soundcloud'].map(t => (
                          <button key={t} onClick={() => setMusicType(t)} style={{ flex: 1, padding: '10px 8px', borderRadius: 10, border: `1px solid ${musicType === t ? 'rgba(224,48,48,0.4)' : 'rgba(255,255,255,0.07)'}`, background: musicType === t ? 'rgba(224,48,48,0.1)' : 'rgba(255,255,255,0.02)', color: musicType === t ? '#e03030' : 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                            {{ direct: 'Direct URL', spotify: 'Spotify', soundcloud: 'SoundCloud' }[t]}
                          </button>
                        ))}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{musicType === 'direct' ? 'Audio URL (.mp3, .ogg, etc.)' : 'Track URL'}</label>
                        <Input placeholder={musicType === 'direct' ? 'https://example.com/song.mp3' : musicType === 'spotify' ? 'https://open.spotify.com/track/…' : 'https://soundcloud.com/…'} value={musicUrl} onChange={e => setMusicUrl(e.target.value)} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Track Title</label>
                          <Input placeholder="Song name" value={musicTitle} onChange={e => setMusicTitle(e.target.value)} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Artist</label>
                          <Input placeholder="Artist name" value={musicArtist} onChange={e => setMusicArtist(e.target.value)} />
                        </div>
                      </div>
                      {/* File upload for direct audio */}
                      {musicType === 'direct' && (
                        <div>
                          <input type="file" ref={fileAudioRef} accept="audio/*" style={{ display: 'none' }} onChange={e => handleFileUpload('audio', e.target.files[0])} />
                          <div onClick={() => fileAudioRef.current.click()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 12, padding: '20px', fontSize: 13, color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>
                            {uploadingType === 'audio' ? 'Uploading…' : audioName ? `Uploaded: ${audioName}` : 'Or upload an audio file (max 10MB)'}
                          </div>
                        </div>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Volume — {musicVolume}%</label>
                        <input type="range" min={0} max={100} value={musicVolume} onChange={e => setMusicVolume(Number(e.target.value))} style={{ width: '100%', accentColor: '#e03030' }} />
                      </div>
                    </div>
                  )}
                </Card>

                {musicEnabled && (
                  <Card>
                    <CardHeader title="Display Options" sub="Control how the music player appears" />
                    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <ToggleRow label="Autoplay" sub="Start playing when visitors arrive" checked={musicAutoplay} onChange={e => setMusicAutoplay(e.target.checked)} />
                      <ToggleRow label="Show Track Title" sub="Display song name in player" checked={musicShowTitle} onChange={e => setMusicShowTitle(e.target.checked)} />
                      <ToggleRow label="Show Artist" sub="Display artist name in player" checked={musicShowArtist} onChange={e => setMusicShowArtist(e.target.checked)} />
                    </div>
                  </Card>
                )}

                {/* FIX: now actually calls saveMusic */}
                <SaveBar onSave={saveMusic} onDiscard={() => showToast('Changes discarded')} />
              </div>
            </>
          )}

          {/* ═══ WIDGETS / TEMPLATES ═══ */}
          {(activePage === 'widgets' || activePage === 'templates') && (
            <>
              <PageHeader
                breadcrumb={`Dashboard · ${activePage === 'widgets' ? 'Widgets' : 'Templates'}`}
                title={activePage === 'widgets' ? 'Profile <span style="color:#e03030">Widgets</span>' : 'Browse <span style="color:#e03030">Templates</span>'}
                subtitle={activePage === 'widgets' ? 'Add widgets to your page' : 'Pick a pre-built layout'}
              />
              <div style={{ padding: 40, textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{activePage === 'widgets' ? '⊞' : '⊟'}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>Coming Soon</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', marginTop: 6, maxWidth: 300, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
                  {activePage === 'widgets' ? 'Add countdown timers, now-playing widgets, Discord status, and more.' : 'Pick from pre-built layouts to instantly style your profile.'}
                </div>
              </div>
            </>
          )}

          {/* ═══ PREMIUM ═══ */}
          {activePage === 'premium' && (
            <>
              <PageHeader breadcrumb="Dashboard · Premium" title='Go <span style="color:#e03030">Premium</span>' subtitle="Unlock exclusive features" />
              <div style={{ background: 'linear-gradient(135deg,rgba(224,48,48,0.08),rgba(100,0,0,0.08))', border: '1px solid rgba(224,48,48,0.22)', borderRadius: 14, padding: 28, textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>💀</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, marginBottom: 8 }}>fate.rip <span style={{ color: '#e03030' }}>Premium</span></div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', maxWidth: 340, margin: '0 auto 20px' }}>Unlock custom domains, advanced analytics, exclusive effects, and priority support.</p>
                <BtnAccent style={{ padding: '12px 28px', fontSize: 14 }} onClick={() => showToast('Redirecting to checkout…')}>Upgrade Now</BtnAccent>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Custom domain (yourname.com)','Advanced analytics dashboard','Exclusive cursor & particle effects','Priority support','Early access to new features','Remove fate.rip branding'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10 }}>
                    <svg width="16" height="16" fill="none" stroke="#e03030" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{f}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ═══ SETTINGS ═══ */}
          {activePage === 'settings' && (
            <>
              <PageHeader breadcrumb="Dashboard · Settings" title='Account <span style="color:#e03030">Settings</span>' subtitle="Manage your account" />
              <div style={{ maxWidth: 680 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <Card>
                    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                      {/* Username */}
                      {(() => {
                        const lastChanged = dbUser?.username_changed_at ? new Date(dbUser.username_changed_at) : null
                        const daysLeft = lastChanged ? Math.max(0, 7 - Math.floor((Date.now() - lastChanged.getTime()) / 86400000)) : 0
                        const locked = daysLeft > 0
                        return (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                              <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>Username</span>
                              {locked ? <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', fontWeight: 600 }}>Locked {daysLeft}d</span>
                                : <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', fontWeight: 600 }}>Available</span>}
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                              <Input value={username} disabled={locked} onChange={e => setUsername(e.target.value)} placeholder="Username" style={{ opacity: locked ? 0.5 : 1 }} />
                              <BtnAccent onClick={async () => {
                                if (!username.trim()) { showToast('Username cannot be empty'); return }
                                const { data: existing } = await supabase.from('users').select('username').eq('username', username.trim()).neq('email', user.email).maybeSingle()
                                if (existing) { showToast('Username already taken'); return }
                                const { error } = await supabase.from('users').update({ username: username.trim(), username_changed_at: new Date().toISOString() }).eq('email', user.email)
                                if (!error) setDbUser(p => ({ ...p, username_changed_at: new Date().toISOString() }))
                                showToast(error ? 'Failed to save' : 'Username updated!')
                              }} disabled={locked}>Save</BtnAccent>
                            </div>
                          </div>
                        )
                      })()}

                      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />

                      {/* Display Name */}
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>Display Name</div>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Display name" />
                          <BtnAccent onClick={async () => {
                            const { error } = await supabase.from('users').update({ display_name: displayName }).eq('email', user.email)
                            showToast(error ? 'Failed to save' : 'Display name saved!')
                          }}>Save</BtnAccent>
                        </div>
                      </div>

                      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />

                      {/* Password */}
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>Password</div>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, paddingRight: 10 }}>
                            <Input type={showPassword ? 'text' : 'password'} placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ border: 'none', background: 'transparent', flex: 1 }} />
                            <button onClick={() => setShowPassword(p => !p)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 4, display: 'flex' }}>
                              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            </button>
                          </div>
                          <BtnAccent onClick={async () => {
                            if (!newPassword || newPassword.length < 6) { showToast('Password must be 6+ characters'); return }
                            const { error } = await supabase.auth.updateUser({ password: newPassword })
                            if (!error) setNewPassword('')
                            showToast(error ? 'Failed to update password' : 'Password updated!')
                          }}>Update</BtnAccent>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <div style={{ background: 'rgba(224,48,48,0.04)', border: '1px solid rgba(224,48,48,0.15)', borderRadius: 14, padding: 22 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#e03030', marginBottom: 4 }}>Session</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>Sign out of your current session on this device.</div>
                    <BtnGhost onClick={handleLogout}>← Log Out</BtnGhost>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* ── ADD LINK MODAL ── */}
      <div className={`modal-overlay ${showAddLinkModal ? 'open' : ''}`} onClick={() => setShowAddLinkModal(false)}>
        <div onClick={e => e.stopPropagation()} style={{ background: '#0d0505', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 420, position: 'relative' }}>
          <button onClick={() => setShowAddLinkModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 4 }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Add <span style={{ color: '#e03030' }}>Link</span></h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>Add a new social or custom link to your profile</p>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>Label</label>
            <Input placeholder="e.g. Twitter, GitHub, Portfolio…" value={newLinkLabel} onChange={e => setNewLinkLabel(e.target.value)} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>URL</label>
            <Input type="url" placeholder="https://…" value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && addLink()} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <BtnGhost onClick={() => setShowAddLinkModal(false)}>Cancel</BtnGhost>
            <BtnAccent onClick={addLink}>Add Link</BtnAccent>
          </div>
        </div>
      </div>

      {/* ── ADD BUTTON MODAL ── */}
      <div className={`modal-overlay ${showAddBtnModal ? 'open' : ''}`} onClick={() => setShowAddBtnModal(false)}>
        <div onClick={e => e.stopPropagation()} style={{ background: '#0d0505', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 420, position: 'relative' }}>
          <button onClick={() => setShowAddBtnModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 4 }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Custom <span style={{ color: '#e03030' }}>Button</span></h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>Create a call-to-action button on your profile</p>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>Button Label</label>
            <Input placeholder="e.g. Hire Me, Buy Now…" value={newBtnLabel} onChange={e => setNewBtnLabel(e.target.value)} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>URL</label>
            <Input type="url" placeholder="https://…" value={newBtnUrl} onChange={e => setNewBtnUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && addButton()} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <BtnGhost onClick={() => setShowAddBtnModal(false)}>Cancel</BtnGhost>
            <BtnAccent onClick={addButton}>Create Button</BtnAccent>
          </div>
        </div>
      </div>

      {/* ── TOAST ── */}
      {toastVisible && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#1a0808', border: '1px solid rgba(224,48,48,0.22)', color: '#fff', fontSize: 13, padding: '10px 18px', borderRadius: 100, zIndex: 2000, display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', animation: 'toastIn .3s ease' }}>
          <svg width="14" height="14" fill="none" stroke="#e03030" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>
          {toast}
        </div>
      )}
    </div>
  )
}