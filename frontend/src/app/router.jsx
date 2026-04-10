/* eslint-disable react-refresh/only-export-components */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, createContext, useContext, useEffect } from 'react'
import Landing from '../pages/Landing'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Dashboard from '../pages/Dashboard'
import Settings from '../pages/Settings'

const AuthContext = createContext(null)

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1'

async function fetchAuth(endpoint, data) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
      mode: 'cors',
    })
    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.detail || `Request failed (${response.status})`)
    }
    return result.data
  } catch (error) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server. Make sure backend is running on port 8000.')
    }
    throw error
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      setUser({ email: 'User', name: 'Trader' })
    }
    setLoading(false)
  }, [])
  
  const login = async (email, password) => {
    try {
      const data = await fetchAuth('/auth/login', { email, password })
      localStorage.setItem('access_token', data.access_token)
      setUser({ email, name: data.display_name || 'Trader' })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
  
  const register = async (name, email, password) => {
    try {
      await fetchAuth('/auth/register', { display_name: name, email, password })
      const loginResult = await login(email, password)
      return loginResult
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
  
  const logout = () => {
    localStorage.removeItem('access_token')
    setUser(null)
  }
  
  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
