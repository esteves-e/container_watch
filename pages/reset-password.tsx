import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function ResetPassword() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleReset = async () => {
    setLoading(true)
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      console.error('Erro ao redefinir senha:', error.message)
      setStatus('error')
    } else {
      setStatus('success')
      setTimeout(() => router.push('/login'), 2000)
    }

    setLoading(false)
  }

  useEffect(() => {
    // Redireciona se não estiver autenticado com o token recovery
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push('/login')
      }
    })
  }, [router])

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-xl shadow">
      <h1 className="text-xl font-bold mb-4">Redefinir senha</h1>
      <input
        type="password"
        placeholder="Nova senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />
      <button
        onClick={handleReset}
        disabled={loading || !password}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        {loading ? 'Salvando...' : 'Atualizar senha'}
      </button>
      {status === 'success' && (
        <p className="text-green-600 mt-2 text-sm">Senha atualizada com sucesso!</p>
      )}
      {status === 'error' && (
        <p className="text-red-600 mt-2 text-sm">Erro ao atualizar senha. Tente novamente.</p>
      )}
    </div>
  )
}
