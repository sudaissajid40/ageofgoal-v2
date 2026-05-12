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
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError
      
      return { ...user, profile }
    },
    staleTime: 1000 * 60 * 10, // Cache user data for 10 minutes
  })
}
