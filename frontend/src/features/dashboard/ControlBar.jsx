import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Clock, Cpu, Check, Zap, Bitcoin } from 'lucide-react'
import { api } from '../../shared/api/client'

const STORAGE_KEY_MODEL = 'cqai_selected_model'
const STORAGE_KEY_COINS = 'cqai_dashboard_coins'
const STORAGE_KEY_HORIZONS = 'cqai_dashboard_horizons'

const DEFAULT_MODELS = [
  { id: 'random-forest', name: 'Random Forest', desc: 'Stable predictions' },
  { id: 'xgboost', name: 'XGBoost', desc: 'Fast & accurate' },
  { id: 'lstm', name: 'LSTM', desc: 'Long short-term memory' },
  { id: 'gru', name: 'GRU', desc: 'Gated recurrent unit' },
  { id: 'gru-xgboost', name: 'GRU+XGBoost Hybrid', desc: 'Best overall performance' }
]

// Helper to load model from localStorage or default
function loadSavedModel() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_MODEL)
    if (saved && DEFAULT_MODELS.some(m => m.id === saved)) {
      return saved
    }
  } catch (e) {
    console.warn('Failed to load saved model', e)
  }
  return 'gru-xgboost' // default
}

export default function ControlBar({ selectedAsset, setSelectedAsset, timeframe, setTimeframe, selectedModel: propModel, setSelectedModel: propSetModel, assets: assetsProp, timeframes: timeframesProp }) {
  const assets = (assetsProp && assetsProp.length > 0)
    ? assetsProp.map(id => ({ id, name: id }))
    : [
      { id: 'BTC', name: 'BTC' },
      { id: 'ETH', name: 'ETH' },
      { id: 'SOL', name: 'SOL' }
    ]
  
  const timeframes = (timeframesProp && timeframesProp.length > 0) ? timeframesProp : ['15m', '30m', '1h']
  
  // Persisted model selection
  const [savedModel, setSavedModel] = useState(loadSavedModel)
  const [modelSaveMessage, setModelSaveMessage] = useState('')
  
  // Use internal state if props not provided (for standalone usage)
  const [models] = useState(DEFAULT_MODELS)
  const selectedModel = propModel ?? savedModel
  const setSelectedModel = propSetModel ?? ((modelId) => {
    setSavedModel(modelId)
    try {
      localStorage.setItem(STORAGE_KEY_MODEL, modelId)
      setModelSaveMessage('Model saved')
      setTimeout(() => setModelSaveMessage(''), 1500)
    } catch (e) {
      console.warn('Failed to save model preference', e)
    }
    // Dispatch event so other components know
    try {
      window.dispatchEvent(new CustomEvent('cqai_model_selected', { detail: { model: modelId } }))
    } catch (e) {}
  })
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
    <div className="py-4 px-4 md:px-8 border-b border-[var(--color-border)] bg-[#0B0F14]/50 flex flex-wrap items-center justify-between gap-4 md:gap-6">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 mr-2 text-[var(--color-text-muted)]">
            <Bitcoin size={14} />
            <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Asset</span>
          </div>
          {assets.map((asset) => (
            <button
              key={asset.id}
              onClick={() => setSelectedAsset(asset.id)}
              className={`px-3 md:px-4 py-2.5 md:py-3 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 md:gap-2 border ${
                selectedAsset === asset.id 
                ? 'bg-primary-10 text-primary border-primary-30 elev-sm' 
                : 'bg-[var(--color-card)] text-[var(--color-neutral)] border-[var(--color-border)] hover:border-[var(--color-text-muted)]'
              }`}
            >
              <div className={`w-2.5 h-2.5 rounded-full ${selectedAsset === asset.id ? 'bg-primary' : 'bg-neutral-dark'}`}></div>
              {asset.id}
              <span className="opacity-40 font-normal hidden sm:inline">/USDT</span>
            </button>
          ))}
        </div>

        

       <div className="hidden md:block w-px h-8 bg-[var(--color-border)] mx-3"></div>

      <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
        <div className="flex items-center gap-2 mr-2 text-[var(--color-text-muted)]">
          <Clock size={14} />
          <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Horizon</span>
        </div>
        <div className="flex bg-[var(--color-card)] p-1 rounded-lg border border-[var(--color-border)]">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
            className={`px-3 md:px-4 py-2 rounded-md text-sm font-bold transition-all ${
                timeframe === tf ? 'bg-primary text-white elev-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-neutral)]'
            }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="hidden md:block w-px h-8 bg-[var(--color-border)] mx-3"></div>

      <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto" ref={dropdownRef}>
        <div className="flex items-center gap-2 mr-2 text-[var(--color-text-muted)]">
          <Cpu size={14} />
          <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Model</span>
        </div>
        <div className="relative flex-1 md:flex-none">
          <button
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="flex items-center gap-2 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg px-4 py-2 pr-3 text-sm font-bold text-white hover:border-[var(--color-text-muted)] transition-all w-full md:min-w-[200px] justify-between"
          >
            <span className="truncate">
              {models.find(m => m.id === selectedModel)?.name || selectedModel}
            </span>
            <ChevronDown size={16} className={`text-[var(--color-text-muted)] transition-transform ${modelDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {modelDropdownOpen && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-[#0B0F14] border border-[var(--color-border)] rounded-lg shadow-2xl z-50 max-h-[280px] overflow-y-auto">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    setSelectedModel(model.id)
                    setModelDropdownOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all first:rounded-t-lg last:rounded-b-lg border-l-2 ${
                    selectedModel === model.id 
                    ? 'bg-[var(--color-accent)] text-[var(--color-primary)] border-l-[var(--color-primary)]' 
                    : 'text-[var(--color-neutral)] hover:bg-[var(--color-accent)] hover:text-white border-l-transparent'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate flex items-center gap-2">
                      {model.name}
                      {selectedModel === model.id && <Zap size={12} className="text-[var(--color-primary)]" />}
                    </div>
                    {model.desc && (
                      <div className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">{model.desc}</div>
                    )}
                  </div>
                  {selectedModel === model.id && (
                    <Check size={16} className="text-[var(--color-primary)] flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
          {modelSaveMessage && (
            <div className="absolute top-full mt-2 right-0 px-2 py-1 bg-[var(--color-success)] text-white text-xs rounded shadow-lg animate-pulse">
              {modelSaveMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
