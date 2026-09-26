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

/*
 * ---------------------------------------------------------
 * Internship catalogue
 * ---------------------------------------------------------
 *
 * This returns the available internship data.
 *
 * IMPORTANT:
 * No matching or recommendation score is calculated here.
 */
export async function fetchLiveInternships() {
  return INTERNSHIPS.map((internship) => ({
    ...internship,
  }));
}

/*
 * ---------------------------------------------------------
 * Internship URL
 * ---------------------------------------------------------
 *
 * Used to open the original internship/source page.
 */
export function internshipUrl(internship) {
  return (
    internship?.source_url || internship?.sourceUrl || internship?.url || "#"
  );
}

/*
 * ---------------------------------------------------------
 * Indian locations
 * ---------------------------------------------------------
 */

export function getIndianLocations() {
  return [...INDIAN_STATES];
}

/*
 * ---------------------------------------------------------
 * Internship categories
 * ---------------------------------------------------------
 */

export function getCategories() {
  return [...CATEGORIES];
}
