import { useId } from 'react'

export default function Input({ label, error, className = '', id, ...props }) {
  const autoId = useId()
  const inputId = id || `input-${autoId}`

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-[#9CA3AF]">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        aria-label={label || props.placeholder || props.name || 'input'}
        className={`bg-[#0B0F14] border border-muted rounded-lg px-4 py-2.5 text-white placeholder-[#4B5563] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 ${className} ${error ? 'border-red-500' : ''}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
