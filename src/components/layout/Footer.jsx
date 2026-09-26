import { Link } from 'react-router-dom'
import { FaBriefcase, FaLinkedin, FaTwitter, FaGithub, FaEnvelope } from 'react-icons/fa'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="app-footer pt-5 pb-4 mt-auto">
      <div className="container">
        <div className="row gy-4">
          <div className="col-12 col-md-4">
            <div className="d-flex align-items-center fw-bold h5 mb-3 text-white">
              <FaBriefcase className="me-2 text-primary-light" />
              PrayasAI Disha
            </div>
            <p className="text-secondary small mb-0">
              AI-powered internship recommendations personalized to your skills, interests,
              academic profile, and career goals.
            </p>
          </div>

          <div className="col-6 col-md-2">
            <h6 className="text-uppercase small fw-bold text-secondary mb-3">Product</h6>
            <ul className="list-unstyled small">
              <li className="mb-2">
                <a href="#how-it-works" className="footer-link">
                  How It Works
                </a>
              </li>
              <li className="mb-2">
                <a href="#features" className="footer-link">
                  Features
                </a>
              </li>
              <li className="mb-2">
                <a href="#about" className="footer-link">
                  About
                </a>
              </li>
            </ul>
          </div>

          <div className="col-6 col-md-3">
            <h6 className="text-uppercase small fw-bold text-secondary mb-3">Get Started</h6>
            <ul className="list-unstyled small">
              <li className="mb-2">
                <Link to="/register" className="footer-link">
                  Create an Account
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/login" className="footer-link">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-12 col-md-3">
            <h6 className="text-uppercase small fw-bold text-secondary mb-3">Connect</h6>
            <div className="d-flex gap-3 fs-5">
              <a href="#" className="footer-link" aria-label="LinkedIn">
                <FaLinkedin />
              </a>
              <a href="#" className="footer-link" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="#" className="footer-link" aria-label="GitHub">
                <FaGithub />
              </a>
              <a href="#" className="footer-link" aria-label="Email">
                <FaEnvelope />
              </a>
            </div>
          </div>
        </div>

        <hr className="border-secondary opacity-25 mt-4 mb-3" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center small text-secondary gap-2">
          <span>© {year} PrayasAI Disha. Built for student innovation.</span>
          <span>Made for students, by students.</span>
        </div>
      </div>
    </footer>
  )
}
