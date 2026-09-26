import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowRight, FaCalendarCheck, FaCheckCircle, FaGraduationCap, FaSearch, FaStar, FaUserTie } from 'react-icons/fa'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

const mentors = [
  { id: 1, name: 'Kartik Singhal', role: 'Software Engineer · Product & Backend', company: 'Tech Industry', experience: '6+ years', rating: 4.9, sessions: 128, skills: ['Python', 'FastAPI', 'System Design'], availability: 'Today', initials: 'KS' },
  { id: 2, name: 'Kartikeya Verma', role: 'Frontend Engineer · Career Mentor', company: 'Product Engineering', experience: '5+ years', rating: 4.8, sessions: 94, skills: ['React', 'JavaScript', 'Portfolio'], availability: 'Tomorrow', initials: 'KV' },
  { id: 3, name: 'Keshav Mittal', role: 'Data & AI Mentor', company: 'AI/ML Team', experience: '7+ years', rating: 4.9, sessions: 156, skills: ['Python', 'ML', 'Interview Prep'], availability: 'This week', initials: 'KM' },
  { id: 4, name: 'Khushi Bhatti', role: 'Resume & Placement Mentor', company: 'Career Development', experience: '4+ years', rating: 4.7, sessions: 81, skills: ['Resume', 'LinkedIn', 'HR Interviews'], availability: 'Today', initials: 'KB' },
]

export default function Mentorship() {
  const [query, setQuery] = useState('')
  const [booked, setBooked] = useState(null)
  const filtered = useMemo(() => mentors.filter((mentor) => `${mentor.name} ${mentor.role} ${mentor.skills.join(' ')}`.toLowerCase().includes(query.toLowerCase())), [query])

  const book = (mentor) => setBooked(mentor)

  return (
    <div className="pd-app-page">
      <Navbar />
      <main className="mentorship-page py-4 py-lg-5">
        <div className="container">
          <section className="mentorship-hero mb-4">
            <div className="row align-items-center g-4">
              <div className="col-lg-7">
                <span className="eyebrow mb-2">Career Mentorship</span>
                <h1 className="display-6 fw-bold mb-3">Get guidance from people who have already done it.</h1>
                <p className="lead text-muted mb-4">Find a mentor for internships, projects, resumes, interviews, and your next career step — all inside PrayasAI Disha.</p>
                <div className="d-flex flex-wrap gap-2">
                  <a href="#mentors" className="btn btn-primary">Find a Mentor <FaArrowRight className="ms-2" /></a>
                  <Link to="/dashboard" className="btn btn-outline-secondary">Back to Dashboard</Link>
                </div>
              </div>
              <div className="col-lg-5">
                <div className="mentorship-preview">
                  <div className="preview-icon"><FaUserTie /></div>
                  <div><strong>Mentor Match</strong><p className="small text-muted mb-0">Based on your skills and career goals</p></div>
                  <div className="preview-match">94%</div>
                </div>
              </div>
            </div>
          </section>

          {booked && (
            <div className="alert alert-success d-flex align-items-center gap-2 mb-4" role="alert">
              <FaCheckCircle /> Session request sent to <strong>{booked.name}</strong>. This is a working demo — no external booking service is required.
              <button type="button" className="btn-close ms-auto" aria-label="Close" onClick={() => setBooked(null)} />
            </div>
          )}

          <section id="mentors">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
              <div><h2 className="h4 fw-bold mb-1">Available Mentors</h2><p className="text-muted small mb-0">Choose someone based on the help you need.</p></div>
              <div className="mentorship-search"><FaSearch /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search skills or mentors..." aria-label="Search mentors" /></div>
            </div>
            <div className="row g-4">
              {filtered.map((mentor) => <MentorCard key={mentor.id} mentor={mentor} onBook={book} />)}
            </div>
            {!filtered.length && <div className="empty-state mt-4"><FaSearch /><h3 className="h5 mt-3">No mentors found</h3><p>Try searching for React, Python, resume, or interview prep.</p></div>}
          </section>

          <section className="row g-4 mt-2">
            <div className="col-md-4"><Info icon={<FaGraduationCap />} title="Career Guidance" text="Discuss career paths and choose the right internship direction." /></div>
            <div className="col-md-4"><Info icon={<FaCalendarCheck />} title="1:1 Sessions" text="Request a focused session for a project, resume, or interview." /></div>
            <div className="col-md-4"><Info icon={<FaStar />} title="Trusted Mentors" text="See ratings, experience, and completed sessions before choosing." /></div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function MentorCard({ mentor, onBook }) {
  return <article className="mentor-card h-100">
    <div className="d-flex justify-content-between align-items-start gap-3">
      <div className="mentor-avatar">{mentor.initials}</div>
      <span className="mentor-availability">{mentor.availability}</span>
    </div>
    <h3 className="h5 fw-bold mt-3 mb-1">{mentor.name}</h3>
    <p className="small text-muted mb-2">{mentor.role}</p>
    <div className="small mb-3"><FaStar className="text-warning me-1" /> <strong>{mentor.rating}</strong> · {mentor.sessions} sessions · {mentor.experience}</div>
    <div className="d-flex flex-wrap gap-2 mb-4">{mentor.skills.map((skill) => <span className="skill-pill" key={skill}>{skill}</span>)}</div>
    <button className="btn btn-primary w-100" onClick={() => onBook(mentor)}>Request Mentorship <FaArrowRight className="ms-2" /></button>
  </article>
}

function Info({ icon, title, text }) {
  return <div className="dashboard-panel h-100"><div className="mini-panel-icon mb-3">{icon}</div><h3 className="h6 fw-bold">{title}</h3><p className="small text-muted mb-0">{text}</p></div>
}
