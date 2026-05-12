'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Trophy, 
  Users, 
  LayoutDashboard, 
  User as UserIcon, 
  Menu, 
  X, 
  LogOut, 
  ShieldCheck,
  Calendar,
  Award,
  Info,
  ChevronRight
} from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { supabase } from '@/lib/supabase'
import { AdminBanner } from './AdminBanner'
import { cn } from '@/lib/utils'

interface NavItem {
  name: string
  href: string
  icon: any
  requiresAuth?: boolean
  adminOnly?: boolean
}

const NAVIGATION: NavItem[] = [
  { name: 'Home', href: '/', icon: LayoutDashboard },
  { name: 'Series', href: '/tournaments/series', icon: Trophy },
  { name: 'Royal', href: '/tournaments/royal', icon: Trophy },
  { name: 'Schedule', href: '/schedule', icon: Calendar },
  { name: 'Results', href: '/results', icon: Award },
  { name: 'About', href: '/about', icon: Info },
]

const USER_NAV: NavItem[] = [
  { name: 'Profile', href: '/profile', icon: UserIcon, requiresAuth: true },
  { name: 'My Team', href: '/team', icon: Users, requiresAuth: true },
]

import { registerServiceWorker } from '@/lib/push'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerServiceWorker()
  }, [])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { data: user, isLoading } = useUser()

  useEffect(() => {
    setIsSidebarOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const isAdmin = user?.profile?.role === 'admin'

  return (
    <div className="flex min-h-screen bg-grid">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 transform border-r border-primary/20 bg-card/90 backdrop-blur-xl transition-all duration-300 lg:sticky lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo - Restored from V1 */}
          <div className="border-b border-white/5 px-6 py-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-primary/30 bg-primary/5 p-1.5 shadow-lg shadow-primary/10">
                <img 
                  src="/icons/icon-192.png" 
                  alt="AOG Logo" 
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-3xl font-black uppercase tracking-wider text-white leading-none">AOG</span>
                <span className="font-display text-[10px] font-bold text-primary uppercase tracking-[0.2em] leading-none mt-1.5">Age of Goal</span>
              </div>
            </Link>
            <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/50">Competitive command center</p>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 space-y-1.5 px-4 py-8 overflow-y-auto custom-scrollbar">
            {NAVIGATION.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-4 py-3.5 text-xs font-bold uppercase tracking-[0.15em] transition-all",
                  pathname === item.href 
                    ? "bg-primary/15 text-primary border-l-2 border-primary text-glow" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", pathname === item.href ? "text-primary" : "text-muted-foreground")} />
                {item.name}
                {pathname === item.href && <div className="absolute right-4 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
              </Link>
            ))}

            <div className="pt-6">
              <div className="px-4 mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">Pro Zone</div>
              {USER_NAV.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-4 py-3.5 text-xs font-bold uppercase tracking-[0.15em] transition-all",
                    pathname === item.href 
                      ? "bg-primary/15 text-primary border-l-2 border-primary text-glow" 
                      : "text-muted-foreground hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </div>

            {isAdmin && (
              <div className="pt-6">
                <div className="px-4 mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-orange-500/40 font-display">Command</div>
                <Link
                  href="/admin"
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-4 py-3.5 text-xs font-bold uppercase tracking-[0.15em] transition-all",
                    pathname.startsWith('/admin') 
                      ? "bg-orange-500/15 text-orange-500 border-l-2 border-orange-500" 
                      : "text-muted-foreground hover:bg-white/5 hover:text-white"
                  )}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin Panel
                </Link>
              </div>
            )}
          </nav>

          {/* User Footer */}
          <div className="border-t border-white/5 p-4 space-y-3">
            {user ? (
              <>
                <div className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/5 p-3">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold uppercase">
                    {user.email?.[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-black uppercase tracking-widest text-white">{user.email?.split('@')[0]}</p>
                    <p className="truncate text-[8px] font-mono uppercase text-muted-foreground tracking-tighter">Elite Operator</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500"
                >
                  <LogOut className="h-4 w-4" /> Log Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Launch App
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/5 bg-background/50 px-6 backdrop-blur-md lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <img src="/icons/icon-192.png" alt="" className="h-8 w-8" />
            <span className="font-display text-xl font-black uppercase tracking-wider">AOG</span>
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-lg border border-white/10 p-2 text-white"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>

        <AdminBanner />

        <main className="flex-1 p-6 md:p-10 lg:p-12">
          {children}
        </main>
      </div>
    </div>
  )
}
