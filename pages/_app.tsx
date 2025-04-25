import '../styles/globals.css'
import 'nprogress/nprogress.css'
import type { AppProps } from 'next/app'
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import NProgress from 'nprogress'

NProgress.configure({ showSpinner: false, speed: 400, minimum: 0.1 })

export default function App({ Component, pageProps }: AppProps) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient())
  const router = useRouter()

  useEffect(() => {
    let timer: NodeJS.Timeout

    const handleStart = () => {
      NProgress.start()
    }

    const handleStop = () => {
      // Garante que o NProgress dure no mínimo 400ms
      timer = setTimeout(() => {
        NProgress.done()
      }, 0)
    }

    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleStop)
    router.events.on('routeChangeError', handleStop)

    return () => {
      clearTimeout(timer)
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleStop)
      router.events.off('routeChangeError', handleStop)
    }
  }, [router])

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <Component {...pageProps} />
    </SessionContextProvider>
  )
}
