import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaBookmark,
  FaCheck,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaPaperPlane,
} from "react-icons/fa";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Modal from "../components/common/Modal";
import { useAuth } from "../context/AuthContext";

const SAVED_KEY = "prayasai_saved_recommendations";
const APPLICATIONS_KEY = "prayasai_applications";

const RECOMMENDATION_API_URL =
  import.meta.env.VITE_RECOMMENDATION_API_URL || "";

const getProfileKey = (authUser) =>
  `prayasai_profile_data_${String(authUser?.email || "").toLowerCase()}`;

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export default function RecommendationDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [saved, setSaved] = useState(() =>
    readJSON(SAVED_KEY, []).some((value) => String(value) === String(id)),
  );

  const [applications, setApplications] = useState(() =>
    readJSON(APPLICATIONS_KEY, []),
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [showApplied, setShowApplied] = useState(false);

  const profile = readJSON(getProfileKey(user), null);

  const [form, setForm] = useState({
    name: profile?.fullName || user?.fullName || "",
    email: profile?.email || user?.email || "",
    note: "",
  });

  /*
   * ---------------------------------------------------------
   * Fetch recommendation from ML/API
   * ---------------------------------------------------------
   *
   * Expected response:
   *
   * {
   *   "recommendations": [
   *     {
   *       "id": 101,
   *       "title": "Frontend Developer Intern",
   *       "company": "ABC",
   *       "location": "Noida",
   *       "skills": ["React", "JavaScript"],
   *       "match_percentage": 92,
   *       "source_url": "https://..."
   *     }
   *   ]
   * }
   *
   * No matching or score calculation is performed here.
   */

  useEffect(() => {
    let active = true;

    const loadRecommendation = async () => {
      setLoading(true);
      setError("");

      try {
        if (!RECOMMENDATION_API_URL) {
          if (active) {
            setItem(null);
          }

          return;
        }

        const response = await fetch(RECOMMENDATION_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user?.email || "",
          }),
        });

        if (!response.ok) {
          throw new Error(`Recommendation API returned ${response.status}`);
        }

        const data = await response.json();

        const recommendations = Array.isArray(data?.recommendations)
          ? data.recommendations
          : [];

        const found = recommendations.find(
          (recommendation) => String(recommendation.id) === String(id),
        );

        if (!active) return;

        if (!found) {
          setItem(null);
          return;
        }

        /*
         * Normalize API field names only.
         * No score/match calculation happens here.
         */
        setItem({
          ...found,

          id: found.id,

          title: found.title || found.role || "Internship",

          role: found.role || found.title || "Internship",

          company: found.company || "Company",

          location: found.location || "Location not specified",

          category: found.category || found.domain || found.job_field || "",

          mode: found.mode || found.work_mode || "",

          duration: found.duration || "",

          stipend: found.stipend || "Not specified",

          description: found.description || "No description available.",

          skills: Array.isArray(found.skills) ? found.skills : [],

          /*
           * This value is supplied by ML/API.
           */
          match_percentage: Number(
            found.match_percentage ?? found.matchPercentage ?? found.match ?? 0,
          ),

          source_url: found.source_url || found.sourceUrl || found.url || "",
        });
      } catch (err) {
        console.error("Recommendation details error:", err);

        if (active) {
          setItem(null);
          setError("Recommendation could not be loaded from the server.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadRecommendation();

    return () => {
      active = false;
    };
  }, [id, user?.email]);

  /*
   * ---------------------------------------------------------
   * Loading state
   * ---------------------------------------------------------
   */

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="empty-state page-empty">
          <h1 className="h4 fw-bold">Loading recommendation...</h1>
        </main>

        <Footer />
      </>
    );
  }

  /*
   * ---------------------------------------------------------
   * Not found
   * ---------------------------------------------------------
   */

  if (!item) {
    return (
      <>
        <Navbar />

        <main className="empty-state page-empty">
          <h1 className="h4 fw-bold">Recommendation not found</h1>

          <p className="text-muted mt-2">
            {error || "This recommendation is not available."}
          </p>

          <Link to="/recommendations" className="btn btn-primary mt-3">
            Back to recommendations
          </Link>
        </main>

        <Footer />
      </>
    );
  }

  /*
   * ---------------------------------------------------------
   * Application state
   * ---------------------------------------------------------
   */

  const alreadyApplied = applications.some(
    (app) => String(app.recommendationId) === String(item.id),
  );

  /*
   * ---------------------------------------------------------
   * Save / unsave
   * ---------------------------------------------------------
   */

  const toggleSave = () => {
    const ids = readJSON(SAVED_KEY, []);

    const isSaved = ids.some((value) => String(value) === String(item.id));

    const next = isSaved
      ? ids.filter((value) => String(value) !== String(item.id))
      : [...ids, item.id];

    localStorage.setItem(SAVED_KEY, JSON.stringify(next));

    setSaved(!isSaved);
  };

  /*
   * ---------------------------------------------------------
   * Application
   * ---------------------------------------------------------
   */

  const openApplication = () => {
    setForm({
      name: profile?.fullName || user?.fullName || "",

      email: profile?.email || user?.email || "",

      note: "",
    });

    setModalOpen(true);
  };

  const submitApplication = (e) => {
    e.preventDefault();

    const next = [
      ...applications,
      {
        id: Date.now(),
        recommendationId: item.id,
        appliedAt: Date.now(),
        internshipTitle: item.title || item.role,
        company: item.company,
        ...form,
      },
    ];

    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(next));

    setApplications(next);
    setModalOpen(false);
    setShowApplied(true);
  };

  /*
   * ---------------------------------------------------------
   * Original internship URL
   * ---------------------------------------------------------
   */

  const originalUrl = item.source_url || item.sourceUrl || item.url || "#";

  return (
    <div className="pd-app-page">
      <Navbar />

      <main className="details-page py-4 py-lg-5">
        <div className="container">
          {/* Back */}
          <Link to="/recommendations" className="back-link">
            <FaArrowLeft className="me-2" />
            Back to recommendations
          </Link>

          {/* Applied message */}
          {showApplied && (
            <div
              className="alert alert-success d-flex align-items-center gap-2 mt-3 mb-0"
              role="alert"
            >
              <FaCheckCircle />
              Application submitted for{" "}
              <strong>{item.title || item.role}</strong> at {item.company}.
              <button
                type="button"
                className="btn-close ms-auto"
                aria-label="Close"
                onClick={() => setShowApplied(false)}
              />
            </div>
          )}

          <div className="row g-4 mt-1">
            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <div className="col-lg-8">
              <section className="details-panel">
                {/* Internship header */}
                <div className="d-flex gap-3 align-items-start">
                  <div className="company-avatar xlarge">
                    {item.company?.[0] || "C"}
                  </div>

                  <div>
                    {item.category && (
                      <span className="eyebrow mb-2">{item.category}</span>
                    )}

                    <h1 className="h2 fw-bold mb-2 mt-2">
                      {item.title || item.role || "Internship"}
                    </h1>

                    <p className="lead text-muted mb-2">{item.company}</p>

                    <p className="small text-muted mb-0">
                      <FaMapMarkerAlt className="me-1" />

                      {item.location || "Location not specified"}

                      {item.mode ? ` · ${item.mode}` : ""}

                      {item.duration ? ` · ${item.duration}` : ""}
                    </p>
                  </div>
                </div>

                <hr className="my-4" />

                {/* About */}
                <h2 className="h5 fw-bold">About this internship</h2>

                <p className="text-muted lh-lg">
                  {item.description || "No description available."}
                </p>

                {/* Required skills */}
                <h2 className="h5 fw-bold mt-4">Required skills</h2>

                {item.skills?.length ? (
                  <div className="d-flex flex-wrap gap-2">
                    {item.skills.map((skill) => (
                      <span
                        className="skill-pill large"
                        key={`${item.id}-${skill}`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted small">No specific skills listed.</p>
                )}

                {/* ML explanation */}
                <h2 className="h5 fw-bold mt-4">Why this was recommended</h2>

                <div className="details-list">
                  <div className="d-flex align-items-start mb-3">
                    <FaCheckCircle className="me-2 text-success mt-1" />

                    <div>
                      <strong>AI match score</strong>

                      <p className="text-muted small mb-0">
                        This recommendation was returned by the ML
                        recommendation service using your profile.
                      </p>
                    </div>
                  </div>

                  {item.category && (
                    <div className="d-flex align-items-start">
                      <FaCheckCircle className="me-2 text-success mt-1" />

                      <div>
                        <strong>{item.category}</strong>

                        <p className="text-muted small mb-0">
                          Matches your selected career domain.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <div className="col-lg-4">
              <aside className="details-side">
                {/* Match */}
                <div className="match-big">
                  <span>{Number(item.match_percentage || 0)}%</span>

                  <small>AI match score</small>
                </div>

                {/* Facts */}
                <div className="detail-facts">
                  <div>
                    <small>Location</small>

                    <strong>{item.location || "Not specified"}</strong>
                  </div>

                  <div>
                    <small>Stipend</small>

                    <strong>{item.stipend || "Not specified"}</strong>
                  </div>

                  <div>
                    <small>Duration</small>

                    <strong>{item.duration || "Not specified"}</strong>
                  </div>

                  <div>
                    <small>Internship Type</small>

                    <strong>{item.mode || "Not specified"}</strong>
                  </div>
                </div>

                {/* Apply */}
                {alreadyApplied ? (
                  <button className="btn btn-success btn-lg w-100" disabled>
                    <FaCheck className="me-2" />
                    Applied
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary btn-lg w-100"
                    onClick={openApplication}
                  >
                    <FaPaperPlane className="me-2" />
                    Apply
                  </button>
                )}

                {/* Original site */}
                {originalUrl !== "#" && (
                  <a
                    className="btn btn-outline-primary w-100 mt-2"
                    href={originalUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open Original Internship
                  </a>
                )}

                {/* Save */}
                <button
                  type="button"
                  className={`btn w-100 mt-2 ${
                    saved ? "btn-primary" : "btn-outline-primary"
                  }`}
                  onClick={toggleSave}
                >
                  <FaBookmark className="me-2" />

                  {saved ? "Saved" : "Save Internship"}
                </button>

                {/* Back */}
                <Link
                  to="/recommendations"
                  className="btn btn-outline-secondary w-100 mt-2"
                >
                  Back to Recommendations
                </Link>

                <div className="small text-muted text-center mt-3">
                  Application details are stored locally for this frontend demo.
                </div>
              </aside>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* =====================================================
          APPLICATION MODAL
      ===================================================== */}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Apply to ${item.title || item.role || "Internship"}`}
      >
        <form onSubmit={submitApplication}>
          <p className="text-muted small mb-3">
            {item.company} · {item.location} · {item.stipend}
          </p>

          {/* Name */}
          <div className="mb-3">
            <label className="form-label small">Full Name</label>

            <input
              className="form-control"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              required
            />
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label small">Email</label>

            <input
              type="email"
              className="form-control"
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
              required
            />
          </div>

          {/* Note */}
          <div className="mb-3">
            <label className="form-label small">Why are you a good fit?</label>

            <textarea
              className="form-control"
              rows={3}
              placeholder="A couple of sentences about relevant projects or coursework..."
              value={form.note}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  note: e.target.value,
                }))
              }
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            <FaPaperPlane className="me-2" />
            Submit Application
          </button>
        </form>
      </Modal>
    </div>
  );
}
