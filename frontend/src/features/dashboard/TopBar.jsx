import { NavLink, Link } from 'react-router-dom'
import { LogOut, User, Bell, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../app/router'
import Button from '../../shared/ui/Button'

export default function TopBar() {
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  return (
    <header className="h-16 border-b border-[var(--color-border)] bg-[var(--color-bg)] flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-xl font-bold tracking-tight text-white">
          CryptoQuant<span className="text-[var(--color-primary)]">AI</span>
        </Link>
        
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[var(--color-neutral)]">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `relative px-2 py-2 transition-colors ${
                isActive
                  ? `text-white font-semibold after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-[var(--color-primary)]`
                  : 'text-[var(--color-neutral)] hover:text-white'
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `relative px-2 py-2 transition-colors ${
                isActive
                  ? `text-white font-semibold after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-[var(--color-primary)]`
                  : 'text-[var(--color-neutral)] hover:text-white'
              }`
            }
          >
            Settings
          </NavLink>
          <a href="#" className="hover:text-white transition-colors">Markets</a>
          <a href="#" className="hover:text-white transition-colors">Alerts</a>
          <a href="#" className="hover:text-white transition-colors">Portfolio</a>
        </nav>

        {/* Mobile hamburger button */}
        <button
          className="lg:hidden p-2 text-[var(--color-neutral)] hover:text-white hover:bg-[var(--color-card)] rounded-lg transition-all"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-3 text-[var(--color-neutral)] hover:text-white hover:bg-[var(--color-card)] rounded-lg transition-all relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--color-primary)] rounded-full border border-[var(--color-bg)]"></span>
        </button>
        
        <div className="h-8 w-px bg-[var(--color-border)] mx-2"></div>
        
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-white leading-none">{user?.name}</div>
            <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest mt-1 font-bold">Pro Account</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)]">
            <User size={20} />
          </div>
          <button 
            onClick={logout}
            className="p-3 text-[var(--color-neutral)] hover:text-[var(--color-danger)] hover:bg-red-500/5 rounded-lg transition-all"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed top-16 right-0 bottom-0 w-72 bg-[var(--color-card)] border-l border-[var(--color-border)] z-50 lg:hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
              <span className="text-sm font-bold text-white uppercase tracking-widest">Menu</span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-[var(--color-neutral)] hover:text-white hover:bg-[var(--color-bg)] rounded-lg transition-all"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 p-4 flex flex-col gap-2">
              <NavLink
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-[var(--color-neutral)] hover:text-white hover:bg-[var(--color-bg)]'
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-[var(--color-neutral)] hover:text-white hover:bg-[var(--color-bg)]'
                  }`
                }
              >
                Settings
              </NavLink>
              <a 
                href="#" 
                className="px-4 py-3 rounded-lg font-medium text-[var(--color-neutral)] hover:text-white hover:bg-[var(--color-bg)] transition-colors"
              >
                Markets
              </a>
              <a 
                href="#" 
                className="px-4 py-3 rounded-lg font-medium text-[var(--color-neutral)] hover:text-white hover:bg-[var(--color-bg)] transition-colors"
              >
                Alerts
              </a>
              <a 
                href="#" 
                className="px-4 py-3 rounded-lg font-medium text-[var(--color-neutral)] hover:text-white hover:bg-[var(--color-bg)] transition-colors"
              >
                Portfolio
              </a>
            </nav>
          </div>
        </>
      )}
    </header>
  )
}
