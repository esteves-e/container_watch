// migrateRoles.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function migrateRoles() {
  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 })

  if (error) {
    console.error('Erro ao buscar usuários:', error.message)
    return
  }

  const users = data?.users || []

  for (const user of users) {
    const rawRole = (user as any).raw_user_meta_data?.role || user.user_metadata?.role
    if (!rawRole) continue

    console.log(`Atualizando ${user.email} com role: ${rawRole}`)

    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: { role: rawRole }
    })

    if (updateError) {
      console.error(`Erro ao atualizar ${user.email}:`, updateError.message)
    }
  }

  console.log('✅ Migração concluída.')
}

migrateRoles()
