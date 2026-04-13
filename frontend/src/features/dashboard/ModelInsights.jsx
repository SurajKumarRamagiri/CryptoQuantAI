import Card from '../../shared/ui/Card'
import { BrainCircuit, Fingerprint, Network } from 'lucide-react'

export default function ModelInsights() {
  const features = [
    { name: 'Trend Following', weight: 42, icon: Network },
    { name: 'Mean Reversion', weight: 28, icon: Fingerprint },
    { name: 'Volume Anomaly', weight: 30, icon: BrainCircuit }
  ]
  
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xs font-bold text-[var(--color-neutral)] uppercase tracking-widest mb-1">Model Insights</h3>
          <p className="text-xs text-[var(--color-text-muted)]">Internal neural network weight distribution for current signal.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></div>
              <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-widest">Training v4.2</span>
           </div>
        </div>
      </div>
      
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <f.icon size={16} className="text-[var(--color-primary)]" aria-hidden="true" />
                <span className="text-sm font-bold text-white" id={`mi-${i}-label`}>{f.name}</span>
              </div>
              <span className="text-sm font-bold text-[var(--color-primary)]">{f.weight}%</span>
            </div>
            <div className="h-2 w-full bg-[var(--color-bg)] rounded-full overflow-hidden" role="presentation">
               <div
                 role="progressbar"
                 aria-labelledby={`mi-${i}-label`}
                 aria-valuemin={0}
                 aria-valuemax={100}
                 aria-valuenow={f.weight}
                  className="h-full bg-[var(--color-primary)] elev-sm" 
                 style={{ width: `${f.weight}%` }}
               ></div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 pt-6 border-t border-[var(--color-border)] flex flex-wrap gap-6 items-center">
        <div className="flex flex-col gap-1">
          <div className="text-[9px] text-[var(--color-text-muted)] font-bold uppercase tracking-widest">Reasoning Path</div>
          <div className="text-[11px] text-[var(--color-neutral)] italic">"Strong support confluence with increasing momentum and buy-side volume surge."</div>
        </div>
      </div>
    </Card>
  )
}
