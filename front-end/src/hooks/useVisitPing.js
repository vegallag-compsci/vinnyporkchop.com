import { useEffect } from 'react'

// Module-level flag: StrictMode runs effects twice in dev, but we only want one ping per page load.
let pinged = false

export function useVisitPing() {
  useEffect(() => {
    if (pinged) return
    pinged = true
    fetch('/api/visit', { method: 'POST', keepalive: true }).catch(() => {
      // Visit tracking is best-effort; never break the page over it.
    })
  }, [])
}
