import { useEffect } from 'react'

const RADIUS_PX = 280
const EASING = 0.12
const MAX_TILT_DEG = 7

const smoothstep = (t) => {
  const c = Math.min(Math.max(t, 0), 1)
  return c * c * (3 - 2 * c)
}
const approach = (from, to) => from + (to - from) * EASING

// Feeds each letter a 0..1 `--p` from pointer distance, and tilts the wrapper.
export function useProximity({ wrapRef, lettersRef, pointerRef, tilt }) {
  useEffect(() => {
    const levels = []
    let rotX = 0
    let rotY = 0
    let frame = 0

    const loop = () => {
      const { x, y, active } = pointerRef.current
      const letters = lettersRef.current.filter(Boolean)
      const rects = letters.map((el) => el.getBoundingClientRect())

      letters.forEach((el, i) => {
        const rect = rects[i]
        const dist = Math.hypot(
          x - (rect.left + rect.width / 2),
          y - (rect.top + rect.height / 2),
        )
        const target = active ? smoothstep(1 - dist / RADIUS_PX) : 0
        levels[i] = approach(levels[i] ?? 0, target)
        el.style.setProperty('--p', levels[i].toFixed(3))
      })

      const wrap = wrapRef.current
      if (wrap && tilt) {
        const nx = active ? x / window.innerWidth - 0.5 : 0
        const ny = active ? y / window.innerHeight - 0.5 : 0
        rotX = approach(rotX, -ny * 2 * MAX_TILT_DEG)
        rotY = approach(rotY, nx * 2 * MAX_TILT_DEG)
        wrap.style.setProperty('--rx', `${rotX.toFixed(2)}deg`)
        wrap.style.setProperty('--ry', `${rotY.toFixed(2)}deg`)
      }

      frame = requestAnimationFrame(loop)
    }

    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [wrapRef, lettersRef, pointerRef, tilt])
}
