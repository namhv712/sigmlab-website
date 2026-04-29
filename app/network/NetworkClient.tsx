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
  const draggingRef = useRef<{ node: Node | null; offsetX: number; offsetY: number } | null>(null)
  const hoverRef = useRef<{ node: Node | null; link: Link | null }>({ node: null, link: null })
  const panRef = useRef<{ x: number; y: number } | null>(null)

  const [data, setData] = useState<NetworkData | null>(null)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [yearMin, setYearMin] = useState(2005)
  const [activeTopics, setActiveTopics] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')

  // Load data
  useEffect(() => {
    fetch('/papers/network.json')
      .then(r => r.json())
      .then((d: NetworkData) => {
        // initial positions: spread on circle
        const N = d.nodes.length
        d.nodes.forEach((n, i) => {
          const a = (i / N) * Math.PI * 2
          const r = 280 + Math.random() * 60
          n.x = Math.cos(a) * r
          n.y = Math.sin(a) * r
          n.vx = 0; n.vy = 0
        })
        dataRef.current = d
        setData(d)
      })
  }, [])

  // Topic color lookup
  const topicColor = useMemo(() => {
    const m = new Map<string, string>()
    data?.topics.forEach(t => m.set(t.key, t.color))
    return (k: string) => m.get(k) || TOPIC_FALLBACK
  }, [data])

  // Force simulation + render loop
  useEffect(() => {
    if (!data) return
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let raf = 0; let alpha = 1.0
    const resize = () => {
      const rect = wrapRef.current!.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const onResize = () => { resize(); render() }
    window.addEventListener('resize', onResize)

    // Build node-by-id lookup
    const byId = new Map<string, Node>()
    data.nodes.forEach(n => byId.set(n.id, n))

    const visibleLink = (l: Link) => {
      if (l.last_year && l.last_year < yearMin) return false
      if (activeTopics.size > 0 && !activeTopics.has(l.primary_topic)) return false
      if (selectedNode && l.source !== selectedNode.id && l.target !== selectedNode.id) return false
      return true
    }
    const visibleNode = (n: Node) => {
      if (n.last_year && n.last_year < yearMin) return false
      if (activeTopics.size > 0 && !activeTopics.has(n.primary_topic)) return false
      if (search && !n.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    }

    function step() {
      const nodes = data!.nodes
      const links = data!.links
      const k = transformRef.current.k

      // Repulsion (Barnes-Hut would be nicer, but N~50 so all-pairs is fine)
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]
        if (!visibleNode(a)) continue
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]
          if (!visibleNode(b)) continue
          const dx = b.x! - a.x!
          const dy = b.y! - a.y!
          const d2 = dx * dx + dy * dy + 0.001
          const f = (3500 * (Math.log10(a.papers + b.papers + 2))) / d2
          const fx = (dx / Math.sqrt(d2)) * f
          const fy = (dy / Math.sqrt(d2)) * f
          a.vx! -= fx; a.vy! -= fy
          b.vx! += fx; b.vy! += fy
        }
        // Center gravity
        a.vx! += -a.x! * 0.02
        a.vy! += -a.y! * 0.02
      }
      // Spring attraction along edges
      for (const l of links) {
        if (!visibleLink(l)) continue
        const a = byId.get(l.source as string)
        const b = byId.get(l.target as string)
        if (!a || !b) continue
        const dx = b.x! - a.x!
        const dy = b.y! - a.y!
        const d = Math.sqrt(dx * dx + dy * dy + 0.001)
        const target = 70 + 240 / Math.sqrt(l.weight)
        const f = (d - target) * 0.04 * Math.min(1, Math.log10(l.weight + 1) / 1.5)
        const fx = (dx / d) * f
        const fy = (dy / d) * f
        a.vx! += fx; a.vy! += fy
        b.vx! -= fx; b.vy! -= fy
      }
      // Integrate
      for (const n of nodes) {
        const dragging = draggingRef.current && draggingRef.current.node === n
        if (dragging) { n.vx = 0; n.vy = 0; continue }
        n.vx! *= 0.85; n.vy! *= 0.85
        n.x! += n.vx! * alpha
        n.y! += n.vy! * alpha
      }
      alpha = Math.max(0.05, alpha * 0.995)
      void k
    }

    function render() {
      const w = canvas.clientWidth, h = canvas.clientHeight
      ctx.clearRect(0, 0, w, h)
      // Bg gradient
      const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) / 1.4)
      bg.addColorStop(0, '#0b0d18')
      bg.addColorStop(1, '#04060c')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)

      const t = transformRef.current
      ctx.save()
      ctx.translate(w / 2 + t.x, h / 2 + t.y)
      ctx.scale(t.k, t.k)

      // Edges
      ctx.lineCap = 'round'
      const nowYear = new Date().getFullYear()
      for (const l of data!.links) {
        if (!visibleLink(l)) continue
        const a = byId.get(l.source as string)!
        const b = byId.get(l.target as string)!
        const recency = l.last_year ? Math.max(0, 1 - (nowYear - l.last_year) / 15) : 0.3
        const baseAlpha = 0.15 + 0.7 * recency
        const lw = Math.min(6, 0.5 + Math.log2(l.weight + 1))
        const grad = ctx.createLinearGradient(a.x!, a.y!, b.x!, b.y!)
        const cA = topicColor(a.primary_topic)
        const cB = topicColor(b.primary_topic)
        grad.addColorStop(0, withAlpha(cA, baseAlpha))
        grad.addColorStop(1, withAlpha(cB, baseAlpha))
        ctx.strokeStyle = grad
        ctx.lineWidth = lw
        ctx.shadowColor = topicColor(l.primary_topic)
        ctx.shadowBlur = 12 * recency
        ctx.beginPath()
        // gentle curve via midpoint perpendicular
        const mx = (a.x! + b.x!) / 2, my = (a.y! + b.y!) / 2
        const dx = b.x! - a.x!, dy = b.y! - a.y!
        const len = Math.sqrt(dx * dx + dy * dy) || 1
        const nx = -dy / len, ny = dx / len
        const off = 18 * Math.sign(((a.x! * 31 + a.y! * 17) % 7) - 3)
        ctx.moveTo(a.x!, a.y!)
        ctx.quadraticCurveTo(mx + nx * off, my + ny * off, b.x!, b.y!)
        ctx.stroke()
      }
      ctx.shadowBlur = 0

      // Nodes
      for (const n of data!.nodes) {
        if (!visibleNode(n)) continue
        const r = 4 + Math.sqrt(n.papers) * 1.6
        const c = topicColor(n.primary_topic)
        // outer glow
        const g = ctx.createRadialGradient(n.x!, n.y!, 0, n.x!, n.y!, r * 2.5)
        g.addColorStop(0, withAlpha(c, 0.55))
        g.addColorStop(1, withAlpha(c, 0))
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(n.x!, n.y!, r * 2.5, 0, Math.PI * 2)
        ctx.fill()
        // core
        ctx.fillStyle = c
        ctx.beginPath()
        ctx.arc(n.x!, n.y!, r, 0, Math.PI * 2)
        ctx.fill()
        // outline (stronger if hovered/selected)
        const isSel = selectedNode?.id === n.id
        const isHov = hoverRef.current.node?.id === n.id
        ctx.strokeStyle = isSel ? '#fff' : (isHov ? '#fff' : 'rgba(255,255,255,0.4)')
        ctx.lineWidth = isSel ? 2.5 : (isHov ? 2 : 1)
        ctx.stroke()
        // label for big nodes
        if (n.papers >= 30 || isSel || isHov) {
          ctx.font = '600 12px Inter, sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'top'
          ctx.fillStyle = 'rgba(255,255,255,0.9)'
          ctx.shadowColor = '#000'
          ctx.shadowBlur = 4
          ctx.fillText(n.name, n.x!, n.y! + r + 4)
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
  }, [data, yearMin, activeTopics, selectedNode, search, topicColor])

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
    const findNode = (lx: number, ly: number) => {
      let best: Node | null = null
      let bestD = Infinity
      for (const n of data.nodes) {
        const r = 4 + Math.sqrt(n.papers) * 1.6
        const d = (n.x! - lx) ** 2 + (n.y! - ly) ** 2
        if (d < (r + 6) ** 2 && d < bestD) { best = n; bestD = d }
      }
      return best
    }

    const onDown = (e: PointerEvent) => {
      const p = toLocal(e)
      const n = findNode(p.x, p.y)
      if (n) {
        draggingRef.current = { node: n, offsetX: n.x! - p.x, offsetY: n.y! - p.y }
      } else {
        panRef.current = { x: e.clientX, y: e.clientY }
      }
    }
    const onMove = (e: PointerEvent) => {
      const p = toLocal(e)
      if (draggingRef.current && draggingRef.current.node) {
        draggingRef.current.node.x = p.x + draggingRef.current.offsetX
        draggingRef.current.node.y = p.y + draggingRef.current.offsetY
      } else if (panRef.current) {
        const dx = e.clientX - panRef.current.x
        const dy = e.clientY - panRef.current.y
        transformRef.current.x += dx
        transformRef.current.y += dy
        panRef.current = { x: e.clientX, y: e.clientY }
      } else {
        const n = findNode(p.x, p.y)
        hoverRef.current.node = n
        canvas.style.cursor = n ? 'pointer' : 'default'
      }
    }
    const onUp = (e: PointerEvent) => {
      if (draggingRef.current && draggingRef.current.node) {
        // treat as click if barely moved
        const p = toLocal(e)
        const moved = Math.hypot(p.x - draggingRef.current.node.x! + draggingRef.current.offsetX,
                                  p.y - draggingRef.current.node.y! + draggingRef.current.offsetY) > 4
        if (!moved) {
          setSelectedNode(prev => prev?.id === draggingRef.current!.node!.id ? null : draggingRef.current!.node!)
        }
      }
      draggingRef.current = null
      panRef.current = null
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const factor = Math.exp(-e.deltaY * 0.0015)
      const next = Math.min(3, Math.max(0.3, transformRef.current.k * factor))
      transformRef.current.k = next
    }

    canvas.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      canvas.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('wheel', onWheel)
    }
  }, [data])

  // Selected node detail / connected list
  const selectedConnections = useMemo(() => {
    if (!data || !selectedNode) return []
    return data.links
      .filter(l => l.source === selectedNode.id || l.target === selectedNode.id)
      .map(l => {
        const otherId = l.source === selectedNode.id ? l.target : l.source
        const other = data.nodes.find(n => n.id === otherId)!
        return { other, link: l }
      })
      .sort((a, b) => b.link.weight - a.link.weight)
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
          papers; brightness = recency; color = primary topic. Drag nodes, scroll to zoom, click to focus.
        </p>
      </div>

      <div ref={wrapRef} className="relative h-[72vh] mx-auto max-w-7xl border-y border-white/10">
        <canvas ref={canvasRef} className="block w-full h-full" />

        {/* Controls overlay */}
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

        {/* Selected node detail */}
        {selectedNode && (
          <div className="absolute right-4 top-4 w-[300px] bg-white/5 backdrop-blur border border-white/15 rounded-lg p-4 text-sm z-10 max-h-[68vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <div className="text-base font-semibold">{selectedNode.name}</div>
                <div className="text-xs text-white/50">
                  {selectedNode.papers} papers · {selectedNode.first_year}–{selectedNode.last_year}
                </div>
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-white/40 hover:text-white">×</button>
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
                    onClick={() => setSelectedNode(other)}
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

      {/* Top-pairs ribbon */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-sm">
        <div className="text-white/60 mb-3">Strongest collaborations</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {data.links.slice(0, 9).map((l, i) => {
            const a = data.nodes.find(n => n.id === l.source)!
            const b = data.nodes.find(n => n.id === l.target)!
            return (
              <button
                key={i}
                onClick={() => setSelectedNode(a)}
                className="flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full" style={{ background: topicColor(l.primary_topic) }} />
                  <span className="truncate">{a.name}</span>
                  <span className="text-white/40">↔</span>
                  <span className="truncate">{b.name}</span>
                </div>
                <div className="text-xs text-white/50 font-mono">{l.weight}×</div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
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
