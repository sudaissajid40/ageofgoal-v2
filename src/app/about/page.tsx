'use client'

import { Info, ShieldCheck, Zap, Users } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="space-y-24 pb-24">
      {/* Hero */}
      <section className="text-center space-y-6 pt-12">
        <h1 className="font-display text-5xl font-black uppercase tracking-tight md:text-7xl">
          Age of Goal <span className="gradient-text">v2</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed">
          The next evolution of esports management. Built on the principles of speed, fairness, and burdenless architecture.
        </p>
      </section>

      {/* Philosophy */}
      <div className="grid gap-8 md:grid-cols-3">
        <div className="glass-card rounded-3xl p-8 space-y-4">
          <Zap className="h-8 w-8 text-orange-500" />
          <h3 className="text-xl font-bold uppercase font-display">Burdenless</h3>
          <p className="text-sm text-muted-foreground">No complicated points systems or forced rankings. Just pure competition.</p>
        </div>
        <div className="glass-card rounded-3xl p-8 space-y-4">
          <ShieldCheck className="h-8 w-8 text-orange-500" />
          <h3 className="text-xl font-bold uppercase font-display">Verified</h3>
          <p className="text-sm text-muted-foreground">Identity verification ensures that every player in the Series is who they say they are.</p>
        </div>
        <div className="glass-card rounded-3xl p-8 space-y-4">
          <Users className="h-8 w-8 text-orange-500" />
          <h3 className="text-xl font-bold uppercase font-display">Community</h3>
          <p className="text-sm text-muted-foreground">From anonymous Royal arenas to elite Series leagues, there is a place for everyone.</p>
        </div>
      </div>
    </div>
  )
}
