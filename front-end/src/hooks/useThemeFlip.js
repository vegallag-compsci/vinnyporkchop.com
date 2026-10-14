import { useCallback } from 'react'

const DURATION_MS = 800
const EASE_OUT_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)'

function toggleInverted() {
  document.documentElement.toggleAttribute('data-inverted')
}

// Swaps black/white with a circular wipe that grows out of the click point.
export function useThemeFlip(reducedMotion) {
  return useCallback(
    (x, y) => {
      if (reducedMotion || !document.startViewTransition) {
        toggleInverted()
        return
      }

      const radius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      )
      const transition = document.startViewTransition(toggleInverted)

      transition.ready
        .then(() => {
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${radius}px at ${x}px ${y}px)`,
              ],
            },
            {
              duration: DURATION_MS,
              easing: EASE_OUT_EXPO,
              pseudoElement: '::view-transition-new(root)',
            },
          )
        })
        // A skipped transition still runs the toggle, so only the wipe is lost.
        .catch(() => {})
    },
    [reducedMotion],
  )
}
