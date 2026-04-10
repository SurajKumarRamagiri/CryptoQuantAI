import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Clock, Cpu, Check, Zap } from 'lucide-react'
import { api } from '../../shared/api/client'

export default function ControlBar({ selectedAsset, setSelectedAsset, timeframe, setTimeframe, selectedModel, setSelectedModel, assets: assetsProp, timeframes: timeframesProp }) {
  const assets = (assetsProp && assetsProp.length > 0)
    ? assetsProp.map(id => ({ id, name: id }))
    : [
      { id: 'BTC', name: 'BTC' },
      { id: 'ETH', name: 'ETH' },
      { id: 'SOL', name: 'SOL' }
    ]
  
  const timeframes = (timeframesProp && timeframesProp.length > 0) ? timeframesProp : ['15m', '30m', '1h']
  
  const [models] = useState([
    { id: 'random-forest', name: 'Random Forest', desc: 'Stable predictions' },
    { id: 'xgboost', name: 'XGBoost', desc: 'Fast & accurate' },
    { id: 'lstm', name: 'LSTM', desc: 'Long short-term memory' },
    { id: 'gru', name: 'GRU', desc: 'Gated recurrent unit' },
    { id: 'gru-xgboost', name: 'GRU+XGBoost Hybrid', desc: 'Best overall performance' }
  ])
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setModelDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)

    function onSettings(e) {
      const { coins, horizons } = e.detail || {}
      if (Array.isArray(coins) && coins.length > 0) {
        // If the currently selected asset is not in user coins, switch to first
        const current = coins.includes(selectedAsset) ? selectedAsset : coins[0]
        setSelectedAsset(current)
      }
      if (Array.isArray(horizons) && horizons.length > 0) {
        const currentTf = horizons.includes(timeframe) ? timeframe : horizons[0]
        setTimeframe(currentTf)
      }
    }

    window.addEventListener('cqai_settings_updated', onSettings)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('cqai_settings_updated', onSettings)
    }
  }, [])

  return (
    <div className="py-4 px-8 border-b border-[#2D3748] bg-[#0B0F14]/50 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          {assets.map((asset) => (
            <button
              key={asset.id}
              onClick={() => setSelectedAsset(asset.id)}
              className={`px-4 py-3 rounded-lg text-sm font-bold transition-all flex items-center gap-2 border ${
                selectedAsset === asset.id 
                ? 'bg-primary-10 text-primary border-primary-30 elev-sm' 
                : 'bg-[#121821] text-[#9CA3AF] border-[#2D3748] hover:border-[#4B5563]'
              }`}
            >
              <div className={`w-2.5 h-2.5 rounded-full ${selectedAsset === asset.id ? 'bg-[#3B82F6]' : 'bg-[#4B5563]'}`}></div>
              {asset.id}
              <span className="opacity-40 font-normal">/USDT</span>
            </button>
          ))}
        
      </div>

       <div className="w-px h-6 bg-[#2D3748] mx-3"></div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 mr-2 text-[#4B5563]">
          <Clock size={14} />
          <span className="text-xs font-bold uppercase tracking-widest">Horizon</span>
        </div>
        <div className="flex bg-[#121821] p-1 rounded-lg border border-[#2D3748]">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                timeframe === tf ? 'bg-primary text-white elev-sm' : 'text-[#4B5563] hover:text-[#9CA3AF]'
            }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="w-px h-6 bg-[#2D3748] mx-3"></div>

      <div className="flex items-center gap-3" ref={dropdownRef}>
        <div className="flex items-center gap-2 mr-2 text-[#4B5563]">
          <Cpu size={14} />
          <span className="text-xs font-bold uppercase tracking-widest">Model</span>
        </div>
        <div className="relative">
          <button
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="flex items-center gap-2 bg-[#121821] border border-[#2D3748] rounded-lg px-4 py-2 pr-3 text-sm font-bold text-white hover:border-[#4B5563] transition-all min-w-[200px] justify-between"
          >
            <span className="truncate">
              {models.find(m => m.id === selectedModel)?.name || selectedModel}
            </span>
            <ChevronDown size={16} className={`text-[#4B5563] transition-transform ${modelDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {modelDropdownOpen && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-[#0B0F14] border border-[#2D3748] rounded-lg shadow-2xl z-50 max-h-[280px] overflow-y-auto">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    setSelectedModel(model.id)
                    setModelDropdownOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all first:rounded-t-lg last:rounded-b-lg ${
                    selectedModel === model.id 
                    ? 'bg-primary-10 text-primary' 
                    : 'text-[#9CA3AF] hover:bg-[#1A2332] hover:text-white'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate flex items-center gap-2">
                      {model.name}
                      {selectedModel === model.id && <Zap size={12} className="text-primary" />}
                    </div>
                    {model.desc && (
                      <div className="text-xs text-[#4B5563] mt-0.5 truncate">{model.desc}</div>
                    )}
                  </div>
                  {selectedModel === model.id && (
                    <Check size={16} className="text-primary flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
