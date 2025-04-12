import Link from 'next/link'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function Layout({ children }: Props) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Menu lateral visível em telas médias pra cima */}
      <aside className="hidden md:flex md:w-64 bg-blue-800 text-white flex-col p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Container Watch</h1>
          <p className="text-xs text-blue-200">Painel Administrativo</p>
        </div>
        <nav className="flex flex-col space-y-3 text-sm">
          <Link href="/dashboard" className="hover:underline">📦 Dashboard</Link>
          <Link href="/containers" className="hover:underline">✅ Formulários</Link>
          <Link href="/login" className="hover:underline">🔐 Login</Link>
        </nav>
      </aside>

      {/* Conteúdo principal se adapta ao tamanho da tela */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
    </div>
  )
}
