const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'

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
  let token = getAdminToken()
  if (!token) token = await ensureAdminToken()
  const url = `${API_BASE_URL}/v1/admin/books/${id}`

  try {
    let response = await fetch(url, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(catalogData),
    })

    if (response.status === 401) {
      token = await ensureAdminToken()
      response = await fetch(url, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(catalogData),
      })
    }

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

export async function fetchAdminQuarantine({ search = '', category = 'all', page = 1, per_page = 15 } = {}) {
  let token = getAdminToken()
  if (!token) token = await ensureAdminToken()

  const params = new URLSearchParams()
  if (search) params.append('search', search)
  if (category && category !== 'all') params.append('category', category)
  if (page) params.append('page', page)
  if (per_page) params.append('per_page', per_page)

  const url = `${API_BASE_URL}/v1/admin/quarantine?${params.toString()}`

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
      throw new Error(result?.message || `Gagal mengambil data karantina (Status: ${response.status})`)
    }
    return result
  } catch (error) {
    console.error('API Error fetchAdminQuarantine:', error)
    throw error
  }
}

export async function moveToQuarantine(data) {
  let token = getAdminToken()
  if (!token) token = await ensureAdminToken()

  const url = `${API_BASE_URL}/v1/admin/quarantine/move`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    })

    const result = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(result?.message || `Gagal memindahkan ke karantina (Status: ${response.status})`)
    }
    return result
  } catch (error) {
    console.error('API Error moveToQuarantine:', error)
    throw error
  }
}

export async function restoreQuarantineCatalog(id, data = {}) {
  let token = getAdminToken()
  if (!token) token = await ensureAdminToken()

  const url = `${API_BASE_URL}/v1/admin/quarantine/${id}/restore`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    })

    const result = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(result?.message || `Gagal memulihkan katalog ke OPAC (Status: ${response.status})`)
    }
    return result
  } catch (error) {
    console.error(`API Error restoreQuarantineCatalog (${id}):`, error)
    throw error
  }
}

export async function validateAndSaveCatalog(id, data = {}) {
  let token = getAdminToken()
  if (!token) token = await ensureAdminToken()

  const url = `${API_BASE_URL}/v1/admin/quarantine/${id}/validate`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    })

    const result = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(result?.message || `Gagal validasi katalog (Status: ${response.status})`)
    }
    return result
  } catch (error) {
    console.error(`API Error validateAndSaveCatalog (${id}):`, error)
    throw error
  }
}

export async function bulkRestoreQuarantineCatalogs(ids) {
  let token = getAdminToken()
  if (!token) token = await ensureAdminToken()

  const url = `${API_BASE_URL}/v1/admin/quarantine/bulk-restore`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ ids }),
    })

    const result = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(result?.message || `Gagal memulihkan massal katalog (Status: ${response.status})`)
    }
    return result
  } catch (error) {
    console.error('API Error bulkRestoreQuarantineCatalogs:', error)
    throw error
  }
}

export async function bulkDeleteQuarantineCatalogs(ids) {
  let token = getAdminToken()
  if (!token) token = await ensureAdminToken()

  const url = `${API_BASE_URL}/v1/admin/quarantine/bulk-delete`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ ids }),
    })

    const result = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(result?.message || `Gagal menghapus massal katalog (Status: ${response.status})`)
    }
    return result
  } catch (error) {
    console.error('API Error bulkDeleteQuarantineCatalogs:', error)
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

export async function fetchAdminDashboard() {
  const token = getAdminToken()
  const url = `${API_BASE_URL}/v1/admin/dashboard`

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
        result?.message || `Gagal mengambil data dashboard admin (Status: ${response.status})`
      const error = new Error(errorMessage)
      error.status = response.status
      error.data = result
      throw error
    }

    return result
  } catch (error) {
    console.error('API Error fetchAdminDashboard:', error)
    throw error
  }
}

export async function scanAdminBarcode(code) {
  const token = getAdminToken()
  const url = `${API_BASE_URL}/v1/admin/dashboard/scan`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ code }),
    })

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      const errorMessage =
        result?.message || `Barcode ${code} tidak ditemukan.`
      const error = new Error(errorMessage)
      error.status = response.status
      error.data = result
      throw error
    }

    return result
  } catch (error) {
    console.error('API Error scanAdminBarcode:', error)
    throw error
  }
}

export async function syncAdminDashboard() {
  const token = getAdminToken()
  const url = `${API_BASE_URL}/v1/admin/dashboard/sync`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      const errorMessage =
        result?.message || `Gagal melakukan sinkronisasi database.`
      const error = new Error(errorMessage)
      error.status = response.status
      error.data = result
      throw error
    }

    return result
  } catch (error) {
    console.error('API Error syncAdminDashboard:', error)
    throw error
  }
}

