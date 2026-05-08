export default function Logo() {
  return (
    <div
      className="fixed pointer-events-none p-3 z-50"
      style={{
        top: '54px',
        left: '30px',
        width: '15vw',
        minWidth: '120px',
        maxWidth: '190px',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 96.915"
        className="w-full h-auto relative"
      >
        <polygon points="130.73 96.915 100.142 96.915 69.27 0 99.858 0 130.73 96.915" fill="#fff"/>
        <polygon points="169.413 0 184.849 48.458 200 0 169.413 0" fill="#fff"/>
        <polygon points="30.587 96.915 15.151 48.458 0 96.915 30.587 96.915" fill="#fff"/>
        <polygon points="149.929 0 119.341 0 150.214 96.915 169.698 96.915 175.198 79.325 149.929 0" fill="#fff"/>
        <polygon points="30.302 0 24.802 17.59 50.071 96.915 80.659 96.915 49.786 0 30.302 0" fill="#fff"/>
      </svg>
    </div>
  )
}
