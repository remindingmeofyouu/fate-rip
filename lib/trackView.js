import { supabase } from './supabase'

async function hashString(str) {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function trackView(username) {
  if (!username) return
  try {
    // Use a fingerprint based on browser info instead of IP
    const raw = navigator.userAgent + screen.width + screen.height + navigator.language + username
    const hash = await hashString(raw)
    
    await supabase
      .from('profile_views')
      .upsert({ username, ip_hash: hash }, { onConflict: 'username,ip_hash', ignoreDuplicates: true })
  } catch (e) {
    console.error('trackView error:', e)
  }
}