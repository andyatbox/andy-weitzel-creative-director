import { useRef, useEffect } from 'react'

export default function ContentOverlay({ open, onClose, children }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [open])

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-500 ${
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Animated backdrop */}
      <div
        className={`absolute inset-0 transition-all duration-700 ${
          open ? 'backdrop-blur-md bg-black/55' : 'backdrop-blur-none bg-black/0'
        }`}
      />

      {/* Close button — absolute within fixed parent, above scrollable content */}
      <button
        className="ui-element absolute top-5 right-7 z-20 w-[50px] h-[50px] rounded-full blur-bg shadow-sm text-black flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
        onClick={onClose}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Scrollable content — slides up on open */}
      <div
        ref={scrollRef}
        className={`relative z-10 h-full overflow-y-auto transition-all duration-500 ${
          open ? 'translate-y-0' : 'translate-y-6'
        }`}
      >
        {children}
      </div>
    </div>
  )
}
