'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { X, Megaphone, ExternalLink } from 'lucide-react'
import { useState } from 'react'

export function AdminBanner() {
  const [isVisible, setIsVisible] = useState(true)

  const { data: banner } = useQuery({
    queryKey: ['active-banner'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .single()
      
      if (error) return null
      return data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  })

  if (!banner || !isVisible) return null

  return (
    <div className="relative isolate flex items-center gap-x-6 overflow-hidden bg-orange-600 px-6 py-2.5 sm:px-3.5 sm:before:flex-1">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="text-sm leading-6 text-white">
          <strong className="font-semibold">{banner.title}</strong>
          <svg viewBox="0 0 2 2" className="mx-2 inline h-0.5 w-0.5 fill-current" aria-hidden="true">
            <circle cx="1" cy="1" r="1" />
          </svg>
          {banner.description}
        </p>
        {banner.cta_label && (
          <a
            href={banner.cta_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-none rounded-full bg-gray-900 px-3.5 py-1 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          >
            {banner.cta_label} <ExternalLink className="ml-1 inline h-3 w-3" />
          </a>
        )}
      </div>
      <div className="flex flex-1 justify-end">
        <button type="button" onClick={() => setIsVisible(false)} className="-m-3 p-3 focus-visible:outline-offset-[-4px]">
          <span className="sr-only">Dismiss</span>
          <X className="h-5 w-5 text-white" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
