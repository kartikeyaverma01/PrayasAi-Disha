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
import { useAuth } from "../context/AuthContext";

const SAVED_KEY = "prayasai_saved_recommendations";

// Temporary API adapter.
// Replace this import/function with the ML team's API service
// when their endpoint is ready.
const RECOMMENDATION_API_URL =
  import.meta.env.VITE_RECOMMENDATION_API_URL || "";

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

  /*
   * ---------------------------------------------------------
   * Fetch recommendations from ML/API
   * ---------------------------------------------------------
   *
   * Expected API response:
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
   * The frontend does NOT calculate match percentage.
   */

  useEffect(() => {
    let active = true;

    const loadRecommendations = async () => {
      setLoading(true);
      setError("");

      try {
        /*
         * Until the ML endpoint is connected, we show an empty
         * recommendation state instead of calculating matches
         * locally.
         *
         * Once the ML team's endpoint is ready, this request
         * can be enabled.
         */

        if (!RECOMMENDATION_API_URL) {
          if (active) {
            setItems([]);
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

        const recommendations = Array.isArray(data?.recommendations)
          ? data.recommendations
          : [];

        /*
         * Normalize only field names.
         *
         * No score is calculated here.
         */
        const normalized = recommendations.map((item) => ({
          ...item,

          id: item.id,

          title: item.title || item.role || "Internship",

          role: item.role || item.title || "Internship",

          company: item.company || "Company",

          location: item.location || "Location",

          category: item.category || item.domain || item.job_field || "",

          mode: item.mode || item.work_mode || "",

          skills: Array.isArray(item.skills) ? item.skills : [],

          stipend: item.stipend || "Not specified",

          duration: item.duration || "",

          posted: item.posted || item.postedAt || "",

          /*
           * IMPORTANT:
           * This value comes from the ML/API response.
           */
          match_percentage: Number(
            item.match_percentage ?? item.matchPercentage ?? item.match ?? 0,
          ),

          source_url: item.source_url || item.sourceUrl || item.url || "",
        }));

        setItems(normalized);
      } catch (err) {
        console.error("Recommendation API error:", err);

        if (active) {
          setItems([]);
          setError("Recommendations could not be loaded from the server.");
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
  }, [user?.email]);

  /*
   * ---------------------------------------------------------
   * Filter options
   * ---------------------------------------------------------
   */

  const categories = useMemo(() => {
    return [
      ...new Set(items.map((item) => item.category).filter(Boolean)),
    ].sort();
  }, [items]);

  const locations = useMemo(() => {
    return [
      ...new Set(items.map((item) => item.location).filter(Boolean)),
    ].sort();
  }, [items]);

  /*
   * ---------------------------------------------------------
   * Search / filtering / sorting
   * ---------------------------------------------------------
   *
   * Sorting by match percentage is allowed because the
   * percentage is already supplied by the ML/API.
   *
   * The frontend does NOT calculate it.
   */

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    const list = items.filter((item) => {
      const searchable = [
        item.title,
        item.role,
        item.company,
        item.location,
        item.category,
        ...(Array.isArray(item.skills) ? item.skills : []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!q || searchable.includes(q)) &&
        (!category || item.category === category) &&
        (!location || item.location === location) &&
        Number(item.match_percentage || 0) >= Number(minMatch)
      );
    });

    return [...list].sort((a, b) => {
      if (sort === "stipend") {
        const stipendA = Number(String(a.stipend || "").replace(/[^0-9]/g, ""));

        const stipendB = Number(String(b.stipend || "").replace(/[^0-9]/g, ""));

        return stipendB - stipendA;
      }

      if (sort === "recent") {
        return Number(b.postedAt || 0) - Number(a.postedAt || 0);
      }

      /*
       * Highest ML-provided match first.
       */
      return Number(b.match_percentage || 0) - Number(a.match_percentage || 0);
    });
  }, [items, query, category, location, minMatch, sort]);

  /*
   * ---------------------------------------------------------
   * Saved internships
   * ---------------------------------------------------------
   */

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

  const topMatch = results[0]?.match_percentage;

  return (
    <div className="pd-app-page">
      <Navbar />

      <main className="internships-page py-4 py-lg-5">
        <div className="container">
          {/* Header */}
          <div className="mb-4">
            <span className="eyebrow mb-2">AI Recommendations</span>

            <h1 className="display-6 fw-bold mb-2">
              Opportunities matched to you.
            </h1>

            <p className="text-muted mb-0">
              Recommendations are provided by the PrayasAI Disha recommendation
              service based on your profile.
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="dashboard-panel mb-4">
              Fetching your recommendations...
            </div>
          )}

          {/* Error */}
          {error && <div className="alert alert-warning">{error}</div>}

          {/* Search */}
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
              <option value="match">Highest Match</option>

              <option value="recent">Recently Posted</option>

              <option value="stipend">Highest Stipend</option>
            </select>
          </div>

          {/* Filters */}
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

          {/* Result count */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="small text-muted">
              {results.length} recommendation
              {results.length === 1 ? "" : "s"} found
            </span>
          </div>

          {/* Cards */}
          <div className="row g-4">
            {results.map((item) => {
              const isTopMatch =
                Number(item.match_percentage || 0) === Number(topMatch || 0);

              return (
                <div className="col-12 col-lg-6" key={item.id}>
                  <article
                    className={`internship-card h-100 ${
                      isTopMatch ? "best-match" : ""
                    }`}
                  >
                    {/* Best Match */}
                    {isTopMatch && (
                      <div className="best-match-ribbon">
                        <FaTrophy className="me-1" />
                        Best Match
                      </div>
                    )}

                    {/* Header */}
                    <div className="d-flex justify-content-between gap-3">
                      <div className="d-flex gap-3 min-w-0">
                        <div className="company-avatar large">
                          {item.company?.[0] || "C"}
                        </div>

                        <div className="min-w-0">
                          <h2 className="h5 fw-bold mb-1">
                            {item.title || item.role || "Internship"}
                          </h2>

                          <p className="small text-muted mb-1">
                            {item.company}
                          </p>

                          <p className="small text-muted mb-0">
                            <FaMapMarkerAlt className="me-1" />

                            {item.location || "Location not specified"}

                            {item.mode ? ` · ${item.mode}` : ""}
                          </p>
                        </div>
                      </div>

                      {/* Save */}
                      <button
                        type="button"
                        className={`save-button ${
                          saved.includes(item.id) ? "saved" : ""
                        }`}
                        onClick={() => toggleSave(item.id)}
                        aria-label={
                          saved.includes(item.id)
                            ? "Remove saved internship"
                            : "Save internship"
                        }
                      >
                        <FaBookmark />
                      </button>
                    </div>

                    {/* Match */}
                    <div className="d-flex align-items-center justify-content-between mt-3">
                      <div className="match-badge">
                        <strong>{Number(item.match_percentage || 0)}%</strong>{" "}
                        match
                      </div>

                      {item.posted && (
                        <span className="small text-muted">{item.posted}</span>
                      )}
                    </div>

                    {/* Skills */}
                    {Array.isArray(item.skills) && item.skills.length > 0 && (
                      <div className="d-flex flex-wrap gap-2 my-3">
                        {item.skills.map((skill) => (
                          <span
                            className="skill-pill matched"
                            key={`${item.id}-${skill}`}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Meta */}
                    <div className="internship-meta">
                      {item.stipend && <span>{item.stipend}</span>}

                      {item.category && <span>{item.category}</span>}

                      {item.duration && <span>{item.duration}</span>}
                    </div>

                    {/* Details */}
                    <Link
                      className="btn btn-primary w-100 mt-3"
                      to={`/recommendations/${encodeURIComponent(item.id)}`}
                    >
                      View Details
                    </Link>
                  </article>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {!loading && !results.length && (
            <div className="empty-state">
              <FaSearch />

              <h2 className="h5 fw-bold mt-3">No recommendations found</h2>

              <p className="text-muted">
                {RECOMMENDATION_API_URL
                  ? "Try another search or reset your filters."
                  : "The ML recommendation API has not been connected yet."}
              </p>

              {(query || category || location || minMatch !== "0") && (
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={clearFilters}
                >
                  Reset Filters
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
