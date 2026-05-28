export default function Loading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="ms-pixel-panel px-10 py-8 text-center">
        <div style={{ fontFamily: 'var(--ms-font-d)', fontSize: 10, color: '#c64b1b', letterSpacing: 2 }}>
          LOADING…
        </div>
      </div>
    </div>
  )
}
