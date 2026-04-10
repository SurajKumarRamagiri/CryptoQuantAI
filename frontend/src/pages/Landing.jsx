import Hero from '../features/landing/Hero'
import LiveSignalPreview from '../features/landing/LiveSignalPreview'
import ValueProp from '../features/landing/ValueProp'
import PerformanceProof from '../features/landing/PerformanceProof'
import FinalCTA from '../features/landing/FinalCTA'
import Footer from '../features/landing/Footer'
import { Link } from 'react-router-dom'
import { useAuth } from '../app/router'
import { Brain, Search, Zap } from 'lucide-react'

export default function Landing() {
  const { user } = useAuth()
  
  return (
    <div className="min-h-screen bg-[#0B0F14] text-white selection:bg-[#3B82F6] selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B0F14]/90 backdrop-blur-xl border-b border-[#2D3748]/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold tracking-tight">
            <span className="text-white">CryptoQuant</span>
            <span className="text-[#3B82F6]">AI</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-[#9CA3AF] hover:text-white transition-colors">Features</a>
            <a href="#signals" className="text-sm text-[#9CA3AF] hover:text-white transition-colors">Live Signals</a>
            <a href="#performance" className="text-sm text-[#9CA3AF] hover:text-white transition-colors">Performance</a>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <Link 
                to="/dashboard" 
                className="px-5 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg font-semibold text-sm transition-all"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-[#9CA3AF] hover:text-white transition-colors">
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-5 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg font-semibold text-sm transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      
      <main className="pt-20">
        <Hero />
        <div id="signals">
          <LiveSignalPreview />
        </div>
        <div id="features">
          <ValueProp />
        </div>
        <div id="performance">
          <PerformanceProof />
        </div>
        
        {/* How It Works */}
        <section className="relative py-32 bg-[#0B0F14] overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-0 right-0 h-[400px] bg-gradient-to-b from-[#0B0F14] via-[#3B82F6]/5 to-[#0B0F14]" />
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                How It Works
              </h2>
              <p className="text-lg text-[#9CA3AF] max-w-2xl mx-auto text-center leading-relaxed">
                Three simple steps to start trading with AI-powered precision
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="relative group">
                <div className="p-8 rounded-3xl bg-[#121821] border border-[#2D3748] hover:border-[#3B82F6]/30 transition-all duration-500 h-full text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#3B82F6]/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Search className="w-8 h-8 text-[#3B82F6]" />
                  </div>
                  <div className="text-5xl font-bold text-[#2D3748] mb-4 group-hover:text-[#3B82F6]/20 transition-colors">01</div>
                  <h3 className="text-xl font-bold text-white mb-3">Analyze Markets</h3>
                  <p className="text-[#9CA3AF]">
                    Our AI processes millions of data points from global exchanges in real-time, identifying patterns and opportunities.
                  </p>
                </div>
              </div>
              
              <div className="relative group">
                <div className="p-8 rounded-3xl bg-[#121821] border border-[#2D3748] hover:border-[#3B82F6]/30 transition-all duration-500 h-full text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#3B82F6]/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Brain className="w-8 h-8 text-[#3B82F6]" />
                  </div>
                  <div className="text-5xl font-bold text-[#2D3748] mb-4 group-hover:text-[#3B82F6]/20 transition-colors">02</div>
                  <h3 className="text-xl font-bold text-white mb-3">AI Prediction</h3>
                  <p className="text-[#9CA3AF]">
                    Deep learning models calculate probability scores and generate signals with confidence levels for each timeframe.
                  </p>
                </div>
              </div>
              
              <div className="relative group">
                <div className="p-8 rounded-3xl bg-[#121821] border border-[#2D3748] hover:border-[#3B82F6]/30 transition-all duration-500 h-full text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#3B82F6]/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-8 h-8 text-[#3B82F6]" />
                  </div>
                  <div className="text-5xl font-bold text-[#2D3748] mb-4 group-hover:text-[#3B82F6]/20 transition-colors">03</div>
                  <h3 className="text-xl font-bold text-white mb-3">Execute with Confidence</h3>
                  <p className="text-[#9CA3AF]">
                    Receive actionable signals with entry points, take profit, and stop loss levels. Trade with precision and clarity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <FinalCTA />
      </main>
      
      <Footer />
    </div>
  )
}