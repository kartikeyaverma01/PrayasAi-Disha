import { INTERNSHIPS } from "../data/internships";

export const INDIAN_STATES = [
  "All India","Delhi","Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa",
  "Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim",
  "Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Chandigarh",
  "Jammu and Kashmir","Ladakh","Puducherry"
];

export const INDIAN_CITIES = [
  "Delhi","Noida","Gurugram","Lucknow","Kanpur","Varanasi","Agra","Jaipur","Mumbai","Pune","Nagpur",
  "Bengaluru","Mysuru","Hyderabad","Chennai","Kolkata","Ahmedabad","Surat","Vadodara","Bhopal",
  "Indore","Patna","Ranchi","Bhubaneswar","Kochi","Thiruvananthapuram","Coimbatore",
  "Visakhapatnam","Chandigarh"
];

export const CATEGORIES = [...new Set(INTERNSHIPS.map((item) => item.category).filter(Boolean))].sort();

export async function fetchLiveInternships() {
  // The selected internship dataset is bundled for the frontend.
  // The function remains async so it can later be replaced by a backend API.
  return INTERNSHIPS.map((internship) => ({ ...internship }));
}

const normalize = (value) => String(value || "").toLowerCase().trim();

export function calculateMatch(internship, profile = {}) {
  const profileSkills = Array.isArray(profile.skills)
    ? profile.skills.map(normalize)
    : [];
  const internshipSkills = Array.isArray(internship.skills) ? internship.skills : [];

  const matchedSkills = internshipSkills.filter((skill) =>
    profileSkills.some((userSkill) => userSkill === normalize(skill) || userSkill.includes(normalize(skill)) || normalize(skill).includes(userSkill))
  );
  const missingSkills = internshipSkills.filter(
    (skill) => !matchedSkills.includes(skill)
  );

  const skillRatio = internshipSkills.length
    ? matchedSkills.length / internshipSkills.length
    : 0;
  const skillScore = Math.round(skillRatio * 70);

  const preferredLocation = normalize(profile.preferredLocation);
  const internshipLocation = normalize(internship.location);
  const locationScore =
    preferredLocation && internshipLocation.includes(preferredLocation) ? 15 : 5;

  const preferredDomain = normalize(profile.preferredDomain);
  const category = normalize(internship.category);
  const interestScore =
    preferredDomain && (category.includes(preferredDomain) || preferredDomain.includes(category))
      ? 10
      : 5;

  const educationScore =
    profile.cgpa && internship.minimumCgpa && Number(profile.cgpa) >= Number(internship.minimumCgpa)
      ? 10
      : internship.minimumCgpa ? 0 : 5;

  const match = Math.min(
    98,
    Math.max(20, skillScore + locationScore + interestScore + educationScore)
  );

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
      experience: 0,
      experienceMax: 0,
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
