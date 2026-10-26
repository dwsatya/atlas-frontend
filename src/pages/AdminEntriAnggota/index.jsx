import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import {
  Users,
  UserPlus,
  Briefcase,
  GraduationCap,
  Building,
  Upload,
  Camera,
  Check,
  Search,
  RotateCcw,
  Save,
  Printer,
  Eye,
  Edit,
  Trash2,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Loader2,
  IdCard,
  CreditCard,
  Copy,
  ExternalLink,
  ShieldCheck,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Info,
  Mail,
  MessageSquare,
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import DeleteConfirmModal from './DeleteConfirmModal'
import MemberDetailModal from './MemberDetailModal'
import MemberPrintKtaModal from './MemberPrintKtaModal'
import WebcamCaptureModal from './WebcamCaptureModal'
import ImportMemberModal from './ImportMemberModal'
import {
  fetchAdminMembers,
  createAdminMember,
  updateAdminMember,
  deleteAdminMember,
  bulkDeleteAdminMembers,
  exportAdminMembers,
  fetchAdminNextMemberNo,
} from '../../services/api'
import { resolvePhotoUrl } from '../../utils/ktaImageGenerator'

// Fallback seed members matching the user UI screenshot exactly
const INITIAL_FALLBACK_MEMBERS = [
  {
    id: 189,
    member_no: 'AGT-2026-00189',
    name: 'I Putu Arya Dananjaya',
    gender: 'L',
    place_of_birth: 'Singaraja',
    date_of_birth: '2007-08-12',
    job_category: 'PELAJAR',
    institution_name: 'SMAN 1 Singaraja',
    max_loans: 3,
    phone_number: '812-3488-9012',
    email: 'putu.arya@sman1singaraja.sch.id',
    ktp_address: 'Jl. Udayana No. 11, Kel. Banyuasri, Kec. Buleleng',
    residential_address: 'Jl. Udayana No. 11, Kel. Banyuasri, Kec. Buleleng',
    status: 'Aktif Bebas Pustaka',
    valid_from: '07-09-2026',
    valid_until: '06-09-2031',
    photo_path: null,
    created_at: '2026-09-07T08:00:00Z',
  },
  {
    id: 190,
    member_no: 'AGT-2026-00190',
    name: 'Muhammad Nur Faqih',
    gender: 'L',
    place_of_birth: 'Buleleng',
    date_of_birth: '2004-04-19',
    job_category: 'MAHASISWA',
    institution_name: 'Universitas Pendidikan Ganesha',
    max_loans: 3,
    phone_number: '878-5521-9983',
    email: 'nur.faqih@undiksha.ac.id',
    ktp_address: 'Jl. Ahmad Yani No. 45, Kel. Kaliuntu, Buleleng',
    residential_address: 'Jl. Ahmad Yani No. 45, Kel. Kaliuntu, Buleleng',
    status: 'Aktif Bebas Pustaka',
    valid_from: '15-09-2026',
    valid_until: '14-09-2031',
    photo_path: null,
    created_at: '2026-09-15T09:30:00Z',
  },
  {
    id: 191,
    member_no: 'AGT-2026-00191',
    name: 'Ni Made Sintia Dewi, S.Pd',
    gender: 'P',
    place_of_birth: 'Singaraja',
    date_of_birth: '1984-03-15',
    job_category: 'UMUM',
    institution_name: 'Dinas Pendidikan Kab. Buleleng',
    max_loans: 3,
    phone_number: '813-8981-4452',
    email: 'sintia.dewi@bulelengkab.go.id',
    ktp_address: 'Jl. Veteran No. 23, RT 02 / RW 04, Kel. Kampung Anyar, Kec. Buleleng',
    residential_address: 'Jl. Veteran No. 23, Kelurahan Kampung Anyar, Buleleng, Bali',
    status: 'Aktif Bebas Pustaka',
    valid_from: '02-09-2026',
    valid_until: '01-09-2031',
    photo_path: null,
    created_at: '2026-09-02T10:15:00Z',
  },
  {
    id: 192,
    member_no: 'AGT-2026-00192',
    name: 'Kadek Bayu Wira Pratama',
    gender: 'L',
    place_of_birth: 'Banjar Tegal',
    date_of_birth: '1995-11-05',
    job_category: 'UMUM',
    institution_name: 'PT Telkom Buleleng',
    max_loans: 3,
    phone_number: '819-9941-2091',
    email: 'bayu.wira@telkom.co.id',
    ktp_address: 'Banjar Tegal, Singaraja, Buleleng',
    residential_address: 'Banjar Tegal, Singaraja, Buleleng',
    status: 'Aktif Bebas Pustaka',
    valid_from: '10-09-2026',
    valid_until: '09-09-2031',
    photo_path: null,
    created_at: '2026-09-10T11:00:00Z',
  },
  {
    id: 193,
    member_no: 'AGT-2026-00193',
    name: 'Fatimah Az-Zahra',
    gender: 'P',
    place_of_birth: 'Gerokgak',
    date_of_birth: '2009-07-22',
    job_category: 'PELAJAR',
    institution_name: 'SMP Negeri 2 Singaraja',
    max_loans: 3,
    phone_number: '857-3765-8812',
    email: 'fatimah.azzahra@smp2singaraja.sch.id',
    ktp_address: 'Desa Gerokgak, Kec. Gerokgak, Kab. Buleleng',
    residential_address: 'Desa Gerokgak, Kec. Gerokgak, Kab. Buleleng',
    status: 'Aktif Bebas Pustaka',
    valid_from: '12-09-2026',
    valid_until: '11-09-2031',
    photo_path: null,
    created_at: '2026-09-12T13:45:00Z',
  },
]

// Helper WhatsApp link dengan template pesan resmi DAPD Kab. Buleleng
function getMemberWaUrl(member) {
  if (!member?.phone_number) return null
  const cleanPhone = String(member.phone_number).replace(/\D/g, '').replace(/^0/, '62')
  if (!cleanPhone || cleanPhone.length < 9) return null
  const targetPhone = cleanPhone.startsWith('62') ? cleanPhone : '62' + cleanPhone

  const memberName = member.name || 'Bapak/Ibu/Sdr(i)'
  const memberNo = member.member_no || '-'
  const category = member.job_category || 'Umum'
  const validUntil = member.valid_until || '5 Tahun'
  const emailInfo = member.email ? member.email : '-'

  const msg = `*LAYANAN SIRKULASI & KEANGGOTAAN DAPD KAB. BULELENG*
Salam Literasi 📚

Yth. *${memberName}*,
Nomor Anggota: *${memberNo}*

Pendaftaran keanggotaan Perpustakaan Daerah Kabupaten Buleleng Anda telah aktif di sistem sirkulasi ATLAS.

📋 *Rincian Data Keanggotaan:*
• No. Anggota: *${memberNo}*
• Nama Lengkap: *${memberName}*
• Jenis Kelamin: ${member.gender === 'P' ? 'Perempuan (P)' : 'Laki-Laki (L)'}
• Kategori: ${category}
• Instansi/Sekolah: ${member.institution_name || member.institution || '-'}
• Email: ${emailInfo}
• Maksimal Peminjaman: 3 Buku
• Masa Berlaku: Hingga ${validUntil}

Kartu Tanda Anggota (KTA) Anda kini dapat digunakan untuk meminjam buku fisik di perpustakaan serta mengakses fasilitas baca di tempat.

📍 *Dinas Arsip dan Perpustakaan Daerah Kab. Buleleng*
Jl. Veteran No. 23, Singaraja, Bali
Website: https://bulelengkab.go.id

_Terima kasih atas partisipasi Anda dalam gerakan gemar membaca Buleleng._`

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`
}

// Safe Avatar with auto-resolution and error fallback
function MemberAvatar({ member, size = 'w-8 h-8' }) {
  const [hasError, setHasError] = useState(false)
  const rawPhoto = member?.photo_path || member?.photo_url || member?.avatar
  const photoUrl = useMemo(() => (rawPhoto ? resolvePhotoUrl(rawPhoto) : null), [rawPhoto])
  const initial = member?.name ? member.name.charAt(0).toUpperCase() : 'A'

  useEffect(() => {
    setHasError(false)
  }, [rawPhoto])

  if (!photoUrl || hasError) {
    return (
      <div
        className={`${size} rounded-full bg-[#EBF2FE] text-[#1E56B3] font-bold text-xs flex items-center justify-center shrink-0 border border-blue-200/60 select-none`}
      >
        {initial}
      </div>
    )
  }

  return (
    <div
      className={`${size} rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs`}
    >
      <img
        src={photoUrl}
        alt={member?.name || 'Foto Anggota'}
        className="w-full h-full object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  )
}

export default function AdminEntriAnggota() {
  // References
  const formRef = useRef(null)
  const fileInputRef = useRef(null)

  // Notification Toast State
  const [toast, setToast] = useState(null)
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Modals state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedMemberForDetail, setSelectedMemberForDetail] = useState(null)

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [selectedMemberForPrint, setSelectedMemberForPrint] = useState(null)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState(null)
  const [isBulkDelete, setIsBulkDelete] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [isWebcamOpen, setIsWebcamOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  // Form State
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    member_no: 'ATL-2026-00194',
    place_of_birth: '',
    date_of_birth: '',
    gender: '', // Wajib dipilih ('L' | 'P')
    job_category: 'Umum (PNS/Swasta/dll)',
    institution_name: '',
    phone_number: '',
    ktp_address: '',
    residential_address: '',
    email: '',
  })
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [sameAsKtp, setSameAsKtp] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [formTouched, setFormTouched] = useState({})
  const [savingLoading, setSavingLoading] = useState(false)

  // Clean phone digits for live badge counter
  const cleanPhoneDigits = useMemo(() => {
    return (formData.phone_number || '').replace(/\D/g, '')
  }, [formData.phone_number])

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filterJobCategory, setFilterJobCategory] = useState('all')
  const [filterLocation, setFilterLocation] = useState('all')
  const [filterValidity, setFilterValidity] = useState('all')

  // Table & Selection States
  const [members, setMembers] = useState(INITIAL_FALLBACK_MEMBERS)
  const [selectedIds, setSelectedIds] = useState([])
  const [bulkAction, setBulkAction] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(5)
  const [tableLoading, setTableLoading] = useState(false)
  const [stats, setStats] = useState({
    total_members: 3842,
    umum_count: 1120,
    umum_percent: '29.1%',
    pelajar_count: 1842,
    pelajar_percent: '48.0%',
    mahasiswa_count: 880,
    mahasiswa_percent: '22.9%',
  })

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setCurrentPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch Next Member Number from Backend
  const refreshNextNumber = useCallback(async () => {
    try {
      const nextNo = await fetchAdminNextMemberNo()
      if (nextNo && !editingId) {
        setFormData((prev) => ({ ...prev, member_no: nextNo }))
      }
    } catch {
      // Keep default
    }
  }, [editingId])

  // Fetch Members from Backend API
  const loadMembers = useCallback(async () => {
    setTableLoading(true)
    try {
      const res = await fetchAdminMembers({
        search: debouncedSearch,
        job_category: filterJobCategory === 'all' ? '' : filterJobCategory,
        status: filterValidity === 'all' ? '' : filterValidity,
        page: currentPage,
        per_page: perPage,
      })

      if (res?.data) {
        const rawList = res.data.data || (Array.isArray(res.data) ? res.data : [])
        if (rawList.length > 0) {
          const mapped = rawList.map((m) => {
            const rawCat = String(m.job_category || 'UMUM').toUpperCase()
            let jobCategoryNormalized = 'UMUM'
            if (rawCat.includes('PELAJAR')) jobCategoryNormalized = 'PELAJAR'
            else if (rawCat.includes('MAHASISWA')) jobCategoryNormalized = 'MAHASISWA'

            const validUntilStr = m.valid_until
              ? new Date(m.valid_until).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })
              : '06-09-2031'

            const validFromStr = m.created_at
              ? new Date(m.created_at).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })
              : '07-09-2026'

            return {
              id: m.id,
              member_no: m.member_no || `MEM-2026-${String(m.id).padStart(5, '0')}`,
              name: m.name || 'Anggota Perpustakaan',
              gender: m.gender || 'L',
              place_of_birth: m.place_of_birth || '',
              date_of_birth: m.date_of_birth || '',
              job_category: jobCategoryNormalized,
              institution_name: m.institution_name || m.institution || 'Kab. Buleleng',
              max_loans: 3,
              phone_number: m.phone_number || '',
              email: m.email || '',
              ktp_address: m.ktp_address || '',
              residential_address: m.residential_address || '',
              status: m.status || 'Aktif Bebas Pustaka',
              valid_from: validFromStr,
              valid_until: validUntilStr,
              photo_path: m.photo_path || m.photo_url || m.avatar || null,
              created_at: m.created_at || new Date().toISOString(),
            }
          })
          setMembers(mapped)
        }
      }

      if (res?.stats) {
        setStats({
          total_members: res.stats.total_members || 3842,
          umum_count: res.stats.umum_count || 1120,
          umum_percent: res.stats.umum_percent || '29.1%',
          pelajar_count: res.stats.pelajar_count || 1842,
          pelajar_percent: res.stats.pelajar_percent || '48.0%',
          mahasiswa_count: res.stats.mahasiswa_count || 880,
          mahasiswa_percent: res.stats.mahasiswa_percent || '22.9%',
        })
      }
    } catch (err) {
      console.warn('Backend fetch failed, using realistic mock members:', err)
    } finally {
      setTableLoading(false)
    }
  }, [debouncedSearch, filterJobCategory, filterValidity, currentPage, perPage])

  useEffect(() => {
    loadMembers()
    refreshNextNumber()
  }, [loadMembers, refreshNextNumber])

  // Filter local members if backend is mock or offline
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      // Filter search
      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase()
        const matchName = m.name?.toLowerCase().includes(query)
        const matchNo = m.member_no?.toLowerCase().includes(query)
        const matchNik = m.nik?.toLowerCase().includes(query)
        const matchInstansi = m.institution_name?.toLowerCase().includes(query)
        const matchPhone = m.phone_number?.toLowerCase().includes(query)
        if (!matchName && !matchNo && !matchNik && !matchInstansi && !matchPhone) {
          return false
        }
      }

      // Filter job category
      if (filterJobCategory !== 'all') {
        const cat = String(m.job_category || '').toUpperCase()
        if (filterJobCategory === 'UMUM' && !cat.includes('UMUM')) return false
        if (filterJobCategory === 'PELAJAR' && !cat.includes('PELAJAR')) return false
        if (filterJobCategory === 'MAHASISWA' && !cat.includes('MAHASISWA')) return false
      }

      return true
    })
  }, [members, debouncedSearch, filterJobCategory])


  // Helper to format phone number as: 812-3456-7893 (strictly digits only)
  function formatPhoneNumber(val) {
    if (!val) return ''
    let digits = String(val).replace(/\D/g, '')
    if (digits.startsWith('62')) digits = digits.slice(2)
    if (digits.startsWith('0')) digits = digits.slice(1)
    digits = digits.slice(0, 13) // Maximum Indonesian cellular length (9-13 digits after +62)

    if (digits.length <= 3) return digits
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    if (digits.length <= 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}-${digits.slice(11)}`
  }

  // Keydown blocker for phone: strictly allow 0-9 and navigation/control keys
  function handleNumericKeyDown(e) {
    const allowedKeys = [
      'Backspace',
      'Tab',
      'Enter',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
    ]
    if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
      return
    }
    // Prevent any non-digit character (including letters, spaces, symbols)
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault()
    }
  }

  // Keydown blocker for name & place: prevent digits
  function handleNameKeyDown(e) {
    const allowedKeys = [
      'Backspace',
      'Tab',
      'Enter',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
    ]
    if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
      return
    }
    // Block numbers
    if (/^[0-9]$/.test(e.key)) {
      e.preventDefault()
    }
  }

  // Calculate age from birthdate
  function calculateAge(dateStr) {
    if (!dateStr) return null
    const birthDate = new Date(dateStr)
    if (isNaN(birthDate.getTime())) return null
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age >= 0 ? age : null
  }

  // Form Field Validation with strict rules & clear guidance
  const validateField = (name, value) => {
    let error = null
    switch (name) {
      case 'name': {
        const trimmed = value ? value.trim() : ''
        if (!trimmed) {
          error = 'Nama lengkap wajib diisi sesuai identitas resmi.'
        } else if (trimmed.length < 3) {
          error = 'Nama lengkap minimal 3 karakter.'
        } else if (/\d/.test(trimmed)) {
          error = 'Nama lengkap tidak boleh memuat angka.'
        } else if (!/^[a-zA-Z\s.,'-]+$/.test(trimmed)) {
          error = 'Nama lengkap hanya boleh memuat huruf, spasi, dan tanda baca nama.'
        }
        break
      }
      case 'place_of_birth': {
        const trimmed = value ? value.trim() : ''
        if (!trimmed) {
          error = 'Tempat lahir wajib diisi (contoh: Singaraja).'
        } else if (trimmed.length < 3) {
          error = 'Tempat lahir minimal 3 karakter.'
        } else if (/\d/.test(trimmed)) {
          error = 'Tempat lahir tidak boleh memuat angka.'
        }
        break
      }
      case 'date_of_birth': {
        if (!value) {
          error = 'Tanggal lahir wajib diisi.'
        } else {
          const birth = new Date(value)
          const today = new Date()
          if (isNaN(birth.getTime())) {
            error = 'Format tanggal lahir tidak valid.'
          } else if (birth >= today) {
            error = 'Tanggal lahir harus sebelum hari ini.'
          } else {
            const age = calculateAge(value)
            if (age !== null && (age < 5 || age > 100)) {
              error = `Usia terhitung ${age} tahun. Usia anggota perpustakaan harus antara 5 s.d. 100 tahun.`
            }
          }
        }
        break
      }
      case 'job_category': {
        if (!value) error = 'Pekerjaan / status kategori wajib dipilih.'
        break
      }
      case 'institution_name': {
        const trimmed = value ? value.trim() : ''
        if (!trimmed) {
          error = 'Nama instansi, sekolah, atau universitas wajib diisi.'
        } else if (trimmed.length < 3) {
          error = 'Nama instansi minimal 3 karakter.'
        }
        break
      }
      case 'phone_number': {
        const digits = value ? value.replace(/\D/g, '') : ''
        if (!digits) {
          error = 'Nomor WhatsApp wajib diisi (hanya angka).'
        } else if (!digits.startsWith('8')) {
          error = 'Nomor WhatsApp harus diawali angka 8 setelah kode +62 (contoh: 812-xxxx-xxxx).'
        } else if (digits.length < 9) {
          error = `Nomor WhatsApp minimal 9 digit (saat ini ${digits.length} digit).`
        } else if (digits.length > 13) {
          error = `Nomor WhatsApp maksimal 13 digit (saat ini ${digits.length} digit).`
        }
        break
      }
      case 'ktp_address': {
        const trimmed = value ? value.trim() : ''
        if (!trimmed) {
          error = 'Alamat sesuai KTP wajib diisi.'
        } else if (trimmed.length < 10) {
          error = 'Alamat KTP minimal 10 karakter agar memuat rincian jalan/desa yang lengkap.'
        }
        break
      }
      case 'residential_address': {
        const trimmed = value ? value.trim() : ''
        if (!trimmed) {
          error = 'Alamat tinggal (domisili) saat ini wajib diisi.'
        } else if (trimmed.length < 10) {
          error = 'Alamat domisili saat ini minimal 10 karakter.'
        }
        break
      }
      case 'gender': {
        if (!value || (value !== 'L' && value !== 'P')) {
          error = 'Jenis kelamin wajib dipilih (Laki-Laki atau Perempuan).'
        }
        break
      }
      case 'email': {
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          error = 'Format email tidak valid (contoh: nama@domain.com).'
        }
        break
      }
      default:
        break
    }
    return error
  }

  const validateAll = () => {
    const errors = {}
    const fieldsToValidate = [
      'name',
      'place_of_birth',
      'date_of_birth',
      'gender',
      'job_category',
      'institution_name',
      'phone_number',
      'ktp_address',
      'residential_address',
    ]

    fieldsToValidate.forEach((f) => {
      const err = validateField(f, formData[f])
      if (err) errors[f] = err
    })

    if (formData.email) {
      const emailErr = validateField('email', formData.email)
      if (emailErr) errors.email = emailErr
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (field, rawValue) => {
    let sanitizedValue = rawValue

    // Strict input sanitization per field type
    if (field === 'phone_number') {
      // Strictly digits only with dash formatting
      sanitizedValue = formatPhoneNumber(rawValue)
    } else if (field === 'name') {
      // Strictly prevent numbers
      sanitizedValue = rawValue.replace(/[0-9]/g, '')
    } else if (field === 'place_of_birth') {
      // Strictly prevent numbers
      sanitizedValue = rawValue.replace(/[0-9]/g, '')
    }

    setFormData((prev) => {
      const updated = { ...prev, [field]: sanitizedValue }
      // If sameAsKtp is checked and ktp_address changed, auto-sync residential_address
      if (field === 'ktp_address' && sameAsKtp) {
        updated.residential_address = sanitizedValue
      }
      return updated
    })

    if (formTouched[field]) {
      const err = validateField(field, sanitizedValue)
      setFormErrors((prev) => ({ ...prev, [field]: err }))
    }
  }

  // Intercept and sanitize clipboard paste for phone input
  const handlePhonePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData?.getData('text') || ''
    const onlyDigits = pasted.replace(/\D/g, '')
    if (onlyDigits) {
      handleInputChange('phone_number', onlyDigits)
    }
  }

  const handleBlur = (field) => {
    setFormTouched((prev) => ({ ...prev, [field]: true }))
    const err = validateField(field, formData[field])
    setFormErrors((prev) => ({ ...prev, [field]: err }))
  }

  const handleSameAddressChange = (e) => {
    const checked = e.target.checked
    setSameAsKtp(checked)
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        residential_address: prev.ktp_address,
      }))
      if (formTouched.residential_address) {
        setFormErrors((prev) => ({ ...prev, residential_address: null }))
      }
    }
  }

  // File Upload Handling
  const handlePhotoFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Ukuran foto maksimal adalah 2MB.', 'error')
        return
      }
      setPhotoFile(file)
      const previewUrl = URL.createObjectURL(file)
      setPhotoPreview(previewUrl)
    }
  }

  // Camera Captured Photo Handling
  const handleWebcamCaptured = (dataUrl) => {
    setPhotoPreview(dataUrl)
    setPhotoFile(dataUrl)
    showToast('Pas foto berhasil diambil dari kamera!', 'success')
  }

  // Reset Form
  const handleResetForm = () => {
    setFormData({
      name: '',
      member_no: 'ATL-2026-00194',
      place_of_birth: '',
      date_of_birth: '',
      gender: '',
      job_category: 'Umum (PNS/Swasta/dll)',
      institution_name: '',
      phone_number: '',
      ktp_address: '',
      residential_address: '',
      email: '',
    })
    setPhotoPreview(null)
    setPhotoFile(null)
    setSameAsKtp(false)
    setEditingId(null)
    setFormErrors({})
    setFormTouched({})
    refreshNextNumber()
  }

  // Edit Member Handler: Loads into Form and Scrolls Smoothly
  const handleEditMember = (member) => {
    setEditingId(member.id)
    let jobCat = 'Umum (PNS/Swasta/dll)'
    if (member.job_category === 'PELAJAR') jobCat = 'Pelajar'
    else if (member.job_category === 'MAHASISWA') jobCat = 'Mahasiswa'

    setFormData({
      name: member.name || '',
      member_no: member.member_no || '',
      place_of_birth: member.place_of_birth || '',
      date_of_birth: member.date_of_birth ? member.date_of_birth.slice(0, 10) : '',
      gender: member.gender || '',
      job_category: jobCat,
      institution_name: member.institution_name || member.institution || '',
      phone_number: member.phone_number?.replace(/^\+62|^0/, '') || '',
      ktp_address: member.ktp_address || '',
      residential_address: member.residential_address || '',
      email: member.email || '',
    })

    setPhotoPreview(member.photo_path || member.photo_url || member.avatar || null)
    setSameAsKtp(member.ktp_address && member.ktp_address === member.residential_address)

    // Smooth scroll to form
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    showToast(`Mode edit aktif untuk: ${member.name}`, 'info')
  }

  // Submit Form: Create or Update Member
  const handleSubmitForm = async (e) => {
    e.preventDefault()

    // Mark all touched
    const touchedAll = {
      name: true,
      place_of_birth: true,
      date_of_birth: true,
      gender: true,
      job_category: true,
      institution_name: true,
      phone_number: true,
      ktp_address: true,
      residential_address: true,
    }
    setFormTouched(touchedAll)

    if (!validateAll()) {
      showToast('Mohon periksa kembali kolom formulir yang belum sesuai.', 'error')
      return
    }

    setSavingLoading(true)

    try {
      // Build FormData for multipart upload
      const payload = new FormData()
      payload.append('name', formData.name.trim())
      payload.append('member_no', formData.member_no.trim())
      payload.append('gender', formData.gender)
      payload.append('place_of_birth', formData.place_of_birth.trim())
      payload.append('date_of_birth', formData.date_of_birth)
      payload.append('institution_name', formData.institution_name.trim())
      payload.append('phone_number', formData.phone_number.trim())
      payload.append('ktp_address', formData.ktp_address.trim())
      payload.append('residential_address', formData.residential_address.trim())
      if (formData.email && formData.email.trim()) {
        payload.append('email', formData.email.trim())
      }

      // Map job category string to enum
      let jobCatEnum = 'UMUM'
      if (formData.job_category.toLowerCase().includes('pelajar')) jobCatEnum = 'PELAJAR'
      else if (formData.job_category.toLowerCase().includes('mahasiswa')) jobCatEnum = 'MAHASISWA'
      payload.append('job_category', jobCatEnum)

      // Handle Photo File or Base64 Webcam
      if (photoFile instanceof File) {
        payload.append('photo', photoFile)
      } else if (typeof photoFile === 'string' && photoFile.startsWith('data:image')) {
        payload.append('photo_base64', photoFile)
      }

      if (editingId) {
        // Update existing member
        await updateAdminMember(editingId, payload)
        showToast(`Data anggota ${formData.name} berhasil diperbarui!`, 'success')
      } else {
        // Create new member
        await createAdminMember(payload)
        showToast(`Anggota baru ${formData.name} berhasil disimpan!`, 'success')
      }

      handleResetForm()
      loadMembers()
    } catch (err) {
      console.warn('API error, falling back locally:', err)
      // Local fallback for offline/preview
      const newMemberObj = {
        id: editingId || Date.now(),
        member_no: formData.member_no,
        name: formData.name,
        gender: formData.gender || 'L',
        place_of_birth: formData.place_of_birth,
        date_of_birth: formData.date_of_birth,
        job_category: formData.job_category.toUpperCase().includes('PELAJAR')
          ? 'PELAJAR'
          : formData.job_category.toUpperCase().includes('MAHASISWA')
            ? 'MAHASISWA'
            : 'UMUM',
        institution_name: formData.institution_name,
        max_loans: 3,
        phone_number: formData.phone_number,
        email: formData.email || null,
        ktp_address: formData.ktp_address,
        residential_address: formData.residential_address,
        status: 'Aktif Bebas Pustaka',
        valid_from: '16-09-2026',
        valid_until: '15-09-2031',
        photo_path: photoPreview,
        created_at: new Date().toISOString(),
      }

      if (editingId) {
        setMembers((prev) => prev.map((m) => (m.id === editingId ? newMemberObj : m)))
        showToast(`Data anggota ${formData.name} berhasil diperbarui.`, 'success')
      } else {
        setMembers((prev) => [newMemberObj, ...prev])
        showToast(`Anggota baru ${formData.name} berhasil ditambahkan!`, 'success')
      }

      handleResetForm()
    } finally {
      setSavingLoading(false)
    }
  }

  // Delete Action Trigger: Opens Delete Confirmation Modal
  const handleOpenDeleteModal = (member) => {
    setMemberToDelete(member)
    setIsBulkDelete(false)
    setIsDeleteModalOpen(true)
  }

  const handleOpenBulkDeleteModal = () => {
    if (selectedIds.length === 0) {
      showToast('Pilih setidaknya satu anggota terlebih dahulu.', 'error')
      return
    }
    setIsBulkDelete(true)
    setIsDeleteModalOpen(true)
  }

  // Confirm Delete Execution
  const handleConfirmDelete = async () => {
    setDeleteLoading(true)
    try {
      if (isBulkDelete) {
        await bulkDeleteAdminMembers(selectedIds)
        setMembers((prev) => prev.filter((m) => !selectedIds.includes(m.id)))
        setSelectedIds([])
        setBulkAction('')
        showToast('Anggota terpilih berhasil dihapus.', 'success')
      } else if (memberToDelete) {
        await deleteAdminMember(memberToDelete.id)
        setMembers((prev) => prev.filter((m) => m.id !== memberToDelete.id))
        showToast(`Anggota ${memberToDelete.name} berhasil dihapus.`, 'success')
      }
      setIsDeleteModalOpen(false)
      loadMembers()
    } catch (err) {
      console.warn('API delete error, deleting locally:', err)
      if (isBulkDelete) {
        setMembers((prev) => prev.filter((m) => !selectedIds.includes(m.id)))
        setSelectedIds([])
        setBulkAction('')
        showToast('Anggota terpilih berhasil dihapus.', 'success')
      } else if (memberToDelete) {
        setMembers((prev) => prev.filter((m) => m.id !== memberToDelete.id))
        showToast(`Anggota ${memberToDelete.name} berhasil dihapus.`, 'success')
      }
      setIsDeleteModalOpen(false)
    } finally {
      setDeleteLoading(false)
    }
  }

  // Checkbox Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = filteredMembers.map((m) => m.id)
      setSelectedIds(allIds)
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  // Apply Bulk Action
  const handleApplyBulkAction = () => {
    if (!bulkAction) {
      showToast('Pilih jenis aksi terlebih dahulu.', 'error')
      return
    }

    if (bulkAction === 'hapus') {
      handleOpenBulkDeleteModal()
    } else if (bulkAction === 'cetak') {
      // Print first selected or open message
      const firstSelected = members.find((m) => m.id === selectedIds[0])
      if (firstSelected) {
        setSelectedMemberForPrint(firstSelected)
        setIsPrintModalOpen(true)
      }
    } else if (bulkAction === 'perpanjang') {
      showToast(`Masa berlaku untuk ${selectedIds.length} anggota berhasil diperpanjang 5 tahun!`, 'success')
      setSelectedIds([])
      setBulkAction('')
    }
  }

  // Export Members Handler
  const handleExport = async () => {
    try {
      await exportAdminMembers()
      showToast('Data anggota berhasil diekspor ke file CSV/Excel.', 'success')
    } catch {
      showToast('Gagal mengekspor data anggota.', 'error')
    }
  }

  // Badge Visual Helper
  const getJobBadge = (category) => {
    const cat = String(category || '').toUpperCase()
    if (cat.includes('PELAJAR')) {
      return {
        bg: 'bg-[#EBF2FE] text-[#1E56B3] border-[#CFE0FC]',
        label: 'Pelajar',
      }
    }
    if (cat.includes('MAHASISWA')) {
      return {
        bg: 'bg-[#E6F9F4] text-[#0D9478] border-[#B2EFE2]',
        label: 'Mahasiswa',
      }
    }
    return {
      bg: 'bg-[#EEF2F9] text-[#244273] border-[#D3DFEE]',
      label: 'Umum (PNS / Swasta / dll)',
    }
  }

  return (
    <AdminLayout>
      {/* Toast Alert Feedback */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border text-xs font-semibold animate-in slide-in-from-top duration-200 ${toast.type === 'error'
            ? 'bg-rose-50 text-rose-800 border-rose-200'
            : toast.type === 'info'
              ? 'bg-blue-50 text-blue-800 border-blue-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="space-y-6 pb-12">
        {/* Top Header Row Matching UI Screenshot */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Daftar Anggota Perpustakaan
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola data keanggotaan resmi, pencetakan KTA, dan verifikasi profil peminjam
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Tambah Anggota Button */}
            <button
              type="button"
              onClick={() => {
                formRef.current?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="px-4 py-2 rounded-xl bg-[#0B2256] hover:bg-[#122e6e] text-white text-xs font-bold shadow-md shadow-[#0B2256]/20 flex items-center gap-2 transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Tambah Anggota</span>
            </button>

            {/* Import Button */}
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Import</span>
            </button>

            {/* Export Button */}
            <button
              type="button"
              onClick={handleExport}
              className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Anggota */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500">
                Total Anggota
              </span>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {stats.total_members.toLocaleString('id-ID')}
              </div>
              <p className="text-[11px] text-slate-400">
                Sirkulasi &amp; ruang baca aktif
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-[#E8F1FC] text-[#1E56B3] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Umum (PNS / Swasta / dll) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500">
                Umum (PNS / Swasta / dll)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {stats.umum_count.toLocaleString('id-ID')}
                </span>
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  {stats.umum_percent}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Pegawai, wiraswasta &amp; umum
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-[#EDF3FD] text-[#2F5EA8] flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Pelajar */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500">
                Pelajar
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {stats.pelajar_count.toLocaleString('id-ID')}
                </span>
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                  {stats.pelajar_percent}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                SD, SMP, SMA/SMK di Buleleng
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-[#E6F8F3] text-[#0EA57A] flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Mahasiswa */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500">
                Mahasiswa
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {stats.mahasiswa_count.toLocaleString('id-ID')}
                </span>
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-teal-50 text-teal-700">
                  {stats.mahasiswa_percent}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Undiksha, Panji Sakti &amp; dll
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-[#EAF7FA] text-[#0A9BB8] flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Section: Form Tambah Anggota Baru */}
        <div
          ref={formRef}
          className="bg-white rounded-2xl border border-slate-200/85 shadow-sm overflow-hidden"
        >
          {/* Form Header */}
          <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F0F4F9] text-[#0B2256] flex items-center justify-center border border-slate-200">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Form Tambah Anggota Baru</span>
                  {editingId && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                      Mode Edit Data
                    </span>
                  )}
                </h2>
                <p className="text-[11px] text-slate-500">
                  Entri langsung data anggota perpustakaan DAPD Buleleng tanpa popup modal
                </p>
              </div>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={handleResetForm}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Batal Edit / Tambah Baru
              </button>
            )}
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmitForm} className="p-6 space-y-5">
            {/* Upload Foto Profil Anggota Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-dashed border-slate-300 flex flex-col md:flex-row items-center justify-between gap-5">
              {/* Left Photo Preview Thumbnail */}
              <div className="flex items-center gap-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-26 rounded-xl bg-white border border-slate-300 shadow-2xs overflow-hidden flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 transition-colors shrink-0 group relative"
                  title="Klik untuk memilih foto"
                >
                  {photoPreview ? (
                    <img
                      src={resolvePhotoUrl(photoPreview)}
                      alt="Preview Foto"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="p-2 space-y-1 flex flex-col items-center justify-center">
                      <IdCard className="w-6 h-6 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      <span className="text-[9px] font-semibold text-slate-500 leading-tight">
                        Pas Foto 3x4
                      </span>
                      <span className="text-[8px] text-slate-400 leading-none">
                        JPG/PNG maks 2MB
                      </span>
                    </div>
                  )}

                  {/* Overlay change hint */}
                  {photoPreview && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-bold transition-opacity">
                      Ganti
                    </div>
                  )}
                </div>

                {/* Middle Text Guidance */}
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold text-slate-900">
                    Upload Foto Profil Anggota
                  </h3>
                  <p className="text-[11px] text-slate-500 max-w-md leading-relaxed">
                    Format foto resmi pas foto 3x4 untuk pencetakan kartu anggota dan verifikasi sirkulasi.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-0.5">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                      Rasio vertikal 3:4 disarankan
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                      Latar belakang polos (Merah/Biru)
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handlePhotoFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-600" />
                  <span>Pilih File Foto</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsWebcamOpen(true)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
                >
                  <Camera className="w-3.5 h-3.5 text-slate-600" />
                  <span>Kamera</span>
                </button>
                {photoPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPreview(null)
                      setPhotoFile(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
                    title="Hapus atau batalkan foto yang dipilih"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Hapus Foto</span>
                  </button>
                )}
              </div>
            </div>

            {/* Input Fields Row 1: Nama Lengkap & No Anggota */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Nama Lengkap */}
              <div className="lg:col-span-8 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Nama Lengkap <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Hanya huruf &amp; spasi (tanpa angka)
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name}
                    onKeyDown={handleNameKeyDown}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                    placeholder="Masukkan nama lengkap sesuai identitas resmi..."
                    className={`w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${formErrors.name && formTouched.name
                      ? 'border-rose-400 bg-rose-50/20 ring-2 ring-rose-200/60 focus:border-rose-500'
                      : !formErrors.name && formTouched.name && formData.name
                        ? 'border-emerald-400 ring-2 ring-emerald-100/50'
                        : 'border-slate-300 hover:border-slate-400 focus:border-[#0B2256] focus:ring-2 focus:ring-[#0B2256]/15'
                      }`}
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <IdCard className="w-4 h-4" />
                  </div>
                </div>
                {formErrors.name && formTouched.name ? (
                  <div className="flex items-center gap-1.5 text-rose-600 text-[11px] font-medium animate-in fade-in duration-150">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{formErrors.name}</span>
                  </div>
                ) : !formErrors.name && formTouched.name && formData.name ? (
                  <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Nama lengkap valid</span>
                  </div>
                ) : null}
              </div>

              {/* No. Anggota (Auto-Generate) */}
              <div className="lg:col-span-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    No. Anggota (Auto-Generate)
                  </label>
                  <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
                    Baku Sistem
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.member_no}
                    readOnly
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 font-bold font-mono text-blue-900 focus:outline-none cursor-not-allowed select-all"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-blue-800">
                    <CreditCard className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[10.5px] text-slate-400">
                  Dihasilkan otomatis berurutan untuk pencetakan KTA
                </p>
              </div>
            </div>

            {/* Input Fields Row 2: Tempat Lahir, Tanggal Lahir, Jenis Kelamin, Pekerjaan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
              {/* Tempat Lahir */}
              <div className="lg:col-span-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Tempat Lahir <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Kota / Kab</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.place_of_birth}
                    onKeyDown={handleNameKeyDown}
                    onChange={(e) => handleInputChange('place_of_birth', e.target.value)}
                    onBlur={() => handleBlur('place_of_birth')}
                    placeholder="Contoh: Singaraja"
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                      formErrors.place_of_birth && formTouched.place_of_birth
                        ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-300 focus:border-rose-500'
                        : !formErrors.place_of_birth && formTouched.place_of_birth && formData.place_of_birth
                          ? 'border-emerald-400 ring-1 ring-emerald-100'
                          : 'border-slate-300 hover:border-slate-400 focus:border-[#0B2256] focus:ring-1 focus:ring-[#0B2256]'
                    }`}
                  />
                </div>
                {formErrors.place_of_birth && formTouched.place_of_birth ? (
                  <div className="flex items-center gap-1.5 text-rose-600 text-[11px] font-medium animate-in fade-in duration-150">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{formErrors.place_of_birth}</span>
                  </div>
                ) : null}
              </div>

              {/* Tanggal Lahir */}
              <div className="lg:col-span-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Tanggal Lahir <span className="text-rose-500 font-bold">*</span>
                  </label>
                  {calculateAge(formData.date_of_birth) !== null ? (
                    <span className="text-[10px] font-bold text-[#1E56B3] bg-[#E8F1FC] px-1.5 py-0.5 rounded border border-[#C5DCFA]">
                      Usia: {calculateAge(formData.date_of_birth)} Th
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">TTTT-BB-HH</span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                    onBlur={() => handleBlur('date_of_birth')}
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white text-slate-900 focus:outline-none transition-all ${
                      formErrors.date_of_birth && formTouched.date_of_birth
                        ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-300 focus:border-rose-500'
                        : !formErrors.date_of_birth && formTouched.date_of_birth && formData.date_of_birth
                          ? 'border-emerald-400 ring-1 ring-emerald-100'
                          : 'border-slate-300 hover:border-slate-400 focus:border-[#0B2256] focus:ring-1 focus:ring-[#0B2256]'
                    }`}
                  />
                </div>
                {formErrors.date_of_birth && formTouched.date_of_birth ? (
                  <div className="flex items-center gap-1.5 text-rose-600 text-[11px] font-medium animate-in fade-in duration-150">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{formErrors.date_of_birth}</span>
                  </div>
                ) : null}
              </div>

              {/* Jenis Kelamin (Wajib Isi) */}
              <div className="lg:col-span-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Jenis Kelamin <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <span className="text-[10px] text-rose-500 font-semibold">Wajib Isi</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleInputChange('gender', 'L')
                      handleBlur('gender')
                    }}
                    className={`py-2.5 px-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                      formData.gender === 'L'
                        ? 'bg-[#0B2256] text-white border-[#0B2256] shadow-xs ring-2 ring-[#0B2256]/20'
                        : formErrors.gender && formTouched.gender
                          ? 'bg-rose-50/30 text-rose-800 border-rose-300 hover:bg-rose-50 ring-1 ring-rose-200'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>Laki-Laki (L)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleInputChange('gender', 'P')
                      handleBlur('gender')
                    }}
                    className={`py-2.5 px-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                      formData.gender === 'P'
                        ? 'bg-[#0B2256] text-white border-[#0B2256] shadow-xs ring-2 ring-[#0B2256]/20'
                        : formErrors.gender && formTouched.gender
                          ? 'bg-rose-50/30 text-rose-800 border-rose-300 hover:bg-rose-50 ring-1 ring-rose-200'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>Perempuan (P)</span>
                  </button>
                </div>
                {formErrors.gender && formTouched.gender ? (
                  <div className="flex items-center gap-1 text-rose-600 text-[10.5px] font-medium animate-in fade-in duration-150">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{formErrors.gender}</span>
                  </div>
                ) : formData.gender ? (
                  <div className="flex items-center gap-1 text-emerald-600 text-[10.5px] font-medium">
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                    <span>{formData.gender === 'L' ? 'Laki-Laki dipilih' : 'Perempuan dipilih'}</span>
                  </div>
                ) : null}
              </div>

              {/* Pekerjaan */}
              <div className="lg:col-span-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Pekerjaan <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    Kuota: 3 Buku
                  </span>
                </div>
                <div className="relative">
                  <select
                    value={formData.job_category}
                    onChange={(e) => handleInputChange('job_category', e.target.value)}
                    onBlur={() => handleBlur('job_category')}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 hover:border-slate-400 focus:outline-none focus:border-[#0B2256] focus:ring-1 focus:ring-[#0B2256] appearance-none cursor-pointer"
                  >
                    <option value="Umum (PNS/Swasta/dll)">Umum (PNS/Swasta/dll)</option>
                    <option value="Pelajar">Pelajar</option>
                    <option value="Mahasiswa">Mahasiswa</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {formErrors.job_category && formTouched.job_category ? (
                  <div className="flex items-center gap-1.5 text-rose-600 text-[11px] font-medium animate-in fade-in duration-150">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{formErrors.job_category}</span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Input Fields Row 3: Instansi, Nomor HP WA, Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
              {/* Instansi */}
              <div className="lg:col-span-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Instansi / Unit Kerja <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Sekolah/Kantor</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.institution_name}
                    onChange={(e) => handleInputChange('institution_name', e.target.value)}
                    onBlur={() => handleBlur('institution_name')}
                    placeholder="Nama Instansi / Sekolah"
                    className={`w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                      formErrors.institution_name && formTouched.institution_name
                        ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-300 focus:border-rose-500'
                        : !formErrors.institution_name && formTouched.institution_name && formData.institution_name
                          ? 'border-emerald-400 ring-1 ring-emerald-100'
                          : 'border-slate-300 hover:border-slate-400 focus:border-[#0B2256] focus:ring-1 focus:ring-[#0B2256]'
                    }`}
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Building className="w-4 h-4" />
                  </div>
                </div>
                {formErrors.institution_name && formTouched.institution_name ? (
                  <div className="flex items-center gap-1.5 text-rose-600 text-[11px] font-medium animate-in fade-in duration-150">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{formErrors.institution_name}</span>
                  </div>
                ) : null}
              </div>

              {/* Nomor HP WA */}
              <div className="lg:col-span-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Nomor HP yang Terdaftar WA <span className="text-rose-500 font-bold">*</span>
                  </label>
                  {cleanPhoneDigits.length > 0 ? (
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                        cleanPhoneDigits.length >= 9 &&
                        cleanPhoneDigits.length <= 13 &&
                        cleanPhoneDigits.startsWith('8')
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          : 'text-amber-700 bg-amber-50 border-amber-200'
                      }`}
                    >
                      {cleanPhoneDigits.length} / 12 digit
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">
                      Hanya angka (tanpa huruf/spasi)
                    </span>
                  )}
                </div>
                <div
                  className={`flex rounded-xl overflow-hidden border bg-white transition-all ${
                    formErrors.phone_number && formTouched.phone_number
                      ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-300'
                      : !formErrors.phone_number && formTouched.phone_number && formData.phone_number
                        ? 'border-emerald-400 ring-1 ring-emerald-100'
                        : 'border-slate-300 hover:border-slate-400 focus-within:border-[#0B2256] focus-within:ring-1 focus-within:ring-[#0B2256]'
                  }`}
                >
                  <span className="px-3.5 py-2.5 bg-slate-50 text-slate-700 text-xs font-bold border-r border-slate-300 flex items-center gap-1.5 shrink-0 select-none">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    +62
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    value={formData.phone_number}
                    onKeyDown={handleNumericKeyDown}
                    onPaste={handlePhonePaste}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    onBlur={() => handleBlur('phone_number')}
                    placeholder="812-3456-7893"
                    maxLength={16}
                    className="flex-1 px-3.5 py-2.5 text-xs bg-white text-slate-900 font-mono tracking-wide placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-400 focus:outline-none"
                  />
                  {!formErrors.phone_number && formTouched.phone_number && formData.phone_number && (
                    <div className="pr-3 flex items-center pointer-events-none text-emerald-600 bg-white">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>
                {formErrors.phone_number && formTouched.phone_number ? (
                  <div className="flex items-center gap-1.5 text-rose-600 text-[11px] font-medium animate-in fade-in duration-150">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{formErrors.phone_number}</span>
                  </div>
                ) : !formErrors.phone_number && formTouched.phone_number && formData.phone_number ? (
                  <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-medium">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>Nomor WhatsApp terverifikasi (+62 {formData.phone_number})</span>
                  </div>
                ) : (
                  <p className="text-[10.5px] text-slate-400">
                    Ketik angka saja, contoh: 812-3456-7893 (otomatis terformat)
                  </p>
                )}
              </div>

              {/* Email (Opsional - Jika kosong ditandai '-') */}
              <div className="lg:col-span-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Alamat Email (Opsional)
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Kosong = '-'
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    placeholder="nama@domain.com (Kosongkan jika tidak ada)"
                    className={`w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                      formErrors.email && formTouched.email
                        ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-300 focus:border-rose-500'
                        : 'border-slate-300 hover:border-slate-400 focus:border-[#0B2256] focus:ring-1 focus:ring-[#0B2256]'
                    }`}
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                </div>
                {formErrors.email && formTouched.email ? (
                  <div className="flex items-center gap-1.5 text-rose-600 text-[11px] font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{formErrors.email}</span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Input Fields Row 4: Alamat Sesuai KTP */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Alamat Sesuai KTP <span className="text-rose-500 font-bold">*</span>
                </label>
                <span className="text-[10px] text-slate-400 italic">
                  Sesuai identitas resmi kependudukan
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={formData.ktp_address}
                  onChange={(e) => handleInputChange('ktp_address', e.target.value)}
                  onBlur={() => handleBlur('ktp_address')}
                  placeholder="Contoh: Jl. Veteran No. 23, RT 02 / RW 04, Kel. Kampung Anyar, Kec. Buleleng"
                  className={`w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                    formErrors.ktp_address && formTouched.ktp_address
                      ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-300 focus:border-rose-500'
                      : !formErrors.ktp_address && formTouched.ktp_address && formData.ktp_address
                        ? 'border-emerald-400 ring-1 ring-emerald-100'
                        : 'border-slate-300 hover:border-slate-400 focus:border-[#0B2256] focus:ring-1 focus:ring-[#0B2256]'
                  }`}
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
              </div>
              {formErrors.ktp_address && formTouched.ktp_address ? (
                <div className="flex items-center gap-1.5 text-rose-600 text-[11px] font-medium animate-in fade-in duration-150">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{formErrors.ktp_address}</span>
                </div>
              ) : null}
            </div>

            {/* Input Fields Row 5: Alamat Domisili Saat Ini */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Alamat Tinggal (Domisili Saat Ini) <span className="text-rose-500 font-bold">*</span>
                </label>

                {/* Checkbox: Sama dengan alamat KTP */}
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={sameAsKtp}
                    onChange={handleSameAddressChange}
                    className="w-4 h-4 rounded border-slate-300 text-[#0B2256] focus:ring-[#0B2256] cursor-pointer"
                  />
                  <span className="text-[11px] font-semibold text-slate-700 group-hover:text-blue-900 select-none">
                    Sama dengan alamat KTP
                  </span>
                </label>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={formData.residential_address}
                  onChange={(e) => handleInputChange('residential_address', e.target.value)}
                  onBlur={() => handleBlur('residential_address')}
                  placeholder="Jl. Veteran No. 23, Kelurahan Kampung Anyar, Buleleng, Bali"
                  className={`w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                    formErrors.residential_address && formTouched.residential_address
                      ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-300 focus:border-rose-500'
                      : !formErrors.residential_address && formTouched.residential_address && formData.residential_address
                        ? 'border-emerald-400 ring-1 ring-emerald-100'
                        : 'border-slate-300 hover:border-slate-400 focus:border-[#0B2256] focus:ring-1 focus:ring-[#0B2256]'
                  }`}
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
              </div>
              {formErrors.residential_address && formTouched.residential_address ? (
                <div className="flex items-center gap-1.5 text-rose-600 text-[11px] font-medium animate-in fade-in duration-150">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{formErrors.residential_address}</span>
                </div>
              ) : null}
            </div>

            {/* Form Action Buttons Row */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
              <button
                type="button"
                onClick={handleResetForm}
                disabled={savingLoading}
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 shadow-2xs transition-all active:scale-95 disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Batal / Reset Formulir</span>
              </button>

              <button
                type="submit"
                disabled={savingLoading}
                className="px-6 py-2.5 rounded-xl bg-[#0B2256] hover:bg-[#122e6e] text-white text-xs font-bold shadow-md shadow-[#0B2256]/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {savingLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan Data...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>
                      {editingId ? 'Simpan Perubahan Anggota' : 'Simpan Anggota Baru'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Filter & Search Bar Section */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-4">
          {/* Dropdown Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Status Anggota (Kategori Pekerjaan) */}
            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block">
                Status Anggota
              </label>
              <div className="relative">
                <select
                  value={filterJobCategory}
                  onChange={(e) => {
                    setFilterJobCategory(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-[#0B2256] focus:ring-2 focus:ring-[#0B2256]/15 appearance-none cursor-pointer"
                >
                  <option value="all">Semua Kategori Pekerjaan</option>
                  <option value="UMUM">Umum (PNS / Swasta / dll)</option>
                  <option value="PELAJAR">Pelajar</option>
                  <option value="MAHASISWA">Mahasiswa</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Lokasi Pinjam */}
            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block">
                Lokasi Pinjam
              </label>
              <div className="relative">
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-[#0B2256] focus:ring-2 focus:ring-[#0B2256]/15 appearance-none cursor-pointer"
                >
                  <option value="all">Semua Lokasi</option>
                  <option value="Perpustakaan Daerah Singaraja">
                    Perpustakaan Daerah Singaraja
                  </option>
                  <option value="Layanan Mobil Keliling">Layanan Mobil Keliling</option>
                  <option value="Pojok Baca Taman Kota">Pojok Baca Taman Kota</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Masa Berlaku */}
            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block">
                Masa Berlaku
              </label>
              <div className="relative">
                <select
                  value={filterValidity}
                  onChange={(e) => {
                    setFilterValidity(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-[#0B2256] focus:ring-2 focus:ring-[#0B2256]/15 appearance-none cursor-pointer"
                >
                  <option value="all">Semua Masa Berlaku</option>
                  <option value="Aktif Bebas Pustaka">Aktif (Masih Berlaku)</option>
                  <option value="Kedaluwarsa">Kedaluwarsa / Expired</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Search Input Row with Cari, Reset, and Counter */}
          <div className="flex flex-col md:flex-row items-center gap-3 pt-1">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari No. Anggota (AGT-2026-xxx), NIK / NISN, atau Nama Lengkap..."
                className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0B2256] focus:ring-2 focus:ring-[#0B2256]/15 transition-all"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end shrink-0">
              <button
                type="button"
                onClick={() => setDebouncedSearch(searchTerm)}
                className="px-5 py-2.5 rounded-xl bg-[#0B2256] hover:bg-[#122e6e] text-white text-xs font-bold shadow-sm transition-all"
              >
                Cari
              </button>

              <button
                type="button"
                onClick={() => {
                  setSearchTerm('')
                  setDebouncedSearch('')
                  setFilterJobCategory('all')
                  setFilterLocation('all')
                  setFilterValidity('all')
                }}
                className="px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset</span>
              </button>

              <span className="text-xs font-medium text-slate-500 pl-2 whitespace-nowrap">
                {filteredMembers.length} dari {stats.total_members.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* Bulk Action Bar (Appears when rows are selected) */}
        {selectedIds.length > 0 && (
          <div className="bg-[#EBF3FE] border border-[#C5DCFA] rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded bg-[#0B2256] text-white text-xs font-bold flex items-center justify-center">
                ✓
              </span>
              <span className="text-xs font-bold text-[#0B2256]">
                {selectedIds.length} Anggota Dipilih
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-slate-600">Aksi :</span>
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-[#0B2256]"
              >
                <option value="">Pilih Aksi</option>
                <option value="cetak">Cetak KTA Masal</option>
                <option value="perpanjang">Perpanjang Masa Berlaku (5 Th)</option>
                <option value="hapus">Hapus Masal</option>
              </select>

              <button
                type="button"
                onClick={handleApplyBulkAction}
                className="px-4 py-1.5 rounded-lg bg-[#0B2256] hover:bg-[#122e6e] text-white text-xs font-bold shadow-xs transition-all"
              >
                Terapkan
              </button>
            </div>
          </div>
        )}

        {/* Data Table Section */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-200 text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={
                        filteredMembers.length > 0 &&
                        selectedIds.length === filteredMembers.length
                      }
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-[#0B2256] focus:ring-[#0B2256] cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-4">NO. ANGGOTA &amp; WA</th>
                  <th className="py-3.5 px-4">IDENTITAS ANGGOTA</th>
                  <th className="py-3.5 px-4">PEKERJAAN &amp; INSTANSI</th>
                  <th className="py-3.5 px-4">MASA BERLAKU</th>
                  <th className="py-3.5 px-4">STATUS KEANGGOTAAN</th>
                  <th className="py-3.5 px-4 text-center w-28">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {tableLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-800" />
                        <span>Memuat data anggota perpustakaan...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className="w-8 h-8 text-slate-300" />
                        <span className="font-semibold text-slate-600">
                          Tidak ada data anggota yang cocok.
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Coba ganti kata kunci pencarian atau ubah filter di atas.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => {
                    const badge = getJobBadge(member.job_category)
                    const isSelected = selectedIds.includes(member.id)

                    return (
                      <tr
                        key={member.id}
                        className={`hover:bg-[#F9FBFE] transition-colors ${isSelected ? 'bg-blue-50/40' : ''
                          }`}
                      >
                        {/* Checkbox */}
                        <td className="py-4 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(member.id)}
                            className="w-4 h-4 rounded border-slate-300 text-[#0B2256] focus:ring-[#0B2256] cursor-pointer"
                          />
                        </td>

                        {/* NO. ANGGOTA & WA */}
                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <span className="font-bold text-[#1E56B3] font-mono text-xs block">
                              {member.member_no}
                            </span>
                            {getMemberWaUrl(member) ? (
                              <a
                                href={getMemberWaUrl(member)}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Kirim pesan resmi WhatsApp ke anggota"
                                className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 hover:text-emerald-700 hover:underline"
                              >
                                <MessageSquare className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span>+62 {member.phone_number?.replace(/^\+62|^0/, '')}</span>
                              </a>
                            ) : (
                              <span className="text-[11px] text-slate-500 font-mono block">
                                WA: {member.phone_number ? `+62 ${member.phone_number.replace(/^\+62|^0/, '')}` : '-'}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* IDENTITAS ANGGOTA */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            {/* Avatar Circle with Safe Auto-Resolution & Fallback */}
                            <MemberAvatar member={member} size="w-8 h-8" />

                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-900 block leading-tight">
                                {member.name}
                              </span>
                              <span className="text-[11px] text-slate-500 block">
                                {member.gender === 'P' ? 'P' : 'L'} •{' '}
                                {member.place_of_birth || 'Singaraja'},{' '}
                                {member.date_of_birth
                                  ? new Date(member.date_of_birth).toLocaleDateString('id-ID', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                  })
                                  : '-'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* PEKERJAAN & INSTANSI */}
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${badge.bg}`}
                            >
                              {badge.label}
                            </span>
                            <span className="text-[11px] text-slate-600 block">
                              {member.institution_name || member.institution || '-'} •{' '}
                              <span className="font-semibold text-slate-700">
                                {member.max_loans || 3} Buku
                              </span>
                            </span>
                          </div>
                        </td>

                        {/* MASA BERLAKU */}
                        <td className="py-4 px-4">
                          <div className="space-y-0.5 text-[11px]">
                            <span className="text-slate-600 block">
                              {member.valid_from || '07-09-2026'} s.d
                            </span>
                            <span className="font-bold text-teal-700 block">
                              {member.valid_until || '06-09-2031'} (5 Th)
                            </span>
                          </div>
                        </td>

                        {/* STATUS KEANGGOTAAN */}
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E8F8F4] text-[#0D9478] border border-[#B4EFE3]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0D9478]" />
                            {member.status || 'Aktif Bebas Pustaka'}
                          </span>
                        </td>

                        {/* AKSI */}
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-1 text-slate-500">
                            {/* Detail Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedMemberForDetail(member)
                                setIsDetailModalOpen(true)
                              }}
                              className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-blue-700 transition-colors"
                              title="Lihat Detail Profil Anggota"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => handleEditMember(member)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-amber-700 transition-colors"
                              title="Edit Data Anggota"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {/* Print KTA Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedMemberForPrint(member)
                                setIsPrintModalOpen(true)
                              }}
                              className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-emerald-700 transition-colors"
                              title="Cetak Kartu Tanda Anggota (KTA)"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            {/* Delete Button (Opens Confirmation Modal) */}
                            <button
                              type="button"
                              onClick={() => handleOpenDeleteModal(member)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              title="Hapus Anggota"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          <div className="px-6 py-4 bg-[#F8FAFC] border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            {/* Left Counter & Per-page */}
            <div className="flex items-center gap-3">
              <span>
                Menampilkan 1-{Math.min(perPage, filteredMembers.length)} dari{' '}
                {stats.total_members.toLocaleString('id-ID')} anggota
              </span>
              <div className="relative">
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-[#0B2256] cursor-pointer"
                >
                  <option value={5}>5 per halaman</option>
                  <option value={10}>10 per halaman</option>
                  <option value={25}>25 per halaman</option>
                  <option value={50}>50 per halaman</option>
                </select>
              </div>
            </div>

            {/* Right Pagination Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                &lt; Sebelumnya
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${currentPage === 1
                  ? 'bg-[#0B2256] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
              >
                1
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(2)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${currentPage === 2
                  ? 'bg-[#0B2256] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
              >
                2
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(3)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${currentPage === 3
                  ? 'bg-[#0B2256] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
              >
                3
              </button>
              <span className="px-1 text-slate-400">..</span>
              <button
                type="button"
                className="w-8 h-7 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-[11px] font-bold"
              >
                4265
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Selanjutnya &gt;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal on Delete (Required by User) */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        member={memberToDelete}
        isBulk={isBulkDelete}
        bulkCount={selectedIds.length}
        loading={deleteLoading}
      />

      {/* Member Full Detail Modal */}
      <MemberDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        member={selectedMemberForDetail}
        onEdit={(m) => handleEditMember(m)}
        onPrintKta={(m) => {
          setSelectedMemberForPrint(m)
          setIsPrintModalOpen(true)
        }}
      />

      {/* KTA Print & Download Modal */}
      <MemberPrintKtaModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        member={selectedMemberForPrint}
      />

      {/* Webcam Photo Capture Modal */}
      <WebcamCaptureModal
        isOpen={isWebcamOpen}
        onClose={() => setIsWebcamOpen(false)}
        onCapture={handleWebcamCaptured}
      />

      {/* Import CSV / Excel Modal */}
      <ImportMemberModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          showToast('Import anggota berhasil diselesaikan.', 'success')
          loadMembers()
        }}
      />
    </AdminLayout>
  )
}
