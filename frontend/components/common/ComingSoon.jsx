import { Link } from 'react-router-dom'
import { FaTools, FaArrowLeft } from 'react-icons/fa'

/**
 * Temporary stand-in for pages scheduled in a later build phase (see
 * PROGRESS.md). Keeps every route in the spec live and navigable now,
 * without pretending a page is finished before it is.
 */
export default function ComingSoon({ title, phase }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center text-center px-3 py-5 min-vh-75">
      <div className="coming-soon-icon mb-3">
        <FaTools />
      </div>
      <h2 className="fw-bold mb-2">{title}</h2>
      <p className="text-muted mb-1" style={{ maxWidth: '28rem' }}>
        This screen is scheduled for {phase || 'a later build phase'} and isn&apos;t wired up yet.
      </p>
      <p className="text-muted mb-4 small">Everything you can already try lives on the dashboard and public pages.</p>
      <Link to="/" className="btn btn-outline-primary">
        <FaArrowLeft className="me-2" />
        Back to Home
      </Link>
    </div>
  )
}
