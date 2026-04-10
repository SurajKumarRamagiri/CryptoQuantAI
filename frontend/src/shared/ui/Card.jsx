export default function Card({ children, className = '', role = 'group', ...props }) {
  // Default role 'group' assists accessibility tools when cards contain controls
  return (
    <div 
      role={role}
      className={`bg-[#121821] border border-[#2D3748] rounded-xl overflow-hidden shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
