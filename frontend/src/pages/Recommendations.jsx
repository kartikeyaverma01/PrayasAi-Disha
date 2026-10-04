import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBookmark,
  FaMapMarkerAlt,
  FaSearch,
  FaSlidersH,
  FaTrophy,
} from "react-icons/fa";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import api from "../services/api";
import { fetchLiveInternships, calculateMatch } from "../services/jobService";
import { useAuth } from "../context/AuthContext";

const SAVED_KEY = "prayasai_saved_internships";

const getProfileKey = (authUser) =>
  `prayasai_profile_data_${String(authUser?.email || "").toLowerCase()}`;

const readProfile = (authUser) => {
  try {
    const key = getProfileKey(authUser);

    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    return {};
  }
};

export default function Recommendations() {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [minMatch, setMinMatch] = useState("0");
  const [sort, setSort] = useState("match");
  const [showFilters, setShowFilters] = useState(false);

  const [saved, setSaved] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    let active = true;

    const loadRecommendations = async () => {
      try {
        setLoading(true);
        setError("");

        const jobs = await fetchLiveInternships();

        const { data } = await api.get("/profile");
        const currentProfile = data?.profile || {};

        const matchedJobs = jobs.map((job) =>
          calculateMatch(job, currentProfile),
        );

        if (active) {
          setItems(matchedJobs);
        }
      } catch (e) {
        console.error("Failed to load recommendations:", e);

        if (active) {
          setError("Live opportunities could not be loaded.");
          setItems([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadRecommendations();

    return () => {
      active = false;
    };
  }, [user]);

  const categories = [
    ...new Set(items.map((item) => item.category).filter(Boolean)),
  ].sort();

  const locations = [
    ...new Set(items.map((item) => item.location).filter(Boolean)),
  ].sort();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    const list = items.filter((item) => {
      const searchable = `
        ${item.role || ""}
        ${item.company || ""}
        ${item.location || ""}
        ${item.category || ""}
        ${(item.skills || []).join(" ")}
      `.toLowerCase();

      return (
        (!q || searchable.includes(q)) &&
        (!category || item.category === category) &&
        (!location || item.location === location) &&
        item.match >= Number(minMatch)
      );
    });

    return [...list].sort((a, b) => {
      if (sort === "stipend") {
        return (
          Number(b.stipend?.toString().replace(/[^0-9]/g, "") || 0) -
          Number(a.stipend?.toString().replace(/[^0-9]/g, "") || 0)
        );
      }

      if (sort === "recent") {
        return (b.postedAt || 0) - (a.postedAt || 0);
      }

      return b.match - a.match;
    });
  }, [items, query, category, location, minMatch, sort]);

  const toggleSave = (id) => {
    const next = saved.includes(id)
      ? saved.filter((value) => value !== id)
      : [...saved, id];

    setSaved(next);

    localStorage.setItem(SAVED_KEY, JSON.stringify(next));
  };

  const clearFilters = () => {
    setQuery("");
    setCategory("");
    setLocation("");
    setMinMatch("0");
    setSort("match");
  };

  const top = results[0]?.match;

  return (
    <div className="pd-app-page">
      <Navbar />

      <main className="internships-page py-4 py-lg-5">
        <div className="container">
          {/* HEADER */}
          <div className="mb-4">
            <span className="eyebrow mb-2">Live AI Recommendations</span>

            <h1 className="display-6 fw-bold mb-2">
              Opportunities matched to you.
            </h1>

            <p className="text-muted mb-0">
              Live internship listings are fetched online and scored locally
              against your profile.
            </p>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="dashboard-panel mb-4">
              Fetching live internship opportunities...
            </div>
          )}

          {/* ERROR */}
          {error && <div className="alert alert-warning">{error}</div>}

          {/* SEARCH + SORT */}
          <div className="internship-search-panel mb-3">
            <div className="search-input-wrap flex-grow-1">
              <FaSearch />

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search role, company, skills..."
              />
            </div>

            <button
              type="button"
              className="btn btn-outline-secondary filter-toggle"
              onClick={() => setShowFilters((value) => !value)}
            >
              <FaSlidersH className="me-2" />

              {showFilters ? "Hide Filters" : "Filters"}
            </button>

            <select
              className="form-select sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="match">Best match</option>

              <option value="recent">Recently posted</option>

              <option value="stipend">Highest stipend</option>
            </select>
          </div>

          {/* FILTERS */}
          <div
            className={`row g-3 mb-4 ${showFilters ? "" : "d-none d-lg-flex"}`}
          >
            <div className="col-md-4">
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All categories</option>

                {categories.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <select
                className="form-select"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="">All locations</option>

                {locations.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4 d-flex gap-2">
              <select
                className="form-select"
                value={minMatch}
                onChange={(e) => setMinMatch(e.target.value)}
              >
                <option value="0">Any match %</option>

                <option value="60">60%+</option>

                <option value="75">75%+</option>

                <option value="85">85%+</option>
              </select>

              <button
                type="button"
                className="btn btn-outline-secondary text-nowrap"
                onClick={clearFilters}
              >
                Reset
              </button>
            </div>
          </div>

          {/* RESULT COUNT */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="small text-muted">
              {results.length} live internships found
            </span>
          </div>

          {/* CARDS */}
          <div className="row g-4">
            {results.map((item) => (
              <div className="col-12 col-lg-6" key={item.id}>
                <article
                  className={`internship-card h-100 ${
                    item.match === top ? "best-match" : ""
                  }`}
                >
                  {/* BEST MATCH */}
                  {item.match === top && (
                    <div className="best-match-ribbon">
                      <FaTrophy className="me-1" />
                      Best Match
                    </div>
                  )}

                  {/* HEADER */}
                  <div className="d-flex justify-content-between gap-3">
                    <div className="d-flex gap-3 min-w-0">
                      <div className="company-avatar large">
                        {item.company?.[0] || "C"}
                      </div>

                      <div className="min-w-0">
                        <h2 className="h5 fw-bold mb-1">{item.role}</h2>

                        <p className="small text-muted mb-1">{item.company}</p>

                        <p className="small text-muted mb-0">
                          <FaMapMarkerAlt className="me-1" />
                          {item.location} · {item.mode}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`save-button ${
                        saved.includes(item.id) ? "saved" : ""
                      }`}
                      onClick={() => toggleSave(item.id)}
                    >
                      <FaBookmark />
                    </button>
                  </div>

                  {/* MATCH */}
                  <div className="d-flex align-items-center justify-content-between mt-3">
                    <div className="match-badge">
                      <strong>{item.match}%</strong> match
                    </div>

                    <span className="small text-muted">{item.posted}</span>
                  </div>

                  {/* SKILLS */}
                  <div className="d-flex flex-wrap gap-2 my-3">
                    {item.matchedSkills?.map((skill) => (
                      <span
                        className="skill-pill matched"
                        key={`m-${item.id}-${skill}`}
                      >
                        {skill}
                      </span>
                    ))}

                    {item.missingSkills?.map((skill) => (
                      <span
                        className="skill-pill missing"
                        key={`x-${item.id}-${skill}`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* META */}
                  <div className="internship-meta">
                    <span>{item.stipend}</span>

                    <span>{item.category}</span>
                  </div>

                  {/* DETAILS */}
                  <Link
                    className="btn btn-primary w-100 mt-3"
                    to={`/recommendations/${encodeURIComponent(item.id)}`}
                  >
                    View Details
                  </Link>
                </article>
              </div>
            ))}
          </div>

          {/* EMPTY */}
          {!loading && !results.length && (
            <div className="empty-state">
              <FaSearch />

              <h2 className="h5 fw-bold mt-3">No live recommendations found</h2>

              <p className="text-muted">
                Try another search or reset your filters.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
