import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

export default function FinalCTA() {
  const benefits = [
    'No credit card required',
    'Cancel anytime',
    'Priority support'
  ]
  
  return (
    <section className="relative py-32 bg-[#0B0F14] overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#3B82F6]/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Main CTA content */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Start Trading Smarter Today
          </h2>
          <p className="text-xl text-[#9CA3AF] max-w-2xl mx-auto mb-8">
            Join 10,000+ traders using AI to navigate market complexity with precision and confidence.
          </p>
        </div>

        {/* Benefits */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2 text-[#9CA3AF]">
              <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex justify-center">
          <Link 
            to="/register"
            className="group relative px-10 py-5 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-[#3B82F6]/30 hover:scale-[1.02]"
          >
            <span className="flex items-center gap-3">
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>

        {/* Trust message */}
        <p className="mt-8 text-sm text-[#6B7280]">
          Trusted by traders from 50+ countries
        </p>
      </div>
    </section>
  )
}