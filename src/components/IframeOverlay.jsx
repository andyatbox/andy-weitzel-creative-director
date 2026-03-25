export default function IframeOverlay({ showIframe, iframeUrl, onClose }) {
  return (
    <>
      {/* Close button */}
      <div
        className={`ui-element fixed top-5 right-7 w-[60px] h-[60px] rounded-full blur-bg shadow-sm text-black flex items-center justify-center cursor-pointer z-50 transition-transform hover:scale-110 ${showIframe ? 'flex' : 'hidden'}`}
        onClick={onClose}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </div>

      {/* Iframe */}
      <div
        className={`absolute inset-0 w-full h-full z-20 bg-transparent transition-opacity duration-500 ${
          showIframe ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        {iframeUrl && (
          <iframe
            src={iframeUrl}
            className="w-full h-full border-0 bg-transparent"
            allowTransparency="true"
            allow="cross-origin-isolated; autoplay; fullscreen"
          />
        )}
      </div>
    </>
  )
}
