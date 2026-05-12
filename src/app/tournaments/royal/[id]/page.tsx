'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import { 
  Sword, 
  CalendarDays, 
  Users2, 
  ChevronRight, 
  Wallet, 
  FileText,
  Gift,
  UserPlus
} from 'lucide-react'
import { formatPKT } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function RoyalTournamentDetailsPage() {
  const { id } = useParams()
  const router = useRouter()

  const { data: tournament, isLoading } = useQuery({
    queryKey: ['royal-tournament', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('royal_tournaments')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    },
  })

  if (isLoading) return <div className="h-96 animate-pulse rounded-3xl bg-white/5" />
  if (!tournament) return <div className="text-center py-20 text-muted-foreground">Tournament not found.</div>

  return (
    <div className="space-y-10 pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#121217]">
        <div className="absolute inset-0 z-0">
          <img 
            src={tournament.thumbnail_url || ''} 
            alt="" 
            className="h-full w-full object-cover opacity-20 blur-2xl scale-110" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121217] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col gap-8 p-8 md:flex-row md:items-center md:p-12">
          <div className="h-48 w-48 flex-none overflow-hidden rounded-3xl border border-white/10 shadow-2xl md:h-64 md:w-64">
            <img 
              src={tournament.thumbnail_url || ''} 
              alt={tournament.name} 
              className="h-full w-full object-cover" 
            />
          </div>

          <div className="flex-1 space-y-6">
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-blue-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-blue-400 border border-blue-500/20">
                Royal Battleground
              </span>
              <span className="rounded-full bg-blue-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-blue-400 border border-blue-500/20 capitalize">
                {tournament.type} Mode
              </span>
            </div>

            <h1 className="font-display text-4xl font-black uppercase tracking-tight md:text-6xl">
              {tournament.name}
            </h1>

            <div className="flex flex-wrap gap-8 text-sm text-muted-foreground">
              <div className="flex items-center">
                <CalendarDays className="mr-2 h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-bold">Match Time</p>
                  <p className="text-white font-medium">{formatPKT(tournament.match_starts_at)}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Users2 className="mr-2 h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-bold">Registration</p>
                  <p className="text-white font-medium">Public & Anonymous</p>
                </div>
              </div>
              <div className="flex items-center">
                <Wallet className="mr-2 h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-bold">Entry Fee</p>
                  <p className="text-white font-medium">
                    {tournament.entry_fee > 0 ? `PKR ${tournament.entry_fee}` : 'FREE'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Details & Rules */}
        <div className="lg:col-span-2 space-y-8">
          <section className="glass-card rounded-[2rem] p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                <FileText className="h-5 w-5" />
              </div>
              <h2 className="font-display text-2xl font-bold uppercase">Rules & Intel</h2>
            </div>
            <div className="prose prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{tournament.rules}</p>
            </div>
          </section>

          <section className="glass-card rounded-[2rem] p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                <Gift className="h-5 w-5" />
              </div>
              <h2 className="font-display text-2xl font-bold uppercase">Reward Pool</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.isArray(tournament.prize_pool) && tournament.prize_pool.map((prize: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="font-display text-2xl font-black text-blue-500/40">#{idx + 1}</div>
                    <div className="text-sm font-bold uppercase tracking-widest text-white">{prize.rank}</div>
                  </div>
                  <div className="text-xl font-black text-blue-400">
                    {prize.amount} <span className="text-[10px]">{prize.currency}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Sidebar Action */}
        <div className="space-y-6">
          <div className="sticky top-8 space-y-6">
            {/* Registration Card */}
            <div className="glass-card rounded-[2rem] p-8 border-blue-500/20 bg-blue-500/5 shadow-[0_0_50px_-12px_rgba(37,99,235,0.15)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl font-bold uppercase">Join Arena</h3>
                <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-bold text-green-500">Open</span>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Anonymous entry. No account needed. Just your UIDs and you're in.</p>
                <button 
                  onClick={() => router.push(`/tournaments/royal/${id}/register`)}
                  className="w-full rounded-2xl bg-blue-600 py-4 font-display text-lg font-black uppercase tracking-widest text-white shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <UserPlus className="h-5 w-5" />
                  Fast Register
                </button>
              </div>

              <div className="mt-6 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <span>Registration Ends</span>
                <span className="text-white">{formatPKT(tournament.registration_ends_at)}</span>
              </div>
            </div>

            {/* Sponsor Banner if exists */}
            {tournament.sponsor_name && (
              <div className="glass-card overflow-hidden rounded-[2rem] p-1 shadow-2xl">
                <div className="relative h-40 w-full overflow-hidden rounded-[1.8rem]">
                  <img src={tournament.sponsor_banner_url || ''} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Official Partner</p>
                    <h4 className="mt-1 font-display text-xl font-black uppercase text-white">{tournament.sponsor_name}</h4>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{tournament.sponsor_hook}</p>
                    <a 
                      href={tournament.sponsor_cta_url} 
                      target="_blank" 
                      className="mt-4 flex items-center rounded-full bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-black transition-all hover:scale-105 active:scale-95"
                    >
                      {tournament.sponsor_cta_label} <ChevronRight className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
