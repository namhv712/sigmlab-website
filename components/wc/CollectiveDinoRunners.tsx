'use client'

import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react'
import { DINO_GROUP_SIZE, DINO_LEGEND_SIZE, dinoTallyFromRows } from '@/lib/wcDinos'
import { getLeaderboard } from '@/lib/wcApi'
import type { LeaderRow } from '@/lib/wcTypes'

type Species = 'raptor' | 'trex'

interface Runner {
  id: string
  species: Species
  weight: number
  trackIndex: number
  size: number
  speed: number
  offset: number
  reverse: boolean
  fallHeight: number
  fallMs: number
  fallDelay: number
  spawnRatio: number
}

interface GroundTrack {
  id: string
  x1: number
  y1: number
  x2: number
  y2: number
  length: number
  scale: number
  viewportWidth: number
}

interface RunnerPose {
  frame: 0 | 1
  phase: 'waiting' | 'falling' | 'running'
  size: number
  height: number
  x: number
  y: number
  angle: number
  flip: 1 | -1
  opacity: number
  scaleY: number
}

const POLL_MS = 60_000
const TRACK_REFRESH_MS = 900
// Minimum gap between scroll-triggered herd hops (covers the longest fall).
const JUMP_RETRIGGER_MS = 1_100
// Landing squash window after a dino touches down.
const LAND_SQUASH_MS = 150
// Global size multiplier applied to every dino (keeps the size hierarchy).
const SIZE_SCALE = 1.6
const CHROME_DINO_SPRITE_WIDTH = 1233
const CHROME_DINO_SPRITE_HEIGHT = 100
const CHROME_DINO_FRAME_MS = 1000 / 12

// Per-species frames cut from the Chrome offline sprite sheet (measured from
// the PNG). `frames` are the x-offsets of the two running poses; the cell is
// frameW×frameH at top frameY; eye is a faked dot (the sprite's own eye is part
// of the opaque silhouette). T-Rex uses the upright run; raptor uses the two
// DUCKING frames — the crouched, head-down "sprinting" dino.
interface SpriteDef {
  frames: readonly [number, number]
  frameW: number
  frameH: number
  frameY: number
  eyeX: number
  eyeY: number
  eyeSize: number
}
const SPRITES: Record<Species, SpriteDef> = {
  trex: { frames: [936, 980], frameW: 44, frameH: 47, frameY: 2, eyeX: 34, eyeY: 8, eyeSize: 2 },
  raptor: { frames: [1112, 1171], frameW: 59, frameH: 30, frameY: 19, eyeX: 47, eyeY: 4, eyeSize: 2 },
}
const CHROME_DINO_COLORS: Record<Species, string> = {
  trex: '#e3741f', // orange — the bigger, dominant species
  raptor: '#7d8c7f', // gray-greenish — the smaller pack species
}

// Run speed is purely a function of body size: bigger legs cover more ground, so
// speed scales linearly with the rendered size (px/s per px of size). Raptors
// are the nimble pack hunters — at the SAME size a raptor runs 1.5× as fast as a
// T-Rex. This is the single source of truth for runner speed (no random base).
export const TREX_SPEED_PER_PX = 0.6
export const RAPTOR_SPEED_FACTOR = 1.5
export function dinoSpeed(size: number, species: Species): number {
  const perPx = species === 'raptor' ? TREX_SPEED_PER_PX * RAPTOR_SPEED_FACTOR : TREX_SPEED_PER_PX
  return size * perPx
}

