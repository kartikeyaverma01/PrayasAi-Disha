import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  FaArrowLeft, FaBookmark, FaCheckCircle, FaExclamationTriangle, FaMapMarkerAlt, FaPaperPlane, FaCheck,
} from 'react-icons/fa'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Modal from '../components/common/Modal'
import { useAuth } from '../context/AuthContext'
import { fetchLiveInternships, calculateMatch, internshipUrl } from '../services/jobService'

const SAVED_KEY = 'prayasai_saved_recommendations'
const APPLICATIONS_KEY = 'prayasai_applications'
const getProfileKey = (authUser) => `prayasai_profile_data_${String(authUser?.email || '').toLowerCase()}`

const BREAKDOWN_LABELS = [
  { key: 'skills', label: 'Skills' },
  { key: 'education', label: 'Education' },
  { key: 'interest', label: 'Interest' },
  { key: 'location', label: 'Location' },
  { key: 'experience', label: 'Experience' },
]

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export default function RecommendationDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { fetchLiveInternships().then((jobs) => { const found = jobs.find((job) => String(job.id) === String(id)); setItem(found ? calculateMatch(found, user) : null) }).catch(() => setItem(null)).finally(() => setLoading(false)) }, [id, user])

  const [saved, setSaved] = useState(() => readJSON(SAVED_KEY, []).some((value) => String(value) === String(id)))
  const [applications, setApplications] = useState(() => readJSON(APPLICATIONS_KEY, []))
  const [modalOpen, setModalOpen] = useState(false)
  const [showApplied, setShowApplied] = useState(false)

  const profile = readJSON(getProfileKey(user), null)
  const [form, setForm] = useState({
    name: profile?.fullName || user?.fullName || '',
    email: profile?.email || user?.email || '',
    note: '',
  })

  if (loading) return <><Navbar /><main className="empty-state page-empty"><h1 className="h4 fw-bold">Loading live recommendation...</h1></main><Footer /></>

  if (!item) {
    return (
      <>
        <Navbar />
        <main className="empty-state page-empty">
          <h1 className="h4 fw-bold">Recommendation not found</h1>
          <Link to="/recommendations" className="btn btn-primary mt-3">Back to recommendations</Link>
        </main>
        <Footer />
      </>
    )
  }

  const alreadyApplied = applications.some((app) => app.recommendationId === item.id)
  const requiredSkills = [...item.matchedSkills, ...item.missingSkills]

  const toggleSave = () => {
    const ids = readJSON(SAVED_KEY, [])
    const next = ids.some((value) => String(value) === String(item.id)) ? ids.filter((value) => String(value) !== String(item.id)) : [...ids, item.id]
    localStorage.setItem(SAVED_KEY, JSON.stringify(next))
    setSaved(!saved)
  }

  const submitApplication = (e) => {
    e.preventDefault()
    const next = [...applications, { id: Date.now(), recommendationId: item.id, appliedAt: Date.now(), ...form }]
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(next))
    setApplications(next)
    setModalOpen(false)
    setShowApplied(true)
  }

  return (
    <div className="pd-app-page">
      <Navbar />
      <main className="details-page py-4 py-lg-5">
        <div className="container">
          <Link to="/recommendations" className="back-link">
            <FaArrowLeft className="me-2" /> Back to recommendations
          </Link>

          {showApplied && (
            <div className="alert alert-success d-flex align-items-center gap-2 mt-3 mb-0" role="alert">
              <FaCheckCircle />
              Application submitted for {item.role} at {item.company}.
              <button type="button" className="btn-close ms-auto" aria-label="Close" onClick={() => setShowApplied(false)} />
            </div>
          )}

          <div className="row g-4 mt-1">
            <div className="col-lg-8">
              <section className="details-panel">
                <div className="d-flex gap-3 align-items-start">
                  <div className="company-avatar xlarge">{item.company[0]}</div>
                  <div>
                    <span className="eyebrow mb-2">{item.category}</span>
                    <h1 className="h2 fw-bold mb-2 mt-2">{item.role}</h1>
                    <p className="lead text-muted mb-2">{item.company}</p>
                    <p className="small text-muted mb-0">
                      <FaMapMarkerAlt className="me-1" /> {item.location} · {item.mode} · {item.duration}
                    </p>
                  </div>
                </div>

                <hr className="my-4" />

                <h2 className="h5 fw-bold">About this internship</h2>
                <p className="text-muted lh-lg">{item.description}</p>

                <h2 className="h5 fw-bold mt-4">Required skills</h2>
                <div className="d-flex flex-wrap gap-2">
                  {requiredSkills.map((skill) => (
                    <span className="skill-pill large" key={skill}>{skill}</span>
                  ))}
                </div>

                <h2 className="h5 fw-bold mt-4">Why this matches you</h2>
                <ul className="details-list">
                  {item.matchedSkills.map((skill) => (
                    <li key={skill} className="is-match">
                      <FaCheckCircle className="me-2 text-success" /> {skill}
                    </li>
                  ))}
                  <li className="is-match">
                    <FaCheckCircle className="me-2 text-success" /> {item.category} interest
                  </li>
                </ul>

                <h2 className="h5 fw-bold mt-4">Skill Gap</h2>
                <ul className="details-list">
                  {item.missingSkills.map((skill) => (
                    <li key={skill} className="is-gap">
                      <FaExclamationTriangle className="me-2" style={{ color: 'var(--pd-warning)' }} /> {skill}
                    </li>
                  ))}
                </ul>
                <Link to="/skill-gap" className="small fw-semibold text-decoration-none">
                  View your full Skill Gap &rarr;
                </Link>

                <h2 className="h5 fw-bold mt-4">Match Breakdown</h2>
                <div className="match-breakdown">
                  {BREAKDOWN_LABELS.map(({ key, label }) => {
                    const value = item.breakdown[key]
                    const max = item.breakdown[`${key}Max`]
                    return (
                      <div className="match-breakdown-row" key={key}>
                        <div className="d-flex justify-content-between mb-1">
                          <span className="small fw-semibold">{label}</span>
                          <span className="small text-muted">{value}/{max}</span>
                        </div>
                        <div className="profile-progress">
                          <div className="profile-progress-bar" style={{ width: `${max ? (value / max) * 100 : 0}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            </div>

            <div className="col-lg-4">
              <aside className="details-side">
                <div className="match-big">
                  <span>{item.match}%</span>
                  <small>AI match score</small>
                </div>
                <div className="detail-facts">
                  <div><small>Location</small><strong>{item.location}</strong></div>
                  <div><small>Stipend</small><strong>{item.stipend}</strong></div>
                  <div><small>Duration</small><strong>{item.duration}</strong></div>
                  <div><small>Internship Type</small><strong>{item.mode}</strong></div>
                </div>

                {alreadyApplied ? (
                  <button className="btn btn-success btn-lg w-100" disabled>
                    <FaCheck className="me-2" /> Applied
                  </button>
                ) : (
                  <a className="btn btn-primary btn-lg w-100" href={internshipUrl(item)} target="_blank" rel="noreferrer"><FaPaperPlane className="me-2" /> Apply on Original Site</a>
                )}
                <button className={`btn w-100 mt-2 ${saved ? 'btn-primary' : 'btn-outline-primary'}`} onClick={toggleSave}>
                  <FaBookmark className="me-2" /> {saved ? 'Saved' : 'Save Internship'}
                </button>
                <Link to="/recommendations" className="btn btn-outline-secondary w-100 mt-2">
                  Back to Recommendations
                </Link>
                <div className="small text-muted text-center mt-3">Application will require your profile and resume.</div>
              </aside>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Apply to ${item.role}`}>
        <form onSubmit={submitApplication}>
          <p className="text-muted small mb-3">{item.company} · {item.location} · {item.stipend}</p>
          <div className="mb-3">
            <label className="form-label small">Full Name</label>
            <input
              className="form-control"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label small">Email</label>
            <input
              type="email"
              className="form-control"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label small">Why are you a good fit?</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="A couple of sentences about relevant projects or coursework..."
              value={form.note}
              onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            <FaPaperPlane className="me-2" /> Submit Application
          </button>
        </form>
      </Modal>
    </div>
  )
}
