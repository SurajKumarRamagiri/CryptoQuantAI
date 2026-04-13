import Card from '../../shared/ui/Card'

export default function MtfTable() {
  const data = [
    { asset: 'BTC', '15m': 'BUY', '30m': 'HOLD', '1h': 'BUY' },
    { asset: 'ETH', '15m': 'SELL', '30m': 'SELL', '1h': 'HOLD' },
    { asset: 'SOL', '15m': 'BUY', '30m': 'BUY', '1h': 'BUY' }
  ]
  
  const getBadgeClass = (val) => {
    if (val === 'BUY') return 'text-[var(--color-success)] bg-[var(--color-success)]/10'
    if (val === 'SELL') return 'text-[var(--color-danger)] bg-[var(--color-danger)]/10'
    return 'text-[var(--color-neutral)] bg-[var(--color-neutral)]/10'
  }
  
  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-card)]">
        <h3 className="text-xs font-bold text-[var(--color-neutral)] uppercase tracking-widest">Multi-Timeframe Matrix</h3>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[#0B0F14]/30">
            <th className="px-6 py-4 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Asset</th>
            <th className="px-6 py-4 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">15m</th>
            <th className="px-6 py-4 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">30m</th>
            <th className="px-6 py-4 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest text-right">1h</th>
          </tr>
        </thead>
        <tbody className="text-sm font-medium">
          {data.map((row, i) => (
            <tr key={i} className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-card)] transition-colors group">
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  <span className="text-white font-bold group-hover:text-[#3B82F6] transition-colors">{row.asset}/USDT</span>
                </div>
              </td>
              <td className="px-6 py-4">
                  <span
                    role="status"
                    aria-label={`15 minute signal for ${row.asset}: ${row['15m']}`}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getBadgeClass(row['15m'])}`}
                  >
                   {row['15m']}
                 </span>
              </td>
              <td className="px-6 py-4">
                 <span
                   role="status"
                   aria-label={`30 minute signal for ${row.asset}: ${row['30m']}`}
                   className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getBadgeClass(row['30m'])}`}
                 >
                   {row['30m']}
                 </span>
              </td>
              <td className="px-6 py-4 text-right">
                 <span
                   role="status"
                   aria-label={`1 hour signal for ${row.asset}: ${row['1h']}`}
                   className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getBadgeClass(row['1h'])}`}
                 >
                   {row['1h']}
                 </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
