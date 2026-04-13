import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../shared/ui/Card'
import Input from '../shared/ui/Input'
import Button from '../shared/ui/Button'
import { useAuth } from '../app/router'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!name || !email || !password) {
      setError('Please fill in all fields')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    const result = await register(name, email, password)
    setLoading(false)

    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error || 'Registration failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col md:flex-row selection:bg-[#3B82F6] selection:text-white">
      {/* Left: Value Prop (Desktop only) */}
      <div className="hidden md:flex md:w-1/2 bg-[var(--color-card)] border-r border-[var(--color-border)] p-16 flex-col justify-center">
        <Link to="/" className="absolute top-8 left-8 text-xl font-bold tracking-tight text-white">
          CryptoQuant<span className="text-[#3B82F6]">AI</span>
        </Link>
        
        <div className="max-w-md">
          <h2 className="text-4xl font-bold mb-8 leading-tight">Join the next generation of <span className="text-[#3B82F6]">quant traders.</span></h2>
          <ul className="flex flex-col gap-6">
            <li className="flex gap-4 items-start">
              <CheckCircle2 className="text-[#22C55E] shrink-0 mt-1" size={20} />
              <div>
                <h4 className="font-bold text-white">Institutional Grade AI</h4>
                <p className="text-sm text-[var(--color-neutral)] mt-1">Access models previously only available to high-frequency hedge funds.</p>
              </div>
            </li>
            <li className="flex gap-4 items-start">
              <CheckCircle2 className="text-[#22C55E] shrink-0 mt-1" size={20} />
              <div>
                <h4 className="font-bold text-white">Zero Latency Signals</h4>
                <p className="text-sm text-[var(--color-neutral)] mt-1">Get immediate BUY/SELL alerts across 3 major cryptocurrencies.</p>
              </div>
            </li>
            <li className="flex gap-4 items-start">
              <CheckCircle2 className="text-[#22C55E] shrink-0 mt-1" size={20} />
              <div>
                <h4 className="font-bold text-white">Risk Managed Ideas</h4>
                <p className="text-sm text-[var(--color-neutral)] mt-1">Every trade comes with clear Take Profit and Stop Loss levels.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Right: Register Form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 relative">
        <Link to="/" className="md:hidden absolute top-8 left-8 text-[var(--color-neutral)] hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
          <ArrowLeft size={16} /> Back
        </Link>
        
        <div className="w-full max-w-sm">
          <div className="text-center md:text-left mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Create Account</h1>
            <p className="text-[var(--color-neutral)]">Start trading smarter today.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <Input 
              label="Full Name" 
              placeholder="John Doe" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="name@company.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input 
              label="Password" 
              type="password" 
              placeholder="Minimum 8 characters" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm font-medium text-center">
                {error}
              </div>
            )}
            
            <Button type="submit" className="w-full py-3" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Free Account'}
            </Button>
            
            <p className="text-xs text-[var(--color-text-muted)] text-center leading-relaxed">
              By creating an account, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
            </p>
          </form>
          
          <p className="text-center mt-8 text-sm text-[var(--color-neutral)]">
            Already have an account? <Link to="/login" className="text-[#3B82F6] font-bold hover:underline underline-offset-4">Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
