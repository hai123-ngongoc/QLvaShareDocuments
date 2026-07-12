import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MoreVertical } from 'lucide-react'

function getFloatingPosition(triggerElement, panelElement, fallbackWidth, fallbackHeight) {
  const rect = triggerElement.getBoundingClientRect()
  const viewportPadding = 12
  const gap = 6
  const panelWidth = panelElement?.offsetWidth || fallbackWidth
  const panelHeight = panelElement?.offsetHeight || fallbackHeight
  const spaceBelow = window.innerHeight - rect.bottom - viewportPadding
  const spaceAbove = rect.top - viewportPadding
  const opensUp = spaceBelow < panelHeight && spaceAbove > spaceBelow
  const top = opensUp ? rect.top - panelHeight - gap : rect.bottom + gap
  const left = rect.right - panelWidth

  return {
    left: Math.min(
      Math.max(viewportPadding, left),
      window.innerWidth - panelWidth - viewportPadding,
    ),
    top: Math.min(
      Math.max(viewportPadding, top),
      window.innerHeight - panelHeight - viewportPadding,
    ),
  }
}

function ActionMenu({
  ariaLabel = 'Thêm thao tác',
  children,
  className = '',
  menuClassName = '',
  menuWidth = 178,
  menuHeight = 170,
  title = 'Thêm thao tác',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ left: 0, top: 0, ready: false })
  const triggerRef = useRef(null)
  const panelRef = useRef(null)

  const closeMenu = () => setIsOpen(false)

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return

    setPosition((current) => ({
      ...getFloatingPosition(triggerRef.current, panelRef.current, menuWidth, menuHeight),
      ready: current.ready || Boolean(panelRef.current),
    }))
  }, [menuHeight, menuWidth])

  useLayoutEffect(() => {
    if (!isOpen) return

    updatePosition()
  }, [isOpen, updatePosition])

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event) => {
      if (
        triggerRef.current?.contains(event.target) ||
        panelRef.current?.contains(event.target)
      ) {
        return
      }

      closeMenu()
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeMenu()
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [isOpen, updatePosition])

  return (
    <div className={`admin-row-menu ${className}`}>
      <button
        className="admin-row-menu__trigger"
        type="button"
        ref={triggerRef}
        title={title}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <MoreVertical size={16} strokeWidth={2} />
      </button>

      {isOpen &&
        createPortal(
          <div
            className={`admin-row-menu__panel admin-row-menu__panel--floating ${menuClassName}`}
            ref={panelRef}
            style={{
              left: position.left,
              minWidth: menuWidth,
              top: position.top,
              visibility: position.ready ? 'visible' : 'hidden',
            }}
            onClick={(event) => {
              if (event.target.closest('button, a')) closeMenu()
            }}
          >
            {typeof children === 'function' ? children(closeMenu) : children}
          </div>,
          document.body,
        )}
    </div>
  )
}

export default ActionMenu
