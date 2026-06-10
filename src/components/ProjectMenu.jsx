import { useRef, forwardRef, useImperativeHandle } from 'react'

const ProjectMenu = forwardRef(function ProjectMenu({ items, activeCol, onItemClick, visible }, ref) {
  const slotRefs = useRef([])

  useImperativeHandle(ref, () => ({
    update(camY, cellH, viewH, isPortrait) {
      const n = items.length
      if (!n || !cellH) return
      const menuHeight = isPortrait ? viewH * 0.4 : viewH
      const itemH = isPortrait ? menuHeight / 7 : viewH / 13
      const menuCenter = menuHeight / 2
      const halfRows = Math.floor(n / 2)
      const continuousRow = halfRows - camY / cellH
      const normRow = ((continuousRow % n) + n) % n
      const alphaDist = Math.min(5, n / 2 - 0.5)

      let activeIdx = 0, minAbsDist = Infinity
      for (let i = 0; i < n; i++) {
        let d = i - normRow
        if (d > n / 2) d -= n
        if (d < -n / 2) d += n
        if (Math.abs(d) < minAbsDist) { minAbsDist = Math.abs(d); activeIdx = i }
      }

      for (let i = 0; i < n; i++) {
        const el = slotRefs.current[i]
        if (!el) continue
        let dist = i - normRow
        if (dist > n / 2) dist -= n
        if (dist < -n / 2) dist += n
        el.style.top = `${menuCenter - itemH / 2 + dist * itemH}px`
        el.style.opacity = Math.max(0, 1 - Math.abs(dist) / alphaDist)
        const span = el.firstChild
        if (span) {
          const active = i === activeIdx
          span.style.borderTop = active ? '2px solid white' : '2px solid transparent'
          span.style.borderBottom = active ? '2px solid white' : '2px solid transparent'
          span.style.paddingTop = '6px'
          span.style.paddingBottom = '12px'
        }
      }
    }
  }), [items])

  return (
    <div
      className={`fixed left-0 top-0 portrait:top-auto portrait:bottom-0 h-full portrait:h-[40%] z-20 w-full md:w-1/2 portrait:w-full pointer-events-none overflow-hidden transition-opacity duration-700 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Gradient backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.6) 0%, transparent 100%)' }}
      />

      {/* Scrolling item list — positioned absolutely, driven each frame via update() */}
      <div className="absolute inset-0">
        {items.map((item, i) => (
          <div
            key={`${activeCol}-${i}`}
            ref={el => { slotRefs.current[i] = el }}
            className="absolute left-0 w-full px-8 md:px-10"
            style={{ top: '50%', opacity: 0 }}
          >
            <span
              className="ui-element inline-block text-white leading-none pointer-events-auto cursor-pointer select-none"
              style={{
                fontFamily: '"new-spirit-condensed", serif',
                fontWeight: 300,
                fontSize: 'clamp(1.3rem, 4vw, 2.8rem)',
              }}
              onClick={() => onItemClick(i)}
            >
              {item.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
})

export default ProjectMenu
