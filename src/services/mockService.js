const ACCOUNTS_KEY = 'prayasai_accounts'
const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms))

function readAccounts() {
  try {
    const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]')
    return Array.isArray(accounts) ? accounts : []
  } catch {
    return []
  }
}

function writeAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

export async function mockLogin({ email, password }) {
  await delay()
  const normalizedEmail = String(email || '').trim().toLowerCase()
  if (!normalizedEmail || !password) {
    throw new Error('Email and password are required.')
  }

  const account = readAccounts().find(
    (item) => String(item.email || '').toLowerCase() === normalizedEmail
  )

  if (!account || account.password !== password || !account.user) {
    throw new Error('Invalid email or password.')
  }

  return {
    user: account.user,
    token: `mock-token-${account.user.id}`,
  }
}

export async function mockRegister(formData) {
  await delay()
  const email = String(formData.email || '').trim().toLowerCase()
  const accounts = readAccounts()

  if (!email || !formData.password) {
    throw new Error('Email and password are required.')
  }

  if (accounts.some((item) => String(item.email || '').toLowerCase() === email)) {
    throw new Error('An account with this email already exists. Please sign in.')
  }

  const user = {
    id: `student-${Date.now()}`,
    fullName: String(formData.fullName || '').trim(),
    email,
    mobile: String(formData.mobile || '').trim(),
    college: String(formData.college || '').trim(),
    degree: formData.degree || '',
    branch: formData.branch || '',
    graduationYear: Number(formData.graduationYear) || '',
    role: 'student',
    avatar: null,
    profileCompletion: 50,
  }

  accounts.push({
    email,
    password: formData.password,
    user,
  })
  writeAccounts(accounts)

  // Seed only the new user's own profile; no demo account/data is created.
  localStorage.setItem(`prayasai_profile_data_${email}`, JSON.stringify({
    fullName: user.fullName,
    email: user.email,
    phone: user.mobile,
    college: user.college,
    branch: user.branch,
    cgpa: '',
    graduationYear: user.graduationYear ? String(user.graduationYear) : '',
    skills: [],
    interests: [],
    preferredDomain: '',
    preferredLocation: '',
    resume: '',
    github: '',
    linkedin: '',
  }))

  return {
    user,
    token: `mock-token-${user.id}`,
  }
}
