// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { ConnectWallet } from '@/components/ConnectWallet'

const DESKTOP = { COLS: 5, COL_WIDTH: 269.8, GAP: 50, PAD: 50 }
const MOBILE  = { COLS: 2, COL_WIDTH: 160,   GAP: 12, PAD: 16 }

export default function Gallery() {
  const [items, setItems] = useState<any[]>([])
  const [gridHeight, setGridHeight] = useState(0)
  const [viewers, setViewers] = useState(9)
  const [selected, setSelected] = useState<any>(null)
  const [description, setDescription] = useState('')
  const [descLoading, setDescLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const { COLS, COL_WIDTH, GAP, PAD } = isMobile ? MOBILE : DESKTOP

  useEffect(() => {
    const iv = setInterval(() => setViewers(v => Math.max(4, Math.min(24, v + (Math.random() > 0.5 ? 1 : -1)))), 4000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    fetch('/api/random?count=20').then(r => r.json()).then(async (artworks) => {
      const colHeights = Array(COLS).fill(PAD)
      const loaded = await Promise.all(artworks.map((a: any) => new Promise(resolve => {
        const img = new window.Image()
        img.onload = () => resolve({ ...a, x: 0, y: 0, h: (COL_WIDTH / img.naturalWidth) * img.naturalHeight })
        img.onerror = () => resolve({ ...a, x: 0, y: 0, h: COL_WIDTH })
        img.src = a.imageUrl
      })))
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
  }, [COLS, COL_WIDTH, GAP, PAD])

  const openArtwork = async (artwork) => {
    setSelected(artwork)
    setDescription('')
    setDescLoading(true)
    document.body.style.overflow = 'hidden'
    try {
      const res = await fetch('/api/describe?title=' + encodeURIComponent(artwork.title) + '&artist=' + encodeURIComponent(artwork.artist) + '&year=' + encodeURIComponent(artwork.year))
      const data = await res.json()
      setDescription(data.description)
    } catch { setDescription('No description available.') }
    setDescLoading(false)
  }

  const closeArtwork = () => { setSelected(null); document.body.style.overflow = '' }

  const Nav = () => (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500, display: 'flex', alignItems: 'center', height: '3.25rem', padding: '0 30px', gap: '24px', backdropFilter: 'blur(12px)', background: 'rgba(255,255,255,0.75)', borderBottom: '0.5px solid #ebebeb' }}>
      <span style={{ fontSize: 13, color: '#1a1a1a' }}>gallery</span>
      <div style={{ marginLeft: 'auto' }}><ConnectWallet /></div>
    </nav>
  )

  if (selected) return (
    <div style={{ background: '#fff', height: '100vh', overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif', color: '#1a1a1a' }}>
      <Nav />
      <button onClick={closeArtwork} style={{ position: 'fixed', top: '4.5rem', left: 20, zIndex: 100, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#555', padding: '4px 8px' }}>←</button>

      {/* MOBILE detail view: stacked */}
      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', paddingTop: '3.25rem', overflowY: 'auto' }}>
          <div style={{ width: '100%', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 16px 16px' }}>
            <img src={selected.imageUrl} alt={selected.title} style={{ maxWidth: '100%', maxHeight: '60vw', objectFit: 'contain', display: 'block' }} />
          </div>
          <div style={{ padding: '16px 20px 40px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 500, lineHeight: 1.15, margin: '0 0 0.5em 0', color: '#1a1a1a' }}>{selected.title}</h2>
            <p style={{ fontSize: 14, color: '#444', margin: '0 0 0.25em 0', fontWeight: 400 }}>{selected.artist}</p>
            <p style={{ fontSize: 13, color: '#999', margin: '0 0 1em 0', fontWeight: 300 }}>{selected.year}</p>
            <p style={{ fontSize: '0.82rem', lineHeight: 1.7, margin: '0.5rem 0 0 0', color: descLoading ? '#aaa' : '#555', fontStyle: descLoading ? 'italic' : 'normal', fontWeight: 300 }}>
              {descLoading ? 'Description loading...' : description}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#999', margin: '0.75rem 0 1.5rem 0' }}>
              Source: <a href={'https://www.moma.org/collection/works/' + selected.id} target="_blank" style={{ color: '#666', textDecoration: 'none', borderBottom: '1px solid #ddd' }}>MoMA Collection</a>
            </p>
          </div>
        </div>
      ) : (
        /* DESKTOP detail view: unchanged */
        <div style={{ display: 'flex', height: '100vh', paddingTop: '3.25rem' }}>
          <div style={{ flex: '0 0 60%', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fff', overflow: 'hidden' }}>
            <img src={selected.imageUrl} alt={selected.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }} />
          </div>
          <div style={{ flex: '0 0 35%', display: 'flex', flexDirection: 'column', padding: '52px 48px 40px 32px', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 500, lineHeight: 1.15, margin: '0 0 0.5em 0', color: '#1a1a1a' }}>{selected.title}</h2>
            <p style={{ fontSize: 14, color: '#444', margin: '0 0 0.25em 0', fontWeight: 400 }}>{selected.artist}</p>
            <p style={{ fontSize: 13, color: '#999', margin: '0 0 1em 0', fontWeight: 300 }}>{selected.year}</p>
            <p style={{ fontSize: '0.82rem', lineHeight: 1.7, margin: '0.5rem 0 0 0', color: descLoading ? '#aaa' : '#555', fontStyle: descLoading ? 'italic' : 'normal', fontWeight: 300 }}>
              {descLoading ? 'Description loading...' : description}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#999', margin: '0.75rem 0 1.5rem 0' }}>
              Source: <a href={'https://www.moma.org/collection/works/' + selected.id} target="_blank" style={{ color: '#666', textDecoration: 'none', borderBottom: '1px solid #ddd' }}>MoMA Collection</a>
            </p>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Nav />
      <div style={{ paddingTop: '3.25rem' }}>
        <div style={{ padding: isMobile ? '16px 16px 12px' : '24px 50px 16px' }}>
          <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>MoMA</h1>
          <p style={{ fontSize: 14, color: '#999', margin: 0 }}>Explore MoMA art in the Base app</p>
        </div>
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