// pages/index.tsx
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const email = localStorage.getItem('email')
    const role = localStorage.getItem('role')

    // Se não estiver autenticado, redireciona para o login
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
  }, [router])

  return null // Não renderiza nada enquanto redireciona
}
