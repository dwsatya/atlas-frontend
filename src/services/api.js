const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export async function fetchBooks({ search = '', page = 1 } = {}) {
  const params = new URLSearchParams()
  if (search) params.append('search', search)
  if (page) params.append('page', page)

  const url = `${API_BASE_URL}/books?${params.toString()}`

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Gagal mengambil data buku (Status: ${response.status})`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('API Error fetchBooks:', error)
    throw error
  }
}

export async function fetchBookById(id) {
  const url = `${API_BASE_URL}/books/${id}`

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Gagal mengambil detail buku (Status: ${response.status})`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error(`API Error fetchBookById (${id}):`, error)
    throw error
  }
}

export async function registerMember(formDataOrData) {
  const url = `${API_BASE_URL}/auth/member/register`

  let body
  const headers = {
    Accept: 'application/json',
  }

  if (formDataOrData instanceof FormData) {
    body = formDataOrData
  } else {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(formDataOrData)
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
    })

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      const errorMessage =
        result?.message ||
        (result?.errors ? Object.values(result.errors).flat()[0] : null) ||
        `Registrasi gagal (Status: ${response.status})`
      const error = new Error(errorMessage)
      error.status = response.status
      error.data = result
      throw error
    }

    return result
  } catch (error) {
    console.error('API Error registerMember:', error)
    throw error
  }
}

export async function loginMember({ email, password }) {
  const url = `${API_BASE_URL}/auth/member/login`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      const errorMessage =
        result?.message ||
        (result?.errors ? Object.values(result.errors).flat()[0] : null) ||
        `Login gagal (Status: ${response.status})`
      const error = new Error(errorMessage)
      error.status = response.status
      error.data = result
      throw error
    }

    return result
  } catch (error) {
    console.error('API Error loginMember:', error)
    throw error
  }
}

export const loginUser = loginMember

export function getGoogleLoginUrl() {
  return `${BACKEND_BASE_URL}/auth/google`
}
