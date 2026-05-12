'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { 
  Sword, 
  ShieldCheck, 
  Calendar, 
  Target, 
  Gift, 
  Upload, 
  Loader2, 
  AlertCircle,
  CreditCard,
  Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CreateRoyalTournamentPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [sponsorFile, setSponsorFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rules: '',
    type: 'squad' as 'solo' | 'duo' | 'squad',
    max_participants: 50,
    match_starts_at_date: '',
    match_starts_at_time: '',
    registration_ends_at_date: '',
    registration_ends_at_time: '',
    sponsor_name: '',
    sponsor_hook: '',
    sponsor_cta_label: '',
    sponsor_cta_url: '',
    entry_fee: 0,
    payment_account_label: '',
    payment_account_number: '',
    payment_instructions: ''
  })

  const [prizePool, setPrizePool] = useState<any[]>([
    { rank: 'Winner', amount: '0', currency: 'Rupees' }
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) throw new Error('Not authenticated')

      // Upload Thumbnail
      let thumbnailUrl = null
      if (file) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('assets')
          .upload(`royal/${Date.now()}-${file.name}`, file)
        if (uploadError) throw uploadError
        thumbnailUrl = uploadData.path
      }

      // Upload Sponsor Banner
      let sponsorBannerUrl = null
      if (sponsorFile) {
        const { data: sUploadData, error: sUploadError } = await supabase.storage
          .from('assets')
          .upload(`royal-sponsors/${Date.now()}-${sponsorFile.name}`, sponsorFile)
        if (sUploadError) throw sUploadError
        sponsorBannerUrl = sUploadData.path
      }

      const match_starts_at = new Date(`${formData.match_starts_at_date}T${formData.match_starts_at_time}:00+05:00`).toISOString()
      const registration_ends_at = new Date(`${formData.registration_ends_at_date}T${formData.registration_ends_at_time}:00+05:00`).toISOString()

      const { error: insertError } = await supabase
        .from('royal_tournaments')
        .insert({
          name: formData.name,
          description: formData.description,
          rules: formData.rules,
          type: formData.type,
          max_participants: formData.max_participants,
          match_starts_at,
          registration_ends_at,
          thumbnail_url: thumbnailUrl,
          sponsor_name: formData.sponsor_name,
          sponsor_hook: formData.sponsor_hook,
          sponsor_cta_label: formData.sponsor_cta_label,
          sponsor_cta_url: formData.sponsor_cta_url,
          sponsor_banner_url: sponsorBannerUrl,
          entry_fee: formData.entry_fee,
          payment_account_label: formData.payment_account_label,
          payment_account_number: formData.payment_account_number,
          payment_instructions: formData.payment_instructions,
          prize_pool: prizePool,
          created_by: user.id
        })

      if (insertError) throw insertError

      router.push('/tournaments/royal')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-black uppercase tracking-tight">
            Deploy <span className="gradient-text-blue">Royal</span>
          </h1>
          <p className="mt-2 text-muted-foreground">Launch a fast-track anonymous battle royale event.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Battle Intel */}
          <section className="glass-card rounded-[2.5rem] p-8 md:p-12 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <Sword className="h-5 w-5 text-blue-500" />
              <h3 className="font-display text-xl font-bold uppercase">Battle Intel</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Event Name</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="mt-2 w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm text-white focus:border-blue-500/50 focus:outline-none"
                  placeholder="e.g. Midnight Survival"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Mode</label>
                  <select 
                    value={formData.type}
                    aria-label="Tournament Mode"
                    onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                    className="mt-2 w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm text-white focus:border-blue-500/50 focus:outline-none appearance-none"
                  >
                    <option value="solo">Solo (1P)</option>
                    <option value="duo">Duo (2P)</option>
                    <option value="squad">Squad (4P)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Max Entries</label>
                  <input
                    type="number"
                    aria-label="Max Participants"
                    value={formData.max_participants}
                    onChange={(e) => setFormData({...formData, max_participants: parseInt(e.target.value)})}
                    className="mt-2 w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm text-white focus:border-blue-500/50"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Logistics */}
          <section className="glass-card rounded-[2.5rem] p-8 md:p-12 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <Calendar className="h-5 w-5 text-blue-500" />
              <h3 className="font-display text-xl font-bold uppercase">Logistics</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Match Date (PKT)</label>
                  <input
                    type="date"
                    required
                    aria-label="Match Date"
                    value={formData.match_starts_at_date}
                    onChange={(e) => setFormData({...formData, match_starts_at_date: e.target.value})}
                    className="mt-2 w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm text-white focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Match Time</label>
                  <input
                    type="time"
                    required
                    aria-label="Match Time"
                    value={formData.match_starts_at_time}
                    onChange={(e) => setFormData({...formData, match_starts_at_time: e.target.value})}
                    className="mt-2 w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm text-white focus:border-blue-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Event Thumbnail</label>
                <label className="mt-2 relative flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-white/5 transition-all hover:border-blue-500/30">
                  {file ? <span className="text-[10px] font-bold text-blue-400">{file.name}</span> : <Upload className="h-6 w-6 text-muted-foreground" />}
                  <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </label>
              </div>
            </div>
          </section>

          {/* Reward & Rules */}
          <section className="glass-card rounded-[2.5rem] p-8 md:p-12 space-y-6 lg:col-span-2">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Battle Rules</label>
                <textarea
                  required
                  rows={6}
                  value={formData.rules}
                  onChange={(e) => setFormData({...formData, rules: e.target.value})}
                  className="w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm text-white focus:border-blue-500/50"
                  placeholder="Paste rules..."
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Reward Pool</label>
                  <button type="button" onClick={() => setPrizePool([...prizePool, { rank: '', amount: '0', currency: 'Rupees' }])} className="text-[10px] font-bold uppercase text-blue-400 hover:text-blue-300">+ Add Rank</button>
                </div>
                <div className="space-y-3 max-h-[150px] overflow-y-auto pr-2">
                  {prizePool.map((p, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input value={p.rank} onChange={(e) => {
                        const newPool = [...prizePool]; newPool[idx].rank = e.target.value; setPrizePool(newPool)
                      }} placeholder="Rank" className="flex-1 rounded-xl bg-white/5 border border-white/5 px-4 py-2 text-xs text-white" />
                      <input value={p.amount} onChange={(e) => {
                        const newPool = [...prizePool]; newPool[idx].amount = e.target.value; setPrizePool(newPool)
                      }} placeholder="Amt" className="w-20 rounded-xl bg-white/5 border border-white/5 px-4 py-2 text-xs text-white" />
                      <button type="button" onClick={() => setPrizePool(prizePool.filter((_, i) => i !== idx))} className="text-muted-foreground hover:text-red-500"><Plus className="h-4 w-4 rotate-45" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Sponsor & Finance */}
          <section className="glass-card rounded-[2.5rem] p-8 md:p-12 space-y-6 lg:col-span-2">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <Target className="h-5 w-5 text-blue-500" />
                  <h3 className="font-display text-xl font-bold uppercase">Sponsorship</h3>
                </div>
                <input value={formData.sponsor_name} onChange={(e) => setFormData({...formData, sponsor_name: e.target.value})} placeholder="Sponsor Brand" className="w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm" />
                <input value={formData.sponsor_hook} onChange={(e) => setFormData({...formData, sponsor_hook: e.target.value})} placeholder="Catchy Hook" className="w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm" />
                <label className="relative flex h-20 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-white/5 transition-all">
                  {sponsorFile ? <span className="text-[10px] font-bold text-blue-400">{sponsorFile.name}</span> : <span className="text-[10px] font-bold uppercase text-muted-foreground">Sponsor Banner</span>}
                  <input type="file" className="hidden" onChange={(e) => setSponsorFile(e.target.files?.[0] || null)} />
                </label>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <CreditCard className="h-5 w-5 text-blue-500" />
                  <h3 className="font-display text-xl font-bold uppercase">Financials</h3>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Entry Fee (PKR)</label>
                  <input type="number" aria-label="Entry Fee" value={formData.entry_fee} onChange={(e) => setFormData({...formData, entry_fee: parseInt(e.target.value)})} className="mt-2 w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm" />
                </div>
                <input value={formData.payment_account_label} onChange={(e) => setFormData({...formData, payment_account_label: e.target.value})} placeholder="Account Type" className="w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm" />
                <input value={formData.payment_account_number} onChange={(e) => setFormData({...formData, payment_account_number: e.target.value})} placeholder="Account Number" className="w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm" />
              </div>
            </div>
          </section>
        </div>

        <div className="flex justify-center pt-10">
          <button
            type="submit"
            disabled={isSubmitting}
            aria-label="Initialize Tournament"
            className="w-full md:w-96 flex items-center justify-center gap-3 rounded-[2rem] bg-blue-600 py-6 font-display text-2xl font-black uppercase tracking-widest text-white shadow-2xl shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="h-8 w-8 animate-spin" /> : (
              <>
                <ShieldCheck className="h-8 w-8" />
                Deploy Battleground
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
