import React, { useState } from 'react'
import { parseYouTubeUrl, fetchOEmbed } from '../lib/youtube.js'

export default function AddVideoForm({ onAdd }) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleAdd(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const id = parseYouTubeUrl(url)
      if (!id) throw new Error('Invalid YouTube URL')
      const meta = await fetchOEmbed(url)
      const item = {
        id,
        url,
        title: meta?.title ?? 'YouTube Video',
        author: meta?.author_name ?? 'Unknown',
        thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        addedAt: Date.now()
      }
      onAdd(item)
      setUrl('')
    } catch (err) {
      setError(err.message || 'Failed to add video')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-3">
      <input
        type="url"
        required
        value={url}
        onChange={e => setUrl(e.target.value)}
        placeholder="Paste a YouTube link (watch, youtu.be, or Shorts)"
        className="input flex-1"
      />
      <button className="btn btn-primary" disabled={loading}>{loading ? 'Adding...' : 'Add'}</button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  )
}