const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

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

export async function loginUser({ email, password }) {
  const url = `${API_BASE_URL}/auth/member/login`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Login gagal. Periksa kembali email dan password Anda.')
    }

    return result
  } catch (error) {
    console.error('API Error loginUser:', error)
    throw error
  }
}

export function getGoogleLoginUrl() {
  const backendBase = API_BASE_URL.replace(/\/api\/?$/, '')
  return `${backendBase}/auth/google`
}
