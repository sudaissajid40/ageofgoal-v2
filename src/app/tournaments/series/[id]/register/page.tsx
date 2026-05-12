'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { useQuery } from '@tanstack/react-query'
import { 
  Trophy, 
  Upload, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Users,
  ShieldCheck,
  CreditCard
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SeriesRegistrationPage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: user } = useUser()
  
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Fetch tournament and user's team
  const { data: tournament } = useQuery({
    queryKey: ['series-tournament-reg', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('series_tournaments')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    }
  })

  const { data: team } = useQuery({
    queryKey: ['my-team-reg', user?.id],
    queryFn: async () => {
      const { data: member } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user?.id)
        .single()
      if (!member) return null

      const { data: team } = await supabase
        .from('teams')
        .select('*, members:team_members(count)')
        .eq('id', member.team_id)
        .single()
      return team
    },
    enabled: !!user
  })

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !team || !tournament) return
    
    setIsSubmitting(true)
    setError(null)

    try {
      let receiptUrl = null
      if (tournament.entry_fee > 0) {
        if (!file) throw new Error('Payment receipt is required')
        
        const fileExt = file.name.split('.').pop()
        const fileName = `${id}/${team.id}-${Math.random()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(fileName, file)
        
        if (uploadError) throw uploadError
        receiptUrl = fileName
      }

      const { error: regError } = await supabase
        .from('series_registrations')
        .insert({
          tournament_id: id,
          team_id: team.id,
          registered_by: user.id,
          receipt_url: receiptUrl
        })

      if (regError) throw regError
      setSuccess(true)
      setTimeout(() => router.push(`/tournaments/series/${id}`), 3000)
    } catch (err: any) {
      setError(err.message || 'Registration failed. Is your team already registered?')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center text-center space-y-6">
        <div className="h-24 w-24 rounded-[2.5rem] bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 shadow-[0_0_50px_-12px_rgba(34,197,94,0.3)]">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <div>
          <h1 className="font-display text-4xl font-black uppercase tracking-tight">Deployment <span className="text-green-500">Confirmed</span></h1>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Your squad has been enlisted. Registration is instant. Redirecting to tournament details...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="text-center md:text-left">
        <h1 className="font-display text-4xl font-black uppercase tracking-tight">
          Squad <span className="gradient-text">Enlistment</span>
        </h1>
        <p className="mt-2 text-muted-foreground">Finalize your registration for {tournament?.name}.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-8">
          <form onSubmit={handleRegister} className="glass-card rounded-[2.5rem] p-8 md:p-12 space-y-8">
            {/* Team Info Section */}
            <div className="flex items-center gap-6 p-6 rounded-3xl bg-white/5 border border-white/5">
              <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-orange-500 text-white font-black text-2xl shadow-xl shadow-orange-500/20">
                {team?.name?.[0].toUpperCase()}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Enlisting Squad</p>
                <h3 className="font-display text-xl font-bold uppercase">{team?.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">Ready for {tournament?.match_team_size}-player format</p>
              </div>
            </div>

            {/* Payment Section */}
            {tournament?.entry_fee > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <CreditCard className="h-5 w-5 text-orange-500" />
                  <h3 className="font-display text-xl font-bold uppercase">Payment Details</h3>
                </div>

                <div className="rounded-3xl bg-orange-500/5 border border-orange-500/10 p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Account Type</span>
                    <span className="text-white font-bold">{tournament.payment_account_label}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Number</span>
                    <span className="text-2xl font-display font-black text-orange-500">{tournament.payment_account_number}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed italic border-t border-white/5 pt-4">
                    {tournament.payment_instructions}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Upload Receipt</label>
                  <label className="mt-3 relative flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-white/10 bg-white/5 transition-all hover:border-orange-500/30 hover:bg-white/[0.07]">
                    {file ? (
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                        <p className="text-xs font-bold text-white uppercase tracking-widest">{file.name}</p>
                        <button type="button" onClick={() => setFile(null)} className="text-[10px] text-muted-foreground hover:text-red-500">Change File</button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Select Image</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-xs font-medium text-red-500">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 rounded-[2rem] bg-orange-500 py-5 font-display text-xl font-black uppercase tracking-widest text-white shadow-2xl shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Confirm Registration'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-[2.5rem] p-8 space-y-6">
            <h3 className="font-display text-xl font-bold uppercase border-b border-white/5 pb-4">Checklist</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-green-500" />
                <span className="text-sm text-white font-medium">Identity Verified</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-green-500" />
                <span className="text-sm text-white font-medium">Squad Assembled</span>
              </div>
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-orange-500 animate-pulse" />
                <span className="text-sm text-muted-foreground">Ready for Deployment</span>
              </div>
            </div>
            <div className="h-px bg-white/5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed italic">
              Once confirmed, you are immediately registered. Admin will verify the receipt details later. Fraudulent uploads will result in permanent bans.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
