'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Calendar, Clock, Sword, Users, Loader2, Zap } from 'lucide-react'
import { formatPKT } from '@/lib/utils'

export default function SchedulePage() {
  const { data: matches, isLoading } = useQuery({
    queryKey: ['upcoming-matches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournament_matches')
        .select(`
          *,
          tournament:series_tournaments (name, match_team_size),
          team1:series_registrations!team1_id (team_name),
          team2:series_registrations!team2_id (team_name)
        `)
        .eq('status', 'scheduled')
        .order('scheduled_at', { ascending: true })
      
      if (error) throw error
      return data
    },
    staleTime: 0
  })

  const { data: upcomingTournaments } = useQuery({
    queryKey: ['upcoming-tournaments'],
    queryFn: async () => {
      const { data } = await supabase
        .from('series_tournaments')
        .select('*')
        .eq('status', 'open')
        .order('starts_at', { ascending: true })
      return data
    }
  })

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <p className="font-display text-xs font-black uppercase tracking-widest text-muted-foreground">Calibrating Match Timelines...</p>
      </div>
    )
  }

  return (
    <div className="space-y-12 pb-24">
      <div>
        <h1 className="font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
          Live <span className="gradient-text-blue">Deployment</span>
        </h1>
        <p className="mt-2 text-muted-foreground">The master schedule for upcoming Series and Royal matches.</p>
      </div>

      <div className="grid gap-12 lg:grid-cols-3">
        {/* Main Schedule Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <Zap className="h-5 w-5 text-blue-500" />
            <h3 className="font-display text-xl font-bold uppercase">Upcoming Battles</h3>
          </div>

          {matches?.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 text-center px-6">
              <Sword className="h-8 w-8 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground italic">No matches scheduled yet. Stand by for intel.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {matches?.map((m) => (
                <div key={m.id} className="glass-card flex items-center justify-between p-6 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="text-center shrink-0 border-r border-white/5 pr-6">
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">PKT</p>
                      <p className="text-lg font-bold text-white">{new Date(m.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">{m.tournament?.name || 'Tournament'}</p>
                      <div className="flex items-center gap-4">
                        <span className="font-display text-base font-bold uppercase text-white">{m.team1?.team_name || 'TBD'}</span>
                        <span className="text-[10px] font-black text-blue-500">VS</span>
                        <span className="font-display text-base font-bold uppercase text-white">{m.team2?.team_name || 'TBD'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <Users className="h-3.5 w-3.5 text-blue-500" /> {m.tournament?.match_team_size}v{m.tournament?.match_team_size}
                    </span>
                    <span className="mt-1 text-[9px] font-bold text-blue-500 uppercase">{formatPKT(m.scheduled_at).split('at')[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Intel */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <Calendar className="h-5 w-5 text-blue-500" />
            <h3 className="font-display text-xl font-bold uppercase">Event Launch</h3>
          </div>

          <div className="space-y-4">
            {upcomingTournaments?.map((t) => (
              <div key={t.id} className="glass-card p-6 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-2">Registration Open</p>
                <h4 className="font-display text-lg font-bold uppercase text-white">{t.name}</h4>
                <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase">
                  <span className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> {new Date(t.starts_at).toLocaleDateString()}</span>
                  <span className="text-white">PKR {t.entry_fee}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
