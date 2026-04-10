import { useState } from 'react'
import { TrendingUp, TrendingDown, Activity, Zap, Clock } from 'lucide-react'

const mockSignals = {
  BTC: { '15m': { type: 'BUY', conf: 78, price: 63450 }, '30m': { type: 'HOLD', conf: 55, price: 63420 }, '1h': { type: 'BUY', conf: 82, price: 63380 } },
  ETH: { '15m': { type: 'HOLD', conf: 52, price: 2450 }, '30m': { type: 'SELL', conf: 72, price: 2465 }, '1h': { type: 'SELL', conf: 68, price: 2480 } },
  SOL: { '15m': { type: 'BUY', conf: 85, price: 142 }, '30m': { type: 'BUY', conf: 81, price: 141 }, '1h': { type: 'BUY', conf: 76, price: 139 } }
}

export default function LiveSignalPreview() {
  const [timeframe, setTimeframe] = useState('15m')
  
  return (
    <section className="relative py-32 bg-[#0B0F14] overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-[#3B82F6]/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/20 mb-8">
            <Zap className="w-4 h-4 text-[#3B82F6]" />
            <span className="text-sm font-medium text-[#3B82F6]">Live Data</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Real-Time Signals
          </h2>
          <p className="text-lg md:text-xl text-[#9CA3AF] max-w-2xl mx-auto text-center leading-relaxed">
            Watch our AI analyze markets in real-time. Select a timeframe to see predictions across BTC, ETH, and SOL.
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-[#121821] border border-[#2D3748]">
            {['15m', '30m', '1h'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  timeframe === tf 
                    ? 'bg-[#3B82F6] text-white shadow-lg shadow-[#3B82F6]/20' 
                    : 'text-[#6B7280] hover:text-white hover:bg-[#1A2332]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Signal cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {Object.entries(mockSignals).map(([asset, signals]) => {
            const signal = signals[timeframe]
            const isBuy = signal.type === 'BUY'
            const isSell = signal.type === 'SELL'
            
            return (
              <div 
                key={asset}
                className="group relative p-10 rounded-3xl bg-[#121821] border border-[#2D3748] hover:border-[#3B82F6]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#3B82F6]/10 overflow-hidden text-center"
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10 text-center">
                  {/* Asset header */}
                  <div className="flex flex-col items-center mb-10">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-3xl font-bold text-white">{asset}</h3>
                      <span className="text-sm text-[#6B7280]">/USDT</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <Activity className="w-4 h-4" />
                      <span>Live Feed</span>
                    </div>
                  </div>
                  <div className={`p-4 rounded-2xl mx-auto w-fit mb-8 ${
                    isBuy ? 'bg-[#22C55E]/10' : isSell ? 'bg-[#EF4444]/10' : 'bg-[#6B7280]/10'
                  }`}>
                    {isBuy ? <TrendingUp className="w-8 h-8 text-[#22C55E]" /> : 
                     isSell ? <TrendingDown className="w-8 h-8 text-[#EF4444]" /> : 
                     <Activity className="w-8 h-8 text-[#6B7280]" />}
                  </div>
                </div>

                <div className="relative z-10">
                  {/* Signal type */}
                  <div className="mb-8 flex justify-center">
                    <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${
                      isBuy ? 'bg-[#22C55E]/10 text-[#22C55E]' : 
                      isSell ? 'bg-[#EF4444]/10 text-[#EF4444]' : 
                      'bg-[#6B7280]/10 text-[#6B7280]'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        isBuy ? 'bg-[#22C55E]' : 
                        isSell ? 'bg-[#EF4444]' : 
                        'bg-[#6B7280]'
                      } ${isBuy ? 'animate-pulse' : ''}`} />
                      <span className="text-base font-bold uppercase tracking-wider">{signal.type}</span>
                    </div>
                  </div>

                  {/* Confidence bar */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-base text-[#6B7280]">Confidence</span>
                      <span className="text-xl font-bold text-white">{signal.conf}%</span>
                    </div>
                    <div className="h-3 bg-[#0B0F14] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          isBuy ? 'bg-gradient-to-r from-[#22C55E] to-[#16A34A]' : 
                          isSell ? 'bg-gradient-to-r from-[#EF4444] to-[#DC2626]' : 
                          'bg-[#6B7280]'
                        }`}
                        style={{ width: `${signal.conf}%` }}
                      />
                    </div>
                  </div>

                  {/* Price */}
                  <div className="pt-6 border-t border-[#2D3748]/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#6B7280]">Current Price</span>
                      <span className="text-xl font-bold text-white">${signal.price.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Last updated indicator */}
        <div className="flex items-center justify-center gap-3 mt-12 text-sm text-[#6B7280]">
          <Clock className="w-4 h-4" />
          <span>Signals update every 15 seconds</span>
          <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
        </div>
      </div>
    </section>
  )
}