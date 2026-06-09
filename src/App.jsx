import { useRef, useState, useEffect } from 'react'
import { useThreeScene } from './hooks/useThreeScene'
import { fetchPortfolios } from './sanity'
import Logo from './components/Logo'
import Navigation from './components/Navigation'
import ContentOverlay from './components/ContentOverlay'
import ProjectOverlay from './components/ProjectOverlay'
import IntroTypewriter from './components/IntroTypewriter'
import ProjectMenu from './components/ProjectMenu'
import './App.css'

export default function App() {
  const canvasRef = useRef(null)
  const [portfolios, setPortfolios] = useState(null)
  const [cvOpen, setCvOpen] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const [formStatus, setFormStatus] = useState('idle') // idle | submitting | success | error

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    setFormStatus('submitting')
    try {
      const data = new FormData(e.target)
      await fetch('https://submit.jotform.com/submit/261115069818055', { method: 'POST', body: data, mode: 'no-cors' })
      setFormStatus('success')
    } catch {
      setFormStatus('error')
    }
  }

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
    loading: false,
    activeProject: null,
    activeNav: 'intro',
  })

  // Passed as a ref so scroll/drag handlers can check it without re-running the effect
  const scrollDisabledRef = useRef(false)
  scrollDisabledRef.current = cvOpen || contactOpen || !!uiState.activeProject || uiState.activeNav === 'intro'

  const menuRef = useRef(null)
  const actionsRef = useThreeScene(canvasRef, setUiState, portfolios, scrollDisabledRef, menuRef)

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

      <Logo />

      {/* Header — full width, always visible, above mobile menu */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 pointer-events-none border-b border-white flex items-stretch transition-opacity duration-1000 ${
          uiState.loading || uiState.isZoomed ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <p className="text-white text-xl leading-none py-3 pl-[42px] pr-6 hidden md:flex items-center flex-shrink-0">
          Andy Weitzel&nbsp;&nbsp;—&nbsp;&nbsp;Creative Director
        </p>
        <div className={`absolute left-1/2 -translate-x-1/2 flex items-stretch transition-opacity duration-500 ${
          uiState.activeNav === 'works' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}>
          <button
            onClick={() => actionsRef.current.navClick?.(1)}
            className={`ui-element text-xl leading-none py-3 px-5 flex items-center transition-colors ${
              uiState.activeCol === 1 ? 'bg-white text-black' : 'text-white'
            }`}
          >
            Interactive
          </button>
          <button
            onClick={() => actionsRef.current.navClick?.(0)}
            className={`ui-element text-xl leading-none py-3 px-5 flex items-center transition-colors ${
              uiState.activeCol === 0 ? 'bg-white text-black' : 'text-white'
            }`}
          >
            Branding
          </button>
        </div>
      </div>

      <Navigation
        activeNav={uiState.activeNav}
        isZoomed={uiState.isZoomed}
        loading={uiState.loading}
        menuOpen={uiState.menuOpen}
        onMenuToggle={() => setUiState(s => ({ ...s, menuOpen: !s.menuOpen }))}
        onIntroClick={() => { actionsRef.current.showIntro?.(); setUiState(s => ({ ...s, activeNav: 'intro' })) }}
        onWorksClick={() => { actionsRef.current.hideIntro?.(); setUiState(s => ({ ...s, activeNav: 'works' })) }}
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

          {/* Jotform */}
          {formStatus === 'success' ? (
            <div className="mb-12 border border-white/20 p-8 text-xl">
              Message sent — thank you.
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="mb-12">
              <input type="hidden" name="formID" value="261115069818055" />
              <input type="hidden" name="apiKey" value="e031c082b71313437e17715928524edd" />
              <div className="mb-6">
                <label htmlFor="input_4" className="block text-xl mb-3">
                  Email <span className="text-white/60">*</span>
                </label>
                <input
                  type="email"
                  id="input_4"
                  name="q4_email"
                  required
                  placeholder="example@example.com"
                  autoComplete="email"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 p-4 text-xl focus:outline-none focus:border-white/60 transition-colors"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="input_2" className="block text-xl mb-3">
                  Message <span className="text-white/60">*</span>
                </label>
                <textarea
                  id="input_2"
                  name="q2_q2_textarea0"
                  required
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 p-4 text-xl resize-none focus:outline-none focus:border-white/60 transition-colors"
                  rows={6}
                />
              </div>
              {formStatus === 'error' && (
                <p className="text-white/60 mb-4">Something went wrong — please try again.</p>
              )}
              <button
                type="submit"
                disabled={formStatus === 'submitting'}
                className="border border-white/40 px-8 py-3 text-xl hover:bg-white hover:text-black transition-all disabled:opacity-40"
              >
                {formStatus === 'submitting' ? 'Sending…' : 'Send Message'}
              </button>
              <input type="hidden" name="website" value="" />
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border-t border-white/20 pt-4">
              <p className="text-sm uppercase tracking-widest mb-1">Instagram</p>
              <a href="https://www.instagram.com/andynewyork" target="_blank" rel="noopener noreferrer" className="text-xl hover:underline">@andynewyork</a>
            </div>
            <div className="border-t border-white/20 pt-4">
              <p className="text-sm uppercase tracking-widest mb-1">LinkedIn</p>
              <a href="https://linkedin.com/in/andyweitzel" target="_blank" rel="noopener noreferrer" className="text-xl hover:underline">linkedin.com/in/andyweitzel</a>
            </div>
            <div className="border-t border-white/20 pt-4">
              <p className="text-sm uppercase tracking-widest mb-1">Resides</p>
              <p className="text-xl">Ridgewood, Queens</p>
            </div>
            <div className="border-t border-white/20 pt-4">
              <p className="text-sm uppercase tracking-widest mb-1">Businesses</p>
              <div className="flex flex-col gap-1 text-xl">
                <a href="https://box.biz" target="_blank" rel="noopener noreferrer" className="hover:underline">Box Creative</a>
                <a href="https://dayworker.co" target="_blank" rel="noopener noreferrer" className="hover:underline">Dayworker</a>
                <a href="https://guru.guide" target="_blank" rel="noopener noreferrer" className="hover:underline">Guru</a>
              </div>
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

      <ProjectMenu
        ref={menuRef}
        items={portfolios ? portfolios[uiState.activeCol] : []}
        activeCol={uiState.activeCol}
        onItemClick={(idx) => actionsRef.current.scrollToRow?.(idx, uiState.activeCol)}
        visible={uiState.activeNav === 'works' && !uiState.isZoomed && !uiState.loading}
      />

      <IntroTypewriter active={uiState.activeNav === 'intro'} />

      {/* Top gradient */}
      <div className={`fixed top-0 left-0 w-full h-[25vh] z-20 pointer-events-none transition-opacity duration-1000 ${uiState.isZoomed || uiState.activeNav === 'intro' ? 'opacity-0' : 'opacity-100'}`} style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 100%)' }} />

      {/* Three.js renders into this canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10" />
    </div>
  )
}
