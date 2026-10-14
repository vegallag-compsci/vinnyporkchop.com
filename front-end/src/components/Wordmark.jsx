import { useRef } from 'react'
import { useProximity } from '../hooks/useProximity.js'
import { useScramble } from '../hooks/useScramble.js'
import '../styles/wordmark.css'

const TEXT = 'vinnyporkchop.com'
const TLD_START = TEXT.lastIndexOf('.')

function Wordmark({ pointerRef, reducedMotion }) {
  const wrapRef = useRef(null)
  const lettersRef = useRef([])
  const [chars, scramble] = useScramble(TEXT, { disabled: reducedMotion })

  useProximity({ wrapRef, lettersRef, pointerRef, tilt: !reducedMotion })

  return (
    <h1
      ref={wrapRef}
      className="wordmark"
      aria-label={TEXT}
      onPointerEnter={scramble}
      onClick={scramble}
    >
      {chars.map((ch, i) => (
        <span
          key={i}
          ref={(el) => {
            lettersRef.current[i] = el
          }}
          className={
            i >= TLD_START ? 'wordmark__char wordmark__char--tld' : 'wordmark__char'
          }
          aria-hidden="true"
        >
          {ch}
        </span>
      ))}
      <span className="wordmark__rule" aria-hidden="true" />
    </h1>
  )
}

export default Wordmark
