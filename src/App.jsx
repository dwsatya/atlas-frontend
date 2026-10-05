import { Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute'
import LoginUser from './pages/LoginUser'
import RegisterUser from './pages/RegisterUser'
import FormDataDiri from './pages/FormDataDiri'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <Routes>
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

      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
