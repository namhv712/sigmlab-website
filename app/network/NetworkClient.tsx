'use client'

import { useEffect, useRef, useState, useMemo } from 'react'

type Topic = { key: string; count: number }
type Node = {
  id: string
  name: string
  papers: number
  first_year: number | null
  last_year: number | null
  topics: Topic[]
  primary_topic: string
  avatar: string
  // simulation state
  x?: number; y?: number; vx?: number; vy?: number
}
type Link = {
  source: string
  target: string
  weight: number
  first_year: number | null
  last_year: number | null
  topics: Topic[]
  primary_topic: string
}
type NetworkData = {
  nodes: Node[]
  links: Link[]
  topics: { key: string; color: string }[]
}

const TOPIC_FALLBACK = '#7CD2FF'

export default function NetworkClient() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const dataRef = useRef<NetworkData | null>(null)
  const transformRef = useRef({ k: 1, x: 0, y: 0 })
  const draggingRef = useRef<{ node: Node | null; offsetX: number; offsetY: number; startX: number; startY: number; moved: boolean } | null>(null)
  const hoverRef = useRef<{ node: Node | null }>({ node: null })
  const panRef = useRef<{ x: number; y: number } | null>(null)
  const alphaRef = useRef(1.0)
  const imagesRef = useRef<Map<string, HTMLImageElement | null>>(new Map())
  const reheatRef = useRef<() => void>(() => {})

  const [data, setData] = useState<NetworkData | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [yearMin, setYearMin] = useState(2005)
  const [activeTopics, setActiveTopics] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')

  // Load data
  useEffect(() => {
    fetch('/papers/network.json')
      .then(r => r.json())
      .then((d: NetworkData) => {
        const N = d.nodes.length
        d.nodes.forEach((n, i) => {
          // Initial positions: cluster by primary topic, with some randomness
          const a = (i / N) * Math.PI * 2
          const r = 220 + Math.random() * 80
          n.x = Math.cos(a) * r
          n.y = Math.sin(a) * r
          n.vx = 0; n.vy = 0
        })
        // Pre-load avatars
        d.nodes.forEach(n => {
          if (!n.avatar) { imagesRef.current.set(n.id, null); return }
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.src = n.avatar
          img.onload = () => imagesRef.current.set(n.id, img)
          img.onerror = () => imagesRef.current.set(n.id, null)
          imagesRef.current.set(n.id, img)
        })
        dataRef.current = d
        setData(d)
      })
  }, [])

  const topicColor = useMemo(() => {
    const m = new Map<string, string>()
    data?.topics.forEach(t => m.set(t.key, t.color))
    return (k: string) => m.get(k) || TOPIC_FALLBACK
  }, [data])

  // Force simulation + render loop
  useEffect(() => {
    if (!data) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let raf = 0

    const resize = () => {
      const wrap = wrapRef.current; if (!wrap) return
      const rect = wrap.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const onResize = () => resize()
    window.addEventListener('resize', onResize)

    // Reheat the simulation when filter changes
    reheatRef.current = () => { alphaRef.current = 0.6 }

    const byId = new Map<string, Node>()
    data.nodes.forEach(n => byId.set(n.id, n))

    const visibleLink = (l: Link) => {
      if (l.last_year && l.last_year < yearMin) return false
      if (activeTopics.size > 0 && !activeTopics.has(l.primary_topic)) return false
      if (selectedId && l.source !== selectedId && l.target !== selectedId) return false
      return true
    }
    const visibleNode = (n: Node) => {
      if (n.last_year && n.last_year < yearMin) return false
      if (activeTopics.size > 0 && !activeTopics.has(n.primary_topic)) return false
      if (search && !n.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    }

    function step() {
      const alpha = alphaRef.current
      if (alpha < 0.005 && !draggingRef.current?.node) return  // settled
      const nodes = data!.nodes
      const links = data!.links

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]
        if (!visibleNode(a)) continue
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]
          if (!visibleNode(b)) continue
          const dx = b.x! - a.x!
          const dy = b.y! - a.y!
          const d2 = dx * dx + dy * dy + 0.001
          const d = Math.sqrt(d2)
          // only repel when too close
          const minDist = 70
          if (d < minDist * 4) {
            const f = (minDist * minDist * 6) / d2
            const fx = (dx / d) * f
            const fy = (dy / d) * f
            a.vx! -= fx; a.vy! -= fy
            b.vx! += fx; b.vy! += fy
          }
        }
        a.vx! += -a.x! * 0.025
        a.vy! += -a.y! * 0.025
      }
      for (const l of links) {
        if (!visibleLink(l)) continue
        const a = byId.get(l.source as string)
        const b = byId.get(l.target as string)
        if (!a || !b) continue
        const dx = b.x! - a.x!
        const dy = b.y! - a.y!
        const d = Math.sqrt(dx * dx + dy * dy + 0.001)
        const target = 90 + 220 / Math.sqrt(l.weight)
        const f = (d - target) * 0.06 * Math.min(1, Math.log10(l.weight + 1) / 1.5)
        const fx = (dx / d) * f
        const fy = (dy / d) * f
        a.vx! += fx; a.vy! += fy
        b.vx! -= fx; b.vy! -= fy
      }
      let totalKE = 0
      for (const n of nodes) {
        const dragging = draggingRef.current && draggingRef.current.node === n
        if (dragging) { n.vx = 0; n.vy = 0; continue }
        n.vx! *= 0.78
        n.vy! *= 0.78
        n.x! += n.vx! * alpha
        n.y! += n.vy! * alpha
        totalKE += n.vx! * n.vx! + n.vy! * n.vy!
      }
      // Cool down: alpha decays, faster when system is settled
      const settledFactor = totalKE < 0.5 ? 0.92 : 0.985
      alphaRef.current = Math.max(0, alpha * settledFactor)
      if (alphaRef.current < 0.003) alphaRef.current = 0
    }

    function render() {
      const w = canvas!.clientWidth, h = canvas!.clientHeight
      ctx.clearRect(0, 0, w, h)
      const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) / 1.4)
      bg.addColorStop(0, '#0b0d18')
      bg.addColorStop(1, '#04060c')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)

      const t = transformRef.current
      ctx.save()
      ctx.translate(w / 2 + t.x, h / 2 + t.y)
      ctx.scale(t.k, t.k)

      // Edges first (under nodes) — draw heaviest last so they sit on top
      ctx.lineCap = 'round'
      const nowYear = new Date().getFullYear()
      const maxWeight = data!.links.reduce((m, l) => Math.max(m, l.weight), 1)
      const sortedLinks = [...data!.links].sort((a, b) => a.weight - b.weight)
      for (const l of sortedLinks) {
        if (!visibleLink(l)) continue
        const a = byId.get(l.source as string)
        const b = byId.get(l.target as string)
        if (!a || !b) continue
        const recency = l.last_year ? Math.max(0, 1 - (nowYear - l.last_year) / 12) : 0.25
        const wNorm = l.weight / maxWeight                    // 0..1
        const wStrong = Math.pow(wNorm, 0.55)                 // boost low-mid range
        // Thickness scales with sqrt(weight) — much more visible than log
        const lw = 1 + Math.sqrt(l.weight) * 1.6
        // Vibrancy: thin/old edges fade out, thick/recent edges saturate
        const baseAlpha = Math.min(1, 0.10 + 0.55 * wStrong + 0.45 * recency)
        const cA = topicColor(a.primary_topic)
        const cB = topicColor(b.primary_topic)
        // Heaviest edges punch through with a brighter inner core
        if (wNorm > 0.25) {
          ctx.strokeStyle = withAlpha('#ffffff', 0.18 * wStrong)
          ctx.lineWidth = lw + 2.5
          ctx.shadowColor = topicColor(l.primary_topic)
          ctx.shadowBlur = 22 * wStrong
          ctx.beginPath()
          edgePath(ctx, a, b)
          ctx.stroke()
        }
        const grad = ctx.createLinearGradient(a.x!, a.y!, b.x!, b.y!)
        grad.addColorStop(0, withAlpha(cA, baseAlpha))
        grad.addColorStop(1, withAlpha(cB, baseAlpha))
        ctx.strokeStyle = grad
        ctx.lineWidth = lw
        ctx.shadowColor = topicColor(l.primary_topic)
        ctx.shadowBlur = 6 + 18 * wStrong * (0.5 + 0.5 * recency)
        ctx.beginPath()
        edgePath(ctx, a, b)
        ctx.stroke()
      }
      ctx.shadowBlur = 0

      // Nodes
      for (const n of data!.nodes) {
        if (!visibleNode(n)) continue
        const r = 12 + Math.sqrt(n.papers) * 1.8
        const c = topicColor(n.primary_topic)
        const isSel = selectedId === n.id
        const isHov = hoverRef.current.node?.id === n.id

        // outer glow
        const g = ctx.createRadialGradient(n.x!, n.y!, 0, n.x!, n.y!, r * 2.2)
        g.addColorStop(0, withAlpha(c, isSel || isHov ? 0.7 : 0.45))
        g.addColorStop(1, withAlpha(c, 0))
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(n.x!, n.y!, r * 2.2, 0, Math.PI * 2)
        ctx.fill()

        // ring
        ctx.beginPath()
        ctx.arc(n.x!, n.y!, r, 0, Math.PI * 2)
        ctx.fillStyle = '#0b0d18'
        ctx.fill()

        // avatar (clipped) or color disc
        const img = imagesRef.current.get(n.id)
        if (img && img.complete && img.naturalWidth > 0) {
          ctx.save()
          ctx.beginPath()
          ctx.arc(n.x!, n.y!, r - 1.5, 0, Math.PI * 2)
          ctx.clip()
          // cover-fit
          const ar = img.naturalWidth / img.naturalHeight
          const dw = ar >= 1 ? 2 * r : 2 * r * ar
          const dh = ar >= 1 ? 2 * r / ar : 2 * r
          // make square cover
          const size = 2 * r * (ar >= 1 ? 1 / Math.min(ar, 1) : ar)
          const dim = Math.max(dw, dh)
          ctx.drawImage(img, n.x! - dim / 2, n.y! - dim / 2, dim, dim)
          ctx.restore()
          void size
        } else {
          ctx.fillStyle = c
          ctx.beginPath()
          ctx.arc(n.x!, n.y!, r - 1.5, 0, Math.PI * 2)
          ctx.fill()
        }

        // colored ring outline
        ctx.beginPath()
        ctx.arc(n.x!, n.y!, r, 0, Math.PI * 2)
        ctx.lineWidth = isSel ? 3 : (isHov ? 2.4 : 1.8)
        ctx.strokeStyle = isSel ? '#fff' : c
        ctx.shadowColor = c
        ctx.shadowBlur = isSel || isHov ? 18 : 6
        ctx.stroke()
        ctx.shadowBlur = 0

        if (n.papers >= 30 || isSel || isHov) {
          ctx.font = '600 12px Inter, system-ui, sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'top'
          ctx.fillStyle = 'rgba(255,255,255,0.92)'
          ctx.shadowColor = '#000'
          ctx.shadowBlur = 6
          ctx.fillText(n.name, n.x!, n.y! + r + 6)
          ctx.shadowBlur = 0
        }
      }

      ctx.restore()
    }

    function frame() {
      step()
      render()
      raf = requestAnimationFrame(frame)
    }
    frame()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [data, yearMin, activeTopics, selectedId, search, topicColor])

  // Reheat when filters change
  useEffect(() => { reheatRef.current() }, [yearMin, activeTopics, search, selectedId])

  // Pointer interactions
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !data) return

    const toLocal = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const cx = (rect.width / 2) + transformRef.current.x
      const cy = (rect.height / 2) + transformRef.current.y
      return {
        x: (e.clientX - rect.left - cx) / transformRef.current.k,
        y: (e.clientY - rect.top - cy) / transformRef.current.k,
      }
    }
    const findNode = (lx: number, ly: number): Node | null => {
      let best: Node | null = null
      let bestD = Infinity
      for (const n of data.nodes) {
        const r = 12 + Math.sqrt(n.papers) * 1.8
        const dx = (n.x ?? 0) - lx
        const dy = (n.y ?? 0) - ly
        const d2 = dx * dx + dy * dy
        if (d2 < (r + 4) * (r + 4) && d2 < bestD) { best = n; bestD = d2 }
      }
      return best
    }

    const onDown = (e: PointerEvent) => {
      const p = toLocal(e)
      const n = findNode(p.x, p.y)
      if (n) {
        draggingRef.current = {
          node: n, offsetX: (n.x ?? 0) - p.x, offsetY: (n.y ?? 0) - p.y,
          startX: e.clientX, startY: e.clientY, moved: false,
        }
        alphaRef.current = 0.4
      } else {
        panRef.current = { x: e.clientX, y: e.clientY }
      }
    }
    const onMove = (e: PointerEvent) => {
      const p = toLocal(e)
      const drag = draggingRef.current
      if (drag && drag.node) {
        const dxs = e.clientX - drag.startX
        const dys = e.clientY - drag.startY
        if (Math.abs(dxs) > 3 || Math.abs(dys) > 3) drag.moved = true
        drag.node.x = p.x + drag.offsetX
        drag.node.y = p.y + drag.offsetY
        alphaRef.current = Math.max(alphaRef.current, 0.3)
      } else if (panRef.current) {
        const dx = e.clientX - panRef.current.x
        const dy = e.clientY - panRef.current.y
        transformRef.current.x += dx
        transformRef.current.y += dy
        panRef.current = { x: e.clientX, y: e.clientY }
      } else {
        const n = findNode(p.x, p.y)
        hoverRef.current.node = n
        canvas.style.cursor = n ? 'pointer' : 'grab'
      }
    }
    const onUp = () => {
      const drag = draggingRef.current
      if (drag && drag.node && !drag.moved) {
        // it was a click, not a drag
        const id = drag.node.id
        setSelectedId(prev => prev === id ? null : id)
      }
      draggingRef.current = null
      panRef.current = null
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const factor = Math.exp(-e.deltaY * 0.0015)
      transformRef.current.k = Math.min(3, Math.max(0.3, transformRef.current.k * factor))
    }

    canvas.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.style.cursor = 'grab'
    return () => {
      canvas.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('wheel', onWheel)
    }
  }, [data])

  const selectedNode = useMemo(() => {
    if (!data || !selectedId) return null
    return data.nodes.find(n => n.id === selectedId) || null
  }, [data, selectedId])

  const selectedConnections = useMemo(() => {
    if (!data || !selectedNode) return []
    const list: { other: Node; link: Link }[] = []
    for (const l of data.links) {
      if (l.source === selectedNode.id || l.target === selectedNode.id) {
        const otherId = l.source === selectedNode.id ? l.target : l.source
        const other = data.nodes.find(n => n.id === otherId)
        if (other) list.push({ other, link: l })
      }
    }
    list.sort((a, b) => b.link.weight - a.link.weight)
    return list
  }, [data, selectedNode])

  if (!data) return (
    <div className="min-h-screen bg-[#04060c] text-white grid place-items-center">
      <div className="opacity-70">Loading collaboration network…</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#04060c] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Collaboration Network</h1>
        <p className="mt-2 text-white/60 text-sm">
          {data.nodes.length} researchers · {data.links.length} co-authorship edges. Edge thickness = number of joint
          papers; brightness = recency; color = primary topic. Drag a node to reposition, scroll to zoom, click to focus.
        </p>
      </div>

      <div ref={wrapRef} className="relative h-[72vh] mx-auto max-w-7xl border-y border-white/10">
        <canvas ref={canvasRef} className="block w-full h-full" />

        <div className="absolute left-4 top-4 flex flex-col gap-3 max-w-[260px] z-10">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search researcher…"
            className="bg-white/5 backdrop-blur border border-white/15 rounded-lg px-3 py-2 text-sm placeholder:text-white/40 focus:outline-none focus:border-cyan-400/60"
          />
          <div className="bg-white/5 backdrop-blur border border-white/15 rounded-lg p-3 text-xs">
            <div className="flex justify-between text-white/70">
              <span>Active since</span>
              <span className="font-mono">{yearMin}</span>
            </div>
            <input
              type="range"
              min={2005}
              max={2025}
              value={yearMin}
              onChange={e => setYearMin(parseInt(e.target.value))}
              className="w-full mt-1 accent-cyan-400"
            />
          </div>
          <div className="bg-white/5 backdrop-blur border border-white/15 rounded-lg p-3 text-xs">
            <div className="text-white/70 mb-2">Topics</div>
            <div className="flex flex-wrap gap-1.5">
              {data.topics.filter(t => t.key !== 'Other').map(t => {
                const active = activeTopics.has(t.key)
                return (
                  <button
                    key={t.key}
                    onClick={() => {
                      const next = new Set(activeTopics)
                      if (next.has(t.key)) next.delete(t.key); else next.add(t.key)
                      setActiveTopics(next)
                    }}
                    className={`px-2 py-1 rounded-md border text-[10px] transition-colors ${
                      active ? 'bg-white/10 border-white/40' : 'border-white/15 hover:border-white/30'
                    }`}
                    style={{ color: t.color }}
                  >
                    {t.key}
                  </button>
                )
              })}
            </div>
            {activeTopics.size > 0 && (
              <button onClick={() => setActiveTopics(new Set())}
                      className="mt-2 text-white/50 hover:text-white text-[10px]">clear</button>
            )}
          </div>
        </div>

        {selectedNode && (
          <div className="absolute right-4 top-4 w-[300px] bg-white/5 backdrop-blur border border-white/15 rounded-lg p-4 text-sm z-10 max-h-[68vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-3">
                {selectedNode.avatar && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedNode.avatar} alt={selectedNode.name}
                       className="w-12 h-12 rounded-full object-cover ring-2"
                       style={{ borderColor: topicColor(selectedNode.primary_topic) }} />
                )}
                <div>
                  <div className="text-base font-semibold">{selectedNode.name}</div>
                  <div className="text-xs text-white/50">
                    {selectedNode.papers} papers · {selectedNode.first_year}–{selectedNode.last_year}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedId(null)} className="text-white/40 hover:text-white">×</button>
            </div>
            <div className="text-xs text-white/60 mb-1">Topics</div>
            <div className="flex flex-wrap gap-1 mb-4">
              {selectedNode.topics.map(t => (
                <span key={t.key} className="px-2 py-0.5 text-[10px] rounded-md border border-white/10"
                      style={{ color: topicColor(t.key) }}>
                  {t.key} <span className="text-white/40">{t.count}</span>
                </span>
              ))}
            </div>
            <div className="text-xs text-white/60 mb-1">Top collaborators</div>
            <ul className="space-y-1">
              {selectedConnections.slice(0, 12).map(({ other, link }) => (
                <li key={other.id}>
                  <button
                    onClick={() => setSelectedId(other.id)}
                    className="w-full text-left flex justify-between items-center px-2 py-1 rounded hover:bg-white/5"
                  >
                    <span className="truncate" style={{ color: topicColor(other.primary_topic) }}>
                      {other.name}
                    </span>
                    <span className="text-[10px] text-white/50 ml-2">
                      {link.weight}× · {link.first_year}–{link.last_year}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-sm">
        <div className="text-white/60 mb-3">Strongest collaborations</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {data.links.slice(0, 9).map((l, i) => {
            const a = data.nodes.find(n => n.id === l.source)
            const b = data.nodes.find(n => n.id === l.target)
            if (!a || !b) return null
            return (
              <button
                key={i}
                onClick={() => setSelectedId(a.id)}
                className="flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: topicColor(l.primary_topic) }} />
                  <span className="truncate">{a.name}</span>
                  <span className="text-white/40">↔</span>
                  <span className="truncate">{b.name}</span>
                </div>
                <div className="text-xs text-white/50 font-mono ml-2">{l.weight}×</div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function edgePath(ctx: CanvasRenderingContext2D, a: Node, b: Node) {
  const mx = (a.x! + b.x!) / 2, my = (a.y! + b.y!) / 2
  const dx = b.x! - a.x!, dy = b.y! - a.y!
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const nx = -dy / len, ny = dx / len
  const off = 22 * (((a.x! * 31 + a.y! * 17) % 7) / 7 - 0.5)
  ctx.moveTo(a.x!, a.y!)
  ctx.quadraticCurveTo(mx + nx * off, my + ny * off, b.x!, b.y!)
}

function withAlpha(hex: string, alpha: number): string {
  if (hex.startsWith('#') && hex.length === 7) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r},${g},${b},${alpha})`
  }
  return hex
}
