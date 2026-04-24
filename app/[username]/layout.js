import { supabase } from '../../lib/supabase'

export async function generateMetadata({ params }) {
  const { data } = await supabase
    .from('users')
    .select('username, display_name, bio, avatar_url')
    .eq('username', params.username)
    .single()

  if (!data) return { title: 'fate.rip' }

  const name = data.display_name || `@${data.username}`
  const avatar = data.avatar_url || 'https://fate.rip/og-default.png'

  return {
    title: `${name} — fate.rip`,
    description: data.bio || `Check out ${name}'s profile on fate.rip`,
    openGraph: {
      title: name,
      description: data.bio || `Check out ${name}'s profile on fate.rip`,
      images: [{ url: avatar, width: 400, height: 400 }],
      url: `https://fate.rip/${data.username}`,
      siteName: 'fate.rip',
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title: name,
      description: data.bio || `Check out ${name}'s profile on fate.rip`,
      images: [avatar],
    },
  }
}

export default function UsernameLayout({ children }) {
  return <>{children}</>
}