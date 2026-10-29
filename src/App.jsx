import { Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'
import LandingPage from './pages/LandingPage'
import Opac from './pages/Opac'
import DetailBuku from './pages/DetailBuku'
import LoginUser from './pages/LoginUser'
import RegisterUser from './pages/RegisterUser'
import FormDataDiri from './pages/FormDataDiri'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import AdminProfile from './pages/AdminProfile'
import AdminEntriKatalog from './pages/AdminEntriKatalog'
import AdminDaftarKoleksi from './pages/AdminDaftarKoleksi'
import AdminKarantinaKoleksi from './pages/AdminKarantinaKoleksi'
import AdminEntriAnggota from './pages/AdminEntriAnggota'
import AdminKeranjangBermasalah from './pages/AdminKeranjangBermasalah'
import AdminPeminjaman from './pages/AdminPeminjaman'
import AdminPengembalian from './pages/AdminPengembalian'
import AdminDaftarPeminjaman from './pages/AdminDaftarPeminjaman'
import AdminPeminjamanLoker from './pages/AdminPeminjamanLoker'
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
      <Route
        path="/admin/entri-katalog"
        element={
          <AdminRoute>
            <AdminEntriKatalog />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/katalog"
        element={
          <AdminRoute>
            <AdminEntriKatalog />
          </AdminRoute>
        }
      />
      <Route
        path="/entri-katalog"
        element={
          <AdminRoute>
            <AdminEntriKatalog />
          </AdminRoute>
        }
      />

      {/* Admin Daftar Koleksi & Eksemplar Routes */}
      <Route
        path="/admin/koleksi"
        element={
          <AdminRoute>
            <AdminDaftarKoleksi />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/daftar-koleksi"
        element={
          <AdminRoute>
            <AdminDaftarKoleksi />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/koleksi-eksemplar"
        element={
          <AdminRoute>
            <AdminDaftarKoleksi />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/daftar-katalog"
        element={
          <AdminRoute>
            <AdminDaftarKoleksi />
          </AdminRoute>
        }
      />
      <Route
        path="/daftar-koleksi"
        element={
          <AdminRoute>
            <AdminDaftarKoleksi />
          </AdminRoute>
        }
      />

      {/* Admin Karantina Koleksi / Katalog Routes */}
      <Route
        path="/admin/karantina"
        element={
          <AdminRoute>
            <AdminKarantinaKoleksi />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/karantina-koleksi"
        element={
          <AdminRoute>
            <AdminKarantinaKoleksi />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/karantina-katalog"
        element={
          <AdminRoute>
            <AdminKarantinaKoleksi />
          </AdminRoute>
        }
      />
      <Route
        path="/karantina-koleksi"
        element={
          <AdminRoute>
            <AdminKarantinaKoleksi />
          </AdminRoute>
        }
      />

      {/* Admin Entri & Kelola Anggota Routes */}
      <Route
        path="/admin/entri-anggota"
        element={
          <AdminRoute>
            <AdminEntriAnggota />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/anggota"
        element={
          <AdminRoute>
            <AdminEntriAnggota />
          </AdminRoute>
        }
      />
      <Route
        path="/entri-anggota"
        element={
          <AdminRoute>
            <AdminEntriAnggota />
          </AdminRoute>
        }
      />

      {/* Admin Sirkulasi Peminjaman Buku Routes */}
      <Route
        path="/admin/sirkulasi/peminjaman"
        element={
          <AdminRoute>
            <AdminPeminjaman />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/peminjaman"
        element={
          <AdminRoute>
            <AdminPeminjaman />
          </AdminRoute>
        }
      />

      {/* Admin Sirkulasi Pengembalian Buku Routes */}
      <Route
        path="/admin/sirkulasi/pengembalian"
        element={
          <AdminRoute>
            <AdminPengembalian />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/pengembalian"
        element={
          <AdminRoute>
            <AdminPengembalian />
          </AdminRoute>
        }
      />

      {/* Admin Sirkulasi Daftar Pinjaman Koleksi Routes */}
      <Route
        path="/admin/sirkulasi/daftar"
        element={
          <AdminRoute>
            <AdminDaftarPeminjaman />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/daftar-peminjaman"
        element={
          <AdminRoute>
            <AdminDaftarPeminjaman />
          </AdminRoute>
        }
      />

      {/* Admin Ruang Baca Peminjaman Loker Routes */}
      <Route
        path="/admin/loker"
        element={
          <AdminRoute>
            <AdminPeminjamanLoker />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/peminjaman-loker"
        element={
          <AdminRoute>
            <AdminPeminjamanLoker />
          </AdminRoute>
        }
      />

      {/* Admin Keranjang Anggota Bermasalah Routes */}
      <Route
        path="/admin/keranjang-bermasalah"
        element={
          <AdminRoute>
            <AdminKeranjangBermasalah />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/keranjang-anggota-bermasalah"
        element={
          <AdminRoute>
            <AdminKeranjangBermasalah />
          </AdminRoute>
        }
      />
      <Route
        path="/keranjang-bermasalah"
        element={
          <AdminRoute>
            <AdminKeranjangBermasalah />
          </AdminRoute>
        }
      />

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

      {/* Admin Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        }
      />

      {/* Admin Profile Routes */}
      <Route
        path="/admin/profile"
        element={
          <AdminRoute>
            <AdminProfile />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/profil"
        element={
          <AdminRoute>
            <AdminProfile />
          </AdminRoute>
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
