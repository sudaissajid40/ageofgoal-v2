'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Megaphone, 
  Upload, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  Trash2,
  Bell
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/lib/utils'

export default function AdminBannersPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cta_label: '',
    cta_url: ''
  })

  const { data: currentBanner, refetch } = useQuery({
    queryKey: ['admin-active-banner'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      return data
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      let imageUrl = null
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `banners/${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('assets')
          .upload(fileName, file)
        
        if (uploadError) throw uploadError
        imageUrl = fileName
      }

      // Trigger deactivates old automatically via DB trigger
      const { error: insertError } = await supabase
        .from('banners')
        .insert({
          ...formData,
          image_url: imageUrl,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })

      if (insertError) throw insertError

      setFormData({ title: '', description: '', cta_label: '', cta_url: '' })
      setFile(null)
      alert('Banner published! Push notification would be triggered here.')
      await refetch()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this banner?')) return
    await supabase.from('banners').update({ is_active: false }).eq('id', id)
    await refetch()
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div>
        <h1 className="font-display text-4xl font-black uppercase tracking-tight">
          Announcement <span className="gradient-text">Central</span>
        </h1>
        <p className="mt-2 text-muted-foreground">Manage site-wide banners and trigger push notifications.</p>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Create Form */}
        <section className="glass-card rounded-[2.5rem] p-8 md:p-12 space-y-8 h-fit">
          <div className="flex items-center gap-4 border-b border-white/5 pb-6">
            <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-orange-500 text-white shadow-xl shadow-orange-500/20">
              <Megaphone className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold uppercase">New Broadcast</h3>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Replaces current active banner</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Banner Title</label>
                <input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="mt-2 w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm text-white focus:border-orange-500/50 focus:outline-none"
                  placeholder="e.g. New Tournament Live!"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Brief Description</label>
                <textarea
                  required
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="mt-2 w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm text-white focus:border-orange-500/50 focus:outline-none resize-none"
                  placeholder="Catchy text for the announcement bar"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">CTA Label (Opt)</label>
                  <input
                    value={formData.cta_label}
                    onChange={(e) => setFormData({...formData, cta_label: e.target.value})}
                    className="mt-2 w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm text-white focus:border-orange-500/50 focus:outline-none"
                    placeholder="Register Now"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">CTA URL (Opt)</label>
                  <input
                    value={formData.cta_url}
                    onChange={(e) => setFormData({...formData, cta_url: e.target.value})}
                    className="mt-2 w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm text-white focus:border-orange-500/50 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Banner Image (Opt)</label>
                <label className="mt-3 relative flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-white/5 transition-all hover:border-orange-500/30 hover:bg-white/[0.07]">
                  {file ? (
                    <div className="flex flex-col items-center gap-1">
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                      <p className="text-[10px] font-bold text-white uppercase tracking-widest">{file.name}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Upload className="h-6 w-6" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">Upload Banner Asset</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </label>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-xs font-medium text-red-500">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 rounded-2xl bg-orange-500 py-5 font-display text-lg font-black uppercase tracking-widest text-white shadow-xl shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                <>
                  <Bell className="h-5 w-5" />
                  Publish & Alert Users
                </>
              )}
            </button>
          </form>
        </section>

        {/* Current Banner Preview */}
        <div className="space-y-8">
          <section className="glass-card rounded-[2.5rem] p-8 md:p-12 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
              <h3 className="font-display text-xl font-bold uppercase">Live Preview</h3>
              {currentBanner && (
                <span className="rounded-full bg-green-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-green-500 border border-green-500/20">
                  Currently Active
                </span>
              )}
            </div>

            {currentBanner ? (
              <div className="space-y-6">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-orange-600 px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-white">{currentBanner.title}</p>
                    <p className="text-xs text-white/80">{currentBanner.description}</p>
                  </div>
                  {currentBanner.cta_label && (
                    <div className="rounded-full bg-black/20 px-4 py-1.5 text-[10px] font-bold text-white border border-white/10">
                      {currentBanner.cta_label}
                    </div>
                  )}
                </div>

                <div className="grid gap-4 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Published</span>
                    <span className="text-white font-bold">{new Date(currentBanner.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CTA Link</span>
                    <span className="text-white font-bold truncate max-w-[200px]">{currentBanner.cta_url || 'N/A'}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(currentBanner.id)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 py-4 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                  Deactivate Banner
                </button>
              </div>
            ) : (
              <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 text-muted-foreground italic">
                No active banner. Site is quiet.
              </div>
            )}
          </section>

          <div className="glass-card rounded-[2.5rem] p-8 bg-blue-500/5 border-blue-500/10">
            <h4 className="font-display text-lg font-bold uppercase mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-500" />
              Push Distribution
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When you publish a banner, it is automatically sent to all subscribed browsers (including anonymous visitors). 
              This is a high-impact action—use it for major tournament announcements or breaking news only.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
