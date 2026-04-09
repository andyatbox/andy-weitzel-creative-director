import { useRef, useState, useEffect } from 'react'
import { useThreeScene } from './hooks/useThreeScene'
import { fetchPortfolios } from './sanity'
import Logo from './components/Logo'
import Navigation from './components/Navigation'
import ContentOverlay from './components/ContentOverlay'
import ProjectOverlay from './components/ProjectOverlay'
import './App.css'

export default function App() {
  const canvasRef = useRef(null)
  const [portfolios, setPortfolios] = useState(null)
  const [cvOpen, setCvOpen] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)

  useEffect(() => {
    fetchPortfolios().then(setPortfolios)
  }, [])

  useEffect(() => {
    const setVh = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight}px`)
    }
    setVh()
    window.addEventListener('resize', setVh)
    return () => window.removeEventListener('resize', setVh)
  }, [])

  const [uiState, setUiState] = useState({
    activeCol: 1,
    isZoomed: false,
    menuOpen: false,
    loading: true,
    activeProject: null,
  })

  // Passed as a ref so scroll/drag handlers can check it without re-running the effect
  const scrollDisabledRef = useRef(false)
  scrollDisabledRef.current = cvOpen || contactOpen || !!uiState.activeProject

  const actionsRef = useThreeScene(canvasRef, setUiState, portfolios, scrollDisabledRef)

  return (
    <div className="w-full overflow-hidden bg-black touch-none select-none custom-font" style={{ height: 'var(--vh, 100vh)' }}>
      <style>{`
        @import url("https://use.typekit.net/mqn5led.css");
        .custom-font { font-family: "new-spirit-condensed", serif; font-weight: 300; font-style: normal; font-feature-settings: "ss01" 1; -webkit-font-feature-settings: "ss01" 1; }
        .blur-bg { background-color: rgba(255,255,255,0.4); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
      `}</style>

      {/* Loading overlay */}
      <div
        className={`fixed inset-0 w-full h-full bg-black z-40 pointer-events-none transition-opacity duration-1000 ${
          uiState.loading ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <Logo loading={uiState.loading} />

      {/* Header — full width, always visible, above mobile menu */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 pointer-events-none border-b border-white transition-opacity duration-1000 ${
          uiState.loading || uiState.isZoomed ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <p className="text-white text-xl leading-none text-center py-3">
          Andy Weitzel&nbsp;&nbsp;—&nbsp;&nbsp;Creative Director
        </p>
      </div>

      <Navigation
        activeCol={uiState.activeCol}
        isZoomed={uiState.isZoomed}
        loading={uiState.loading}
        menuOpen={uiState.menuOpen}
        onNavClick={(col) => actionsRef.current.navClick?.(col)}
        onMenuToggle={() => setUiState(s => ({ ...s, menuOpen: !s.menuOpen }))}
        onCvClick={() => setCvOpen(true)}
        onContactClick={() => setContactOpen(true)}
      />

      {/* CV overlay */}
      <ContentOverlay open={cvOpen} onClose={() => setCvOpen(false)}>
        <div className="max-w-4xl mx-auto px-6 py-20 text-white">
          <h1 className="text-6xl md:text-8xl mb-12">Andy Weitzel</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="md:col-span-1">
              <h2 className="text-sm uppercase tracking-widest mb-2">Role</h2>
              <p className="text-2xl">Creative Director &<br />Visual Artist</p>
            </div>
            <div className="md:col-span-2">
              <h2 className="text-sm uppercase tracking-widest mb-2">About</h2>
              <p className="text-xl leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
              </p>
            </div>
          </div>

          <hr className="border-white/20 mb-16" />

          <h2 className="text-3xl mb-8">Experience</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              { year: '2020 – Present', role: 'Creative Director', company: 'Studio Name' },
              { year: '2016 – 2020', role: 'Senior Art Director', company: 'Agency Name' },
              { year: '2012 – 2016', role: 'Art Director', company: 'Company Name' },
            ].map(({ year, role, company }) => (
              <div key={year} className="border-t border-white/20 pt-4">
                <p className="text-sm mb-1">{year}</p>
                <p className="text-lg">{role}</p>
                <p>{company}</p>
              </div>
            ))}
          </div>

          <hr className="border-white/20 mb-16" />

          <h2 className="text-3xl mb-8">Skills</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Brand Identity', 'Art Direction', 'Typography', 'Motion Design', 'Interactive', '3D / WebGL', 'Photography', 'Print'].map(s => (
              <div key={s} className="border border-white/20 px-4 py-3 text-sm">
                {s}
              </div>
            ))}
          </div>
        </div>
      </ContentOverlay>

      {/* Contact overlay */}
      <ContentOverlay open={contactOpen} onClose={() => setContactOpen(false)}>
        <div className="max-w-2xl mx-auto px-6 py-20 text-white">
          <h1 className="text-6xl md:text-8xl mb-12">Contact</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border-t border-white/20 pt-4">
              <p className="text-sm uppercase tracking-widest mb-1">Email</p>
              <p className="text-xl">hello@andyweitzel.com</p>
            </div>
            <div className="border-t border-white/20 pt-4">
              <p className="text-sm uppercase tracking-widest mb-1">Location</p>
              <p className="text-xl">New York, NY</p>
            </div>
            <div className="border-t border-white/20 pt-4">
              <p className="text-sm uppercase tracking-widest mb-1">Instagram</p>
              <p className="text-xl">@andyweitzel</p>
            </div>
            <div className="border-t border-white/20 pt-4">
              <p className="text-sm uppercase tracking-widest mb-1">LinkedIn</p>
              <p className="text-xl">linkedin.com/in/andyweitzel</p>
            </div>
          </div>
        </div>
      </ContentOverlay>

      {/* Project overlay */}
      <ProjectOverlay
        open={!!uiState.activeProject}
        project={uiState.activeProject}
        onClose={() => actionsRef.current.unzoom?.()}
      />

      {/* Top gradient */}
      <div className={`fixed top-0 left-0 w-full h-[25vh] z-20 pointer-events-none transition-opacity duration-1000 ${uiState.isZoomed ? 'opacity-0' : 'opacity-100'}`} style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 100%)' }} />
      {/* Bottom gradient */}
      <div className={`fixed bottom-0 left-0 w-full h-[25vh] z-20 pointer-events-none transition-opacity duration-1000 ${uiState.isZoomed ? 'opacity-0' : 'opacity-100'}`} style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 100%)' }} />

      {/* Three.js renders into this canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10" />
    </div>
  )
}
