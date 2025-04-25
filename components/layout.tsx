import Link from 'next/link'
import { ReactNode } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

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
      {/* Menu lateral (visível em md+) */}
      <aside className="hidden md:flex md:w-64 bg-blue-800 text-white flex-col justify-between p-6">
        <div>
          <h1 className="text-2xl font-bold">Container Watch</h1>
          <p className="text-xs text-blue-200">Painel Administrativo</p>

          <nav className="flex flex-col space-y-3 text-sm mt-6">
            <Link href="/dashboard" className="hover:underline">📦 Dashboard</Link>
            <Link href="/respostas" className="hover:underline">✅ Formulários</Link>
          </nav>
        </div>

        {/* Botão de logout */}
        <button
          onClick={handleLogout}
          className="text-sm text-white bg-red-600 hover:bg-red-700 px-3 py-2 rounded mt-6"
        >
          🚪 Sair
        </button>
      </aside>

      {/* Conteúdo principal com rodapé */}
      <div className="flex-1 flex flex-col justify-between">
        <main className="p-4 md:p-8 overflow-y-auto flex-grow">{children}</main>

        {/* Rodapé */}
        <footer className="bg-gray-200 text-center text-sm text-gray-600 py-3">
          © 2025 Container Watch. Todos os direitos reservados.
        </footer>
      </div>
    </div>
  )
}
