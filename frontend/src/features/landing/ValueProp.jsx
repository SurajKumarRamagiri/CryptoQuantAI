import { Brain, LineChart, Zap, Target, Gauge, Lock, BarChart3 } from 'lucide-react'

const features = [
  { 
    icon: Brain, 
    title: 'AI-Powered Predictions', 
    text: 'Deep learning models analyze millions of data points to predict market movements with unprecedented accuracy.',
    gradient: 'from-[#3B82F6] to-[#1D4ED8]'
  },
  { 
    icon: LineChart, 
    title: 'Multi-Timeframe Analysis', 
    text: 'Signals across 15m, 30m, 1h, 4h, and 1D timeframes. Coordinate your entries across horizons.',
    gradient: 'from-[#06B6D4] to-[#0891B2]'
  },
  { 
    icon: Zap, 
    title: 'Real-Time Execution', 
    text: 'Sub-millisecond signal delivery. Be the first to act when opportunities emerge.',
    gradient: 'from-[#22C55E] to-[#16A34A]'
  },
  { 
    icon: Target, 
    title: 'Actionable Trade Ideas', 
    text: 'Every signal comes with precise entry, take profit, and stop loss levels. Trade with confidence.',
    gradient: 'from-[#F59E0B] to-[#D97706]'
  },
  { 
    icon: Gauge, 
    title: 'Confidence Scores', 
    text: 'Know the probability before you trade. Our confidence metrics help you size positions appropriately.',
    gradient: 'from-[#14B8A6] to-[#0D9488]'
  },
  { 
    icon: Lock, 
    title: 'Risk Management', 
    text: 'Built-in position sizing calculator and risk controls keep your portfolio protected.',
    gradient: 'from-[#06B6D4] to-[#0891B2]'
  }
]

export default function ValueProp() {
  return (
    <section className="relative py-32 bg-[#0B0F14] overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:40px_40px]" />
        <div className="absolute bottom-0 left-0 right-0 h-[400px] bg-gradient-to-t from-[#0B0F14] to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Why Traders Choose <span className="text-[#3B82F6]">CryptoQuantAI</span>
          </h2>
          <p className="text-lg text-[#9CA3AF] max-w-2xl mx-auto text-center leading-relaxed">
            Institutional-grade tools, now available for every trader. 
            Experience the power of AI-driven market analysis.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-3xl bg-[#121821]/50 border border-[#2D3748] hover:border-[#3B82F6]/30 transition-all duration-500 hover:-translate-y-2 text-center"
            >
              {/* Gradient border on hover */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              
              <div className="relative z-10">
                {/* Icon */}
                <div className="relative inline-flex items-center justify-center mb-6 mx-auto">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl blur-lg opacity-30 group-hover:opacity-60 transition-opacity duration-500`} />
                  <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#3B82F6] transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-[#9CA3AF] leading-relaxed">
                  {feature.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 pt-12 border-t border-[#2D3748]">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">87%</div>
            <div className="text-sm text-[#6B7280]">Signal Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">15ms</div>
            <div className="text-sm text-[#6B7280]">Average Latency</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">50K+</div>
            <div className="text-sm text-[#6B7280]">Trades This Month</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">$2.4B</div>
            <div className="text-sm text-[#6B7280]">Volume Tracked</div>
          </div>
        </div>
      </div>
    </section>
  )
}