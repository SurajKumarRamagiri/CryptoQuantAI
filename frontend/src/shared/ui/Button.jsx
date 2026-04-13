export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  ...props 
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 cursor-pointer'
  
  const variants = {
    primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]',
    secondary: 'bg-[var(--color-card)] text-[var(--color-neutral)] border border-[var(--color-border)] hover:bg-[var(--color-accent)] hover:text-white',
    success: 'bg-[var(--color-success)] text-white hover:bg-[var(--color-success)]',
    danger: 'bg-[var(--color-danger)] text-white hover:bg-[var(--color-danger)]',
    ghost: 'bg-transparent text-[var(--color-neutral)] hover:bg-[var(--color-card)] hover:text-white'
  }
  
  // Ensure touch targets meet recommended minimums (44x44px)
  const sizes = {
    sm: 'px-3 py-2 text-sm min-h-[40px]',
    md: 'px-5 py-3 text-base min-h-[44px]',
    lg: 'px-7 py-3.5 text-lg min-h-[48px]'
  }
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
