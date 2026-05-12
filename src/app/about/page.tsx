import { Mail, Instagram, MessageCircle, Shield, Trophy, Users, Download, Bell, Smartphone, Megaphone, ExternalLink, Flame, ShieldCheck, Zap } from "lucide-react";

const SUPPORT_TEAM = [
  { name: "Tournament Ops", role: "Match scheduling & results", icon: Trophy },
  { name: "Verification Desk", role: "Account & UID verification", icon: Shield },
  { name: "Community Team", role: "Players, teams & disputes", icon: Users },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-16 pb-20">
      {/* Header */}
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-4 py-1.5 backdrop-blur-sm">
          <Flame className="h-4 w-4 text-primary" />
          <span className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Elite Command Center</span>
        </div>
        <h1 className="font-display text-4xl font-black uppercase tracking-tight sm:text-6xl">
          About <span className="gradient-text">AOG v2</span>
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
          Age of Goal (AOG) is the next generation of competitive mobile esports. Built for verified players and elite squads, we provide a burdenless, high-performance platform for Free Fire tournaments.
        </p>
      </header>

      {/* Verification Instructions - Restored and Updated */}
      <section className="rounded-3xl border border-primary/30 bg-primary/5 p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <ShieldCheck className="h-32 w-32 text-primary" />
        </div>
        <div className="relative z-10 space-y-6">
          <h2 className="font-display text-2xl font-black uppercase tracking-wide">Identity <span className="text-primary">Verification</span></h2>
          <div className="space-y-4 text-muted-foreground">
            <p>To compete in official Series tournaments, your account must be verified. Follow these exact steps:</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/5 bg-background/50 p-5">
                <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Step 1: In-Game Request</div>
                <p className="text-sm">Send a friend request to UID: <span className="font-mono font-bold text-white tracking-wider">15568897940</span></p>
              </div>
              <div className="rounded-xl border border-white/5 bg-background/50 p-5">
                <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Step 2: Profile Match</div>
                <p className="text-sm">Ensure your AOG callsign matches your Free Fire name: <span className="font-mono font-bold text-white tracking-wider">age_of_goal</span></p>
              </div>
            </div>
            <p className="text-xs italic">Verification is usually processed within 24 hours by our Verification Desk.</p>
          </div>
        </div>
      </section>

      {/* Support Team */}
      <section className="space-y-8">
        <h2 className="font-display text-2xl font-black uppercase tracking-wide">Command <span className="text-primary">Staff</span></h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {SUPPORT_TEAM.map(({ name, role, icon: Icon }) => (
            <div key={name} className="glass-card rounded-2xl border border-white/5 p-6 text-center card-glow">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <div className="font-display text-sm font-bold uppercase tracking-wider">{name}</div>
              <div className="mt-1 text-[10px] font-medium uppercase text-muted-foreground tracking-widest">{role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Social & Support */}
      <section className="space-y-8">
        <h2 className="font-display text-2xl font-black uppercase tracking-wide">Connect <span className="text-primary">Direct</span></h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <a
            href="https://www.instagram.com/age_of_goal"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-5 transition-all hover:border-primary/50 hover:bg-primary/5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
              <Instagram className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="font-display text-sm font-bold uppercase tracking-wider">Instagram</div>
              <div className="truncate text-[10px] text-muted-foreground uppercase tracking-widest">@age_of_goal</div>
            </div>
          </a>
          <a
            href="https://discord.gg/vdHfDwVQ"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-5 transition-all hover:border-primary/50 hover:bg-primary/5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="font-display text-sm font-bold uppercase tracking-wider">Discord</div>
              <div className="truncate text-[10px] text-muted-foreground uppercase tracking-widest">Elite Server</div>
            </div>
          </a>
          <a
            href="mailto:ageofgoal@gmail.com"
            className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-5 transition-all hover:border-primary/50 hover:bg-primary/5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
              <Mail className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="font-display text-sm font-bold uppercase tracking-wider">Email</div>
              <div className="truncate text-[10px] text-muted-foreground uppercase tracking-widest">ageofgoal@gmail.com</div>
            </div>
          </a>
        </div>
      </section>

      {/* Sponsorship Banner - Restored */}
      <section className="rounded-3xl border border-primary/40 bg-gradient-to-br from-primary/20 via-card to-background p-10 shadow-2xl shadow-primary/10 relative overflow-hidden group">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Megaphone className="h-7 w-7 text-primary animate-bounce" />
              <h2 className="font-display text-3xl font-black uppercase tracking-tight">Become a <span className="gradient-text">Sponsor</span></h2>
            </div>
            <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
              Partner with the fastest-growing competitive platform. Reach thousands of verified players through prominent banner placements and tournament naming rights.
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                <Zap className="h-3 w-3" /> High Impact
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                <ShieldCheck className="h-3 w-3" /> Verified Reach
              </div>
            </div>
          </div>
          <a 
            href="https://discord.gg/ucYazXSa" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 rounded-md bg-primary px-10 py-5 font-display text-lg font-black uppercase tracking-widest text-primary-foreground shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 clip-tactical"
          >
            Partner Now <ExternalLink className="h-5 w-5" />
          </a>
        </div>
      </section>
    </div>
  );
}
