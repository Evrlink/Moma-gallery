'use client'
import { useEffect, useState } from 'react'

const COLS = 5
const COL_WIDTH = 269.8
const GAP = 50
const PAD = 50

export default function Gallery() {
  const [items, setItems] = useState([])
  const [gridHeight, setGridHeight] = useState(0)
  const [viewers, setViewers] = useState(9)
  const [selected, setSelected] = useState(null)
  const [description, setDescription] = useState('')
  const [descLoading, setDescLoading] = useState(false)

  useEffect(() => {
    const iv = setInterval(() => setViewers(v => Math.max(4, Math.min(24, v + (Math.random() > 0.5 ? 1 : -1)))), 4000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    fetch('/api/random?count=20')
      .then(r => r.json())
      .then(async (artworks) => {
        const colHeights = Array(COLS).fill(PAD)
        const loaded = await Promise.all(
          artworks.map(a => new Promise(resolve => {
            const img = new window.Image()
            img.onload = () => resolve({ ...a, x: 0, y: 0, h: (COL_WIDTH / img.naturalWidth) * img.naturalHeight })
            img.onerror = () => resolve({ ...a, x: 0, y: 0, h: COL_WIDTH })
            img.src = a.imageUrl
          }))
        )
        const positioned = loaded.map(item => {
          const col = colHeights.indexOf(Math.min(...colHeights))
          const x = PAD + col * (COL_WIDTH + GAP)
          const y = colHeights[col]
          colHeights[col] += item.h + GAP
          return { ...item, x, y }
        })
        setItems(positioned)
        setGridHeight(Math.max(...colHeights) + PAD)
      })
  }, [])

  const openArtwork = async (artwork) => {
    setSelected(artwork)
    setDescription('')
    setDescLoading(true)
    document.body.style.overflow = 'hidden'
    try {
      const res = await fetch('/api/describe?title=' + encodeURIComponent(artwork.title) + '&artist=' + encodeURIComponent(artwork.artist) + '&year=' + encodeURIComponent(artwork.year))
      const data = await res.json()
      setDescription(data.description)
    } catch {
      setDescription('No description available.')
    }
    setDescLoading(false)
  }

  const closeArtwork = () => {
    setSelected(null)
    document.body.style.overflow = ''
  }

  if (selected) {
    return (
      <div style={{ background: '#fff', height: '100vh', overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500, display: 'flex', alignItems: 'center', height: '3.25rem', padding: '0 30px', gap: '24px', backdropFilter: 'blur(12px)', background: 'rgba(255,255,255,0.75)', borderBottom: '0.5px solid #ebebeb' }}>
          <span style={{ fontSize: 13 }}>gallery</span>
          <span style={{ fontSize: 13, color: '#999' }}>uncovered</span>
          <span style={{ fontSize: 13, color: '#999' }}>curate together</span>
          <div style={{ marginLeft: 'auto', fontSize: 12, color: '#999', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}/>
            {viewers} people viewing
          </div>
        </nav>
        <div style={{ display: 'flex', height: '100vh', paddingTop: '3.25rem' }}>
          <button onClick={closeArtwork} style={{ position: 'fixed', top: '4.5rem', left: 20, zIndex: 100, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#333', padding: '4px 8px' }}>←</button>
          <div style={{ flex: '0 00%', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fff', overflow: 'hidden', padding: '40px' }}>
            <img src={selected.imageUrl} alt={selected.title} style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', display: 'block' }} />
          </div>
          <div style={{ flex: '0 0 40%', padding: '60px 50px 40px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.35, marginBottom: 12, color: '#1a1a1a' }}>{selected.title}</h1>
            <p style={{ fontSize: 14, color: '#444', marginBottom: 4 }}>{selected.artist}</p>
            <p style={{ fontSize: 14, color: '#999', marginBottom: 24 }}>{selected.year}</p>
            <p style={{ fontSize: 14, lineHeight: 1.75, marginBottom: 20, color: descLoading ? '#aaa' : '#333', fontStyle: descLoading ? 'italic' : 'normal' }}>
              {descLoading ? 'Description loading...' : description}
            </p>
            <p style={{ fontSize: 12, color: '#999', marginBottom: 24 }}>
              Source: <a href={'https://www.moma.org/collection/works/' + selected.id} target="_blank" style={{ color: '#555', textDecoration: 'none', borderBottom: '1px solid #ccc' }}>MoMA Collection</a>
            </p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              <button style={{ border: '1px solid #ddd', background: 'none', borderRadius: 20, padding: '6px 16px', fontSize: 13, cursor: 'pointer', color: '#333' }}>Send as postcard</button>
              <button style={{ border: '1px solid #ddd', background: 'none', borderRadius: 20, padding: '6px 16px', fontSize: 13, cursor: 'pointer', color: '#333' }}>Share</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}/>
              <span style={{ fontSize: 12, color: '#999' }}>1 person viewing this</span>
              <button style={{ border: '1px solid #ddd', background: 'none', borderRadius: 20, padding: '4px 12px', fontSize: 12, cursor: 'pointer', color: '#333' }}>Talk to them</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', color: '#1a1a1a' }}>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500, display: 'flex', alignItems: 'center', height: '3.25rem', padding: '0 30px', gap: '24px', backdropFilter: 'blur(12px)', background: 'rgba(255,255,255,0.75)', borderBottom: '0.5px solid #ebebeb' }}>
        <span style={{ fontSize: 13 }}>gallery</span>
        <span style={{ fontSize: 13, color: '#999' }}>uncovered</span>
        <span style={{ fontSize: 13, color: '#999' }}>curate together</span>
        <div style={{ marginLeft: 'auto', fontSize: 12, color: '#999', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}/>
          {viewers} people viewing
        </div>
      </nav>
      <div style={{ paddingTop: '3.25rem' }}>
        <p style={{ padding: '12px 50px 8px', fontSize: 13, color: '#999', fontStyle: 'italic' }}>Come for a stroll through the garden of human creativity...</p>
        <div style={{ position: 'relative', height: gridHeight }}>
          {items.map(item => (
            <div key={item.id} onClick={() => openArtwork(item)} style={{ position: 'absolute', left: item.x, top: item.y, width: COL_WIDTH, overflow: 'hidden', cursor: 'pointer' }}>
              <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
