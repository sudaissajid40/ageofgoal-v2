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
  const [activeTab, setActiveTab] = useState<'profiles' | 'payments'>('profiles')
  const [searchTerm, setSearchTerm] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  // Fetch Profiles
  const { data: pendingUsers, isLoading: loadingProfiles, refetch: refetchProfiles } = useQuery({
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
    },
    enabled: activeTab === 'profiles'
  })

  // Fetch Payments (Unified from Series and Royal)
  const { data: pendingPayments, isLoading: loadingPayments, refetch: refetchPayments } = useQuery({
    queryKey: ['admin-pending-payments'],
    queryFn: async () => {
      const [series, royal] = await Promise.all([
        supabase.from('series_registrations').select('*, tournament:series_tournaments(name), team:teams(name)').eq('payment_status', 'pending'),
        supabase.from('royal_registrations').select('*, tournament:royal_tournaments(name)').eq('payment_status', 'pending')
      ])

      const seriesData = (series.data || []).map(r => ({ 
        ...r, 
        type: 'series' as const,
        display_name: (r as any).tournament?.name || 'Unknown Tournament',
        participant_name: (r as any).team?.name || 'Unknown Team'
      }))

      const royalData = (royal.data || []).map(r => ({ 
        ...r, 
        type: 'royal' as const,
        display_name: (r as any).tournament?.name || 'Unknown Arena',
        participant_name: (r as any).team_name || 'Solo Player'
      }))

      const combined = [...seriesData, ...royalData]
      return combined.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    },
    enabled: activeTab === 'payments'
  })

  const handleProfileAction = async (userId: string, status: 'approved' | 'rejected') => {
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
      await refetchProfiles()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setProcessingId(null)
    }
  }

  const handlePaymentAction = async (regId: string, type: 'series' | 'royal', status: 'verified' | 'cancelled') => {
    setProcessingId(regId)
    try {
      const table = type === 'series' ? 'series_registrations' : 'royal_registrations'
      const { error } = await supabase
        .from(table)
        .update({ payment_status: status })
        .eq('id', regId)

      if (error) throw error
      await refetchPayments()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setProcessingId(null)
    }
  }

  const filteredProfiles = pendingUsers?.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const isLoading = activeTab === 'profiles' ? loadingProfiles : loadingPayments

  return (
    <div className="space-y-8 pb-20">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl font-black uppercase tracking-tight">
            Verification <span className="gradient-text">Center</span>
          </h1>
          <p className="mt-2 text-muted-foreground">Manage identities and tournament payments.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex rounded-xl bg-white/5 p-1">
            <button
              onClick={() => setActiveTab('profiles')}
              className={cn(
                "px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all rounded-lg",
                activeTab === 'profiles' ? "bg-orange-500 text-white shadow-lg" : "text-muted-foreground hover:text-white"
              )}
            >
              Profiles
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={cn(
                "px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all rounded-lg",
                activeTab === 'payments' ? "bg-orange-500 text-white shadow-lg" : "text-muted-foreground hover:text-white"
              )}
            >
              Payments
            </button>
          </div>

          {activeTab === 'profiles' && (
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 rounded-xl border border-white/5 bg-white/5 py-2 pl-10 pr-4 text-xs focus:border-orange-500/50 focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 animate-pulse rounded-3xl bg-white/5" />)}
        </div>
      ) : (
        <div className="grid gap-6">
          {activeTab === 'profiles' ? (
            filteredProfiles?.map((u) => (
              <div key={u.id} className="glass-card overflow-hidden rounded-[2rem] border border-white/5 transition-all hover:border-white/10">
                <div className="flex flex-col md:flex-row items-start md:items-center p-6 gap-6">
                  <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 font-display text-2xl font-black">
                    {u.username ? u.username[0].toUpperCase() : 'U'}
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
                      <p className="font-bold text-white">{new Date(u.last_edit_at || u.created_at).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">Edit #{u.edit_count}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <button onClick={() => handleProfileAction(u.id, 'approved')} disabled={!!processingId} className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3 text-xs font-bold uppercase tracking-widest text-green-500 hover:bg-green-500 hover:text-white transition-all">
                      {processingId === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Approve
                    </button>
                    <button onClick={() => setRejectingId(rejectingId === u.id ? null : u.id)} disabled={!!processingId} className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all">
                      <X className="h-4 w-4" /> Reject
                    </button>
                  </div>
                </div>
                {rejectingId === u.id && (
                  <div className="border-t border-white/5 bg-red-500/5 p-6">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                      <div className="flex-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-2 block">Reason</label>
                        <input type="text" placeholder="Specify reason..." value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} className="w-full rounded-xl border border-red-500/20 bg-black/40 px-4 py-3 text-sm text-white focus:outline-none" />
                      </div>
                      <button onClick={() => handleProfileAction(u.id, 'rejected')} disabled={!rejectionReason || processingId === u.id} className="w-full md:w-auto rounded-xl bg-red-500 px-8 py-3 text-xs font-black uppercase text-white">Confirm</button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            pendingPayments?.map((p) => (
              <div key={p.id} className="glass-card overflow-hidden rounded-[2rem] border border-white/5">
                <div className="flex flex-col md:flex-row items-start md:items-center p-6 gap-6">
                  <div className="h-16 w-24 flex items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
                    <button onClick={() => setPreviewImage(p.receipt_url)} className="relative group" title="View Receipt">
                      <img src={p.receipt_url} alt="Payment Receipt" className="h-full w-full object-cover rounded-xl opacity-60 group-hover:opacity-100 transition-all" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <Search className="h-5 w-5 text-white" />
                      </div>
                    </button>
                  </div>
                  <div className="flex-1 grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Tournament</p>
                      <p className="font-bold text-white">{p.display_name}</p>
                      <span className="text-[8px] font-bold uppercase px-2 py-0.5 rounded bg-white/5 text-muted-foreground">{p.type}</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Participant</p>
                      <p className="font-bold text-white">{p.participant_name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Submitted</p>
                      <p className="font-bold text-white">{new Date(p.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <button onClick={() => handlePaymentAction(p.id, p.type, 'verified')} disabled={!!processingId} className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3 text-xs font-bold uppercase tracking-widest text-green-500 hover:bg-green-500 hover:text-white transition-all">
                      <Check className="h-4 w-4" /> Approve
                    </button>
                    <button onClick={() => handlePaymentAction(p.id, p.type, 'cancelled')} disabled={!!processingId} className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all">
                      <X className="h-4 w-4" /> Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          {(activeTab === 'profiles' ? filteredProfiles : pendingPayments)?.length === 0 && (
            <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5">
              <ShieldCheck className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground italic">No pending {activeTab}. All clear!</p>
            </div>
          )}
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setPreviewImage(null)}>
          <img src={previewImage} alt="Receipt Preview" className="max-h-full max-w-full rounded-2xl shadow-2xl" />
          <button className="absolute top-8 right-8 text-white hover:text-orange-500 transition-colors" title="Close Preview">
            <X className="h-8 w-8" />
          </button>
        </div>
      )}
    </div>
  )
}
