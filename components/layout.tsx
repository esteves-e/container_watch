import Link from 'next/link'
import { ReactNode, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import Image from 'next/image'
import { Transition } from '@headlessui/react'

interface Props {
  children: ReactNode
}

export default function Layout({ children }: Props) {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.clear()
    router.push('/login')
  }

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col md:flex-row relative">
      {/* Botão hamburguer no mobile */}
      <div className="flex md:hidden items-center justify-between bg-blue-800 text-white p-4">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Logo ContainerWatch" width={40} height={40} className="object-contain" />
          <span className="font-bold text-lg">Container Watch</span>
        </div>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="focus:outline-none">
          ☰
        </button>
      </div>

      {/* Menu lateral desktop */}
      <aside className="hidden md:flex md:w-72 bg-blue-800 text-white flex-col justify-between py-8 px-4">
        <div className="flex flex-col items-center">
          <div className="w-full flex justify-center mb-6">
            <Image src="/logo.png" alt="Logo ContainerWatch" width={180} height={180} className="object-contain" priority />
          </div>

          <h1 className="text-2xl font-bold text-center">Container Watch</h1>
          <p className="text-xs text-blue-300 text-center mt-1">Painel Administrativo</p>

          <nav className="flex flex-col space-y-4 text-sm mt-10 w-full items-center">
            <Link href="/dashboard" className="hover:underline">📦 Dashboard</Link>
            <Link href="/respostas" className="hover:underline">✅ Formulários</Link>
          </nav>
        </div>

        <div className="w-full flex flex-col items-center gap-4 mt-10">
          <button onClick={toggleDarkMode} className="text-sm text-white bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded">
            {darkMode ? '🌞 Modo Claro' : '🌚 Modo Escuro'}
          </button>
          <button onClick={handleLogout} className="text-sm text-white bg-red-600 hover:bg-red-700 px-5 py-2 rounded">
            🚪 Sair
          </button>
        </div>
      </aside>

      {/* Drawer mobile */}
      <Transition
        show={isMenuOpen}
        enter="transition ease-out duration-300"
        enterFrom="transform -translate-x-full"
        enterTo="transform translate-x-0"
        leave="transition ease-in duration-200"
        leaveFrom="transform translate-x-0"
        leaveTo="transform -translate-x-full"
      >
        <aside className="fixed top-0 left-0 z-40 w-64 h-full bg-blue-800 text-white flex flex-col justify-between py-8 px-4 md:hidden">
          <div className="flex flex-col items-center">
            <div className="w-full flex justify-center mb-6">
              <Image src="/logo.png" alt="Logo ContainerWatch" width={150} height={150} className="object-contain" priority />
            </div>

            <h1 className="text-2xl font-bold text-center">Container Watch</h1>
            <p className="text-xs text-blue-300 text-center mt-1">Painel Administrativo</p>

            <nav className="flex flex-col space-y-4 text-sm mt-10 w-full items-center">
              <Link href="/dashboard" className="hover:underline" onClick={() => setIsMenuOpen(false)}>📦 Dashboard</Link>
              <Link href="/respostas" className="hover:underline" onClick={() => setIsMenuOpen(false)}>✅ Formulários</Link>
            </nav>
          </div>

          <div className="w-full flex flex-col items-center gap-4 mt-10">
            <button onClick={() => { toggleDarkMode(); setIsMenuOpen(false) }} className="text-sm text-white bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded">
              {darkMode ? '🌞 Modo Claro' : '🌚 Modo Escuro'}
            </button>
            <button onClick={() => { handleLogout(); setIsMenuOpen(false) }} className="text-sm text-white bg-red-600 hover:bg-red-700 px-5 py-2 rounded">
              🚪 Sair
            </button>
          </div>
        </aside>
      </Transition>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col justify-between pt-16 md:pt-0">
        <main className="p-4 md:p-8 overflow-y-auto flex-grow">{children}</main>

        <footer className="bg-gray-200 dark:bg-gray-800 text-center text-sm text-gray-600 dark:text-gray-300 py-3">
          © 2025 Container Watch. Todos os direitos reservados.
        </footer>
      </div>
    </div>
  )
}
