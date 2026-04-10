import { TrendingUp, Award, Users, Trophy } from 'lucide-react'

const stats = [
  { icon: TrendingUp, value: '87%', label: 'Signal Accuracy', sub: 'Last 90 days' },
  { icon: Award, value: '72%', label: 'Win Rate', sub: 'Average monthly' },
  { icon: Trophy, value: '2.4', label: 'Sharpe Ratio', sub: 'Risk adjusted' },
  { icon: Users, value: '10K+', label: 'Active Traders', sub: 'Growing daily' }
]

const testimonials = [
  { name: 'Alex M.', role: 'Day Trader', text: 'Finally a tool that gives me an edge. The 15m signals are incredibly accurate.', avatar: 'AM' },
  { name: 'Sarah K.', role: 'Portfolio Manager', text: 'Incorporated CryptoQuantAI into my algo stack. The multi-timeframe analysis is top notch.', avatar: 'SK' },
  { name: 'Mike R.', role: 'Swing Trader', text: 'Risk management features alone are worth the subscription. Highly recommend.', avatar: 'MR' }
]

export default function PerformanceProof() {
  return (
    <section className="relative py-32 bg-[#0B0F14] overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#3B82F6]/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 mb-6">
            <TrendingUp className="w-4 h-4 text-[#22C55E]" />
            <span className="text-sm font-medium text-[#22C55E]">Proven Results</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Performance That Speaks
          </h2>
          <p className="text-lg text-[#9CA3AF] max-w-2xl mx-auto text-center leading-relaxed">
            Backtested with rigorous methodology. Verified in real trading. 
            Join thousands of traders who trust CryptoQuantAI.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="group relative p-8 rounded-3xl bg-[#121821]/50 border border-[#2D3748] hover:border-[#3B82F6]/30 transition-all duration-500"
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-[#3B82F6]/10 flex items-center justify-center mb-4 group-hover:bg-[#3B82F6]/20 transition-colors">
                  <stat.icon className="w-6 h-6 text-[#3B82F6]" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm font-semibold text-white mb-1">{stat.label}</div>
                <div className="text-xs text-[#6B7280]">{stat.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Equity curve visualization */}
        <div className="relative mb-20 p-8 rounded-3xl bg-[#121821] border border-[#2D3748] overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#3B82F6]/10 via-[#22C55E]/5 to-[#3B82F6]/10" />
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between mb-8 gap-4">
              <div className="text-center lg:text-left">
                <h3 className="text-xl font-bold text-white mb-1">Portfolio Performance</h3>
                <p className="text-sm text-[#6B7280]">Hypothetical $10,000 investment (backtested)</p>
              </div>
              <div className="text-center lg:text-right">
                <div className="text-3xl font-bold text-[#22C55E]">+247%</div>
                <div className="text-sm text-[#6B7280]">12 month return</div>
              </div>
            </div>

            {/* Chart area */}
            <div className="relative h-64 w-full">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-full h-px bg-[#2D3748]/50" />
                ))}
              </div>
              
              {/* Simulated equity curve */}
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="curveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path 
                  d="M0 90 Q 15 85, 25 80 T 40 70 T 55 55 T 70 40 T 85 25 T 100 10"
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
                <path 
                  d="M0 90 Q 15 85, 25 80 T 40 70 T 55 55 T 70 40 T 85 25 T 100 10 L 100 100 L 0 100 Z"
                  fill="url(#curveGradient)"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              {/* Data points */}
              <div className="absolute top-[10%] left-[15%]">
                <div className="w-3 h-3 rounded-full bg-[#22C55E] animate-pulse" />
              </div>
              <div className="absolute top-[40%] left-[55%]">
                <div className="w-3 h-3 rounded-full bg-[#22C55E] animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
              <div className="absolute top-[75%] left-[85%]">
                <div className="w-3 h-3 rounded-full bg-[#22C55E] animate-pulse" style={{ animationDelay: '1s' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white text-center mb-12">Trusted by Traders Worldwide</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="p-6 rounded-2xl bg-[#121821]/50 border border-[#2D3748] hover:border-[#3B82F6]/30 transition-all duration-300"
              >
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] flex items-center justify-center text-white font-bold mb-3">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-[#6B7280]">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-[#9CA3AF] italic text-center">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}