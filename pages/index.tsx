// pages/index.tsx
import { GetServerSidePropsContext } from 'next'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { validRoles, Role } from '../lib/roles'

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabase = createServerSupabaseClient(ctx)
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Se não estiver autenticado, redireciona para o login
  if (!session?.user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  const role = session.user.user_metadata?.role as Role | undefined

  if (!role || !validRoles.includes(role)) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  // Redireciona conforme a role
  const destination =
    role === 'gerente' ? '/dashboard' : '/containers'

  return {
    redirect: {
      destination,
      permanent: false,
    },
  }
}

export default function Home() {
  return null
}
