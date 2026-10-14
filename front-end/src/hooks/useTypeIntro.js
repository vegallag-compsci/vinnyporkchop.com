import { useEffect, useState } from 'react'
import { finalFrame, introFrame } from '../lib/introTimeline.js'

// Plays the load-in sequence once; `skip` jumps straight to the finished text.
export function useTypeIntro(text, { skip = false } = {}) {
  const [frame, setFrame] = useState(() => introFrame(text, 0))

  useEffect(() => {
    if (skip) return undefined

    const start = performance.now()
    let signature = ''
    let raf = 0

    const tick = (now) => {
      const next = introFrame(text, now - start)
      const nextSignature = next.slots.map((s) => s.state[0] + s.ch).join('')
      if (nextSignature !== signature) {
        signature = nextSignature
        setFrame(next)
      }
      if (!next.done) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [text, skip])

  return skip ? finalFrame(text) : frame
}
