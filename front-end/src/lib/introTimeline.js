const GLYPHS = '!<>-_/[]{}=+*^?#01'
const DOT_COUNT = 3

export const TIMING = {
  dotMs: 380,
  dotHoldMs: 450,
  typeMs: 95,
  resolveLagMs: 320,
  resolveMs: 150,
  glyphSwapMs: 55,
}

// Deterministic noise glyph per slot and step, so a frame is a pure function of time.
const glyphAt = (index, step) => {
  const hash = Math.imul(index + 1, 2654435761) ^ Math.imul(step + 1, 40503)
  return GLYPHS[(hash >>> 0) % GLYPHS.length]
}

/**
 * Intro state at `elapsed` ms: dots tick in one by one, then the text types out
 * as noise while a trailing front unscrambles it one letter at a time.
 * @param {string} text
 * @param {number} elapsed
 * @returns {{ slots: { ch: string, state: 'hidden' | 'dot' | 'scrambled' | 'resolved' }[], caret: number, done: boolean }}
 */
export function introFrame(text, elapsed, timing = TIMING) {
  const chars = [...text]
  const dotsEnd = DOT_COUNT * timing.dotMs + timing.dotHoldMs

  if (elapsed < dotsEnd) {
    const dots = Math.min(DOT_COUNT, Math.floor(elapsed / timing.dotMs) + 1)
    return {
      slots: chars.map((ch, i) =>
        i < dots ? { ch: '.', state: 'dot' } : { ch, state: 'hidden' },
      ),
      caret: dots,
      done: false,
    }
  }

  const t = elapsed - dotsEnd
  const typed = Math.min(chars.length, Math.floor(t / timing.typeMs) + 1)
  const resolved = Math.min(
    typed,
    Math.max(0, Math.floor((t - timing.resolveLagMs) / timing.resolveMs) + 1),
  )
  const step = Math.floor(t / timing.glyphSwapMs)

  return {
    slots: chars.map((ch, i) => {
      if (i < resolved) return { ch, state: 'resolved' }
      if (i < typed) return { ch: glyphAt(i, step), state: 'scrambled' }
      return { ch, state: 'hidden' }
    }),
    caret: typed,
    done: resolved === chars.length,
  }
}

export function finalFrame(text) {
  return {
    slots: [...text].map((ch) => ({ ch, state: 'resolved' })),
    caret: text.length,
    done: true,
  }
}
