import { useEffect, useRef } from 'react'
import '../styles/cursor.css'

const FOLLOW = 0.22

// An inverting lens that trails the pointer; CSS grows it over the wordmark.
function Cursor({ pointerRef }) {
  const lensRef = useRef(null)

  useEffect(() => {
    let x = pointerRef.current.x
    let y = pointerRef.current.y
    let frame = 0

    const loop = () => {
      const lens = lensRef.current
      const pointer = pointerRef.current
      x += (pointer.x - x) * FOLLOW
      y += (pointer.y - y) * FOLLOW
      if (lens) {
        lens.style.transform = `translate3d(${x}px, ${y}px, 0)`
        lens.dataset.active = String(pointer.active)
      }
      frame = requestAnimationFrame(loop)
    }

    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [pointerRef])

  return (
    <div ref={lensRef} className="cursor" data-active="false" aria-hidden="true">
      <span className="cursor__lens" />
    </div>
  )
}

export default Cursor
