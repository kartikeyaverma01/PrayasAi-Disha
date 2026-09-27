export default function Loading({ label = 'Loading...', fullHeight = true }) {
  return (
    <div
      className={`d-flex flex-column align-items-center justify-content-center py-5 ${
        fullHeight ? 'min-vh-50' : ''
      }`}
    >
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">{label}</span>
      </div>
      <p className="text-muted mt-3 mb-0 small">{label}</p>
    </div>
  )
}
