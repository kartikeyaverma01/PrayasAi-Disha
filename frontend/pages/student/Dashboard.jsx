import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaBriefcase,
  FaCheckCircle,
  FaChartLine,
  FaClipboardCheck,
  FaRegBookmark,
  FaUserCircle,
} from "react-icons/fa";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { useAuth } from "../../context/AuthContext";

const SAVED_KEY = "prayasai_saved_recommendations";
const APPLICATIONS_KEY = "prayasai_applications";

const RECOMMENDATION_API_URL =
  import.meta.env.VITE_RECOMMENDATION_API_URL || "";

const profileKey = (user) =>
  `prayasai_profile_data_${String(user?.email || "").toLowerCase()}`;

const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
};

export default function Dashboard() {
  const { user } = useAuth();

  const [recommendations, setRecommendations] = useState([]);

  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  const profile = read(profileKey(user), {});

  const applications = read(APPLICATIONS_KEY, []);

  const saved = read(SAVED_KEY, []);

  /*
   * ---------------------------------------------------------
   * Load ML recommendations
   * ---------------------------------------------------------
   *
   * The backend/ML team provides:
   *
   * {
   *   recommendations: [
   *     {
   *       id: 101,
   *       title: "Frontend Developer Intern",
   *       company: "ABC",
   *       location: "Noida",
   *       match_percentage: 92,
   *       source_url: "https://..."
   *     }
   *   ]
   * }
   *
   * The frontend does NOT calculate the match percentage.
   */

  useEffect(() => {
    let active = true;

    const loadRecommendations = async () => {
      setLoadingRecommendations(true);

      try {
        if (!RECOMMENDATION_API_URL) {
          if (active) {
            setRecommendations([]);
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

        if (!active) return;

        const apiRecommendations = Array.isArray(data?.recommendations)
          ? data.recommendations
          : [];

        /*
         * Only normalize the response.
         * No matching calculation happens here.
         */

        const normalized = apiRecommendations.map((item) => ({
          ...item,

          id: item.id,

          title: item.title || item.role || "Internship Opportunity",

          role: item.role || item.title || "Internship Opportunity",

          company: item.company || "Company",

          location: item.location || "Location",

          category: item.category || item.domain || item.job_field || "",

          match_percentage: Number(
            item.match_percentage ?? item.matchPercentage ?? item.match ?? 0,
          ),

          source_url: item.source_url || item.sourceUrl || item.url || "",
        }));

        /*
         * Sort using the score already provided
         * by the ML/backend service.
         */

        normalized.sort(
          (a, b) =>
            Number(b.match_percentage || 0) - Number(a.match_percentage || 0),
        );

        /*
         * Dashboard only needs the top 3.
         */
        setRecommendations(normalized.slice(0, 3));
      } catch (error) {
        console.error("Failed to load recommendations:", error);

        if (active) {
          setRecommendations([]);
        }
      } finally {
        if (active) {
          setLoadingRecommendations(false);
        }
      }
    };

    loadRecommendations();

    return () => {
      active = false;
    };
  }, [user?.email]);

  /*
   * ---------------------------------------------------------
   * Profile completion
   * ---------------------------------------------------------
   */

  const completionFields = [
    "fullName",
    "email",
    "phone",
    "college",
    "branch",
    "cgpa",
    "graduationYear",
    "skills",
    "interests",
    "preferredDomain",
    "preferredLocation",
    "github",
    "linkedin",
  ];

  const completion = useMemo(() => {
    const completed = completionFields.filter((key) => {
      const value = profile[key];

      return Array.isArray(value) ? value.length > 0 : Boolean(value);
    }).length;

    return Math.round((completed / completionFields.length) * 100);
  }, [profile]);

  /*
   * ---------------------------------------------------------
   * Dashboard statistics
   * ---------------------------------------------------------
   */

  const stats = [
    {
      label: "Profile Completion",
      value: `${completion}%`,
      icon: <FaUserCircle />,
      tone: "primary",
    },
    {
      label: "Recommendations",
      value: loadingRecommendations ? "…" : String(recommendations.length),
      icon: <FaChartLine />,
      tone: "accent",
    },
    {
      label: "Saved Internships",
      value: String(saved.length),
      icon: <FaRegBookmark />,
      tone: "warning",
    },
    {
      label: "Applications",
      value: String(applications.length),
      icon: <FaClipboardCheck />,
      tone: "success",
    },
  ];

  return (
    <div className="pd-app-page">
      <Navbar />

      <main className="dashboard-page py-4 py-lg-5">
        <div className="container">
          {/* =================================================
              WELCOME
          ================================================= */}

          <div className="dashboard-welcome mb-4">
            <div>
              <span className="eyebrow mb-2">Student Dashboard</span>

              <h1 className="h2 fw-bold mb-1">
                Welcome back, {user?.fullName?.split(" ")[0] || "Student"} 👋
              </h1>

              <p className="text-muted mb-0">
                Your profile, internship recommendations and career
                opportunities in one place.
              </p>
            </div>

            <div className="d-flex flex-wrap gap-2">
              <Link
                to="/recommendations"
                className="btn btn-primary d-inline-flex align-items-center gap-2"
              >
                Find My Internship
                <FaArrowRight />
              </Link>

              <Link to="/mentorship" className="btn btn-outline-primary">
                Find a Mentor
              </Link>
            </div>
          </div>

          {/* =================================================
              STATISTICS
          ================================================= */}

          <div className="row g-3 mb-4">
            {stats.map((stat) => (
              <div className="col-6 col-xl-3" key={stat.label}>
                <div className={`dashboard-stat stat-${stat.tone}`}>
                  <div className="dashboard-stat-icon">{stat.icon}</div>

                  <div>
                    <div className="dashboard-stat-value">{stat.value}</div>

                    <div className="dashboard-stat-label">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-4 align-items-start">
            {/* =================================================
                LEFT COLUMN
            ================================================= */}

            <div className="col-lg-8">
              {/* Recommendations */}
              <section className="dashboard-panel">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h2 className="h5 fw-bold mb-1">Top Recommendations</h2>

                    <small className="text-muted">
                      Recommendations are generated by the ML/AI system based on
                      your profile.
                    </small>
                  </div>

                  <Link className="small fw-semibold" to="/recommendations">
                    View all
                  </Link>
                </div>

                {loadingRecommendations ? (
                  <p className="text-muted mb-0">Loading recommendations...</p>
                ) : recommendations.length ? (
                  recommendations.map((item) => (
                    <RecommendationRow item={item} key={item.id} />
                  ))
                ) : (
                  <div>
                    <p className="text-muted mb-2">
                      No recommendations are available yet.
                    </p>

                    {!RECOMMENDATION_API_URL && (
                      <small className="text-muted">
                        Recommendations will appear once the ML recommendation
                        API is connected.
                      </small>
                    )}
                  </div>
                )}
              </section>

              {/* Application Snapshot */}
              <section className="dashboard-panel mt-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h2 className="h5 fw-bold mb-1">Application Snapshot</h2>

                    <small className="text-muted">
                      Your current application activity.
                    </small>
                  </div>

                  <FaBriefcase />
                </div>

                <p className="text-muted mb-0">
                  {applications.length
                    ? `You have ${applications.length} saved application${
                        applications.length === 1 ? "" : "s"
                      }.`
                    : "No applications submitted yet."}
                </p>
              </section>
            </div>

            {/* =================================================
                RIGHT COLUMN
            ================================================= */}

            <div className="col-lg-4">
              {/* Profile Strength */}
              <section className="dashboard-panel">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="mini-panel-icon">
                    <FaChartLine />
                  </div>

                  <div>
                    <h2 className="h5 fw-bold mb-0">Profile Strength</h2>

                    <small className="text-muted">
                      Complete your profile for better personalization
                    </small>
                  </div>
                </div>

                <div className="profile-progress mb-3">
                  <div
                    className="profile-progress-bar"
                    style={{
                      width: `${completion}%`,
                    }}
                  />
                </div>

                <div className="d-flex justify-content-between small mb-3">
                  <span className="text-muted">Profile completion</span>

                  <strong>{completion}%</strong>
                </div>

                <ul className="dashboard-checklist list-unstyled mb-4">
                  <li>
                    <FaCheckCircle />
                    Education &amp; contact
                  </li>

                  <li>
                    <FaCheckCircle />
                    Skills &amp; interests
                  </li>

                  <li>
                    <FaCheckCircle />
                    Preferred career field
                  </li>

                  <li>
                    <FaCheckCircle />
                    GitHub / LinkedIn
                  </li>
                </ul>

                <Link to="/profile" className="btn btn-outline-primary w-100">
                  Manage Profile
                </Link>
              </section>

              {/* Career Preferences */}
              <section className="dashboard-panel mt-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="mini-panel-icon">
                    <FaChartLine />
                  </div>

                  <div>
                    <h2 className="h5 fw-bold mb-0">Career Preferences</h2>

                    <small className="text-muted">
                      Used by the ML recommendation system
                    </small>
                  </div>
                </div>

                <div className="small">
                  <div className="mb-3">
                    <strong>Preferred Field</strong>

                    <div className="text-muted mt-1">
                      {profile.preferredDomain || "Not selected yet"}
                    </div>
                  </div>

                  <div className="mb-3">
                    <strong>Preferred Location</strong>

                    <div className="text-muted mt-1">
                      {profile.preferredLocation || "Not selected yet"}
                    </div>
                  </div>

                  <div>
                    <strong>Interests</strong>

                    <div className="text-muted mt-1">
                      {Array.isArray(profile.interests) &&
                      profile.interests.length
                        ? profile.interests.join(", ")
                        : "No interests selected yet"}
                    </div>
                  </div>
                </div>

                <Link to="/profile" className="btn btn-primary w-100 mt-3">
                  Update Preferences
                </Link>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* =========================================================
   RECOMMENDATION ROW
========================================================= */

function RecommendationRow({ item }) {
  const match = item.match_percentage ?? item.matchPercentage ?? item.match;

  const title = item.title ?? item.role ?? "Internship Opportunity";

  return (
    <div className="recommendation-row d-flex align-items-center justify-content-between gap-3 py-3 border-top">
      <div className="min-w-0">
        <div className="d-flex align-items-center gap-2">
          <strong className="text-truncate">{title}</strong>

          {match !== undefined && (
            <span className="match-badge small">{match}%</span>
          )}
        </div>

        <small className="text-muted">
          {item.company || "Company"}

          {" · "}

          {item.location || "Location"}
        </small>
      </div>

      <Link
        className="btn btn-sm btn-outline-primary"
        to={`/recommendations/${encodeURIComponent(item.id)}`}
      >
        View
      </Link>
    </div>
  );
}
