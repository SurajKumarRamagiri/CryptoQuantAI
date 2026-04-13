import { useEffect, useRef, useState } from 'react'
import { createChart, CandlestickSeries } from 'lightweight-charts'
import Card from '../../shared/ui/Card'
import { api } from '../../shared/api/client'

const WS_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000/ws/market'

export default function ChartSection({ asset, timeframe }) {
  const chartContainerRef = useRef(null)
  const chartRef = useRef(null)
  const candleSeriesRef = useRef(null)
  const wsRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const currentSymbolRef = useRef('')
  const lastPriceRef = useRef(0)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid', color: 'var(--color-bg)' },
        textColor: 'var(--color-neutral)',
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.15)' },
        horzLines: { color: 'rgba(255,255,255,0.15)' },
      },
      crosshair: {
        mode: 1,
        vertLine: { color: '#3B82F6', width: 1, style: 2, visible: true, labelVisible: true },
        horzLine: { color: '#3B82F6', width: 1, style: 2, visible: true, labelVisible: true },
      },
      rightPriceScale: {
        borderColor: 'var(--color-border)',
        visible: true,
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
      timeScale: {
        borderColor: 'var(--color-border)',
        timeVisible: true,
        secondsVisible: false,
        visible: true,
        tickMarkFormatter: (time, tickMark, locale) => {
          const date = new Date(time * 1000)
          return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' })
        },
      },
    })

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22C55E',
      downColor: '#EF4444',
      borderUpColor: '#22C55E',
      borderDownColor: '#EF4444',
      wickUpColor: '#22C55E',
      wickDownColor: '#EF4444',
    })

    chartRef.current = chart
    candleSeriesRef.current = candleSeries

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        })
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
      if (wsRef.current) wsRef.current.close()
      chart.remove()
    }
  }, [])

  useEffect(() => {
    if (wsRef.current) wsRef.current.close()

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        if (msg.payload?.symbol === currentSymbolRef.current && candleSeriesRef.current) {
          const priceData = msg.payload
          const price = priceData.price
          
          if (!initializedRef.current) return
          
          const existingData = candleSeriesRef.current.data()
          const lastCandle = existingData.length > 0 ? existingData[existingData.length - 1] : null
          
          if (lastCandle) {
            candleSeriesRef.current.update({
              time: lastCandle.time,
              open: lastCandle.open,
              high: Math.max(lastCandle.high, price),
              low: Math.min(lastCandle.low, price),
              close: price,
            })
          }
          
          if (chartRef.current) {
            chartRef.current.timeScale().scrollToRealTime()
          }
        }
      } catch (e) {
        console.error('WS error:', e)
      }
    }

    return () => ws.close()
  }, [])

  useEffect(() => {
    const symbol = `${asset}USDT`
    currentSymbolRef.current = symbol
    lastPriceRef.current = 0
    setLoading(true)
    setError(null)

    api.getCandles(symbol, timeframe, 100)
      .then((data) => {
        if (currentSymbolRef.current !== symbol) return
        
        if (!data?.candles || data.candles.length === 0) {
          setError('No data available')
          setLoading(false)
          return
        }

        const candles = data.candles.map((c) => ({
          time: c.t / 1000,
          open: c.o,
          high: c.h,
          low: c.l,
          close: c.c,
        }))
        
        if (candleSeriesRef.current) {
          candleSeriesRef.current.setData(candles)
        }
        if (chartRef.current) {
          chartRef.current.timeScale().fitContent()
          setTimeout(() => {
            if (chartRef.current) {
              chartRef.current.timeScale().scrollToRealTime()
            }
          }, 100)
        }
        initializedRef.current = true
        setLoading(false)
      })
      .catch((err) => {
        if (currentSymbolRef.current === symbol) {
          setError(err.message)
          setLoading(false)
        }
      })
  }, [asset, timeframe])

  return (
    <Card className="flex-1 flex flex-col min-h-[400px] md:min-h-[700px]" style={{ overflow: 'hidden' }}>
      <div className="p-3 md:p-4 border-b border-[var(--color-border)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
          <span className="text-sm font-bold text-white">{asset}/USDT</span>
          <span className="text-[10px] bg-[var(--color-accent)] text-[#9CA3AF] px-2 py-0.5 rounded border border-[var(--color-border)] font-bold uppercase">
            {timeframe}
          </span>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2">
          {['MA', 'EMA', 'VOL', 'BB'].map(tool => (
            <button
              key={tool}
              aria-label={`Toggle ${tool} overlay`}
              className="text-[10px] font-bold text-[var(--color-text-muted)] hover:text-primary transition-colors uppercase tracking-widest px-2 md:px-3 py-2 rounded-md"
            >
              {tool}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 relative bg-[var(--color-bg)] overflow-hidden min-h-[300px] md:min-h-[600px]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
              <div className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Loading Chart</div>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-red-500 text-sm font-bold">{error}</div>
          </div>
        )}
        <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </Card>
  )
}
