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
    }
  })

  const { data: royal } = useQuery({
    queryKey: ['home-royal'],
    queryFn: async () => {
      const { data } = await supabase
        .from('royal_tournaments')
        .select('*')
        .order('match_starts_at', { ascending: true })
        .limit(3)
      return data
    }
  })

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section - Restored from V1 */}
      <section className="relative -mt-10 md:-mt-12 overflow-hidden rounded-b-[3rem] border-b border-primary/20">
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/hero-arena.jpg" 
            alt="AOG arena" 
            className="h-full w-full object-cover opacity-50" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 sm:py-28 md:py-36">
          <div className="max-w-2xl animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="mb-8">
              <img 
                src="/icons/icon-512.png" 
                alt="AOG Logo" 
                className="h-24 w-24 rounded-2xl shadow-2xl shadow-primary/20 card-glow border border-primary/20" 
              />
            </div>
            
            <div className="inline-flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-4 py-1.5 backdrop-blur-sm shadow-lg shadow-primary/5">
              <Flame className="h-4 w-4 text-primary animate-pulse" />
              <span className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Top Mobile Esports</span>
            </div>
            
            <h1 className="mt-8 font-display text-5xl font-black uppercase leading-tight tracking-tight sm:text-7xl md:text-8xl">
              <span className="text-glow text-white">Age</span> <span className="text-white">of</span> <span className="gradient-text text-glow">Goal</span>
            </h1>
            
            <p className="mt-8 max-w-md text-base text-muted-foreground sm:text-lg leading-relaxed">
              Enter the ultimate Free Fire battleground. Build your profile, verify your identity, join a squad, and compete for AOG points.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
              <Link 
                href={user ? "/profile" : "/login"}
                className="group flex w-full sm:w-auto items-center justify-center gap-3 rounded-md bg-primary px-10 py-5 font-display text-xl font-black uppercase tracking-widest text-primary-foreground shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 clip-tactical"
              >
                {user ? "Enter Profile" : "Launch App"} <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              {!user && (
                <Link 
                  href="/login"
                  className="flex w-full sm:w-auto items-center justify-center gap-3 rounded-md border-2 border-white/10 bg-white/5 px-10 py-5 font-display text-xl font-black uppercase tracking-widest text-white transition-all hover:border-primary hover:text-primary clip-tactical"
                >
                  Log In
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-12 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
          <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Identity Verified</div>
          <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Instant Enlisting</div>
          <div className="flex items-center gap-2"><Trophy className="h-4 w-4 text-primary" /> Elite Rewards</div>
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
          <Link href="/tournaments/series" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary hover:text-white transition-colors">
            View All Series <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {series?.map((t) => (
            <Link key={t.id} href={`/tournaments/series/${t.id}`} className="glass-card group overflow-hidden rounded-xl border border-white/5 hover:border-primary/30 transition-all card-glow">
              <div className="relative aspect-[16/9] w-full overflow-hidden">
                {t.thumbnail_url ? (
                  <img src={t.thumbnail_url} alt="" className="h-full w-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-white/5">
                    <Trophy className="h-12 w-12 text-primary/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                <div className="absolute bottom-4 left-6">
                  <span className="rounded bg-primary px-2 py-1 text-[9px] font-bold text-primary-foreground uppercase tracking-widest">Enlisting</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-bold uppercase group-hover:text-primary transition-colors">{t.name}</h3>
                <div className="mt-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  <span className="flex items-center gap-2"><Users className="h-3.5 w-3.5 text-primary" /> {t.match_team_size}P Squad</span>
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
              Royal <span className="gradient-text-blue">Arena</span>
            </h2>
            <p className="mt-2 text-muted-foreground">Fast-track anonymous combat. No login required.</p>
          </div>
          <Link href="/tournaments/royal" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-500 hover:text-white transition-colors">
            Enter Arena <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {royal?.map((t) => (
            <Link key={t.id} href={`/tournaments/royal/${t.id}`} className="glass-card group overflow-hidden rounded-xl border border-white/5 hover:border-blue-500/30 transition-all card-glow-blue">
              <div className="relative aspect-[16/9] w-full overflow-hidden">
                {t.thumbnail_url ? (
                  <img src={t.thumbnail_url} alt="" className="h-full w-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-white/5">
                    <Sword className="h-12 w-12 text-blue-500/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                <div className="absolute bottom-4 left-6">
                  <span className="rounded bg-blue-600 px-2 py-1 text-[9px] font-bold text-white uppercase tracking-widest">Live Soon</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-bold uppercase group-hover:text-blue-500 transition-colors">{t.name}</h3>
                <div className="mt-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  <span className="flex items-center gap-2"><Sword className="h-3.5 w-3.5 text-blue-500" /> {t.type} Mode</span>
                  <span className="text-white">{formatPKT(t.match_starts_at)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
