import { useId } from 'react'

export default function Input({ label, error, className = '', id, ...props }) {
  const autoId = useId()
  const inputId = id || `input-${autoId}`

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-neutral)]">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        aria-label={label || props.placeholder || props.name || 'input'}
        className={`bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all duration-200 ${className} ${error ? 'border-[var(--color-danger)]' : ''}`}
        {...props}
      />
      {error && <span className="text-xs text-[var(--color-danger)]">{error}</span>}
    </div>
  )
}
