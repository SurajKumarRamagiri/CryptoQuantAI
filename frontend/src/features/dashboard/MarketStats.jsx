import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Activity, PieChart, BarChart3 } from 'lucide-react'
import { api } from '../../shared/api/client'

export default function MarketStats({ asset, timeframe }) {
  const [ticker, setTicker] = useState(null)
  
  useEffect(() => {
    const symbol = `${asset}USDT`
    // fetch both ticker and recent candles for the active horizon so we can compute
    // the horizon-based percent change (e.g. last interval change)
    Promise.all([api.getTicker(symbol), api.getCandles(symbol, timeframe, 3)])
      .then(([tickerData, candlesData]) => {
        try {
          let merged = tickerData || {}
          // candlesData.candles is an array of {t,o,h,l,c,v}
          const candles = candlesData?.candles || []
          if (candles.length >= 2) {
            const last = candles[candles.length - 1]
            const prev = candles[candles.length - 2]
            const lastClose = Number(last.c)
            const prevClose = Number(prev.c) || 1
            const pct = ((lastClose - prevClose) / prevClose) * 100
            merged = {
              ...merged,
              // prefer live last-close for price
              price: lastClose,
              // horizon-based percent change
              price_change_percent: pct,
              price_change: lastClose - prevClose,
            }
          }
          setTicker(merged)
        } catch (e) {
          console.error('Error merging ticker+candles', e)
          setTicker(tickerData)
        }
      })
      .catch((err) => {
        console.error('Error fetching market stats:', err)
      })
  }, [asset, timeframe])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    }).format(price)
  }

  const formatVolume = (vol) => {
    if (vol >= 1e9) return (vol / 1e9).toFixed(1) + 'B'
    if (vol >= 1e6) return (vol / 1e6).toFixed(1) + 'M'
    return vol.toFixed(0)
  }

  const price = ticker?.price ? formatPrice(ticker.price) : '--'
  // price_change_percent from backend is 24h by default; compute horizon-based change when candles available
  const horizonChange = (() => {
    if (ticker && typeof ticker.price_change_percent === 'number') {
      return ticker.price_change_percent
    }
    return null
  })()

  const change = horizonChange !== null
    ? (horizonChange >= 0 ? '+' : '') + horizonChange.toFixed(2)
    : '--'

  const vol = ticker?.volume_24h ? formatVolume(ticker.volume_24h) : '--'
  const isPositive = horizonChange !== null ? horizonChange >= 0 : (ticker?.price_change_percent >= 0)
  
  return (
    <div className="px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-8">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-[#4B5563]">
          <DollarSign size={14} />
          <span className="text-sm font-bold uppercase tracking-widest">Last Price</span>
        </div>
        <div className="flex items-end gap-3">
          <div className="text-2xl font-bold text-white tracking-tight">${price}</div>
          <div className={`text-sm font-bold flex items-center mb-1 ${isPositive ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
            {isPositive ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
            {change}%
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-[#4B5563]">
          <BarChart3 size={14} />
          <span className="text-sm font-bold uppercase tracking-widest">24h Volume</span>
        </div>
        <div className="text-2xl font-bold text-white tracking-tight">${vol}</div>
      </div>
      
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-[#4B5563]">
          <PieChart size={14} />
          <span className="text-sm font-bold uppercase tracking-widest">Symbol</span>
        </div>
        <div className="text-2xl font-bold text-white tracking-tight">{asset}/USDT</div>
      </div>
      
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-[#4B5563]">
          <Activity size={14} />
          <span className="text-sm font-bold uppercase tracking-widest">Market Status</span>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></div>
           <div className="text-sm font-bold text-white tracking-tight uppercase">Live Feed</div>
           <div className="text-xs text-[#4B5563] ml-1">Realtime</div>
        </div>
      </div>
    </div>
  )
}
