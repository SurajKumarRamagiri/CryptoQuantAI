import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // Could be extended to send to analytics
    // console.error('ErrorBoundary caught', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-xl text-center bg-[#071018] border border-[#2D3748] rounded-lg p-8">
            <h2 className="text-xl font-bold mb-2 text-white">Something went wrong</h2>
            <p className="text-sm text-[#9CA3AF] mb-4">An unexpected error occurred while loading this part of the app.</p>
            <pre className="text-xs text-[#EF4444] whitespace-pre-wrap">{String(this.state.error)}</pre>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
