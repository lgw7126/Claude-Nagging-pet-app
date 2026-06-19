import { useState, useRef } from 'react'
import { resizeImageToBase64 } from '../utils/image'

const today = new Date().toISOString().split('T')[0]

const EMPTY = {
  petName: '',
  routineName: '',
  intervalDays: 30,
  lastDoneDate: today,
  photo: null,
}

export default function AddRoutineForm({ onAdd, onClose }) {
  const [form, setForm] = useState(EMPTY)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const [photoLoading, setPhotoLoading] = useState(false)
  const fileRef = useRef()

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handlePhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoLoading(true)
    try {
      const base64 = await resizeImageToBase64(file)
      setPreview(base64)
      setForm((prev) => ({ ...prev, photo: base64 }))
    } catch {
      setError('사진을 불러오는 데 실패했어요.')
    } finally {
      setPhotoLoading(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.petName.trim()) return setError('반려동물 이름을 입력해 주세요.')
    if (!form.routineName.trim()) return setError('루틴 이름을 입력해 주세요.')
    if (!form.lastDoneDate) return setError('마지막 투약일을 입력해 주세요.')
    if (Number(form.intervalDays) < 1) return setError('주기는 1일 이상이어야 합니다.')
    setError('')
    onAdd({
      id: crypto.randomUUID(),
      petName: form.petName.trim(),
      routineName: form.routineName.trim(),
      intervalDays: Number(form.intervalDays),
      lastDoneDate: form.lastDoneDate,
      photo: form.photo,
    })
    setForm(EMPTY)
    setPreview(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-t-3xl bg-white dark:bg-slate-800 p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">새 루틴 등록 🐾</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 사진 업로드 */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="h-16 w-16 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-slate-500 hover:border-pink-400 transition-colors shrink-0"
            >
              {photoLoading ? (
                <span className="text-xs text-gray-400">...</span>
              ) : preview ? (
                <img src={preview} alt="preview" className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl">📷</span>
              )}
            </button>
            <div className="text-sm text-gray-400 dark:text-gray-500">
              <p className="font-medium text-gray-600 dark:text-gray-300">반려동물 사진</p>
              <p>탭하여 사진 추가 (선택)</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhoto}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600 dark:text-gray-300">
              반려동물 이름
            </label>
            <input
              name="petName"
              value={form.petName}
              onChange={handleChange}
              placeholder="예: 초코, 망고"
              className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 dark:text-gray-100 px-4 py-3 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600 dark:text-gray-300">
              루틴 이름
            </label>
            <input
              name="routineName"
              value={form.routineName}
              onChange={handleChange}
              placeholder="예: 심장사상충, 구충제"
              className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 dark:text-gray-100 px-4 py-3 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-semibold text-gray-600 dark:text-gray-300">
                주기 (일)
              </label>
              <input
                name="intervalDays"
                type="number"
                min="1"
                max="365"
                value={form.intervalDays}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 dark:text-gray-100 px-4 py-3 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-semibold text-gray-600 dark:text-gray-300">
                마지막 투약일
              </label>
              <input
                name="lastDoneDate"
                type="date"
                max={today}
                value={form.lastDoneDate}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 dark:text-gray-100 px-4 py-3 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-pink-400 py-3 font-bold text-white shadow-md hover:bg-pink-500 active:scale-95 transition-all"
          >
            등록하기 🐾
          </button>
        </form>
      </div>
    </div>
  )
}
