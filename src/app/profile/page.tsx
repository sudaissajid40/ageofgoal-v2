'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { 
  User, 
  MapPin, 
  Gamepad2, 
  UserCircle, 
  Save, 
  Loader2, 
  AlertCircle,
  Clock,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react'
import { cn } from '@/lib/utils'

const GENDERS = ['Male', 'Female', 'Other']
const REGIONS = ['Pakistan', 'International']
const PLAY_STYLES = ['Aggressive', 'Passive', 'Sniper', 'Rusher', 'Supporter']
const MODES = ['Ranked', 'Classic', 'Clash Squad']

function ProfileContent() {
  const { data: user, isLoading: userLoading, refetch } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    username: '',
    level: 1,
    city: '',
    age: 18,
    gender: 'Male',
    region: 'Pakistan',
    play_style: 'Aggressive',
    preferred_mode: 'Ranked'
  })

  useEffect(() => {
    if (user?.profile) {
      setFormData({
        username: user.profile.username || '',
        level: user.profile.level || 1,
        city: user.profile.city || '',
        age: user.profile.age || 18,
        gender: user.profile.gender || 'Male',
        region: user.profile.region || 'Pakistan',
        play_style: user.profile.play_style || 'Aggressive',
        preferred_mode: user.profile.preferred_mode || 'Ranked'
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          ...formData,
          profile_completed: true,
          verification_status: 'pending' // Reset verification on update
        })
        .eq('id', user?.id)

      if (updateError) throw updateError

      await refetch()
      if (redirect) router.push(redirect)
      else alert('Profile updated and submitted for verification!')
    } catch (err: any) {
      setError(err.message || 'Failed to update profile. Check cooldown or fields.')
    } finally {
      setIsLoading(false)
    }
  }

  if (userLoading) return <div className="h-96 animate-pulse rounded-3xl bg-white/5" />
  if (!user) {
    router.push('/login')
    return null
  }

  const profile = user.profile
  const status = profile?.verification_status

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl font-black uppercase tracking-tight">
            My <span className="gradient-text">Identity</span>
          </h1>
          <p className="mt-2 text-muted-foreground">Complete your profile to unlock teams and tournaments.</p>
        </div>

        {/* Verification Status Badge */}
        <div className={cn(
          "flex items-center gap-3 rounded-2xl border px-6 py-3",
          status === 'approved' ? "bg-green-500/10 border-green-500/20 text-green-500" :
          status === 'rejected' ? "bg-red-500/10 border-red-500/20 text-red-500" :
          "bg-yellow-500/10 border-yellow-500/20 text-yellow-500"
        )}>
          {status === 'approved' ? <ShieldCheck className="h-5 w-5" /> : 
           status === 'rejected' ? <ShieldAlert className="h-5 w-5" /> : 
           <Clock className="h-5 w-5" />}
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none">Status</p>
            <p className="text-sm font-bold uppercase">{status || 'Not Started'}</p>
          </div>
        </div>
      </div>

      {status === 'rejected' && profile?.rejection_reason && (
        <div className="flex items-start gap-4 rounded-2xl bg-red-500/10 border border-red-500/20 p-6">
          <AlertCircle className="h-6 w-6 text-red-500 shrink-0" />
          <div>
            <p className="font-bold text-red-500 uppercase tracking-wider text-sm">Rejection Reason</p>
            <p className="text-sm text-red-400 mt-1">{profile.rejection_reason}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-8 md:grid-cols-2">
        {/* Basic Info */}
        <section className="glass-card rounded-[2rem] p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <UserCircle className="h-5 w-5 text-orange-500" />
            <h3 className="font-display text-xl font-bold uppercase">Basic Intel</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Username</label>
              <input
                required
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="mt-2 w-full rounded-2xl border border-white/5 bg-white/5 px-5 py-3 text-sm text-white focus:border-orange-500/50 focus:outline-none"
                placeholder="Game Name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Level (1-100)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  aria-label="Level"
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: parseInt(e.target.value)})}
                  className="mt-2 w-full rounded-2xl border border-white/5 bg-white/5 px-5 py-3 text-sm text-white focus:border-orange-500/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Age</label>
                <input
                  type="number"
                  required
                  aria-label="Age"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: parseInt(e.target.value)})}
                  className="mt-2 w-full rounded-2xl border border-white/5 bg-white/5 px-5 py-3 text-sm text-white focus:border-orange-500/50 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">City</label>
              <input
                required
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="mt-2 w-full rounded-2xl border border-white/5 bg-white/5 px-5 py-3 text-sm text-white focus:border-orange-500/50 focus:outline-none"
                placeholder="Your City"
              />
            </div>
          </div>
        </section>

        {/* Combat Profile */}
        <section className="glass-card rounded-[2rem] p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <Gamepad2 className="h-5 w-5 text-orange-500" />
            <h3 className="font-display text-xl font-bold uppercase">Combat Profile</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Gender</label>
              <select
                value={formData.gender}
                aria-label="Gender"
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                className="mt-2 w-full rounded-2xl border border-white/5 bg-white/5 px-5 py-3 text-sm text-white focus:border-orange-500/50 focus:outline-none appearance-none"
              >
                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Region</label>
              <select
                value={formData.region}
                aria-label="Region"
                onChange={(e) => setFormData({...formData, region: e.target.value})}
                className="mt-2 w-full rounded-2xl border border-white/5 bg-white/5 px-5 py-3 text-sm text-white focus:border-orange-500/50 focus:outline-none appearance-none"
              >
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Play Style</label>
              <div className="mt-3 flex flex-wrap gap-2">
                {PLAY_STYLES.map(style => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setFormData({...formData, play_style: style})}
                    className={cn(
                      "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border",
                      formData.play_style === style 
                        ? "bg-orange-500 border-orange-500 text-white" 
                        : "bg-white/5 border-white/5 text-muted-foreground hover:border-white/20"
                    )}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Submit Area */}
        <div className="md:col-span-2 flex flex-col items-center gap-6 pt-6">
          {error && (
            <div className="flex items-center gap-3 text-red-500 text-sm font-bold uppercase bg-red-500/10 px-6 py-3 rounded-2xl border border-red-500/20">
              <ShieldAlert className="h-5 w-5" />
              {error}
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground bg-white/5 px-6 py-3 rounded-full italic">
            <Clock className="h-4 w-4" />
            Edits reset your verification status and may trigger a cooldown.
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full md:w-80 flex items-center justify-center rounded-2xl bg-orange-500 py-5 font-display text-xl font-black uppercase tracking-widest text-white shadow-2xl shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
              <span className="flex items-center gap-3">
                <Save className="h-6 w-6" />
                Commit Identity
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="h-96 flex items-center justify-center animate-pulse text-muted-foreground">Syncing Identity...</div>}>
      <ProfileContent />
    </Suspense>
  )
}

