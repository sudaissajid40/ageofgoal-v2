'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Trophy, 
  Sword, 
  Calendar, 
  BarChart3, 
  User, 
  Users, 
  Info, 
  LayoutDashboard,
  LogIn,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useUser } from '@/hooks/useUser'
import { AdminBanner } from './AdminBanner'

const navigation = [
  { name: 'Home', href: '/', icon: LayoutDashboard },
  { name: 'Series Tournaments', href: '/tournaments/series', icon: Trophy },
  { name: 'Royal Tournaments', href: '/tournaments/royal', icon: Sword },
  { name: 'Schedule', href: '/schedule', icon: Calendar },
  { name: 'Results', href: '/results', icon: BarChart3 },
  { name: 'About', href: '/about', icon: Info },
]

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { data: user, isLoading } = useUser()

  return (
    <div className="flex min-h-screen flex-col">
      <AdminBanner />
      
      <div className="flex flex-1">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-[#121217] border-r border-white/5 transition-transform duration-300 lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex h-full flex-col">
            <div className="flex h-20 items-center px-6">
              <Link href="/" className="font-display text-2xl font-black uppercase tracking-tighter">
                AOG <span className="text-orange-500">v2</span>
              </Link>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      isActive 
                        ? "bg-orange-500/10 text-orange-500 shadow-[inset_0_0_10px_rgba(249,115,22,0.1)]" 
                        : "text-muted-foreground hover:bg-white/5 hover:text-white"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className={cn(
                      "mr-3 h-5 w-5",
                      isActive ? "text-orange-500" : "text-muted-foreground group-hover:text-white"
                    )} />
                    {item.name}
                  </Link>
                )
              })}

              <div className="my-4 h-px bg-white/5 mx-3" />
              <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Pro Zone</p>

              {isLoading ? (
                <div className="animate-pulse px-4 py-2 text-xs text-muted-foreground">Loading auth...</div>
              ) : user ? (
                <>
                  <Link
                    href="/profile"
                    className={cn(
                      "group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      pathname === '/profile' ? "bg-orange-500/10 text-orange-500" : "text-muted-foreground hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <User className="mr-3 h-5 w-5" />
                    My Profile
                  </Link>
                  <Link
                    href="/team"
                    className={cn(
                      "group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      pathname === '/team' ? "bg-orange-500/10 text-orange-500" : "text-muted-foreground hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Users className="mr-3 h-5 w-5" />
                    My Team
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  className="group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-orange-500 bg-orange-500/5 hover:bg-orange-500/10 transition-all border border-orange-500/20"
                >
                  <LogIn className="mr-3 h-5 w-5" />
                  Login for Glory
                </Link>
              )}
            </nav>

            {user?.profile?.role === 'admin' && (
              <div className="p-4 border-t border-white/5">
                <Link
                  href="/admin"
                  className="flex items-center justify-center rounded-xl bg-white/5 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-all"
                >
                  Admin Panel
                </Link>
              </div>
            )}
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top Navbar (Mobile only) */}
          <header className="flex h-16 items-center justify-between px-6 border-b border-white/5 lg:hidden">
            <Link href="/" className="font-display text-xl font-black uppercase tracking-tighter">
              AOG <span className="text-orange-500">v2</span>
            </Link>
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-muted-foreground hover:text-white"
              aria-label="Open Sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
          </header>

          <main className="flex-1 overflow-y-auto bg-[#0a0a0c] p-6 md:p-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
