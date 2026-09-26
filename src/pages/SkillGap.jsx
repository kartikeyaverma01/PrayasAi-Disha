import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowRight, FaBrain, FaCheckCircle, FaExclamationTriangle, FaBookOpen, FaChartLine, FaUpload, FaTrash } from 'react-icons/fa'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { useAuth } from '../context/AuthContext'
import { analyzeResumeFile } from '../services/resumeAnalyzer'

const RESUME_PREFIX = 'prayasai_resume_'
const getResumeKey = (user) => `${RESUME_PREFIX}${String(user?.email || 'guest').toLowerCase()}`

export default function SkillGap() {
  const { user } = useAuth()
  const [stored, setStored] = useState(null)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const loadResume = () => {
    try { setStored(JSON.parse(localStorage.getItem(getResumeKey(user)) || 'null')) } catch { setStored(null) }
  }

  useEffect(() => { loadResume() }, [user])

  const handleUpload = async (file) => {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['pdf', 'docx', 'txt'].includes(ext)) { setError('Please upload a PDF, DOCX, or TXT resume.'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Resume must be smaller than 5 MB.'); return }
    setError('')
    setStatus('Processing your resume...')
    try {
      const analysis = await analyzeResumeFile(file)
      const next = { fileName: file.name, size: file.size, uploadedAt: new Date().toISOString(), analysis }
      localStorage.setItem(getResumeKey(user), JSON.stringify(next))
      setStored(next)
      setStatus('Resume uploaded and analyzed successfully.')
    } catch (err) {
      console.error(err)
      setStatus('')
      setError(err?.message === 'No readable text could be extracted from this resume.'
        ? 'The PDF was opened, but no readable text was found. If it is a scanned/image-only PDF, please upload a text-based PDF or DOCX.'
        : 'We could not read this resume in the browser. Please try another PDF, DOCX, or TXT file.')
    }
  }

  const removeResume = () => {
    localStorage.removeItem(getResumeKey(user))
    setStored(null)
    setStatus('')
    setError('')
  }

  const analysis = stored?.analysis
  const strongSkills = analysis?.matchedSkills || []
  const missingSkills = analysis?.missingSkills || []
  const levels = analysis?.skillLevels || []
  const learning = analysis?.recommendedLearningAreas || []

  return <div className="pd-app-page"><Navbar /><main className="skillgap-page py-4 py-lg-5"><div className="container">
    <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
      <div><span className="eyebrow mb-2">Resume-powered analysis</span><h1 className="display-6 fw-bold mb-2">Your Skill Gap</h1><p className="text-muted mb-0">Upload your resume and see the skills you have, the skills you need, and what to learn next.</p></div>
      <Link to="/recommendations" className="btn btn-primary">View Recommendations <FaArrowRight className="ms-2" /></Link>
    </div>

    <section className="dashboard-panel mb-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div><h2 className="h5 fw-bold mb-1"><FaUpload className="me-2" />Resume</h2><p className="small text-muted mb-0">Analysis runs in your browser; no backend or database is required.</p></div>
        <div className="d-flex gap-2 align-items-center"><label className="btn btn-primary mb-0"><FaUpload className="me-2" />{stored?.fileName ? 'Replace Resume' : 'Upload Resume'}<input hidden type="file" accept=".pdf,.docx,.txt" onChange={(e) => handleUpload(e.target.files?.[0])} /></label>{stored?.fileName && <button className="btn btn-outline-danger" type="button" onClick={removeResume}><FaTrash className="me-1" />Remove</button>}</div>
      </div>
      {stored?.fileName && <p className="small text-success mt-3 mb-0">✓ {stored.fileName} uploaded.</p>}
      {status && <p className="small text-success mt-2 mb-0">{status}</p>}
      {error && <p className="small text-danger mt-2 mb-0">{error}</p>}
    </section>

    {!analysis ? <section className="dashboard-panel text-center py-5"><FaBrain className="display-4 mb-3" /><h2 className="h3 fw-bold">Upload your resume to see your skill gap</h2><p className="text-muted mb-0">Once the resume is analyzed, your strengths, missing skills and recommended learning areas will appear here.</p></section> : <>
      <section className="dashboard-panel mb-4"><div className="d-flex align-items-center gap-2 mb-3"><div className="mini-panel-icon"><FaChartLine /></div><div><h2 className="h5 fw-bold mb-0">Skill Match</h2><small className="text-muted">Browser-based resume analysis</small></div></div><div className="row g-4 align-items-center"><div className="col-md-4 text-center"><div className="match-big"><span>{analysis.matchPercentage}%</span><small>Profile match</small></div></div><div className="col-md-8"><h3 className="h6 fw-bold">Strong skills</h3><div className="d-flex flex-wrap gap-2">{strongSkills.map((skill) => <span className="skill-pill matched" key={skill}><FaCheckCircle className="me-1" />{skill}</span>)}</div><h3 className="h6 fw-bold mt-4">Skills to improve</h3><div className="d-flex flex-wrap gap-2">{missingSkills.map((skill) => <span className="skill-pill missing" key={skill}><FaExclamationTriangle className="me-1" />{skill}</span>)}</div></div></div></section>
      <section className="dashboard-panel mb-4"><h2 className="h5 fw-bold mb-3">Current proficiency</h2>{levels.map(({skill, level}) => <div className="mb-3" key={skill}><div className="d-flex justify-content-between small mb-1"><span className="fw-semibold">{skill}</span><span className="text-muted">{level}%</span></div><div className="profile-progress"><div className="profile-progress-bar" style={{width:`${level}%`}} /></div></div>)}</section>
      <section className="dashboard-panel"><h2 className="h5 fw-bold mb-3"><FaBookOpen className="me-2" />Recommended learning areas</h2>{learning.map(({skill,reason}) => <div className="border rounded-3 p-3 mb-2" key={skill}><strong>{skill}</strong><p className="small text-muted mb-0 mt-1">{reason}</p></div>)}</section>
    </>}
  </div></main><Footer /></div>
}
