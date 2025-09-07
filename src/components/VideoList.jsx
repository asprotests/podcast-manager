import React, { useMemo } from 'react'

function DraggableItem({ video, active, onActivate, onRemove, onDragStart, onDragOver, onDrop }) {
  function confirmRemove() {
    if (window.confirm(`Are you sure you want to remove "${video.title}"?`)) {
      onRemove(video.id)
    }
  }

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, video)}
      onDragOver={e => onDragOver(e, video)}
      onDrop={e => onDrop(e, video)}
      className={`flex items-center gap-3 p-3 rounded-xl border ${active ? 'border-slate-900 bg-slate-50' : 'border-slate-200'} hover:bg-slate-50 transition`}
    >
      <img src={video.thumbnail} alt="" className="w-16 h-10 rounded object-cover" />
      <div className="min-w-0 flex-1">
        <div className="font-medium truncate">{video.title}</div>
        <div className="text-xs text-slate-500 truncate">{video.author}</div>
      </div>
      <button onClick={() => onActivate(video.id)} className="btn btn-ghost">Play</button>
      <button onClick={confirmRemove} className="btn">Remove</button>
    </div>
  )
}

export default function VideoList({ items, activeId, onActivate, onRemove, onReorder }) {
  const [dragging, setDragging] = React.useState(null)

  function handleDragStart(e, video) {
    setDragging(video)
    e.dataTransfer.effectAllowed = 'move'
  }
  function handleDragOver(e, overVideo) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }
  function handleDrop(e, targetVideo) {
    e.preventDefault()
    if (!dragging || dragging.id === targetVideo.id) return
    const newItems = [...items]
    const from = newItems.findIndex(v => v.id === dragging.id)
    const to = newItems.findIndex(v => v.id === targetVideo.id)
    newItems.splice(to, 0, newItems.splice(from, 1)[0])
    onReorder(newItems)
    setDragging(null)
  }

  const empty = useMemo(() => items.length === 0, [items])

  if (empty) return <p className="text-slate-500">No videos yet.</p>

  return (
    <div className="space-y-3">
      {items.map(v => (
        <DraggableItem
          key={v.id}
          video={v}
          active={v.id === activeId}
          onActivate={onActivate}
          onRemove={onRemove}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
      ))}
    </div>
  )
}