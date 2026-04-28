'use client'
import { useState, useRef } from 'react'

// ─── Widget Definitions ────────────────────────────────────────────────────────
const WIDGET_DEFS = [
  {
    id: 'valorant',
    name: 'VALORANT',
    desc: 'Show your current rank, RR and level',
    color: '#FF4655',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l2 10 8 5 8-5 2-10L12 2z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M8 9l4 7 4-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    fields: [
      { key: 'riotId', label: 'Riot ID', placeholder: 'Name#TAG' },
      { key: 'region', label: 'Region', type: 'select', options: ['NA', 'EU', 'AP', 'KR', 'BR', 'LATAM'] },
    ],
    preview: (cfg) => (
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:40, height:40, borderRadius:10, background:'rgba(255,70,85,0.15)', border:'1px solid rgba(255,70,85,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l2 10 8 5 8-5 2-10L12 2z" stroke="#FF4655" strokeWidth="1.5"/><path d="M8 9l4 7 4-7" stroke="#FF4655" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{cfg.riotId || 'Player#0000'}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:2 }}>Unrated · RR 0 · Lvl 1</div>
        </div>
        <span style={{ fontSize:10, fontWeight:700, color:'#FF4655', background:'rgba(255,70,85,0.12)', border:'1px solid rgba(255,70,85,0.25)', padding:'3px 8px', borderRadius:99 }}>VALORANT</span>
      </div>
    ),
  },
  {
    id: 'discord',
    name: 'Discord Presence',
    desc: 'Live status, activity, Spotify (via Lanyard)',
    color: '#5865F2',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.055a19.9 19.9 0 0 0 5.993 3.03.077.077 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
      </svg>
    ),
    fields: [
      { key: 'discordId', label: 'Discord User ID', placeholder: '123456789012345678' },
    ],
    preview: (cfg) => (
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ position:'relative', width:40, height:40, flexShrink:0 }}>
          <div style={{ width:40, height:40, borderRadius:'50%', background:'rgba(88,101,242,0.2)', border:'1px solid rgba(88,101,242,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:'#5865F2' }}>{(cfg.username||'U')[0].toUpperCase()}</div>
          <div style={{ position:'absolute', bottom:0, right:0, width:12, height:12, borderRadius:'50%', background:'#f04747', border:'2px solid #0d0505' }} />
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{cfg.username||'username'}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>{cfg.discordTag||'@handle'}</div>
          <div style={{ fontSize:11, color:'#f04747', marginTop:2, fontWeight:600 }}>Do Not Disturb</div>
        </div>
        <span style={{ fontSize:10, fontWeight:700, color:'#5865F2', background:'rgba(88,101,242,0.12)', border:'1px solid rgba(88,101,242,0.25)', padding:'3px 8px', borderRadius:99 }}>DISCORD</span>
      </div>
    ),
  },
  {
    id: 'roblox',
    name: 'Roblox',
    desc: 'Avatar, display name and bio',
    color: '#e00000',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5.24 3L3 18.76 18.76 21 21 5.24 5.24 3zm9.12 10.9l-3.88-.6.6-3.88 3.88.6-.6 3.88z"/>
      </svg>
    ),
    fields: [
      { key: 'robloxUsername', label: 'Roblox Username', placeholder: 'username' },
    ],
    preview: (cfg) => (
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:40, height:40, borderRadius:10, background:'rgba(224,0,0,0.15)', border:'1px solid rgba(224,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#e00000"><path d="M5.24 3L3 18.76 18.76 21 21 5.24 5.24 3zm9.12 10.9l-3.88-.6.6-3.88 3.88.6-.6 3.88z"/></svg>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{cfg.robloxUsername||'username'}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:1 }}>
            <span style={{ marginRight:10 }}>↑ 9 Followers</span>
            <span>↑ 69 Friends</span>
          </div>
          <div style={{ marginTop:6 }}>
            <a style={{ fontSize:10, fontWeight:600, color:'#e00000', background:'rgba(224,0,0,0.1)', border:'1px solid rgba(224,0,0,0.25)', padding:'3px 9px', borderRadius:6, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:4 }}>View Profile ↗</a>
          </div>
        </div>
        <span style={{ fontSize:10, fontWeight:700, color:'#e00000', background:'rgba(224,0,0,0.12)', border:'1px solid rgba(224,0,0,0.25)', padding:'3px 8px', borderRadius:99 }}>ROBLOX</span>
      </div>
    ),
  },
  {
    id: 'github',
    name: 'GitHub',
    desc: 'Followers, repos and recent activity',
    color: '#c9d1d9',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
      </svg>
    ),
    fields: [
      { key: 'githubUsername', label: 'GitHub Username', placeholder: 'username' },
    ],
    preview: (cfg) => (
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:40, height:40, borderRadius:10, background:'rgba(201,209,217,0.1)', border:'1px solid rgba(201,209,217,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#c9d1d9"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{cfg.githubUsername||'username'}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:1 }}>
            <span style={{ marginRight:10 }}>★ 0 followers</span>
            <span>⌥ 0 repos</span>
          </div>
        </div>
        <span style={{ fontSize:10, fontWeight:700, color:'#c9d1d9', background:'rgba(201,209,217,0.08)', border:'1px solid rgba(201,209,217,0.18)', padding:'3px 8px', borderRadius:99 }}>GITHUB</span>
      </div>
    ),
  },
  {
    id: 'lastfm',
    name: 'Last.fm',
    desc: 'Now playing + recent tracks',
    color: '#d51007',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10.84 17.42l-.9-2.45s-1.46 1.63-3.65 1.63c-1.94 0-3.32-1.69-3.32-4.38 0-3.45 1.74-4.69 3.44-4.69 2.45 0 3.22 1.59 3.87 3.65l.9 2.81c.9 2.73 2.58 4.93 7.44 4.93 3.48 0 5.83-1.07 5.83-3.87 0-2.26-1.29-3.44-3.71-4l-1.79-.39c-1.24-.28-1.6-.77-1.6-1.6 0-.94.74-1.49 1.96-1.49 1.32 0 2.03.49 2.14 1.68l2.74-.33C23.87 7.07 22.57 6 20.01 6c-2.38 0-4.89.9-4.89 4.05 0 1.93.93 3.15 3.27 3.72l1.9.46c1.39.34 1.9.93 1.9 1.77 0 1.06-.98 1.49-2.96 1.49-2.87 0-4.07-1.5-4.77-3.57l-.93-2.83C13.67 7.93 12.11 6 8.47 6 4.58 6 2 8.55 2 12.27c0 3.57 1.87 6.42 5.39 6.42 2.79 0 3.45-1.27 3.45-1.27z"/>
      </svg>
    ),
    fields: [
      { key: 'lastfmUsername', label: 'Last.fm Username', placeholder: 'username' },
    ],
    preview: (cfg) => (
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:40, height:40, borderRadius:10, background:'rgba(213,16,7,0.15)', border:'1px solid rgba(213,16,7,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#d51007"><path d="M10.84 17.42l-.9-2.45s-1.46 1.63-3.65 1.63c-1.94 0-3.32-1.69-3.32-4.38 0-3.45 1.74-4.69 3.44-4.69 2.45 0 3.22 1.59 3.87 3.65l.9 2.81c.9 2.73 2.58 4.93 7.44 4.93 3.48 0 5.83-1.07 5.83-3.87 0-2.26-1.29-3.44-3.71-4l-1.79-.39c-1.24-.28-1.6-.77-1.6-1.6 0-.94.74-1.49 1.96-1.49 1.32 0 2.03.49 2.14 1.68l2.74-.33C23.87 7.07 22.57 6 20.01 6c-2.38 0-4.89.9-4.89 4.05 0 1.93.93 3.15 3.27 3.72l1.9.46c1.39.34 1.9.93 1.9 1.77 0 1.06-.98 1.49-2.96 1.49-2.87 0-4.07-1.5-4.77-3.57l-.93-2.83C13.67 7.93 12.11 6 8.47 6 4.58 6 2 8.55 2 12.27c0 3.57 1.87 6.42 5.39 6.42 2.79 0 3.45-1.27 3.45-1.27z"/></svg>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{cfg.lastfmUsername||'username'}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:1 }}>♪ Scrobbling now…</div>
        </div>
        <span style={{ fontSize:10, fontWeight:700, color:'#d51007', background:'rgba(213,16,7,0.12)', border:'1px solid rgba(213,16,7,0.25)', padding:'3px 8px', borderRadius:99 }}>LAST.FM</span>
      </div>
    ),
  },
  {
    id: 'weather',
    name: 'Weather',
    desc: 'Current conditions for any city',
    color: '#38bdf8',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
      </svg>
    ),
    fields: [
      { key: 'city', label: 'City', placeholder: 'New York' },
      { key: 'units', label: 'Units', type: 'select', options: ['Celsius', 'Fahrenheit'] },
    ],
    preview: (cfg) => (
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:40, height:40, borderRadius:10, background:'rgba(56,189,248,0.15)', border:'1px solid rgba(56,189,248,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.8"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{cfg.city||'New York'}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:1 }}>☁ Cloudy · 18°{cfg.units==='Fahrenheit'?'F':'C'}</div>
        </div>
        <span style={{ fontSize:10, fontWeight:700, color:'#38bdf8', background:'rgba(56,189,248,0.12)', border:'1px solid rgba(56,189,248,0.25)', padding:'3px 8px', borderRadius:99 }}>WEATHER</span>
      </div>
    ),
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    desc: 'Live stats fetched from your TikTok profile',
    color: '#ff0050',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
      </svg>
    ),
    fields: [
      { key: 'tiktokUsername', label: 'TikTok Username', placeholder: '@username' },
    ],
    preview: (cfg) => (
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:40, height:40, borderRadius:10, background:'rgba(255,0,80,0.15)', border:'1px solid rgba(255,0,80,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#ff0050"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{cfg.tiktokUsername||'@username'}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:1 }}>0 followers · 0 likes</div>
        </div>
        <span style={{ fontSize:10, fontWeight:700, color:'#ff0050', background:'rgba(255,0,80,0.12)', border:'1px solid rgba(255,0,80,0.25)', padding:'3px 8px', borderRadius:99 }}>TIKTOK</span>
      </div>
    ),
  },
  {
    id: 'chess',
    name: 'Chess.com',
    desc: 'Ratings across all time controls',
    color: '#81b64c',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 2v2H7v2h2v1H6v2h1l1 2H7l-1 3h1v1H5v2h14v-2h-2v-1h1l-1-3h-1l1-2h1V9h-3V8h2V6h-2V2h-2v1h-2V2H9zm3 3a1 1 0 0 1 0 2 1 1 0 0 1 0-2z"/>
      </svg>
    ),
    fields: [
      { key: 'chessUsername', label: 'Chess.com Username', placeholder: 'username' },
    ],
    preview: (cfg) => (
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:40, height:40, borderRadius:10, background:'rgba(129,182,76,0.15)', border:'1px solid rgba(129,182,76,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#81b64c"><path d="M9 2v2H7v2h2v1H6v2h1l1 2H7l-1 3h1v1H5v2h14v-2h-2v-1h1l-1-3h-1l1-2h1V9h-3V8h2V6h-2V2h-2v1h-2V2H9zm3 3a1 1 0 0 1 0 2 1 1 0 0 1 0-2z"/></svg>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{cfg.chessUsername||'username'}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:1 }}>⚡ Bullet 800 · ⏱ Blitz 900</div>
        </div>
        <span style={{ fontSize:10, fontWeight:700, color:'#81b64c', background:'rgba(129,182,76,0.12)', border:'1px solid rgba(129,182,76,0.25)', padding:'3px 8px', borderRadius:99 }}>CHESS</span>
      </div>
    ),
  },
  {
    id: 'discordserver',
    name: 'Discord Server',
    desc: 'Show member count and invite link',
    color: '#5865F2',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    fields: [
      { key: 'serverId', label: 'Server ID', placeholder: '123456789012345678' },
      { key: 'inviteLink', label: 'Invite Link', placeholder: 'https://discord.gg/...' },
    ],
    preview: (cfg) => (
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:40, height:40, borderRadius:10, background:'rgba(88,101,242,0.15)', border:'1px solid rgba(88,101,242,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5865F2" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>Discord Server</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:1 }}>0 members online</div>
        </div>
        <span style={{ fontSize:10, fontWeight:700, color:'#5865F2', background:'rgba(88,101,242,0.12)', border:'1px solid rgba(88,101,242,0.25)', padding:'3px 8px', borderRadius:99 }}>DISCORD</span>
      </div>
    ),
  },
]

