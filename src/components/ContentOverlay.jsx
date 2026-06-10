import { useRef, useLayoutEffect, useEffect } from 'react'

export default function ContentOverlay({ open, onClose, children, light = false, onScroll }) {
  const scrollRef = useRef(null)
  const targetScrollRef = useRef(0)
  const currentScrollRef = useRef(0)
  const rafRef = useRef(null)
  const onScrollRef = useRef(onScroll)
  useEffect(() => { onScrollRef.current = onScroll }, [onScroll])

  useLayoutEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = 0
      targetScrollRef.current = 0
      currentScrollRef.current = 0
    }
  }, [open])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const onWheel = (e) => {
      e.preventDefault()
      const delta = e.deltaMode === 1 ? e.deltaY * 20 : e.deltaY
      const max = el.scrollHeight - el.clientHeight
      targetScrollRef.current = Math.max(0, Math.min(max, targetScrollRef.current + delta))
    }

    let touchY = 0
    const onTouchStart = (e) => {
      touchY = e.touches[0].clientY
    }
    const onTouchMove = (e) => {
      e.preventDefault()
      e.stopPropagation()
      const dy = touchY - e.touches[0].clientY
      touchY = e.touches[0].clientY
      const max = el.scrollHeight - el.clientHeight
      targetScrollRef.current = Math.max(0, Math.min(max, targetScrollRef.current + dy))
    }

    const tick = () => {
      const max = el.scrollHeight - el.clientHeight
      if (targetScrollRef.current > max) targetScrollRef.current = max
      if (currentScrollRef.current > max) currentScrollRef.current = max
      const diff = targetScrollRef.current - currentScrollRef.current
      if (Math.abs(diff) > 0.5) {
        currentScrollRef.current += diff * 0.07
      } else {
        currentScrollRef.current = targetScrollRef.current
      }
      el.scrollTop = currentScrollRef.current
      onScrollRef.current?.(currentScrollRef.current)
      rafRef.current = requestAnimationFrame(tick)
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-500 ${
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {!light && (
        <>
          <div className={`absolute inset-0 transition-all duration-500 ${open ? 'bg-black/55' : 'bg-black/0'}`} />
          <div className={`absolute inset-0 transition-all duration-500 ${open ? 'backdrop-blur-md' : 'backdrop-blur-none'}`} />
        </>
      )}

      {/* Close button — absolute within fixed parent, above scrollable content */}
      <button
        className="ui-element absolute top-5 right-7 z-20 w-[50px] h-[50px] rounded-full blur-bg shadow-sm text-black flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
        onClick={onClose}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        className="relative z-10 h-full overflow-y-auto"
      >
        {children}
      </div>
    </div>
  )
}
