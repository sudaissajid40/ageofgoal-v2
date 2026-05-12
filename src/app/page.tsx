import Link from 'next/link'
import { Trophy, Shield, Zap, Users, ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Hero Section */}
      <section className="relative flex w-full flex-col items-center justify-center overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.1),transparent_70%)]" />
        
        <div className="container px-4 text-center">
          <div className="inline-flex items-center rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-sm font-medium text-orange-500 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Zap className="mr-2 h-4 w-4" />
            <span>Age of Goal v2 is Live</span>
          </div>
          
          <h1 className="font-display text-5xl font-black uppercase tracking-tight md:text-7xl lg:text-8xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Dominate the <span className="gradient-text">Arena</span>
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            The next generation of competitive tournament management. Built for speed, scaled for glory.
          </p>
          
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-700">
            <Link 
              href="/login" 
              className="group relative flex h-14 items-center justify-center rounded-xl bg-orange-500 px-8 font-display font-bold uppercase tracking-widest text-white transition-all hover:bg-orange-600 hover:shadow-[0_0_20px_rgba(249,115,22,0.5)]"
            >
              Enter the Command Center
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <Link 
              href="/tournaments" 
              className="flex h-14 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-8 font-display font-bold uppercase tracking-widest transition-all hover:bg-white/10"
            >
              View Tournaments
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container px-4 py-24">
        <div className="grid gap-8 md:grid-cols-3">
          <FeatureCard 
            icon={<Trophy className="h-8 w-8" />}
            title="Pro Tournaments"
            description="Manage brackets, seeding, and payouts with surgical precision."
          />
          <FeatureCard 
            icon={<Shield className="h-8 w-8" />}
            title="Verified Status"
            description="Premium verification system ensures fair play and elite competition."
          />
          <FeatureCard 
            icon={<Users className="h-8 w-8" />}
            title="Squad Management"
            description="Build your legacy with seamless team creation and join codes."
          />
        </div>
      </section>
    </main>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass-card group relative overflow-hidden rounded-2xl p-8 card-glow">
      <div className="mb-4 inline-flex items-center justify-center text-orange-500 transition-transform group-hover:scale-110">
        {icon}
      </div>
      <h3 className="font-display text-xl font-bold uppercase">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  )
}
