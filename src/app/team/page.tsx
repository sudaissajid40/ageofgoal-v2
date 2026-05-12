'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { useQuery } from '@tanstack/react-query'
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Copy, 
  LogOut, 
  Loader2, 
  AlertCircle,
  Hash,
  Trophy,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function TeamPage() {
  const { data: user, isLoading: userLoading } = useUser()
  const router = useRouter()
  
  const [teamName, setTeamName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch current team
  const { data: teamData, isLoading: teamLoading, refetch: refetchTeam } = useQuery({
    queryKey: ['my-team', user?.id],
    queryFn: async () => {
      if (!user) return null
      
      // Get membership
      const { data: memberData, error: memberError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .single()
      
      if (memberError || !memberData) return null

      // Get team details
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select(`
          *,
          owner:profiles!teams_owner_id_fkey(username),
          members:team_members(
            user:profiles(id, username, level, verification_status)
          )
        `)
        .eq('id', memberData.team_id)
        .single()
      
      if (teamError) throw teamError
      return team
    },
    enabled: !!user
  })

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // 1. Create team (Trigger will auto-add owner as member)
      const code = Math.random().toString(36).substring(2, 8).toUpperCase()
      const { data, error: createError } = await supabase
        .from('teams')
        .insert({
          name: teamName,
          owner_id: user?.id,
          join_code: code
        })
        .select()
        .single()

      if (createError) throw createError
      
      await refetchTeam()
      setTeamName('')
    } catch (err: any) {
      setError(err.message || 'Failed to create team. Ensure your profile is verified.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // 1. Find team by code
      const { data: team, error: findError } = await supabase
        .from('teams')
        .select('id')
        .eq('join_code', joinCode.toUpperCase())
        .single()

      if (findError || !team) throw new Error('Invalid join code')

      // 2. Join team
      const { error: joinError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: user?.id
        })

      if (joinError) throw joinError

      await refetchTeam()
      setJoinCode('')
    } catch (err: any) {
      setError(err.message || 'Failed to join team.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLeaveTeam = async () => {
    if (!confirm('Are you sure you want to leave this team?')) return
    setIsLoading(true)
    
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('user_id', user?.id)
      
      if (error) throw error
      await refetchTeam()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (userLoading || teamLoading) return <div className="h-96 animate-pulse rounded-3xl bg-white/5" />
  
  if (!user) {
    router.push('/login')
    return null
  }

  const isVerified = user.profile?.verification_status === 'approved'

  if (!isVerified && !teamData) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-8 py-12">
        <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-[2rem] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 shadow-2xl">
          <ShieldCheck className="h-10 w-10" />
        </div>
        <div className="space-y-4">
          <h1 className="font-display text-4xl font-black uppercase tracking-tight">Verification <span className="text-yellow-500">Required</span></h1>
          <p className="text-muted-foreground leading-relaxed">
            To prevent spam and ensure fair play, only verified profiles can create or join teams. 
            Please complete your profile and wait for admin approval.
          </p>
          <button 
            onClick={() => router.push('/profile')}
            className="inline-flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            Check Profile Status <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl font-black uppercase tracking-tight">
            Team <span className="gradient-text">Barracks</span>
          </h1>
          <p className="mt-2 text-muted-foreground">Assemble your squad. Prepare for the series.</p>
        </div>
      </div>

      {teamData ? (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Team Overview Card */}
          <div className="lg:col-span-2 space-y-8">
            <section className="glass-card rounded-[2.5rem] p-8 md:p-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 mb-2">Active Squad</p>
                  <h2 className="font-display text-4xl font-black uppercase tracking-tight text-white">{teamData.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">Led by <span className="text-white font-bold">{teamData.owner?.username}</span></p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Team Power</p>
                    <p className="font-display text-2xl font-black text-white">{teamData.team_level}</p>
                  </div>
                  <div className="h-12 w-px bg-white/10" />
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Squad Size</p>
                    <p className="font-display text-2xl font-black text-white">{teamData.members?.length}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" /> Rostered Members
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {teamData.members?.map((m: any) => (
                    <div key={m.user.id} className="flex items-center gap-4 rounded-2xl bg-white/5 border border-white/5 p-4 hover:border-orange-500/20 transition-all">
                      <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 font-bold">
                        {m.user.username?.[0].toUpperCase()}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-bold text-sm truncate">{m.user.username}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Level {m.user.level}</p>
                      </div>
                      {m.user.id === teamData.owner_id && (
                        <div title="Team Leader">
                          <ShieldCheck className="h-4 w-4 text-orange-500" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Action Sidebar */}
          <div className="space-y-6">
            <div className="glass-card rounded-[2rem] p-8 border-orange-500/10">
              <h3 className="font-display text-xl font-bold uppercase mb-4">Barracks Access</h3>
              <div className="space-y-4">
                <div className="rounded-2xl bg-white/5 border border-white/5 p-4 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Join Code</p>
                  <div className="flex items-center justify-center gap-3">
                    <code className="text-2xl font-display font-black tracking-widest text-orange-500">{teamData.join_code}</code>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(teamData.join_code)
                        alert('Code copied!')
                      }}
                      aria-label="Copy Join Code"
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-all"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-center text-muted-foreground leading-relaxed px-4">
                  Share this code with your teammates. They must be verified to join.
                </p>
                <div className="h-px bg-white/5 my-2" />
                <button 
                  onClick={handleLeaveTeam}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 py-3 text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all"
                >
                  <LogOut className="h-4 w-4" /> {user.id === teamData.owner_id ? 'Disband Team' : 'Leave Team'}
                </button>
              </div>
            </div>

            <div className="glass-card rounded-[2rem] p-8 border-orange-500/10 bg-orange-500/5">
              <Trophy className="h-8 w-8 text-orange-500 mb-4" />
              <h3 className="font-display text-xl font-bold uppercase mb-2">Ready for War?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                Your squad is ready. Head over to the Series tournaments to register your team.
              </p>
              <button 
                onClick={() => router.push('/tournaments/series')}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-xl shadow-orange-500/20 hover:scale-105 transition-all"
              >
                Browse Tournaments <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {/* Create Team Form */}
          <section className="glass-card rounded-[2.5rem] p-8 md:p-12 space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-orange-500 text-white shadow-xl shadow-orange-500/20">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-black uppercase">Found a Squad</h2>
                <p className="text-sm text-muted-foreground">Start your own legacy.</p>
              </div>
            </div>

            <form onSubmit={handleCreateTeam} className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Team Name</label>
                <input
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm text-white focus:border-orange-500/50 focus:outline-none transition-all"
                  placeholder="e.g. Shadow Reapers"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 rounded-2xl bg-orange-500 py-5 font-display text-lg font-black uppercase tracking-widest text-white shadow-xl shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Create Team'}
              </button>
            </form>
          </section>

          {/* Join Team Form */}
          <section className="glass-card rounded-[2.5rem] p-8 md:p-12 space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/10 text-white">
                <UserPlus className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-black uppercase">Join a Squad</h2>
                <p className="text-sm text-muted-foreground">Enter a code to enlist.</p>
              </div>
            </div>

            <form onSubmit={handleJoinTeam} className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Join Code</label>
                <div className="relative mt-2">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    required
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 pl-12 text-sm text-white focus:border-orange-500/50 focus:outline-none transition-all"
                    placeholder="ABC123"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 py-5 font-display text-lg font-black uppercase tracking-widest text-white transition-all hover:bg-white/10 active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Join Squad'}
              </button>
            </form>
          </section>

          {error && (
            <div className="md:col-span-2 flex items-center justify-center gap-3 text-red-500 text-sm font-bold uppercase bg-red-500/10 px-8 py-4 rounded-2xl border border-red-500/20">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
