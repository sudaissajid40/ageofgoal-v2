'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button' // I'll create a simple button for now
import { Mail, Lock, Zap, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      setMessage(error.message)
      setLoading(false)
    } else {
      window.location.href = '/profile'
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 glass-card p-8 rounded-3xl premium-border shadow-2xl">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-white transition-colors mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          <h2 className="font-display text-3xl font-black uppercase tracking-tight">
            Command <span className="gradient-text">Center</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">Enter your credentials to engage.</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
              <input
                type="email"
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 outline-none focus:border-orange-500/50 transition-colors"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
              <input
                type="password"
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 outline-none focus:border-orange-500/50 transition-colors"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {message && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-500">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full h-14 items-center justify-center rounded-xl bg-orange-500 font-display font-bold uppercase tracking-widest text-white transition-all hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : (
              <>
                Engage Account
                <Zap className="ml-2 h-5 w-5 group-hover:animate-pulse" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/register" className="font-bold text-orange-500 hover:underline">
            Register for Glory
          </Link>
        </div>
      </div>
    </div>
  )
}
