import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBriefcase, FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const navLinks = [
  {
    href: "#home",
    label: "Home",
  },
  {
    href: "/mentorship",
    label: "Mentorship",
    internal: true,
  },
  {
    href: "#how-it-works",
    label: "How It Works",
  },
  {
    href: "#features",
    label: "Features",
  },
  {
    href: "#about",
    label: "About",
  },
];

/*
 * Navigation shown after login.
 *
 * Skill Gap has intentionally been removed because
 * resume analysis, OCR and skill-gap logic belong to
 * the ML/backend team.
 */
const appNavLinks = [
  {
    href: "/dashboard",
    label: "Dashboard",
    internal: true,
  },
  {
    href: "/internships",
    label: "Internships",
    internal: true,
  },
  {
    href: "/recommendations",
    label: "Recommendations",
    internal: true,
  },
  {
    href: "/mentorship",
    label: "Mentorship",
    internal: true,
  },
  {
    href: "/profile",
    label: "Profile",
    internal: true,
  },
];

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  const navigate = useNavigate();

  const [expanded, setExpanded] = useState(false);

  const closeMenu = () => {
    setExpanded(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/");
  };

  const links = isAuthenticated ? appNavLinks : navLinks;

  return (
    <nav className="navbar navbar-expand-lg navbar-light sticky-top app-navbar py-3">
      <div className="container">
        {/* Brand */}
        <Link
          className="navbar-brand d-flex align-items-center fw-bold"
          to="/"
          onClick={closeMenu}
        >
          <span className="brand-mark d-inline-flex align-items-center justify-content-center me-2">
            <FaBriefcase />
          </span>
          PrayasAI
          <span className="text-primary">Disha</span>
        </Link>

        {/* Mobile menu */}
        <button
          className="navbar-toggler"
          type="button"
          aria-expanded={expanded}
          aria-label="Toggle navigation"
          onClick={() => setExpanded((prev) => !prev)}
        >
          <span className="navbar-toggler-icon" />
        </button>

        {/* Navigation */}
        <div className={`collapse navbar-collapse ${expanded ? "show" : ""}`}>
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-1">
            {links.map((link) => (
              <li className="nav-item" key={link.href}>
                {link.internal ? (
                  <Link className="nav-link" to={link.href} onClick={closeMenu}>
                    {link.label}
                  </Link>
                ) : (
                  <a className="nav-link" href={link.href} onClick={closeMenu}>
                    {link.label}
                  </a>
                )}
              </li>
            ))}

            {/* Authenticated user */}
            {isAuthenticated ? (
              <li className="nav-item d-flex align-items-center gap-2 ms-lg-2">
                <span className="small text-muted d-none d-xl-inline">
                  <FaUserCircle className="me-1" />

                  {(user?.fullName || user?.name)?.split(" ")[0] || "Student"}
                </span>

                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={handleLogout}
                  type="button"
                >
                  Logout
                </button>
              </li>
            ) : (
              <>
                {/* Login */}
                <li className="nav-item">
                  <Link className="nav-link" to="/login" onClick={closeMenu}>
                    Login
                  </Link>
                </li>

                {/* Register */}
                <li className="nav-item">
                  <Link
                    className="btn btn-primary btn-sm ms-lg-2 px-3"
                    to="/register"
                    onClick={closeMenu}
                  >
                    Get Started
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
