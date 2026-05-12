'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Sword, CalendarDays, Users2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { formatPKT } from '@/lib/utils'

export default function RoyalTournamentsPage() {
  const { data: tournaments, isLoading } = useQuery({
    queryKey: ['royal-tournaments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('royal_tournaments')
        .select('*')
        .order('match_starts_at', { ascending: true })
      
      if (error) throw error
      return data
    },
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
          Royal <span className="gradient-text">Battleground</span>
        </h1>
        <p className="mt-2 text-muted-foreground">Anonymous. Instant. Lethal. No registration required to browse.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-white/5 border border-white/5" />
          ))}
        </div>
      ) : tournaments?.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5">
          <Sword className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">The arena is quiet. New royal events coming soon!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tournaments?.map((t) => (
            <Link 
              key={t.id} 
              href={`/tournaments/royal/${t.id}`}
              className="glass-card group relative flex flex-col overflow-hidden rounded-2xl border border-white/5 transition-all hover:border-orange-500/30 card-glow"
            >
              {t.thumbnail_url && (
                <div className="relative h-48 w-full overflow-hidden">
                  <img 
                    src={t.thumbnail_url} 
                    alt={t.name} 
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121217] to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="rounded bg-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                      Royal
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-xl font-bold uppercase group-hover:text-blue-500 transition-colors">
                  {t.name}
                </h3>
                
                <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <CalendarDays className="mr-2 h-4 w-4 text-blue-500" />
                    {formatPKT(t.match_starts_at)}
                  </div>
                  <div className="flex items-center capitalize">
                    <Users2 className="mr-2 h-4 w-4 text-blue-500" />
                    {t.type}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-widest text-white">
                    {t.entry_fee > 0 ? (
                      <span className="text-blue-400">PKR {t.entry_fee} Entry</span>
                    ) : (
                      <span className="text-green-500">Free Entry</span>
                    )}
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 transition-colors group-hover:bg-blue-600">
                    <ArrowRight className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
