'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

// ─── Platform definitions ──────────────────────────────────────────────────────
const PLATFORMS = [
  { id:'discord',     name:'Discord',          color:'#5865F2', prefix:'',                      placeholder:'https://discord.gg/...' },
  { id:'twitter',     name:'Twitter / X',      color:'#000000', prefix:'x.com/',               placeholder:'username' },
  { id:'github',      name:'GitHub',           color:'#24292e', prefix:'github.com/',           placeholder:'username' },
  { id:'gitlab',      name:'GitLab',           color:'#FC6D26', prefix:'gitlab.com/',           placeholder:'username' },
  { id:'instagram',   name:'Instagram',        color:'#E1306C', prefix:'instagram.com/',        placeholder:'username' },
  { id:'facebook',    name:'Facebook',         color:'#1877F2', prefix:'facebook.com/',         placeholder:'username' },
  { id:'spotify',     name:'Spotify',          color:'#1DB954', prefix:'open.spotify.com/user/', placeholder:'username' },
  { id:'soundcloud',  name:'SoundCloud',       color:'#FF5500', prefix:'soundcloud.com/',       placeholder:'username' },
  { id:'applemusic',  name:'Apple Music',      color:'#FA2D48', prefix:'music.apple.com/',      placeholder:'profile URL' },
  { id:'youtube',     name:'YouTube',          color:'#FF0000', prefix:'youtube.com/@',         placeholder:'handle' },
  { id:'twitch',      name:'Twitch',           color:'#9146FF', prefix:'twitch.tv/',            placeholder:'username' },
  { id:'tiktok',      name:'TikTok',           color:'#010101', prefix:'tiktok.com/@',          placeholder:'username' },
  { id:'snapchat',    name:'Snapchat',         color:'#FFFC00', prefix:'snapchat.com/add/',     placeholder:'username' },
  { id:'linkedin',    name:'LinkedIn',         color:'#0A66C2', prefix:'linkedin.com/in/',      placeholder:'username' },
  { id:'reddit',      name:'Reddit',           color:'#FF4500', prefix:'reddit.com/u/',         placeholder:'username' },
  { id:'telegram',    name:'Telegram',         color:'#26A5E4', prefix:'t.me/',                 placeholder:'username' },
  { id:'bluesky',     name:'Bluesky',          color:'#0085FF', prefix:'bsky.app/profile/',     placeholder:'handle' },
  { id:'vk',          name:'VK',               color:'#4680C2', prefix:'vk.com/',               placeholder:'username' },
  { id:'pinterest',   name:'Pinterest',        color:'#E60023', prefix:'pinterest.com/',        placeholder:'username' },
  { id:'dribbble',    name:'Dribbble',         color:'#EA4C89', prefix:'dribbble.com/',         placeholder:'username' },
  { id:'deviantart',  name:'DeviantArt',       color:'#05CC47', prefix:'deviantart.com/',       placeholder:'username' },
  { id:'steam',       name:'Steam',            color:'#1B2838', prefix:'steamcommunity.com/id/', placeholder:'username' },
  { id:'itchio',      name:'itch.io',          color:'#FA5C5C', prefix:'itch.io/profile/',      placeholder:'username' },
  { id:'kickstarter', name:'Kickstarter',      color:'#05CE78', prefix:'kickstarter.com/profile/', placeholder:'username' },
  { id:'patreon',     name:'Patreon',          color:'#FF424D', prefix:'patreon.com/',          placeholder:'username' },
  { id:'kofi',        name:'Ko-fi',            color:'#FF5E5B', prefix:'ko-fi.com/',            placeholder:'username' },
  { id:'buymeacoffee',name:'Buy Me a Coffee',  color:'#FFDD02', prefix:'buymeacoffee.com/',     placeholder:'username' },
  { id:'paypal',      name:'PayPal',           color:'#003087', prefix:'paypal.me/',            placeholder:'username' },
  { id:'bitcoin',     name:'Bitcoin',          color:'#F7931A', prefix:'',                      placeholder:'wallet address' },
  { id:'ethereum',    name:'Ethereum',         color:'#627EEA', prefix:'',                      placeholder:'wallet address' },
  { id:'solana',      name:'Solana',           color:'#9945FF', prefix:'',                      placeholder:'wallet address' },
  { id:'roblox',      name:'Roblox',           color:'#e00000', prefix:'roblox.com/users/',     placeholder:'username' },
  { id:'email',       name:'Email',            color:'#EA4335', prefix:'mailto:',               placeholder:'you@example.com' },
  { id:'custom',      name:'Custom',           color:'#e03030', prefix:'',                      placeholder:'https://...' },
]

const PLATFORM_ABBR = {
  discord:'Di', twitter:'X', github:'Gh', gitlab:'Gl', instagram:'Ig',
  facebook:'Fb', spotify:'Sp', soundcloud:'Sc', applemusic:'♪', youtube:'Yt',
  twitch:'Tv', tiktok:'Tt', snapchat:'Sn', linkedin:'Li', reddit:'Re',
  telegram:'Tg', bluesky:'Bs', vk:'VK', pinterest:'Pi', dribbble:'Dr',
  deviantart:'Da', steam:'St', itchio:'It', kickstarter:'Ks', patreon:'Pa',
  kofi:'Ko', buymeacoffee:'Bm', paypal:'Pp', bitcoin:'₿', ethereum:'Ξ',
  solana:'◎', roblox:'R', email:'✉', custom:'✦',
}

const LIGHT_PLATFORMS = new Set(['snapchat', 'buymeacoffee', 'bitcoin'])

const BADGE_DEFS = [
  { id:'owner', name:'Owner', desc:'Creator and owner of fate.rip.', color:'#e03030', bg:'rgba(224,48,48,0.15)', border:'rgba(224,48,48,0.35)', how:null, icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M2 20h20v-2H2v2zm0-4h20L19 7l-5 4-4-6-4 6-5-4 2 9z"/></svg> },
  { id:'staff', name:'Staff', desc:'Be a part of the fate.rip staff team.', color:'#378ADD', bg:'rgba(55,138,221,0.12)', border:'rgba(55,138,221,0.3)', how:null, icon:<img src="/Discord_Staff.png" width="22" height="22" style={{objectFit:'contain'}} /> },
  { id:'verified', name:'Verified', desc:'Purchase or be a known content creator.', color:'#1D9E75', bg:'rgba(29,158,117,0.12)', border:'rgba(29,158,117,0.3)', how:'Unlock', howHref:null, icon:<img src="/blurple_verified.png" width="22" height="22" style={{objectFit:'contain'}} /> },
  { id:'og', name:'OG', desc:'Be an early supporter of fate.rip.', color:'#EF9F27', bg:'rgba(239,159,39,0.12)', border:'rgba(239,159,39,0.3)', how:null, icon:<img src="/Star_blue.png" width="22" height="22" style={{objectFit:'contain'}} /> },
  { id:'booster', name:'Server Booster', desc:'Boost the fate.rip Discord server.', color:'#f97316', bg:'rgba(249,115,22,0.12)', border:'rgba(249,115,22,0.3)', how:'Boost', howHref:'https://discord.gg/faterip', icon:<img src="/d_boost.png" width="22" height="22" style={{objectFit:'contain'}} /> },
  { id:'donator', name:'Donator', desc:'Donate at least $10 to fate.rip.', color:'#5DCAA5', bg:'rgba(93,202,165,0.12)', border:'rgba(93,202,165,0.3)', how:'Donate', howHref:null, icon:<img src="/Money.png" width="22" height="22" style={{objectFit:'contain'}} /> },
  { id:'premium', name:'Premium', desc:'Purchase the fate.rip premium package.', color:'#8b5cf6', bg:'rgba(139,92,246,0.12)', border:'rgba(139,92,246,0.3)', how:'Purchase', howHref:null, icon:<img src="/Premium_Diamond.png" width="22" height="22" style={{objectFit:'contain'}} /> },
  { id:'bug_hunter', name:'Bug Hunter', desc:'Report a verified bug on fate.rip.', color:'#84cc16', bg:'rgba(132,204,22,0.12)', border:'rgba(132,204,22,0.3)', how:'Report', howHref:'https://discord.gg/faterip', icon:<img src="/bug_hunter.png" width="22" height="22" style={{objectFit:'contain'}} /> },
  { id:'gifter', name:'Gifter', desc:'Gift premium to another fate.rip user.', color:'#fb7185', bg:'rgba(251,113,133,0.12)', border:'rgba(251,113,133,0.3)', how:'Gift', howHref:null, icon:<img src="/Presente.png" width="22" height="22" style={{objectFit:'contain'}} /> },
]

const SIMPLE_ICONS = {
  discord:'discord', twitter:'x', github:'github', gitlab:'gitlab',
  instagram:'instagram', facebook:'facebook', spotify:'spotify', soundcloud:'soundcloud',
  applemusic:'applemusic', youtube:'youtube', twitch:'twitch', tiktok:'tiktok',
  snapchat:'snapchat', linkedin:'linkedin', reddit:'reddit', telegram:'telegram',
  bluesky:'bluesky', vk:'vk', pinterest:'pinterest', dribbble:'dribbble',
  deviantart:'deviantart', steam:'steam', itchio:'itchio', kickstarter:'kickstarter',
  patreon:'patreon', kofi:'kofi', buymeacoffee:'buymeacoffee', paypal:'paypal',
  bitcoin:'bitcoin', ethereum:'ethereum', solana:'solana', roblox:'roblox',
}

function getTextColor(platformId) {
  return LIGHT_PLATFORMS.has(platformId) ? '#1a1a1a' : '#fff'
}

const FONT_QUERY_MAP = {
  'Inter':'Inter:wght@400;700','Syne':'Syne:wght@400;700;800','Space Mono':'Space+Mono:wght@400;700',
  'Roboto':'Roboto:wght@400;700','Poppins':'Poppins:wght@400;600;700','Montserrat':'Montserrat:wght@400;700',
  'Sora':'Sora:wght@400;700','DM Sans':'DM+Sans:wght@400;700','Manrope':'Manrope:wght@400;700',
  'JetBrains Mono':'JetBrains+Mono:wght@400;700','Bebas Neue':'Bebas+Neue',
  'Playfair Display':'Playfair+Display:wght@400;700','Nunito':'Nunito:wght@400;700;900',
}

// ─── Link Icon Tile ────────────────────────────────────────────────────────────
function LinkIconTile({ link, platform, abbr, onDelete, iconSize = 44, showLabel = true }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    const text = link.url || link.title || ''
    if (!text) return
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) })
  }
  return (
    <div onClick={handleCopy} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, cursor:'pointer', position:'relative', width:Math.max(64,iconSize) }} className="link-icon-tile">
      <div className="link-del-btn" onClick={e => { e.stopPropagation(); onDelete() }} title="Remove" style={{ position:'absolute', top:-5, right:2, width:18, height:18, borderRadius:'50%', background:'#e03030', border:'2px solid #050202', color:'#fff', fontSize:11, fontWeight:700, display:'none', alignItems:'center', justifyContent:'center', cursor:'pointer', zIndex:2, lineHeight:1 }}>×</div>
      <div className="link-icon-wrap" style={{ width:iconSize, height:iconSize, borderRadius:Math.round(iconSize*0.27), background:link.iconDataUrl?'transparent':platform.color, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:link.iconDataUrl?'none':`0 4px 16px ${platform.color}55`, transition:'transform .15s, box-shadow .15s', overflow:'hidden', flexShrink:0 }}>
        {link.iconDataUrl ? <img src={link.iconDataUrl} alt="icon" style={{ width:'100%', height:'100%', objectFit:'contain' }} />
          : platform.id === 'email' ? <svg width="55%" height="55%" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
          : SIMPLE_ICONS[platform.id] ? <img src={`https://cdn.simpleicons.org/${SIMPLE_ICONS[platform.id]}/ffffff`} alt={platform.name} style={{ width:'55%', height:'55%', objectFit:'contain' }} />
          : <span style={{ fontSize:14, fontWeight:800, color:getTextColor(platform.id) }}>{abbr}</span>}
      </div>
      {showLabel && <span style={{ fontSize:10, color:'rgba(255,255,255,0.45)', textAlign:'center', lineHeight:1.3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:Math.max(64,iconSize) }}>{link.title || platform.name}</span>}
      {copied && <span style={{ position:'absolute', bottom:-22, left:'50%', transform:'translateX(-50%)', background:'rgba(0,0,0,0.85)', border:'1px solid rgba(224,48,48,0.3)', color:'#fff', fontSize:9, padding:'2px 7px', borderRadius:99, whiteSpace:'nowrap', pointerEvents:'none', zIndex:10, animation:'fadeInUp .2s ease' }}>Copied!</span>}
    </div>
  )
}

// ─── Analytics Sub-Page ────────────────────────────────────────────────────────
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
        const { count } = await supabase.from('profile_views').select('*', { count:'exact', head:true })
          .eq('username', username).gte('viewed_at', d.toISOString()).lt('viewed_at', nextD.toISOString())
        days.push({ label:d.toLocaleDateString('en-US', { month:'short', day:'numeric' }), count:count||0 })
      }
      setWeekData(days); setLastUpdated('less than a minute ago'); setLoadingWeek(false)
    }
    fetchWeek()
  }, [username, timeRange])

  const weekTotal = weekData.reduce((a,b) => a+b.count, 0)
  const avgDaily  = weekData.length > 0 ? (weekTotal/weekData.length).toFixed(1) : '0'
  const maxCount  = Math.max(...weekData.map(d => d.count), 1)
  const chartW = 1000, chartH = 200
  const linePath = (() => { if (weekData.length < 2) return ''; const pts = weekData.map((d,i) => `${(i/(weekData.length-1))*chartW},${chartH-(d.count/maxCount)*(chartH-20)-10}`); return `M ${pts.join(' L ')}` })()
  const areaPath = (() => { if (weekData.length < 2) return ''; const pts = weekData.map((d,i) => `${(i/(weekData.length-1))*chartW},${chartH-(d.count/maxCount)*(chartH-20)-10}`); return `M 0,${chartH} L ${pts.join(' L ')} L ${chartW},${chartH} Z` })()

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
      <style>{`.an-stat { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:14px; padding:20px; transition:border-color .15s, transform .15s; } .an-stat:hover { border-color:rgba(224,48,48,0.3); transform:translateY(-2px); } .an-stat-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:20px; } @media(max-width:900px){ .an-stat-grid { grid-template-columns:1fr 1fr; } }`}</style>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:24, flexWrap:'wrap' }}>
        <div>
          <div style={{ fontSize:11, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', marginBottom:8 }}>Dashboard · Analytics</div>
          <h1 style={{ fontSize:22, fontWeight:700, fontFamily:'Syne, sans-serif', margin:0 }}>View <span style={{ color:'#e03030' }}>Analytics</span></h1>
          <p style={{ marginTop:4, fontSize:13, color:'rgba(255,255,255,0.4)' }}>Track your profile performance</p>
        </div>
        <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:10, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.03)', color:'rgba(255,255,255,0.5)', fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>← Back</button>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20, flexWrap:'wrap' }}>
        <span style={{ fontSize:13, color:'rgba(255,255,255,0.4)' }}>Time Range</span>
        {lastUpdated && <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)', background:'rgba(224,48,48,0.08)', border:'1px solid rgba(224,48,48,0.2)', borderRadius:999, padding:'4px 12px' }}>Updated {lastUpdated}</span>}
        <select value={timeRange} onChange={e => setTimeRange(e.target.value)} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, color:'#fff', fontSize:12, padding:'8px 12px', outline:'none', fontFamily:'inherit', cursor:'pointer' }}>
          <option value="3">Last 3 days</option><option value="7">Last 7 days</option><option value="14">Last 14 days</option><option value="30">Last 30 days</option>
        </select>
      </div>
      <div className="an-stat-grid">
        {[{ label:'Total Views', value:profileViews.toLocaleString(), sub:'All time' },{ label:'Period Views', value:weekTotal.toLocaleString(), sub:`Last ${timeRange} days` },{ label:'Daily Average', value:avgDaily, sub:'Per day' },{ label:'Today', value:viewsToday.toLocaleString(), sub:new Date().toLocaleDateString('en-US',{month:'short',day:'numeric'}) }].map((s,i) => (
          <div key={i} className="an-stat">
            <div style={{ fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.4)', marginBottom:10 }}>{s.label}</div>
            <div style={{ fontSize:32, fontWeight:700, color:'#fff', lineHeight:1, marginBottom:6 }}>{s.value}</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.25)' }}>{s.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:14, padding:24 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:10 }}>
          <div style={{ fontSize:15, fontWeight:600, color:'#fff' }}>Profile Views</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', background:'rgba(224,48,48,0.06)', border:'1px solid rgba(224,48,48,0.15)', borderRadius:999, padding:'4px 12px' }}>Unique visitors only</div>
        </div>
        {loadingWeek ? <div style={{ height:200, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.2)', fontSize:13 }}>Loading…</div>
          : weekTotal === 0 ? <div style={{ height:200, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.2)', fontSize:13 }}>No views yet — share your profile to get started!</div>
          : <div style={{ width:'100%', position:'relative' }}>
            <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width:'100%', height:'auto', display:'block', overflow:'visible' }} preserveAspectRatio="none">
              <defs><linearGradient id="areaGrad2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e03030" stopOpacity="0.2"/><stop offset="100%" stopColor="#e03030" stopOpacity="0.02"/></linearGradient></defs>
              {[0.25,0.5,0.75,1].map((v,i) => <line key={i} x1="0" y1={chartH-v*(chartH-20)-10} x2={chartW} y2={chartH-v*(chartH-20)-10} stroke="rgba(224,48,48,0.06)" strokeWidth="1"/>)}
              {areaPath && <path d={areaPath} fill="url(#areaGrad2)"/>}
              {linePath && <path d={linePath} fill="none" stroke="#e03030" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>}
              {weekData.map((d,i) => { if (!d.count) return null; const x=(i/(weekData.length-1))*chartW; const y=chartH-(d.count/maxCount)*(chartH-20)-10; return <circle key={i} cx={x} cy={y} r="5" fill="#e03030" stroke="#050202" strokeWidth="2"/> })}
            </svg>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:8, padding:'0 2px' }}>{weekData.map((d,i) => <span key={i} style={{ fontSize:10, color:'rgba(255,255,255,0.2)' }}>{d.label}</span>)}</div>
          </div>}
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.2)', marginTop:12 }}>Each data point represents unique visitor count per day.</div>
      </div>
    </div>
  )
}