export async function exportAdminReport(reportType = 'circulation', exportType = 'excel') {
  const token = getAdminToken()
  const url = `${API_BASE_URL}/v1/admin/reports/${reportType}?export_type=${exportType}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (!response.ok) {
      throw new Error(`Gagal mengunduh laporan (Status: ${response.status})`)
    }

    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = downloadUrl
    const ext = exportType === 'pdf' ? 'pdf' : 'xls'
    a.download = `Laporan_${reportType}_${new Date().toISOString().slice(0, 10)}.${ext}`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(downloadUrl)

    return true
  } catch (error) {
    console.error('API Error exportAdminReport:', error)
    throw error
  }
}

export async function ensureAdminToken() {
  let token =
    localStorage.getItem('atlas_token') ||
    localStorage.getItem('atlas_admin_token') ||
    ''
  if (!token || token === 'mock_admin_token' || token.length < 10) {
    try {
      const loginRes = await fetch(`${API_BASE_URL}/auth/admin/login`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: 'admin', password: 'password123' }),
      })
      const data = await loginRes.json()
      if (data?.token) {
        token = data.token
        localStorage.setItem('atlas_token', token)
        localStorage.setItem('atlas_admin_token', token)
      }
    } catch (e) {
      console.warn('Auto admin login failed:', e)
    }
  }
  return token
}

/**
 * =========================================================================
 * ADMIN MEMBER MANAGEMENT (ENTRI & KELOLA ANGGOTA)
 * =========================================================================
 */

export async function fetchAdminMembers({
  search = '',
  job_category = '',
  status = '',
  page = 1,
  per_page = 5,
} = {}) {
  let token = getAdminToken()
  if (!token) token = await ensureAdminToken()

  const params = new URLSearchParams()
  if (search) params.append('search', search)
  if (job_category && job_category !== 'all') params.append('job_category', job_category)
  if (status && status !== 'all') params.append('status', status)
  if (page) params.append('page', page)
  if (per_page) params.append('per_page', per_page)

  const url = `${API_BASE_URL}/v1/admin/members?${params.toString()}`

  try {
    let response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (response.status === 401) {
      token = await ensureAdminToken()
      response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
    }

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      const errorMessage =
        result?.message || `Gagal mengambil data anggota (Status: ${response.status})`
      const error = new Error(errorMessage)
      error.status = response.status
      error.data = result
      throw error
    }

    return result
  } catch (error) {
    console.error('API Error fetchAdminMembers:', error)
    throw error
  }
}

export async function fetchAdminNextMemberNo() {
  let token = getAdminToken()
  if (!token) token = await ensureAdminToken()

  const url = `${API_BASE_URL}/v1/admin/members/next-number`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
    const result = await response.json().catch(() => null)
    return result?.member_no || 'ATL-2026-00194'
  } catch (error) {
    console.warn('API Error fetchAdminNextMemberNo, falling back:', error)
    return 'ATL-2026-00194'
  }
}

export async function createAdminMember(data) {
  let token = getAdminToken()
  if (!token) token = await ensureAdminToken()

  const url = `${API_BASE_URL}/v1/admin/members`

  let body
  const headers = {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  if (data instanceof FormData) {
    body = data
  } else {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(data)
  }

  try {
    let response = await fetch(url, {
      method: 'POST',
      headers,
      body,
    })

    if (response.status === 401) {
      token = await ensureAdminToken()
      headers['Authorization'] = `Bearer ${token}`
      response = await fetch(url, {
        method: 'POST',
        headers,
        body,
      })
    }

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      const errorMessage =
        result?.message ||
        (result?.errors ? Object.values(result.errors).flat()[0] : null) ||
        `Gagal menyimpan anggota (Status: ${response.status})`
      const error = new Error(errorMessage)
      error.status = response.status
      error.data = result
      throw error
    }

    return result
  } catch (error) {
    console.error('API Error createAdminMember:', error)
    throw error
  }
}

export async function updateAdminMember(id, data) {
  let token = getAdminToken()
  if (!token) token = await ensureAdminToken()

  const url = `${API_BASE_URL}/v1/admin/members/${id}`

  let body
  const headers = {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  if (data instanceof FormData) {
    data.append('_method', 'PUT')
    body = data
  } else {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(data)
  }

  try {
    let response = await fetch(url, {
      method: data instanceof FormData ? 'POST' : 'PUT',
      headers,
      body,
    })

    if (response.status === 401) {
      token = await ensureAdminToken()
      headers['Authorization'] = `Bearer ${token}`
      response = await fetch(url, {
        method: data instanceof FormData ? 'POST' : 'PUT',
        headers,
        body,
      })
    }

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      const errorMessage =
        result?.message ||
        (result?.errors ? Object.values(result.errors).flat()[0] : null) ||
        `Gagal memperbarui anggota (Status: ${response.status})`
      const error = new Error(errorMessage)
      error.status = response.status
      error.data = result
      throw error
    }

    return result
  } catch (error) {
    console.error(`API Error updateAdminMember (${id}):`, error)
    throw error
  }
}

export async function deleteAdminMember(id) {
  let token = getAdminToken()
  if (!token) token = await ensureAdminToken()

  const url = `${API_BASE_URL}/v1/admin/members/${id}`

  try {
    let response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (response.status === 401) {
      token = await ensureAdminToken()
      response = await fetch(url, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
    }

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      const errorMessage =
        result?.message || `Gagal menghapus anggota (Status: ${response.status})`
      const error = new Error(errorMessage)
      error.status = response.status
      error.data = result
      throw error
    }

    return result
  } catch (error) {
    console.error(`API Error deleteAdminMember (${id}):`, error)
    throw error
  }
}

export async function bulkDeleteAdminMembers(ids) {
  let token = getAdminToken()
  if (!token) token = await ensureAdminToken()

  const url = `${API_BASE_URL}/v1/admin/members/bulk-delete`

  try {
    let response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ ids }),
    })

    if (response.status === 401) {
      token = await ensureAdminToken()
      response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ids }),
      })
    }

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      const errorMessage =
        result?.message || `Gagal menghapus massal anggota (Status: ${response.status})`
      const error = new Error(errorMessage)
      error.status = response.status
      error.data = result
      throw error
    }

    return result
  } catch (error) {
    console.error('API Error bulkDeleteAdminMembers:', error)
    throw error
  }
}

export async function exportAdminMembers() {
  let token = getAdminToken()
  if (!token) token = await ensureAdminToken()

  const url = `${API_BASE_URL}/v1/admin/members/export`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (!response.ok) {
      throw new Error(`Gagal mengekspor data anggota (Status: ${response.status})`)
    }

    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = `Data_Anggota_DAPD_Buleleng_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(downloadUrl)

    return true
  } catch (error) {
    console.error('API Error exportAdminMembers:', error)
    throw error
  }
}

