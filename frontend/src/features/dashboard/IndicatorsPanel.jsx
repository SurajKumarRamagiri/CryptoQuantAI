import Card from '../../shared/ui/Card'

export default function IndicatorsPanel() {
  const indicators = [
    { name: 'RSI', value: '62', status: 'Bullish', color: 'var(--color-success)' },
    { name: 'MACD', value: 'Positive', status: 'Strong', color: 'var(--color-primary)' },
    { name: 'Volume', value: 'Increasing', status: 'Healthy', color: 'var(--color-success)' },
    { name: 'Open Interest', value: 'Rising', status: 'Caution', color: 'var(--color-danger)' },
    { name: 'Funding', value: 'Neutral', status: 'Stable', color: 'var(--color-neutral)' }
  ]
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
    {indicators.map((ind, i) => (
        <Card key={i} className="p-4 flex flex-col gap-2 hover:border-[var(--color-primary)]/30 transition-colors cursor-default group">
          <div className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-widest group-hover:text-[var(--color-neutral)] transition-colors">{ind.name}</div>
          <div className="flex items-baseline justify-between gap-2">
            <div className="text-lg font-bold text-white">{ind.value}</div>
            <div
              role="status"
              aria-label={`${ind.name} status: ${ind.status}`}
              className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase"
              style={{ backgroundColor: `${ind.color}15`, color: ind.color }}
            >
              {ind.status}
            </div>
          </div>
          <div className="w-full h-1 bg-[var(--color-bg)] rounded-full overflow-hidden mt-1">
             <div className="h-full" style={{ backgroundColor: ind.color, width: '60%' }}></div>
          </div>
        </Card>
      ))}
    </div>
  )
}
