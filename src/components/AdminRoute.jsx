import { useRef } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { notification } from 'antd'

/**
 * Route Guard khusus untuk halaman Administrator.
 * - Jika belum login: arahkan ke /admin/login
 * - Jika sudah login tetapi akun Member (bukan Admin): tolak akses & arahkan ke beranda (/) dengan notifikasi Ant Design
 * - Jika Admin: izinkan akses ke halaman
 */
export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth()
  const location = useLocation()
  const hasNotifiedRef = useRef(false)

  // 1. Belum login sama sekali -> redirect ke halaman login admin
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  // 2. Sudah login, tapi bukan akun admin (misal akun member biasa) -> tolak akses
  if (!isAdmin) {
    if (!hasNotifiedRef.current) {
      hasNotifiedRef.current = true
      notification.warning({
        key: 'access_denied_admin',
        message: 'Akses Ditolak',
        description: 'Halaman ini khusus untuk Administrator. Akun Member tidak memiliki izin akses.',
        placement: 'topRight',
        duration: 4,
      })
    }
    return <Navigate to="/" replace />
  }

  // 3. Terotentikasi sebagai Admin -> tampilkan konten
  return children ? children : <Outlet />
}
