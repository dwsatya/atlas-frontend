import { useState } from 'react'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F0F4F9] text-slate-800 flex font-sans antialiased">
      {/* Sidebar Desktop & Mobile */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header Bar */}
        <AdminHeader onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        {/* Page Content with proper padding */}
        <main className="flex-1 p-4 sm:p-5 lg:p-6 max-w-[1550px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
