import { useRef } from 'react'
import { useProximity } from '../hooks/useProximity.js'
import { useTypeIntro } from '../hooks/useTypeIntro.js'
import '../styles/wordmark.css'

const TEXT = 'vinnyporkchop.com'
const TLD_START = TEXT.lastIndexOf('.')

function Wordmark({ pointerRef, reducedMotion }) {
  const wrapRef = useRef(null)
  const lettersRef = useRef([])
  const { slots, caret, done } = useTypeIntro(TEXT, { skip: reducedMotion })

  useProximity({ wrapRef, lettersRef, pointerRef, tilt: !reducedMotion })

  const caretEl = (
    <span
      key="caret"
      className="wordmark__caret"
      data-done={done}
      aria-hidden="true"
    />
  )

  return (
    <h1 ref={wrapRef} className="wordmark" data-done={done} aria-label={TEXT}>
      {slots.flatMap(({ ch, state }, i) => {
        const letter = (
          <span
            key={i}
            ref={(el) => {
              lettersRef.current[i] = el
            }}
            className={
              i >= TLD_START ? 'wordmark__char wordmark__char--tld' : 'wordmark__char'
            }
            data-state={state}
            aria-hidden="true"
          >
            {ch}
          </span>
        )
        return i === caret ? [caretEl, letter] : [letter]
      })}
      {caret >= slots.length && caretEl}
      <span className="wordmark__rule" aria-hidden="true" />
    </h1>
  )
}

export default Wordmark
