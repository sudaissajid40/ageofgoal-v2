'use client'

import { Calendar, Construction } from 'lucide-react'

export default function SchedulePage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 rounded-full bg-blue-500/10 p-6 text-blue-500 ring-1 ring-blue-500/20">
        <Calendar className="h-12 w-12" />
      </div>
      <h1 className="font-display text-4xl font-black uppercase tracking-tight text-white">Event <span className="gradient-text-blue">Schedule</span></h1>
      <p className="mt-4 max-w-md text-muted-foreground">The master calendar for all Series and Royal events is being synchronized.</p>
      
      <div className="mt-12 flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        <Construction className="h-4 w-4 text-blue-500" /> Synchronization in Progress
      </div>
    </div>
  )
}
