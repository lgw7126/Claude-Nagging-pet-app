import { useState } from 'react'
import { encodeToUrl } from '../utils/storage'

export default function ShareBanner({ pets }) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = encodeToUrl(pets)
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      prompt('아래 URL을 복사하세요:', url)
    }
  }

  return (
    <button
      onClick={handleShare}
      disabled={pets.length === 0}
      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-300 py-3 font-bold text-yellow-900 shadow-md hover:bg-yellow-400 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {copied ? (
        <>✅ URL이 복사됐어요! 카톡으로 공유해 보세요</>
      ) : (
        <>💬 가족에게 카톡 공유하기</>
      )}
    </button>
  )
}
