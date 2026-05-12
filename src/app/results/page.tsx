'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Trophy, Medal, Star, ArrowRight, Loader2, Calendar } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function ResultsPage() {
  const { data: results, isLoading } = useQuery({
    queryKey: ['tournament-results'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('series_tournaments')
        .select(`
          *,
          series_registrations (
            id,
            team_name,
            payment_status
          )
        `)
        .eq('status', 'completed')
        .order('starts_at', { ascending: false })
      
      if (error) throw error
      return data
    },
    staleTime: 0
  })

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
        <p className="font-display text-xs font-black uppercase tracking-widest text-muted-foreground">Syncing Hall of Fame...</p>
      </div>
    )
  }

  return (
    <div className="space-y-12 pb-24">
      <div>
        <h1 className="font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
          Tournament <span className="gradient-text">Hall of Fame</span>
        </h1>
        <p className="mt-2 text-muted-foreground">The ultimate record of victory and elite performance.</p>
      </div>

      {results?.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 text-center px-6">
          <Star className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground italic">No historical data found. The next champion could be you.</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {results?.map((t) => (
            <div key={t.id} className="glass-card group overflow-hidden rounded-[2.5rem] border border-white/5 transition-all hover:border-orange-500/30">
              <div className="flex flex-col lg:flex-row">
                {/* Tournament Info */}
                <div className="relative h-48 lg:h-auto lg:w-72 overflow-hidden shrink-0">
                  {t.thumbnail_url ? (
                    <img 
                      src={t.thumbnail_url.startsWith('http') ? t.thumbnail_url : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/${t.thumbnail_url}`} 
                      className="h-full w-full object-cover opacity-60" 
                      alt="" 
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-white/5">
                      <Trophy className="h-16 w-16 text-orange-500/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121217] lg:bg-gradient-to-r via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="flex-1 p-8 md:p-12">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-3 text-orange-500 text-[10px] font-black uppercase tracking-widest mb-2">
                        <Medal className="h-4 w-4" /> Final Results
                      </div>
                      <h2 className="font-display text-3xl font-bold uppercase">{t.name}</h2>
                      <p className="mt-2 text-sm text-muted-foreground max-w-xl">{t.description}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tournament End</p>
                      <p className="text-sm font-bold text-white">{new Date(t.starts_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Champion Card */}
                    <div className="rounded-2xl bg-orange-500/10 border border-orange-500/20 p-6 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                        <Trophy className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-orange-500">Champion</p>
                        <p className="font-display text-xl font-bold uppercase text-white">Winner Pending</p>
                      </div>
                    </div>

                    <Link 
                      href={`/tournaments/series/${t.id}`}
                      className="flex items-center justify-between rounded-2xl bg-white/5 border border-white/5 p-6 hover:bg-white/10 transition-all"
                    >
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Event Intel</p>
                        <p className="font-bold text-white uppercase">Full Bracket</p>
                      </div>
                      <ArrowRight className="h-6 w-6 text-orange-500" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
