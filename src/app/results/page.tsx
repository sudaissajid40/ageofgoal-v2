'use client'

import { BarChart3, Construction } from 'lucide-react'

export default function ResultsPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 rounded-full bg-orange-500/10 p-6 text-orange-500 ring-1 ring-orange-500/20">
        <BarChart3 className="h-12 w-12" />
      </div>
      <h1 className="font-display text-4xl font-black uppercase tracking-tight text-white">Results <span className="gradient-text">Portal</span></h1>
      <p className="mt-4 max-w-md text-muted-foreground">We are refining the results system for v2. This page is currently under construction and will be live shortly.</p>
      
      <div className="mt-12 flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        <Construction className="h-4 w-4 text-orange-500" /> System Integration in Progress
      </div>
    </div>
  )
}
