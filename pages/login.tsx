import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

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

  const handleForgotPassword = async () => {
    const inputEmail = prompt('Digite seu e-mail para redefinir a senha:')
    if (!inputEmail) return

    const { error } = await supabase.auth.resetPasswordForEmail(inputEmail, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (error) {
      alert('Erro ao enviar e-mail de recuperação: ' + error.message)
    } else {
      alert('E-mail de recuperação enviado! Verifique sua caixa de entrada.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        
        {/* LOGO CENTRALIZADO */}
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png" // Substitua pelo nome real do arquivo, se for diferente
            alt="Logo ContainerWatch"
            width={100}
            height={100}
            className="object-contain"
          />
        </div>

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
          onClick={handleForgotPassword}
        >
          Esqueceu sua senha?
        </p>
      </form>
    </div>
  )
}