export default function CollectiveDinoRunners() {
  const [rows, setRows] = useState<LeaderRow[]>([])
  const [tracks, setTracks] = useState<GroundTrack[]>([])
  const [now, setNow] = useState(0)
  const animationStartedAt = useRef<number | null>(null)
  const nowRef = useRef(0)
  const fallStartRef = useRef(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await getLeaderboard()
        if (!cancelled) setRows(data)
      } catch {
        if (!cancelled) setRows([])
      }
    }

    load()
    const id = window.setInterval(load, POLL_MS)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [])

  useEffect(() => {
    let frame = 0

    function measure() {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => setTracks(measureGroundTracks()))
    }

    measure()
    const delayed = [120, 450, 1200].map((delay) => window.setTimeout(measure, delay))
    const interval = window.setInterval(measure, TRACK_REFRESH_MS)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, { passive: true })

    const observer = new MutationObserver(measure)
    const main = document.querySelector('main')
    if (main) observer.observe(main, { childList: true, subtree: true })

    return () => {
      window.cancelAnimationFrame(frame)
      delayed.forEach((id) => window.clearTimeout(id))
      window.clearInterval(interval)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure)
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    let animation = 0

    function tick(time: number) {
      if (animationStartedAt.current === null) animationStartedAt.current = time
      const elapsed = time - animationStartedAt.current
      nowRef.current = elapsed
      setNow(elapsed)
      animation = window.requestAnimationFrame(tick)
    }

    animation = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(animation)
  }, [])

  // Scrolling makes the whole herd hop: every scroll re-triggers a
  // fall-from-above that lands back on the viewport floor. Gated to one jump
  // at a time so continuous scrolling produces repeated hops, not hovering.
  useEffect(() => {
    function onScroll() {
      const n = nowRef.current
      if (n - fallStartRef.current >= JUMP_RETRIGGER_MS) fallStartRef.current = n
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const tally = useMemo(() => dinoTallyFromRows(rows), [rows])
  const runners = useMemo(
    () => [
      ...makeRunners('trex', tally.trexes),
      ...makeRunners('raptor', tally.raptors),
    ],
    [tally.raptors, tally.trexes],
  )

  if (runners.length === 0) return null

  const groundTracks = tracks.length > 0 ? tracks : fallbackTracks()

  return (
    <div
      className="dino-runners"
      aria-hidden="true"
      data-raptors={tally.raptors}
      data-trexes={tally.trexes}
    >
      {runners.map((runner) => {
        const track = groundTracks[runner.trackIndex % groundTracks.length]
        const pose = poseOnTrack(runner, track, now, fallStartRef.current)
        const def = SPRITES[runner.species]

        return (
          <div
            key={runner.id}
            className={`dino-runner dino-runner--${runner.species}`}
            data-testid={`dino-${runner.species}`}
            data-dino-weight={runner.weight}
            data-track-kind="ground"
            data-motion-phase={pose.phase}
            style={{
              '--dino-size': `${pose.size}px`,
              '--dino-height': `${pose.height}px`,
              '--dino-x': `${pose.x}px`,
              '--dino-y': `${pose.y}px`,
              '--dino-angle': `${pose.angle}deg`,
              '--dino-flip': pose.flip,
              '--dino-opacity': pose.opacity,
              '--dino-scale-y': pose.scaleY,
              '--dino-color':
                runner.weight === DINO_LEGEND_SIZE
                  ? '#a855f7' // purple — the legendary super-pack boss
                  : CHROME_DINO_COLORS[runner.species],
              '--dino-sprite-sheet-width': `${pose.size * (CHROME_DINO_SPRITE_WIDTH / def.frameW)}px`,
              '--dino-sprite-sheet-height': `${pose.height * (CHROME_DINO_SPRITE_HEIGHT / def.frameH)}px`,
              '--dino-mask-x': `${-pose.size * (def.frames[pose.frame] / def.frameW)}px`,
              '--dino-mask-y': `${-pose.height * (def.frameY / def.frameH)}px`,
              '--dino-eye-x': `${pose.size * (def.eyeX / def.frameW)}px`,
              '--dino-eye-y': `${pose.height * (def.eyeY / def.frameH)}px`,
              '--dino-eye-size': `${Math.max(2, pose.size * (def.eyeSize / def.frameW))}px`,
            } as CSSProperties}
          >
            <ChromeDino />
          </div>
        )
      })}
    </div>
  )
}

function makeRunners(species: Species, count: number): Runner[] {
  const legendCount = Math.floor(count / DINO_LEGEND_SIZE)
  const largeCount = Math.floor((count % DINO_LEGEND_SIZE) / DINO_GROUP_SIZE)
  const singleCount = count % DINO_GROUP_SIZE
  const weights = [
    ...Array.from({ length: legendCount }, () => DINO_LEGEND_SIZE),
    ...Array.from({ length: largeCount }, () => DINO_GROUP_SIZE),
    ...Array.from({ length: singleCount }, () => 1),
  ]

  return weights.map((weight, index) => {
    const trex = species === 'trex'
    const large = weight === DINO_GROUP_SIZE
    const legend = weight === DINO_LEGEND_SIZE
    // Size tiers, smallest → largest, never overlapping:
    //   small raptor (22-26) < large raptor (33-39) < normal trex (44-48) <
    //   large trex (97-106) < legendary super-pack (the towering purple boss).
    // A large raptor (a pack of 10) stays smaller than a single normal T-Rex.
    const baseSize = trex ? 44 + (index % 2) * 4 : 22 + (index % 3) * 2
    const sizeMult = legend ? (trex ? 3.0 : 4.2) : large ? (trex ? 2.2 : 3.2) : 1
    const fallHeightMult = legend ? 1.8 : large ? 1.45 : 1
    const fallMsMult = legend ? 1.4 : large ? 1.2 : 1
    const size = baseSize * sizeMult * SIZE_SCALE

    return {
      id: `${species}-${weight}-${index}`,
      species,
      weight,
      trackIndex: index * 3 + (trex ? 1 : 0),
      size,
      // Speed follows size (raptors 1.5× a same-size T-Rex), so bigger dinos
      // stride faster and the legendary boss leads the herd.
      speed: dinoSpeed(size, species),
      offset: index * (trex ? 7311 : 4217) + (trex ? 13_000 : 0),
      reverse: (index + (trex ? 1 : 0)) % 2 === 1,
      fallHeight: (trex ? 92 + (index % 4) * 18 : 68 + (index % 5) * 12) * fallHeightMult,
      fallMs: (trex ? 640 + (index % 3) * 60 : 520 + (index % 4) * 45) * fallMsMult,
      fallDelay: (index % 6) * 45 + (trex ? 0 : 25),
      spawnRatio: ((index * (trex ? 41 : 29) + (trex ? 17 : 7)) % 100) / 100,
    }
  })
}

function poseOnTrack(runner: Runner, track: GroundTrack, now: number, fallStart: number): RunnerPose {
  const def = SPRITES[runner.species]
  const size = runner.size * track.scale
  const height = size * (def.frameH / def.frameW)
  const speed = runner.speed * (track.viewportWidth < 640 ? 0.58 : 1)
  const frame = Math.floor((now + runner.offset) / CHROME_DINO_FRAME_MS) % 2 as 0 | 1
  const movingLeft = runner.reverse
  const edgePadding = Math.max(2, size * 0.18)
  const leftBound = edgePadding
  const rightBound = Math.max(leftBound, track.viewportWidth - size - edgePadding)
  const runRange = Math.max(1, rightBound - leftBound)
  const groundY = track.y1 - height

  // Horizontal: never stop — ping-pong across the viewport floor forever.
  const signedDistance = (now / 1000) * speed * (movingLeft ? -1 : 1)
  const here = pingPong(runner.spawnRatio * runRange + signedDistance, runRange)
  const ahead = pingPong(
    runner.spawnRatio * runRange + signedDistance + (movingLeft ? -1 : 1) * speed * 0.016,
    runRange,
  )
  const movingRight = ahead >= here
  const x = leftBound + here

  // Vertical: a fall-from-above triggered on load and on every scroll. Each
  // dino starts `fallHeight` above the floor and accelerates down (gravity),
  // then squashes on impact. Between falls it just runs on the floor.
  const t = now - fallStart - runner.fallDelay
  let y = groundY
  let phase: RunnerPose['phase'] = 'running'
  let scaleY = 1
  let angle = 0

  if (t >= 0 && t < runner.fallMs) {
    const progress = t / runner.fallMs
    const gravity = progress * progress
    y = groundY - runner.fallHeight * (1 - gravity)
    phase = 'falling'
    angle = (movingRight ? 1 : -1) * (1 - progress) * 6
  } else if (t >= runner.fallMs && t < runner.fallMs + LAND_SQUASH_MS) {
    const land = (t - runner.fallMs) / LAND_SQUASH_MS
    scaleY = 0.8 + 0.2 * land
  }

  return {
    frame,
    phase,
    size,
    height,
    x,
    y,
    angle,
    flip: movingRight ? 1 : -1,
    opacity: 0.94,
    scaleY,
  }
}

function measureGroundTracks(): GroundTrack[] {
  const width = window.innerWidth
  const height = window.innerHeight
  // Always the bottom of the viewport — the runners layer is position:fixed,
  // so this keeps the herd glued to the viewport floor while scrolling.
  const floorPadding = width < 640 ? 3 : 5
  const floorY = height - floorPadding
  const laneGap = width < 640 ? 8 : 12
  const laneCount = width < 640 ? 3 : 4
  const trackWidth = width * (width < 640 ? 3.2 : 3.9)
  const x1 = -trackWidth * 0.5
  const x2 = width + trackWidth * 0.5
  const scale = width < 640 ? 0.72 : width < 900 ? 0.88 : 1

  const tracks = Array.from({ length: laneCount }, (_, lane) => {
    const y = floorY - lane * laneGap
    return {
      id: `ground-${lane}`,
      x1,
      y1: y,
      x2,
      y2: y,
      length: x2 - x1,
      scale,
      viewportWidth: width,
    }
  })

  return tracks.length > 0 ? tracks : fallbackTracks()
}

function fallbackTracks(): GroundTrack[] {
  const width = typeof window === 'undefined' ? 1024 : window.innerWidth
  const height = typeof window === 'undefined' ? 768 : window.innerHeight
  const trackWidth = width * 4
  const x1 = -trackWidth * 0.5
  const x2 = width + trackWidth * 0.5
  const scale = width < 640 ? 0.72 : width < 900 ? 0.88 : 1
  return [
    {
      id: 'fallback-ground-0',
      x1,
      y1: height - 5,
      x2,
      y2: height - 5,
      length: x2 - x1,
      scale,
      viewportWidth: width,
    },
    {
      id: 'fallback-ground-1',
      x1,
      y1: height - 17,
      x2,
      y2: height - 17,
      length: x2 - x1,
      scale,
      viewportWidth: width,
    },
  ]
}

function positiveModulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor
}

function pingPong(value: number, range: number): number {
  const doubleRange = range * 2
  const wrapped = positiveModulo(value, doubleRange)
  return wrapped <= range ? wrapped : doubleRange - wrapped
}

function ChromeDino() {
  return <span className="chrome-dino-sprite" />
}
