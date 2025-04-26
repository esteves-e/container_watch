import Link from 'next/link'
import { ReactNode } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import Image from 'next/image'

interface Props {
  children: ReactNode
}

export default function Layout({ children }: Props) {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.clear()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Menu lateral */}
      <aside className="hidden md:flex md:w-72 bg-blue-800 text-white flex-col justify-between py-8 px-4">
        <div className="flex flex-col items-center">
          {/* ✅ Logo centralizada e maior */}
          <div className="w-full flex justify-center mb-6">
            <Image
              src="/logo.png"
              alt="Logo ContainerWatch"
              width={180}
              height={180}
              className="object-contain"
              priority
            />
          </div>

          <h1 className="text-2xl font-bold text-center">Container Watch</h1>
          <p className="text-xs text-blue-300 text-center mt-1">Painel Administrativo</p>

          {/* Navegação */}
          <nav className="flex flex-col space-y-4 text-sm mt-10 w-full items-center">
            <Link href="/dashboard" className="hover:underline">📦 Dashboard</Link>
            <Link href="/respostas" className="hover:underline">✅ Formulários</Link>
          </nav>
        </div>

        {/* Botão de logout */}
        <div className="w-full flex justify-center mt-10">
          <button
            onClick={handleLogout}
            className="text-sm text-white bg-red-600 hover:bg-red-700 px-5 py-2 rounded"
          >
            🚪 Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col justify-between">
        <main className="p-4 md:p-8 overflow-y-auto flex-grow">{children}</main>

        <footer className="bg-gray-200 text-center text-sm text-gray-600 py-3">
          © 2025 Container Watch. Todos os direitos reservados.
        </footer>
      </div>
    </div>
  )
}
