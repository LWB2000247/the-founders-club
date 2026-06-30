import { supabase } from '@/integrations/supabase/client'

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getCurrentProfile() {
  const user = await getCurrentUser()
  if (!user) return null
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  return data
}

export async function isAdmin(userId?: string) {
  if (!userId) {
    const user = await getCurrentUser()
    if (!user) return false
    userId = user.id
  }
  const { data } = await supabase.rpc('has_role', {
    _user_id: userId,
    _role: 'admin',
  })
  return data === true
}

export async function signOut() {
  await supabase.auth.signOut()
}
