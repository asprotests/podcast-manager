export function parseYouTubeUrl(url) {
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be') {
      return u.pathname.slice(1)
    }
    if (u.hostname.includes('youtube.com')) {
      const id = u.searchParams.get('v')
      if (id) return id
      // Shorts
      if (u.pathname.startsWith('/shorts/')) {
        return u.pathname.split('/')[2]
      }
    }
    return null
  } catch {
    return null
  }
}

export async function fetchOEmbed(url) {
  try {
    const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    const res = await fetch(endpoint)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}