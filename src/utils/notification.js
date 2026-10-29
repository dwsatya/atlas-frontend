import { notification } from 'antd'

// Konfigurasi default notifikasi Ant Design
notification.config({
  placement: 'topRight',
  top: 24,
  duration: 3.5,
})

/**
 * Notifikasi berhasil login (User atau Admin)
 * Menggunakan key 'auth_notification' untuk deduplikasi agar tidak muncul ganda (misal akibat StrictMode / double trigger)
 * @param {string} userName - Nama pengguna/admin
 * @param {boolean} isAdmin - True jika admin
 */
export const notifyLoginSuccess = (userName = '', isAdmin = false) => {
  const cleanName = (userName || '').trim()
  const displayName = cleanName ? cleanName.split(' ')[0] : (isAdmin ? 'Admin' : 'Pengguna')

  notification.success({
    key: 'auth_notification', // Kunci unik AntD: otomatis menggantikan/mencegah notifikasi ganda
    message: isAdmin ? 'Berhasil Login Admin' : 'Berhasil Login',
    description: isAdmin
      ? `Selamat datang di Dashboard Admin ATLAS, ${cleanName || 'Administrator'}!`
      : `Selamat datang kembali di ATLAS, ${displayName}!`,
    placement: 'topRight',
    duration: 3.5,
  })
}

/**
 * Notifikasi berhasil logout (User atau Admin)
 * @param {boolean} isAdmin - True jika admin
 */
export const notifyLogoutSuccess = (isAdmin = false) => {
  notification.success({
    key: 'auth_notification', // Kunci unik AntD: otomatis menggantikan/mencegah notifikasi ganda
    message: isAdmin ? 'Berhasil Logout Admin' : 'Berhasil Logout',
    description: isAdmin
      ? 'Anda telah berhasil keluar dari sistem administrasi ATLAS.'
      : 'Anda telah berhasil keluar dari akun ATLAS.',
    placement: 'topRight',
    duration: 3.5,
  })
}

export { notification }
export default notification

/**
 * Notifikasi wajib login sebelum mengakses fitur khusus anggota (mis. Reservasi Buku)
 * @param {string} description - Pesan yang ditampilkan
 */
export const notifyLoginRequired = (description = 'Wajib Login terlebih dahulu untuk melakukan Reservasi Buku') => {
  notification.warning({
    key: 'login_required_notification',
    message: 'Login Diperlukan',
    description,
    placement: 'topRight',
    duration: 4,
  })
}
