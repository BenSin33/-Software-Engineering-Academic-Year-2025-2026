'use client'
import { useState } from 'react'
import { Footer } from './Footer'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function Layout({ list, children, user }: any) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="grid grid-rows-[50px_1fr_50px] h-screen w-full overflow-hidden">
      {/* Header */}
      <div className="row-start-1 row-end-2 col-span-2">
        <Header user={user} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      </div>

      {/* Main content area */}
      <div className="row-start-2 row-end-3 col-span-2 flex h-full">
        {/* Sidebar as flex item */}
        <div
          className={`transition-all duration-300 ${
            isSidebarOpen ? 'w-64' : 'w-0'
          } overflow-hidden`}
        >
          <Sidebar list={list} isOpen={isSidebarOpen} />
        </div>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Footer */}
      <div className="row-start-3 row-end-4 col-span-2">
        <Footer />
      </div>
    </div>
  )
}