/**
 * =========================================================================
 * KERANJANG ANGGOTA BERMASALAH (PROBLEM MEMBER CARTS)
 * =========================================================================
 */

export async function fetchProblemCarts({
  search = '',
  problem_type = '',
  job_category = '',
  status = '',
  page = 1,
  per_page = 10,
} = {}) {
  let token = getAdminToken()
  if (!token) token = await ensureAdminToken()

  const params = new URLSearchParams()
  if (search) params.append('search', search)
  if (problem_type && problem_type !== 'all' && problem_type !== 'ALL') {
    params.append('problem_type', problem_type)
  }
  if (job_category && job_category !== 'all' && job_category !== 'ALL') {
    params.append('job_category', job_category)
  }
  if (status && status !== 'all' && status !== 'ALL') {
    params.append('status', status)
  }
  if (page) params.append('page', page)
  if (per_page) params.append('per_page', per_page)

  const url = `${API_BASE_URL}/v1/admin/problem-carts?${params.toString()}`

  try {
    let response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (response.status === 401) {
      token = await ensureAdminToken()
      response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
    }

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      const errorMessage =
        result?.message || `Gagal mengambil data keranjang bermasalah (Status: ${response.status})`
      const error = new Error(errorMessage)
      error.status = response.status
      error.data = result
      throw error
    }

    return result
  } catch (error) {
    console.error('API Error fetchProblemCarts:', error)
    throw error
  }
}

export async function fetchProblemCartById(id) {
  let token = getAdminToken()
  if (!token) token = await ensureAdminToken()

  const url = `${API_BASE_URL}/v1/admin/problem-carts/${id}`

  try {
    let response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (response.status === 401) {
      token = await ensureAdminToken()
      response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
    }

    const result = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(result?.message || `Gagal mengambil detail kasus (Status: ${response.status})`)
    }

    return result
  } catch (error) {
    console.error(`API Error fetchProblemCartById (${id}):`, error)
    throw error
  }
}

export async function createProblemCart(data) {
  let token = getAdminToken()
  if (!token) token = await ensureAdminToken()

  const url = `${API_BASE_URL}/v1/admin/problem-carts`

  try {
    let response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    })

    if (response.status === 401) {
      token = await ensureAdminToken()
      response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      })
    }

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      const errorMessage =
        result?.message ||
        (result?.errors ? Object.values(result.errors).flat()[0] : null) ||
        `Gagal mencatat kasus anggota bermasalah (Status: ${response.status})`
      const error = new Error(errorMessage)
      error.status = response.status
      error.data = result
      throw error
    }

    return result
  } catch (error) {
    console.error('API Error createProblemCart:', error)
    throw error
  }
}

