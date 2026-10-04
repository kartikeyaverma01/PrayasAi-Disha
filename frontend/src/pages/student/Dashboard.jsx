import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaBriefcase,
  FaCheckCircle,
  FaChartLine,
  FaClipboardCheck,
  FaLightbulb,
  FaRegBookmark,
  FaUserCircle,
} from "react-icons/fa";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  fetchLiveInternships,
  calculateMatch,
} from "../../services/jobService";

const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
};

export default function Dashboard() {
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // NEW: profile loading state
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [profile, setProfile] = useState({});
  const [profileError, setProfileError] = useState("");

  const applications = read("prayasai_applications", []);
  const saved = read("prayasai_saved_internships", []);

  /* =========================================================
     LOAD STUDENT PROFILE
     ========================================================= */

  useEffect(() => {
    let active = true;

    if (!user?.email) {
      setProfile({});
      setProfileError("");
      setLoadingProfile(false);
      return () => {
        active = false;
      };
    }

    setLoadingProfile(true);
    setProfileError("");

    const loadProfile = async () => {
      try {
        const { data } = await api.get("/profile");

        if (active) {
          setProfile(data?.profile || {});
        }
      } catch (error) {
        console.error("Failed to load student profile:", error);

        if (active) {
          setProfile({});
          setProfileError(
            error.response?.status === 404
              ? "We couldn't find a student profile for this account."
              : "We couldn't load your profile. Please check that the backend is running and try again.",
          );
        }
      } finally {
        if (active) {
          setLoadingProfile(false);
        }
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [user?.email]);

  const recommendations = useMemo(
    () =>
      jobs
        .map((job) => calculateMatch(job, profile))
        .sort((a, b) => b.match - a.match)
        .slice(0, 3),
    [jobs, profile],
  );

  // Current profile fields
  const completionFields = [
    "fullName",
    "email",
    "phone",
    "college",
    "degree",
    "branch",
    "cgpa",
    "graduationYear",
    "skills",
    "interests",
    "preferredJobField",
    "preferredLocation",
    "preferredWorkMode",
  ];

  const completion = Math.round(
    (completionFields.filter((k) =>
      Array.isArray(profile[k]) ? profile[k].length : Boolean(profile[k]),
    ).length /
      completionFields.length) *
      100,
  );

  useEffect(() => {
    let active = true;

    fetchLiveInternships()
      .then(setJobs)
      .catch(() => setJobs([]))
      .finally(() => active && setLoadingJobs(false));

    return () => {
      active = false;
    };
  }, []);

  const stats = [
    {
      label: "Profile Completion",
      value: `${completion}%`,
      icon: <FaUserCircle />,
      tone: "primary",
    },
    {
      label: "Live AI Matches",
      value: loadingJobs ? "…" : String(jobs.length),
      icon: <FaLightbulb />,
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

  /* =========================================================
     NEW: PROFILE LOADING SCREEN
     ========================================================= */

  if (loadingProfile) {
    return (
      <div className="pd-app-page">
        <Navbar />

        <main className="dashboard-page py-4 py-lg-5">
          <div className="container">
            <div
              className="d-flex flex-column align-items-center justify-content-center text-center"
              style={{ minHeight: "55vh" }}
            >
              <div
                className="spinner-border text-primary mb-3"
                role="status"
                aria-hidden="true"
              />

              <h2 className="h4 fw-bold mb-2">Loading student data...</h2>

              <p className="text-muted mb-0">
                Retrieving your profile information.
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="pd-app-page">
        <Navbar />

        <main className="dashboard-page py-4 py-lg-5">
          <div className="container">
            <div className="alert alert-warning mb-0" role="alert">
              <h1 className="h4 fw-bold mb-2">Student profile unavailable</h1>
              <p className="mb-0">{profileError}</p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="pd-app-page">
      <Navbar />

      <main className="dashboard-page py-4 py-lg-5">
        <div className="container">
          <div className="dashboard-welcome mb-4">
            <div>
              <span className="eyebrow mb-2">Student Dashboard</span>

              <h1 className="h2 fw-bold mb-1">
                Welcome back, {profile?.fullName?.split(" ")[0] || "Student"} 👋
              </h1>

              <p className="text-muted mb-0">
                Live opportunities, your profile and your next career steps.
              </p>
            </div>

            <div className="d-flex flex-wrap gap-2">
              <Link
                to="/recommendations"
                className="btn btn-primary d-inline-flex align-items-center gap-2"
              >
                Find My Internship <FaArrowRight />
              </Link>

              <Link to="/mentorship" className="btn btn-outline-primary">
                Find a Mentor
              </Link>
            </div>
          </div>

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
            <div className="col-lg-8">
              <section className="dashboard-panel">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h2 className="h5 fw-bold mb-1">Top AI Recommendations</h2>

                    <small className="text-muted">
                      Calculated from your profile against live listings.
                    </small>
                  </div>

                  <Link className="small fw-semibold" to="/recommendations">
                    View all
                  </Link>
                </div>

                {loadingJobs ? (
                  <p className="text-muted mb-0">
                    Fetching live opportunities...
                  </p>
                ) : recommendations.length ? (
                  recommendations.map((item) => (
                    <RecommendationRow item={item} key={item.id} />
                  ))
                ) : (
                  <p className="text-muted mb-0">
                    No live opportunities are available right now.
                  </p>
                )}
              </section>

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

            <div className="col-lg-4">
              <section className="dashboard-panel">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="mini-panel-icon">
                    <FaChartLine />
                  </div>

                  <div>
                    <h2 className="h5 fw-bold mb-0">Profile Strength</h2>

                    <small className="text-muted">
                      Make your matches better
                    </small>
                  </div>
                </div>

                <div className="profile-progress mb-3">
                  <div
                    className="profile-progress-bar"
                    style={{ width: `${completion}%` }}
                  />
                </div>

                <div className="d-flex justify-content-between small mb-3">
                  <span className="text-muted">Profile completion</span>

                  <strong>{completion}%</strong>
                </div>

                <ul className="dashboard-checklist list-unstyled mb-4">
                  <li>
                    <FaCheckCircle /> Education & contact
                  </li>

                  <li>
                    <FaCheckCircle /> Skills & interests
                  </li>
                </ul>

                <Link to="/profile" className="btn btn-outline-primary w-100">
                  Manage Profile
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

function RecommendationRow({ item }) {
  return (
    <div className="recommendation-row d-flex align-items-center justify-content-between gap-3 py-3 border-top">
      <div className="min-w-0">
        <div className="d-flex align-items-center gap-2">
          <strong className="text-truncate">{item.role}</strong>

          <span className="match-badge small">{item.match}%</span>
        </div>

        <small className="text-muted">
          {item.company} · {item.location}
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
