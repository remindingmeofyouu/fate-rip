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
    const res = await fetch('https://api.ipify.org?format=json')
    const { ip } = await res.json()
    const ipHash = await hashString(ip)
    await supabase
      .from('profile_views')
      .insert({ username, ip_hash: ipHash })
  } catch {}
}