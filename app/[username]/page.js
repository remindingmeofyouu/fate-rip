// app/[username]/page.js  ← SERVER COMPONENT (no 'use client')
import { createClient } from '@supabase/supabase-js'
import ProfileClient from './ProfileClient'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function generateMetadata({ params }) {
  const { username } = await params

  const { data } = await supabase
    .from('users')
    .select('username, bio, avatar_url')
    .eq('username', username)
    .single()

  if (!data) {
    return {
      title: 'Profile not found | fate.rip',
    }
  }

  const title = `@${data.username} | fate.rip`
  const description = data.bio || `Check out ${data.username}'s profile on fate.rip`
  const image = data.avatar_url || 'https://fate.rip/scythe.png'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 256, height: 256 }],
      url: `https://fate.rip/${data.username}`,
      siteName: 'fate.rip',
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [image],
    },
  }
}

export default function Page({ params }) {
  return <ProfileClient params={params} />
}