import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { FaUser, FaEnvelope, FaLock, FaPhone, FaUniversity, FaArrowLeft, FaBriefcase, FaEye, FaEyeSlash } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

const degrees = ['B.Tech', 'B.E.', 'BCA', 'B.Sc', 'BBA', 'MCA', 'M.Tech', 'MBA', 'M.Sc', 'Other']
const currentYear = new Date().getFullYear()
const graduationYears = Array.from({ length: 6 }, (_, i) => currentYear - 1 + i)

export default function Register() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ mode: 'onBlur' })

  const password = watch('password')

  const onSubmit = async (data) => {
    setServerError('')
    setSubmitting(true)
    try {
      await registerUser(data)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setServerError(err.message || 'Unable to create your account. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page d-flex align-items-center py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-9 col-lg-7">
            <Link to="/" className="d-inline-flex align-items-center text-decoration-none text-muted mb-4 small">
              <FaArrowLeft className="me-2" /> Back to home
            </Link>

            <div className="card border-0 shadow-sm auth-card">
              <div className="card-body p-4 p-md-5">
                <div className="d-flex align-items-center gap-2 mb-4">
                  <span className="brand-mark d-inline-flex align-items-center justify-content-center">
                    <FaBriefcase />
                  </span>
                  <span className="fw-bold">
                    PrayasAI<span className="text-primary">Disha</span>
                  </span>
                </div>

                <h1 className="h3 fw-bold mb-1">Create your account</h1>
                <p className="text-muted mb-4">Start getting AI-matched internships in minutes</p>

                {serverError && (
                  <div className="alert alert-danger py-2" role="alert">
                    {serverError}
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label htmlFor="fullName" className="form-label">
                        Full Name
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <FaUser />
                        </span>
                        <input
                          id="fullName"
                          autoComplete="name"
                          className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                          placeholder="Your full name"
                          {...register('fullName', {
                            required: 'Full name is required',
                            minLength: { value: 3, message: 'Enter at least 3 characters' },
                          })}
                        />
                        {errors.fullName && <div className="invalid-feedback">{errors.fullName.message}</div>}
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label htmlFor="email" className="form-label">
                        Email
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <FaEnvelope />
                        </span>
                        <input
                          id="email"
                          type="email"
                          autoComplete="email"
                          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                          placeholder="you@example.com"
                          {...register('email', {
                            required: 'Email is required',
                            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
                          })}
                        />
                        {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
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
                          autoComplete="new-password"
                          className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                          placeholder="At least 8 characters"
                          {...register('password', {
                            required: 'Password is required',
                            minLength: { value: 8, message: 'Password must be at least 8 characters' },
                            pattern: {
                              value: /^(?=.*[A-Za-z])(?=.*\d).+$/,
                              message: 'Include at least one letter and one number',
                            },
                          })}
                        />
                        <button type="button" className="password-toggle" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <FaEyeSlash /> : <FaEye />}</button>
                        {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label htmlFor="confirmPassword" className="form-label">
                        Confirm Password
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <FaLock />
                        </span>
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          autoComplete="new-password"
                          className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                          placeholder="Re-enter your password"
                          {...register('confirmPassword', {
                            required: 'Please confirm your password',
                            validate: (value) => value === password || 'Passwords do not match',
                          })}
                        />
                        <button type="button" className="password-toggle" aria-label={showConfirmPassword ? "Hide password" : "Show password"} onClick={() => setShowConfirmPassword((value) => !value)}>{showConfirmPassword ? <FaEyeSlash /> : <FaEye />}</button>
                        {errors.confirmPassword && (
                          <div className="invalid-feedback">{errors.confirmPassword.message}</div>
                        )}
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label htmlFor="mobile" className="form-label">
                        Mobile Number
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <FaPhone />
                        </span>
                        <input
                          id="mobile"
                          autoComplete="tel"
                          className={`form-control ${errors.mobile ? 'is-invalid' : ''}`}
                          placeholder="10-digit mobile number"
                          {...register('mobile', {
                            required: 'Mobile number is required',
                            pattern: { value: /^[6-9]\d{9}$/, message: 'Enter a valid 10-digit mobile number' },
                          })}
                        />
                        {errors.mobile && <div className="invalid-feedback">{errors.mobile.message}</div>}
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label htmlFor="college" className="form-label">
                        College / University
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <FaUniversity />
                        </span>
                        <input
                          id="college"
                          className={`form-control ${errors.college ? 'is-invalid' : ''}`}
                          placeholder="Your institution"
                          {...register('college', { required: 'College/University is required' })}
                        />
                        {errors.college && <div className="invalid-feedback">{errors.college.message}</div>}
                      </div>
                    </div>

                    <div className="col-12 col-md-4">
                      <label htmlFor="degree" className="form-label">
                        Degree
                      </label>
                      <select
                        id="degree"
                        className={`form-select ${errors.degree ? 'is-invalid' : ''}`}
                        defaultValue=""
                        {...register('degree', { required: 'Select your degree' })}
                      >
                        <option value="" disabled>
                          Select degree
                        </option>
                        {degrees.map((degree) => (
                          <option key={degree} value={degree}>
                            {degree}
                          </option>
                        ))}
                      </select>
                      {errors.degree && <div className="invalid-feedback">{errors.degree.message}</div>}
                    </div>

                    <div className="col-12 col-md-4">
                      <label htmlFor="branch" className="form-label">
                        Branch
                      </label>
                      <input
                        id="branch"
                        className={`form-control ${errors.branch ? 'is-invalid' : ''}`}
                        placeholder="e.g. Computer Science"
                        {...register('branch', { required: 'Branch is required' })}
                      />
                      {errors.branch && <div className="invalid-feedback">{errors.branch.message}</div>}
                    </div>

                    <div className="col-12 col-md-4">
                      <label htmlFor="graduationYear" className="form-label">
                        Graduation Year
                      </label>
                      <select
                        id="graduationYear"
                        className={`form-select ${errors.graduationYear ? 'is-invalid' : ''}`}
                        defaultValue=""
                        {...register('graduationYear', { required: 'Select graduation year' })}
                      >
                        <option value="" disabled>
                          Select year
                        </option>
                        {graduationYears.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                      {errors.graduationYear && (
                        <div className="invalid-feedback">{errors.graduationYear.message}</div>
                      )}
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold mt-4" disabled={submitting}>
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </form>

                <p className="text-center text-muted mt-4 mb-0 small">
                  Already have an account?{' '}
                  <Link to="/login" className="fw-semibold text-decoration-none">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
