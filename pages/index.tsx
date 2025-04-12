// pages/index.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const email = localStorage.getItem('email')
    const role = localStorage.getItem('role')

    // Redireciona caso não esteja autenticado
    if (!email || !role) {
      router.replace('/login')
      return
    }

    // Redireciona baseado na role
    switch (role) {
      case 'gerente':
        router.replace('/dashboard')
        break
      case 'tecnico':
      case 'auditor':
        router.replace('/containers')
        break
      default:
        router.replace('/login')
        break
    }

    setChecking(false)
  }, [router])

  return checking ? (
    <div className="h-screen flex items-center justify-center">
      <p className="text-gray-600 text-sm">Redirecionando...</p>
    </div>
  ) : null
}
