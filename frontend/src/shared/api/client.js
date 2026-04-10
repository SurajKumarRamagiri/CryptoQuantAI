const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

const CACHE_DURATION = 60 * 1000

function _normalizeSymbol(sym) {
  if (!sym) return sym
  const s = String(sym).trim().toUpperCase()
  return s.endsWith('USDT') ? s : `${s}USDT`
}

const cache = new Map()

function getCached(key) {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  cache.delete(key)
  return null
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() })
}

async function fetchApi(endpoint) {
  const response = await fetch(`${API_BASE}${endpoint}`)
  if (!response.ok) throw new Error(`API error: ${response.status}`)
  const data = await response.json()
  return data.success ? data.data : data
}

export const api = {
  getModels: async () => {
    const cacheKey = 'models_list'
    const cached = getCached(cacheKey)
    if (cached) return cached
    const data = await fetchApi('/models')
    setCache(cacheKey, data)
    return data
  },

  // Persist user settings to backend when available
  saveUserSettings: async (userId, payload) => {
    // This is a non-blocking best-effort call. The backend endpoint is optional.
    try {
      await fetch(`${API_BASE}/users/${encodeURIComponent(userId)}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch (e) {
      // swallow errors to avoid breaking UI
      console.warn('Failed to persist settings', e)
    }
  },

  getCandles: async (symbol = 'BTCUSDT', interval = '15m', limit = 100) => {
    const s = _normalizeSymbol(symbol)
    return fetchApi(`/market/candles?symbol=${s}&interval=${interval}&limit=${limit}`)
  },
  
  getTicker: async (symbol = 'BTCUSDT') => {
    const s = _normalizeSymbol(symbol)
    return fetchApi(`/market/ticker?symbol=${s}`)
  },

  getSignal: async (asset = 'BTC', timeframe = '15m', modelName = 'hybrid-gru-xgboost') => {
    const symbol = `${asset}USDT`
    const cacheKey = `signal_${asset.toLowerCase()}_${timeframe}_${modelName}`
    const cached = getCached(cacheKey)
    if (cached) return cached
    
    const data = await fetchApi(`/models/predict?symbol=${symbol}&timeframe=${timeframe}&model_name=${modelName}`)
    setCache(cacheKey, data)
    return data
  },
  
  getStats: async (asset = 'BTC') => {
    const symbol = `${asset}USDT`
    return fetchApi(`/market/ticker?symbol=${symbol}`)
  },
  
  getIndicators: async () => {
    return fetchApi('/market/symbols')
  },
  
  getMtfMatrix: async () => {
    return fetchApi('/market/symbols')
  }
}
