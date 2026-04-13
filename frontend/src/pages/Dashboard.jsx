import { useState, useEffect } from 'react'
import TopBar from '../features/dashboard/TopBar'
import ControlBar from '../features/dashboard/ControlBar'
import MarketStats from '../features/dashboard/MarketStats'
import ChartSection from '../features/dashboard/ChartSection'
import SignalPanel from '../features/dashboard/SignalPanel'
import IndicatorsPanel from '../features/dashboard/IndicatorsPanel'
import MtfTable from '../features/dashboard/MtfTable'
import ModelInsights from '../features/dashboard/ModelInsights'
import { api } from '../shared/api/client'

export default function Dashboard() {
  // load visible coins & horizons from settings (localStorage)
  const storedCoins = JSON.parse(localStorage.getItem('cqai_dashboard_coins') || 'null')
  const storedHorizons = JSON.parse(localStorage.getItem('cqai_dashboard_horizons') || 'null')
  const initialCoins = Array.isArray(storedCoins) && storedCoins.length > 0 ? storedCoins.slice(0,3) : ['BTC','ETH']
  const initialHorizons = Array.isArray(storedHorizons) && storedHorizons.length > 0 ? storedHorizons.slice(0,3) : ['15m','30m']

  const [availableCoins, setAvailableCoins] = useState(initialCoins)
  const [availableHorizons, setAvailableHorizons] = useState(initialHorizons)

  const [selectedAsset, setSelectedAsset] = useState(availableCoins[0])
  const [timeframe, setTimeframe] = useState(availableHorizons[0])
  const [selectedModel, setSelectedModel] = useState('hybrid-gru-xgboost')
  // loading state reserved for future UX (spinner/placeholder)
  /* eslint-disable-next-line no-unused-vars */
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    // This is where we would fetch data based on selectedAsset and timeframe
    const fetchData = async () => {
      setLoading(true)
      try {
        await api.getSignal(selectedAsset, timeframe)
        // Update states here if we had more dynamic ones
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [selectedAsset, timeframe])

  // when settings change in another tab or settings page, update available lists
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'cqai_dashboard_coins' || e.key === 'cqai_dashboard_horizons') {
        const coins = JSON.parse(localStorage.getItem('cqai_dashboard_coins') || 'null')
        const horizons = JSON.parse(localStorage.getItem('cqai_dashboard_horizons') || 'null')
        if (Array.isArray(coins) && coins.length > 0) setAvailableCoins(coins.slice(0,3))
        if (Array.isArray(horizons) && horizons.length > 0) setAvailableHorizons(horizons.slice(0,3))
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // ensure selected values remain valid if available lists change
  useEffect(() => {
    if (!availableCoins.includes(selectedAsset)) setSelectedAsset(availableCoins[0])
  }, [availableCoins])
  useEffect(() => {
    if (!availableHorizons.includes(timeframe)) setTimeframe(availableHorizons[0])
  }, [availableHorizons])
  
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col text-white selection:bg-[var(--color-primary)] selection:text-white">
      <TopBar />
      
      <main className="flex-1 flex flex-col">
        <ControlBar 
          selectedAsset={selectedAsset} 
          setSelectedAsset={setSelectedAsset}
          timeframe={timeframe}
          setTimeframe={setTimeframe}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          assets={availableCoins}
          timeframes={availableHorizons}
        />
        
        <div className="container mx-auto max-w-[1600px] flex flex-col gap-6 md:gap-8 p-4 md:p-8">
          <MarketStats asset={selectedAsset} timeframe={timeframe} />
          
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            <ChartSection asset={selectedAsset} timeframe={timeframe} />
            <SignalPanel asset={selectedAsset} timeframe={timeframe} model={selectedModel} />
          </div>
          
          <IndicatorsPanel />
          
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
             <div className="xl:col-span-2">
               <MtfTable />
             </div>
             <div className="xl:col-span-3">
               <ModelInsights />
             </div>
          </div>
        </div>
      </main>
      
      <footer className="py-6 px-8 border-t border-[var(--color-border)] flex justify-between items-center text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-widest bg-[var(--color-bg)]">
        <div>© 2025 CryptoQuant AI</div>
        <div className="flex items-center gap-6">
           <a href="#" className="hover:text-[var(--color-neutral)]">API Status: Normal</a>
           <a href="#" className="hover:text-[var(--color-neutral)]">Support</a>
           <a href="#" className="hover:text-[var(--color-neutral)]">Terms</a>
        </div>
      </footer>
    </div>
  )
}
