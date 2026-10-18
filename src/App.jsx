import { Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute'
import LandingPage from './pages/LandingPage'
import Opac from './pages/Opac'
import DetailBuku from './pages/DetailBuku'
import LoginUser from './pages/LoginUser'
import RegisterUser from './pages/RegisterUser'
import FormDataDiri from './pages/FormDataDiri'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import AdminEntriKatalog from './pages/AdminEntriKatalog'
import AdminDaftarKoleksi from './pages/AdminDaftarKoleksi'
import LoginAdmin from './pages/LoginAdmin'
import Panduan from './pages/Panduan'

export default function App() {
  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/landing" element={<LandingPage />} />

      {/* Admin Login Routes */}
      <Route path="/admin/login" element={<LoginAdmin />} />
      <Route path="/admin-login" element={<LoginAdmin />} />
      <Route path="/login-admin" element={<LoginAdmin />} />

      {/* Admin Entri Katalog Routes */}
      <Route path="/admin/entri-katalog" element={<AdminEntriKatalog />} />
      <Route path="/admin/katalog" element={<AdminEntriKatalog />} />
      <Route path="/entri-katalog" element={<AdminEntriKatalog />} />

      {/* Admin Daftar Koleksi & Eksemplar Routes */}
      <Route path="/admin/koleksi" element={<AdminDaftarKoleksi />} />
      <Route path="/admin/daftar-koleksi" element={<AdminDaftarKoleksi />} />
      <Route path="/admin/koleksi-eksemplar" element={<AdminDaftarKoleksi />} />
      <Route path="/admin/daftar-katalog" element={<AdminDaftarKoleksi />} />
      <Route path="/daftar-koleksi" element={<AdminDaftarKoleksi />} />

      {/* OPAC / Katalog Route */}
      <Route path="/opac" element={<Opac />} />
      <Route path="/katalog" element={<Opac />} />

      {/* Panduan Layanan Route */}
      <Route path="/panduan" element={<Panduan />} />
      <Route path="/bantuan" element={<Panduan />} />

      {/* Detail Buku Route */}
      <Route path="/books/:id" element={<DetailBuku />} />
      <Route path="/buku/:id" element={<DetailBuku />} />
      <Route path="/opac/detail/:id" element={<DetailBuku />} />
      <Route path="/detail-buku/:id" element={<DetailBuku />} />

      {/* Public Login Routes */}
      <Route path="/login" element={<LoginUser />} />
      <Route path="/login-user" element={<LoginUser />} />

      {/* Public Register Routes */}
      <Route path="/register" element={<RegisterUser />} />
      <Route path="/register-user" element={<RegisterUser />} />

      {/* Form Data Diri Route */}
      <Route path="/form-data-diri" element={<FormDataDiri />} />
      <Route path="/data-diri" element={<FormDataDiri />} />

      {/* Protected Routes using PrivateRoute */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route
        path="/profil"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
