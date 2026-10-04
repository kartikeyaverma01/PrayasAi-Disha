import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaUserCircle, FaBars, FaTimes } from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/PrayasAI-Disha_logo.png";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  /* =========================================================
     CHECK AUTHENTICATION
  ========================================================= */

  const isAuthenticated = Boolean(user?.email);

  /* =========================================================
     CLOSE MOBILE MENU WHEN ROUTE CHANGES
  ========================================================= */

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  /* =========================================================
     HELPERS
  ========================================================= */

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const openLogoutModal = () => {
    setMenuOpen(false);
    setShowLogoutModal(true);
  };

  const closeLogoutModal = () => {
    setShowLogoutModal(false);
  };

  const handleLogout = () => {
    setShowLogoutModal(false);

    logout();

    navigate("/", { replace: true });
  };

  const firstName =
    user?.name?.trim()?.split(/\s+/)[0] ||
    user?.fullName?.trim()?.split(/\s+/)[0] ||
    "Student";

  return (
    <>
      {/* =========================================================
          NAVBAR
      ========================================================= */}

      <nav className="navbar navbar-expand-lg navbar-light app-navbar">
        <div className="container">
          {/* =================================================
              BRAND
          ================================================= */}

          <Link
            className="navbar-brand d-flex align-items-center"
            to="/"
            onClick={closeMenu}
          >
            <img src={logo} alt="PrayasAI Disha" className="brand-logo" />

            <span className="ms-2 fw-bold navbar-brand-text">
              PrayasAI<span className="text-primary">Disha</span>
            </span>
          </Link>

          {/* =================================================
              MOBILE TOGGLE
          ================================================= */}

          <button
            type="button"
            className="navbar-toggler border-0"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>

          {/* =================================================
              NAVIGATION
          ================================================= */}

          <div className={`collapse navbar-collapse ${menuOpen ? "show" : ""}`}>
            {isAuthenticated ? (
              /* =================================================
                 AUTHENTICATED NAVIGATION
              ================================================= */

              <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-1">
                {/* Dashboard */}

                <li className="nav-item">
                  <Link
                    className={`nav-link fw-semibold ${
                      location.pathname === "/dashboard" ? "active" : ""
                    }`}
                    to="/dashboard"
                    onClick={closeMenu}
                  >
                    Dashboard
                  </Link>
                </li>

                {/* Internships */}

                <li className="nav-item">
                  <Link
                    className={`nav-link fw-semibold ${
                      location.pathname === "/internships" ? "active" : ""
                    }`}
                    to="/internships"
                    onClick={closeMenu}
                  >
                    Internships
                  </Link>
                </li>

                {/* Recommendations */}

                <li className="nav-item">
                  <Link
                    className={`nav-link fw-semibold ${
                      location.pathname.startsWith("/recommendations")
                        ? "active"
                        : ""
                    }`}
                    to="/recommendations"
                    onClick={closeMenu}
                  >
                    Recommendations
                  </Link>
                </li>

                {/* Mentorship */}

                <li className="nav-item">
                  <Link
                    className={`nav-link fw-semibold ${
                      location.pathname.startsWith("/mentorship")
                        ? "active"
                        : ""
                    }`}
                    to="/mentorship"
                    onClick={closeMenu}
                  >
                    Mentorship
                  </Link>
                </li>

                {/* Profile */}

                <li className="nav-item">
                  <Link
                    className={`nav-link fw-semibold ${
                      location.pathname.startsWith("/profile") ? "active" : ""
                    }`}
                    to="/profile"
                    onClick={closeMenu}
                  >
                    Profile
                  </Link>
                </li>

                {/* Student Name */}

                <li className="nav-item d-flex align-items-center ms-lg-1">
                  <span className="nav-link d-flex align-items-center gap-1 text-muted">
                    <FaUserCircle />

                    <span>{firstName}</span>
                  </span>
                </li>

                {/* Logout */}

                <li className="nav-item ms-lg-1">
                  <button
                    type="button"
                    className="btn btn-outline-primary navbar-logout-btn"
                    onClick={openLogoutModal}
                  >
                    Logout
                  </button>
                </li>
              </ul>
            ) : (
              /* =================================================
                 PUBLIC / LOGGED-OUT NAVIGATION
              ================================================= */

              <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
                <li className="nav-item">
                  <Link
                    className="nav-link fw-semibold"
                    to="/"
                    onClick={closeMenu}
                  >
                    Home
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    className="nav-link fw-semibold"
                    to="/login"
                    onClick={closeMenu}
                  >
                    Login
                  </Link>
                </li>

                <li className="nav-item ms-lg-1">
                  <Link
                    className="btn btn-primary navbar-register-btn"
                    to="/register"
                    onClick={closeMenu}
                  >
                    Register
                  </Link>
                </li>
              </ul>
            )}
          </div>
        </div>
      </nav>

      {/* =========================================================
          LOGOUT CONFIRMATION MODAL
      ========================================================= */}

      {showLogoutModal && (
        <div className="logout-modal-backdrop" onClick={closeLogoutModal}>
          <div
            className="logout-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Close button */}

            <button
              type="button"
              className="logout-modal-close"
              onClick={closeLogoutModal}
              aria-label="Close logout confirmation"
            >
              <FaTimes />
            </button>

            {/* User icon */}

            <div className="logout-modal-icon">
              <FaUserCircle />
            </div>

            {/* Heading */}

            <h2 id="logout-modal-title">Are you sure you want to log out?</h2>

            {/* Description */}

            <p>
              You will be signed out of your PrayasAI Disha
              <br />
              account.
            </p>

            {/* Buttons */}

            <div className="logout-modal-actions">
              <button
                type="button"
                className="logout-btn logout-btn-no"
                onClick={closeLogoutModal}
              >
                No
              </button>

              <button
                type="button"
                className="logout-btn logout-btn-yes"
                onClick={handleLogout}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
