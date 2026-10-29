import { useEffect, useState } from 'react'
import { fetchOpacStats } from '../services/api'

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')

/**
 * Kartu "Statistik Koleksi" pada sidebar Beranda & OPAC, diambil langsung dari database.
 */
export default function CollectionStatsCard() {
  const [stats, setStats] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchOpacStats()
      .then((result) => {
        if (!cancelled) setStats(result.data)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const items = [
    {
      label: 'Koleksi Buku',
      value: stats?.total_titles,
      note: stats ? `${formatNumber(stats.total_copies)} eksemplar` : null,
      tone: 'text-[#032360]',
    },
    { label: 'Buku Dipinjam', value: stats?.borrowed_now, note: 'Sedang dipinjam', tone: 'text-emerald-600' },
    { label: 'Anggota Aktif', value: stats?.active_members, note: 'Kartu masih berlaku', tone: 'text-[#032360]' },
    { label: 'Sirkulasi Hari Ini', value: stats?.circulation_today, note: 'Pinjam & kembali', tone: 'text-emerald-600' },
  ]

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center space-x-2 text-[#032360] font-bold text-base border-b border-slate-100 pb-3">
        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span>Statistik Koleksi</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.label} className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
            <span className="block text-[11px] font-semibold text-slate-500">{item.label}</span>
            {stats ? (
              <span className={`block text-xl font-extrabold mt-1 ${item.tone}`}>{formatNumber(item.value)}</span>
            ) : failed ? (
              <span className="block text-xl font-extrabold mt-1 text-slate-300">-</span>
            ) : (
              <span className="block h-6 w-12 mt-1.5 rounded-md bg-slate-200 animate-pulse" />
            )}
            {item.note && stats && <span className="block text-[10px] text-slate-400 mt-0.5">{item.note}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
