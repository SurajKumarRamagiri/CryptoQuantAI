import { useEffect, useState } from 'react'
import Card from '../shared/ui/Card'
import TopBar from '../features/dashboard/TopBar'
import Button from '../shared/ui/Button'
import { Globe, Clock, Save, RefreshCw } from 'lucide-react'
import { useAuth } from '../app/router'
import { api } from '../shared/api/client'

const AVAILABLE_COINS = ['BTC', 'ETH', 'SOL']
const AVAILABLE_HORIZONS = ['15m', '30m', '1h']

export default function Settings() {
  const [exchange, setExchange] = useState(() => localStorage.getItem('cqai_execute_exchange') || 'binance')
  const [coins, setCoins] = useState(() => JSON.parse(localStorage.getItem('cqai_dashboard_coins') || 'null') || ['BTC','ETH'])
  const [horizons, setHorizons] = useState(() => JSON.parse(localStorage.getItem('cqai_dashboard_horizons') || 'null') || ['15m','30m'])
  const [message, setMessage] = useState('')

  useEffect(() => {
    // ensure limits
    if (coins.length > 3) setCoins(coins.slice(0,3))
    if (horizons.length > 3) setHorizons(horizons.slice(0,3))
    // remove any selections that are no longer available (e.g. removed coins/horizons)
    setCoins((prev) => prev.filter((c) => AVAILABLE_COINS.includes(c)))
    setHorizons((prev) => prev.filter((h) => AVAILABLE_HORIZONS.includes(h)))
  }, [])

  function toggleCoin(coin) {
    setMessage('')
    setCoins((prev) => {
      if (prev.includes(coin)) return prev.filter(c => c !== coin)
      if (prev.length >= 3) {
        setMessage('You can select up to 3 coins.')
        return prev
      }
      return [...prev, coin]
    })
  }

  function toggleHorizon(h) {
    setMessage('')
    setHorizons((prev) => {
      if (prev.includes(h)) return prev.filter(x => x !== h)
      if (prev.length >= 3) {
        setMessage('You can select up to 3 horizons.')
        return prev
      }
      return [...prev, h]
    })
  }

  const { user } = useAuth()

  async function save() {
    localStorage.setItem('cqai_execute_exchange', exchange)
    localStorage.setItem('cqai_dashboard_coins', JSON.stringify(coins))
    localStorage.setItem('cqai_dashboard_horizons', JSON.stringify(horizons))

    // try to persist to backend if user is logged in
    try {
      if (user?.email) {
        const payload = { exchange, coins, horizons }
        // best-effort via api client
        await api.saveUserSettings(user.email, payload)
      }
    } catch (e) {
      // swallow - non critical
      console.warn('Failed to persist settings', e)
    }

    setMessage('Settings saved')
    setTimeout(() => setMessage(''), 3000)
    // notify other parts of the app in this tab
    try {
      window.dispatchEvent(new CustomEvent('cqai_settings_updated', { detail: { exchange, coins, horizons } }))
    } catch (e) {}
  }

  return (
    <div className="min-h-screen bg-[#0B0F14] flex flex-col text-white">
      <TopBar />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          
          <Card>
            <div className="flex flex-col gap-6 p-8">
              {/* Row 1 - Execute Redirect (full width) */}
              <div className="bg-[#071018] rounded-xl border border-[#1f2937] p-6">
                <section aria-labelledby="execute-heading" className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-md bg-[#06121a] border border-[#0f1720]">
                      <Globe className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 id="execute-heading" className="text-lg font-bold text-white">Execute Trade Redirect</h3>
                      <p className="text-sm text-[#9CA3AF]">Choose where "Execute Trade" buttons open. We support direct Binance and a demo/testnet redirect.</p>
                    </div>
                  </div>

                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      aria-pressed={exchange === 'binance'}
                      onClick={() => setExchange('binance')}
                      className={`p-4 text-left rounded-lg border transition-all transform-gpu ${exchange === 'binance' ? 'bg-[#07203a] border-primary shadow-lg scale-100' : 'bg-transparent border-[#1f2937] hover:border-[#3B82F6] hover:scale-[1.03]' } active:scale-[0.98] motion-reduce:transform-none`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white">Binance</div>
                          <div className="text-xs text-[#6B7280]">Open spot trading on Binance</div>
                        </div>
                        <div className="text-sm text-[#6B7280]">Live</div>
                      </div>
                    </button>

                    <button
                      aria-pressed={exchange === 'binance-demo'}
                      onClick={() => setExchange('binance-demo')}
                      className={`p-4 text-left rounded-lg border transition-all transform-gpu ${exchange === 'binance-demo' ? 'bg-[#07203a] border-primary shadow-lg scale-100' : 'bg-transparent border-[#1f2937] hover:border-[#3B82F6] hover:scale-[1.03]' } active:scale-[0.98] motion-reduce:transform-none`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white">Binance (Demo)</div>
                          <div className="text-xs text-[#6B7280]">Opens Binance testnet/demo (futures demo link)</div>
                        </div>
                        <div className="text-sm text-[#6B7280]">Demo</div>
                      </div>
                    </button>
                  </div>

                  <div className="text-xs text-[#6B7280]">More exchanges and broker integrations coming soon.</div>
                </section>
              </div>

              {/* Row 2 - Dashboard Display (full width) */}
              <div className="bg-[#071018] rounded-xl border border-[#1f2937] p-6">
                <section aria-labelledby="display-heading" className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-md bg-[#06121a] border border-[#0f1720]">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 id="display-heading" className="text-lg font-bold text-white">Dashboard Display</h3>
                      <p className="text-sm text-[#9CA3AF]">Select up to 3 cryptos and up to 3 horizons to appear in your dashboard controls.</p>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-[#6B7280] mb-2">Cryptocurrencies</div>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_COINS.map((c) => (
                        <button
                          key={c}
                          onClick={() => toggleCoin(c)}
                          aria-pressed={coins.includes(c)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-all transform-gpu ${coins.includes(c) ? 'bg-primary text-white border-primary shadow scale-100' : 'bg-transparent text-[#9CA3AF] border-[#1f2937] hover:border-[#3B82F6] hover:scale-[1.03]'} active:scale-[0.98] motion-reduce:transform-none`}
                    >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-[#6B7280] mb-2">Horizons</div>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_HORIZONS.map((h) => (
                        <button
                          key={h}
                          onClick={() => toggleHorizon(h)}
                          aria-pressed={horizons.includes(h)}
                          className={`px-3 py-2 text-sm rounded-lg border transition-all transform-gpu ${horizons.includes(h) ? 'bg-primary text-white border-primary shadow scale-100' : 'bg-transparent text-[#9CA3AF] border-[#1f2937] hover:border-[#3B82F6] hover:scale-[1.03]'} active:scale-[0.98] motion-reduce:transform-none`}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>

                  
                </section>
              </div>
            </div>
          </Card>

          {/* Action row outside the card */}
          <div className="flex justify-end items-center gap-4 mt-6">
            <div className="text-sm text-[#9CA3AF] mr-auto">{message}</div>
            <Button variant="secondary" size="lg" className="min-w-[140px] flex items-center gap-2 transform-gpu hover:scale-[1.03] active:scale-[0.98] motion-reduce:transform-none" onClick={() => {
              localStorage.removeItem('cqai_dashboard_coins')
              localStorage.removeItem('cqai_dashboard_horizons')
              setCoins(['BTC','ETH'])
              setHorizons(['15m','30m'])
              setMessage('Reset to defaults')
            }}>
              <RefreshCw className="w-4 h-4" />
              Reset
            </Button>

            <Button
              variant="primary"
              size="lg"
              className="min-w-[160px] flex items-center gap-2 shadow-lg bg-gradient-to-r from-[#2563EB] to-[#3B82F6] border-none hover:opacity-95"
              onClick={save}
            >
              <Save className="w-4 h-4" />
              Save Settings
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
