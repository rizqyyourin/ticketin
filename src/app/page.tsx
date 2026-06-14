import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Ticket,
  Layers,
  LayoutDashboard,
  Shield,
  Zap,
  TrendingUp,
  Globe,
  Settings,
  Check,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { featureMockups } from "@/components/landing/feature-mockups";

const features = [
  {
    title: "Omnichannel Inbox",
    description: "Consolidate every customer conversation into one sleek interface. Speed up response times by 40%.",
    points: ["Real-time message syncing", "One-click internal transfers"],
  },
  {
    title: "Smart Queueing",
    description: "Automated routing based on priority, SLA, and team capacity. No more lost tickets.",
    points: ["Dynamic priority sorting", "Load-balanced routing"],
  },
  {
    title: "Advanced RBAC",
    description: "Granular access controls for growing teams. Security and order, baked into the core.",
    points: ["Audit logs for every action", "Custom team permissions"],
  },
] as const;

const plans = [
  {
    name: "Starter",
    price: "$0",
    description: "Perfect for exploring the core features.",
    features: ["500 tickets/mo", "Basic Analytics", "Email Support"],
  },
  {
    name: "Pro",
    price: "$49",
    description: "Scale your team with advanced automation.",
    features: ["Unlimited tickets", "Advanced RBAC", "Priority SLA"],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Full control for large scale operations.",
    features: ["Dedicated Support", "Custom Integrations", "On-premise option"],
  },
];

const logos = [
  { name: "ATLAS", icon: Globe },
  { name: "NEXUS", icon: Zap },
  { name: "CORE", icon: Settings },
  { name: "VELOCITY", icon: TrendingUp },
  { name: "QUANTUM", icon: Layers },
  { name: "ZENITH", icon: Shield },
];

