export default function Badge({ children, variant = 'neutral', className = '', ...props }) {
  const variants = {
    primary: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/30',
    success: 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20',
    danger: 'bg-[var(--color-danger)]/10 text-[var(--color-danger)] border-[var(--color-danger)]/20',
    neutral: 'bg-[var(--color-neutral)]/10 text-[var(--color-neutral)] border-[var(--color-neutral)]/20',
  }

    return (
    <span 
      className={`inline-flex items-center px-3 py-1 rounded text-sm font-semibold border ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
