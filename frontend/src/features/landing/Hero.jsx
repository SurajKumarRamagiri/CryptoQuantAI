import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp, Shield, Zap, Brain, ChevronRight } from 'lucide-react'
import Button from '../../shared/ui/Button'

export default function Hero() {
  const features = [
    { icon: Brain, title: 'AI-Powered', desc: 'Neural networks trained on millions of data points' },
    { icon: Zap, title: 'Real-Time', desc: 'Sub-millisecond signal delivery across markets' },
    { icon: Shield, title: 'Risk Managed', desc: 'Every signal includes precise TP/SL levels' }
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--color-bg)]">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[var(--color-success)]/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '5s' }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:60px_60px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_40%,transparent_100%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div className="group flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-card)]/80 border border-[var(--color-border)] backdrop-blur-sm hover:border-[var(--color-primary)]/50 transition-all duration-300 cursor-pointer">
            <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
            <span className="text-sm text-[var(--color-neutral)]">Live signals now available for BTC, ETH, SOL</span>
            <ArrowRight className="w-4 h-4 text-[var(--color-primary)] group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Main heading */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-[1.1]">
            <span className="text-white">Predict Crypto.</span>
            <br />
            <span className="bg-gradient-to-r from-primary via-[#60A5FA] to-success bg-clip-text text-transparent">
              Own the Signal.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-[var(--color-neutral)] px-5 py-8 max-w-2xl mx-auto text-center leading-relaxed">
            Institutional-grade AI signals for retail traders. 
            Real-time predictions across 15m, 30m, and 1h timeframes.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button size="lg" variant="primary" className="group relative px-8 hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] hover:scale-[1.02]">
            <Link to="/register" className="flex items-center gap-2 text-white">
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button size="lg" variant="secondary" className="group px-8 hover:bg-[var(--color-accent)]">
            <Link to="/dashboard" className="flex items-center gap-2 text-white">
              <TrendingUp className="w-5 h-5 text-[var(--color-success)]" />
              View Live Dashboard
            </Link>
          </Button>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-[var(--color-card)]/60 border border-[var(--color-border)] hover:border-[var(--color-primary)]/30 transition-all duration-300 hover:bg-[var(--color-card)] cursor-pointer text-center"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto transition-colors duration-300 bg-[var(--color-primary)]/10 group-hover:bg-[var(--color-primary)]">
                <feature.icon className="w-6 h-6 text-[var(--color-primary)] group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-[var(--color-neutral)] text-center">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center items-center gap-8 mt-16 text-sm text-[var(--color-text-muted)]">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-[var(--color-success)]" />
            <span>99.9% Uptime</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-[var(--color-success)]" />
            <span>10,000+ Active Traders</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-[var(--color-success)]" />
            <span>4.8/5 Trust Score</span>
          </div>
        </div>
      </div>

    </section>
  )
}