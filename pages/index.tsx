// pages/index.tsx
import { GetServerSidePropsContext } from 'next'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabase = createServerSupabaseClient(ctx)
  const { data: { session } } = await supabase.auth.getSession()

  if (!session || !session.user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  const role = session.user.user_metadata?.role

  if (role === 'gerente') {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    }
  } else if (role === 'tecnico' || role === 'auditor') {
    return {
      redirect: {
        destination: '/containers',
        permanent: false,
      },
    }
  } else {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }
}

export default function Home() {
  return null
}
