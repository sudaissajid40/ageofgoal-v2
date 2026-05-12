import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) return null

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*, user_roles(role)')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError
      
      // Flatten role for easier access
      const userProfile = {
        ...(profile || {}),
        role: (profile?.user_roles && profile.user_roles.length > 0) 
          ? profile.user_roles[0].role 
          : 'user'
      }
      
      return { ...user, profile: userProfile }

    },
    staleTime: 1000 * 60 * 10, // Cache user data for 10 minutes
  })
}
