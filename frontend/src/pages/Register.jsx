import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaPhone,
  FaUniversity,
  FaArrowLeft,
  FaArrowRight,
  FaBriefcase,
  FaGraduationCap,
  FaCode,
  FaHeart,
  FaMapMarkerAlt,
  FaLaptopHouse,
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";

const degrees = [
  "B.Tech",
  "B.E.",
  "BCA",
  "B.Sc",
  "BBA",
  "MCA",
  "M.Tech",
  "MBA",
  "M.Sc",
];

const branches = [
  {
    label: "Computer Science and Engineering",
    value: "CSE",
  },
  {
    label: "Information Technology",
    value: "IT",
  },
  {
    label: "Computer Science",
    value: "CS",
  },
  {
    label: "Artificial Intelligence and Machine Learning",
    value: "AIML",
  },
  {
    label: "Artificial Intelligence and Data Science",
    value: "AIDS",
  },
  {
    label: "Electronics and Communication Engineering",
    value: "ECE",
  },
  {
    label: "Electrical Engineering",
    value: "EE",
  },
  {
    label: "Mechanical Engineering",
    value: "ME",
  },
  {
    label: "Civil Engineering",
    value: "CE",
  },
];

const skills = [
  "C",
  "C++",
  "Java",
  "Python",
  "JavaScript",
  "SQL",
  "HTML",
  "CSS",
  "React",
  "Node.js",
  "Flask",
  "FastAPI",
  "Git",
  "Data Analysis",
  "Machine Learning",
  "Deep Learning",
  "Cloud",
  "UI/UX",
  "MongoDB",
  "Power BI",
];

const jobFields = [
  "Software Development",
  "Web Development",
  "App Development",
  "Data Science",
  "Data Analysis",
  "Machine Learning",
  "Artificial Intelligence",
  "Cloud Computing",
  "Cyber Security",
  "UI/UX Design",
];

const workModes = ["Remote", "Hybrid", "On-site"];

const currentYear = new Date().getFullYear();