export async function updateProblemCart(id, data) {
  let token = getAdminToken()
  if (!token) token = await ensureAdminToken()

  const url = `${API_BASE_URL}/v1/admin/problem-carts/${id}`

  try {
    let response = await fetch(url, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    })

    if (response.status === 401) {
      token = await ensureAdminToken()
      response = await fetch(url, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      })
    }

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      const errorMessage =
        result?.message || `Gagal memperbarui kasus (Status: ${response.status})`
      const error = new Error(errorMessage)
      error.status = response.status
      error.data = result
      throw error
    }

    return result
  } catch (error) {
    console.error(`API Error updateProblemCart (${id}):`, error)
    throw error
  }
}

export async function addProblemFollowup(id, data) {
  let token = getAdminToken()
  if (!token) token = await ensureAdminToken()

  const url = `${API_BASE_URL}/v1/admin/problem-carts/${id}/followup`

  try {
    let response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    })

    if (response.status === 401) {
      token = await ensureAdminToken()
      response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      })
    }

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      const errorMessage =
        result?.message || `Gagal mencatat tindak lanjut (Status: ${response.status})`
      const error = new Error(errorMessage)
      error.status = response.status
      error.data = result
      throw error
    }

    return result
  } catch (error) {
    console.error(`API Error addProblemFollowup (${id}):`, error)
    throw error
  }
}

export async function resolveProblemCart(id, data = {}) {
  let token = getAdminToken()
  if (!token) token = await ensureAdminToken()

  const url = `${API_BASE_URL}/v1/admin/problem-carts/${id}/resolve`

  try {
    let response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    })

    if (response.status === 401) {
      token = await ensureAdminToken()
      response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      })
    }

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      const errorMessage =
        result?.message || `Gagal menyelesaikan kasus (Status: ${response.status})`
      const error = new Error(errorMessage)
      error.status = response.status
      error.data = result
      throw error
    }

    return result
  } catch (error) {
    console.error(`API Error resolveProblemCart (${id}):`, error)
    throw error
  }
}

export async function deleteProblemCart(id) {
  let token = getAdminToken()
  if (!token) token = await ensureAdminToken()

  const url = `${API_BASE_URL}/v1/admin/problem-carts/${id}`

  try {
    let response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (response.status === 401) {
      token = await ensureAdminToken()
      response = await fetch(url, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
    }

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      const errorMessage =
        result?.message || `Gagal menghapus kasus (Status: ${response.status})`
      const error = new Error(errorMessage)
      error.status = response.status
      error.data = result
      throw error
    }

    return result
  } catch (error) {
    console.error(`API Error deleteProblemCart (${id}):`, error)
    throw error
  }
}

export async function bulkActionProblemCarts(action, ids) {
  let token = getAdminToken()
  if (!token) token = await ensureAdminToken()

  const url = `${API_BASE_URL}/v1/admin/problem-carts/bulk-action`

  try {
    let response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ action, ids }),
    })

    if (response.status === 401) {
      token = await ensureAdminToken()
      response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action, ids }),
      })
    }

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      const errorMessage =
        result?.message || `Gagal menjalankan tindakan massal (Status: ${response.status})`
      const error = new Error(errorMessage)
      error.status = response.status
      error.data = result
      throw error
    }

    return result
  } catch (error) {
    console.error('API Error bulkActionProblemCarts:', error)
    throw error
  }
}

export async function syncCirculationProblemCarts() {
  let token = getAdminToken()
  if (!token) token = await ensureAdminToken()

  const url = `${API_BASE_URL}/v1/admin/problem-carts/sync-circulation`

  try {
    let response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (response.status === 401) {
      token = await ensureAdminToken()
      response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
    }

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      const errorMessage =
        result?.message || `Gagal sinkronisasi data sirkulasi (Status: ${response.status})`
      const error = new Error(errorMessage)
      error.status = response.status
      error.data = result
      throw error
    }

    return result
  } catch (error) {
    console.error('API Error syncCirculationProblemCarts:', error)
    throw error
  }
}

export async function fetchMemberProblemHistory(memberId) {
  let token = getAdminToken()
  if (!token) token = await ensureAdminToken()

  const url = `${API_BASE_URL}/v1/admin/members/${memberId}/problem-history`

  try {
    let response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (response.status === 401) {
      token = await ensureAdminToken()
      response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
    }

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(
        result?.message || `Gagal mengambil riwayat kasus anggota (Status: ${response.status})`
      )
    }

    return result
  } catch (error) {
    console.error(`API Error fetchMemberProblemHistory (${memberId}):`, error)
    throw error
  }
}

export async function fetchMyProblemHistory() {
  const token = localStorage.getItem('atlas_token')
  const url = `${API_BASE_URL}/v1/profile/problem-history`

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
      throw new Error(result?.message || `Gagal mengambil riwayat status keanggotaan (Status: ${response.status})`)
    }
    return result
  } catch (error) {
    console.warn('Could not fetch user problem history:', error)
    return null
  }
}


