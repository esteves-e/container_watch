import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function Login() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'login' | 'verify'>('login')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSendOtp = async () => {
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) {
      setMessage(error.message)
    } else {
      setStep('verify')
      setMessage('Código enviado! Verifique seu e-mail.')
    }
    setLoading(false)
  }

  const handleVerifyOtp = async () => {
    setLoading(true)
    setMessage('')
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    const user = data.user
    const userEmail = user?.email
    const userRole = data?.user?.user_metadata?.role
    
    if (!userEmail || !userRole) {
      setMessage('Acesso não autorizado. Role não encontrada.')
      setLoading(false)
      return
    }

    localStorage.setItem('email', userEmail)
    localStorage.setItem('role', userRole)

    router.push('/dashboard')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold text-center">Login com código</h1>

        {step === 'login' ? (
          <>
            <input
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 w-full rounded"
              onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
            />
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700"
            >
              {loading ? 'Enviando...' : 'Enviar código'}
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Digite o código recebido"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="border p-2 w-full rounded"
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
            />
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded w-full hover:bg-green-700"
            >
              {loading ? 'Verificando...' : 'Entrar'}
            </button>
          </>
        )}

        {message && (
          <p className="text-sm text-center text-red-600 mt-2">{message}</p>
        )}
      </div>
    </div>
  )
}
