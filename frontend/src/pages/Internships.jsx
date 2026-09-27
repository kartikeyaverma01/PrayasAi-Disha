import { useEffect, useMemo, useState } from "react";
import {
  FaBookmark,
  FaMapMarkerAlt,
  FaSearch,
  FaSlidersH,
} from "react-icons/fa";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

import { fetchLiveInternships, internshipUrl } from "../services/jobService";

const SAVED_KEY = "prayasai_saved_internships";

export default function Internships() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("recent");

  const [saved, setSaved] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const [showFilters, setShowFilters] = useState(false);

  /* =====================================================
     LOAD INTERNSHIPS
  ===================================================== */

  useEffect(() => {
    let active = true;

    setLoading(true);

    fetchLiveInternships()
      .then((jobs) => {
        if (!active) return;

        // Normal internship catalogue only.
        // No frontend matching or recommendation calculation.
        setItems(Array.isArray(jobs) ? jobs : []);
      })
      .catch((err) => {
        console.error("Could not load internships:", err);

        if (active) {
          setItems([]);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  /* =====================================================
     LOCATION OPTIONS
  ===================================================== */

  const locations = useMemo(() => {
    return [
      ...new Set(items.map((item) => item.location).filter(Boolean)),
    ].sort();
  }, [items]);

  /* =====================================================
     CATEGORY OPTIONS
  ===================================================== */

  const categories = useMemo(() => {
    return [
      ...new Set(items.map((item) => item.category).filter(Boolean)),
    ].sort();
  }, [items]);

  /* =====================================================
     SEARCH + FILTER + SORT
  ===================================================== */

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    const list = items.filter((item) => {
      const searchable = `
        ${item.role || ""}
        ${item.title || ""}
        ${item.company || ""}
        ${item.location || ""}
        ${item.category || ""}
        ${(item.skills || []).join(" ")}
      `.toLowerCase();

      const matchesSearch = !q || searchable.includes(q);

      const matchesLocation = !location || item.location === location;

      const matchesCategory = !category || item.category === category;

      return matchesSearch && matchesLocation && matchesCategory;
    });

    return [...list].sort((a, b) => {
      if (sort === "stipend") {
        const stipendA = Number(String(a.stipend || "").replace(/[^0-9]/g, ""));

        const stipendB = Number(String(b.stipend || "").replace(/[^0-9]/g, ""));

        return stipendB - stipendA;
      }

      if (sort === "recent") {
        return (b.postedAt || 0) - (a.postedAt || 0);
      }

      // Default catalogue order.
      return 0;
    });
  }, [items, query, location, category, sort]);

  /* =====================================================
     SAVE / UNSAVE
  ===================================================== */

  const toggleSave = (id) => {
    const next = saved.includes(id)
      ? saved.filter((value) => value !== id)
      : [...saved, id];

    setSaved(next);

    localStorage.setItem(SAVED_KEY, JSON.stringify(next));
  };

  /* =====================================================
     RESET FILTERS
  ===================================================== */

  const resetFilters = () => {
    setQuery("");
    setLocation("");
    setCategory("");
    setSort("recent");
  };

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="pd-app-page">
      <Navbar />

      <main className="internships-page py-4 py-lg-5">
        <div className="container">
          {/* HEADER */}

          <div className="mb-4">
            <span className="eyebrow mb-2">Internship Marketplace</span>

            <h1 className="display-6 fw-bold mb-2">
              Explore internship opportunities.
            </h1>

            <p className="text-muted mb-0">
              Browse internship opportunities across India and find roles that
              match your interests and career goals.
            </p>
          </div>

          {/* SEARCH PANEL */}

          <div className="internship-search-panel mb-4">
            <div className="search-input-wrap flex-grow-1">
              <FaSearch />

              <input
                type="text"
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
              <option value="recent">Recently posted</option>

              <option value="stipend">Highest stipend</option>
            </select>
          </div>

          {/* FILTERS */}

          <div
            className={`row g-3 mb-4 ${showFilters ? "" : "d-none d-lg-flex"}`}
          >
            {/* LOCATION */}

            <div className="col-md-6 col-lg-4">
              <select
                className="form-select"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="">All locations</option>

                {locations.map((value) => (
                  <option value={value} key={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            {/* CATEGORY */}

            <div className="col-md-6 col-lg-4">
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All categories</option>

                {categories.map((value) => (
                  <option value={value} key={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            {/* RESULT COUNT + RESET */}

            <div className="col-lg-4 d-flex align-items-center justify-content-lg-end gap-2">
              <span className="small text-muted">
                {results.length}{" "}
                {results.length === 1 ? "internship" : "internships"} found
              </span>

              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={resetFilters}
              >
                Reset
              </button>
            </div>
          </div>

          {/* LOADING */}

          {loading && (
            <div className="dashboard-panel mb-4">
              Loading internship opportunities...
            </div>
          )}

          {/* INTERNSHIP CARDS */}

          {!loading && (
            <div className="row g-4">
              {results.map((item) => (
                <div className="col-12 col-lg-6" key={item.id}>
                  <InternshipCard
                    item={item}
                    saved={saved.includes(item.id)}
                    onSave={() => toggleSave(item.id)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* EMPTY STATE */}

          {!loading && !results.length && (
            <div className="empty-state">
              <FaSearch />

              <h2 className="h5 fw-bold mt-3">No internships found</h2>

              <p className="text-muted">Try changing your search or filters.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* =========================================================
   INTERNSHIP CARD
========================================================= */

function InternshipCard({ item, saved, onSave }) {
  const companyName = item.company || "Company";

  const companyInitial = companyName.charAt(0).toUpperCase();

  return (
    <article className="internship-card h-100">
      {/* HEADER */}

      <div className="d-flex justify-content-between gap-3">
        <div className="d-flex gap-3 min-w-0">
          <div className="company-avatar large">{companyInitial}</div>

          <div className="min-w-0">
            <h2 className="h5 fw-bold mb-1 text-truncate">
              {item.role || item.title || "Internship Opportunity"}
            </h2>

            <p className="small text-muted mb-1">{companyName}</p>

            <p className="small text-muted mb-0">
              <FaMapMarkerAlt className="me-1" />

              {item.location || "India"}

              {" · "}

              {item.mode || "On-site"}
            </p>
          </div>
        </div>

        {/* SAVE BUTTON */}

        <button
          type="button"
          className={`save-button ${saved ? "saved" : ""}`}
          onClick={onSave}
          aria-label={saved ? "Remove saved internship" : "Save internship"}
        >
          <FaBookmark />
        </button>
      </div>

      {/* POSTED DATE */}

      <div className="d-flex align-items-center justify-content-end mt-3">
        <span className="small text-muted">
          {item.posted || "Recently posted"}
        </span>
      </div>

      {/* SKILLS */}

      {item.skills?.length > 0 && (
        <div className="d-flex flex-wrap gap-2 my-3">
          {item.skills.map((skill) => (
            <span className="skill-pill" key={skill}>
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* META */}

      <div className="internship-meta">
        <span>{item.stipend || "Stipend not specified"}</span>

        <span>{item.duration || "Duration not specified"}</span>

        <span>{item.category || "Other"}</span>
      </div>

      {/* LIVE LISTING */}

      <a
        className="btn btn-primary w-100 mt-3"
        href={internshipUrl(item)}
        target="_blank"
        rel="noreferrer"
      >
        View Internship
      </a>
    </article>
  );
}
