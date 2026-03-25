const NAV_ITEMS = [
  { label: "Andy Weitzel's CV", type: 'cv' },
  { label: 'Interactive Experiences', col: 1 },
  { label: 'Branding & Print', col: 0 },
  { label: 'Contact', type: 'contact' },
]

export default function Navigation({ activeCol, isZoomed, loading, menuOpen, onNavClick, onMenuToggle, onCvClick, onContactClick }) {
  const hidden = loading || isZoomed

  const handleClick = (item) => {
    if (item.type === 'cv') onCvClick()
    else if (item.type === 'contact') onContactClick()
    else onNavClick(item.col)
  }

  return (
    <>
      {/* ── Desktop nav: top-right ── */}
      <div
        className={`fixed top-[50px] right-0 p-4 z-30 hidden md:block transition-opacity duration-1000 ${
          hidden ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
        }`}
      >
        <div className="flex flex-row gap-8 items-center">
          {NAV_ITEMS.map((item) => {
            const isActive = item.type === undefined && activeCol === item.col
            return (
              <div
                key={item.label}
                className={`ui-element cursor-pointer text-[1.5rem] leading-normal text-white transition-all ${
                  isActive ? 'border-b-4 border-white' : 'hover:border-b-4 hover:border-white/50'
                }`}
                onClick={() => handleClick(item)}
              >
                {item.label}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Mobile: hamburger button ── */}
      <button
        className={`ui-element md:hidden fixed top-4 right-4 z-40 w-[44px] h-[44px] flex items-center justify-center text-white transition-opacity duration-1000 ${
          hidden ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
        }`}
        onClick={onMenuToggle}
      >
        {menuOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {/* ── Mobile: full-screen dropdown ── */}
      <div
        className={`md:hidden fixed inset-0 z-30 transition-opacity duration-300 ${
          menuOpen && !hidden ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-black/55 backdrop-blur-md" />
        <div className="relative z-10 flex flex-col items-start gap-4 pt-[120px] pl-[30px]">
          {NAV_ITEMS.map((item) => {
            const isActive = item.type === undefined && activeCol === item.col
            return (
              <div
                key={item.label}
                className={`ui-element cursor-pointer text-[8vw] leading-[8vw] text-white transition-all ${
                  isActive ? 'border-b-4 border-white' : ''
                }`}
                onClick={() => { handleClick(item); onMenuToggle() }}
              >
                {item.label}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
