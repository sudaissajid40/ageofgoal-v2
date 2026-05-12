'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { 
  ShieldCheck, 
  User, 
  Check, 
  X, 
  Loader2, 
  AlertCircle,
  Search,
  ChevronRight
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export default function AdminVerificationsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectingId, setRejectingId] = useState<string | null>(null)

  const { data: pendingUsers, isLoading, refetch } = useQuery({
    queryKey: ['admin-pending-verifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('verification_status', 'pending')
        .eq('profile_completed', true)
        .order('last_edit_at', { ascending: true })
      
      if (error) throw error
      return data
    }
  })

  const handleAction = async (userId: string, status: 'approved' | 'rejected') => {
    setProcessingId(userId)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          verification_status: status,
          rejection_reason: status === 'rejected' ? rejectionReason : null
        })
        .eq('id', userId)

      if (error) throw error
      
      setRejectingId(null)
      setRejectionReason('')
      await refetch()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setProcessingId(null)
    }
  }

  const filtered = pendingUsers?.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl font-black uppercase tracking-tight">
            Profile <span className="gradient-text">Verification</span>
          </h1>
          <p className="mt-2 text-muted-foreground">Review and validate user identities for tournament access.</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-white/5 bg-white/5 py-3 pl-12 pr-4 text-sm focus:border-orange-500/50 focus:outline-none"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 animate-pulse rounded-3xl bg-white/5" />)}
        </div>
      ) : filtered?.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5">
          <ShieldCheck className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground italic">No pending verifications. All clear!</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filtered?.map((u) => (
            <div key={u.id} className="glass-card overflow-hidden rounded-[2rem] border border-white/5 transition-all hover:border-white/10">
              <div className="flex flex-col md:flex-row items-start md:items-center p-6 gap-6">
                <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 font-display text-2xl font-black">
                  {u.username?.[0].toUpperCase()}
                </div>

                <div className="flex-1 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Identity</p>
                    <p className="font-bold text-white">{u.username}</p>
                    <p className="text-xs text-muted-foreground">Level {u.level} • {u.age}y/o</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Location</p>
                    <p className="font-bold text-white">{u.city}</p>
                    <p className="text-xs text-muted-foreground">{u.region}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Style</p>
                    <p className="font-bold text-white">{u.play_style}</p>
                    <p className="text-xs text-muted-foreground">{u.preferred_mode}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Submitted</p>
                    <p className="font-bold text-white">
                      {new Date(u.last_edit_at || u.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Edit #{u.edit_count}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={() => handleAction(u.id, 'approved')}
                    disabled={!!processingId}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3 text-xs font-bold uppercase tracking-widest text-green-500 hover:bg-green-500 hover:text-white transition-all disabled:opacity-50"
                  >
                    {processingId === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Approve
                  </button>
                  <button
                    onClick={() => setRejectingId(rejectingId === u.id ? null : u.id)}
                    disabled={!!processingId}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              </div>

              {/* Rejection Form Drawer */}
              {rejectingId === u.id && (
                <div className="border-t border-white/5 bg-red-500/5 p-6 animate-in slide-in-from-top-4 duration-300">
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-2 block">Reason for Rejection</label>
                      <input
                        type="text"
                        placeholder="e.g. Inappropriate name or fake stats"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full rounded-xl border border-red-500/20 bg-black/40 px-4 py-3 text-sm text-white focus:border-red-500/50 focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={() => handleAction(u.id, 'rejected')}
                      disabled={!rejectionReason || processingId === u.id}
                      className="w-full md:w-auto rounded-xl bg-red-500 px-8 py-3 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-red-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
