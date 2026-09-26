import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaBrain,
  FaChartLine,
  FaCommentDots,
  FaChartBar,
  FaSearch,
  FaClipboardList,
  FaBullseye,
  FaClipboardCheck,
  FaRocket,
} from "react-icons/fa";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useAuth } from "../context/AuthContext";

const steps = [
  {
    id: 1,
    icon: <FaClipboardList />,
    title: "Build Your Profile",
    description:
      "Add your education, skills, interests, and preferences so the engine knows what you bring to the table.",
  },
  {
    id: 2,
    icon: <FaBrain />,
    title: "AI Analyzes Your Profile",
    description:
      "The backend compares your profile against internship requirements using AI-driven analysis.",
  },
  {
    id: 3,
    icon: <FaBullseye />,
    title: "Match With Internships",
    description:
      "Every open internship gets scored against your profile, not the other way around.",
  },
  {
    id: 4,
    icon: <FaRocket />,
    title: "Get Personalized Recommendations",
    description:
      "Receive ranked internships with match percentages and a plain-language reason for each one.",
  },
];

const features = [
  {
    icon: <FaBrain />,
    title: "AI Internship Recommendations",
    description:
      "Internships ranked by how well they actually fit your profile, not just by posting date.",
  },
  {
    icon: <FaChartLine />,
    title: "Match Score",
    description:
      "A single, clear number for how closely an internship matches your skills and goals.",
  },
  {
    icon: <FaCommentDots />,
    title: "Explainable Recommendations",
    description:
      "Every match comes with the specific reasons behind it, so the score is never a black box.",
  },
  {
    icon: <FaChartBar />,
    title: "Skill Gap Analysis",
    description:
      "See exactly which missing skills are keeping you out of the internships you want.",
  },
  {
    icon: <FaSearch />,
    title: "Smart Internship Search",
    description:
      "Search and filter by domain, location, stipend, duration, and required skills.",
  },
  {
    icon: <FaClipboardCheck />,
    title: "Application Tracking",
    description:
      "Follow every application from submitted to selected, all from one timeline.",
  },
];

function HeroSection() {
  const { isAuthenticated } = useAuth();

  return (
    <section id="home" className="hero-section">
      <div className="container">
        <div className="row align-items-center gy-5 py-5">
          <div className="col-lg-6">
            <span className="eyebrow mb-3">AI-Powered Career Platform</span>
            <h1 className="display-5 fw-bold mb-3 hero-heading">
              Your Skills. Your Potential.
              <br />
              <span className="text-primary">Your Internship.</span>
            </h1>
            <p className="lead text-muted mb-4">
              AI-powered internship recommendations personalized to your skills,
              interests, academic profile, and career goals.
            </p>
            <div className="d-flex flex-column flex-sm-row gap-3">
              <Link
                to={isAuthenticated ? "/recommendations" : "/register"}
                className="btn btn-primary btn-lg px-4"
              >
                Find My Internship <FaArrowRight className="ms-2" />
              </Link>
              <Link
                to="/internships"
                className="btn btn-outline-secondary btn-lg px-4"
              >
                Explore Internships
              </Link>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="hero-visual">
              <div className="hero-glow" aria-hidden="true" />
              <div className="hero-chakra" aria-hidden="true">
                <span />
              </div>
              <div
                className="preview-card preview-card-back"
                aria-hidden="true"
              />
              <div className="preview-card">
                <div className="preview-card-header">
                  <div>
                    <p className="preview-eyebrow">AI MATCH</p>
                    <h3 className="preview-title">
                      Python Backend Developer Intern
                    </h3>
                    <p className="preview-company">
                      Tech Solutions Pvt. Ltd. · Noida
                    </p>
                  </div>
                  <div className="preview-score" aria-hidden="true">
                    <svg viewBox="0 0 80 80" className="preview-score-ring">
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        className="preview-score-track"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        className="preview-score-fill"
                        strokeDasharray="196.5 213.6"
                      />
                    </svg>
                    <span className="preview-score-value">92%</span>
                  </div>
                </div>
                <div className="preview-chips">
                  <span className="chip chip-match">Python</span>
                  <span className="chip chip-match">SQL</span>
                  <span className="chip chip-match">FastAPI</span>
                  <span className="chip chip-gap">2 gaps</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="section-alt py-5">
      <div className="container py-4">
        <div className="text-center mb-5">
          <span className="eyebrow mb-3">How It Works</span>
          <h2 className="fw-bold section-heading">
            From Profile To Placement In Four Steps
          </h2>
        </div>
        <div className="row g-4">
          {steps.map((step) => (
            <div className="col-12 col-md-6 col-lg-3" key={step.id}>
              <div className="step-card h-100">
                <div className="step-number">
                  {String(step.id).padStart(2, "0")}
                </div>
                <div className="step-icon">{step.icon}</div>
                <h3 className="h6 fw-bold mt-3">{step.title}</h3>
                <p className="text-muted small mb-0">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="py-5">
      <div className="container py-4">
        <div className="text-center mb-5">
          <span className="eyebrow mb-3">Features</span>
          <h2 className="fw-bold section-heading">
            Everything You Need To Land The Right Internship
          </h2>
        </div>
        <div className="row g-4">
          {features.map((feature) => (
            <div className="col-12 col-md-6 col-lg-4" key={feature.title}>
              <div className="feature-card h-100">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="h6 fw-bold mt-3">{feature.title}</h3>
                <p className="text-muted small mb-0">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="about" className="section-alt py-5">
      <div className="container py-4">
        <div className="row align-items-center gy-4">
          <div className="col-lg-7">
            <span className="eyebrow mb-3">About PrayasAI Disha</span>
            <h2 className="fw-bold section-heading mb-3">
              Built To Make Internship Hunting Less Random
            </h2>
            <p className="text-muted mb-0">
              Most students choose internships from a list they can't really
              evaluate. PrayasAI Disha compares your profile against real
              internship requirements and explains its reasoning in plain
              language, so you know exactly why an internship was recommended
              and exactly which skills would open up more of them.
            </p>
          </div>
          <div className="col-lg-5">
            <div className="row g-3">
              <div className="col-6">
                <div className="stat-box">
                  <h3 className="fw-bold text-primary mb-0">1,200+</h3>
                  <p className="small text-muted mb-0">Internships Listed</p>
                </div>
              </div>
              <div className="col-6">
                <div className="stat-box">
                  <h3 className="fw-bold text-primary mb-0">300+</h3>
                  <p className="small text-muted mb-0">Partner Companies</p>
                </div>
              </div>
              <div className="col-6">
                <div className="stat-box">
                  <h3 className="fw-bold text-primary mb-0">30+</h3>
                  <p className="small text-muted mb-0">Skills Tracked</p>
                </div>
              </div>
              <div className="col-6">
                <div className="stat-box">
                  <h3 className="fw-bold text-primary mb-0">6</h3>
                  <p className="small text-muted mb-0">Match Factors Weighed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="cta-section py-5">
      <div className="container text-center py-4">
        <h2 className="fw-bold text-white mb-3 section-heading">
          Ready to find your best-fit internship?
        </h2>
        <p className="text-white-50 mb-4 mx-auto" style={{ maxWidth: "32rem" }}>
          Create your profile in minutes and let PrayasAI Disha do the matching
          for you.
        </p>
        <Link to="/register" className="btn btn-light btn-lg px-4 fw-semibold">
          Get Started for Free
        </Link>
      </div>
    </section>
  );
}

export default function Landing() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <AboutSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
