import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building,
  CreditCard,
  BookOpen,
  CheckCircle2,
  Printer,
  Edit,
  MessageSquare,
  Copy,
  ExternalLink,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { resolvePhotoUrl } from '../../utils/ktaImageGenerator'
import { fetchMemberProblemHistory } from '../../services/api'

export default function MemberDetailModal({
  isOpen,
  onClose,
  member,
  onEdit,
  onPrintKta,
  onReportProblem,
}) {
  const [copied, setCopied] = useState(false)
  const [photoError, setPhotoError] = useState(false)
  const [problemHistory, setProblemHistory] = useState([])
  const [problemSummary, setProblemSummary] = useState(null)
  const [loadingProblems, setLoadingProblems] = useState(false)

  const rawPhoto = member?.photo_path || member?.photo_url || member?.avatar
  const photoUrl = useMemo(() => (rawPhoto ? resolvePhotoUrl(rawPhoto) : null), [rawPhoto])

  useEffect(() => {
    setPhotoError(false)
    if (member?.id) {
      setLoadingProblems(true)
      fetchMemberProblemHistory(member.id)
        .then((res) => {
          setProblemHistory(res?.data || [])
          setProblemSummary(res?.summary || null)
        })
        .catch((e) => console.warn('Could not load member problem history:', e))
        .finally(() => setLoadingProblems(false))
    } else {
      setProblemHistory([])
      setProblemSummary(null)
    }
  }, [member])

  const isProblematic = useMemo(() => {
    if (!member) return false
    return Boolean(
      member.is_problematic ||
      String(member.status || '').toLowerCase().includes('dibekukan') ||
      String(member.status || '').toLowerCase().includes('bermasalah') ||
      (problemSummary && problemSummary.active_cases_count > 0)
    )
  }, [member, problemSummary])

  const formattedValidUntil = useMemo(() => {
    if (!member?.valid_until) return '2031'
    if (typeof member.valid_until === 'string' && (member.valid_until.includes('/') || member.valid_until.includes('-'))) {
      const parts = member.valid_until.split(/[/ -]/)
      if (parts.length === 3 && parts[0].length <= 2 && parts[2].length === 4) {
        const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
        }
      }
    }
    const d = new Date(member.valid_until)
    return isNaN(d.getTime()) ? String(member.valid_until) : d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  }, [member?.valid_until])

  const formattedCreatedAt = useMemo(() => {
    if (!member?.created_at) return '16 Sep 2026'
    const d = new Date(member.created_at)
    return isNaN(d.getTime()) ? String(member.created_at) : d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  }, [member?.created_at])

  if (!isOpen || !member) return null

  const handleCopyNo = () => {
    if (member?.member_no) {
      navigator.clipboard.writeText(member.member_no)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Format clean WhatsApp link
  const rawPhone = member.phone_number || ''
  const cleanPhone = rawPhone.replace(/\D/g, '').replace(/^0/, '62').replace(/^\+/, '')

  const waMessage = useMemo(() => {
    if (!member) return ''
    const memberName = member.name || 'Bapak/Ibu/Sdr(i)'
    const memberNo = member.member_no || '-'
    const category = member.job_category || 'Umum'
    const validUntil = formattedValidUntil || '5 Tahun'
    const emailInfo = member.email ? member.email : '-'

    return `*LAYANAN SIRKULASI & KEANGGOTAAN DAPD KAB. BULELENG*
Salam Literasi,

Yth. *${memberName}*,
Nomor Anggota: *${memberNo}*

Pendaftaran keanggotaan Perpustakaan Daerah Kabupaten Buleleng Anda telah aktif di sistem sirkulasi ATLAS.

*Rincian Data Keanggotaan:*
• No. Anggota: *${memberNo}*
• Nama Lengkap: *${memberName}*
• Jenis Kelamin: ${member.gender === 'P' ? 'Perempuan (P)' : 'Laki-Laki (L)'}
• Kategori: ${category}
• Instansi/Sekolah: ${member.institution_name || member.institution || '-'}
• Email: ${emailInfo}
• Maksimal Peminjaman: 3 Buku
• Masa Berlaku: Hingga ${validUntil}

Kartu Tanda Anggota (KTA) Anda kini dapat digunakan untuk meminjam buku fisik di gedung perpustakaan serta mengakses fasilitas baca di tempat.

*Dinas Arsip dan Perpustakaan Daerah Kab. Buleleng*
Jl. Veteran No. 23, Singaraja, Bali
Website: https://bulelengkab.go.id

_Terima kasih atas partisipasi Anda dalam gerakan gemar membaca Buleleng._`
  }, [member, formattedValidUntil])

  const waUrl = useMemo(() => {
    if (!cleanPhone) return null
    const targetPhone = cleanPhone.startsWith('62') ? cleanPhone : '62' + cleanPhone
    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(waMessage)}`
  }, [cleanPhone, waMessage])

  const getJobBadge = (category) => {
    const cat = String(category || '').toUpperCase()
    if (cat.includes('PELAJAR')) {
      return {
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        label: 'Pelajar',
      }
    }
    if (cat.includes('MAHASISWA')) {
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        label: 'Mahasiswa',
      }
    }
    return {
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      label: 'Umum (PNS / Swasta / dll)',
    }
  }

  const badge = getJobBadge(member.job_category)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-[#0B2256] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/15">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Identitas Lengkap Anggota
              </h3>
              <p className="text-[11px] text-[#A5C0EE]">
                DAPD Kab. Buleleng • Terdaftar di Database Sirkulasi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Profile Summary Card */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-xl bg-[#F8FAFC] border border-slate-200/80">
            {/* Foto Anggota */}
            <div className="w-24 h-32 rounded-xl overflow-hidden bg-slate-100 border-2 border-white shadow-md shrink-0 flex items-center justify-center">
              {photoUrl && !photoError ? (
                <img
                  src={photoUrl}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  onError={() => setPhotoError(true)}
                />
              ) : (
                <div className="w-full h-full bg-[#EBF2FE] flex flex-col items-center justify-center text-[#1E56B3]">
                  <span className="text-3xl font-extrabold select-none">
                    {member.name ? member.name.charAt(0).toUpperCase() : 'A'}
                  </span>
                  <span className="text-[10px] font-semibold text-blue-500/80 mt-1">
                    Pas Foto
                  </span>
                </div>
              )}
            </div>

            {/* General Info */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg}`}>
                  {badge.label}
                </span>

                {/* Status Keanggotaan Terintegrasi */}
                {isProblematic ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                    Akses Dibekukan (Bermasalah)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {member.status || 'Aktif Bebas Pustaka'}
                  </span>
                )}
              </div>

              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {member.name}
              </h2>

              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/80">
                  {member.member_no}
                </span>
                <button
                  type="button"
                  onClick={handleCopyNo}
                  className="text-slate-400 hover:text-slate-700 p-1 hover:bg-slate-200/70 rounded transition-colors"
                  title="Salin Nomor Anggota"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {copied && <span className="text-[10px] text-emerald-600 font-semibold">Tersalin!</span>}
              </div>

              <p className="text-xs text-slate-600 flex items-center justify-center sm:justify-start gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {member.institution_name || member.institution || '-'}
                <span className="text-slate-300">•</span>
                <span className="font-semibold text-blue-600">
                  Kuota: 3 Buku
                </span>
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Tempat & Tanggal Lahir */}
            <div className="p-3.5 rounded-xl border border-slate-200/70 bg-white space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Tempat &amp; Tanggal Lahir
              </span>
              <p className="font-semibold text-slate-800 text-sm">
                {member.place_of_birth || '-'},{' '}
                {member.date_of_birth
                  ? new Date(member.date_of_birth).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })
                  : '-'}
              </p>
              <p className="text-[11px] text-slate-500">
                Jenis Kelamin: {member.gender === 'P' ? 'Perempuan' : 'Laki-laki'}
              </p>
            </div>

            {/* Kontak & WhatsApp */}
            <div className="p-3.5 rounded-xl border border-slate-200/70 bg-white space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                Nomor WhatsApp
              </span>
              <p className="font-semibold text-slate-800 text-sm font-mono">
                +62 {member.phone_number?.replace(/^\+62|^0/, '') || '-'}
              </p>
              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline pt-0.5"
                >
                  <MessageSquare className="w-3 h-3" />
                  Kirim Pesan WhatsApp
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>

            {/* Alamat Email Anggota */}
            <div className="p-3.5 rounded-xl border border-slate-200/70 bg-white space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-600" />
                Alamat Email
              </span>
              <p className="font-semibold text-slate-800 text-sm break-all">
                {member.email || '-'}
              </p>
              <p className="text-[11px] text-slate-400">
                {member.email ? 'Email resmi anggota' : 'Tidak mencantumkan email (-) '}
              </p>
            </div>

            {/* Masa Berlaku Kartu */}
            <div className="p-3.5 rounded-xl border border-slate-200/70 bg-white space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                Masa Berlaku Kartu Anggota
              </span>
              <p className="font-bold text-teal-700 text-sm">
                5 Tahun (Hingga {formattedValidUntil})
              </p>
              <p className="text-[11px] text-slate-500">
                Terdaftar sejak: {formattedCreatedAt}
              </p>
            </div>
          </div>

          {/* Alamat KTP */}
          <div className="p-3.5 rounded-xl border border-slate-200/70 bg-white space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              Alamat Sesuai KTP
            </span>
            <p className="text-slate-800 text-xs leading-relaxed font-medium">
              {member.ktp_address || '-'}
            </p>
          </div>

          {/* Alamat Domisili */}
          <div className="p-3.5 rounded-xl border border-slate-200/70 bg-white space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              Alamat Tinggal (Domisili Saat Ini)
            </span>
            <p className="text-slate-800 text-xs leading-relaxed font-medium">
              {member.residential_address || '-'}
            </p>
          </div>

          {/* Riwayat Permasalahan & Keranjang Bermasalah */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Riwayat Kasus Sirkulasi (Keranjang Bermasalah)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onReportProblem?.(member)
                  }}
                  className="text-[11px] font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Laporkan anggota ini ke Keranjang Bermasalah"
                >
                  <ShieldAlert className="w-3 h-3 text-rose-600" />
                  <span>+ Masukkan Masalah</span>
                </button>

                <Link
                  to={`/admin/keranjang-bermasalah?search=${encodeURIComponent(member.member_no || member.name)}`}
                  onClick={onClose}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                >
                  <span>Buka di Keranjang</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </Link>
              </div>
            </div>

            {loadingProblems ? (
              <p className="text-[11px] text-slate-400 py-2">Memuat riwayat kasus sirkulasi...</p>
            ) : problemHistory.length === 0 ? (
              <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Anggota ini tidak memiliki catatan pelanggaran atau sanksi sirkulasi. Hak peminjaman aktif bebas pustaka.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {problemHistory.map((p) => {
                  return (
                    <div
                      key={p.id}
                      className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                        p.is_resolved
                          ? 'bg-slate-50 border-slate-200 text-slate-700'
                          : 'bg-rose-50/70 border-rose-200 text-rose-900'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.is_resolved
                                ? 'bg-slate-200 text-slate-700'
                                : 'bg-rose-700 text-white'
                            }`}
                          >
                            {p.problem_type_label || p.problem_type}
                          </span>
                          <span className="font-bold text-xs">{p.item_title || 'Kasus Tata Tertib Sirkulasi'}</span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          {p.item_barcode && <span>Eksemplar: {p.item_barcode} • </span>}
                          <span>Tindakan: <b>{p.action_status_label || p.action_status}</b> ({p.action_notes || 'Hak pinjam ditangguhkan'})</span>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 ${p.is_resolved ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'}`}>
                          {p.is_resolved ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Kasus Selesai</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Sanksi Aktif</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-white transition-all cursor-pointer"
          >
            Tutup
          </button>

          <div className="flex items-center gap-2.5">
            {/* Tombol Masukkan ke Keranjang Bermasalah */}
            <button
              type="button"
              onClick={() => {
                onClose()
                onReportProblem?.(member)
              }}
              className="px-4 py-2 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              title="Masukkan anggota ini ke Keranjang Bermasalah"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>Masuk Keranjang Bermasalah</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose()
                if (onEdit) onEdit(member)
              }}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5 text-blue-600" />
              Edit Data
            </button>

            <button
              type="button"
              onClick={() => {
                onClose()
                if (onPrintKta) onPrintKta(member)
              }}
              className="px-4.5 py-2 rounded-xl bg-[#0B2256] hover:bg-[#112d6e] text-white text-xs font-bold shadow-md shadow-blue-900/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak KTA
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}