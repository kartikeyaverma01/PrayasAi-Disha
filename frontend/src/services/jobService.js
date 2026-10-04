import { INTERNSHIPS } from "../data/internships";

export const INDIAN_STATES = [
  "All India",
  "Delhi",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Chandigarh",
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
];

export const INDIAN_CITIES = [
  "Delhi",
  "Noida",
  "Gurugram",
  "Lucknow",
  "Kanpur",
  "Varanasi",
  "Agra",
  "Jaipur",
  "Mumbai",
  "Pune",
  "Nagpur",
  "Bengaluru",
  "Mysuru",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
  "Surat",
  "Vadodara",
  "Bhopal",
  "Indore",
  "Patna",
  "Ranchi",
  "Bhubaneswar",
  "Kochi",
  "Thiruvananthapuram",
  "Coimbatore",
  "Visakhapatnam",
  "Chandigarh",
];

export const CATEGORIES = [
  ...new Set(INTERNSHIPS.map((item) => item.category).filter(Boolean)),
].sort();

export async function fetchLiveInternships() {
  return INTERNSHIPS.map((internship) => ({
    ...internship,
  }));
}

const normalize = (value) =>
  String(value || "")
    .toLowerCase()
    .trim();

export function calculateMatch(internship, profile = {}) {
  // =====================================================
  // 1. SKILLS — 70 POINTS
  // =====================================================

  const profileSkills = Array.isArray(profile.skills)
    ? profile.skills.map(normalize)
    : [];

  const internshipSkills = Array.isArray(internship.skills)
    ? internship.skills
    : [];

  const matchedSkills = internshipSkills.filter((skill) =>
    profileSkills.some(
      (userSkill) =>
        userSkill === normalize(skill) ||
        userSkill.includes(normalize(skill)) ||
        normalize(skill).includes(userSkill),
    ),
  );

  const missingSkills = internshipSkills.filter(
    (skill) => !matchedSkills.includes(skill),
  );

  const skillRatio = internshipSkills.length
    ? matchedSkills.length / internshipSkills.length
    : 0;

  const skillScore = Math.round(skillRatio * 70);

  // =====================================================
  // 2. LOCATION — 15 POINTS
  // =====================================================

  const preferredLocation = normalize(profile.preferredLocation);

  const internshipLocation = normalize(internship.location);

  /*
   * Example:
   * Profile: Noida
   * Internship: Noida (Hybrid)
   * Result: 15/15
   *
   * Profile: Noida
   * Internship: Nagercoil (Hybrid)
   * Result: 5/15
   */

  const locationScore =
    preferredLocation && internshipLocation.includes(preferredLocation)
      ? 15
      : 5;

  // =====================================================
  // 3. JOB FIELD / INTEREST — 10 POINTS
  // =====================================================

  const preferredJobField = normalize(
    profile.preferredJobField || profile.preferredDomain,
  );

  const category = normalize(internship.category);

  const interestScore =
    preferredJobField &&
    (category.includes(preferredJobField) ||
      preferredJobField.includes(category))
      ? 10
      : 5;

  // =====================================================
  // 4. EDUCATION — 10 POINTS
  // =====================================================

  const educationScore =
    profile.cgpa &&
    internship.minimumCgpa &&
    Number(profile.cgpa) >= Number(internship.minimumCgpa)
      ? 10
      : internship.minimumCgpa
        ? 0
        : 5;

  // =====================================================
  // 5. WORK MODE — 5 POINTS
  // =====================================================

  const preferredWorkMode = normalize(profile.preferredWorkMode);

  const rawInternshipMode = normalize(internship.mode);

  const rawInternshipLocation = normalize(internship.location);

  let internshipWorkMode = "";

  /*
   * Work mode can be stored in:
   *
   * internship.mode
   *
   * OR inside location:
   *
   * "Nagercoil (Hybrid)"
   * "Mumbai (Remote)"
   * "Delhi (On-site)"
   */

  // First use an explicit valid mode.
  if (
    rawInternshipMode &&
    rawInternshipMode !== "not specified" &&
    rawInternshipMode !== "n/a" &&
    rawInternshipMode !== "na" &&
    rawInternshipMode !== "unknown"
  ) {
    internshipWorkMode = rawInternshipMode;
  }

  // Otherwise detect mode from location.
  else if (rawInternshipLocation.includes("remote")) {
    internshipWorkMode = "remote";
  } else if (rawInternshipLocation.includes("hybrid")) {
    internshipWorkMode = "hybrid";
  } else if (
    rawInternshipLocation.includes("on-site") ||
    rawInternshipLocation.includes("onsite") ||
    rawInternshipLocation.includes("on site")
  ) {
    internshipWorkMode = "on-site";
  }

  /*
   * Compare student's preferred work mode
   * with the internship's detected work mode.
   */
  const workModeScore =
    preferredWorkMode &&
    internshipWorkMode &&
    (internshipWorkMode.includes(preferredWorkMode) ||
      preferredWorkMode.includes(internshipWorkMode))
      ? 5
      : 0;

  // =====================================================
  // TOTAL MATCH
  // =====================================================

  const match = Math.min(
    98,
    Math.max(
      20,
      skillScore +
        locationScore +
        interestScore +
        educationScore +
        workModeScore,
    ),
  );

  // =====================================================
  // RETURN RESULT
  // =====================================================

  return {
    ...internship,

    match,

    matchedSkills,

    missingSkills,

    breakdown: {
      skills: skillScore,
      skillsMax: 70,

      education: educationScore,
      educationMax: 10,

      interest: interestScore,
      interestMax: 10,

      location: locationScore,
      locationMax: 15,

      workMode: workModeScore,
      workModeMax: 5,
    },
  };
}

export function internshipUrl(internship) {
  return internship?.url || "#";
}

export function getIndianLocations() {
  return [...INDIAN_STATES];
}

export function getCategories() {
  return [...CATEGORIES];
}
