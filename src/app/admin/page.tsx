'use client'

import Link from 'next/link'
import { 
  Trophy, 
  Users, 
  Image as ImageIcon, 
  ShieldCheck, 
  ArrowRight,
  LayoutDashboard
} from 'lucide-react'

const adminModules = [
  {
    name: 'Series Tournaments',
    description: 'Create and manage bracket-style team events.',
    href: '/admin/tournaments/series/create',
    icon: Trophy,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10'
  },
  {
    name: 'Royal Arena',
    description: 'Initialize fast-track battle royale events.',
    href: '/admin/tournaments/royal',
    icon: LayoutDashboard,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10'
  },
  {
    name: 'Identity Verification',
    description: 'Review and approve player profiles.',
    href: '/admin/verifications',
    icon: ShieldCheck,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10'
  },
  {
    name: 'Banner Management',
    description: 'Update announcements and sponsor banners.',
    href: '/admin/banners',
    icon: ImageIcon,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10'
  }
]

export default function AdminDashboard() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-4xl font-black uppercase tracking-tight">
          Admin <span className="gradient-text">Command Center</span>
        </h1>
        <p className="mt-2 text-muted-foreground">Global platform controls and management modules.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {adminModules.map((module) => (
          <Link 
            key={module.name}
            href={module.href}
            className="glass-card group relative overflow-hidden rounded-[2.5rem] border border-white/5 p-8 transition-all hover:border-white/10 hover:bg-white/[0.03]"
          >
            <div className="relative z-10 flex items-start gap-6">
              <div className={`rounded-2xl ${module.bg} p-4 ${module.color}`}>
                <module.icon className="h-8 w-8" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-display text-xl font-bold uppercase text-white group-hover:text-orange-500 transition-colors">
                  {module.name}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {module.description}
                </p>
                <div className="flex items-center gap-2 pt-2 text-[10px] font-bold uppercase tracking-widest text-orange-500 opacity-0 transition-all group-hover:opacity-100">
                  Access Module <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </div>
            
            {/* Subtle glow effect */}
            <div className="absolute -right-4 -top-4 h-32 w-32 bg-orange-500/5 blur-[50px] transition-all group-hover:bg-orange-500/10" />
          </Link>
        ))}
      </div>
    </div>
  )
}
