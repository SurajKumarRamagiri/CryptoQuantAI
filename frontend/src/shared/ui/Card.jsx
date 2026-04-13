export default function Card({ children, className = '', role = 'group', ...props }) {
  // Default role 'group' assists accessibility tools when cards contain controls
  return (
    <div 
      role={role}
      className={`bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
