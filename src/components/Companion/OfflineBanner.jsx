import React from 'react'
import { WifiOff } from 'lucide-react'
import useOnlineStatus from '../../hooks/useOnlineStatus'

const OfflineBanner = () => {
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <div className="fixed top-0 inset-x-0 z-[60] bg-slate-700 text-white text-sm px-4 py-2.5 flex items-center justify-center gap-2 shadow-md">
      <WifiOff className="w-4 h-4 flex-shrink-0" />
      <span>You're offline. Changes will sync when you reconnect.</span>
    </div>
  )
}

export default OfflineBanner
