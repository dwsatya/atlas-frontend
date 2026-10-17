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

export async function loginAdmin({ username, password }) {
  const url = `${API_BASE_URL}/auth/admin/login`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      const errorMessage =
        result?.message ||
        (result?.errors ? Object.values(result.errors).flat()[0] : null) ||
        `Login admin gagal (Status: ${response.status})`
      const error = new Error(errorMessage)
      error.status = response.status
      error.data = result
      throw error
    }

    return result
  } catch (error) {
    console.error('API Error loginAdmin:', error)
    throw error
  }
}

export function getGoogleLoginUrl() {
  return `${BACKEND_BASE_URL}/auth/google`
}

export async function fetchProfile() {
  const token = localStorage.getItem('atlas_token')
  const url = `${API_BASE_URL}/v1/profile`

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (!response.ok) {
      throw new Error(`Gagal mengambil profil (Status: ${response.status})`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('API Error fetchProfile:', error)
    throw error
  }
}

export async function updateProfile(dataOrFormData) {
  const token = localStorage.getItem('atlas_token')
  const url = `${API_BASE_URL}/v1/profile`

  const headers = {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  let body
  let method = 'PUT'

  if (dataOrFormData instanceof FormData) {
    body = dataOrFormData
    method = 'POST'
    if (!dataOrFormData.has('_method')) {
      dataOrFormData.append('_method', 'PUT')
    }
  } else {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(dataOrFormData)
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body,
    })

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      const errorMessage =
        result?.message ||
        (result?.errors ? Object.values(result.errors).flat()[0] : null) ||
        `Gagal memperbarui profil (Status: ${response.status})`
      const error = new Error(errorMessage)
      error.status = response.status
      error.data = result
      throw error
    }

    return result
  } catch (error) {
    console.error('API Error updateProfile:', error)
    throw error
  }
}

export async function updateProfilePhoto(file) {
  const token = localStorage.getItem('atlas_token')
  const url = `${API_BASE_URL}/v1/profile/photo`

  const formData = new FormData()
  formData.append('photo', file)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    })

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      const errorMessage =
        result?.message ||
        (result?.errors ? Object.values(result.errors).flat()[0] : null) ||
        `Gagal memperbarui foto profil (Status: ${response.status})`
      const error = new Error(errorMessage)
      error.status = response.status
      error.data = result
      throw error
    }

    return result
  } catch (error) {
    console.error('API Error updateProfilePhoto:', error)
    throw error
  }
}

function getAdminToken() {
  return localStorage.getItem('atlas_admin_token') || localStorage.getItem('atlas_token') || ''
}

export async function createAdminCatalog(catalogData) {
  const token = getAdminToken()
  const url = `${API_BASE_URL}/v1/admin/books`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(catalogData),
    })

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      const errorMessage =
        result?.message ||
        (result?.errors ? Object.values(result.errors).flat()[0] : null) ||
        `Gagal menyimpan katalog (Status: ${response.status})`
      const error = new Error(errorMessage)
      error.status = response.status
      error.data = result
      throw error
    }

    return result
  } catch (error) {
    console.error('API Error createAdminCatalog:', error)
    throw error
  }
}

export async function updateAdminCatalog(id, catalogData) {
  const token = getAdminToken()
  const url = `${API_BASE_URL}/v1/admin/books/${id}`

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(catalogData),
    })

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      const errorMessage =
        result?.message ||
        (result?.errors ? Object.values(result.errors).flat()[0] : null) ||
        `Gagal memperbarui katalog (Status: ${response.status})`
      const error = new Error(errorMessage)
      error.status = response.status
      error.data = result
      throw error
    }

    return result
  } catch (error) {
    console.error(`API Error updateAdminCatalog (${id}):`, error)
    throw error
  }
}

