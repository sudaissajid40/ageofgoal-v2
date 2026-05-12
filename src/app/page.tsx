'use client'

import Link from 'next/link'
import { Trophy, Sword, Users, ShieldCheck, ArrowRight, Star, Zap } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { formatPKT } from '@/lib/utils'

export default function HomePage() {
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
      {/* Hero Section */}
      <section className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden rounded-[3rem] border border-white/5 bg-[#121217] text-center px-6">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] bg-orange-500/5 blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-4xl space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Zap className="h-4 w-4 fill-orange-500" /> Version 2.0 Now Live
          </div>
          
          <h1 className="font-display text-5xl font-black uppercase tracking-tight md:text-8xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Ascend to <span className="gradient-text">Greatness</span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
            The next generation of competitive esports. Built for performance, designed for professionals, and accessible to everyone.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
            <Link 
              href="/tournaments/series"
              className="group flex w-full sm:w-auto items-center justify-center gap-3 rounded-2xl bg-orange-500 px-10 py-5 font-display text-xl font-black uppercase tracking-widest text-white shadow-2xl shadow-orange-500/20 transition-all hover:scale-105 active:scale-95"
            >
              Enter Series <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link 
              href="/tournaments/royal"
              className="flex w-full sm:w-auto items-center justify-center gap-3 rounded-2xl bg-white/5 border border-white/10 px-10 py-5 font-display text-xl font-black uppercase tracking-widest text-white transition-all hover:bg-white/10"
            >
              Royal Arena
            </Link>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-12 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
          <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-orange-500" /> Identity Verified</div>
          <div className="flex items-center gap-2"><Star className="h-4 w-4 text-orange-500" /> Premium Rewards</div>
          <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-orange-500" /> Instant Deployment</div>
        </div>
      </section>

      {/* Series Preview */}
      <section className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="font-display text-3xl font-black uppercase tracking-tight md:text-5xl">
              Series <span className="gradient-text">Elite</span>
            </h2>
            <p className="mt-2 text-muted-foreground">Premier team-based tournaments for verified squads.</p>
          </div>
          <Link href="/tournaments/series" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-500 hover:text-orange-400 transition-colors">
            View All Series <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {series?.map((t) => (
            <Link key={t.id} href={`/tournaments/series/${t.id}`} className="glass-card group overflow-hidden rounded-3xl border border-white/5 hover:border-orange-500/30 transition-all card-glow">
              <div className="relative h-48 w-full">
                <img src={t.thumbnail_url} alt="" className="h-full w-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121217] to-transparent" />
                <div className="absolute bottom-4 left-6">
                  <span className="rounded bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-widest">Upcoming</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-display text-lg font-bold uppercase group-hover:text-orange-500 transition-colors">{t.name}</h3>
                <div className="mt-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Trophy className="h-3 w-3 text-orange-500" /> {t.match_team_size}P Squad</span>
                  <span className="text-white">{formatPKT(t.starts_at)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Royal Preview */}
      <section className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="font-display text-3xl font-black uppercase tracking-tight md:text-5xl">
              Royal <span className="gradient-text-blue">Arena</span>
            </h2>
            <p className="mt-2 text-muted-foreground">Fast-track anonymous combat. No login required.</p>
          </div>
          <Link href="/tournaments/royal" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-500 hover:text-blue-400 transition-colors">
            Enter Arena <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {royal?.map((t) => (
            <Link key={t.id} href={`/tournaments/royal/${t.id}`} className="glass-card group overflow-hidden rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all card-glow-blue">
              <div className="relative h-48 w-full">
                <img src={t.thumbnail_url} alt="" className="h-full w-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121217] to-transparent" />
                <div className="absolute bottom-4 left-6">
                  <span className="rounded bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-widest">Join Fast</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-display text-lg font-bold uppercase group-hover:text-blue-500 transition-colors">{t.name}</h3>
                <div className="mt-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Sword className="h-3 w-3 text-blue-500" /> {t.type} Mode</span>
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

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}
