import { useState } from 'react'
import { requestPermission, getPermission, isSupported } from '../utils/notifications'

export default function NotificationBanner({ onGranted }) {
  const [status, setStatus] = useState(getPermission)
  const [loading, setLoading] = useState(false)

  if (!isSupported() || status === 'granted' || status === 'denied') return null

  async function handleEnable() {
    setLoading(true)
    const result = await requestPermission()
    setStatus(result)
    if (result === 'granted') onGranted?.()
    setLoading(false)
  }

  return (
    <div className="rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-3 flex items-center justify-between gap-3">
      <p className="text-sm text-blue-700 dark:text-blue-300 leading-snug">
        🔔 알림을 켜면 투약일이 다가올 때 알려드려요
      </p>
      <button
        onClick={handleEnable}
        disabled={loading}
        className="shrink-0 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-60"
      >
        {loading ? '...' : '허용'}
      </button>
    </div>
  )
}