export async function fetchAdminCatalogs({ search = '', is_quarantine, page = 1, per_page = 15 } = {}) {
  const token = getAdminToken()
  const params = new URLSearchParams()
  if (search) params.append('search', search)
  if (is_quarantine !== undefined) params.append('is_quarantine', is_quarantine ? '1' : '0')
  if (page) params.append('page', page)
  if (per_page) params.append('per_page', per_page)

  const url = `${API_BASE_URL}/v1/admin/books?${params.toString()}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      const errorMessage =
        result?.message || `Gagal mengambil daftar katalog admin (Status: ${response.status})`
      const error = new Error(errorMessage)
      error.status = response.status
      error.data = result
      throw error
    }

    return result
  } catch (error) {
    console.error('API Error fetchAdminCatalogs:', error)
    throw error
  }
}

export async function fetchAdminCatalogById(id) {
  const token = getAdminToken()
  const url = `${API_BASE_URL}/v1/admin/books/${id}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      const errorMessage =
        result?.message || `Gagal mengambil detail katalog (Status: ${response.status})`
      const error = new Error(errorMessage)
      error.status = response.status
      error.data = result
      throw error
    }

    return result
  } catch (error) {
    console.error(`API Error fetchAdminCatalogById (${id}):`, error)
    throw error
  }
}

export async function deleteAdminCatalog(id) {
  const token = getAdminToken()
  const url = `${API_BASE_URL}/v1/admin/books/${id}`

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      const errorMessage =
        result?.message || `Gagal menghapus katalog (Status: ${response.status})`
      const error = new Error(errorMessage)
      error.status = response.status
      error.data = result
      throw error
    }

    return result
  } catch (error) {
    console.error(`API Error deleteAdminCatalog (${id}):`, error)
    throw error
  }
}

export async function fetchAdminCollections({
  search = '',
  status = '',
  material_type = '',
  room_location = '',
  year = '',
  page = 1,
  per_page = 10,
} = {}) {
  const token = getAdminToken()
  const params = new URLSearchParams()
  if (search) params.append('search', search)
  if (status) params.append('status', status)
  if (material_type) params.append('material_type', material_type)
  if (room_location) params.append('room_location', room_location)
  if (year) params.append('year', year)
  if (page) params.append('page', page)
  if (per_page) params.append('per_page', per_page)

  const url = `${API_BASE_URL}/v1/admin/collections?${params.toString()}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      const errorMessage =
        result?.message || `Gagal mengambil daftar koleksi eksemplar (Status: ${response.status})`
      const error = new Error(errorMessage)
      error.status = response.status
      error.data = result
      throw error
    }

    return result
  } catch (error) {
    console.error('API Error fetchAdminCollections:', error)
    throw error
  }
}

export async function updateAdminCollection(collectionId, collectionData) {
  const token = getAdminToken()
  const url = `${API_BASE_URL}/v1/admin/collections/${collectionId}`

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(collectionData),
    })

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      const errorMessage =
        result?.message ||
        (result?.errors ? Object.values(result.errors).flat()[0] : null) ||
        `Gagal memperbarui eksemplar (Status: ${response.status})`
      const error = new Error(errorMessage)
      error.status = response.status
      error.data = result
      throw error
    }

    return result
  } catch (error) {
    console.error(`API Error updateAdminCollection (${collectionId}):`, error)
    throw error
  }
}

export async function deleteAdminCollection(collectionId) {
  const token = getAdminToken()
  const url = `${API_BASE_URL}/v1/admin/collections/${collectionId}`

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      const errorMessage =
        result?.message || `Gagal menghapus eksemplar (Status: ${response.status})`
      const error = new Error(errorMessage)
      error.status = response.status
      error.data = result
      throw error
    }

    return result
  } catch (error) {
    console.error(`API Error deleteAdminCollection (${collectionId}):`, error)
    throw error
  }
}

export async function importAdminCatalogExcel(file) {
  const token = getAdminToken()
  const url = `${API_BASE_URL}/v1/admin/books/import`

  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    })

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      const errorMessage =
        result?.message ||
        (result?.errors ? Object.values(result.errors).flat()[0] : null) ||
        `Gagal mengimpor file Excel (Status: ${response.status})`
      const error = new Error(errorMessage)
      error.status = response.status
      error.data = result
      throw error
    }

    return result
  } catch (error) {
    console.error('API Error importAdminCatalogExcel:', error)
    throw error
  }
}