const graduationYears = Array.from(
  { length: 7 },
  (_, i) => currentYear - 1 + i,
);

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      skills: [],
    },
  });

  const password = watch("password");
  const selectedSkills = watch("skills") || [];

  const toggleSkill = (skill) => {
    const currentSkills = watch("skills") || [];

    const updatedSkills = currentSkills.includes(skill)
      ? currentSkills.filter((item) => item !== skill)
      : [...currentSkills, skill];

    setValue("skills", updatedSkills, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const goToStep2 = async () => {
    const valid = await trigger([
      "fullName",
      "email",
      "password",
      "confirmPassword",
      "mobile",
      "college",
      "degree",
      "branch",
      "cgpa",
      "graduationYear",
    ]);

    if (valid) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToStep1 = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (data) => {
    setServerError("");
    setSubmitting(true);

    try {
      await registerUser(data);

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setServerError(
        err.message || "Unable to create your account. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page d-flex align-items-center py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8">
            <Link
              to="/"
              className="d-inline-flex align-items-center text-decoration-none text-muted mb-4 small"
            >
              <FaArrowLeft className="me-2" />
              Back to home
            </Link>

            <div className="card border-0 shadow-sm auth-card">
              <div className="card-body p-4 p-md-5">
                {/* Brand */}
                <div className="d-flex align-items-center gap-2 mb-4">
                  <span className="brand-mark d-inline-flex align-items-center justify-content-center">
                    <FaBriefcase />
                  </span>

                  <span className="fw-bold">
                    PrayasAI
                    <span className="text-primary">Disha</span>
                  </span>
                </div>

                {/* Heading */}
                <div className="mb-4">
                  <h1 className="h3 fw-bold mb-1">Create your account</h1>

                  <p className="text-muted mb-0">
                    Build your profile and get AI-matched internships
                  </p>
                </div>

                {/* Step indicator */}
                <div className="d-flex align-items-center mb-4">
                  <div className="d-flex align-items-center">
                    <span
                      className={`rounded-circle d-inline-flex align-items-center justify-content-center ${
                        step >= 1
                          ? "bg-primary text-white"
                          : "bg-light text-muted"
                      }`}
                      style={{
                        width: "34px",
                        height: "34px",
                        fontWeight: 700,
                      }}
                    >
                      1
                    </span>

                    <span className="ms-2 small fw-semibold">
                      Account & Academic
                    </span>
                  </div>

                  <div
                    className="flex-grow-1 mx-3"
                    style={{
                      height: "2px",
                      background: step === 2 ? "var(--bs-primary)" : "#e9ecef",
                    }}
                  />

                  <div className="d-flex align-items-center">
                    <span
                      className={`rounded-circle d-inline-flex align-items-center justify-content-center ${
                        step === 2
                          ? "bg-primary text-white"
                          : "bg-light text-muted"
                      }`}
                      style={{
                        width: "34px",
                        height: "34px",
                        fontWeight: 700,
                      }}
                    >
                      2
                    </span>

                    <span className="ms-2 small fw-semibold">
                      Skills & Preferences
                    </span>
                  </div>
                </div>

                {serverError && (
                  <div className="alert alert-danger py-2" role="alert">
                    {serverError}
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                  {/* =====================================================
                      STEP 1
                  ====================================================== */}
                  {step === 1 && (
                    <>
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <FaGraduationCap className="text-primary" />
                        <h2 className="h5 fw-bold mb-0">
                          Account & Academic Details
                        </h2>
                      </div>

                      <div className="row g-3">
                        {/* Full Name */}
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
                              className={`form-control ${
                                errors.fullName ? "is-invalid" : ""
                              }`}
                              placeholder="Your full name"
                              {...register("fullName", {
                                required: "Full name is required",
                                minLength: {
                                  value: 3,
                                  message: "Enter at least 3 characters",
                                },
                              })}
                            />

                            {errors.fullName && (
                              <div className="invalid-feedback">
                                {errors.fullName.message}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Email */}
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
                              className={`form-control ${
                                errors.email ? "is-invalid" : ""
                              }`}
                              placeholder="you@example.com"
                              {...register("email", {
                                required: "Email is required",
                                pattern: {
                                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                  message: "Enter a valid email",
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
                              className={`form-control ${
                                errors.password ? "is-invalid" : ""
                              }`}
                              placeholder="At least 8 characters"
                              {...register("password", {
                                required: "Password is required",
                                minLength: {
                                  value: 8,
                                  message:
                                    "Password must be at least 8 characters",
                                },
                                pattern: {
                                  value: /^(?=.*[A-Za-z])(?=.*\d).+$/,
                                  message:
                                    "Include at least one letter and one number",
                                },
                              })}
                            />
                            <button
                              type="button"
                              className="btn btn-light border"
                              onClick={() => setShowPassword((value) => !value)}
                              aria-label={
                                showPassword ? "Hide password" : "Show password"
                              }
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

                        {/* Confirm Password */}
                        <div className="col-12 col-md-6">
                          <label
                            htmlFor="confirmPassword"
                            className="form-label"
                          >
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
                              className={`form-control ${
                                errors.confirmPassword ? "is-invalid" : ""
                              }`}
                              placeholder="Re-enter your password"
                              {...register("confirmPassword", {
                                required: "Please confirm your password",
                                validate: (value) =>
                                  value === password ||
                                  "Passwords do not match",
                              })}
                            />
                            <button
                              type="button"
                              className="btn btn-light border"
                              onClick={() =>
                                setShowConfirmPassword((value) => !value)
                              }
                              aria-label={
                                showConfirmPassword
                                  ? "Hide confirm password"
                                  : "Show confirm password"
                              }
                            >
                              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                            
                            {errors.confirmPassword && (
                              <div className="invalid-feedback">
                                {errors.confirmPassword.message}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Mobile */}
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
                              className={`form-control ${
                                errors.mobile ? "is-invalid" : ""
                              }`}
                              placeholder="10-digit mobile number"
                              {...register("mobile", {
                                required: "Mobile number is required",
                                pattern: {
                                  value: /^[6-9]\d{9}$/,
                                  message:
                                    "Enter a valid 10-digit mobile number",
                                },
                              })}
                            />

                            {errors.mobile && (
                              <div className="invalid-feedback">
                                {errors.mobile.message}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* College */}
                        <div className="col-12 col-md-6">
                          <label htmlFor="college" className="form-label">
                            College
                          </label>

                          <div className="input-group">
                            <span className="input-group-text bg-light">
                              <FaUniversity />
                            </span>

                            <input
                              id="college"
                              className={`form-control ${
                                errors.college ? "is-invalid" : ""
                              }`}
                              placeholder="Your college / university"
                              {...register("college", {
                                required: "College is required",
                              })}
                            />

                            {errors.college && (
                              <div className="invalid-feedback">
                                {errors.college.message}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Degree */}
                        <div className="col-12 col-md-4">
                          <label htmlFor="degree" className="form-label">
                            Degree
                          </label>

                          <select
                            id="degree"
                            className={`form-select ${
                              errors.degree ? "is-invalid" : ""
                            }`}
                            defaultValue=""
                            {...register("degree", {
                              required: "Please select your degree",
                            })}
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

                          {errors.degree && (
                            <div className="invalid-feedback">
                              {errors.degree.message}
                            </div>
                          )}
                        </div>

                        {/* Branch */}
                        <div className="col-12 col-md-8">
                          <label htmlFor="branch" className="form-label">
                            Branch
                          </label>

                          <select
                            id="branch"
                            className={`form-select ${
                              errors.branch ? "is-invalid" : ""
                            }`}
                            defaultValue=""
                            {...register("branch", {
                              required: "Please select your branch",
                            })}
                          >
                            <option value="" disabled>
                              Select branch
                            </option>

                            {branches.map((branch) => (
                              <option key={branch.value} value={branch.value}>
                                {branch.label}
                              </option>
                            ))}
                          </select>

                          {errors.branch && (
                            <div className="invalid-feedback">
                              {errors.branch.message}
                            </div>
                          )}
                        </div>

                        {/* CGPA */}
                        <div className="col-12 col-md-6">
                          <label htmlFor="cgpa" className="form-label">
                            CGPA
                          </label>

                          <input
                            id="cgpa"
                            type="number"
                            step="0.01"
                            min="0"
                            max="10"
                            className={`form-control ${
                              errors.cgpa ? "is-invalid" : ""
                            }`}
                            placeholder="e.g. 8.25"
                            {...register("cgpa", {
                              required: "CGPA is required",
                              min: {
                                value: 0,
                                message: "CGPA cannot be below 0",
                              },
                              max: {
                                value: 10,
                                message: "CGPA cannot exceed 10",
                              },
                            })}
                          />

                          {errors.cgpa && (
                            <div className="invalid-feedback">
                              {errors.cgpa.message}
                            </div>
                          )}
                        </div>

                        {/* Graduation Year */}
                        <div className="col-12 col-md-6">
                          <label
                            htmlFor="graduationYear"
                            className="form-label"
                          >
                            Graduation Year
                          </label>

                          <select
                            id="graduationYear"
                            className={`form-select ${
                              errors.graduationYear ? "is-invalid" : ""
                            }`}
                            defaultValue=""
                            {...register("graduationYear", {
                              required: "Please select graduation year",
                            })}
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
                            <div className="invalid-feedback">
                              {errors.graduationYear.message}
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-primary w-100 py-2 fw-semibold mt-4"
                        onClick={goToStep2}
                      >
                        Continue
                        <FaArrowRight className="ms-2" />
                      </button>
                    </>
                  )}

                  {/* =====================================================
                      STEP 2
                  ====================================================== */}
                  {step === 2 && (
                    <>
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <FaCode className="text-primary" />
                        <h2 className="h5 fw-bold mb-0">
                          Skills & Preferences
                        </h2>
                      </div>

                      <div className="row g-3">
                        {/* Skills */}
                        <div className="col-12">
                          <label className="form-label">Skills</label>

                          <p className="small text-muted mb-2">
                            Select all the skills you currently have.
                          </p>

                          {/* Hidden registered field */}
                          <input
                            type="hidden"
                            {...register("skills", {
                              validate: (value) =>
                                value?.length > 0 ||
                                "Select at least one skill",
                            })}
                          />

                          <div className="d-flex flex-wrap gap-2">
                            {skills.map((skill) => {
                              const selected = selectedSkills.includes(skill);

                              return (
                                <button
                                  key={skill}
                                  type="button"
                                  className={`btn btn-sm ${
                                    selected
                                      ? "btn-primary"
                                      : "btn-outline-secondary"
                                  }`}
                                  onClick={() => toggleSkill(skill)}
                                >
                                  {skill}
                                </button>
                              );
                            })}
                          </div>

                          {errors.skills && (
                            <div className="text-danger small mt-2">
                              {errors.skills.message}
                            </div>
                          )}
                        </div>

                        {/* Interests */}
                        <div className="col-12">
                          <label htmlFor="interests" className="form-label">
                            Interests
                          </label>

                          <div className="input-group">
                            <span className="input-group-text bg-light">
                              <FaHeart />
                            </span>

                            <input
                              id="interests"
                              className={`form-control ${
                                errors.interests ? "is-invalid" : ""
                              }`}
                              placeholder="e.g. Web development, AI, Data Science"
                              {...register("interests", {
                                required: "Interests are required",
                              })}
                            />

                            {errors.interests && (
                              <div className="invalid-feedback">
                                {errors.interests.message}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Preferred Job Field */}
                        <div className="col-12 col-md-6">
                          <label
                            htmlFor="preferredJobField"
                            className="form-label"
                          >
                            Preferred Job Field
                          </label>

                          <select
                            id="preferredJobField"
                            className={`form-select ${
                              errors.preferredJobField ? "is-invalid" : ""
                            }`}
                            defaultValue=""
                            {...register("preferredJobField", {
                              required:
                                "Please select your preferred job field",
                            })}
                          >
                            <option value="" disabled>
                              Select job field
                            </option>

                            {jobFields.map((field) => (
                              <option key={field} value={field}>
                                {field}
                              </option>
                            ))}
                          </select>

                          {errors.preferredJobField && (
                            <div className="invalid-feedback">
                              {errors.preferredJobField.message}
                            </div>
                          )}
                        </div>

                        {/* Preferred Location */}
                        <div className="col-12 col-md-6">
                          <label
                            htmlFor="preferredLocation"
                            className="form-label"
                          >
                            Preferred Location
                          </label>

                          <div className="input-group">
                            <span className="input-group-text bg-light">
                              <FaMapMarkerAlt />
                            </span>

                            <input
                              id="preferredLocation"
                              className={`form-control ${
                                errors.preferredLocation ? "is-invalid" : ""
                              }`}
                              placeholder="e.g. Delhi, Noida, Bangalore"
                              {...register("preferredLocation", {
                                required: "Preferred location is required",
                              })}
                            />

                            {errors.preferredLocation && (
                              <div className="invalid-feedback">
                                {errors.preferredLocation.message}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Preferred Work Mode */}
                        <div className="col-12">
                          <label
                            htmlFor="preferredWorkMode"
                            className="form-label"
                          >
                            Preferred Work Mode
                          </label>

                          <div className="input-group">
                            <span className="input-group-text bg-light">
                              <FaLaptopHouse />
                            </span>

                            <select
                              id="preferredWorkMode"
                              className={`form-select ${
                                errors.preferredWorkMode ? "is-invalid" : ""
                              }`}
                              defaultValue=""
                              {...register("preferredWorkMode", {
                                required:
                                  "Please select your preferred work mode",
                              })}
                            >
                              <option value="" disabled>
                                Select work mode
                              </option>

                              {workModes.map((mode) => (
                                <option key={mode} value={mode}>
                                  {mode}
                                </option>
                              ))}
                            </select>

                            {errors.preferredWorkMode && (
                              <div className="invalid-feedback">
                                {errors.preferredWorkMode.message}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="d-flex gap-3 mt-4">
                        <button
                          type="button"
                          className="btn btn-outline-secondary flex-grow-1 py-2 fw-semibold"
                          onClick={goToStep1}
                        >
                          <FaArrowLeft className="me-2" />
                          Back
                        </button>

                        <button
                          type="submit"
                          className="btn btn-primary flex-grow-1 py-2 fw-semibold"
                          disabled={submitting}
                        >
                          {submitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" />
                              Creating account...
                            </>
                          ) : (
                            "Create Account"
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </form>

                <p className="text-center text-muted mt-4 mb-0 small">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="fw-semibold text-decoration-none"
                  >
                    Sign in
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