export default function Home() {
  return (
    <div className="relative min-h-screen bg-white selection:bg-primary/10 selection:text-primary dark:bg-zinc-950 overflow-x-hidden">
      {/* Minimalist Background Grid */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[400px] w-[400px] rounded-full bg-primary/20 opacity-30 blur-[120px] animate-pulse-slow" />
      </div>

      <main className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Navigation */}
        <nav className="flex items-center justify-between py-8 animate-fade-in">
          <div className="flex items-center gap-2 group cursor-pointer transition-all active:scale-95">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary transition-transform group-hover:rotate-6">
              <Ticket className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              ticketin<span className="text-primary">.</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-sm font-medium">Log in</Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="rounded-full bg-zinc-900 px-5 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pb-24 pt-20 lg:pt-32">
          <div className="flex flex-col items-center text-center">
            <h1 className="animate-rise max-w-4xl text-5xl font-bold tracking-tight text-zinc-900 sm:text-8xl dark:text-zinc-100 leading-[1]">
              Your best <span className="text-primary">Customer Experience</span>.
            </h1>
            
            <p className="animate-rise delay-100 mt-10 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              The modern customer service platform engineered for speed. 
              Focus on solving problems, not just managing messages.
            </p>

            <div className="animate-rise delay-200 mt-12 flex flex-wrap items-center justify-center gap-4">
              <Link href="/auth/signup">
                <Button size="lg" className="h-14 px-10 rounded-full text-lg shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                  Start Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Carousel Logos */}
          <div className="animate-rise delay-300 mt-32 relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white dark:from-zinc-950 to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white dark:from-zinc-950 to-transparent z-10" />
            <div className="flex items-center gap-16 animate-scroll-left whitespace-nowrap">
              {[...logos, ...logos].map((logo, i) => (
                <div key={i} className="flex items-center gap-2 text-xl font-bold text-zinc-300 dark:text-zinc-700 hover:text-primary transition-colors cursor-default grayscale hover:grayscale-0">
                  <logo.icon className="size-6" />
                  {logo.name}
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard Preview Mockup */}
          <div className="animate-rise delay-400 mt-32 relative mx-auto max-w-5xl group">
            <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-primary/20 to-primary/5 blur-2xl transition-all group-hover:blur-3xl" />
            <div className="relative rounded-2xl border border-zinc-200 bg-zinc-50/50 p-2 dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-900">
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-3 w-3 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-3 w-3 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                    <LayoutDashboard className="size-3" />
                    Real-time Metrics
                  </div>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-5 dark:border-zinc-900 dark:bg-zinc-900/50">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Unresolved</p>
                    <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">128</p>
                  </div>
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-5 dark:border-emerald-900/20 dark:bg-emerald-900/10">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Resolved Today</p>
                    <p className="mt-2 text-2xl font-bold text-emerald-600">842</p>
                  </div>
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Avg. Response</p>
                    <p className="mt-2 text-2xl font-bold text-primary">4m 12s</p>
                  </div>
                  <div className="rounded-xl border border-amber-100 bg-amber-50/30 p-5 dark:border-amber-900/20 dark:bg-amber-900/10">
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">SLA Status</p>
                    <p className="mt-2 text-2xl font-bold text-amber-600">98%</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                   <div className="rounded-xl border border-red-100 bg-red-50/30 p-5 dark:border-red-900/20 dark:bg-red-900/10">
                      <div className="flex items-center justify-between">
                         <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">SLA Breached</p>
                         <AlertCircle className="size-4 text-red-600" />
                      </div>
                      <p className="mt-2 text-2xl font-bold text-red-600">3</p>
                   </div>
                   <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-5 dark:border-zinc-900 dark:bg-zinc-900/30 flex items-center justify-between">
                      <div className="space-y-1">
                         <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">System Health</p>
                         <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Optimal</p>
                      </div>
                      <div className="flex gap-1">
                         {[1,2,3,4,5].map(i => <div key={i} className="h-8 w-1.5 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: `${i*100}ms` }} />)}
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Split Section */}
        <section id="features" className="py-32 space-y-32">
          {features.map((f, i) => {
            const Mockup = featureMockups[f.title];
            return (
            <div key={f.title} className={`flex flex-col gap-12 lg:flex-row lg:items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              <div className="flex-1 space-y-6">
                <h2 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{f.title}</h2>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-lg">
                  {f.description}
                </p>
                <ul className="space-y-4">
                   {f.points.map(point => (
                     <li key={point} className="flex items-center gap-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        <div className="size-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                           <Check className="size-3" strokeWidth={3} />
                        </div>
                        {point}
                     </li>
                   ))}
                </ul>
              </div>
              <div className="flex-1 aspect-video rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 overflow-hidden relative group shadow-sm">
                 <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                 <Mockup />
              </div>
            </div>
            );
          })}
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32 border-t border-zinc-100 dark:border-zinc-900">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Simple Pricing.</h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">Scale as you grow, with no hidden fees.</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
             {plans.map((plan) => (
               <div key={plan.name} className={`relative p-8 rounded-[2.5rem] border ${plan.popular ? 'border-primary bg-primary/[0.02] shadow-2xl shadow-primary/5' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950'} transition-all hover:-translate-y-2`}>
                 {plan.popular && <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Most Popular</span>}
                 <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">{plan.name}</p>
                 <div className="mt-4 flex items-baseline gap-1">
                   <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">{plan.price}</span>
                   {plan.price !== "Custom" && <span className="text-zinc-500">/mo</span>}
                 </div>
                 <p className="mt-4 text-sm text-zinc-500">{plan.description}</p>
                 <div className="mt-8 space-y-4">
                   {plan.features.map(feat => (
                     <div key={feat} className="flex items-center gap-3 text-sm">
                       <CheckCircle2 className="size-4 text-primary" />
                       <span className="text-zinc-600 dark:text-zinc-400">{feat}</span>
                     </div>
                   ))}
                 </div>
                 <Link href="/auth/signup" className="block w-full">
                  <Button className={`mt-10 w-full h-12 rounded-2xl ${plan.popular ? 'bg-primary hover:bg-primary/90' : 'bg-zinc-900 dark:bg-white dark:text-zinc-900 hover:opacity-90'}`}>
                    Get Started
                  </Button>
                 </Link>
               </div>
             ))}
          </div>
        </section>
      </main>

      {/* Simplified Footer */}
      <footer className="py-16 mt-20 border-t border-zinc-100 dark:border-zinc-900">
        <div className="mx-auto max-w-7xl px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded bg-primary flex items-center justify-center">
              <Ticket className="h-4 w-4 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tighter">ticketin<span className="text-primary">.</span></span>
          </div>
          <p className="text-sm font-medium text-zinc-500">
            @2026 built by <a href="https://yourin.my.id" target="_blank"  className="text-zinc-900 dark:text-zinc-100 hover:text-primary transition-colors underline decoration-primary/30 underline-offset-4">Yourin</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
