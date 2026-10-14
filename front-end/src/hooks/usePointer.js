import { useEffect, useRef } from 'react'

// Tracks the pointer in a ref so animation loops can read it without re-renders.
export function usePointer() {
  const pointerRef = useRef({ x: 0, y: 0, active: false })

  useEffect(() => {
    const root = document.documentElement
    const onMove = (event) => {
      pointerRef.current = { x: event.clientX, y: event.clientY, active: true }
    }
    const onLeave = () => {
      pointerRef.current = { ...pointerRef.current, active: false }
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onMove, { passive: true })
    root.addEventListener('pointerleave', onLeave)
    window.addEventListener('blur', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onMove)
      root.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('blur', onLeave)
    }
  }, [])

  return pointerRef
}
