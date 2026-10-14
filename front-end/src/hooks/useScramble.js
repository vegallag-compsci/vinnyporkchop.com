import { useCallback, useEffect, useRef, useState } from 'react'

const GLYPHS = '!<>-_/[]{}=+*^?#01'
const STAGGER_MS = 28
const JITTER_MS = 120
const BASE_MS = 90
const GLYPH_SWAP_MS = 45

const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]

// Cycles each character through noise glyphs before it settles, left to right.
export function useScramble(text, { disabled = false } = {}) {
  const [chars, setChars] = useState(() => [...text])
  const frameRef = useRef(0)

  const trigger = useCallback(() => {
    if (disabled) return
    cancelAnimationFrame(frameRef.current)

    const source = [...text]
    const revealAt = source.map(
      (_, i) => BASE_MS + i * STAGGER_MS + Math.random() * JITTER_MS,
    )
    const end = Math.max(...revealAt)
    const start = performance.now()
    let lastStep = -1

    const tick = (now) => {
      const elapsed = now - start
      const step = Math.floor(elapsed / GLYPH_SWAP_MS)

      if (step !== lastStep || elapsed >= end) {
        lastStep = step
        setChars(
          source.map((ch, i) =>
            elapsed >= revealAt[i] || ch === '.' ? ch : randomGlyph(),
          ),
        )
      }
      if (elapsed < end) frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
  }, [text, disabled])

  useEffect(() => () => cancelAnimationFrame(frameRef.current), [])

  return [chars, trigger]
}
