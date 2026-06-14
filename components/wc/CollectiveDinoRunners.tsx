'use client'

import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react'
import { DINO_GROUP_SIZE, dinoTallyFromRows } from '@/lib/wcDinos'
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
  waitMs: number
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
const CHROME_DINO_SPRITE_WIDTH = 1233
const CHROME_DINO_SPRITE_HEIGHT = 100
const CHROME_DINO_FRAME_WIDTH = 44
const CHROME_DINO_FRAME_HEIGHT = 47
const CHROME_DINO_FRAME_Y = 2
const CHROME_DINO_RUN_FRAMES = [936, 980] as const
const CHROME_DINO_FRAME_MS = 1000 / 12
const CHROME_DINO_ASPECT = CHROME_DINO_FRAME_HEIGHT / CHROME_DINO_FRAME_WIDTH
const CHROME_DINO_COLORS: Record<Species, string> = {
  trex: '#535353',
  raptor: '#d97706',
}

export default function CollectiveDinoRunners() {
  const [rows, setRows] = useState<LeaderRow[]>([])
  const [tracks, setTracks] = useState<GroundTrack[]>([])
  const [now, setNow] = useState(0)
  const animationStartedAt = useRef<number | null>(null)

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
      setNow(time - animationStartedAt.current)
      animation = window.requestAnimationFrame(tick)
    }

    animation = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(animation)
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
        const pose = poseOnTrack(runner, track, now)

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
              '--dino-color': CHROME_DINO_COLORS[runner.species],
              '--dino-sprite-sheet-width': `${pose.size * (CHROME_DINO_SPRITE_WIDTH / CHROME_DINO_FRAME_WIDTH)}px`,
              '--dino-sprite-sheet-height': `${pose.height * (CHROME_DINO_SPRITE_HEIGHT / CHROME_DINO_FRAME_HEIGHT)}px`,
              '--dino-mask-x': `${-pose.size * (CHROME_DINO_RUN_FRAMES[pose.frame] / CHROME_DINO_FRAME_WIDTH)}px`,
              '--dino-mask-y': `${-pose.height * (CHROME_DINO_FRAME_Y / CHROME_DINO_FRAME_HEIGHT)}px`,
              '--dino-eye-x': `${pose.size * (34 / CHROME_DINO_FRAME_WIDTH)}px`,
              '--dino-eye-y': `${pose.height * (8 / CHROME_DINO_FRAME_HEIGHT)}px`,
              '--dino-eye-size': `${Math.max(2, pose.size * (2 / CHROME_DINO_FRAME_WIDTH))}px`,
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
  const largeCount = Math.floor(count / DINO_GROUP_SIZE)
  const singleCount = count % DINO_GROUP_SIZE
  const weights = [
    ...Array.from({ length: largeCount }, () => DINO_GROUP_SIZE),
    ...Array.from({ length: singleCount }, () => 1),
  ]

  return weights.map((weight, index) => {
    const trex = species === 'trex'
    const large = weight === DINO_GROUP_SIZE
    const baseSize = trex ? 42 + (index % 2) * 4 : 29 + (index % 3) * 3
    const baseSpeed = trex ? 42 + (index % 3) * 4 : 66 + (index % 4) * 5

    return {
      id: `${species}-${weight}-${index}`,
      species,
      weight,
      trackIndex: index * 3 + (trex ? 1 : 0),
      size: baseSize * (large ? (trex ? 2.25 : 2.3) : 1),
      speed: baseSpeed * (large ? (trex ? 0.82 : 0.86) : 1),
      offset: index * (trex ? 7311 : 4217) + (trex ? 13_000 : 0),
      reverse: (index + (trex ? 1 : 0)) % 2 === 1,
      fallHeight: (trex ? 92 + (index % 4) * 18 : 68 + (index % 5) * 12) * (large ? 1.45 : 1),
      fallMs: (trex ? 780 + (index % 3) * 70 : 560 + (index % 4) * 55) * (large ? 1.25 : 1),
      waitMs: trex ? 34_000 + (index % 7) * 3100 : 24_000 + (index % 11) * 1900,
      spawnRatio: ((index * (trex ? 41 : 29) + (trex ? 17 : 7)) % 100) / 100,
    }
  })
}

