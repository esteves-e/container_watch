import { useState, useEffect, Fragment } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import Image from 'next/image'
import { Dialog, Transition } from '@headlessui/react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false) // 🔥 NOVO: loading para botão

  const router = useRouter()

  const [showResetModal, setShowResetModal] = useState(false)
  const [resetEmail, setResetEmail] = useState('')

  const [showOTPModal, setShowOTPModal] = useState(false)
  const [otpEmail, setOtpEmail] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')

  useEffect(() => {
    // Garante que o React leia o autofill quando a página carrega
    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement | null
    const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement | null
  
    if (emailInput?.value) {
      setEmail(emailInput.value)
    }
  
    if (passwordInput?.value) {
      setPassword(passwordInput.value)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Login realizado com sucesso!')
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
      toast.error('Erro ao enviar e-mail: ' + error.message)
    } else {
      toast.success('E-mail de recuperação enviado!')
      setShowResetModal(false)
    }
  }

  const handleSendOTP = async () => {
    if (!otpEmail) return

    const { error } = await supabase.auth.signInWithOtp({
      email: otpEmail,
      options: { shouldCreateUser: false }
    })

    if (error) {
      toast.error(error.message)
    } else {
      setOtpSent(true)
      toast.success('Código enviado! Verifique seu e-mail.')
    }
  }

  const handleVerifyOTP = async () => {
    if (!otpEmail || !otpCode) return

    const { data, error } = await supabase.auth.verifyOtp({
      email: otpEmail,
      token: otpCode,
      type: 'email'
    })

    if (error) {
      toast.error('Erro: ' + error.message)
    } else {
      toast.success('Login realizado com sucesso!')
      localStorage.setItem('email', otpEmail)
      localStorage.setItem('role', data.user.user_metadata?.role || 'tecnico')
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">

      {/* Toast container */}
      <ToastContainer position="top-center" autoClose={3000} />

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

        <label className="block text-sm font-medium mb-1">E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full rounded mb-3"
          required
          autoComplete="email" // ✅ Adicionado
        />

        <label className="block text-sm font-medium mb-1">Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full rounded mb-4"
          required
          autoComplete="current-password" // ✅ Adicionado
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 flex justify-center items-center gap-2"
          disabled={!email || !password || loading}
          >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
          ) : (
            'Entrar'
          )}
        </button>

        <p
          className="text-sm text-blue-600 text-center mt-4 cursor-pointer hover:underline"
          onClick={() => setShowResetModal(true)}
        >
          Esqueceu sua senha?
        </p>

        <p
          className="text-sm text-blue-600 text-center mt-2 cursor-pointer hover:underline"
          onClick={() => {
            setShowOTPModal(true)
            setOtpEmail('')
            setOtpCode('')
            setOtpSent(false)
          }}
        >
          Logar via OTP
        </p>
      </form>

      {/* Modal de Recuperar Senha */}
      <Transition appear show={showResetModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowResetModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="bg-white rounded-xl p-6 shadow-lg w-full max-w-sm sm:max-w-xs">
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
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Modal de Login via OTP */}
      <Transition appear show={showOTPModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowOTPModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="bg-white rounded-xl p-6 shadow-lg w-full max-w-sm sm:max-w-xs">
                <Dialog.Title className="text-lg font-bold mb-4">Login via OTP</Dialog.Title>

                {!otpSent && (
                  <>
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
                  </>
                )}

                {otpSent && (
                  <>
                    <input
                      type="text"
                      placeholder="Código recebido"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
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
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={handleVerifyOTP}
                      >
                        Validar Código
                      </button>
                    </div>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}
