'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { 
  Sword, 
  Upload, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Hash,
  CreditCard,
  UserPlus
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function RoyalRegistrationPage() {
  const { id } = useParams()
  const router = useRouter()
  
  const [teamName, setTeamName] = useState('')
  const [playerUids, setPlayerUids] = useState<string[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { data: tournament } = useQuery({
    queryKey: ['royal-tournament-reg', id],
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

  useEffect(() => {
    if (tournament) {
      const count = tournament.type === 'solo' ? 1 : tournament.type === 'duo' ? 2 : 4
      setPlayerUids(new Array(count).fill(''))
    }
  }, [tournament])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tournament) return
    
    setIsSubmitting(true)
    setError(null)

    try {
      if (playerUids.some(uid => !uid.trim())) {
        throw new Error('All Free Fire UIDs are required')
      }

      let receiptUrl = null
      if (tournament.entry_fee > 0) {
        if (!file) throw new Error('Payment receipt is required')
        
        const fileExt = file.name.split('.').pop()
        const fileName = `royal/${id}/${teamName.replace(/\s+/g, '-')}-${Math.random()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(fileName, file)
        
        if (uploadError) throw uploadError
        receiptUrl = fileName
      }

      const { error: regError } = await supabase
        .from('royal_registrations')
        .insert({
          tournament_id: id,
          team_name: teamName,
          player_uids: playerUids,
          receipt_url: receiptUrl
        })

      if (regError) throw regError
      setSuccess(true)
      setTimeout(() => router.push(`/tournaments/royal/${id}`), 3000)
    } catch (err: any) {
      setError(err.message || 'Registration failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center text-center space-y-6">
        <div className="h-24 w-24 rounded-[2.5rem] bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_50px_-12px_rgba(37,99,235,0.3)]">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <div>
          <h1 className="font-display text-4xl font-black uppercase tracking-tight">Arena <span className="text-blue-400">Locked</span></h1>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            You are in! Anonymous registration confirmed. Redirecting to battleground details...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="text-center md:text-left">
        <h1 className="font-display text-4xl font-black uppercase tracking-tight">
          Fast <span className="gradient-text-blue">Deployment</span>
        </h1>
        <p className="mt-2 text-muted-foreground">Join the battleground for {tournament?.name}. No login required.</p>
      </div>

      <form onSubmit={handleRegister} className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-8">
          <section className="glass-card rounded-[2.5rem] p-8 md:p-12 space-y-8">
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/20">
                <UserPlus className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold uppercase">Player Intel</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">{tournament?.type} Registration</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Team / Solo Name</label>
                <input
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm text-white focus:border-blue-500/50 focus:outline-none transition-all"
                  placeholder={tournament?.type === 'solo' ? 'Your Gaming Name' : 'Squad Name'}
                />
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Free Fire UIDs</label>
                <div className="grid gap-4">
                  {playerUids.map((uid, idx) => (
                    <div key={idx} className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                      <input
                        required
                        value={uid}
                        onChange={(e) => {
                          const newUids = [...playerUids]
                          newUids[idx] = e.target.value
                          setPlayerUids(newUids)
                        }}
                        className="w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-3 pl-12 text-sm text-white focus:border-blue-500/50 focus:outline-none transition-all"
                        placeholder={`Player ${idx + 1} UID`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Payment Section */}
          {tournament?.entry_fee > 0 && (
            <section className="glass-card rounded-[2.5rem] p-8 md:p-12 space-y-8">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <CreditCard className="h-5 w-5 text-blue-500" />
                <h3 className="font-display text-xl font-bold uppercase">Payment Info</h3>
              </div>

              <div className="rounded-3xl bg-blue-500/5 border border-blue-500/10 p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Transfer To</span>
                  <span className="text-white font-bold">{tournament.payment_account_label}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Number</span>
                  <span className="text-2xl font-display font-black text-blue-400">{tournament.payment_account_number}</span>
                </div>
              </div>

              <label className="mt-3 relative flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-white/10 bg-white/5 transition-all hover:border-blue-500/30 hover:bg-white/[0.07]">
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                    <p className="text-xs font-bold text-white uppercase tracking-widest">{file.name}</p>
                    <button type="button" onClick={() => setFile(null)} className="text-[10px] text-muted-foreground hover:text-red-500">Change File</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-center px-4">Upload Receipt (Image)</p>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </label>
            </section>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-[2.5rem] p-8 space-y-6">
            <h3 className="font-display text-xl font-bold uppercase border-b border-white/5 pb-4">Royal Rules</h3>
            <div className="space-y-4 text-xs text-muted-foreground leading-relaxed">
              <p>• Registration is anonymous and instant.</p>
              <p>• Ensure all Free Fire UIDs are correct.</p>
              <p>• If paid, your spot is confirmed immediately upon receipt upload.</p>
              <p>• Admin will verify payment asynchronously.</p>
            </div>
            <div className="h-px bg-white/5" />
            
            {error && (
              <div className="flex items-center gap-3 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-xs font-medium text-red-500">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 rounded-[2rem] bg-blue-600 py-5 font-display text-xl font-black uppercase tracking-widest text-white shadow-2xl shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                <span className="flex items-center gap-2">
                  <Sword className="h-5 w-5" />
                  Join Battleground
                </span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
