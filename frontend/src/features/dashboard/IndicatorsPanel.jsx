import Card from '../../shared/ui/Card'

export default function IndicatorsPanel() {
  const indicators = [
    { name: 'RSI', value: '62', status: 'Bullish', color: '#22C55E' },
    { name: 'MACD', value: 'Positive', status: 'Strong', color: '#3B82F6' },
    { name: 'Volume', value: 'Increasing', status: 'Healthy', color: '#22C55E' },
    { name: 'Open Interest', value: 'Rising', status: 'Caution', color: '#EF4444' },
    { name: 'Funding', value: 'Neutral', status: 'Stable', color: '#9CA3AF' }
  ]
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
    {indicators.map((ind, i) => (
        <Card key={i} className="p-4 flex flex-col gap-2 hover:border-[#3B82F6]/30 transition-colors cursor-default group">
          <div className="text-[10px] text-[#4B5563] font-bold uppercase tracking-widest group-hover:text-[#9CA3AF] transition-colors">{ind.name}</div>
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
          <div className="w-full h-1 bg-[#0B0F14] rounded-full overflow-hidden mt-1">
             <div className="h-full" style={{ backgroundColor: ind.color, width: '60%' }}></div>
          </div>
        </Card>
      ))}
    </div>
  )
}
