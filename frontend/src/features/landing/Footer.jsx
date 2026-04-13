import { Link } from 'react-router-dom'
import { Send, ExternalLink } from 'lucide-react'

const SocialIcon = ({ children }) => (
  <span className="w-5 h-5 flex items-center justify-center">{children}</span>
)

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="relative bg-[var(--color-bg)] border-t border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-1 flex flex-col items-center md:items-start">
            <Link to="/" className="text-2xl font-bold tracking-tight mb-6">
              <span className="text-white">CryptoQuant</span>
              <span className="text-[var(--color-primary)]">AI</span>
            </Link>
            <p className="text-[var(--color-neutral)] text-sm leading-relaxed mb-6 max-w-sm text-center">
              Institutional-grade AI signals for retail traders. 
              Trade with precision, confidence, and the power of machine learning.
            </p>
            
            {/* Newsletter */}
            <div className="flex gap-2 max-w-sm w-full">
              <label className="sr-only">Email for newsletter</label>
              <input 
                type="email" 
                placeholder="Enter your email"
                aria-label="Enter your email for newsletter"
                className="flex-1 px-4 py-3 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl text-white text-sm placeholder-[var(--color-neutral-dark)] focus:outline-none focus:border-[var(--color-primary)]/50"
              />
              <button aria-label="Subscribe to newsletter" className="px-5 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-xl transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Product */}
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider text-center">Product</h4>
            <ul className="flex flex-col gap-4 text-sm text-[var(--color-neutral)] text-center">
              <li><a href="#" className="hover:text-white transition-colors">Dashboard</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Live Signals</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Access</a></li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider text-center">Company</h4>
            <ul className="flex flex-col gap-4 text-sm text-[var(--color-neutral)] text-center">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 pt-8 border-t border-[var(--color-border)]/50">
          <div className="flex items-center gap-6">
            <p className="text-[var(--color-neutral-dark)] text-sm">
              © {currentYear} CryptoQuant AI. All rights reserved.
            </p>
          </div>
        </div>
        
        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-[var(--color-card)]/50 rounded-xl">
          <p className="text-xs text-[var(--color-neutral-dark)] text-center leading-relaxed">
            <strong>Disclaimer:</strong> Trading cryptocurrencies involves significant risk. 
            Our AI predictions are for informational purposes only and should not be considered financial advice. 
            Always conduct your own research before making investment decisions.
          </p>
        </div>
      </div>
    </footer>
  )
}