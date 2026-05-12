'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import { 
  Trophy, 
  CalendarDays, 
  Users, 
  ShieldAlert, 
  ChevronRight, 
  Wallet, 
  FileText,
  Gift
} from 'lucide-react'
import { formatPKT } from '@/lib/utils'
import { useUser } from '@/hooks/useUser'
import { cn } from '@/lib/utils'

export default function SeriesTournamentDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: user } = useUser()

  const { data: tournament, isLoading } = useQuery({
    queryKey: ['series-tournament', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('series_tournaments')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    },
  })

  const handleRegister = () => {
    if (!user) {
      router.push(`/login?redirect=/tournaments/series/${id}`)
      return
    }

    const profile = user.profile
    if (!profile?.profile_completed) {
      router.push(`/profile?redirect=/tournaments/series/${id}`)
      return
    }

    if (profile?.verification_status !== 'approved') {
      // Stay on page and show message or redirect to status page
      return
    }

    router.push(`/tournaments/series/${id}/register`)
  }

  if (isLoading) return <div className="h-96 animate-pulse rounded-3xl bg-white/5" />
  if (!tournament) return <div className="text-center py-20 text-muted-foreground">Tournament not found.</div>

  const isVerified = user?.profile?.verification_status === 'approved'
  const isCompleted = user?.profile?.profile_completed

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
              <span className="rounded-full bg-orange-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-orange-500 border border-orange-500/20">
                Series Tournament
              </span>
              <span className={cn(
                "rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest border",
                tournament.status === 'upcoming' ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
              )}>
                {tournament.status}
              </span>
            </div>

            <h1 className="font-display text-4xl font-black uppercase tracking-tight md:text-6xl">
              {tournament.name}
            </h1>

            <div className="flex flex-wrap gap-8 text-sm text-muted-foreground">
              <div className="flex items-center">
                <CalendarDays className="mr-2 h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-bold">Starts At</p>
                  <p className="text-white font-medium">{formatPKT(tournament.starts_at)}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-bold">Team Size</p>
                  <p className="text-white font-medium">{tournament.match_team_size} Players</p>
                </div>
              </div>
              <div className="flex items-center">
                <Wallet className="mr-2 h-5 w-5 text-orange-500" />
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
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                <FileText className="h-5 w-5" />
              </div>
              <h2 className="font-display text-2xl font-bold uppercase">Rules & Info</h2>
            </div>
            <div className="prose prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{tournament.rules}</p>
            </div>
          </section>

          <section className="glass-card rounded-[2rem] p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                <Gift className="h-5 w-5" />
              </div>
              <h2 className="font-display text-2xl font-bold uppercase">Prize Pool</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.isArray(tournament.prize_pool) && tournament.prize_pool.map((prize: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-orange-500/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="font-display text-2xl font-black text-orange-500/40">#{idx + 1}</div>
                    <div className="text-sm font-bold uppercase tracking-widest text-white">{prize.rank}</div>
                  </div>
                  <div className="text-xl font-black text-orange-500">
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
            <div className="glass-card rounded-[2rem] p-8 border-orange-500/20 bg-orange-500/5 shadow-[0_0_50px_-12px_rgba(249,115,22,0.15)]">
              <h3 className="font-display text-xl font-bold uppercase mb-4">Registration</h3>
              
              {!user ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground italic">Login is required to register for Series tournaments.</p>
                  <button 
                    onClick={handleRegister}
                    className="w-full rounded-2xl bg-orange-500 py-4 font-display text-lg font-black uppercase tracking-widest text-white shadow-xl shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Login to Join
                  </button>
                </div>
              ) : !isCompleted ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Your profile is incomplete. Please complete it to continue.</p>
                  <button 
                    onClick={handleRegister}
                    className="w-full rounded-2xl bg-orange-500 py-4 font-display text-lg font-black uppercase tracking-widest text-white shadow-xl shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Complete Profile
                  </button>
                </div>
              ) : !isVerified ? (
                <div className="space-y-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 p-4 text-center">
                  <ShieldAlert className="mx-auto h-8 w-8 text-yellow-500 mb-2" />
                  <p className="text-xs font-medium text-yellow-500 uppercase tracking-wider">Awaiting Verification</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Admin is reviewing your profile. You can register once your profile is approved.
                  </p>
                </div>
              ) : (
                <button 
                  onClick={handleRegister}
                  className="w-full rounded-2xl bg-orange-500 py-4 font-display text-lg font-black uppercase tracking-widest text-white shadow-xl shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Register Now
                </button>
              )}

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
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Official Partner</p>
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
