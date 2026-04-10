import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp, Shield, Zap, Brain, ChevronRight } from 'lucide-react'

export default function Hero() {
  const features = [
    { icon: Brain, title: 'AI-Powered', desc: 'Neural networks trained on millions of data points' },
    { icon: Zap, title: 'Real-Time', desc: 'Sub-millisecond signal delivery across markets' },
    { icon: Shield, title: 'Risk Managed', desc: 'Every signal includes precise TP/SL levels' }
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0B0F14]">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#3B82F6]/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#22C55E]/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '5s' }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:60px_60px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_40%,transparent_100%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div className="group flex items-center gap-2 px-4 py-2 rounded-full bg-[#121821]/80 border border-[#2D3748] backdrop-blur-sm hover:border-[#3B82F6]/50 transition-all duration-300 cursor-pointer">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span className="text-sm text-[#9CA3AF]">Live signals now available for BTC, ETH, SOL</span>
            <ArrowRight className="w-4 h-4 text-[#3B82F6] group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Main heading */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-[1.1]">
            <span className="text-white">Predict Crypto.</span>
            <br />
            <span className="bg-gradient-to-r from-[#3B82F6] via-[#60A5FA] to-[#22C55E] bg-clip-text text-transparent">
              Own the Signal.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-[#9CA3AF] max-w-2xl mx-auto text-center leading-relaxed">
            Institutional-grade AI signals for retail traders. 
            Real-time predictions across 15m, 30m, and 1h timeframes.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link 
            to="/register" 
            className="group relative px-8 py-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] hover:scale-[1.02]"
          >
            <span className="flex items-center gap-2">
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          <Link 
            to="/dashboard"
            className="group px-8 py-4 bg-[#121821] border border-[#2D3748] hover:border-[#3B82F6]/50 text-white rounded-xl font-semibold text-lg transition-all duration-300 hover:bg-[#1A2332]"
          >
            <span className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#22C55E]" />
              View Live Dashboard
            </span>
          </Link>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-[#121821]/60 border border-[#2D3748] hover:border-[#3B82F6]/30 transition-all duration-300 hover:bg-[#121821] cursor-pointer text-center"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto transition-colors duration-300 bg-[#3B82F6]/10 group-hover:bg-[#3B82F6]">
                <feature.icon className="w-6 h-6 text-[#3B82F6] group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-[#9CA3AF] text-center">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center items-center gap-8 mt-16 text-sm text-[#6B7280]">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-[#22C55E]" />
            <span>99.9% Uptime</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-[#22C55E]" />
            <span>10,000+ Active Traders</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-[#22C55E]" />
            <span>4.8/5 Trust Score</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-xs text-[#6B7280]">Scroll to explore</span>
        <ChevronRight className="w-4 h-4 text-[#6B7280] rotate-90" />
      </div>
    </section>
  )
}