import Link from 'next/link'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function Layout({ children }: Props) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-blue-800 text-white flex flex-col p-6 space-y-6">
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

      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
    
  )
}
