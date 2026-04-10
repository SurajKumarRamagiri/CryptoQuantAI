import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../shared/ui/Card'
import Input from '../shared/ui/Input'
import Button from '../shared/ui/Button'
import { useAuth } from '../app/router'
import { ArrowLeft } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    const result = await login(email, password)
    setLoading(false)

    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error || 'Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0F14] flex flex-col items-center justify-center p-6 selection:bg-[#3B82F6] selection:text-white">
      <Link to="/" className="absolute top-8 left-8 text-[#9CA3AF] hover:text-white transition-colors flex items-center gap-2 text-sm font-medium group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome Back</h1>
          <p className="text-[#9CA3AF]">Access your high-precision trading signals</p>
        </div>
        
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="name@company.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm font-medium text-center">
                {error}
              </div>
            )}
            
            <Button type="submit" className="w-full py-3" disabled={loading}>
              {loading ? 'Logging in...' : 'Login to Dashboard'}
            </Button>
            
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#2D3748]"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#121821] px-2 text-[#4B5563] font-medium tracking-widest">Or continue with</span></div>
            </div>
            
            <Button variant="secondary" type="button" className="w-full py-3 flex items-center justify-center gap-3">
               <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
               </svg>
               Google Account
            </Button>
          </form>
        </Card>
        
        <p className="text-center mt-8 text-sm text-[#9CA3AF]">
          Don't have an account? <Link to="/register" className="text-[#3B82F6] font-bold hover:underline underline-offset-4">Create one for free</Link>
        </p>
      </div>
    </div>
  )
}
