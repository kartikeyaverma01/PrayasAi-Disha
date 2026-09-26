import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FaArrowLeft, FaCheckCircle, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { fetchLiveInternships, internshipUrl } from '../services/jobService'

export default function InternshipDetails() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { fetchLiveInternships().then((items) => setItem(items.find((x) => String(x.id) === String(id)))).catch(() => {}).finally(() => setLoading(false)) }, [id])
  if (loading) return <><Navbar /><main className="empty-state page-empty"><h1 className="h4 fw-bold">Loading live internship...</h1></main><Footer /></>
  if (!item) return <><Navbar /><main className="empty-state page-empty"><h1 className="h4 fw-bold">Internship not found</h1><Link to="/internships" className="btn btn-primary mt-3">Back to internships</Link></main><Footer /></>
  return <div className="pd-app-page"><Navbar /><main className="details-page py-4 py-lg-5"><div className="container"><Link to="/internships" className="back-link"><FaArrowLeft className="me-2" /> Back to internships</Link><div className="row g-4 mt-1"><div className="col-lg-8"><section className="details-panel"><div className="d-flex gap-3 align-items-start"><div className="company-avatar xlarge">{item.company[0]}</div><div><span className="eyebrow mb-2">{item.category}</span><h1 className="h2 fw-bold mb-2 mt-2">{item.role}</h1><p className="lead text-muted mb-2">{item.company}</p><p className="small text-muted mb-0"><FaMapMarkerAlt className="me-1" /> {item.location} · {item.mode}</p></div></div><hr className="my-4" /><h2 className="h5 fw-bold">About this internship</h2><p className="text-muted lh-lg" dangerouslySetInnerHTML={{__html:item.description}} /><h2 className="h5 fw-bold mt-4">Skills / tags</h2><div className="d-flex flex-wrap gap-2">{item.skills.map((skill) => <span className="skill-pill large" key={skill}><FaCheckCircle className="me-1" />{skill}</span>)}</div></section></div><div className="col-lg-4"><aside className="details-side"><div className="detail-facts"><div><small>Stipend</small><strong>{item.stipend}</strong></div><div><small>Location</small><strong>{item.location}</strong></div><div><small>Mode</small><strong>{item.mode}</strong></div><div><small>Posted</small><strong>{item.posted}</strong></div></div><a className="btn btn-primary btn-lg w-100" href={internshipUrl(item)} target="_blank" rel="noreferrer"><FaPaperPlane className="me-2" /> Apply on Original Site</a></aside></div></div></div></main><Footer /></div>
}
