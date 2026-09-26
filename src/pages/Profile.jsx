import { useEffect, useMemo, useState } from "react";
import {
  FaUserCircle,
  FaGraduationCap,
  FaGithub,
  FaLinkedin,
  FaLink,
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
import { analyzeResumeFile } from "../services/resumeAnalyzer";
import {
  defaultProfile,
  PROFILE_COMPLETION_FIELDS,
  DOMAIN_OPTIONS,
} from "../data/profile";

const STORAGE_PREFIX = "prayasai_profile_data_"
const RESUME_KEY = "prayasai_resume_"

const getStorageKey = (authUser) => `${STORAGE_PREFIX}${String(authUser?.email || "guest").toLowerCase()}`
const getResumeKey = (authUser) => `${RESUME_KEY}${String(authUser?.email || "guest").toLowerCase()}`;

function loadProfile(authUser) {
  try {
    const raw = localStorage.getItem(getStorageKey(authUser));
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore corrupted storage, fall through to defaults
  }
  // First visit: seed personal/academic fields from the logged-in user where they overlap.
  return {
    ...defaultProfile,
    fullName: authUser?.fullName || "",
    email: authUser?.email || "",
    phone: authUser?.mobile || "",
    college: authUser?.college || "",
    branch: authUser?.branch || "",
    graduationYear: authUser?.graduationYear
      ? String(authUser.graduationYear)
      : "",
  };
}

function computeCompletion(profile) {
  const filled = PROFILE_COMPLETION_FIELDS.filter((field) => {
    const value = profile[field];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  });
  return Math.round((filled.length / PROFILE_COMPLETION_FIELDS.length) * 100);
}

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(() => loadProfile(user));
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);
  const [showSuccess, setShowSuccess] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeStatus, setResumeStatus] = useState("");
  const [resumeError, setResumeError] = useState("");

  useEffect(() => {
    localStorage.setItem(getStorageKey(user), JSON.stringify(profile));
  }, [user, profile]);

  useEffect(() => {
    try {
      const savedResume = JSON.parse(localStorage.getItem(getResumeKey(user)) || "null");
      if (savedResume?.fileName) setResumeFile(savedResume);
    } catch {}
  }, [user]);

  const completion = useMemo(() => computeCompletion(profile), [profile]);

  const startEditing = () => {
    setDraft(profile);
    setShowSuccess(false);
    setEditing(true);
  };

  const cancelEditing = () => {
    setDraft(profile);
    setEditing(false);
    setSkillInput("");
    setInterestInput("");
  };

  const handleResumeUpload = async (file) => {
    if (!file) return;
    const allowed = ["pdf", "docx", "txt"];
    const ext = file.name.split(".").pop().toLowerCase();
    if (!allowed.includes(ext)) { setResumeError("Please upload a PDF, DOCX, or TXT resume."); return; }
    if (file.size > 5 * 1024 * 1024) { setResumeError("Resume must be smaller than 5 MB."); return; }
    setResumeError("");
    setResumeStatus("Processing resume...");
    try {
      const analysis = await analyzeResumeFile(file);
      const stored = { fileName: file.name, size: file.size, uploadedAt: new Date().toISOString(), analysis };
      localStorage.setItem(getResumeKey(user), JSON.stringify(stored));
      setResumeFile(stored);
      setProfile((prev) => ({ ...prev, resume: file.name }));
      setResumeStatus("Resume uploaded and analyzed successfully.");
    } catch (err) {
      console.error(err);
      setResumeStatus("");
      setResumeError(err?.message === "No readable text could be extracted from this resume." ? "The PDF was opened, but no readable text was found. If it is a scanned/image-only PDF, please upload a text-based PDF or DOCX." : "We could not read this resume in the browser. Please try another PDF, DOCX, or TXT file.");
    }
  };

  const removeResume = () => {
    localStorage.removeItem(getResumeKey(user));
    setResumeFile(null);
    setResumeStatus("");
    setProfile((prev) => ({ ...prev, resume: "" }));
  };

  const saveChanges = (e) => {
    e.preventDefault();
    setProfile(draft);
    setEditing(false);
    setShowSuccess(true);
  };

  const updateDraft = (field, value) =>
    setDraft((prev) => ({ ...prev, [field]: value }));

  const addSkill = () => {
    const value = skillInput.trim();
    if (
      !value ||
      draft.skills.some((s) => s.toLowerCase() === value.toLowerCase())
    ) {
      setSkillInput("");
      return;
    }
    updateDraft("skills", [...draft.skills, value]);
    setSkillInput("");
  };
  const removeSkill = (skill) =>
    updateDraft(
      "skills",
      draft.skills.filter((s) => s !== skill),
    );

  const addInterest = () => {
    const value = interestInput.trim();
    if (
      !value ||
      draft.interests.some((s) => s.toLowerCase() === value.toLowerCase())
    ) {
      setInterestInput("");
      return;
    }
    updateDraft("interests", [...draft.interests, value]);
    setInterestInput("");
  };
  const removeInterest = (interest) =>
    updateDraft(
      "interests",
      draft.interests.filter((s) => s !== interest),
    );

  const view = editing ? draft : profile;

  return (
    <div className="pd-app-page d-flex flex-column">
      <Navbar />
      <main className="flex-grow-1 profile-page py-4 py-lg-5">
        <div className="container">
          <form onSubmit={saveChanges}>
            <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
              <div>
                <span className="eyebrow mb-2">Your Profile</span>
                <h1 className="display-6 fw-bold mb-2">Manage Your Profile</h1>
                <p className="text-muted mb-0">
                  Keep this up to date - it&apos;s what your recommendations and
                  match scores are based on.
                </p>
              </div>
              {!editing ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={startEditing}
                >
                  <FaPen className="me-2" /> Edit Profile
                </button>
              ) : (
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={cancelEditing}
                  >
                    <FaTimes className="me-2" /> Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <FaSave className="me-2" /> Save Changes
                  </button>
                </div>
              )}
            </div>

            {showSuccess && (
              <div
                className="alert alert-success d-flex align-items-center gap-2 mb-4"
                role="alert"
              >
                <FaCheckCircle />
                Profile saved successfully.
                <button
                  type="button"
                  className="btn-close ms-auto"
                  aria-label="Close"
                  onClick={() => setShowSuccess(false)}
                />
              </div>
            )}

            <div className="row g-4">
              <div className="col-12 col-lg-8">
                <section className="dashboard-panel mb-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <div className="mini-panel-icon">
                      <FaUserCircle />
                    </div>
                    <h2 className="h5 fw-bold mb-0">Personal Information</h2>
                  </div>
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small">Full Name</label>
                      {editing ? (
                        <input
                          className="form-control"
                          value={draft.fullName}
                          onChange={(e) =>
                            updateDraft("fullName", e.target.value)
                          }
                          required
                        />
                      ) : (
                        <p className="fw-semibold mb-0">{view.fullName}</p>
                      )}
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small">Email</label>
                      {editing ? (
                        <input
                          type="email"
                          className="form-control"
                          value={draft.email}
                          onChange={(e) => updateDraft("email", e.target.value)}
                          required
                        />
                      ) : (
                        <p className="fw-semibold mb-0">{view.email}</p>
                      )}
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small">Phone</label>
                      {editing ? (
                        <input
                          className="form-control"
                          value={draft.phone}
                          onChange={(e) => updateDraft("phone", e.target.value)}
                        />
                      ) : (
                        <p className="fw-semibold mb-0">{view.phone || "-"}</p>
                      )}
                    </div>
                  </div>
                </section>

                <section className="dashboard-panel mb-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <div className="mini-panel-icon">
                      <FaGraduationCap />
                    </div>
                    <h2 className="h5 fw-bold mb-0">Academic Information</h2>
                  </div>
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small">College</label>
                      {editing ? (
                        <input
                          className="form-control"
                          value={draft.college}
                          onChange={(e) =>
                            updateDraft("college", e.target.value)
                          }
                        />
                      ) : (
                        <p className="fw-semibold mb-0">
                          {view.college || "-"}
                        </p>
                      )}
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small">Branch</label>
                      {editing ? (
                        <input
                          className="form-control"
                          value={draft.branch}
                          onChange={(e) =>
                            updateDraft("branch", e.target.value)
                          }
                        />
                      ) : (
                        <p className="fw-semibold mb-0">{view.branch || "-"}</p>
                      )}
                    </div>
                    <div className="col-6 col-md-3">
                      <label className="form-label small">CGPA</label>
                      {editing ? (
                        <input
                          className="form-control"
                          value={draft.cgpa}
                          onChange={(e) => updateDraft("cgpa", e.target.value)}
                        />
                      ) : (
                        <p className="fw-semibold mb-0">{view.cgpa || "-"}</p>
                      )}
                    </div>
                    <div className="col-6 col-md-3">
                      <label className="form-label small">
                        Graduation Year
                      </label>
                      {editing ? (
                        <input
                          className="form-control"
                          value={draft.graduationYear}
                          onChange={(e) =>
                            updateDraft("graduationYear", e.target.value)
                          }
                        />
                      ) : (
                        <p className="fw-semibold mb-0">
                          {view.graduationYear || "-"}
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                <section className="dashboard-panel mb-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <div className="mini-panel-icon">
                      <FaBullseye />
                    </div>
                    <h2 className="h5 fw-bold mb-0">Skills &amp; Interests</h2>
                  </div>

                  <p className="small fw-semibold mb-2">Skills</p>
                  {editing && (
                    <div className="d-flex gap-2 mb-3">
                      <input
                        className="form-control form-control-sm"
                        placeholder="Add a skill and press Enter"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addSkill();
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm flex-shrink-0"
                        onClick={addSkill}
                      >
                        <FaPlus className="me-1" /> Add
                      </button>
                    </div>
                  )}
                  <div className="d-flex flex-wrap gap-2 mb-4">
                    {view.skills.length === 0 && (
                      <span className="text-muted small">
                        No skills added yet.
                      </span>
                    )}
                    {view.skills.map((skill) => (
                      <span className="skill-pill" key={skill}>
                        {skill}
                        {editing && (
                          <button
                            type="button"
                            className="pill-remove"
                            onClick={() => removeSkill(skill)}
                            aria-label={`Remove ${skill}`}
                          >
                            <FaTimes />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>

                  <p className="small fw-semibold mb-2">Interests</p>
                  {editing && (
                    <div className="d-flex gap-2 mb-3">
                      <input
                        className="form-control form-control-sm"
                        placeholder="Add an interest and press Enter"
                        value={interestInput}
                        onChange={(e) => setInterestInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addInterest();
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm flex-shrink-0"
                        onClick={addInterest}
                      >
                        <FaPlus className="me-1" /> Add
                      </button>
                    </div>
                  )}
                  <div className="d-flex flex-wrap gap-2">
                    {view.interests.length === 0 && (
                      <span className="text-muted small">
                        No interests added yet.
                      </span>
                    )}
                    {view.interests.map((interest) => (
                      <span className="skill-pill" key={interest}>
                        {interest}
                        {editing && (
                          <button
                            type="button"
                            className="pill-remove"
                            onClick={() => removeInterest(interest)}
                            aria-label={`Remove ${interest}`}
                          >
                            <FaTimes />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                </section>

                <section className="dashboard-panel mb-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <div className="mini-panel-icon">
                      <FaMapMarkerAlt />
                    </div>
                    <h2 className="h5 fw-bold mb-0">Career Preferences</h2>
                  </div>
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small">
                        Preferred Internship Domain
                      </label>
                      {editing ? (
                        <select
                          className="form-select"
                          value={draft.preferredDomain}
                          onChange={(e) =>
                            updateDraft("preferredDomain", e.target.value)
                          }
                        >
                          {DOMAIN_OPTIONS.map((domain) => (
                            <option key={domain} value={domain}>
                              {domain}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="fw-semibold mb-0">
                          {view.preferredDomain || "-"}
                        </p>
                      )}
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small">
                        Preferred Location
                      </label>
                      {editing ? (
                        <input
                          className="form-control"
                          value={draft.preferredLocation}
                          onChange={(e) =>
                            updateDraft("preferredLocation", e.target.value)
                          }
                        />
                      ) : (
                        <p className="fw-semibold mb-0">
                          {view.preferredLocation || "-"}
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                <section className="dashboard-panel">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <div className="mini-panel-icon">
                      <FaLink />
                    </div>
                    <h2 className="h5 fw-bold mb-0">Links &amp; Resume</h2>
                  </div>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small">Resume</label>
                      <div className="d-flex flex-wrap align-items-center gap-2">
                        <input className="form-control" type="file" accept=".pdf,.docx,.txt" onChange={(e) => handleResumeUpload(e.target.files?.[0])} />
                        {resumeFile?.fileName && <button type="button" className="btn btn-outline-danger btn-sm" onClick={removeResume}>Remove</button>}
                      </div>
                      {resumeFile?.fileName ? (
                        <>
                          <p className="small text-success mt-2 mb-0">✓ {resumeFile.fileName} is uploaded and ready for skill-gap analysis.</p>
                          <p className="small mt-2 mb-0"><a href="/skill-gap">View Skill Gap Analysis →</a></p>
                        </>
                      ) : (
                        <p className="text-muted small mt-2 mb-0">Upload a resume to unlock Skill Gap analysis.</p>
                      )}
                      {resumeStatus && <p className="small text-success mt-2 mb-0">{resumeStatus}</p>}
                      {resumeError && <p className="small text-danger mt-2 mb-0">{resumeError}</p>}
                      {view.resume && /^https?:\/\//i.test(view.resume) && (
                        <p className="small mt-2 mb-0"><a href={view.resume} target="_blank" rel="noreferrer">Open resume link</a></p>
                      )}
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small">
                        <FaGithub className="me-1" /> GitHub
                      </label>
                      {editing ? (
                        <input
                          className="form-control"
                          placeholder="https://github.com/..."
                          value={draft.github}
                          onChange={(e) =>
                            updateDraft("github", e.target.value)
                          }
                        />
                      ) : view.github ? (
                        <p className="mb-0">
                          <a
                            href={view.github}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {view.github}
                          </a>
                        </p>
                      ) : (
                        <p className="text-muted mb-0">-</p>
                      )}
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small">
                        <FaLinkedin className="me-1" /> LinkedIn
                      </label>
                      {editing ? (
                        <input
                          className="form-control"
                          placeholder="https://linkedin.com/in/..."
                          value={draft.linkedin}
                          onChange={(e) =>
                            updateDraft("linkedin", e.target.value)
                          }
                        />
                      ) : view.linkedin ? (
                        <p className="mb-0">
                          <a
                            href={view.linkedin}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {view.linkedin}
                          </a>
                        </p>
                      ) : (
                        <p className="text-muted mb-0">-</p>
                      )}
                    </div>
                  </div>
                </section>
              </div>

              <div className="col-12 col-lg-4">
                <section className="dashboard-panel details-side">
                  <h2 className="h6 fw-bold mb-3">Profile Completion</h2>
                  <div className="profile-progress mb-2">
                    <div
                      className="profile-progress-bar"
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                  <p className="text-muted small mb-3">
                    {completion}% complete
                  </p>
                  <p className="small text-muted mb-0">
                    A complete profile improves your AI match scores and unlocks
                    more accurate recommendations.
                  </p>
                </section>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
