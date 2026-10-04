import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  FaEnvelope,
  FaLock,
  FaArrowLeft,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/PrayasAI-Disha_logo.png";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState([]);

  useEffect(() => {
    try {
      const accounts = JSON.parse(
        localStorage.getItem("prayasai_accounts") || "[]",
      );

      setSavedAccounts(accounts.map((account) => account.user).filter(Boolean));
    } catch {
      setSavedAccounts([]);
    }
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({ mode: "onBlur" });

  const redirectTo = location.state?.from?.pathname || "/dashboard";

  const onSubmit = async (data) => {
    setServerError("");
    setSubmitting(true);

    try {
      await login(data);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setServerError(err.message || "Unable to sign in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page d-flex align-items-center py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-7 col-lg-5">
            {/* Back to Home */}
            <Link
              to="/"
              className="d-inline-flex align-items-center text-decoration-none text-muted mb-4 small"
            >
              <FaArrowLeft className="me-2" />
              Back to home
            </Link>

            <div className="card border-0 shadow-sm auth-card">
              <div className="card-body p-4 p-md-5">
                {/* =================================================
                    BRAND HEADER
                    Same logo + brand style as Navbar
                ================================================= */}

                <div className="login-brand-header mb-4">
                  <img src={logo} alt="PrayasAI Disha" className="brand-logo" />

                  <span className="ms-2 fw-bold navbar-brand-text">
                    PrayasAI
                    <span className="text-primary">Disha</span>
                  </span>
                </div>

                {/* =================================================
                    WELCOME
                ================================================= */}

                <h1 className="h3 fw-bold mb-1">Welcome back</h1>

                <p className="text-muted mb-4">
                  Sign in to continue to your dashboard
                </p>

                {/* =================================================
                    SERVER ERROR
                ================================================= */}

                {serverError && (
                  <div className="alert alert-danger py-2" role="alert">
                    {serverError}
                  </div>
                )}

                {/* =================================================
                    SAVED ACCOUNT
                ================================================= */}

                {savedAccounts.length > 0 && (
                  <div className="mb-4 p-3 rounded-3 border bg-light">
                    <div className="small fw-semibold mb-2">
                      Your saved account
                    </div>

                    <div className="d-flex flex-wrap gap-2">
                      {savedAccounts.map((account) => (
                        <button
                          key={account.id}
                          type="button"
                          className="btn btn-outline-primary btn-sm text-start"
                          onClick={() => setValue("email", account.email)}
                        >
                          {account.fullName}

                          <span className="d-block small opacity-75">
                            {account.email}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* =================================================
                    LOGIN FORM
                ================================================= */}

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                  {/* Email */}

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email address
                    </label>

                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <FaEnvelope />
                      </span>

                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        className={`form-control ${
                          errors.email ? "is-invalid" : ""
                        }`}
                        placeholder="you@example.com"
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Enter a valid email address",
                          },
                        })}
                      />

                      {errors.email && (
                        <div className="invalid-feedback">
                          {errors.email.message}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Password */}

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Password
                    </label>

                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <FaLock />
                      </span>

                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        className={`form-control ${
                          errors.password ? "is-invalid" : ""
                        }`}
                        placeholder="Enter your password"
                        {...register("password", {
                          required: "Password is required",
                          minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters",
                          },
                        })}
                      />

                      <button
                        type="button"
                        className="password-toggle"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        onClick={() => setShowPassword((v) => !v)}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>

                      {errors.password && (
                        <div className="invalid-feedback">
                          {errors.password.message}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Remember / Forgot */}

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="remember"
                        {...register("remember")}
                      />

                      <label
                        className="form-check-label small"
                        htmlFor="remember"
                      >
                        Remember me
                      </label>
                    </div>

                    <Link
                      to="/forgot-password"
                      className="small text-decoration-none"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Submit */}

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2 fw-semibold"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </form>

                {/* =================================================
                    REGISTER LINK
                ================================================= */}

                <p className="text-center text-muted mt-4 mb-0 small">
                  Don&apos;t have an account?{" "}
                  <Link
                    to="/register"
                    className="fw-semibold text-decoration-none"
                  >
                    Create one
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
