export default function Logo({ loading }) {
  return (
    <div
      className="fixed pointer-events-none p-3 z-50 transition-all duration-[1200ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
      style={{
        top: loading ? '50%' : '30px',
        left: loading ? '50%' : '30px',
        transform: loading ? 'translate(-50%, -50%) scale(1.5)' : 'translate(0, 0) scale(1)',
        width: '15vw',
        minWidth: '120px',
        maxWidth: '220px',
        opacity: 1,
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 99.001"
        className="w-full h-auto relative"
      >
        <polygon points="168.754 0 186.675 49.5 200 0 168.754 0" fill="#fff" />
        <polygon points="0 99.001 31.246 99.001 13.325 49.5 0 99.001" fill="#fff" />
        <polygon points="117.606 0 153.446 99.001 173.35 99.001 178.187 81.032 148.851 0 117.606 0" fill="#fff" />
        <polygon points="66.457 0 102.298 99.001 122.201 99.001 127.038 81.032 97.702 0 66.457 0" fill="#fff" />
        <polygon points="26.65 0 21.813 17.969 51.149 99.001 82.394 99.001 46.554 0 26.65 0" fill="#fff" />
      </svg>
    </div>
  )
}
