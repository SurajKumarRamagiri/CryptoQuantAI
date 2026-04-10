export default function Badge({ children, variant = 'neutral', className = '', ...props }) {
  const variants = {
    primary: 'bg-primary-10 text-primary border-primary-30',
    success: 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20',
    danger: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20',
    neutral: 'bg-[#9CA3AF]/10 text-[#9CA3AF] border-[#9CA3AF]/20',
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