// ─── Shared UI ─────────────────────────────────────────────────────────────────
function PageHeader({ breadcrumb, title, subtitle }) {
  return (
    <div style={{ marginBottom:28 }}>
      <div style={{ fontSize:11, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', marginBottom:8 }}>{breadcrumb}</div>
      <h1 style={{ fontSize:22, fontWeight:700, margin:0, fontFamily:'Syne, sans-serif' }} dangerouslySetInnerHTML={{ __html:title }} />
      {subtitle && <p style={{ marginTop:4, fontSize:13, color:'rgba(255,255,255,0.4)' }}>{subtitle}</p>}
    </div>
  )
}
function Card({ children, style }) { return <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:14, overflow:'hidden', ...style }}>{children}</div> }
function CardHeader({ icon, title, sub, action }) {
  return (
    <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        {icon && <div style={{ width:40, height:40, borderRadius:12, background:'rgba(224,48,48,0.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{icon}</div>}
        <div><div style={{ fontSize:15, fontWeight:600, color:'#fff' }}>{title}</div>{sub && <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginTop:2 }}>{sub}</div>}</div>
      </div>
      {action}
    </div>
  )
}
function Input({ style, ...props }) { return <input style={{ width:'100%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:'11px 14px', fontSize:13, color:'#fff', fontFamily:'Inter, sans-serif', outline:'none', height:44, boxSizing:'border-box', ...style }} {...props} /> }
function Textarea({ style, ...props }) { return <textarea style={{ width:'100%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:'11px 14px', fontSize:13, color:'#fff', fontFamily:'Inter, sans-serif', outline:'none', resize:'vertical', boxSizing:'border-box', ...style }} {...props} /> }
function BtnAccent({ children, onClick, style, disabled }) { return <button onClick={onClick} disabled={disabled} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:10, fontSize:13, fontWeight:500, cursor:disabled?'not-allowed':'pointer', border:'none', background:disabled?'rgba(224,48,48,0.4)':'#e03030', color:'#fff', fontFamily:'inherit', transition:'all .15s', opacity:disabled?0.6:1, ...style }}>{children}</button> }
function BtnGhost({ children, onClick, style }) { return <button onClick={onClick} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:10, fontSize:13, fontWeight:500, cursor:'pointer', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.03)', color:'rgba(255,255,255,0.5)', fontFamily:'inherit', transition:'all .15s', ...style }}>{children}</button> }
function SaveBar({ onSave, onDiscard, saving }) {
  return (
    <div style={{ position:'sticky', bottom:0, background:'rgba(5,2,2,0.92)', backdropFilter:'blur(16px)', borderTop:'1px solid rgba(255,255,255,0.05)', padding:'14px 0', display:'flex', alignItems:'center', justifyContent:'flex-end', gap:10, marginTop:8 }}>
      {onDiscard && <BtnGhost onClick={onDiscard}>Discard</BtnGhost>}
      <BtnAccent onClick={onSave} disabled={saving}>{saving?'Saving…':'Save Changes'}</BtnAccent>
    </div>
  )
}
function Toggle({ checked, onChange }) {
  return (
    <label style={{ position:'relative', width:34, height:20, flexShrink:0, cursor:'pointer', display:'inline-block' }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ opacity:0, width:0, height:0, position:'absolute' }} />
      <div style={{ position:'absolute', inset:0, borderRadius:20, background:checked?'#e03030':'rgba(255,255,255,0.1)', transition:'background .2s' }} />
      <div style={{ position:'absolute', top:3, left:checked?17:3, width:14, height:14, borderRadius:'50%', background:'#fff', transition:'left .2s' }} />
    </label>
  )
}
function ToggleRow({ label, sub, checked, onChange }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, padding:'14px 16px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:10 }}>
      <div><p style={{ fontSize:13, color:'rgba(255,255,255,0.75)', fontWeight:500, margin:0 }}>{label}</p>{sub && <small style={{ fontSize:11, color:'rgba(255,255,255,0.28)', display:'block', marginTop:1 }}>{sub}</small>}</div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}
function TabBar({ tabs, active, onSelect, cols }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:`repeat(${cols||tabs.length},1fr)`, border:'1px solid rgba(255,255,255,0.05)', background:'rgba(255,255,255,0.02)', borderRadius:12, padding:4, gap:2 }}>
      {tabs.map(t => (
        <button key={t} onClick={() => onSelect(t)} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'8px 12px', borderRadius:9, border:active===t?'1px solid rgba(255,255,255,0.06)':'1px solid transparent', background:active===t?'rgba(255,255,255,0.07)':'transparent', color:active===t?'#fff':'rgba(255,255,255,0.35)', fontSize:12, fontWeight:500, cursor:'pointer', transition:'all .15s', fontFamily:'inherit', whiteSpace:'nowrap' }}>{t}</button>
      ))}
    </div>
  )
}
function PreviewPanel({ bgColor, bgPreview, opacity, blur, accentColor, avatarPos, selectedFont, showAvatar, avatarPreview, initial, displayName, username, appBio, links, iconSize, panelSize }) {
  const panelMaxW = { compact:160, medium:200, wide:240, full:280 }[panelSize]||200
  return (
    <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:14, overflow:'hidden', position:'sticky', top:70 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <span style={{ fontSize:13, fontWeight:500, color:'#fff', display:'flex', alignItems:'center', gap:8 }}><svg width="15" height="15" fill="none" stroke="#e03030" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>Live Preview</span>
        <span style={{ width:7, height:7, borderRadius:'50%', background:'#e03030', display:'inline-block' }} />
      </div>
      <div style={{ height:480, display:'flex', alignItems:'center', justifyContent:'center', background:bgColor||'#0a0202', position:'relative', overflow:'hidden' }}>
        {bgPreview && <img src={bgPreview} alt="bg" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:opacity/100, filter:blur>0?`blur(${Math.round(blur/8)}px)`:'none' }} />}
        <div style={{ position:'relative', zIndex:1, width:panelMaxW, background:'rgba(255,255,255,0.03)', border:`1px solid ${accentColor}33`, borderRadius:16, padding:20, textAlign:avatarPos==='left'?'left':avatarPos==='right'?'right':'center', display:'flex', flexDirection:'column', alignItems:avatarPos==='left'?'flex-start':avatarPos==='right'?'flex-end':'center', gap:10, opacity:opacity/100, fontFamily:selectedFont }}>
          {showAvatar && (
            <div style={{ width:56, height:56, borderRadius:'50%', background:`${accentColor}22`, border:`2px solid ${accentColor}44`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne, sans-serif', fontSize:20, fontWeight:800, color:accentColor, overflow:'hidden' }}>
              {avatarPreview ? <img src={avatarPreview} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} /> : initial}
            </div>
          )}
          <div style={{ fontSize:14, fontWeight:700, color:accentColor }}>{displayName||username}</div>
          {appBio && <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)' }}>{appBio.slice(0,60)}{appBio.length>60?'…':''}</div>}
          {links.length > 0 && (
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', justifyContent:avatarPos==='center'?'center':'flex-start' }}>
              {links.slice(0,4).map((l,i) => {
                const p = l.platform||{ id:'custom', color:'#e03030' }
                const previewSize = Math.round((iconSize/44)*28)
                return (
                  <div key={i} style={{ width:previewSize, height:previewSize, borderRadius:Math.round(previewSize*0.27), background:l.iconDataUrl?'transparent':p.color, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:l.iconDataUrl?'none':`0 2px 8px ${p.color}55`, overflow:'hidden' }}>
                    {l.iconDataUrl ? <img src={l.iconDataUrl} alt="icon" style={{ width:'100%', height:'100%', objectFit:'contain' }} />
                      : SIMPLE_ICONS[p.id] ? <img src={`https://cdn.simpleicons.org/${SIMPLE_ICONS[p.id]}/ffffff`} alt={p.name} style={{ width:'60%', height:'60%', objectFit:'contain' }} />
                      : <span style={{ fontSize:8, fontWeight:800, color:getTextColor(p.id) }}>{PLATFORM_ABBR[p.id]||'?'}</span>}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Add Link Modal ────────────────────────────────────────────────────────────
function AddLinkModal({ platform, onClose, onAdd }) {
  const [tab, setTab] = useState('link')
  const [value, setValue] = useState('')
  const [textValue, setTextValue] = useState('')
  const [iconDataUrl, setIconDataUrl] = useState(null)
  const [iconName, setIconName] = useState('')
  const fileRef = useRef()
  if (!platform) return null
  const handleIconUpload = (e) => {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader(); reader.onload = (ev) => { setIconDataUrl(ev.target.result); setIconName(file.name) }; reader.readAsDataURL(file)
  }
  const handleConfirm = () => {
    if (tab === 'link') {
      if (!value.trim()) return
      const url = platform.prefix==='mailto:'?`mailto:${value.trim()}`:platform.prefix?`https://${platform.prefix}${value.trim()}`:value.trim().startsWith('http')?value.trim():`https://${value.trim()}`
      onAdd({ platform, title:platform.name, url, type:'link', iconDataUrl })
    } else { if (!textValue.trim()) return; onAdd({ platform, title:textValue.trim(), url:'', type:'text', iconDataUrl }) }
    onClose()
  }
  const abbr = PLATFORM_ABBR[platform.id]||platform.name[0]
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#0f0505', border:'1px solid rgba(255,255,255,0.1)', borderRadius:16, padding:26, width:400, maxWidth:'95vw', position:'relative' }}>
        <button onClick={onClose} style={{ position:'absolute', top:14, right:14, background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', padding:4, lineHeight:1 }}><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:4 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:platform.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:`0 4px 12px ${platform.color}55`, overflow:'hidden' }}>
            {iconDataUrl ? <img src={iconDataUrl} alt="icon" style={{ width:24, height:24, objectFit:'contain', borderRadius:5 }} />
              : platform.id==='email' ? <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
              : SIMPLE_ICONS[platform.id] ? <img src={`https://cdn.simpleicons.org/${SIMPLE_ICONS[platform.id]}/ffffff`} alt={platform.name} style={{ width:'65%', height:'65%', objectFit:'contain' }} />
              : <span style={{ fontSize:12, fontWeight:800, color:getTextColor(platform.id) }}>{abbr}</span>}
          </div>
          <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:17, fontWeight:700, margin:0 }}>Add <span style={{ color:'#e03030' }}>{platform.name}</span></h2>
        </div>
        <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:20, paddingLeft:48 }}>{platform.id==='custom'?'Add a custom link to your profile':`Add your ${platform.name} to your profile`}</p>
        <div style={{ display:'flex', gap:6, marginBottom:18, background:'rgba(255,255,255,0.03)', borderRadius:10, padding:4, border:'1px solid rgba(255,255,255,0.06)' }}>
          {['link','text'].map(t => <button key={t} onClick={() => setTab(t)} style={{ flex:1, padding:7, borderRadius:7, border:tab===t?'1px solid rgba(255,255,255,0.08)':'1px solid transparent', background:tab===t?'rgba(255,255,255,0.07)':'transparent', color:tab===t?'#fff':'rgba(255,255,255,0.4)', fontSize:12, fontWeight:500, cursor:'pointer', transition:'all .15s', fontFamily:'inherit', textTransform:'capitalize' }}>{t}</button>)}
        </div>
        {platform.id==='custom' && (
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:10, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', display:'block', marginBottom:6 }}>Custom Icon (optional)</label>
            <input type="file" ref={fileRef} accept="image/*" style={{ display:'none' }} onChange={handleIconUpload} />
            <div onClick={() => fileRef.current.click()} style={{ display:'flex', alignItems:'center', gap:10, padding:12, background:'rgba(255,255,255,0.02)', border:'1px dashed rgba(255,255,255,0.1)', borderRadius:10, cursor:'pointer', fontSize:12, color:'rgba(255,255,255,0.4)' }}>
              {iconDataUrl ? <img src={iconDataUrl} alt="icon" style={{ width:28, height:28, objectFit:'contain', borderRadius:7 }} /> : <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>}
              <span>{iconDataUrl?iconName:'Upload icon image (PNG, SVG, etc.)'}</span>
            </div>
          </div>
        )}
        {tab==='link' && (
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:10, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', display:'block', marginBottom:6 }}>{platform.id==='email'?'Email Address':platform.prefix?'Username':'URL'}</label>
            <div style={{ display:'flex', alignItems:'center', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, overflow:'hidden' }}>
              {platform.prefix && platform.prefix!=='mailto:' && <span style={{ padding:'0 8px 0 12px', fontSize:11, color:'rgba(255,255,255,0.3)', fontFamily:'Space Mono, monospace', whiteSpace:'nowrap', flexShrink:0 }}>{platform.prefix}</span>}
              <input autoFocus value={value} onChange={e => setValue(e.target.value)} onKeyDown={e => e.key==='Enter'&&handleConfirm()} placeholder={platform.placeholder||'username'} style={{ flex:1, background:'transparent', border:'none', padding:(platform.prefix&&platform.prefix!=='mailto:')?'11px 12px 11px 0':'11px 12px', fontSize:13, color:'#fff', fontFamily:'Inter, sans-serif', outline:'none', height:44, boxSizing:'border-box' }} />
            </div>
          </div>
        )}
        {tab==='text' && (
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:10, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', display:'block', marginBottom:6 }}>Display Text</label>
            <input autoFocus value={textValue} onChange={e => setTextValue(e.target.value)} onKeyDown={e => e.key==='Enter'&&handleConfirm()} placeholder="What should visitors see?" style={{ width:'100%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:'11px 12px', fontSize:13, color:'#fff', fontFamily:'Inter, sans-serif', outline:'none', height:44, boxSizing:'border-box' }} />
          </div>
        )}
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:8 }}>
          <BtnGhost onClick={onClose}>Cancel</BtnGhost>
          <BtnAccent onClick={handleConfirm}>+ Add Link</BtnAccent>
        </div>
      </div>
    </div>
  )
}

// ─── Create Template Modal ─────────────────────────────────────────────────────
function CreateTemplateModal({ onClose, onSave, currentSettings, username, avatarUrl, bgUrl, bio, location, opacity, blur, usernameFx, bgFx, glowState, displayName }) {
  const [name, setName]           = useState('')
  const [desc, setDesc]           = useState('')
  const [tags, setTags]           = useState('')
  const [isPublic, setIsPublic]   = useState(true)
  const [saving, setSaving]       = useState(false)
  const [bgFile, setBgFile]       = useState(null)
  const [bgPreview, setBgPreview] = useState(currentSettings?.bgUrl || null)
  const fileRef = useRef()

  const handleBgUpload = (e) => {
    const file = e.target.files[0]; if (!file) return
    setBgFile(file)
    const reader = new FileReader(); reader.onload = ev => setBgPreview(ev.target.result); reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    let bgImageUrl = null
    if (bgFile) {
      const ext  = bgFile.name.split('.').pop()
      const path = `templates/${username}-${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('images').upload(path, bgFile, { upsert:true })
      if (!upErr) {
        const { data:urlData } = supabase.storage.from('images').getPublicUrl(path)
        bgImageUrl = urlData.publicUrl
      }
    }
    const tagArr = tags.split(',').map(t => t.trim()).filter(Boolean)
    const { error } = await supabase.from('community_templates').insert({
      name:         name.trim(),
      description:  desc.trim(),
      tags:         tagArr,
      is_public:    isPublic,
      creator_username: username,
      creator_avatar:   avatarUrl || null,
      bg_image_url: bgImageUrl,
      settings:     currentSettings,
      profile_bg_url: bgUrl || null,
profile_bio: bio || null,
profile_location: location || null,
profile_opacity: opacity ?? 100,
profile_blur: blur ?? 0,
profile_username_fx: usernameFx || '',
profile_bg_fx: bgFx || 'none',
profile_glow_settings: glowState || null,
profile_display_name: displayName || null,
      uses:         0,
      likes:        0,
      created_at:   new Date().toISOString(),
    })
    setSaving(false)
    if (error) {
      console.error('Template insert error:', error)
      alert(`Failed to publish: ${error.message}`)
      return
    }
    onSave()
    onClose()
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 16px' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#0d0505', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, padding:28, width:'100%', maxWidth:480, position:'relative', maxHeight:'90vh', overflowY:'auto' }}>
        <button onClick={onClose} style={{ position:'absolute', top:16, right:16, background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', padding:4 }}><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
        <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:20, fontWeight:700, margin:'0 0 4px' }}>Create <span style={{ color:'#e03030' }}>Template</span></h2>
        <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:24 }}>Share your profile style with the community</p>

        <div style={{ marginBottom:18 }}>
          <label style={{ fontSize:11, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', display:'block', marginBottom:8 }}>Template Preview Image</label>
          <input type="file" ref={fileRef} accept="image/*" style={{ display:'none' }} onChange={handleBgUpload} />
          <div onClick={() => fileRef.current.click()} style={{ position:'relative', width:'100%', height:160, borderRadius:14, overflow:'hidden', border:'1px dashed rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.02)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            {bgPreview ? <img src={bgPreview} alt="preview" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : (
              <div style={{ textAlign:'center', color:'rgba(255,255,255,0.3)' }}>
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ marginBottom:8, display:'block', margin:'0 auto 8px' }}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="m3 16 5-5 4 4 3-3 4 4"/><circle cx="8.5" cy="8.5" r="1.5"/></svg>
                <span style={{ fontSize:12 }}>Upload preview image</span>
              </div>
            )}
          </div>
        </div>

        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:11, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', display:'block', marginBottom:6 }}>Template Name *</label>
          <Input placeholder="e.g. Dark Crimson, Neon Hacker…" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:11, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', display:'block', marginBottom:6 }}>Description</label>
          <Textarea placeholder="Describe the vibe of your template…" value={desc} onChange={e => setDesc(e.target.value)} rows={3} style={{ minHeight:80 }} />
        </div>
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:11, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', display:'block', marginBottom:6 }}>Tags (comma separated)</label>
          <Input placeholder="e.g. dark, neon, minimal, anime" value={tags} onChange={e => setTags(e.target.value)} />
        </div>
        <div style={{ marginBottom:24 }}>
          <ToggleRow label="Make Public" sub="Allow others to discover and use this template" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
        </div>
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <BtnGhost onClick={onClose}>Cancel</BtnGhost>
          <BtnAccent onClick={handleSave} disabled={saving||!name.trim()}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            {saving ? 'Publishing…' : 'Publish Template'}
          </BtnAccent>
        </div>
      </div>
    </div>
  )
}

// ─── Template Preview Modal ────────────────────────────────────────────────────
function TemplatePreviewModal({ tpl, onClose, onUse, currentUsername }) {
  if (!tpl) return null
  const s = tpl.settings || {}
  const bgColor = s.bgColor || '#080808'
  const accent  = s.accentColor || '#e03030'
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.88)', zIndex:1000, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px 16px', backdropFilter:'blur(8px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width:'100%', maxWidth:640, borderRadius:20, border:'1px solid rgba(255,255,255,0.08)', overflow:'hidden', boxShadow:'0 24px 80px rgba(0,0,0,0.8)', display:'flex', flexDirection:'column', maxHeight:'90vh' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', background:'#0d0505', borderBottom:'1px solid rgba(255,255,255,0.06)', flexShrink:0 }}>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:'#fff' }}>{tpl.name} <span style={{ fontSize:12, color:'rgba(255,255,255,0.3)', fontWeight:500 }}>· Preview</span></div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:2 }}>by <span style={{ color:'rgba(255,255,255,0.6)' }}>@{tpl.creator_username}</span></div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', padding:6, borderRadius:8, display:'flex' }}><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
        </div>
        <div style={{ flex:1, overflowY:'auto', minHeight:300, position:'relative', background:bgColor, display:'flex', alignItems:'center', justifyContent:'center' }}>
          {tpl.bg_image_url
            ? <img src={tpl.bg_image_url} alt="bg" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:0.8 }} />
            : null}
          <div style={{ position:'relative', zIndex:2, textAlign:'center', padding:48 }}>
            <div style={{ width:64, height:64, borderRadius:'50%', background:`${accent}22`, border:`2px solid ${accent}66`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:900, color:accent, margin:'0 auto 12px' }}>✦</div>
            <div style={{ fontSize:18, fontWeight:700, color:'#fff', marginBottom:6 }}>{tpl.name}</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)', maxWidth:300, margin:'0 auto', lineHeight:1.6 }}>{tpl.description || 'A community template'}</div>
            {Array.isArray(tpl.tags) && tpl.tags.length > 0 && (
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', justifyContent:'center', marginTop:14 }}>
                {tpl.tags.map(tag => <span key={tag} style={{ fontSize:10, fontWeight:600, padding:'3px 10px', borderRadius:99, background:`${accent}18`, border:`1px solid ${accent}40`, color:accent }}>#{tag}</span>)}
              </div>
            )}
            <div style={{ marginTop:20, fontSize:12, color:'rgba(255,255,255,0.3)' }}>Accent: <span style={{ color:accent, fontWeight:700 }}>{accent}</span> · Font: <span style={{ color:'rgba(255,255,255,0.6)', fontWeight:600 }}>{s.font||'Default'}</span></div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', background:'#0d0505', borderTop:'1px solid rgba(255,255,255,0.06)', flexShrink:0, flexWrap:'wrap', gap:10 }}>
          <div style={{ display:'flex', gap:16, fontSize:12, color:'rgba(255,255,255,0.3)' }}>
            <span>❤ {tpl.likes||0} likes</span>
            <span>↓ {tpl.uses||0} uses</span>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <BtnGhost onClick={onClose}>Cancel</BtnGhost>
            <BtnAccent onClick={() => { onUse(tpl); onClose() }} style={{ background:accent }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Use Template
            </BtnAccent>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Community Template Card ───────────────────────────────────────────────────
function TemplateCard({ tpl, onPreview, onUse, onFavorite, isFavorited, isOwn }) {
  const [hovered, setHovered] = useState(false)
  const accent = tpl.settings?.accentColor || '#e03030'

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background:'#0d0505', border:`1px solid ${hovered?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.06)'}`, borderRadius:16, overflow:'hidden', transition:'border-color .15s, transform .2s', transform:hovered?'translateY(-2px)':'translateY(0)', display:'flex', flexDirection:'column' }}
    >
      <div style={{ position:'relative', width:'100%', paddingTop:'56%', background:tpl.settings?.bgColor||'#080808', overflow:'hidden' }}>
        {tpl.bg_image_url
          ? <img src={tpl.bg_image_url} alt={tpl.name} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
          : <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, color:accent, opacity:0.3 }}>✦</div>}
        <button
          onClick={e => { e.stopPropagation(); onFavorite(tpl) }}
          style={{ position:'absolute', top:10, right:10, width:32, height:32, borderRadius:'50%', border:'none', background:'rgba(0,0,0,0.55)', backdropFilter:'blur(4px)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:isFavorited?'#f59e0b':'rgba(255,255,255,0.5)', transition:'all .15s', fontSize:14 }}
        >
          <svg width="16" height="16" fill={isFavorited?'currentColor':'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </button>
        <div style={{ position:'absolute', top:10, left:10, padding:'3px 8px', borderRadius:6, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)', border:'1px solid rgba(255,255,255,0.1)', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.6)', letterSpacing:'0.05em' }}>
          {tpl.is_public?'PUBLIC':'PRIVATE'}
        </div>
        {isOwn && (
          <div style={{ position:'absolute', bottom:10, left:10, padding:'3px 8px', borderRadius:6, background:`rgba(${parseInt(accent.slice(1,3),16)},${parseInt(accent.slice(3,5),16)},${parseInt(accent.slice(5,7),16)},0.8)`, fontSize:10, fontWeight:700, color:'#fff', letterSpacing:'0.05em' }}>MY TEMPLATE</div>
        )}
      </div>

      <div style={{ padding:'14px 16px', flex:1, display:'flex', flexDirection:'column', gap:10 }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
          <div style={{ fontSize:14, fontWeight:700, color:'#fff', lineHeight:1.3 }}>{tpl.name}</div>
          <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:99, background:tpl.is_public?'rgba(34,197,94,0.1)':'rgba(255,255,255,0.05)', border:`1px solid ${tpl.is_public?'rgba(34,197,94,0.25)':'rgba(255,255,255,0.1)'}`, color:tpl.is_public?'#22c55e':'rgba(255,255,255,0.3)', whiteSpace:'nowrap', flexShrink:0 }}>
            {tpl.is_public?'PUBLIC':'PRIVATE'}
          </span>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'rgba(255,255,255,0.4)' }}>
          <div style={{ width:20, height:20, borderRadius:'50%', background:'rgba(255,255,255,0.08)', overflow:'hidden', flexShrink:0 }}>
            {tpl.creator_avatar ? <img src={tpl.creator_avatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.4)' }}>{tpl.creator_username?.[0]?.toUpperCase()||'?'}</span>}
          </div>
          <span>by <span style={{ color:'rgba(255,255,255,0.65)', fontWeight:600 }}>{tpl.creator_username}</span></span>
          <span style={{ color:'rgba(255,255,255,0.2)' }}>·</span>
          <span>{tpl.uses||0} uses</span>
        </div>

        {Array.isArray(tpl.tags) && tpl.tags.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
            {tpl.tags.slice(0,4).map(tag => <span key={tag} style={{ fontSize:10, padding:'2px 7px', borderRadius:99, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.4)' }}>#{tag}</span>)}
          </div>
        )}

        {tpl.description && (
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', lineHeight:1.5, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{tpl.description}</div>
        )}

        <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:'auto' }}>
          <span style={{ display:'flex', alignItems:'center', gap:4 }}>
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            {tpl.likes||0}
          </span>
        </div>

        <div style={{ display:'flex', gap:8, marginTop:4 }}>
          <button
            onClick={() => onUse(tpl)}
            style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'9px 14px', borderRadius:10, border:'none', background:accent, color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity='0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity='1'}
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Use Template
          </button>
          <button
            onClick={() => onPreview(tpl)}
            title="Preview"
            style={{ width:36, height:36, borderRadius:10, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.03)', color:'rgba(255,255,255,0.4)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.07)'; e.currentTarget.style.color='#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.color='rgba(255,255,255,0.4)' }}
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button
            title="Report"
            style={{ width:36, height:36, borderRadius:10, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.03)', color:'rgba(255,255,255,0.25)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(255,50,50,0.08)'; e.currentTarget.style.color='rgba(255,100,100,0.6)' }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.color='rgba(255,255,255,0.25)' }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const router = useRouter()
  const [user, setUser]         = useState(null)
  const [username, setUsername] = useState('')
  const [uid, setUid]           = useState('')
  const [bio, setBio]           = useState('')
  const [links, setLinks]       = useState([])
  const [buttons, setButtons]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [toast, setToast]       = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [activePage, setActivePage]     = useState('overview')
  const [displayName, setDisplayName]   = useState('')
  const [dbUser, setDbUser]             = useState(null)
  const [newPassword, setNewPassword]   = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [profileViews, setProfileViews] = useState(0)
  const [viewsToday, setViewsToday]     = useState(0)
  const [appBio, setAppBio]             = useState('')
  const [discordPresence, setDiscordPresence] = useState('Enabled')
  const [usernameFx, setUsernameFx]     = useState('')
  const [opacity, setOpacity]           = useState(100)
  const [bgFx, setBgFx]                 = useState('none')
  const [blur, setBlur]                 = useState(0)
  const [location, setLocation]         = useState('')
  const [glowState, setGlowState]       = useState({ username:true, socials:true, badges:false })
  const [bgPreview, setBgPreview]       = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [cursorPreview, setCursorPreview] = useState(null)
  const [audioName, setAudioName]       = useState(null)
  const [uploadingType, setUploadingType] = useState(null)
  const [appearTab, setAppearTab]       = useState('Presets')
  const [selectedPreset, setSelectedPreset] = useState('Crimson')
  const [bgType, setBgType]             = useState('Solid')
  const [selectedFont, setSelectedFont] = useState('Inter')
  const [glowIntensity, setGlowIntensity] = useState(50)
  const [accentColor, setAccentColor]   = useState('#e03030')
  const [bgColor, setBgColor]           = useState('#050202')
  const [effectsTab, setEffectsTab]     = useState('Particles')
  const [particleEnabled, setParticleEnabled] = useState(false)
  const [particleStyle, setParticleStyle]     = useState('Dots')
  const [cursorStyle, setCursorStyle]   = useState('Default')
  const [entranceAnim, setEntranceAnim] = useState('Fade In')
  const [clickEffect, setClickEffect]   = useState('None')
  const [musicEnabled, setMusicEnabled] = useState(false)
  const [musicType, setMusicType]       = useState('direct')
  const [musicUrl, setMusicUrl]         = useState('')
  const [musicTitle, setMusicTitle]     = useState('')
  const [musicArtist, setMusicArtist]   = useState('')
  const [musicAutoplay, setMusicAutoplay] = useState(false)
  const [musicVolume, setMusicVolume]   = useState(50)
  const [musicShowTitle, setMusicShowTitle]   = useState(true)
  const [musicShowPlayer, setMusicShowPlayer] = useState(true)
  const [musicShowArtist, setMusicShowArtist] = useState(true)
  const [profileTab, setProfileTab]     = useState('Identity')
  const [panelSize, setPanelSize]       = useState('medium')
  const [showAvatar, setShowAvatar]     = useState(true)
  const [avatarPos, setAvatarPos]       = useState('center')
  const [followCursor, setFollowCursor] = useState(false)
  const [panelOpacity, setPanelOpacity] = useState(100)
  const [panelBlur, setPanelBlur]       = useState(24)
  const [typingBio, setTypingBio]       = useState(false)
  const [enterEnabled, setEnterEnabled] = useState(true)
  const [enterTitle, setEnterTitle]     = useState('')
  const [enterSubtitle, setEnterSubtitle] = useState('Click anywhere to enter')
  const [enterShowAvatar, setEnterShowAvatar]   = useState(true)
  const [enterShowTitle, setEnterShowTitle]     = useState(true)
  const [enterShowSubtitle, setEnterShowSubtitle] = useState(true)
  const [activeLinkPlatform, setActiveLinkPlatform] = useState(null)
  const [iconSize, setIconSize]         = useState(44)
  const [showLinkLabels, setShowLinkLabels] = useState(true)
  const [showAddBtnModal, setShowAddBtnModal] = useState(false)
  const [newBtnLabel, setNewBtnLabel]   = useState('')
  const [newBtnUrl, setNewBtnUrl]       = useState('')
  const [sidebarOpen, setSidebarOpen]   = useState(false)
  const [notifOpen, setNotifOpen]       = useState(false)
  const [avatarDDOpen, setAvatarDDOpen] = useState(false)
  const [userBadges, setUserBadges]     = useState([])
  const [badgePosition, setBadgePosition] = useState('below_bio')
  const [savingBadges, setSavingBadges] = useState(false)

  // ── Community Templates state ──
  const [communityTemplates, setCommunityTemplates] = useState([])
  const [myTemplates, setMyTemplates]               = useState([])
  const [favTemplates, setFavTemplates]             = useState([])
  const [favoriteIds, setFavoriteIds]               = useState(new Set())
  const [tplTab, setTplTab]                         = useState('Template Library')
  const [tplSearch, setTplSearch]                   = useState('')
  const [loadingTpls, setLoadingTpls]               = useState(false)
  const [showCreateTpl, setShowCreateTpl]           = useState(false)
  const [previewTpl, setPreviewTpl]                 = useState(null)

  const fileBgRef     = useRef()
  const fileAvatarRef = useRef()
  const fileCursorRef = useRef()
  const fileAudioRef  = useRef()

  const showToast = (msg) => { setToast(msg); setToastVisible(true); setTimeout(() => setToastVisible(false), 2500) }

  const buildSettings = () => ({
    font:selectedFont, accentColor, bgColor, bgType, glowIntensity, particleEnabled, particleStyle,
    cursorStyle, entranceAnim, clickEffect,
    music:{ enabled:musicEnabled, type:musicType, url:musicUrl, title:musicTitle, artist:musicArtist, autoplay:musicAutoplay, volume:musicVolume, showTitle:musicShowTitle, showArtist:musicShowArtist, showPlayer:musicShowPlayer },
    layout:{ panelSize, showAvatar, avatarPos, typingBio, followCursor, panelOpacity, panelBlur },
    entrance:{ enabled:enterEnabled, title:enterTitle, subtitle:enterSubtitle, showAvatar:enterShowAvatar, showTitle:enterShowTitle, showSubtitle:enterShowSubtitle },
    iconSize, showLinkLabels, buttons,
  })

  const applySettings = (s) => {
    if (!s) return
    if (s.font)                   setSelectedFont(s.font)
    if (s.accentColor)            setAccentColor(s.accentColor)
    if (s.bgColor)                setBgColor(s.bgColor)
    if (s.bgType)                 setBgType(s.bgType)
    if (s.glowIntensity !== undefined) setGlowIntensity(s.glowIntensity)
    if (s.particleEnabled !== undefined) setParticleEnabled(s.particleEnabled)
    if (s.particleStyle)          setParticleStyle(s.particleStyle)
    if (s.cursorStyle)            setCursorStyle(s.cursorStyle)
    if (s.entranceAnim)           setEntranceAnim(s.entranceAnim)
    if (s.clickEffect)            setClickEffect(s.clickEffect)
    if (s.bgFx)                   setBgFx(s.bgFx)
    if (s.usernameFx !== undefined) setUsernameFx(s.usernameFx)
    if (s.music) { const m=s.music; if(m.enabled!==undefined)setMusicEnabled(m.enabled); if(m.type)setMusicType(m.type); if(m.url)setMusicUrl(m.url); if(m.title)setMusicTitle(m.title); if(m.artist)setMusicArtist(m.artist); if(m.autoplay!==undefined)setMusicAutoplay(m.autoplay); if(m.volume!==undefined)setMusicVolume(m.volume); if(m.showTitle!==undefined)setMusicShowTitle(m.showTitle); if(m.showArtist!==undefined)setMusicShowArtist(m.showArtist); if(m.showPlayer!==undefined)setMusicShowPlayer(m.showPlayer) }
    if (s.layout) { const l=s.layout; if(l.panelSize)setPanelSize(l.panelSize); if(l.showAvatar!==undefined)setShowAvatar(l.showAvatar); if(l.avatarPos)setAvatarPos(l.avatarPos); if(l.typingBio!==undefined)setTypingBio(l.typingBio); if(l.followCursor!==undefined)setFollowCursor(l.followCursor); if(l.panelOpacity!==undefined)setPanelOpacity(l.panelOpacity); if(l.panelBlur!==undefined)setPanelBlur(l.panelBlur) }
    if (s.entrance) { const e=s.entrance; if(e.enabled!==undefined)setEnterEnabled(e.enabled); if(e.title)setEnterTitle(e.title); if(e.subtitle)setEnterSubtitle(e.subtitle); if(e.showAvatar!==undefined)setEnterShowAvatar(e.showAvatar); if(e.showTitle!==undefined)setEnterShowTitle(e.showTitle); if(e.showSubtitle!==undefined)setEnterShowSubtitle(e.showSubtitle) }
    if (s.iconSize)               setIconSize(s.iconSize)
    if (s.showLinkLabels !== undefined) setShowLinkLabels(s.showLinkLabels)
    if (Array.isArray(s.buttons)) setButtons(s.buttons)
  }

  // ── Fetch community templates ──
  const fetchTemplates = async () => {
    setLoadingTpls(true)
    const { data:all } = await supabase.from('community_templates').select('*').eq('is_public', true).order('created_at', { ascending:false })
    setCommunityTemplates(all||[])
    if (username) {
      const { data:mine } = await supabase.from('community_templates').select('*').eq('creator_username', username).order('created_at', { ascending:false })
      setMyTemplates(mine||[])
      const { data:favs } = await supabase.from('template_favorites').select('template_id').eq('username', username)
      const ids = new Set((favs||[]).map(f => f.template_id))
      setFavoriteIds(ids)
      if (ids.size > 0) {
        const { data:favTpls } = await supabase.from('community_templates').select('*').in('id', [...ids])
        setFavTemplates(favTpls||[])
      }
    }
    setLoadingTpls(false)
  }

  const handleFavorite = async (tpl) => {
    if (!username) return
    const isFav = favoriteIds.has(tpl.id)
    if (isFav) {
      await supabase.from('template_favorites').delete().eq('username', username).eq('template_id', tpl.id)
      setFavoriteIds(prev => { const n = new Set(prev); n.delete(tpl.id); return n })
      setFavTemplates(prev => prev.filter(t => t.id !== tpl.id))
    } else {
      await supabase.from('template_favorites').insert({ username, template_id:tpl.id })
      setFavoriteIds(prev => new Set([...prev, tpl.id]))
      setFavTemplates(prev => [tpl, ...prev])
      await supabase.from('community_templates').update({ likes:(tpl.likes||0)+1 }).eq('id', tpl.id)
      setCommunityTemplates(prev => prev.map(t => t.id===tpl.id?{...t,likes:(t.likes||0)+1}:t))
    }
  }

  // ── FIX: save template settings directly instead of merging with stale state ──
  const handleUseTemplate = async (tpl) => {
    const templateSettings = tpl.settings || {}
    applySettings(templateSettings)
    if (tpl.profile_bg_url !== undefined)       setBgPreview(tpl.profile_bg_url)
    if (tpl.profile_bio)                        setAppBio(tpl.profile_bio)
    if (tpl.profile_location)                   setLocation(tpl.profile_location)
    if (tpl.profile_opacity !== undefined)      setOpacity(tpl.profile_opacity)
    if (tpl.profile_blur !== undefined)         setBlur(tpl.profile_blur)
    if (tpl.profile_username_fx !== undefined)  setUsernameFx(tpl.profile_username_fx)
    if (tpl.profile_bg_fx)                      setBgFx(tpl.profile_bg_fx)
    if (tpl.profile_glow_settings)              setGlowState(tpl.profile_glow_settings)
    if (tpl.profile_display_name !== undefined) setDisplayName(tpl.profile_display_name)
    const { error } = await supabase.from('users').update({
      settings:      templateSettings,
      audio_url:     templateSettings?.music?.url || null,
      bg_url:        tpl.profile_bg_url || null,
      bio:           tpl.profile_bio || null,
      location:      tpl.profile_location || null,
      opacity:       tpl.profile_opacity ?? 100,
      blur:          tpl.profile_blur ?? 0,
      username_fx:   tpl.profile_username_fx || '',
      bg_fx:         tpl.profile_bg_fx || 'none',
      glow_settings: tpl.profile_glow_settings || null,
      display_name:  tpl.profile_display_name || null,
    }).eq('username', username)
    if (error) { showToast('Failed to apply template'); return }
    await supabase.from('community_templates').update({ uses:(tpl.uses||0)+1 }).eq('id', tpl.id)
    showToast(`"${tpl.name}" applied & saved!`)
  }

  useEffect(() => {
    const init = async () => {
      const { data:{ session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      const { data } = await supabase.from('users').select('*').eq('email', session.user.email).single()
      if (data) {
        setUsername(data.username||''); setBio(data.bio||''); setLinks(data.links||[]); setAppBio(data.bio||'')
        setOpacity(data.opacity??100); setBlur(data.blur??0); setUsernameFx(data.username_fx||''); setBgFx(data.bg_fx||'none')
        setLocation(data.location||''); setGlowState(data.glow_settings||{ username:true, socials:true, badges:false })
        setDiscordPresence(data.discord_presence||'Enabled')
        if (data.avatar_url) setAvatarPreview(data.avatar_url)
        setDisplayName(data.display_name||''); setDbUser(data)
        if (data.bg_url) setBgPreview(data.bg_url)
        if (data.cursor_url) setCursorPreview(data.cursor_url)
        if (data.audio_url) setAudioName('Uploaded ✓')
        setUid(data.id ? String(data.id) : '')
        if (data.settings) applySettings(data.settings); else setEnterTitle(data.username||'')
        if (data.username) fetchViewCounts(data.username)
        const { data:badgeRows } = await supabase.from('user_badges').select('badge, hidden').eq('username', data.username)
        setUserBadges(badgeRows?badgeRows:[])
        setBadgePosition(data.badge_position||'below_bio')
      }
      setLoading(false)
    }
    init()
  }, [router])

  useEffect(() => {
    if (activePage === 'templates') fetchTemplates()
  }, [activePage, username])

  const fetchViewCounts = async (uname) => {
    const { count:total } = await supabase.from('profile_views').select('*',{ count:'exact', head:true }).eq('username', uname)
    const todayStart = new Date(); todayStart.setHours(0,0,0,0)
    const { count:today } = await supabase.from('profile_views').select('*',{ count:'exact', head:true }).eq('username', uname).gte('viewed_at', todayStart.toISOString())
    setProfileViews(total||0); setViewsToday(today||0)
  }

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/') }

  const handleFileUpload = async (type, file) => {
    if (!file) return
    setUploadingType(type)
    const ext    = file.name.split('.').pop()
    const bucket = type==='audio'?'audio':'images'
    const path   = `${username}/${type}-${Date.now()}.${ext}`
    const { error:uploadError } = await supabase.storage.from(bucket).upload(path, file, { upsert:true })
    if (uploadError) { showToast('Upload failed'); setUploadingType(null); return }
    const { data:urlData } = supabase.storage.from(bucket).getPublicUrl(path)
    const url = urlData.publicUrl
    const colMap = { bg:'bg_url', avatar:'avatar_url', cursor:'cursor_url', audio:'audio_url' }
    await supabase.from('users').update({ [colMap[type]]:url }).eq('username', username)
    if (type==='bg') setBgPreview(url); else if (type==='avatar') setAvatarPreview(url); else if (type==='cursor') setCursorPreview(url); else if (type==='audio') { setAudioName(file.name); setMusicUrl(url) }
    showToast(`${type.charAt(0).toUpperCase()+type.slice(1)} uploaded!`)
    setUploadingType(null)
  }

  const removeAsset = async (type) => {
    const colMap = { bg:'bg_url', avatar:'avatar_url', cursor:'cursor_url', audio:'audio_url' }
    await supabase.from('users').update({ [colMap[type]]:null }).eq('username', username)
    if (type==='bg') setBgPreview(null); else if (type==='avatar') setAvatarPreview(null); else if (type==='cursor') setCursorPreview(null); else if (type==='audio') setAudioName(null)
    showToast('Removed')
  }

  const saveProfile    = async () => { setSaving(true); const settings=buildSettings(); const { error } = await supabase.from('users').update({ bio:appBio, links, display_name:displayName, location, settings }).eq('username', username); setSaving(false); if (!error) setBio(appBio); showToast(error?'Failed to save':'Profile saved!') }
  const saveAppearance = async () => { setSaving(true); const settings=buildSettings(); const { error } = await supabase.from('users').update({ bio:appBio, opacity, blur, username_fx:usernameFx, bg_fx:bgFx, location, glow_settings:glowState, discord_presence:discordPresence, settings }).eq('username', username); setSaving(false); if (!error) setBio(appBio); showToast(error?'Failed to save':'Appearance saved!') }
  const saveEffects    = async () => { setSaving(true); const settings=buildSettings(); const { error } = await supabase.from('users').update({ settings }).eq('username', username); setSaving(false); showToast(error?'Failed to save':'Effects saved!') }
  const saveMusic      = async () => { setSaving(true); const settings=buildSettings(); const extraUpdate=musicUrl?{ audio_url:musicUrl }:{}; const { error } = await supabase.from('users').update({ settings, ...extraUpdate }).eq('username', username); setSaving(false); showToast(error?'Failed to save':'Music saved!') }
  const saveButtons    = async () => { setSaving(true); const settings=buildSettings(); const { error } = await supabase.from('users').update({ settings }).eq('username', username); setSaving(false); showToast(error?'Failed to save':'Buttons saved!') }
  const saveLinks      = async () => { setSaving(true); const settings=buildSettings(); const { error } = await supabase.from('users').update({ links, settings }).eq('username', username); setSaving(false); showToast(error?'Failed to save':'Links saved!') }
  const handleAddLink  = (linkObj) => { setLinks(prev => [...prev, { ...linkObj, id:Date.now() }]); showToast('Link added! Remember to save.') }
  const deleteLink     = (idx)    => { setLinks(prev => prev.filter((_,i) => i!==idx)); showToast('Link removed') }
  const addButton      = () => { if (!newBtnLabel.trim()||!newBtnUrl.trim()) { showToast('Please fill in both fields'); return }; const url=newBtnUrl.trim().startsWith('http')?newBtnUrl.trim():`https://${newBtnUrl.trim()}`; setButtons(prev => [...prev, { label:newBtnLabel.trim(), url, id:Date.now() }]); setNewBtnLabel(''); setNewBtnUrl(''); setShowAddBtnModal(false); showToast('Button added! Remember to save.') }
  const navTo          = (page)  => { setActivePage(page); setSidebarOpen(false); setNotifOpen(false); setAvatarDDOpen(false) }
  const initial        = username ? username[0].toUpperCase() : '?'

  const presets = [['Crimson','#1a0000','#e03030'],['Obsidian','#050505','#6366f1'],['Sunset','#1a0800','#f97316'],['Rose','#240b1a','#fb7185'],['Lime','#060b02','#84cc16'],['Ice','#07131d','#7dd3fc'],['Gold','#140f02','#facc15'],['Cherry','#15030b','#f43f5e'],['Ocean','#03111c','#0ea5e9'],['Violet','#0a0517','#8b5cf6']]
  const fonts         = ['Inter','Syne','Space Mono','Roboto','Poppins','Montserrat','Sora','DM Sans','Manrope','JetBrains Mono','Bebas Neue','Playfair Display']
  const particles     = ['Dots','Stars','Snow','Bubbles','Fireflies','Sparks','Matrix','Confetti']
  const cursors       = ['Default','Dot','Ring','Crosshair','Skull','Star','Heart','Arrow']
  const entranceAnims = ['Fade In','Slide Up','Zoom In','Glitch','None']
  const clickEffects  = ['None','Sparks','Hearts','Stars','Explosion','Ripple']

  const filterTpls = (list) => {
    if (!tplSearch.trim()) return list
    const q = tplSearch.toLowerCase()
    return list.filter(t => t.name?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q) || (Array.isArray(t.tags) && t.tags.some(tag => tag.toLowerCase().includes(q))) || t.creator_username?.toLowerCase().includes(q))
  }

  if (loading) return <div style={{ background:'#050202', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}><div style={{ color:'rgba(255,255,255,0.3)', fontFamily:'Inter, sans-serif', fontSize:14 }}>Loading…</div></div>

  const navLinks = [
    { section:null, items:[{ id:'overview', label:'Overview', icon:<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> }]},
    { section:'PROFILE', items:[
      { id:'profile',    label:'Edit Profile', icon:<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
      { id:'appearance', label:'Appearance',   icon:<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8H12"/></svg> },
      { id:'links',      label:'Links',        icon:<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/></svg> },
      { id:'buttons',    label:'Buttons',      icon:<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="10" rx="2"/></svg> },
    ]},
    { section:'FEATURES', items:[
      { id:'effects',   label:'Effects',   icon:<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg> },
      { id:'music',     label:'Music',     icon:<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg> },
      { id:'widgets',   label:'Widgets',   icon:<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="4" rx="1"/><rect x="14" y="3" width="7" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="17" width="7" height="4" rx="1"/><rect x="14" y="17" width="7" height="4" rx="1"/></svg> },
      { id:'templates', label:'Templates', icon:<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg> },
    ]},
    { section:'ACCOUNT', items:[
      { id:'analytics', label:'Analytics', icon:<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
      { id:'badges',    label:'Badges',    icon:<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12"/></svg> },
      { id:'settings',  label:'Settings',  icon:<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
      { id:'premium',   label:'Premium',   icon:<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
    ]},
  ]

  return (
    <div style={{ margin:0, background:'#050202', fontFamily:'Inter, sans-serif', color:'#fff', display:'flex', minHeight:'100vh' }}>
      <title>fate.rip | Dashboard</title>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html { color-scheme:dark; }
        ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-track { background:transparent; } ::-webkit-scrollbar-thumb { background:rgba(224,48,48,0.2); border-radius:2px; }
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
        .link-icon-tile:hover .link-icon-wrap { transform:scale(1.1); box-shadow:0 8px 28px rgba(0,0,0,0.45) !important; }
        .link-icon-tile:hover .link-del-btn { display:flex !important; }
        .plat-btn { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px; padding:12px 6px 10px; border-radius:12px; border:1px solid rgba(255,255,255,0.06); background:rgba(255,255,255,0.02); cursor:pointer; transition:all .15s; font-size:10px; color:rgba(255,255,255,0.5); font-family:inherit; }
        .plat-btn:hover { border-color:rgba(224,48,48,0.3); background:rgba(224,48,48,0.06); color:#fff; }
        .platforms-grid { grid-template-columns:repeat(8,1fr); }
        @media(max-width:700px){ .platforms-grid { grid-template-columns:repeat(6,1fr) !important; } }
        @media(max-width:480px){ .platforms-grid { grid-template-columns:repeat(4,1fr) !important; } }
        .link-item-row { display:flex; align-items:center; gap:12px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:11px; padding:10px 14px; transition:border-color .15s; }
        .link-item-row:hover { border-color:rgba(255,255,255,0.09); }
        .preset-btn { display:flex; flex-direction:column; align-items:center; gap:8px; border-radius:12px; border:1px solid rgba(255,255,255,0.07); background:rgba(255,255,255,0.02); padding:10px; cursor:pointer; transition:all .15s; font-family:inherit; }
        .preset-btn:hover { border-color:rgba(255,255,255,0.09); background:rgba(255,255,255,0.04); }
        .preset-btn.selected { border-color:rgba(224,48,48,0.4); background:rgba(224,48,48,0.1); }
        .badge-row { display:flex; align-items:center; gap:16px; padding:16px 20px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:14px; transition:border-color .15s; }
        .badge-row:hover { border-color:rgba(255,255,255,0.09); }
        .badge-action-btn { padding:8px 18px; border-radius:10px; font-size:12px; font-weight:600; cursor:pointer; border:1px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.6); font-family:inherit; transition:all .15s; white-space:nowrap; flex-shrink:0; }
        .badge-action-btn:hover { background:rgba(255,255,255,0.08); color:#fff; border-color:rgba(255,255,255,0.2); }
        .badge-locked-icon { display:flex; align-items:center; justify-content:center; width:46px; height:46px; border-radius:13px; flex-shrink:0; }
        .tpl-search input::placeholder { color:rgba(255,255,255,0.25); }
        .bg-hover-overlay:hover { opacity:1 !important; }
        @keyframes toastIn { from{transform:translateX(-50%) translateY(60px);opacity:0} to{transform:translateX(-50%) translateY(0);opacity:1} }
        @keyframes fadeInUp { from{opacity:0;transform:translateX(-50%) translateY(4px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes glitch { 0%,100%{text-shadow:2px 0 #ff0000,-2px 0 #0000ff} 25%{text-shadow:-2px 0 #ff0000,2px 0 #0000ff} 50%{text-shadow:2px 2px #ff0000,-2px -2px #0000ff} 75%{text-shadow:-2px 2px #ff0000,2px -2px #0000ff} }
        @media(max-width:900px){ .sidebar-desktop{display:none!important;} .actions-grid-3{grid-template-columns:1fr 1fr!important;} .stats-grid-3{grid-template-columns:1fr 1fr!important;} .editor-layout{grid-template-columns:1fr!important;} .effect-grid{grid-template-columns:repeat(3,1fr)!important;} .platforms-grid{grid-template-columns:repeat(5,1fr)!important;} .tpl-grid{grid-template-columns:1fr 1fr!important;} }
        @media(max-width:600px){ .actions-grid-3{grid-template-columns:1fr!important;} .stats-grid-3{grid-template-columns:1fr!important;} .effect-grid{grid-template-columns:repeat(2,1fr)!important;} .platforms-grid{grid-template-columns:repeat(4,1fr)!important;} .tpl-grid{grid-template-columns:1fr!important;} }
      `}</style>

      {/* ── SIDEBAR ── */}
      <div className="sidebar-desktop" style={{ width:270, flexShrink:0, display:'flex', flexDirection:'column', borderRight:'1px solid rgba(255,255,255,0.05)', background:'rgba(5,2,2,0.97)', position:'sticky', top:0, height:'100vh', overflowY:'auto', zIndex:20 }}>
        <div style={{ height:64, display:'flex', alignItems:'center', gap:8, padding:'0 24px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ fontFamily:'Syne, sans-serif', fontSize:18, fontWeight:800, letterSpacing:'-0.02em' }}>fate<span style={{ color:'rgba(255,255,255,0.18)' }}>.</span><span style={{ color:'#e03030' }}>rip</span></span>
        </div>
        <nav style={{ flex:1, padding:12, paddingTop:16, overflowY:'auto', display:'flex', flexDirection:'column', gap:12 }}>
          {navLinks.map(({ section, items }) => (
            <div key={section||'root'}>
              {section && <div style={{ fontSize:10, fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(255,255,255,0.2)', padding:'0 12px', marginBottom:4 }}>{section}</div>}
              <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
                {items.map(item => (
                  <button key={item.id} className={`nav-link-btn ${activePage===item.id?'active':''}`} onClick={() => navTo(item.id)}>
                    {item.icon}{item.label}
                    {activePage===item.id && <span style={{ marginLeft:'auto', width:6, height:6, borderRadius:'50%', background:'#e03030', flexShrink:0 }} />}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)', padding:12 }}>
          <div style={{ marginBottom:8 }}>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', fontWeight:500, padding:'0 4px', marginBottom:6 }}>Have a question or need support?</div>
            <a href="https://discord.gg/faterip" target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:10, background:'rgba(224,48,48,0.1)', border:'1px solid rgba(224,48,48,0.22)', color:'#f87171', fontSize:13, fontWeight:600, textDecoration:'none' }}>
              <div style={{ width:20, height:20, borderRadius:'50%', background:'rgba(224,48,48,0.25)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><svg width="11" height="11" fill="none" stroke="#f87171" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg></div>
              Help Center
            </a>
          </div>
          <div style={{ marginBottom:8 }}>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', fontWeight:500, padding:'0 4px', marginBottom:6 }}>Check out your page</div>
            <a href={username?`/${username}`:'/'}  target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:10, background:'rgba(224,48,48,0.1)', border:'1px solid rgba(224,48,48,0.22)', color:'#f87171', fontSize:13, fontWeight:600, textDecoration:'none' }}>
              <div style={{ width:20, height:20, borderRadius:6, background:'rgba(224,48,48,0.25)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><svg width="11" height="11" fill="none" stroke="#f87171" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></div>
              My Page
            </a>
          </div>
          <button onClick={() => { navigator.clipboard.writeText(`https://fate.rip/${username}`); showToast('Profile URL copied!') }} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', padding:'11px 16px', borderRadius:10, border:'1px solid rgba(224,48,48,0.4)', background:'#e03030', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', marginBottom:10 }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Share Your Profile
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 6px', borderRadius:10, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ width:34, height:34, borderRadius:'50%', background:'rgba(224,48,48,0.15)', border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#e03030', overflow:'hidden', flexShrink:0 }}>
              {avatarPreview ? <img src={avatarPreview} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} /> : initial}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.85)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{username||'User'}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.25)', fontFamily:'Space Mono, monospace' }}>UID {uid||'000000'}</div>
            </div>
            <div style={{ position:'relative' }}>
              <button onClick={() => setAvatarDDOpen(p=>!p)} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', padding:'4px 6px', borderRadius:6, fontSize:16, lineHeight:1, letterSpacing:1 }}>•••</button>
              {avatarDDOpen && (
                <div style={{ position:'absolute', bottom:36, right:0, width:160, background:'#0d0505', border:'1px solid rgba(255,255,255,0.09)', borderRadius:12, overflow:'hidden', zIndex:50 }} onClick={e => e.stopPropagation()}>
                  {[['Edit Profile','profile'],['Settings','settings']].map(([label,page]) => <button key={page} onClick={() => { navTo(page); setAvatarDDOpen(false) }} style={{ display:'flex', alignItems:'center', padding:'11px 16px', fontSize:13, color:'rgba(255,255,255,0.6)', cursor:'pointer', border:'none', background:'none', width:'100%', textAlign:'left', borderBottom:'1px solid rgba(255,255,255,0.05)', fontFamily:'inherit' }}>{label}</button>)}
                  <button onClick={handleLogout} style={{ display:'flex', alignItems:'center', padding:'11px 16px', fontSize:13, color:'#e03030', cursor:'pointer', border:'none', background:'none', width:'100%', textAlign:'left', fontFamily:'inherit' }}>Log out</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'auto', minWidth:0, position:'relative', zIndex:1 }}>
        <header style={{ height:56, display:'flex', alignItems:'center', justifyContent:'flex-end', padding:'0 24px', borderBottom:'1px solid rgba(255,255,255,0.05)', background:'rgba(5,2,2,0.88)', backdropFilter:'blur(16px)', position:'sticky', top:0, zIndex:10, gap:8 }}>
          <button onClick={() => { navigator.clipboard.writeText(`${typeof window!=='undefined'?window.location.origin:'https://fate.rip'}/${username}`); showToast('Profile URL copied!') }} style={{ width:36, height:36, borderRadius:10, border:'none', background:'transparent', color:'rgba(255,255,255,0.3)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }} title="Copy profile URL">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          </button>
          <button onClick={() => { setAvatarDDOpen(!avatarDDOpen); setNotifOpen(false) }} style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 8px 4px 4px', borderRadius:10, border:'none', background:'transparent', cursor:'pointer', position:'relative' }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:'rgba(224,48,48,0.15)', border:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:500, color:'#e03030', overflow:'hidden' }}>
              {avatarPreview ? <img src={avatarPreview} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} /> : initial}
            </div>
            <span style={{ fontSize:13, fontWeight:500, color:'rgba(255,255,255,0.7)' }}>{username||'User'}</span>
            <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
            {avatarDDOpen && (
              <div style={{ position:'absolute', top:48, right:0, width:200, background:'#0d0505', border:'1px solid rgba(255,255,255,0.09)', borderRadius:12, overflow:'hidden', zIndex:50 }} onClick={e => e.stopPropagation()}>
                {[['Edit Profile','profile'],['Settings','settings']].map(([label,page]) => <button key={page} onClick={() => { navTo(page); setAvatarDDOpen(false) }} style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 16px', fontSize:13, color:'rgba(255,255,255,0.6)', cursor:'pointer', border:'none', background:'none', width:'100%', textAlign:'left', borderBottom:'1px solid rgba(255,255,255,0.05)', fontFamily:'inherit' }}>{label}</button>)}
                <button onClick={handleLogout} style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 16px', fontSize:13, color:'#e03030', cursor:'pointer', border:'none', background:'none', width:'100%', textAlign:'left', fontFamily:'inherit' }}>Log out</button>
              </div>
            )}
          </button>
        </header>

        <div style={{ flex:1, padding:32, maxWidth:1100, width:'100%', margin:'0 auto', display:'flex', flexDirection:'column', gap:28 }} onClick={() => { setNotifOpen(false); setAvatarDDOpen(false) }}>

          {/* ═══ OVERVIEW ═══ */}
          {activePage === 'overview' && (
            <>
              <div>
                <div style={{ fontSize:11, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', marginBottom:8 }}>Dashboard · Overview</div>
                <h1 style={{ fontSize:22, fontWeight:700, margin:0, fontFamily:'Syne, sans-serif' }}>Welcome back, <span style={{ color:'#e03030' }}>{username}</span></h1>
                <p style={{ marginTop:4, fontSize:13, color:'rgba(255,255,255,0.4)' }}>Here&apos;s what&apos;s happening with your profile</p>
              </div>
              <div style={{ border:'1px solid rgba(224,48,48,0.22)', background:'rgba(224,48,48,0.05)', borderRadius:12, padding:20 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
                  <div>
                    <div style={{ fontSize:11, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)' }}>Your profile URL</div>
                    <div style={{ marginTop:6, fontFamily:'Space Mono, monospace', fontSize:13, color:'rgba(255,255,255,0.7)' }}>fate.rip/{username}</div>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <BtnGhost onClick={() => { navigator.clipboard.writeText(`https://fate.rip/${username}`); showToast('URL copied!') }}><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>Copy</BtnGhost>
                    <a href={`/${username}`} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:10, fontSize:13, fontWeight:500, border:'none', background:'#e03030', color:'#fff', textDecoration:'none' }}><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>View</a>
                  </div>
                </div>
              </div>
              <div className="stats-grid-3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
                {[{ label:'Total Views', value:profileViews.toLocaleString(), color:'#e03030' },{ label:'Username', value:`@${username}`, color:'#f05050' },{ label:'UID', value:`#${uid||'0001'}`, color:'#b41414' }].map((s,i) => (
                  <div key={i} className="stat-card-h">
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div style={{ minWidth:0, flex:1, paddingRight:12 }}>
                        <div style={{ fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.4)' }}>{s.label}</div>
                        <div style={{ fontSize:24, fontWeight:700, marginTop:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.value}</div>
                      </div>
                      <div style={{ width:48, height:48, borderRadius:12, background:'linear-gradient(135deg,rgba(224,48,48,0.2),rgba(180,20,20,0.2))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <svg width="24" height="24" fill="none" stroke={s.color} strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', marginBottom:12 }}>Quick Actions</div>
                <div className="actions-grid-3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
                  {[{ page:'links',title:'Links',desc:'Add or edit your social links' },{ page:'profile',title:'Edit Profile',desc:'Update bio, avatar, and display name' },{ page:'buttons',title:'Custom Buttons',desc:'Create call-to-action buttons' },{ page:'appearance',title:'Appearance',desc:'Colors, fonts, and themes' },{ page:'effects',title:'Effects',desc:'Particles, cursors, and animations' },{ page:'music',title:'Music',desc:'Add background music' }].map((item,i) => (
                    <div key={i} className="action-card" onClick={() => navTo(item.page)}>
                      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
                        <div style={{ width:44, height:44, borderRadius:12, background:'linear-gradient(135deg,rgba(224,48,48,0.2),rgba(180,20,20,0.2))', display:'flex', alignItems:'center', justifyContent:'center', color:'#e03030' }}><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg></div>
                        <span style={{ color:'rgba(255,255,255,0.2)' }}><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg></span>
                      </div>
                      <div style={{ fontSize:14, fontWeight:600, color:'#fff', marginBottom:4 }}>{item.title}</div>
                      <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)', lineHeight:1.5 }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ═══ ANALYTICS ═══ */}
          {activePage === 'analytics' && <AnalyticsPage username={username} profileViews={profileViews} viewsToday={viewsToday} onBack={() => navTo('overview')} />}

          {/* ═══ PROFILE EDITOR ═══ */}
          {activePage === 'profile' && (
            <>
              <PageHeader breadcrumb="Dashboard · Profile" title='Edit <span style="color:#e03030">Profile</span>' subtitle="Update your bio, avatar, and display name" />
              <div className="editor-layout" style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:24, alignItems:'start' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                  <TabBar tabs={['Identity','Layout','Entrance']} active={profileTab} onSelect={setProfileTab} />
                  {profileTab === 'Identity' && (
                    <Card>
                      <CardHeader title="Profile Identity" sub="Your public-facing info" icon={<svg width="20" height="20" fill="none" stroke="#e03030" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} />
                      <div style={{ padding:24, display:'flex', flexDirection:'column', gap:20 }}>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, padding:24, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:12, textAlign:'center' }}>
                          <input type="file" ref={fileAvatarRef} accept="image/*" style={{ display:'none' }} onChange={e => handleFileUpload('avatar', e.target.files[0])} />
                          <div style={{ position:'relative', width:96, height:96, cursor:'pointer' }} onClick={() => fileAvatarRef.current.click()}>
                            <div style={{ width:96, height:96, borderRadius:'50%', background:'rgba(224,48,48,0.12)', border:'3px solid rgba(224,48,48,0.22)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne, sans-serif', fontSize:32, fontWeight:800, color:'#e03030', overflow:'hidden' }}>
                              {avatarPreview ? <img src={avatarPreview} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} /> : initial}
                            </div>
                          </div>
                          <p style={{ fontSize:14, fontWeight:600, color:'rgba(255,255,255,0.75)' }}>{uploadingType==='avatar'?'Uploading…':'Click to change avatar'}</p>
                          <small style={{ fontSize:11, color:'rgba(255,255,255,0.28)' }}>JPG, PNG, GIF or WebP · Max 5MB</small>
                          {avatarPreview && <BtnGhost onClick={() => removeAsset('avatar')} style={{ fontSize:11 }}>Remove</BtnGhost>}
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                          <div style={{ display:'flex', flexDirection:'column', gap:6 }}><label style={{ fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.35)', letterSpacing:'0.04em', textTransform:'uppercase' }}>Display Name</label><Input placeholder="Your name" value={displayName} onChange={e => setDisplayName(e.target.value)} /></div>
                          <div style={{ display:'flex', flexDirection:'column', gap:6 }}><label style={{ fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.35)', letterSpacing:'0.04em', textTransform:'uppercase' }}>Location</label><Input placeholder="City, Country" value={location} onChange={e => setLocation(e.target.value)} /></div>
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', gap:6 }}><label style={{ fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.35)', letterSpacing:'0.04em', textTransform:'uppercase' }}>Bio</label><Textarea placeholder="Tell visitors about yourself…" value={appBio} onChange={e => setAppBio(e.target.value)} rows={4} /></div>
                        <ToggleRow label="Typing Bio Effect" sub="Animate bio text as it types in" checked={typingBio} onChange={e => setTypingBio(e.target.checked)} />
                      </div>
                    </Card>
                  )}
                  {profileTab === 'Layout' && (
                    <Card>
                      <CardHeader title="Profile Layout" sub="Control the structure of your page" icon={<svg width="20" height="20" fill="none" stroke="#e03030" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>} />
                      <div style={{ padding:24, display:'flex', flexDirection:'column', gap:20 }}>
                        <div style={{ display:'flex', flexDirection:'column', gap:6 }}><label style={{ fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.35)', letterSpacing:'0.04em', textTransform:'uppercase' }}>Panel Size</label><div style={{ display:'flex', gap:8 }}>{['compact','medium','wide','full'].map(s => <button key={s} onClick={() => setPanelSize(s)} style={{ flex:1, padding:'10px 8px', borderRadius:10, border:`1px solid ${panelSize===s?'rgba(224,48,48,0.4)':'rgba(255,255,255,0.07)'}`, background:panelSize===s?'rgba(224,48,48,0.1)':'rgba(255,255,255,0.02)', color:panelSize===s?'#e03030':'rgba(255,255,255,0.45)', fontSize:12, fontWeight:500, cursor:'pointer', textTransform:'capitalize', fontFamily:'inherit', transition:'all .15s' }}>{s}</button>)}</div></div>
                        <div style={{ display:'flex', flexDirection:'column', gap:6 }}><label style={{ fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.35)', letterSpacing:'0.04em', textTransform:'uppercase' }}>Avatar Position</label><div style={{ display:'flex', gap:8 }}>{['left','center','right'].map(p => <button key={p} onClick={() => setAvatarPos(p)} style={{ flex:1, padding:'10px 8px', borderRadius:10, border:`1px solid ${avatarPos===p?'rgba(224,48,48,0.4)':'rgba(255,255,255,0.07)'}`, background:avatarPos===p?'rgba(224,48,48,0.1)':'rgba(255,255,255,0.02)', color:avatarPos===p?'#e03030':'rgba(255,255,255,0.45)', fontSize:12, fontWeight:500, cursor:'pointer', textTransform:'capitalize', fontFamily:'inherit', transition:'all .15s' }}>{p}</button>)}</div></div>
                        <ToggleRow label="Show Avatar" sub="Display your avatar on your profile" checked={showAvatar} onChange={e => setShowAvatar(e.target.checked)} />
                        <ToggleRow label="Follow Cursor" sub="Panel floats and follows the visitor's cursor" checked={followCursor} onChange={e => setFollowCursor(e.target.checked)} />
                        <div style={{display:'flex',flexDirection:'column',gap:6}}><label style={{fontSize:11,fontWeight:500,color:'rgba(255,255,255,0.35)',letterSpacing:'0.04em',textTransform:'uppercase'}}>Panel Opacity — {panelOpacity}%</label><input type="range" min={20} max={100} value={panelOpacity} onChange={e=>setPanelOpacity(Number(e.target.value))} style={{width:'100%',accentColor:'#e03030'}}/></div>
                        <div style={{display:'flex',flexDirection:'column',gap:6}}><label style={{fontSize:11,fontWeight:500,color:'rgba(255,255,255,0.35)',letterSpacing:'0.04em',textTransform:'uppercase'}}>Panel Blur — {panelBlur}px</label><input type="range" min={0} max={40} value={panelBlur} onChange={e=>setPanelBlur(Number(e.target.value))} style={{width:'100%',accentColor:'#e03030'}}/></div>
                      </div>
                    </Card>
                  )}
                  {profileTab === 'Entrance' && (
                    <Card>
                      <CardHeader title="Entrance Screen" sub="Show a splash screen before visitors see your profile" icon={<svg width="20" height="20" fill="none" stroke="#e03030" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>} action={<Toggle checked={enterEnabled} onChange={e => setEnterEnabled(e.target.checked)} />} />
                      {enterEnabled && (
                        <div style={{ padding:24, display:'flex', flexDirection:'column', gap:16 }}>
                          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                            <div style={{ display:'flex', flexDirection:'column', gap:6 }}><label style={{ fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.35)', letterSpacing:'0.04em', textTransform:'uppercase' }}>Title</label><Input placeholder="Enter title" value={enterTitle} onChange={e => setEnterTitle(e.target.value)} /></div>
                            <div style={{ display:'flex', flexDirection:'column', gap:6 }}><label style={{ fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.35)', letterSpacing:'0.04em', textTransform:'uppercase' }}>Subtitle</label><Input placeholder="Click anywhere to enter" value={enterSubtitle} onChange={e => setEnterSubtitle(e.target.value)} /></div>
                          </div>
                          <ToggleRow label="Show Avatar" checked={enterShowAvatar} onChange={e => setEnterShowAvatar(e.target.checked)} />
                          <ToggleRow label="Show Title" checked={enterShowTitle} onChange={e => setEnterShowTitle(e.target.checked)} />
                          <ToggleRow label="Show Subtitle" checked={enterShowSubtitle} onChange={e => setEnterShowSubtitle(e.target.checked)} />
                        </div>
                      )}
                    </Card>
                  )}
                  <SaveBar onSave={saveProfile} onDiscard={() => { setAppBio(bio); setDisplayName(dbUser?.display_name||''); setLocation(dbUser?.location||'') }} saving={saving} />
                </div>
                <PreviewPanel bgColor={bgColor} bgPreview={bgPreview} opacity={opacity} blur={blur} accentColor={accentColor} avatarPos={avatarPos} selectedFont={selectedFont} showAvatar={showAvatar} avatarPreview={avatarPreview} initial={initial} displayName={displayName} username={username} appBio={appBio} links={links} iconSize={iconSize} panelSize={panelSize} />
              </div>
            </>
          )}

          {/* ═══ APPEARANCE ═══ */}
          {activePage === 'appearance' && (
            <>
              <PageHeader breadcrumb="Dashboard · Appearance" title='Customize <span style="color:#e03030">Appearance</span>' subtitle="Colors, fonts, and themes" />
              <div className="editor-layout" style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:24, alignItems:'start' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                  <input type="file" ref={fileBgRef} accept="image/*,video/*" style={{ display:'none' }} onChange={e => handleFileUpload('bg', e.target.files[0])} />
                  <TabBar tabs={['Presets','Colors','Fonts','Background','Glow']} active={appearTab} onSelect={setAppearTab} cols={5} />
                  {appearTab === 'Presets' && <Card><CardHeader title="Theme Presets" sub="One-click themes with coordinated colors" /><div style={{ padding:24 }}><div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8 }}>{presets.map(([name,bg,acc]) => <button key={name} className={`preset-btn ${selectedPreset===name?'selected':''}`} onClick={() => { setSelectedPreset(name); setAccentColor(acc); setBgColor(bg); showToast(`${name} applied! Save to keep it.`) }}><div style={{ width:'100%', height:36, borderRadius:8, overflow:'hidden', display:'flex' }}><div style={{ flex:1, background:bg }} /><div style={{ width:20, background:acc }} /></div><div style={{ fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.6)' }}>{name}</div></button>)}</div></div></Card>}
                  {appearTab === 'Colors' && <Card><CardHeader title="Color Settings" sub="Customize accent and background colors" /><div style={{ padding:24, display:'flex', flexDirection:'column', gap:20 }}>{[['Accent Color',accentColor,setAccentColor],['Background Color',bgColor,setBgColor]].map(([lbl,val,setter]) => <div key={lbl} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}><div><div style={{ fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.35)', letterSpacing:'0.04em', textTransform:'uppercase' }}>{lbl}</div><div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', fontFamily:'Space Mono, monospace', marginTop:4 }}>{val}</div></div><input type="color" value={val} onChange={e => setter(e.target.value)} style={{ width:44, height:44, border:'none', borderRadius:10, background:'rgba(255,255,255,0.05)', cursor:'pointer', padding:4 }} /></div>)}</div></Card>}
                  {appearTab === 'Fonts' && <Card><CardHeader title="Font Family" sub="Choose a font for your profile text" /><div style={{ padding:24 }}><div className="effect-grid">{fonts.map(f => <button key={f} className={`effect-btn ${selectedFont===f?'active':''}`} style={{ fontFamily:`'${f}', sans-serif` }} onClick={() => setSelectedFont(f)}>{f}</button>)}</div></div></Card>}
                  {appearTab === 'Background' && (
                    <Card>
                      <CardHeader title="Background" sub="Choose how your profile background looks" />
                      <div style={{ padding:24, display:'flex', flexDirection:'column', gap:20 }}>
                        <div style={{ display:'flex', flexDirection:'column', gap:6 }}><label style={{ fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.35)', letterSpacing:'0.04em', textTransform:'uppercase' }}>Type</label><div style={{ display:'flex', gap:8 }}>{['Solid','Gradient','Image','Video'].map(t => <button key={t} onClick={() => setBgType(t)} style={{ flex:1, padding:'10px 8px', borderRadius:10, border:`1px solid ${bgType===t?'rgba(224,48,48,0.4)':'rgba(255,255,255,0.07)'}`, background:bgType===t?'rgba(224,48,48,0.1)':'rgba(255,255,255,0.02)', color:bgType===t?'#e03030':'rgba(255,255,255,0.45)', fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}>{t}</button>)}</div></div>
                        <div style={{ display:'flex', flexDirection:'column', gap:6 }}><label style={{ fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.35)', letterSpacing:'0.04em', textTransform:'uppercase' }}>Background Effect</label><select value={bgFx} onChange={e => setBgFx(e.target.value)} style={{ width:'100%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:'11px 14px', fontSize:13, color:'#fff', fontFamily:'inherit', outline:'none', height:44, appearance:'none' }}><option value="none">None</option><option value="nighttime">Night Time</option><option value="particles">Particles</option><option value="rain">Rain</option><option value="snow">Snow</option><option value="matrix">Matrix</option></select></div>
                        <div style={{ display:'flex', flexDirection:'column', gap:6 }}><label style={{ fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.35)', letterSpacing:'0.04em', textTransform:'uppercase' }}>Opacity — {opacity}%</label><input type="range" min={20} max={100} value={opacity} onChange={e => setOpacity(Number(e.target.value))} style={{ width:'100%', accentColor:'#e03030' }} /></div>
                        <div style={{ display:'flex', flexDirection:'column', gap:6 }}><label style={{ fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.35)', letterSpacing:'0.04em', textTransform:'uppercase' }}>Blur — {blur}px</label><input type="range" min={0} max={80} value={blur} onChange={e => setBlur(Number(e.target.value))} style={{ width:'100%', accentColor:'#e03030' }} /></div>
                        <div onClick={() => fileBgRef.current.click()} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, border:'1px dashed rgba(255,255,255,0.1)', borderRadius:12, padding:'32px 24px', fontSize:13, color:'rgba(255,255,255,0.4)', cursor:'pointer', background:'rgba(255,255,255,0.01)' }}><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>{uploadingType==='bg'?'Uploading…':bgPreview?'Replace background media':'Upload background media (max 25MB)'}</div>
                        {bgPreview && <BtnGhost onClick={() => removeAsset('bg')} style={{ alignSelf:'flex-start' }}>Remove Background</BtnGhost>}
                      </div>
                    </Card>
                  )}
                  {appearTab === 'Glow' && (
                    <Card>
                      <CardHeader title="Glow Effects" sub="Add glowing highlights to profile elements" />
                      <div style={{ padding:24, display:'flex', flexDirection:'column', gap:12 }}>
                        <ToggleRow label="Glow Username" checked={glowState.username} onChange={e => setGlowState(p => ({ ...p, username:e.target.checked }))} />
                        <ToggleRow label="Glow Social Links" checked={glowState.socials} onChange={e => setGlowState(p => ({ ...p, socials:e.target.checked }))} />
                        <ToggleRow label="Glow Badges" checked={glowState.badges} onChange={e => setGlowState(p => ({ ...p, badges:e.target.checked }))} />
                        <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:4 }}><label style={{ fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.35)', letterSpacing:'0.04em', textTransform:'uppercase' }}>Glow Intensity — {glowIntensity}%</label><input type="range" min={0} max={100} value={glowIntensity} onChange={e => setGlowIntensity(Number(e.target.value))} style={{ width:'100%', accentColor:'#e03030' }} /></div>
                        <div style={{ display:'flex', flexDirection:'column', gap:6 }}><label style={{ fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.35)', letterSpacing:'0.04em', textTransform:'uppercase' }}>Username Effect</label><select value={usernameFx} onChange={e => setUsernameFx(e.target.value)} style={{ width:'100%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:'11px 14px', fontSize:13, color:'#fff', fontFamily:'inherit', outline:'none', height:44, appearance:'none' }}><option value="">None</option><option value="rainbow">🌈 Rainbow</option><option value="glitch">⚡ Glitch</option><option value="neon">✨ Neon</option><option value="gold">🏆 Gold</option></select></div>
                      </div>
                    </Card>
                  )}
                  <SaveBar onSave={saveAppearance} onDiscard={() => showToast('Changes discarded')} saving={saving} />
                </div>
                <PreviewPanel bgColor={bgColor} bgPreview={bgPreview} opacity={opacity} blur={blur} accentColor={accentColor} avatarPos={avatarPos} selectedFont={selectedFont} showAvatar={showAvatar} avatarPreview={avatarPreview} initial={initial} displayName={displayName} username={username} appBio={appBio} links={links} iconSize={iconSize} panelSize={panelSize} />
              </div>
            </>
          )}

          {/* ═══ LINKS ═══ */}
          {activePage === 'links' && (
            <>
              <PageHeader breadcrumb="Dashboard · Links" title='Social <span style="color:#e03030">Links</span>' subtitle="Add your social media profiles and custom links" />
              <Card>
                <CardHeader title="Your Links" sub="Hover to remove · visitors click icons to copy" icon={<svg width="20" height="20" fill="none" stroke="#e03030" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/></svg>} />
                <div style={{ padding:'20px 24px 28px' }}>
                  {links.length === 0 ? <div style={{ padding:'32px 0', textAlign:'center', color:'rgba(255,255,255,0.2)', fontSize:13 }}>No links yet — pick a platform below to add one!</div>
                    : <div style={{ display:'flex', flexWrap:'wrap', gap:20 }}>{links.map((l,i) => { const p=l.platform||{ id:'custom', name:l.title, color:'#e03030' }; const abbr=PLATFORM_ABBR[p.id]||p.name?.[0]||'?'; return <LinkIconTile key={l.id||i} link={l} platform={p} abbr={abbr} onDelete={() => deleteLink(i)} iconSize={iconSize} showLabel={showLinkLabels} /> })}</div>}
                </div>
              </Card>
              <Card>
                <CardHeader title="Add New Link" sub="Choose a platform or create a custom link" icon={<svg width="20" height="20" fill="none" stroke="#e03030" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14"/><path d="M5 12h14"/></svg>} />
                <div className="platforms-grid" style={{ display:'grid', gap:8, padding:'16px 22px 22px' }}>
                  {PLATFORMS.map(p => { const abbr=PLATFORM_ABBR[p.id]||p.name[0]; return <button key={p.id} className="plat-btn" onClick={() => setActiveLinkPlatform(p)}><div style={{ width:36, height:36, borderRadius:10, background:p.color, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 3px 10px ${p.color}55`, flexShrink:0, overflow:'hidden' }}>{p.id==='email'?<svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>:SIMPLE_ICONS[p.id]?<img src={`https://cdn.simpleicons.org/${SIMPLE_ICONS[p.id]}/ffffff`} alt={p.name} style={{ width:'60%', height:'60%', objectFit:'contain' }} />:<span style={{ fontSize:12, fontWeight:800, color:getTextColor(p.id) }}>{abbr}</span>}</div><span style={{ fontSize:10, lineHeight:1.2, textAlign:'center' }}>{p.name}</span></button> })}
                </div>
              </Card>
              <Card>
                <CardHeader title="Icon Size" sub="Adjust the size of your social link icons" />
                <div style={{ padding:24, display:'flex', flexDirection:'column', gap:12 }}>
                  <ToggleRow label="Show Link Labels" sub="Display platform names below each icon" checked={showLinkLabels} onChange={e => setShowLinkLabels(e.target.checked)} />
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}><label style={{ fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.35)', letterSpacing:'0.04em', textTransform:'uppercase' }}>Size</label><span style={{ fontSize:13, fontWeight:600, color:'#fff', background:'rgba(224,48,48,0.15)', border:'1px solid rgba(224,48,48,0.3)', borderRadius:8, padding:'2px 10px' }}>{iconSize}px</span></div>
                  <input type="range" min={32} max={72} value={iconSize} onChange={e => setIconSize(Number(e.target.value))} style={{ width:'100%', accentColor:'#e03030', height:6, cursor:'pointer' }} />
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'rgba(255,255,255,0.25)' }}><span>Small (32px)</span><span>Large (72px)</span></div>
                </div>
              </Card>
              <div style={{ display:'flex', justifyContent:'flex-end' }}><BtnAccent onClick={saveLinks} disabled={saving}>{saving?'Saving…':'Save Links'}</BtnAccent></div>
              <AddLinkModal platform={activeLinkPlatform} onClose={() => setActiveLinkPlatform(null)} onAdd={handleAddLink} />
            </>
          )}

          {/* ═══ BUTTONS ═══ */}
          {activePage === 'buttons' && (
            <>
              <PageHeader breadcrumb="Dashboard · Buttons" title='Custom <span style="color:#e03030">Buttons</span>' subtitle="Create call-to-action buttons" />
              <Card>
                <CardHeader title="Your Buttons" sub={`${buttons.length} button${buttons.length!==1?'s':''}`} action={<BtnAccent onClick={() => setShowAddBtnModal(true)}><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14"/><path d="M5 12h14"/></svg>Add Button</BtnAccent>} />
                <div style={{ padding:24, display:'flex', flexDirection:'column', gap:8 }}>
                  {buttons.length === 0 && <div style={{ padding:'32px 0', textAlign:'center', color:'rgba(255,255,255,0.2)', fontSize:13 }}>No buttons yet — create one above!</div>}
                  {buttons.map((b,i) => <div key={i} className="link-item-row"><div style={{ flex:1 }}><div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.8)' }}>{b.label}</div><div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', fontFamily:'Space Mono, monospace' }}>{b.url}</div></div><button onClick={() => { setButtons(prev => prev.filter((_,idx) => idx!==i)); showToast('Button removed') }} style={{ width:28, height:28, borderRadius:8, border:'none', background:'transparent', color:'rgba(255,255,255,0.2)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></button></div>)}
                </div>
              </Card>
              <SaveBar onSave={saveButtons} saving={saving} />
            </>
          )}

          {/* ═══ EFFECTS ═══ */}
          {activePage === 'effects' && (
            <>
              <PageHeader breadcrumb="Dashboard · Effects" title='Visual <span style="color:#e03030">Effects</span>' subtitle="Particles, cursors, and animations" />
              <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                <TabBar tabs={['Particles','Cursor','Animations','Click Effects']} active={effectsTab} onSelect={setEffectsTab} cols={4} />
                {effectsTab === 'Particles' && <Card><CardHeader title="Particle Effects" sub="Background particles on your profile" action={<Toggle checked={particleEnabled} onChange={e => setParticleEnabled(e.target.checked)} />} />{particleEnabled && <div style={{ padding:24 }}><label style={{ fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.35)', letterSpacing:'0.04em', textTransform:'uppercase', display:'block', marginBottom:10 }}>Style</label><div className="effect-grid">{particles.map(p => <button key={p} className={`effect-btn ${particleStyle===p?'active':''}`} onClick={() => setParticleStyle(p)}>{p}</button>)}</div></div>}</Card>}
                {effectsTab === 'Cursor' && <Card><CardHeader title="Custom Cursor" sub="Replace the default cursor on your profile" /><div style={{ padding:24 }}><div className="effect-grid">{cursors.map(c => <button key={c} className={`effect-btn ${cursorStyle===c?'active':''}`} onClick={() => setCursorStyle(c)}>{c}</button>)}</div></div><div style={{ padding:'0 24px 24px' }}><input type="file" ref={fileCursorRef} accept="image/*" style={{ display:'none' }} onChange={e => handleFileUpload('cursor', e.target.files[0])} /><div onClick={() => fileCursorRef.current.click()} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, border:'1px dashed rgba(255,255,255,0.1)', borderRadius:12, padding:'24px', fontSize:13, color:'rgba(255,255,255,0.4)', cursor:'pointer' }}><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>{uploadingType==='cursor'?'Uploading…':cursorPreview?'Replace cursor image':'Upload a custom cursor image'}</div>{cursorPreview && <div style={{ marginTop:12, display:'flex', alignItems:'center', gap:10 }}><img src={cursorPreview} alt="cursor" style={{ width:32, height:32, objectFit:'contain' }} /><BtnGhost onClick={() => removeAsset('cursor')}>Remove</BtnGhost></div>}</div></Card>}
                {effectsTab === 'Animations' && <Card><CardHeader title="Entrance Animation" sub="How your profile animates in for visitors" /><div style={{ padding:24 }}><div className="effect-grid">{entranceAnims.map(a => <button key={a} className={`effect-btn ${entranceAnim===a?'active':''}`} onClick={() => setEntranceAnim(a)}>{a}</button>)}</div></div></Card>}
                {effectsTab === 'Click Effects' && <Card><CardHeader title="Click Effects" sub="What happens when visitors click on your profile" /><div style={{ padding:24 }}><div className="effect-grid">{clickEffects.map(e => <button key={e} className={`effect-btn ${clickEffect===e?'active':''}`} onClick={() => setClickEffect(e)}>{e}</button>)}</div></div></Card>}
                <SaveBar onSave={saveEffects} onDiscard={() => showToast('Changes discarded')} saving={saving} />
              </div>
            </>
          )}

          {/* ═══ MUSIC ═══ */}
          {activePage === 'music' && (
            <>
              <PageHeader breadcrumb="Dashboard · Music" title='Background <span style="color:#e03030">Music</span>' subtitle="Add a track that plays when visitors view your profile" />
              <div style={{ display:'flex', flexDirection:'column', gap:16, paddingBottom:80 }}>
                <Card>
                  <CardHeader title="Background Music" sub="Add a track that plays when visitors view your profile" icon={<svg width="20" height="20" fill="none" stroke="#e03030" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>} action={<Toggle checked={musicEnabled} onChange={e => setMusicEnabled(e.target.checked)} />} />
                  {musicEnabled && (
                    <div style={{ padding:24, display:'flex', flexDirection:'column', gap:20 }}>
                      <div style={{ display:'flex', gap:8 }}>{['direct','spotify','soundcloud'].map(t => <button key={t} onClick={() => setMusicType(t)} style={{ flex:1, padding:'10px 8px', borderRadius:10, border:`1px solid ${musicType===t?'rgba(224,48,48,0.4)':'rgba(255,255,255,0.07)'}`, background:musicType===t?'rgba(224,48,48,0.1)':'rgba(255,255,255,0.02)', color:musicType===t?'#e03030':'rgba(255,255,255,0.45)', fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>{{ direct:'Direct URL', spotify:'Spotify', soundcloud:'SoundCloud' }[t]}</button>)}</div>
                      <div style={{ display:'flex', flexDirection:'column', gap:6 }}><label style={{ fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.35)', letterSpacing:'0.04em', textTransform:'uppercase' }}>{musicType==='direct'?'Audio URL (.mp3, .ogg, etc.)':'Track URL'}</label><Input placeholder={musicType==='direct'?'https://example.com/song.mp3':musicType==='spotify'?'https://open.spotify.com/track/…':'https://soundcloud.com/…'} value={musicUrl} onChange={e => setMusicUrl(e.target.value)} /></div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                        <div style={{ display:'flex', flexDirection:'column', gap:6 }}><label style={{ fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.35)', letterSpacing:'0.04em', textTransform:'uppercase' }}>Track Title</label><Input placeholder="Song name" value={musicTitle} onChange={e => setMusicTitle(e.target.value)} /></div>
                        <div style={{ display:'flex', flexDirection:'column', gap:6 }}><label style={{ fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.35)', letterSpacing:'0.04em', textTransform:'uppercase' }}>Artist</label><Input placeholder="Artist name" value={musicArtist} onChange={e => setMusicArtist(e.target.value)} /></div>
                      </div>
                      {musicType==='direct' && <div><input type="file" ref={fileAudioRef} accept="audio/*" style={{ display:'none' }} onChange={e => handleFileUpload('audio', e.target.files[0])} /><div onClick={() => fileAudioRef.current.click()} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, border:'1px dashed rgba(255,255,255,0.1)', borderRadius:12, padding:'20px', fontSize:13, color:'rgba(255,255,255,0.4)', cursor:'pointer' }}><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>{uploadingType==='audio'?'Uploading…':audioName?`Uploaded: ${audioName}`:'Or upload an audio file (max 10MB)'}</div></div>}
                      <div style={{ display:'flex', flexDirection:'column', gap:6 }}><label style={{ fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.35)', letterSpacing:'0.04em', textTransform:'uppercase' }}>Volume — {musicVolume}%</label><input type="range" min={0} max={100} value={musicVolume} onChange={e => setMusicVolume(Number(e.target.value))} style={{ width:'100%', accentColor:'#e03030' }} /></div>
                    </div>
                  )}
                </Card>
                {musicEnabled && <Card><CardHeader title="Display Options" sub="Control how the music player appears" /><div style={{ padding:24, display:'flex', flexDirection:'column', gap:12 }}><ToggleRow label="Autoplay" sub="Start playing when visitors arrive" checked={musicAutoplay} onChange={e => setMusicAutoplay(e.target.checked)} /><ToggleRow label="Show Track Title" sub="Display song name in player" checked={musicShowTitle} onChange={e => setMusicShowTitle(e.target.checked)} /><ToggleRow label="Show Artist" sub="Display artist name in player" checked={musicShowArtist} onChange={e => setMusicShowArtist(e.target.checked)} /><ToggleRow label="Show Player" sub="Display the music player on your profile" checked={musicShowPlayer} onChange={e => setMusicShowPlayer(e.target.checked)} /></div></Card>}
                <SaveBar onSave={saveMusic} onDiscard={() => showToast('Changes discarded')} saving={saving} />
              </div>
            </>
          )}

          {/* ═══ BADGES ═══ */}
          {activePage === 'badges' && (() => {
            const saveBadgeSettings = async () => {
              setSavingBadges(true)
              await supabase.from('users').update({ badge_position:badgePosition }).eq('username', username)
              for (const b of userBadges) { await supabase.from('user_badges').update({ hidden:b.hidden||false }).eq('username', username).eq('badge', b.badge) }
              setSavingBadges(false); showToast('Badge settings saved!')
            }
            const toggleBadgeHidden = (badgeId) => { setUserBadges(prev => prev.map(b => b.badge===badgeId?{ ...b, hidden:!b.hidden }:b)) }
            return (
              <>
                <div style={{ fontSize:11, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', marginBottom:8 }}>Dashboard · Badges</div>
                <h1 style={{ fontSize:22, fontWeight:700, margin:'0 0 4px', fontFamily:'Syne, sans-serif' }}>Your <span style={{ color:'#e03030' }}>Badges</span></h1>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:24 }}>Collect badges by being active on fate.rip</p>
                <Card style={{ marginBottom:16 }}>
                  <CardHeader title="Badge Position" sub="Choose where badges appear on your profile" icon={<svg width="20" height="20" fill="none" stroke="#e03030" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12"/></svg>} />
                  <div style={{ padding:20, display:'flex', gap:8 }}>
                    {[{ value:'below_username', label:'Below Username' },{ value:'below_bio', label:'Below Bio' },{ value:'above_links', label:'Above Links' }].map(opt => (
                      <button key={opt.value} onClick={() => setBadgePosition(opt.value)} style={{ flex:1, padding:'10px 8px', borderRadius:10, fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'inherit', transition:'all .15s', border:`1px solid ${badgePosition===opt.value?'rgba(224,48,48,0.4)':'rgba(255,255,255,0.07)'}`, background:badgePosition===opt.value?'rgba(224,48,48,0.1)':'rgba(255,255,255,0.02)', color:badgePosition===opt.value?'#e03030':'rgba(255,255,255,0.45)' }}>{opt.label}</button>
                    ))}
                  </div>
                </Card>
                {userBadges.length > 0 && (
                  <Card style={{ marginBottom:16 }}>
                    <CardHeader title="Visibility" sub="Toggle which badges show on your profile" />
                    <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:10 }}>
                      {userBadges.map(b => {
                        const def = BADGE_DEFS.find(d => d.id===b.badge); if (!def) return null
                        const isHidden = b.hidden||false
                        return (
                          <div key={b.badge} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px', background:isHidden?'rgba(255,255,255,0.01)':def.bg, border:`1px solid ${isHidden?'rgba(255,255,255,0.05)':def.border}`, borderRadius:12, opacity:isHidden?0.5:1, transition:'all .2s' }}>
                            <div style={{ width:36, height:36, borderRadius:10, background:isHidden?'rgba(255,255,255,0.04)':def.bg, border:`1px solid ${isHidden?'rgba(255,255,255,0.07)':def.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:isHidden?'rgba(255,255,255,0.2)':def.color, flexShrink:0 }}>{def.icon}</div>
                            <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:700, color:isHidden?'rgba(255,255,255,0.35)':'#fff' }}>{def.name}</div><div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:1 }}>{isHidden?'Hidden on profile':'Visible on profile'}</div></div>
                            <Toggle checked={!isHidden} onChange={() => toggleBadgeHidden(b.badge)} />
                          </div>
                        )
                      })}
                    </div>
                  </Card>
                )}
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {BADGE_DEFS.map(badge => {
                    const owned = userBadges.some(b => b.badge===badge.id)
                    return (
                      <div key={badge.id} className="badge-row" style={{ opacity:owned?1:0.8, border:owned?`1px solid ${badge.border}`:undefined, background:owned?badge.bg:undefined }}>
                        <div className="badge-locked-icon" style={{ background:owned?badge.bg:'rgba(255,255,255,0.04)', border:`1px solid ${owned?badge.border:'rgba(255,255,255,0.07)'}`, color:owned?badge.color:'rgba(255,255,255,0.25)' }}>{badge.icon}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                            <span style={{ fontSize:14, fontWeight:700, color:owned?'#fff':'rgba(255,255,255,0.55)' }}>{badge.name}</span>
                            {owned && <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99, background:badge.bg, border:`1px solid ${badge.border}`, color:badge.color }}>Earned</span>}
                          </div>
                          <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginTop:2 }}>{badge.desc}</div>
                        </div>
                        {!owned && badge.how && (badge.howHref?<a href={badge.howHref} target="_blank" rel="noopener noreferrer" className="badge-action-btn" style={{ textDecoration:'none' }}>{badge.how}</a>:<button className="badge-action-btn" onClick={() => showToast(`${badge.name} — coming soon!`)}>{badge.how}</button>)}
                        {!owned && !badge.how && <span style={{ fontSize:11, color:'rgba(255,255,255,0.2)', flexShrink:0 }}>Staff assigned</span>}
                      </div>
                    )
                  })}
                </div>
                {userBadges.length > 0 && <div style={{ display:'flex', justifyContent:'flex-end', marginTop:16 }}><BtnAccent onClick={saveBadgeSettings} disabled={savingBadges}>{savingBadges?'Saving…':'Save Badge Settings'}</BtnAccent></div>}
              </>
            )
          })()}

          {/* ═══ WIDGETS ═══ */}
          {activePage === 'widgets' && (
            <>
              <PageHeader breadcrumb="Dashboard · Widgets" title='Profile <span style="color:#e03030">Widgets</span>' subtitle="Add widgets to your page" />
              <div style={{ padding:40, textAlign:'center', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:12 }}>
                <div style={{ fontSize:36, marginBottom:12 }}>⊞</div>
                <div style={{ fontSize:14, fontWeight:600, color:'rgba(255,255,255,0.5)' }}>Coming Soon</div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.25)', marginTop:6, maxWidth:300, marginLeft:'auto', marginRight:'auto', lineHeight:1.6 }}>Add countdown timers, now-playing widgets, Discord status, and more.</div>
              </div>
            </>
          )}

          {/* ═══ TEMPLATES ═══ */}
          {activePage === 'templates' && (
            <>
              <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16, padding:'20px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
                <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:'rgba(224,48,48,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <svg width="22" height="22" fill="none" stroke="#e03030" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize:18, fontWeight:700, color:'#fff', fontFamily:'Syne, sans-serif' }}>Templates</div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:2 }}>Save your profile style, browse the community library, and apply a template in one click.</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateTpl(true)}
                  style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:12, border:'none', background:'#e03030', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', flexShrink:0, transition:'all .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background='#c72828'}
                  onMouseLeave={e => e.currentTarget.style.background='#e03030'}
                >
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                  Create Template
                </button>
              </div>

              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
                <div style={{ display:'flex', gap:2, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:4 }}>
                  {['Template Library','Favorite Templates','My Uploads'].map(tab => (
                    <button key={tab} onClick={() => setTplTab(tab)} style={{ padding:'8px 16px', borderRadius:9, border:tplTab===tab?'1px solid rgba(255,255,255,0.08)':'1px solid transparent', background:tplTab===tab?'rgba(255,255,255,0.07)':'transparent', color:tplTab===tab?'#fff':'rgba(255,255,255,0.4)', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all .15s', whiteSpace:'nowrap' }}>{tab}</button>
                  ))}
                </div>
                <div className="tpl-search" style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'10px 16px', flex:1, maxWidth:340, minWidth:200 }}>
                  <svg width="15" height="15" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  <input value={tplSearch} onChange={e => setTplSearch(e.target.value)} placeholder="Search templates…" style={{ background:'transparent', border:'none', outline:'none', color:'#fff', fontSize:13, fontFamily:'inherit', width:'100%' }} />
                </div>
              </div>

              {loadingTpls ? (
                <div style={{ padding:'60px 0', textAlign:'center', color:'rgba(255,255,255,0.2)', fontSize:13 }}>Loading templates…</div>
              ) : (
                <>
                  {tplTab === 'Template Library' && (() => {
                    const filtered = filterTpls(communityTemplates)
                    return filtered.length === 0 ? (
                      <div style={{ padding:'60px 0', textAlign:'center' }}>
                        <div style={{ fontSize:32, marginBottom:12 }}>🎨</div>
                        <div style={{ fontSize:14, fontWeight:600, color:'rgba(255,255,255,0.4)', marginBottom:8 }}>{tplSearch ? 'No templates found' : 'No public templates yet'}</div>
                        <div style={{ fontSize:12, color:'rgba(255,255,255,0.2)', marginBottom:20 }}>{tplSearch ? 'Try a different search term' : 'Be the first to share your style!'}</div>
                        {!tplSearch && <BtnAccent onClick={() => setShowCreateTpl(true)}>Create First Template</BtnAccent>}
                      </div>
                    ) : (
                      <div className="tpl-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:16 }}>
                        {filtered.map(tpl => <TemplateCard key={tpl.id} tpl={tpl} onPreview={setPreviewTpl} onUse={handleUseTemplate} onFavorite={handleFavorite} isFavorited={favoriteIds.has(tpl.id)} isOwn={tpl.creator_username===username} />)}
                      </div>
                    )
                  })()}

                  {tplTab === 'Favorite Templates' && (() => {
                    const filtered = filterTpls(favTemplates)
                    return filtered.length === 0 ? (
                      <div style={{ padding:'60px 0', textAlign:'center' }}>
                        <div style={{ fontSize:32, marginBottom:12 }}>⭐</div>
                        <div style={{ fontSize:14, fontWeight:600, color:'rgba(255,255,255,0.4)', marginBottom:8 }}>No favorites yet</div>
                        <div style={{ fontSize:12, color:'rgba(255,255,255,0.2)' }}>Star templates you like to save them here</div>
                      </div>
                    ) : (
                      <div className="tpl-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:16 }}>
                        {filtered.map(tpl => <TemplateCard key={tpl.id} tpl={tpl} onPreview={setPreviewTpl} onUse={handleUseTemplate} onFavorite={handleFavorite} isFavorited={favoriteIds.has(tpl.id)} isOwn={tpl.creator_username===username} />)}
                      </div>
                    )
                  })()}

                  {tplTab === 'My Uploads' && (() => {
                    const filtered = filterTpls(myTemplates)
                    return filtered.length === 0 ? (
                      <div style={{ padding:'60px 0', textAlign:'center' }}>
                        <div style={{ fontSize:32, marginBottom:12 }}>📤</div>
                        <div style={{ fontSize:14, fontWeight:600, color:'rgba(255,255,255,0.4)', marginBottom:8 }}>No uploads yet</div>
                        <div style={{ fontSize:12, color:'rgba(255,255,255,0.2)', marginBottom:20 }}>Create a template to share your profile style</div>
                        <BtnAccent onClick={() => setShowCreateTpl(true)}>Create Template</BtnAccent>
                      </div>
                    ) : (
                      <div className="tpl-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:16 }}>
                        {filtered.map(tpl => (
                          <div key={tpl.id} style={{ position:'relative' }}>
                            <TemplateCard tpl={tpl} onPreview={setPreviewTpl} onUse={handleUseTemplate} onFavorite={handleFavorite} isFavorited={favoriteIds.has(tpl.id)} isOwn={true} />
                            <button
                              onClick={async () => {
                                if (!confirm('Delete this template?')) return
                                await supabase.from('community_templates').delete().eq('id', tpl.id)
                                setMyTemplates(prev => prev.filter(t => t.id!==tpl.id))
                                setCommunityTemplates(prev => prev.filter(t => t.id!==tpl.id))
                                showToast('Template deleted')
                              }}
                              style={{ position:'absolute', top:10, left:10, width:26, height:26, borderRadius:8, border:'none', background:'rgba(0,0,0,0.7)', color:'rgba(255,100,100,0.8)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, zIndex:5 }}
                              title="Delete template"
                            >
                              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </>
              )}

              {showCreateTpl && (
                <CreateTemplateModal
  onClose={() => setShowCreateTpl(false)}
  onSave={() => { fetchTemplates(); showToast('Template published!') }}
  currentSettings={buildSettings()}
  username={username}
  avatarUrl={avatarPreview}
  bgUrl={bgPreview}
  bio={appBio}
  location={location}
  opacity={opacity}
  blur={blur}
  usernameFx={usernameFx}
  bgFx={bgFx}
  glowState={glowState}
  displayName={displayName}
/>
              )}
              {previewTpl && (
                <TemplatePreviewModal
                  tpl={previewTpl}
                  onClose={() => setPreviewTpl(null)}
                  onUse={handleUseTemplate}
                  currentUsername={username}
                />
              )}
            </>
          )}

          {/* ═══ PREMIUM ═══ */}
          {activePage === 'premium' && (
            <>
              <PageHeader breadcrumb="Dashboard · Premium" title='Go <span style="color:#e03030">Premium</span>' subtitle="Unlock exclusive features" />
              <div style={{ background:'linear-gradient(135deg,rgba(224,48,48,0.08),rgba(100,0,0,0.08))', border:'1px solid rgba(224,48,48,0.22)', borderRadius:14, padding:28, textAlign:'center' }}>
                <div style={{ fontSize:36, marginBottom:12 }}>⭐</div>
                <div style={{ fontFamily:'Syne, sans-serif', fontSize:20, fontWeight:800, marginBottom:8 }}>fate.rip <span style={{ color:'#e03030' }}>Premium</span></div>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.45)', maxWidth:340, margin:'0 auto 20px' }}>Unlock custom domains, advanced analytics, exclusive effects, and priority support.</p>
                <BtnAccent style={{ padding:'12px 28px', fontSize:14 }} onClick={() => showToast('Redirecting to checkout…')}>Upgrade Now</BtnAccent>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {['Custom domain (yourname.com)','Advanced analytics dashboard','Exclusive cursor & particle effects','Priority support','Early access to new features','Remove fate.rip branding'].map(f => (
                  <div key={f} style={{ display:'flex', alignItems:'center', gap:12, padding:14, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:10 }}>
                    <svg width="16" height="16" fill="none" stroke="#e03030" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>
                    <span style={{ fontSize:13, color:'rgba(255,255,255,0.7)' }}>{f}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ═══ SETTINGS ═══ */}
          {activePage === 'settings' && (
            <>
              <PageHeader breadcrumb="Dashboard · Settings" title='Account <span style="color:#e03030">Settings</span>' subtitle="Manage your account" />
              <div style={{ maxWidth:680 }}>
                <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                  <Card>
                    <div style={{ padding:24, display:'flex', flexDirection:'column', gap:20 }}>
                      {(() => {
                        const lastChanged = dbUser?.username_changed_at ? new Date(dbUser.username_changed_at) : null
                        const daysLeft = lastChanged ? Math.max(0, 7-Math.floor((Date.now()-lastChanged.getTime())/86400000)) : 0
                        const locked = daysLeft > 0
                        return (
                          <div>
                            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                              <span style={{ fontSize:13, fontWeight:500, color:'rgba(255,255,255,0.6)' }}>Username</span>
                              {locked ? <span style={{ fontSize:11, padding:'2px 8px', borderRadius:999, background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.3)', color:'#f59e0b', fontWeight:600 }}>Locked {daysLeft}d</span>
                                : <span style={{ fontSize:11, padding:'2px 8px', borderRadius:999, background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.3)', color:'#22c55e', fontWeight:600 }}>Available</span>}
                            </div>
                            <div style={{ display:'flex', gap:10 }}>
                              <Input value={username} disabled={locked} onChange={e => setUsername(e.target.value)} placeholder="Username" style={{ opacity:locked?0.5:1 }} />
                              <BtnAccent onClick={async () => {
                                if (!username.trim()) { showToast('Username cannot be empty'); return }
                                const { data:existing } = await supabase.from('users').select('username').eq('username', username.trim()).neq('email', user.email).maybeSingle()
                                if (existing) { showToast('Username already taken'); return }
                                const { error } = await supabase.from('users').update({ username:username.trim(), username_changed_at:new Date().toISOString() }).eq('email', user.email)
                                if (!error) setDbUser(p => ({ ...p, username_changed_at:new Date().toISOString() }))
                                showToast(error?'Failed to save':'Username updated!')
                              }} disabled={locked}>Save</BtnAccent>
                            </div>
                          </div>
                        )
                      })()}
                      <div style={{ height:1, background:'rgba(255,255,255,0.05)' }} />
                      <div>
                        <div style={{ fontSize:13, fontWeight:500, color:'rgba(255,255,255,0.6)', marginBottom:8 }}>Display Name</div>
                        <div style={{ display:'flex', gap:10 }}>
                          <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Display name" />
                          <BtnAccent onClick={async () => { const { error } = await supabase.from('users').update({ display_name:displayName }).eq('email', user.email); showToast(error?'Failed to save':'Display name saved!') }}>Save</BtnAccent>
                        </div>
                      </div>
                      <div style={{ height:1, background:'rgba(255,255,255,0.05)' }} />
                      <div>
                        <div style={{ fontSize:13, fontWeight:500, color:'rgba(255,255,255,0.6)', marginBottom:8 }}>Password</div>
                        <div style={{ display:'flex', gap:10 }}>
                          <div style={{ flex:1, display:'flex', alignItems:'center', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, paddingRight:10 }}>
                            <Input type={showPassword?'text':'password'} placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ border:'none', background:'transparent', flex:1 }} />
                            <button onClick={() => setShowPassword(p=>!p)} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', padding:4, display:'flex' }}><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
                          </div>
                          <BtnAccent onClick={async () => { if (!newPassword||newPassword.length<6) { showToast('Password must be 6+ characters'); return }; const { error } = await supabase.auth.updateUser({ password:newPassword }); if (!error) setNewPassword(''); showToast(error?'Failed to update password':'Password updated!') }}>Update</BtnAccent>
                        </div>
                      </div>
                    </div>
                  </Card>
                  <div style={{ background:'rgba(224,48,48,0.04)', border:'1px solid rgba(224,48,48,0.15)', borderRadius:14, padding:22 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:'#e03030', marginBottom:4 }}>Session</div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginBottom:14 }}>Sign out of your current session on this device.</div>
                    <BtnGhost onClick={handleLogout}>← Log Out</BtnGhost>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Add Button Modal ── */}
      {showAddBtnModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }} onClick={() => setShowAddBtnModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background:'#0d0505', border:'1px solid rgba(255,255,255,0.09)', borderRadius:16, padding:28, width:'100%', maxWidth:420, position:'relative' }}>
            <button onClick={() => setShowAddBtnModal(false)} style={{ position:'absolute', top:16, right:16, background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', padding:4 }}><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
            <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:18, fontWeight:700, marginBottom:4 }}>Custom <span style={{ color:'#e03030' }}>Button</span></h2>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:20 }}>Create a call-to-action button on your profile</p>
            <div style={{ marginBottom:14 }}><label style={{ fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.04em', display:'block', marginBottom:6 }}>Button Label</label><Input placeholder="e.g. Hire Me, Buy Now…" value={newBtnLabel} onChange={e => setNewBtnLabel(e.target.value)} /></div>
            <div style={{ marginBottom:20 }}><label style={{ fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.04em', display:'block', marginBottom:6 }}>URL</label><Input type="url" placeholder="https://…" value={newBtnUrl} onChange={e => setNewBtnUrl(e.target.value)} onKeyDown={e => e.key==='Enter'&&addButton()} /></div>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}><BtnGhost onClick={() => setShowAddBtnModal(false)}>Cancel</BtnGhost><BtnAccent onClick={addButton}>Create Button</BtnAccent></div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toastVisible && (
        <div style={{ position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)', background:'#1a0808', border:'1px solid rgba(224,48,48,0.22)', color:'#fff', fontSize:13, padding:'10px 18px', borderRadius:100, zIndex:2000, display:'flex', alignItems:'center', gap:8, whiteSpace:'nowrap', animation:'toastIn .3s ease' }}>
          <svg width="14" height="14" fill="none" stroke="#e03030" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>
          {toast}
        </div>
      )}
    </div>
  )
}