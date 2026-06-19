import { useState, useRef } from 'react'
import { resizeImageToBase64 } from '../utils/image'

export default function DoneModal({ pet, onConfirm, onClose }) {
  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()

  async function handlePhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    try {
      const base64 = await resizeImageToBase64(file, 400)
      setPhoto(base64)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-white dark:bg-slate-800 shadow-2xl px-6 pt-6 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            투약 완료 인증 📸
          </h2>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:text-gray-600 text-xl">
            ✕
          </button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
          <span className="font-bold text-gray-700 dark:text-gray-200">{pet.petName}</span>의{' '}
          <span className="font-bold text-pink-500">{pet.routineName}</span> 완료 사진을 찍어서 인증해 주세요 🐾
        </p>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full h-44 rounded-2xl bg-gray-50 dark:bg-slate-700 border-2 border-dashed border-gray-200 dark:border-slate-600 flex flex-col items-center justify-center gap-2 hover:border-pink-300 active:scale-95 transition-all mb-5 overflow-hidden"
        >
          {loading ? (
            <span className="text-gray-400 text-sm">사진 처리 중...</span>
          ) : photo ? (
            <img src={photo} alt="증거 사진" className="w-full h-full object-cover" />
          ) : (
            <>
              <span className="text-5xl">📷</span>
              <span className="text-sm text-gray-400 font-medium">탭해서 사진 찍기 / 업로드</span>
              <span className="text-xs text-gray-300 dark:text-gray-500">약 먹이는 순간을 찍어주세요</span>
            </>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePhoto}
        />

        <button
          onClick={() => photo && onConfirm(photo)}
          disabled={!photo || loading}
          className="w-full rounded-2xl bg-pink-400 py-4 font-bold text-white text-[15px] shadow-md hover:bg-pink-500 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {photo ? '완료했어요 ✅' : '📷 사진을 먼저 찍어주세요'}
        </button>
      </div>
    </div>
  )
}
