'use client'

import { useEffect } from 'react'

/**
 * Only mounted on the login and MFA screens.
 * Safari on iOS ignores viewport zoom limits; prevent the gestures themselves.
 * Preserve normal single-finger scrolling and form interactions.
 */
export default function AccessZoomGuard() {
  useEffect(() => {
    const root = document.querySelector('.sno-access')
    if (!root) return

    const inAccess = (event: Event) =>
      event.target instanceof Node && root.contains(event.target)

    const preventGesture = (event: Event) => {
      if (inAccess(event) && event.cancelable) event.preventDefault()
    }

    const preventMultiTouch = (event: TouchEvent) => {
      if (event.touches.length > 1 && inAccess(event) && event.cancelable) {
        event.preventDefault()
      }
    }

    // Safari-specific gesture events; native touch events are the fallback.
    document.addEventListener('gesturestart', preventGesture, { passive: false })
    document.addEventListener('gesturechange', preventGesture, { passive: false })
    document.addEventListener('touchmove', preventMultiTouch, { passive: false })

    return () => {
      document.removeEventListener('gesturestart', preventGesture)
      document.removeEventListener('gesturechange', preventGesture)
      document.removeEventListener('touchmove', preventMultiTouch)
    }
  }, [])

  return null
}
