import { Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute'
import LandingPage from './pages/LandingPage'
import Opac from './pages/Opac'
import DetailBuku from './pages/DetailBuku'
import LoginUser from './pages/LoginUser'
import RegisterUser from './pages/RegisterUser'
import FormDataDiri from './pages/FormDataDiri'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/landing" element={<LandingPage />} />

      {/* OPAC / Katalog Route */}
      <Route path="/opac" element={<Opac />} />
      <Route path="/katalog" element={<Opac />} />

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

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
