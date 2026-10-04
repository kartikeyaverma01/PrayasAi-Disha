import { useEffect, useMemo, useState } from "react";

import {
  FaUserCircle,
  FaGraduationCap,
  FaPen,
  FaSave,
  FaTimes,
  FaCheckCircle,
  FaPlus,
  FaMapMarkerAlt,
  FaBullseye,
} from "react-icons/fa";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

import { DOMAIN_OPTIONS } from "../data/profile";

/* =========================================================
   OPTIONS
========================================================= */

const JOB_FIELD_OPTIONS = [
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

const DOMAIN_FIELD_OPTIONS = Array.from(
  new Set([
    ...(Array.isArray(DOMAIN_OPTIONS) ? DOMAIN_OPTIONS : []),
    ...JOB_FIELD_OPTIONS,
  ]),
);

/* =========================================================
   PROFILE FIELDS USED FOR COMPLETION
========================================================= */

const PROFILE_FIELDS = [
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

/* =========================================================
   HELPERS
========================================================= */

function normalizeInterests(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

/* =========================================================
   COMPLETION
========================================================= */

function computeCompletion(profile = {}) {
  const currentProfile = profile || {};

  const filled = PROFILE_FIELDS.filter((field) => {
    const value = currentProfile[field];

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return Boolean(
      value !== null && value !== undefined && String(value).trim() !== "",
    );
  });

  return Math.round((filled.length / PROFILE_FIELDS.length) * 100);
}

/* =========================================================
   COMPONENT
========================================================= */

export default function Profile() {
  const { user } = useAuth();

  /* -------------------------------------------------------
     STATE
  ------------------------------------------------------- */

  const [profile, setProfile] = useState(null);

  const [draft, setDraft] = useState({});

  const [editing, setEditing] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);

  const [skillInput, setSkillInput] = useState("");

  const [interestInput, setInterestInput] = useState("");

  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [saving, setSaving] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState("");

  /* -------------------------------------------------------
     RELOAD PROFILE WHEN USER CHANGES
  ------------------------------------------------------- */

  useEffect(() => {
    if (!user?.email) {
      setProfile({});
      setDraft({});
      setProfileError("");
      setProfileLoading(false);
      return () => {};
    }

    setProfileLoading(true);
    setProfileError("");

    let active = true;

    const loadProfile = async () => {
      try {
        const { data } = await api.get("/profile");

        if (active) {
          const loadedProfile = data?.profile || {};
          setProfile(loadedProfile);
          setDraft(loadedProfile);
          setEditing(false);
          setShowSuccess(false);
        }
      } catch (error) {
        console.error("Failed to load profile:", error);

        if (active) {
          setProfile(null);
          setDraft({});
          setProfileError(
            error.response?.status === 404
              ? "Student profile unavailable."
              : "Unable to load your profile information.",
          );
        }
      } finally {
        if (active) {
          setProfileLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [user?.email]);

  /* -------------------------------------------------------
     COMPLETION
  ------------------------------------------------------- */

  const completion = useMemo(() => computeCompletion(profile), [profile]);

  /* =======================================================
     EDITING
  ======================================================= */

  const startEditing = () => {
    setDraft(profile);
    setShowSuccess(false);
    setProfileSaveError("");
    setEditing(true);
  };

  const cancelEditing = () => {
    setDraft(profile);
    setEditing(false);
    setSkillInput("");
    setInterestInput("");
    setProfileSaveError("");
  };

  const saveChanges = async (event) => {
    event.preventDefault();

    if (saving) return;

    const cleanedProfile = {
      fullName: String(draft.fullName || "").trim(),
      phone: String(draft.phone || "").trim(),
      college: String(draft.college || "").trim(),
      degree: String(draft.degree || "").trim(),
      cgpa: draft.cgpa,
      graduationYear: draft.graduationYear,
      skills: Array.isArray(draft.skills) ? draft.skills : [],
      interests: normalizeInterests(draft.interests),
      preferredJobField: String(draft.preferredJobField || "").trim(),
      preferredLocation: String(draft.preferredLocation || "").trim(),
      preferredWorkMode: String(draft.preferredWorkMode || "").trim(),
    };

    setSaving(true);
    setProfileSaveError("");
    setShowSuccess(false);

    try {
      await api.put("/profile", cleanedProfile);

      const savedProfile = {
        ...profile,
        ...cleanedProfile,
      };

      setProfile(savedProfile);
      setDraft(savedProfile);
      setEditing(false);
      setShowSuccess(true);
      setSkillInput("");
      setInterestInput("");
    } catch (error) {
      console.error("Failed to save profile:", error);

      setProfileSaveError(
        error.response?.data?.message ||
          (error.response?.status === 404
            ? "Student profile unavailable."
            : "Unable to update your profile. Please try again."),
      );
    } finally {
      setSaving(false);
    }
  };

  const updateDraft = (field, value) => {
    setDraft((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /* =======================================================
     SKILLS
  ======================================================= */

  const addSkill = () => {
    const value = skillInput.trim();

    if (!value) return;

    const currentSkills = Array.isArray(draft.skills) ? draft.skills : [];

    const alreadyExists = currentSkills.some(
      (skill) => String(skill).toLowerCase() === value.toLowerCase(),
    );

    if (alreadyExists) {
      setSkillInput("");
      return;
    }

    updateDraft("skills", [...currentSkills, value]);

    setSkillInput("");
  };

  const removeSkill = (skillToRemove) => {
    updateDraft(
      "skills",
      (draft.skills || []).filter((skill) => skill !== skillToRemove),
    );
  };

  /* =======================================================
     INTERESTS
  ======================================================= */

  const addInterest = () => {
    const value = interestInput.trim();

    if (!value) return;

    const currentInterests = normalizeInterests(draft.interests);

    const alreadyExists = currentInterests.some(
      (interest) => interest.toLowerCase() === value.toLowerCase(),
    );

    if (alreadyExists) {
      setInterestInput("");
      return;
    }

    updateDraft("interests", [...currentInterests, value]);

    setInterestInput("");
  };

  const removeInterest = (interestToRemove) => {
    updateDraft(
      "interests",
      normalizeInterests(draft.interests).filter(
        (interest) => interest !== interestToRemove,
      ),
    );
  };

  /* =======================================================
     DISPLAY HELPERS
  ======================================================= */

  const displayValue = (value) => {
    if (value === null || value === undefined || String(value).trim() === "") {
      return "-";
    }

    return String(value);
  };

  const displayList = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
      return "No interests added yet.";
    }

    return items.join(", ");
  };

  /* =======================================================
     NEW: LOADING SCREEN
  ======================================================= */

  if (profileLoading) {
    return (
      <div className="pd-app-page">
        <Navbar />

        <main className="profile-page py-4 py-lg-5">
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

        <main className="profile-page py-4 py-lg-5">
          <div className="container">
            <div className="alert alert-warning mb-0" role="alert">
              <h1 className="h4 fw-bold mb-2">Profile unavailable</h1>
              <p className="mb-0">{profileError}</p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="pd-app-page">
      <Navbar />

      <main className="profile-page py-4 py-lg-5">
        <div className="container">
          {/* =================================================
              HEADER
          ================================================= */}

          <div className="profile-page-header mb-4">
            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <FaUserCircle className="text-primary" size={24} />

                <span className="eyebrow">Student Profile</span>
              </div>

              <h1 className="fw-bold mb-2">Manage Your Profile</h1>

              <p className="text-muted mb-0">
                Keep this information up to date. Your skills, interests and
                career preferences help the recommendation system personalize
                internship results.
              </p>
            </div>

            {!editing ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={startEditing}
              >
                <FaPen className="me-2" />
                Edit Profile
              </button>
            ) : (
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={cancelEditing}
                >
                  <FaTimes className="me-2" />
                  Cancel
                </button>

                <button
                  type="submit"
                  form="profile-form"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  <FaSave className="me-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>

          {/* =================================================
              SUCCESS MESSAGE
          ================================================= */}

          {showSuccess && (
            <div
              className="alert alert-success d-flex align-items-center mb-4"
              role="alert"
            >
              <FaCheckCircle className="me-2" />
              Your profile has been updated successfully.
            </div>
          )}

          {profileSaveError && (
            <div className="alert alert-danger mb-4" role="alert">
              {profileSaveError}
            </div>
          )}

          {/* =================================================
              PROFILE FORM
          ================================================= */}

          <form id="profile-form" onSubmit={saveChanges}>
            <div className="row g-4">
              {/* =================================================
                  LEFT COLUMN
              ================================================= */}

              <div className="col-lg-8">
                {/* ===============================================
                    PERSONAL INFORMATION
                =============================================== */}

                <section className="details-panel mb-4">
                  <div className="d-flex align-items-center gap-2 mb-4">
                    <FaUserCircle className="text-primary" />

                    <h2 className="h5 fw-bold mb-0">Personal Information</h2>
                  </div>

                  <div className="row g-4">
                    {/* Full Name */}

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Full Name
                      </label>

                      {editing ? (
                        <input
                          type="text"
                          className="form-control"
                          value={draft.fullName || ""}
                          onChange={(event) =>
                            updateDraft("fullName", event.target.value)
                          }
                        />
                      ) : (
                        <div className="profile-value">
                          {displayValue(profile.fullName)}
                        </div>
                      )}
                    </div>

                    {/* Email */}

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Email</label>

                      <div className="profile-value">
                        {displayValue(profile.email)}
                      </div>
                    </div>

                    {/* Phone */}

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Phone</label>

                      {editing ? (
                        <input
                          type="tel"
                          className="form-control"
                          value={draft.phone || ""}
                          onChange={(event) =>
                            updateDraft("phone", event.target.value)
                          }
                        />
                      ) : (
                        <div className="profile-value">
                          {displayValue(profile.phone)}
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* ===============================================
                    ACADEMIC INFORMATION
                =============================================== */}

                <section className="details-panel mb-4">
                  <div className="d-flex align-items-center gap-2 mb-4">
                    <FaGraduationCap className="text-primary" />

                    <h2 className="h5 fw-bold mb-0">Academic Information</h2>
                  </div>

                  <div className="row g-4">
                    {/* College */}

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">College</label>

                      {editing ? (
                        <input
                          type="text"
                          className="form-control"
                          value={draft.college || ""}
                          onChange={(event) =>
                            updateDraft("college", event.target.value)
                          }
                        />
                      ) : (
                        <div className="profile-value">
                          {displayValue(profile.college)}
                        </div>
                      )}
                    </div>

                    {/* Degree */}

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Degree</label>

                      {editing ? (
                        <input
                          type="text"
                          className="form-control"
                          value={draft.degree || ""}
                          onChange={(event) =>
                            updateDraft("degree", event.target.value)
                          }
                        />
                      ) : (
                        <div className="profile-value">
                          {displayValue(profile.degree)}
                        </div>
                      )}
                    </div>

                    {/* Branch */}

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Branch</label>

                      {editing ? (
                        <input
                          type="text"
                          className="form-control"
                          value={draft.branch || ""}
                          readOnly
                        />
                      ) : (
                        <div className="profile-value">
                          {displayValue(profile.branch)}
                        </div>
                      )}
                    </div>

                    {/* CGPA */}

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">CGPA</label>

                      {editing ? (
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="10"
                          className="form-control"
                          value={draft.cgpa ?? ""}
                          onChange={(event) =>
                            updateDraft("cgpa", event.target.value)
                          }
                        />
                      ) : (
                        <div className="profile-value">
                          {displayValue(profile.cgpa)}
                        </div>
                      )}
                    </div>

                    {/* Graduation Year */}

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Graduation Year
                      </label>

                      {editing ? (
                        <input
                          type="number"
                          className="form-control"
                          value={draft.graduationYear || ""}
                          onChange={(event) =>
                            updateDraft("graduationYear", event.target.value)
                          }
                        />
                      ) : (
                        <div className="profile-value">
                          {displayValue(profile.graduationYear)}
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* ===============================================
                    SKILLS & INTERESTS
                =============================================== */}

                <section className="details-panel mb-4">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <FaBullseye className="text-primary" />

                    <h2 className="h5 fw-bold mb-0">Skills & Interests</h2>
                  </div>

                  <p className="text-muted small mb-4">
                    Your skills and interests are used by the recommendation
                    system to personalize internship opportunities.
                  </p>

                  {/* Skills */}

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Skills</label>

                    {editing ? (
                      <>
                        <div className="input-group mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Add a skill"
                            value={skillInput}
                            onChange={(event) =>
                              setSkillInput(event.target.value)
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                addSkill();
                              }
                            }}
                          />

                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={addSkill}
                          >
                            <FaPlus />
                          </button>
                        </div>

                        <div className="d-flex flex-wrap gap-2">
                          {(draft.skills || []).map((skill) => (
                            <span
                              key={skill}
                              className="badge rounded-pill bg-primary-subtle text-primary-emphasis px-3 py-2"
                            >
                              {skill}

                              <button
                                type="button"
                                className="btn btn-sm p-0 ms-2 border-0"
                                onClick={() => removeSkill(skill)}
                                aria-label={`Remove ${skill}`}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="d-flex flex-wrap gap-2">
                        {Array.isArray(profile.skills) &&
                        profile.skills.length > 0 ? (
                          profile.skills.map((skill) => (
                            <span
                              key={skill}
                              className="badge rounded-pill bg-primary-subtle text-primary-emphasis px-3 py-2"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted">
                            No skills added yet.
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Interests */}

                  <div>
                    <label className="form-label fw-semibold">Interests</label>

                    {editing ? (
                      <>
                        <div className="input-group mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Add an interest"
                            value={interestInput}
                            onChange={(event) =>
                              setInterestInput(event.target.value)
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                addInterest();
                              }
                            }}
                          />

                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={addInterest}
                          >
                            <FaPlus />
                          </button>
                        </div>

                        <div className="d-flex flex-wrap gap-2">
                          {normalizeInterests(draft.interests).map(
                            (interest) => (
                              <span
                                key={interest}
                                className="badge rounded-pill bg-success-subtle text-success-emphasis px-3 py-2"
                              >
                                {interest}

                                <button
                                  type="button"
                                  className="btn btn-sm p-0 ms-2 border-0"
                                  onClick={() => removeInterest(interest)}
                                  aria-label={`Remove ${interest}`}
                                >
                                  ×
                                </button>
                              </span>
                            ),
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="profile-value">
                        {displayList(profile.interests)}
                      </div>
                    )}
                  </div>
                </section>

                {/* ===============================================
                    CAREER PREFERENCES
                =============================================== */}

                <section className="details-panel mb-4">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <FaMapMarkerAlt className="text-primary" />

                    <h2 className="h5 fw-bold mb-0">Career Preferences</h2>
                  </div>

                  <p className="text-muted small mb-4">
                    These preferences were collected during signup and can also
                    be updated here.
                  </p>

                  <div className="row g-4">
                    {/* Preferred Job Field */}

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Preferred Job Field
                      </label>

                      {editing ? (
                        <select
                          className="form-select"
                          value={draft.preferredJobField || ""}
                          onChange={(event) =>
                            updateDraft("preferredJobField", event.target.value)
                          }
                        >
                          <option value="">Select job field</option>

                          {DOMAIN_FIELD_OPTIONS.map((field) => (
                            <option key={field} value={field}>
                              {field}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="profile-value">
                          {displayValue(profile.preferredJobField)}
                        </div>
                      )}
                    </div>

                    {/* Preferred Location */}

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Preferred Location
                      </label>

                      {editing ? (
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Delhi, Noida, Bangalore"
                          value={draft.preferredLocation || ""}
                          onChange={(event) =>
                            updateDraft("preferredLocation", event.target.value)
                          }
                        />
                      ) : (
                        <div className="profile-value">
                          {displayValue(profile.preferredLocation)}
                        </div>
                      )}
                    </div>

                    {/* Preferred Work Mode */}

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Preferred Work Mode
                      </label>

                      {editing ? (
                        <select
                          className="form-select"
                          value={draft.preferredWorkMode || ""}
                          onChange={(event) =>
                            updateDraft("preferredWorkMode", event.target.value)
                          }
                        >
                          <option value="">Select work mode</option>

                          <option value="Remote">Remote</option>

                          <option value="Hybrid">Hybrid</option>

                          <option value="On-site">On-site</option>
                        </select>
                      ) : (
                        <div className="profile-value">
                          {displayValue(profile.preferredWorkMode)}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>

              {/* =================================================
                  RIGHT COLUMN
              ================================================= */}

              <div className="col-lg-4">
                <div className="d-flex flex-column gap-4">
                  {/* =============================================
                      PROFILE COMPLETION
                  ============================================= */}

                  <section className="details-side">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <FaCheckCircle className="text-success" />

                      <h2 className="h5 fw-bold mb-0">Profile Completion</h2>
                    </div>

                    <div className="text-center py-3">
                      <div className="fw-bold display-5 text-primary">
                        {completion}%
                      </div>

                      <p className="text-muted mb-3">complete</p>
                    </div>

                    <div className="progress mb-3" style={{ height: "8px" }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{
                          width: `${completion}%`,
                        }}
                        aria-valuenow={completion}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      />
                    </div>

                    <p className="small text-muted mb-0">
                      Complete your academic information, skills, interests and
                      career preferences so the recommendation system has the
                      information it needs.
                    </p>
                  </section>

                  {/* =============================================
                      RECOMMENDATION PROFILE
                  ============================================= */}

                  <section className="details-side">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <FaBullseye className="text-primary" />

                      <h2 className="h5 fw-bold mb-0">
                        Recommendation Profile
                      </h2>
                    </div>

                    <p className="small text-muted mb-4">
                      Information used by ML
                    </p>

                    {/* Skills */}

                    <div className="mb-4">
                      <div className="small fw-semibold text-muted mb-2">
                        Skills
                      </div>

                      {Array.isArray(profile.skills) &&
                      profile.skills.length > 0 ? (
                        <div className="d-flex flex-wrap gap-2">
                          {profile.skills.map((skill) => (
                            <span
                              key={skill}
                              className="badge rounded-pill bg-primary-subtle text-primary-emphasis"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="small text-muted">
                          No skills selected
                        </div>
                      )}
                    </div>

                    {/* Interests */}

                    <div className="mb-4">
                      <div className="small fw-semibold text-muted mb-2">
                        Interests
                      </div>

                      {normalizeInterests(profile.interests).length > 0 ? (
                        <div className="d-flex flex-wrap gap-2">
                          {normalizeInterests(profile.interests).map(
                            (interest) => (
                              <span
                                key={interest}
                                className="badge rounded-pill bg-success-subtle text-success-emphasis"
                              >
                                {interest}
                              </span>
                            ),
                          )}
                        </div>
                      ) : (
                        <div className="small text-muted">
                          No interests selected
                        </div>
                      )}
                    </div>

                    {/* Preferred Job Field */}

                    <div className="mb-4">
                      <div className="small fw-semibold text-muted mb-1">
                        Preferred Job Field
                      </div>

                      <div className="small">
                        {displayValue(profile.preferredJobField)}
                      </div>
                    </div>

                    {/* Preferred Location */}

                    <div className="mb-4">
                      <div className="small fw-semibold text-muted mb-1">
                        Preferred Location
                      </div>

                      <div className="small">
                        {displayValue(profile.preferredLocation)}
                      </div>
                    </div>

                    {/* Preferred Work Mode */}

                    <div>
                      <div className="small fw-semibold text-muted mb-1">
                        Preferred Work Mode
                      </div>

                      <div className="small">
                        {displayValue(profile.preferredWorkMode)}
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
