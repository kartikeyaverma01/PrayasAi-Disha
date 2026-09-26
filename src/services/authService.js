import api from './api'
import * as mockService from './mockService'

// Frontend-only mode is the default until the FastAPI backend is connected.
// Set VITE_USE_MOCK_DATA=false later when the real backend is ready.
const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA !== 'false'
const TOKEN_KEY = 'prayasai_token'
const USER_KEY = 'prayasai_user'

export async function loginUser(credentials) {
  if (USE_MOCK) {
    const { user, token } = await mockService.mockLogin(credentials)
    persistSession(user, token)
    return user
  }
  const { data } = await api.post('/auth/login', credentials)
  persistSession(data.user, data.token)
  return data.user
}

export async function registerUser(formData) {
  if (USE_MOCK) {
    const { user, token } = await mockService.mockRegister(formData)
    persistSession(user, token)
    return user
  }
  const { data } = await api.post('/auth/register', formData)
  persistSession(data.user, data.token)
  return data.user
}

export function logoutUser() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    const user = raw ? JSON.parse(raw) : null
    if (!user) return null
    if (!USE_MOCK) return user
    const accounts = JSON.parse(localStorage.getItem('prayasai_accounts') || '[]')
    return accounts.some((account) => account.user?.email?.toLowerCase() === user.email?.toLowerCase()) ? user : null
  } catch {
    return null
  }
}

function persistSession(user, token) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  localStorage.setItem(TOKEN_KEY, token || `mock-token-${user?.id || 'session'}`)
}