function poseOnTrack(runner: Runner, track: GroundTrack, now: number): RunnerPose {
  const size = runner.size * track.scale
  const height = size * CHROME_DINO_ASPECT
  const speed = runner.speed * (track.viewportWidth < 640 ? 0.58 : 1)
  const runMs = Math.max(18_000, (track.length / speed) * 1000)
  const cycleMs = runner.waitMs + runner.fallMs + runMs
  const frame = Math.floor((now + runner.offset) / CHROME_DINO_FRAME_MS) % 2 as 0 | 1
  const movingLeft = runner.reverse
  const edgePadding = Math.max(2, size * 0.18)
  const leftBound = edgePadding
  const rightBound = Math.max(leftBound, track.viewportWidth - size - edgePadding)
  const runRange = Math.max(1, rightBound - leftBound)
  const landingX = leftBound + runner.spawnRatio * runRange
  const groundY = track.y1 - height

  function runningPose(runElapsedMs: number): RunnerPose {
    const signedDistance = (runElapsedMs / 1000) * speed * (movingLeft ? -1 : 1)
    const currentOffset = pingPong(runner.spawnRatio * runRange + signedDistance, runRange)
    const nextOffset = pingPong(runner.spawnRatio * runRange + signedDistance + (movingLeft ? -1 : 1) * speed * 0.016, runRange)
    const landingAge = Math.min(1, runElapsedMs / 180)
    const landingBounce = (1 - landingAge) * Math.sin(landingAge * Math.PI) * 3
    const movingRight = nextOffset >= currentOffset

    return {
      frame,
      phase: 'running',
      size,
      height,
      x: leftBound + currentOffset,
      y: groundY - landingBounce,
      angle: 0,
      flip: movingRight ? 1 : -1,
      opacity: 0.94,
      scaleY: 0.9 + landingAge * 0.1,
    }
  }

  if (now < runMs) {
    return runningPose(positiveModulo(now + runner.offset, runMs))
  }

  const localMs = positiveModulo(now - runMs + runner.offset, cycleMs)

  if (localMs < runner.waitMs) {
    const offscreenX = movingLeft ? track.x2 + size * 1.5 : track.x1 - size * 1.5
    return {
      frame,
      phase: 'waiting',
      size,
      height,
      x: offscreenX,
      y: groundY,
      angle: 0,
      flip: movingLeft ? -1 : 1,
      opacity: 0,
      scaleY: 1,
    }
  }

  const afterWait = localMs - runner.waitMs
  if (afterWait < runner.fallMs) {
    const progress = afterWait / runner.fallMs
    const gravity = progress * progress
    const drift = (movingLeft ? -1 : 1) * size * 0.16 * progress
    const landingSquash = progress > 0.86 ? 0.9 + (1 - progress) * 0.7 : 1
    const visibleDrop = Math.max(0, (progress - 0.58) / 0.42)

    return {
      frame,
      phase: 'falling',
      size,
      height,
      x: landingX + drift,
      y: groundY - runner.fallHeight * (1 - gravity),
      angle: (movingLeft ? -1 : 1) * (1 - progress) * 5,
      flip: movingLeft ? -1 : 1,
      opacity: Math.min(0.94, visibleDrop * 0.94),
      scaleY: landingSquash,
    }
  }

  const runElapsedMs = afterWait - runner.fallMs
  return runningPose(runElapsedMs)
}

function measureGroundTracks(): GroundTrack[] {
  const width = window.innerWidth
  const height = window.innerHeight
  const footer = document.querySelector('footer')?.getBoundingClientRect()
  const footerTop = footer && footer.top > 120 && footer.top < height + 48 ? footer.top : null
  const floorPadding = width < 640 ? 3 : 5
  const floorY = Math.min(height - floorPadding, (footerTop ?? height) - floorPadding)
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