const MAX_WIDGETS = 4

// ─── Configure Modal ───────────────────────────────────────────────────────────
function ConfigureModal({ def, existing, onSave, onClose }) {
  const [cfg, setCfg] = useState(existing?.config || {})
  if (!def) return null
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#0d0505', border:'1px solid rgba(255,255,255,0.1)', borderRadius:16, padding:28, width:400, maxWidth:'95vw', position:'relative' }}>
        <button onClick={onClose} style={{ position:'absolute', top:14, right:14, background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', padding:4 }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
          <div style={{ width:38, height:38, borderRadius:10, background:`${def.color}22`, border:`1px solid ${def.color}44`, display:'flex', alignItems:'center', justifyContent:'center', color:def.color, flexShrink:0 }}>
            {def.icon}
          </div>
          <div>
            <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:16, fontWeight:700, margin:0 }}>Configure <span style={{ color:'#e03030' }}>{def.name}</span></h2>
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.4)', margin:0, marginTop:2 }}>{def.desc}</p>
          </div>
        </div>
        {/* Live Preview */}
        <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:'12px 14px', marginBottom:18 }}>
          {def.preview(cfg)}
        </div>
        {/* Fields */}
        <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:20 }}>
          {def.fields.map(field => (
            <div key={field.key}>
              <label style={{ fontSize:11, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', display:'block', marginBottom:6 }}>{field.label}</label>
              {field.type === 'select' ? (
                <select
                  value={cfg[field.key]||field.options[0]}
                  onChange={e => setCfg(p => ({ ...p, [field.key]:e.target.value }))}
                  style={{ width:'100%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:'11px 14px', fontSize:13, color:'#fff', fontFamily:'Inter, sans-serif', outline:'none', height:44, appearance:'none' }}
                >
                  {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  value={cfg[field.key]||''}
                  onChange={e => setCfg(p => ({ ...p, [field.key]:e.target.value }))}
                  placeholder={field.placeholder}
                  style={{ width:'100%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:'11px 14px', fontSize:13, color:'#fff', fontFamily:'Inter, sans-serif', outline:'none', height:44, boxSizing:'border-box' }}
                />
              )}
            </div>
          ))}
        </div>
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:10, fontSize:13, fontWeight:500, cursor:'pointer', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.03)', color:'rgba(255,255,255,0.5)', fontFamily:'inherit' }}>Cancel</button>
          <button onClick={() => { onSave(def, cfg); onClose() }} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:10, fontSize:13, fontWeight:500, cursor:'pointer', border:'none', background:'#e03030', color:'#fff', fontFamily:'inherit' }}>
            {existing ? 'Update Widget' : '+ Add Widget'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Active Widget Card ────────────────────────────────────────────────────────
function ActiveWidgetCard({ widget, onRemove, onConfigure }) {
  const def = WIDGET_DEFS.find(d => d.id === widget.id)
  if (!def) return null
  return (
    <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, padding:'14px 16px', display:'flex', flexDirection:'column', gap:12, transition:'border-color .15s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'}
      onMouseLeave={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'}
    >
      {def.preview(widget.config || {})}
      <div style={{ display:'flex', gap:8, borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:10 }}>
        <button onClick={() => onConfigure(def, widget)} style={{ flex:1, padding:'7px', borderRadius:8, border:'1px solid rgba(255,255,255,0.07)', background:'rgba(255,255,255,0.03)', color:'rgba(255,255,255,0.5)', fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}
          onMouseEnter={e => { e.currentTarget.style.color='#fff'; e.currentTarget.style.background='rgba(255,255,255,0.06)' }}
          onMouseLeave={e => { e.currentTarget.style.color='rgba(255,255,255,0.5)'; e.currentTarget.style.background='rgba(255,255,255,0.03)' }}
        >Configure</button>
        <button onClick={() => onRemove(widget.id)} style={{ width:32, borderRadius:8, border:'1px solid rgba(255,255,255,0.07)', background:'rgba(255,255,255,0.03)', color:'rgba(255,100,100,0.5)', fontSize:11, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s', flexShrink:0 }}
          onMouseEnter={e => { e.currentTarget.style.color='#ff6464'; e.currentTarget.style.background='rgba(255,50,50,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.color='rgba(255,100,100,0.5)'; e.currentTarget.style.background='rgba(255,255,255,0.03)' }}
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>
      </div>
    </div>
  )
}

// ─── Available Widget Tile ─────────────────────────────────────────────────────
function AvailableTile({ def, isActive, isDisabled, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={isDisabled && !isActive}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', gap:10, padding:'18px 16px', borderRadius:14, border:`1px solid ${isActive?`${def.color}44`:hovered?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.06)'}`, background:isActive?`${def.color}10`:hovered?'rgba(255,255,255,0.03)':'rgba(255,255,255,0.015)', cursor:(isDisabled&&!isActive)?'not-allowed':'pointer', opacity:(isDisabled&&!isActive)?0.4:1, textAlign:'left', fontFamily:'inherit', transition:'all .15s', width:'100%' }}
    >
      <div style={{ width:44, height:44, borderRadius:12, background:`${def.color}20`, border:`1px solid ${def.color}40`, display:'flex', alignItems:'center', justifyContent:'center', color:def.color, flexShrink:0 }}>
        {def.icon}
      </div>
      <div>
        <div style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:3 }}>{def.name}</div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', lineHeight:1.4 }}>{def.desc}</div>
      </div>
      {isActive && (
        <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, fontWeight:700, color:def.color }}>
          <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>
          Added
        </div>
      )}
    </button>
  )
}

// ─── Main Widgets Page ─────────────────────────────────────────────────────────
export default function WidgetsPage({ username, supabase, showToast }) {
  const [activeWidgets, setActiveWidgets] = useState([])
  const [configuringDef, setConfiguringDef] = useState(null)
  const [configuringWidget, setConfiguringWidget] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleOpenConfigure = (def, existingWidget = null) => {
    setConfiguringDef(def)
    setConfiguringWidget(existingWidget)
  }

  const handleSave = (def, cfg) => {
    if (configuringWidget) {
      // update existing
      setActiveWidgets(prev => prev.map(w => w.id === def.id ? { ...w, config: cfg } : w))
    } else {
      // add new
      setActiveWidgets(prev => [...prev, { id: def.id, config: cfg }])
    }
    showToast?.('Widget saved! Remember to save changes.')
  }

  const handleRemove = (id) => {
    setActiveWidgets(prev => prev.filter(w => w.id !== id))
    showToast?.('Widget removed')
  }

  const saveWidgets = async () => {
    setSaving(true)
    try {
      await supabase?.from('users').update({ widgets: activeWidgets }).eq('username', username)
      showToast?.('Widgets saved!')
    } catch (e) {
      showToast?.('Failed to save widgets')
    }
    setSaving(false)
  }

  const isAtMax = activeWidgets.length >= MAX_WIDGETS

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
      <style>{`
        .widget-tile-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
        .widget-active-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
        @media(max-width:900px){ .widget-tile-grid{grid-template-columns:repeat(3,1fr)!important;} .widget-active-grid{grid-template-columns:1fr!important;} }
        @media(max-width:600px){ .widget-tile-grid{grid-template-columns:repeat(2,1fr)!important;} }
      `}</style>

      {/* Header */}
      <div>
        <div style={{ fontSize:11, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', marginBottom:8 }}>Dashboard · Widgets</div>
        <h1 style={{ fontSize:22, fontWeight:700, margin:'0 0 4px', fontFamily:'Syne, sans-serif' }}>Profile <span style={{ color:'#e03030' }}>Widgets</span></h1>
        <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)' }}>Add live widgets to your profile page</p>
      </div>

      {/* Your Widgets */}
      <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16, overflow:'hidden' }}>
        <div style={{ padding:'18px 22px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:12, background:'rgba(224,48,48,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="20" height="20" fill="none" stroke="#e03030" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            </div>
            <div>
              <div style={{ fontSize:15, fontWeight:600, color:'#fff' }}>Your Widgets</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginTop:2 }}>Toggle or remove widgets. Up to {MAX_WIDGETS} total ({activeWidgets.length}/{MAX_WIDGETS} used)</div>
            </div>
          </div>
          {activeWidgets.length > 0 && (
            <button onClick={saveWidgets} disabled={saving} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:10, fontSize:13, fontWeight:500, cursor:saving?'not-allowed':'pointer', border:'none', background:saving?'rgba(224,48,48,0.4)':'#e03030', color:'#fff', fontFamily:'inherit', opacity:saving?0.6:1, flexShrink:0 }}>
              {saving ? 'Saving…' : 'Save Widgets'}
            </button>
          )}
        </div>
        <div style={{ padding:'20px 22px' }}>
          {activeWidgets.length === 0 ? (
            <div style={{ padding:'32px 0', textAlign:'center', border:'1px dashed rgba(255,255,255,0.07)', borderRadius:12 }}>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.25)' }}>No widgets added yet. Pick one below to get started.</div>
            </div>
          ) : (
            <div className="widget-active-grid">
              {activeWidgets.map(w => (
                <ActiveWidgetCard key={w.id} widget={w} onRemove={handleRemove} onConfigure={handleOpenConfigure} />
              ))}
            </div>
          )}
          {isAtMax && (
            <div style={{ marginTop:14, display:'flex', alignItems:'center', gap:8, fontSize:12, color:'rgba(245,158,11,0.8)', background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.18)', borderRadius:10, padding:'10px 14px' }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Maximum {MAX_WIDGETS} widgets reached. Remove one to add another.
            </div>
          )}
        </div>
      </div>

      {/* Add Widget */}
      <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16, overflow:'hidden' }}>
        <div style={{ padding:'18px 22px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:38, height:38, borderRadius:12, background:'rgba(224,48,48,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="20" height="20" fill="none" stroke="#e03030" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          </div>
          <div>
            <div style={{ fontSize:15, fontWeight:600, color:'#fff' }}>Add Widget</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginTop:2 }}>Click a widget to configure it</div>
          </div>
        </div>
        <div style={{ padding:'20px 22px' }}>
          <div className="widget-tile-grid">
            {WIDGET_DEFS.map(def => {
              const isActive = activeWidgets.some(w => w.id === def.id)
              return (
                <AvailableTile
                  key={def.id}
                  def={def}
                  isActive={isActive}
                  isDisabled={isAtMax && !isActive}
                  onClick={() => handleOpenConfigure(def, isActive ? activeWidgets.find(w => w.id === def.id) : null)}
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* Configure Modal */}
      {configuringDef && (
        <ConfigureModal
          def={configuringDef}
          existing={configuringWidget}
          onSave={handleSave}
          onClose={() => { setConfiguringDef(null); setConfiguringWidget(null) }}
        />
      )}
    </div>
  )
}