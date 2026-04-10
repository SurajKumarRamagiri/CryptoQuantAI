import { NavLink, Link } from 'react-router-dom'
import { LogOut, User, Bell } from 'lucide-react'
import { useAuth } from '../../app/router'
import Button from '../../shared/ui/Button'

export default function TopBar() {
  const { user, logout } = useAuth()
  
  return (
    <header className="h-16 border-b border-[#2D3748] bg-[#0B0F14] flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-xl font-bold tracking-tight text-white">
          CryptoQuant<span className="text-[#3B82F6]">AI</span>
        </Link>
        
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#9CA3AF]">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `relative px-2 py-2 transition-colors ${
                isActive
                  ? `text-white font-semibold after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-[#3B82F6]`
                  : 'text-[#9CA3AF] hover:text-white'
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
                  ? `text-white font-semibold after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-[#3B82F6]`
                  : 'text-[#9CA3AF] hover:text-white'
              }`
            }
          >
            Settings
          </NavLink>
          <a href="#" className="hover:text-white transition-colors">Markets</a>
          <a href="#" className="hover:text-white transition-colors">Alerts</a>
          <a href="#" className="hover:text-white transition-colors">Portfolio</a>
        </nav>
      </div>
      
        <div className="flex items-center gap-4">
        <button className="p-3 text-[#9CA3AF] hover:text-white hover:bg-[#121821] rounded-lg transition-all relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#3B82F6] rounded-full border border-[#0B0F14]"></span>
        </button>
        
        <div className="h-8 w-px bg-[#2D3748] mx-2"></div>
        
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-white leading-none">{user?.name}</div>
            <div className="text-[10px] text-[#4B5563] uppercase tracking-widest mt-1 font-bold">Pro Account</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center text-[#3B82F6]">
            <User size={20} />
          </div>
          <button 
            onClick={logout}
            className="p-3 text-[#9CA3AF] hover:text-[#EF4444] hover:bg-red-500/5 rounded-lg transition-all"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}
