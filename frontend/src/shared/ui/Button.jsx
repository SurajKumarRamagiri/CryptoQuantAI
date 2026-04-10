export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  ...props 
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 cursor-pointer'
  
  const variants = {
    primary: 'btn-primary text-white hover:bg-primary-hover',
    secondary: 'bg-[#121821] text-[#9CA3AF] border border-[#2D3748] hover:bg-[#1A2332] hover:text-white',
    success: 'btn-success text-white hover:bg-[#16A34A]',
    danger: 'btn-danger text-white hover:bg-[#DC2626]',
    ghost: 'bg-transparent text-[#9CA3AF] hover:bg-[#121821] hover:text-white'
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
