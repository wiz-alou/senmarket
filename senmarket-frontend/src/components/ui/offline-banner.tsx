'use client'

import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, Wifi } from 'lucide-react'

export function OfflineBanner() {
  const isOnline = useOnlineStatus()

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-2 text-center text-sm font-medium"
        >
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="h-4 w-4" />
            <span>Vous êtes hors ligne. Certaines fonctionnalités peuvent être limitées.</span>
          </div>
        </motion.div>
      )}
      
      {/* {isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white px-4 py-2 text-center text-sm font-medium"
        >
          <div className="flex items-center justify-center gap-2">
            <Wifi className="h-4 w-4" />
            <span>Connexion rétablie</span>
          </div>
        </motion.div>
      )} */}
    </AnimatePresence>
  )
}
