import { useEffect, useState } from 'react'
import Card from '../../shared/ui/Card'
import Badge from '../../shared/ui/Badge'
import { Info, Target, ShieldAlert, Zap } from 'lucide-react'
import { api } from '../../shared/api/client'

export default function SignalPanel({ asset, timeframe, model }) {
  const [signal, setSignal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showExecuteWarning, setShowExecuteWarning] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const [targetUrl, setTargetUrl] = useState(null)
  const executePlatform = typeof window !== 'undefined' ? (localStorage.getItem('cqai_execute_exchange') || 'binance') : 'binance'
  
  useEffect(() => {
    setLoading(true)
    api.getSignal(asset, timeframe, model)
      .then((data) => {
        setSignal(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Signal error:', err)
        setLoading(false)
      })
  }, [asset, timeframe, model])
  
  if (loading) {
    return (
      <Card className="w-full lg:w-[350px] flex flex-col">
        <div className="p-4 border-b border-[#2D3748] flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest flex items-center gap-2">
            <Zap size={14} className="text-primary" />
            Alpha Signal
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        </div>
      </Card>
    )
  }
  
  if (!signal) {
    return (
      <Card className="w-full lg:w-[350px] flex flex-col">
        <div className="p-4 border-b border-[#2D3748] flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest flex items-center gap-2">
            <Zap size={14} className="text-primary" />
            Alpha Signal
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 text-[#4B5563]">
          No signal data
        </div>
      </Card>
    )
  }
  
  const isBuy = signal.type === 'BUY'
  const isSell = signal.type === 'SELL'
  
  return (
    <Card className="w-full lg:w-[350px] flex flex-col">
      <div className="p-4 border-b border-[#2D3748] flex items-center justify-between">
        <h3 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest flex items-center gap-2">
              <Zap size={14} className="text-primary" />
          Alpha Signal
        </h3>
        <span className="text-[10px] text-[#4B5563] font-medium">{signal.timestamp}</span>
      </div>
      
      <div className="p-6 flex flex-col gap-8">
        <div className="flex flex-col items-center text-center">
          <div className={`text-4xl font-black italic tracking-tighter mb-1 ${isBuy ? 'text-[#3B82F6]' : 'text-[#EF4444]'}`}>
            {signal.type}
          </div>
          <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-ping"></div>
             <span className="text-xs font-bold text-white">Confidence: {signal.confidence}%</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-[#0B0F14] rounded-lg border border-[#2D3748]">
            <div className="text-[10px] text-[#4B5563] font-bold uppercase tracking-widest mb-1">Target Move</div>
            <div className="text-lg font-bold text-[#22C55E]">{signal.targetMove}</div>
          </div>
          <div className="p-3 bg-[#0B0F14] rounded-lg border border-[#2D3748]">
            <div className="text-[10px] text-[#4B5563] font-bold uppercase tracking-widest mb-1">Risk Level</div>
            <div className="text-lg font-bold text-white">{signal.risk}</div>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 p-4 bg-[#1A2332]/50 rounded-xl border border-[#3B82F6]/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Target size={40} className="text-[#3B82F6]" />
          </div>
            <div className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2 mb-2">
            Trade Idea Box
            <Info size={12} className="text-[#4B5563]" />
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#9CA3AF] font-medium">Take Profit</span>
            <span className="text-base font-bold text-[#22C55E] tracking-tight">${signal.tp}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#9CA3AF] font-medium">Stop Loss</span>
            <span className="text-base font-bold text-[#EF4444] tracking-tight">${signal.sl}</span>
          </div>
        </div>
        
         <div className="flex flex-col gap-2 mt-2">
            <button
              aria-label="Execute trade idea"
            onClick={() => {
                const base = asset || signal?.symbol?.replace('USDT', '') || 'BTC'
                const timeframeParam = timeframe || signal?.timeframe || '15m'
                const symbolPair = `${base}_USDT`
                // read redirect preference
                const exchange = localStorage.getItem('cqai_execute_exchange') || 'binance'
                let url = ''
                if (exchange === 'binance') {
                  url = `https://www.binance.com/en/trade/${encodeURIComponent(symbolPair)}?layout=pro&type=spot&interval=${encodeURIComponent(timeframeParam)}`
                } else if (exchange === 'binance-demo') {
                  // Binance testnet / demo futures link - use the active symbolPair from control bar
                  url = `https://testnet.binancefuture.com/en/trade/${encodeURIComponent(symbolPair)}?type=spot&interval=${encodeURIComponent(timeframeParam)}`
                } else {
                  url = `https://www.binance.com/en/trade/${encodeURIComponent(symbolPair)}`
                }
                setTargetUrl(url)
                const opted = localStorage.getItem('cqai_no_execute_warning') === '1'
                if (opted) {
                  openBinance(url)
                  return
                }
                setShowExecuteWarning(true)
              }}
              className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white py-3 rounded-lg font-bold text-sm transition-all elev-sm active:scale-[0.98]"
            >
              Execute Trade Idea
            </button>

            {showExecuteWarning && (
              <div className="fixed inset-0 z-60 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/60"></div>
                <div className="relative bg-[#071018] border border-[#2D3748] rounded-lg p-6 w-full max-w-md mx-4 shadow-lg">
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold pb-4">Leaving CryptoQuant AI</h3>
                    <p className="text-sm text-[#9CA3AF] mt-3">You are about to open {executePlatform === 'binance' ? 'Binance' : executePlatform === 'binance-demo' ? 'Binance (Demo Trading)' : executePlatform} to execute this trade idea. CryptoQuant AI does not place orders for you.</p>

                    <div className="flex items-center gap-3 mt-3">
                      <input
                        id="dontShow"
                        type="checkbox"
                        className="w-4 h-4 rounded text-primary focus:ring-0"
                        checked={dontShowAgain}
                        onChange={(e) => setDontShowAgain(e.target.checked)}
                      />
                      <label htmlFor="dontShow" className="text-sm text-[#9CA3AF]">Do not show this again</label>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        className="flex-1 bg-[#111827] border border-[#2D3748] text-[#9CA3AF] py-2 rounded-md text-sm font-semibold hover:bg-[#0f1720] transition-colors"
                        onClick={() => setShowExecuteWarning(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="flex-1 bg-[#3B82F6] hover:bg-[#2563EB] text-white py-2 rounded-md text-sm font-semibold transition-colors"
                        onClick={() => {
                          if (dontShowAgain) localStorage.setItem('cqai_no_execute_warning', '1')
                          setShowExecuteWarning(false)
                          openBinance(targetUrl)
                        }}
                      >
                        Continue to {executePlatform === 'binance' ? 'Binance' : executePlatform === 'binance-demo' ? 'Binance (Demo Trading)' : executePlatform}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
           <button
             aria-label="Copy trade idea to clipboard"
             className="w-full bg-transparent text-[#4B5563] hover:text-[#9CA3AF] text-[10px] font-bold uppercase tracking-widest py-2 transition-colors"
           >
             Copy to Clipboard
           </button>
         </div>
      </div>
      
      <div className="mt-auto p-4 bg-[#121821] border-t border-[#2D3748] flex items-center gap-2">
         <ShieldAlert size={14} className="text-yellow-500/50" />
         <p className="text-[9px] text-[#4B5563] leading-tight italic">
           AI models update dynamically. Past accuracy does not guarantee future results.
         </p>
      </div>
    </Card>
  )
}

function openBinance() {
  try {
    // accept optional param
    const urlArg = arguments[0]
    const url = urlArg || window._cqai_target_binance_url
    if (url) {
      window.open(url, '_blank', 'noopener')
      return
    }
  } catch (e) {}
  // fallback
  window.open('https://www.binance.com/en/markets', '_blank', 'noopener')
}
