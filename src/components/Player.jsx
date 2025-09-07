import React, { useEffect, useRef } from 'react'

// Ensure the YouTube IFrame API is loaded once
let ytApiPromise
function loadYouTubeAPI() {
  if (window.YT && window.YT.Player) return Promise.resolve()
  if (!ytApiPromise) {
    ytApiPromise = new Promise((resolve) => {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
      window.onYouTubeIframeAPIReady = () => resolve()
    })
  }
  return ytApiPromise
}

function getPositions() {
  try { return JSON.parse(localStorage.getItem('podcasts-plus-positions')) ?? {} } catch { return {} }
}
function setPositions(map) {
  localStorage.setItem('podcasts-plus-positions', JSON.stringify(map))
}

export default function Player({ video }) {
  const mountRef = useRef(null)
  const playerRef = useRef(null)
  const saveTimerRef = useRef(null)

  // Helper to save immediately (used on pause, tab close, unmount, etc.)
  const saveNow = () => {
    try {
      const player = playerRef.current
      if (!player || !video?.id) return
      const t = player.getCurrentTime?.()
      if (typeof t === 'number' && !Number.isNaN(t)) {
        const map = getPositions()
        map[video.id] = t
        setPositions(map)
      }
    } catch {}
  }

  useEffect(() => {
    let cancelled = false
    if (!video?.id) return

    async function init() {
      await loadYouTubeAPI()
      if (cancelled) return

      // Destroy previous player if any
      if (playerRef.current && playerRef.current.destroy) {
        try { playerRef.current.destroy() } catch {}
      }
      mountRef.current.innerHTML = ''

      const div = document.createElement('div')
      div.id = `yt-player-${video.id}-${Date.now()}`
      div.style.width = '100%'
      div.style.height = '100%'
      mountRef.current.appendChild(div)

      playerRef.current = new window.YT.Player(div.id, {
        videoId: video.id,
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: (e) => {
            // Seek to last saved position if available
            const pos = getPositions()[video.id]
            if (typeof pos === 'number' && pos > 5) {
              try { e.target.seekTo(pos, true) } catch {}
            }
            e.target.playVideo?.()
          },
          onStateChange: (e) => {
            const YT = window.YT
            const state = e.data
            const player = e.target

            const clearSave = () => {
              if (saveTimerRef.current) {
                clearInterval(saveTimerRef.current)
                saveTimerRef.current = null
              }
            }
            const startSave = () => {
              clearSave()
              saveTimerRef.current = setInterval(() => {
                // periodic save for robustness
                try {
                  const t = player.getCurrentTime?.()
                  if (typeof t === 'number' && !Number.isNaN(t)) {
                    const map = getPositions()
                    map[video.id] = t
                    setPositions(map)
                  }
                } catch {}
              }, 2000)
            }

            if (state === YT.PlayerState.PLAYING) {
              startSave()
            } else if (state === YT.PlayerState.PAUSED) {
              clearSave()
              saveNow()
            } else if (state === YT.PlayerState.ENDED) {
              clearSave()
              const map = getPositions()
              map[video.id] = 0
              setPositions(map)
            }
          }
        }
      })
    }

    init()

    // Page/tab lifecycle saves
    const onHide = () => saveNow()
    const onBeforeUnload = () => saveNow()
    const onUnload = () => saveNow()

    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', onHide)
    window.addEventListener('beforeunload', onBeforeUnload)
    window.addEventListener('unload', onUnload)

    return () => {
      cancelled = true
      // Save on unmount
      saveNow()
      if (saveTimerRef.current) clearInterval(saveTimerRef.current)
      if (playerRef.current && playerRef.current.destroy) {
        try { playerRef.current.destroy() } catch {}
      }
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', onHide)
      window.removeEventListener('beforeunload', onBeforeUnload)
      window.removeEventListener('unload', onUnload)
    }
  }, [video?.id])

  return (
    <div className="aspect-video w-full max-w-5xl mx-auto rounded-2xl overflow-hidden border border-slate-300 shadow-lg">
      <div ref={mountRef} className="w-full h-full" />
    </div>
  )
}
