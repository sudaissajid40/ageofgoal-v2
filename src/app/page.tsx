'use client'

import Link from 'next/link'
import { Trophy, Sword, Users, ShieldCheck, ArrowRight, Flame, Zap, ChevronRight, Lock } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { formatPKT } from '@/lib/utils'
import { useUser } from '@/hooks/useUser'

export default function HomePage() {
  const { data: user } = useUser()

  const { data: series } = useQuery({
    queryKey: ['home-series'],
    queryFn: async () => {
      const { data } = await supabase
        .from('series_tournaments')
        .select('*')
        .order('starts_at', { ascending: true })
        .limit(3)
      return data
    },
    staleTime: 0,
    refetchOnWindowFocus: true
  })

  const { data: royal } = useQuery({
    queryKey: ['home-royal'],
    queryFn: async () => {
      const { data } = await supabase
        .from('royal_tournaments')
        .select('*')
        .order('starts_at', { ascending: true })
        .limit(3)
      return data
    },
    staleTime: 0,
    refetchOnWindowFocus: true
  })

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative -mt-10 md:-mt-12 overflow-hidden rounded-b-[3rem] border-b border-white/10">
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/hero-arena.jpg" 
            alt="AOG arena" 
            className="h-full w-full object-cover opacity-50" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#121217] via-[#121217]/85 to-[#121217]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121217] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 sm:py-28 md:py-36">
          <div className="max-w-2xl">
            <div className="mb-8">
              <img 
                src="/icons/icon-512.png" 
                alt="AOG Logo" 
                className="h-24 w-24 rounded-2xl shadow-2xl border border-white/10" 
              />
            </div>
            
            <div className="inline-flex items-center gap-2 rounded-md border border-orange-500/40 bg-orange-500/10 px-4 py-1.5 backdrop-blur-sm shadow-lg shadow-orange-500/5">
              <Flame className="h-4 w-4 text-orange-500 animate-pulse" />
              <span className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-orange-500">Top Mobile Esports</span>
            </div>
            
            <h1 className="mt-8 font-display text-5xl font-black uppercase leading-tight tracking-tight sm:text-7xl md:text-8xl">
              <span className="text-white">Age</span> <span className="text-white">of</span> <span className="gradient-text">Goal</span>
            </h1>
            
            <p className="mt-8 max-w-md text-base text-muted-foreground sm:text-lg leading-relaxed">
              Enter the ultimate Free Fire battleground. Build your profile, verify your identity, join a squad, and compete for AOG points.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
              <Link 
                href={user ? "/profile" : "/login"}
                className="group flex w-full sm:w-auto items-center justify-center gap-3 rounded-md bg-orange-500 px-10 py-5 font-display text-xl font-black uppercase tracking-widest text-white shadow-2xl transition-all hover:scale-105 active:scale-95"
              >
                {user ? "Enter Profile" : "Launch App"} <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Series Preview */}
      <section className="space-y-10 px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div>
            <h2 className="font-display text-3xl font-black uppercase tracking-tight md:text-5xl">
              Series <span className="gradient-text">Elite</span>
            </h2>
            <p className="mt-2 text-muted-foreground">Premier team-based tournaments for verified squads.</p>
          </div>
          <Link href="/tournaments/series" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-500 hover:text-white transition-colors">
            View All Series <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {series?.map((t) => (
            <Link key={t.id} href={`/tournaments/series/${t.id}`} className="glass-card group overflow-hidden rounded-xl border border-white/5 hover:border-orange-500/30 transition-all">
              <div className="relative aspect-[16/9] w-full overflow-hidden">
                {t.thumbnail_url ? (
                  <img 
                    src={t.thumbnail_url.startsWith('http') 
                      ? t.thumbnail_url 
                      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/${t.thumbnail_url}`} 
                    alt="" 
                    className="h-full w-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-110" 
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-white/5">
                    <Trophy className="h-12 w-12 text-orange-500/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#121217] via-transparent to-transparent" />
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-bold uppercase group-hover:text-orange-500 transition-colors">{t.name}</h3>
                <div className="mt-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  <span className="flex items-center gap-2"><Users className="h-3.5 w-3.5 text-orange-500" /> {t.match_team_size}P Squad</span>
                  <span className="text-white">{formatPKT(t.starts_at)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Royal Preview */}
      <section className="space-y-10 px-6 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div>
            <h2 className="font-display text-3xl font-black uppercase tracking-tight md:text-5xl">
              Royal <span className="text-blue-500">Arena</span>
            </h2>
            <p className="mt-2 text-muted-foreground">Fast-track anonymous combat. No login required.</p>
          </div>
          <Link href="/tournaments/royal" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-500 hover:text-white transition-colors">
            Enter Arena <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {royal?.map((t) => (
            <Link key={t.id} href={`/tournaments/royal/${t.id}`} className="glass-card group overflow-hidden rounded-xl border border-white/5 hover:border-blue-500/30 transition-all">
              <div className="relative aspect-[16/9] w-full overflow-hidden">
                {t.thumbnail_url ? (
                  <img 
                    src={t.thumbnail_url.startsWith('http') 
                      ? t.thumbnail_url 
                      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/${t.thumbnail_url}`} 
                    alt="" 
                    className="h-full w-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-110" 
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-white/5">
                    <Sword className="h-12 w-12 text-blue-500/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#121217] via-transparent to-transparent" />
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-bold uppercase group-hover:text-blue-500 transition-colors">{t.name}</h3>
                <div className="mt-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  <span className="flex items-center gap-2"><Sword className="h-3.5 w-3.5 text-blue-500" /> {t.max_participants} Players</span>
                  <span className="text-white">{formatPKT(t.starts_at)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
