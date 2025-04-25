import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import Image from 'next/image'
import { Dialog } from '@headlessui/react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const [showResetModal, setShowResetModal] = useState(false)
  const [resetEmail, setResetEmail] = useState('')

  const [showOTPModal, setShowOTPModal] = useState(false)
  const [otpEmail, setOtpEmail] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      localStorage.setItem('email', email)
      localStorage.setItem('role', data.user.user_metadata?.role || 'tecnico')
      router.push('/dashboard')
    }
  }

  const handleSendReset = async () => {
    if (!resetEmail) return

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (error) {
      setError(error.message)
    } else {
      alert('E-mail de recuperação enviado! Verifique sua caixa de entrada.')
      setShowResetModal(false)
    }
  }

  const handleSendOTP = async () => {
    if (!otpEmail) return

    const { error } = await supabase.auth.signInWithOtp({
      email: otpEmail,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    })

    if (error) {
      setError(error.message)
    } else {
      alert('Link mágico enviado! Verifique sua caixa de entrada.')
      setShowOTPModal(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">

      {/* Logo */}
      <div className="mb-2">
        <Image
          src="/logo.png"
          alt="Logo ContainerWatch"
          width={300}
          height={300}
          className="object-contain"
        />
      </div>

      {/* Formulário principal */}
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <label className="block text-sm font-medium mb-1">E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full rounded mb-3"
          required
        />

        <label className="block text-sm font-medium mb-1">Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full rounded mb-4"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Entrar
        </button>

        <p
          className="text-sm text-blue-600 text-center mt-4 cursor-pointer hover:underline"
          onClick={() => setShowResetModal(true)}
        >
          Esqueceu sua senha?
        </p>

        <p
          className="text-sm text-blue-600 text-center mt-2 cursor-pointer hover:underline"
          onClick={() => setShowOTPModal(true)}
        >
          Logar via OTP
        </p>
      </form>

      {/* Modal de Recuperar Senha */}
      <Dialog open={showResetModal} onClose={() => setShowResetModal(false)} className="fixed inset-0 flex items-center justify-center z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative z-50">
          <Dialog.Title className="text-lg font-bold mb-4">Recuperar Senha</Dialog.Title>
          <input
            type="email"
            placeholder="Seu e-mail"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            className="border p-2 w-full rounded mb-4"
          />
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              onClick={() => setShowResetModal(false)}
            >
              Cancelar
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={handleSendReset}
            >
              Enviar
            </button>
          </div>
        </div>
      </Dialog>

      {/* Modal de Login OTP */}
      <Dialog open={showOTPModal} onClose={() => setShowOTPModal(false)} className="fixed inset-0 flex items-center justify-center z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative z-50">
          <Dialog.Title className="text-lg font-bold mb-4">Login via OTP</Dialog.Title>
          <input
            type="email"
            placeholder="Seu e-mail"
            value={otpEmail}
            onChange={(e) => setOtpEmail(e.target.value)}
            className="border p-2 w-full rounded mb-4"
          />
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              onClick={() => setShowOTPModal(false)}
            >
              Cancelar
            </button>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={handleSendOTP}
            >
              Enviar Código
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
