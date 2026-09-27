const ACCOUNTS_KEY = "prayasai_accounts";

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

function readAccounts() {
  try {
    const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]");

    return Array.isArray(accounts) ? accounts : [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export async function mockLogin({ email, password }) {
  await delay();

  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();

  if (!normalizedEmail || !password) {
    throw new Error("Email and password are required.");
  }

  const account = readAccounts().find(
    (item) => String(item.email || "").toLowerCase() === normalizedEmail,
  );

  if (!account || account.password !== password || !account.user) {
    throw new Error("Invalid email or password.");
  }

  return {
    user: account.user,
    token: `mock-token-${account.user.id}`,
  };
}

export async function mockRegister(formData) {
  await delay();

  const email = String(formData.email || "")
    .trim()
    .toLowerCase();

  const accounts = readAccounts();

  if (!email || !formData.password) {
    throw new Error("Email and password are required.");
  }

  if (
    accounts.some((item) => String(item.email || "").toLowerCase() === email)
  ) {
    throw new Error(
      "An account with this email already exists. Please sign in.",
    );
  }

  /*
   * Store ALL registration/profile information
   * in the authenticated user.
   */
  const user = {
    id: `student-${Date.now()}`,

    // Personal information
    fullName: String(formData.fullName || "").trim(),
    email,
    mobile: String(formData.mobile || "").trim(),

    // Academic information
    college: String(formData.college || "").trim(),
    degree: formData.degree || "",
    branch: formData.branch || "",
    cgpa:
      formData.cgpa !== undefined &&
      formData.cgpa !== null &&
      formData.cgpa !== ""
        ? String(formData.cgpa)
        : "",
    graduationYear:
      formData.graduationYear !== undefined &&
      formData.graduationYear !== null &&
      formData.graduationYear !== ""
        ? String(formData.graduationYear)
        : "",

    // Skills and interests
    skills: Array.isArray(formData.skills) ? formData.skills : [],

    interests: Array.isArray(formData.interests)
      ? formData.interests
      : typeof formData.interests === "string"
        ? formData.interests
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],

    // Career preferences
    preferredJobField:
      formData.preferredJobField || formData.preferredDomain || "",

    // Keep preferredDomain as an alias for older components
    preferredDomain:
      formData.preferredJobField || formData.preferredDomain || "",

    preferredLocation: String(formData.preferredLocation || "").trim(),

    preferredWorkMode: formData.preferredWorkMode || "",

    // Account information
    role: "student",
    avatar: null,
    profileCompletion: 100,
  };

  /*
   * Save the account.
   */
  accounts.push({
    email,
    password: formData.password,
    user,
  });

  writeAccounts(accounts);

  /*
   * Also save a complete profile copy.
   * Profile.jsx reads this using the user's email.
   */
  localStorage.setItem(
    `prayasai_profile_data_${email}`,
    JSON.stringify({
      fullName: user.fullName,
      email: user.email,
      phone: user.mobile,

      college: user.college,
      degree: user.degree,
      branch: user.branch,
      cgpa: user.cgpa,
      graduationYear: user.graduationYear,

      skills: user.skills,
      interests: user.interests,

      preferredJobField: user.preferredJobField,
      preferredDomain: user.preferredDomain,
      preferredLocation: user.preferredLocation,
      preferredWorkMode: user.preferredWorkMode,

      resume: "",
    }),
  );

  return {
    user,
    token: `mock-token-${user.id}`,
  };
}
