'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import { 
  Sword, 
  Trash2, 
  CheckCircle2, 
  ExternalLink, 
  Loader2, 
  AlertCircle,
  Users2,
  Hash,
  Filter
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export default function AdminRoyalManagePage() {
  const { id } = useParams()
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'unverified' | 'verified'>('all')

  const { data: tournament } = useQuery({
    queryKey: ['admin-royal-tourney', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('royal_tournaments')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    }
  })

  const { data: registrations, isLoading, refetch } = useQuery({
    queryKey: ['admin-royal-registrations', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('royal_registrations')
        .select('*')
        .eq('tournament_id', id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    }
  })

  const handleVerify = async (regId: string) => {
    setProcessingId(regId)
    try {
      const { error } = await supabase
        .from('royal_registrations')
        .update({ is_verified: true })
        .eq('id', regId)
      
      if (error) throw error
      await refetch()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setProcessingId(null)
    }
  }

  const handleEliminate = async (regId: string) => {
    if (!confirm('Eliminate this registration? This action is permanent.')) return
    setProcessingId(regId)
    try {
      const { error } = await supabase
        .from('royal_registrations')
        .delete()
        .eq('id', regId)
      
      if (error) throw error
      await refetch()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setProcessingId(null)
    }
  }

  const filtered = registrations?.filter(r => {
    if (filter === 'unverified') return !r.is_verified
    if (filter === 'verified') return r.is_verified
    return true
  })

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl font-black uppercase tracking-tight">
            Arena <span className="gradient-text-blue">Command</span>
          </h1>
          <p className="mt-2 text-muted-foreground">Manage registrations for {tournament?.name}.</p>
        </div>

        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
          {(['all', 'unverified', 'verified'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all",
                filter === f ? "bg-blue-600 text-white" : "text-muted-foreground hover:text-white"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 animate-pulse rounded-3xl bg-white/5" />)}
        </div>
      ) : filtered?.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5">
          <Users2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground italic">No participants found in this sector.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered?.map((r) => (
            <div key={r.id} className="glass-card rounded-[2rem] border border-white/5 p-6 hover:border-blue-500/20 transition-all">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-1 space-y-4 w-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-xl font-bold uppercase text-white">{r.team_name}</h3>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Enlisted: {new Date(r.created_at).toLocaleString()}</p>
                    </div>
                    {r.is_verified ? (
                      <span className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-green-500 border border-green-500/20">
                        <CheckCircle2 className="h-3 w-3" /> Verified
                      </span>
                    ) : (
                      <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-yellow-500 border border-yellow-500/20">
                        Pending Verification
                      </span>
                    )}
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {r.player_uids.map((uid: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 border border-white/5">
                        <Hash className="h-3 w-3 text-blue-500" />
                        <span className="text-[11px] font-mono text-white/80">{uid}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                  {r.receipt_url && (
                    <a
                      href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/receipts/${r.receipt_url}`}
                      target="_blank"
                      className="p-3 rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:text-white transition-all"
                      title="View Receipt"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  )}
                  {!r.is_verified && (
                    <button
                      onClick={() => handleVerify(r.id)}
                      disabled={!!processingId}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl bg-green-500/10 border border-green-500/20 px-6 py-3 text-xs font-bold uppercase tracking-widest text-green-500 hover:bg-green-500 hover:text-white transition-all"
                    >
                      {processingId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      Verify
                    </button>
                  )}
                  <button
                    onClick={() => handleEliminate(r.id)}
                    disabled={!!processingId}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-6 py-3 text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
