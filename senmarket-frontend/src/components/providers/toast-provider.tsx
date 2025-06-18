'use client'

import { Toaster } from '@/components/ui/sonner'

export function ToastProvider() {
  return (
    <Toaster 
      position="top-right"
      expand={true}
      richColors={true}
      closeButton={true}
      toastOptions={{
        duration: 4000,
        style: {
          fontFamily: 'Inter, system-ui, sans-serif',
        }
      }}
    />
  )
}
