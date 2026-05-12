'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { 
  Trophy, 
  Plus, 
  Calendar, 
  Users, 
  Gift, 
  ShieldCheck, 
  Upload, 
  Loader2, 
  AlertCircle,
  CreditCard,
  Target
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CreateSeriesTournamentPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [sponsorFile, setSponsorFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rules: '',
    match_team_size: 4,
    min_team_members: 4,
    max_team_members: 6,
    bracket_size: 4,
    max_participants: 16,
    starts_at_date: '',
    starts_at_time: '',
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
    { rank: '1st Place', amount: '0', currency: 'Rupees' }
  ])

  const handleAddPrize = () => {
    setPrizePool([...prizePool, { rank: '', amount: '0', currency: 'Rupees' }])
  }

  const handleRemovePrize = (index: number) => {
    setPrizePool(prizePool.filter((_, i) => i !== index))
  }

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
          .upload(`tournaments/${Date.now()}-${file.name}`, file)
        if (uploadError) throw uploadError
        thumbnailUrl = uploadData.path
      }

      // Upload Sponsor Banner
      let sponsorBannerUrl = null
      if (sponsorFile) {
        const { data: sUploadData, error: sUploadError } = await supabase.storage
          .from('assets')
          .upload(`sponsors/${Date.now()}-${sponsorFile.name}`, sponsorFile)
        if (sUploadError) throw sUploadError
        sponsorBannerUrl = sUploadData.path
      }

      const starts_at = new Date(`${formData.starts_at_date}T${formData.starts_at_time}:00+05:00`).toISOString()
      const registration_ends_at = new Date(`${formData.registration_ends_at_date}T${formData.registration_ends_at_time}:00+05:00`).toISOString()

      const { error: insertError } = await supabase
        .from('series_tournaments')
        .insert({
          name: formData.name,
          description: formData.description,
          rules: formData.rules,
          match_team_size: formData.match_team_size,
          min_team_members: formData.min_team_members,
          max_team_members: formData.max_team_members,
          bracket_size: formData.bracket_size,
          max_participants: formData.max_participants,
          starts_at,
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

      router.push('/tournaments/series')
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
            Create <span className="gradient-text">Series</span>
          </h1>
          <p className="mt-2 text-muted-foreground">Launch a new team-based tournament event.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Basic Intel */}
          <section className="glass-card rounded-[2.5rem] p-8 md:p-12 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <Trophy className="h-5 w-5 text-orange-500" />
              <h3 className="font-display text-xl font-bold uppercase">Basic Intel</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Tournament Name</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="mt-2 w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm text-white focus:border-orange-500/50 focus:outline-none"
                  placeholder="e.g. Winter Clash 2024"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="mt-2 w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm text-white focus:border-orange-500/50 focus:outline-none resize-none"
                  placeholder="Brief overview of the event"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Bracket Size</label>
                  <select 
                    value={formData.bracket_size}
                    onChange={(e) => setFormData({...formData, bracket_size: parseInt(e.target.value)})}
                    className="mt-2 w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm text-white focus:border-orange-500/50 focus:outline-none appearance-none"
                  >
                    {[2, 4, 8, 16, 32].map(s => <option key={s} value={s}>{s} Teams</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Team Format</label>
                  <select 
                    value={formData.match_team_size}
                    onChange={(e) => setFormData({...formData, match_team_size: parseInt(e.target.value)})}
                    className="mt-2 w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm text-white focus:border-orange-500/50 focus:outline-none appearance-none"
                  >
                    {[1, 2, 4].map(s => <option key={s} value={s}>{s} Players</option>)}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Schedule & Limits */}
          <section className="glass-card rounded-[2.5rem] p-8 md:p-12 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <Calendar className="h-5 w-5 text-orange-500" />
              <h3 className="font-display text-xl font-bold uppercase">Deployment</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Start Date (PKT)</label>
                  <input
                    type="date"
                    required
                    value={formData.starts_at_date}
                    onChange={(e) => setFormData({...formData, starts_at_date: e.target.value})}
                    className="mt-2 w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm text-white focus:border-orange-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={formData.starts_at_time}
                    onChange={(e) => setFormData({...formData, starts_at_time: e.target.value})}
                    className="mt-2 w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm text-white focus:border-orange-500/50 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Reg End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.registration_ends_at_date}
                    onChange={(e) => setFormData({...formData, registration_ends_at_date: e.target.value})}
                    className="mt-2 w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm text-white focus:border-orange-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Reg End Time</label>
                  <input
                    type="time"
                    required
                    value={formData.registration_ends_at_time}
                    onChange={(e) => setFormData({...formData, registration_ends_at_time: e.target.value})}
                    className="mt-2 w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm text-white focus:border-orange-500/50 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Main Thumbnail</label>
                <label className="mt-2 relative flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-white/5 transition-all hover:border-orange-500/30 hover:bg-white/[0.07]">
                  {file ? <span className="text-[10px] font-bold text-orange-500">{file.name}</span> : <Upload className="h-6 w-6 text-muted-foreground" />}
                  <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </label>
              </div>
            </div>
          </section>

          {/* Rules & Prize Pool */}
          <section className="glass-card rounded-[2.5rem] p-8 md:p-12 space-y-6 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <Gift className="h-5 w-5 text-orange-500" />
                <h3 className="font-display text-xl font-bold uppercase">Rewards & Rules</h3>
              </div>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Detailed Rules</label>
                <textarea
                  required
                  rows={8}
                  value={formData.rules}
                  onChange={(e) => setFormData({...formData, rules: e.target.value})}
                  className="w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm text-white focus:border-orange-500/50 focus:outline-none resize-none"
                  placeholder="Paste tournament rules here..."
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Prize Breakdown</label>
                  <button type="button" onClick={handleAddPrize} className="text-[10px] font-bold uppercase tracking-widest text-orange-500 hover:text-orange-400">+ Add Rank</button>
                </div>
                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                  {prizePool.map((p, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input 
                        value={p.rank} 
                        onChange={(e) => {
                          const newPool = [...prizePool]
                          newPool[idx].rank = e.target.value
                          setPrizePool(newPool)
                        }}
                        placeholder="Rank" 
                        className="flex-1 rounded-xl bg-white/5 border border-white/5 px-4 py-2 text-xs text-white" 
                      />
                      <input 
                        value={p.amount} 
                        onChange={(e) => {
                          const newPool = [...prizePool]
                          newPool[idx].amount = e.target.value
                          setPrizePool(newPool)
                        }}
                        placeholder="Amt" 
                        className="w-20 rounded-xl bg-white/5 border border-white/5 px-4 py-2 text-xs text-white" 
                      />
                      <button type="button" onClick={() => handleRemovePrize(idx)} className="p-2 text-muted-foreground hover:text-red-500"><Plus className="h-4 w-4 rotate-45" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Sponsor & Entry Fee */}
          <section className="glass-card rounded-[2.5rem] p-8 md:p-12 space-y-6 lg:col-span-2">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <Target className="h-5 w-5 text-orange-500" />
                  <h3 className="font-display text-xl font-bold uppercase">Sponsorship</h3>
                </div>
                <div className="space-y-4">
                  <input
                    value={formData.sponsor_name}
                    onChange={(e) => setFormData({...formData, sponsor_name: e.target.value})}
                    placeholder="Sponsor Brand Name"
                    className="w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm text-white"
                  />
                  <input
                    value={formData.sponsor_hook}
                    onChange={(e) => setFormData({...formData, sponsor_hook: e.target.value})}
                    placeholder="Catchy Hook Line"
                    className="w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm text-white"
                  />
                  <label className="relative flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-white/5 transition-all">
                    {sponsorFile ? <span className="text-[10px] font-bold text-orange-500">{sponsorFile.name}</span> : <span className="text-[10px] font-bold uppercase text-muted-foreground">Sponsor Banner</span>}
                    <input type="file" className="hidden" onChange={(e) => setSponsorFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <CreditCard className="h-5 w-5 text-orange-500" />
                  <h3 className="font-display text-xl font-bold uppercase">Financials</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Entry Fee (PKR)</label>
                    <input
                      type="number"
                      value={formData.entry_fee}
                      onChange={(e) => setFormData({...formData, entry_fee: parseInt(e.target.value)})}
                      className="mt-2 w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm text-white"
                    />
                  </div>
                  <input
                    value={formData.payment_account_label}
                    onChange={(e) => setFormData({...formData, payment_account_label: e.target.value})}
                    placeholder="Account Type (e.g. Easypaisa)"
                    className="w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm text-white"
                  />
                  <input
                    value={formData.payment_account_number}
                    onChange={(e) => setFormData({...formData, payment_account_number: e.target.value})}
                    placeholder="Account Number"
                    className="w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm text-white"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {error && (
          <div className="flex items-center justify-center gap-3 text-red-500 text-sm font-bold uppercase bg-red-500/10 px-8 py-4 rounded-2xl border border-red-500/20">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        <div className="flex justify-center pt-10">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-96 flex items-center justify-center gap-3 rounded-[2rem] bg-orange-500 py-6 font-display text-2xl font-black uppercase tracking-widest text-white shadow-2xl shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="h-8 w-8 animate-spin" /> : (
              <>
                <ShieldCheck className="h-8 w-8" />
                Initialize Tournament
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
