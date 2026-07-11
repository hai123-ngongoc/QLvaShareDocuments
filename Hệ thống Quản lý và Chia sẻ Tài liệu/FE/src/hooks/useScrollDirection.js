import { useEffect, useRef, useState } from 'react'

function useScrollDirection() {
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)
  const frameId = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const updateScrollDirection = () => {
      const currentScrollY = window.scrollY
      const isAtTop = currentScrollY <= 50
      const isScrollingUp = currentScrollY < lastScrollY.current

      setIsVisible(isAtTop || isScrollingUp)
      lastScrollY.current = currentScrollY
      frameId.current = null
    }

    const onScroll = () => {
      if (frameId.current !== null) return
      frameId.current = window.requestAnimationFrame(updateScrollDirection)
    }

    lastScrollY.current = window.scrollY
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frameId.current !== null) {
        window.cancelAnimationFrame(frameId.current)
      }
    }
  }, [])

  return isVisible
}

export default useScrollDirection
