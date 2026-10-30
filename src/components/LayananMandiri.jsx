import { ChevronRight, LayoutGrid, Lock } from 'lucide-react'
import { LAYANAN_MANDIRI_ITEMS, useLayananMandiri } from './layananMandiriItems'

/** Panel dropdown Layanan Mandiri pada Navbar desktop */
export function LayananMandiriDropdown() {
  const { isLoggedIn, isActive, open } = useLayananMandiri()

  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-[300px] opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50 cursor-default">
      <div className="relative bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-2">
          {LAYANAN_MANDIRI_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isActive(item)
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => open(item)}
                className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-colors cursor-pointer group/item ${
                  active ? 'bg-indigo-50' : 'hover:bg-slate-50'
                }`}
              >
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 group-hover/item:scale-105 transition-transform ${item.tone}`}>
                  <Icon className="w-[18px] h-[18px] stroke-[2.2]" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-[#032360]">
                    {item.label}
                    {item.requiresLogin && !isLoggedIn && <Lock className="w-3 h-3 text-slate-400" />}
                  </span>
                  <span className="block text-[11px] text-slate-500 mt-0.5 truncate">{item.description}</span>
                </span>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover/item:text-indigo-600 group-hover/item:translate-x-0.5 transition-all" />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/** Kartu Layanan Mandiri pada sidebar Beranda & OPAC */
export function LayananMandiriCard() {
  const { isLoggedIn, isActive, open } = useLayananMandiri()

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2 text-[#032360] font-bold text-base">
          <LayoutGrid className="w-5 h-5 text-indigo-600" />
          <span>Layanan Mandiri</span>
        </div>
        {!isLoggedIn && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500">
            <Lock className="w-3 h-3" />
            Perlu Login
          </span>
        )}
      </div>

      <div className="space-y-2">
        {LAYANAN_MANDIRI_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => open(item)}
              className={`group w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors cursor-pointer ${
                isActive(item) ? 'bg-indigo-50 ring-1 ring-indigo-100' : 'bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.tone}`}>
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800">{item.label}</p>
                  <p className="text-[10.5px] text-slate-500 truncate">{item.description}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
