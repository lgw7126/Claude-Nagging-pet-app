import { useState, useRef } from 'react'
import { resizeImageToBase64 } from '../utils/image'

const today = new Date().toISOString().split('T')[0]

export default function AddRoutineForm({ onAdd, onClose, editData, existingPets = [] }) {
  const isEdit = Boolean(editData)

  // 기존 반려동물 목록 (이름 중복 제거, 최신 사진 우선)
  const knownPets = !isEdit
    ? Object.values(
        existingPets.reduce((acc, p) => {
          if (!acc[p.petName] || p.photo) acc[p.petName] = p
          return acc
        }, {})
      )
    : []

  const [form, setForm] = useState(
    editData
      ? {
          petName: editData.petName,
          routineName: editData.routineName,
          intervalDays: editData.intervalDays,
          lastDoneDate: editData.lastDoneDate,
          photo: editData.photo ?? null,
        }
      : { petName: '', routineName: '', intervalDays: 30, lastDoneDate: today, photo: null }
  )
  const [preview, setPreview] = useState(editData?.photo ?? null)
  const [error, setError] = useState('')
  const [photoLoading, setPhotoLoading] = useState(false)
  const fileRef = useRef()

  function selectKnownPet(p) {
    setForm((prev) => ({ ...prev, petName: p.petName, photo: p.photo ?? null }))
    setPreview(p.photo ?? null)
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    // 같은 이름의 반려동물이 이미 있으면 사진 자동 재사용
    if (name === 'petName' && !isEdit) {
      const existing = existingPets.find((p) => p.petName === value.trim() && p.photo)
      if (existing) {
        setPreview(existing.photo)
        setForm((prev) => ({ ...prev, petName: value, photo: existing.photo }))
      } else if (!form.photo) {
        setPreview(null)
      }
    }
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

  function removePhoto() {
    setPreview(null)
    setForm((prev) => ({ ...prev, photo: null }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.petName.trim()) return setError('반려동물 이름을 입력해 주세요.')
    if (!form.routineName.trim()) return setError('루틴 이름을 입력해 주세요.')
    if (!form.lastDoneDate) return setError('마지막 투약일을 입력해 주세요.')
    if (Number(form.intervalDays) < 1) return setError('주기는 1일 이상이어야 합니다.')
    setError('')
    onAdd({
      id: isEdit ? editData.id : crypto.randomUUID(),
      petName: form.petName.trim(),
      routineName: form.routineName.trim(),
      intervalDays: Number(form.intervalDays),
      lastDoneDate: form.lastDoneDate,
      photo: form.photo,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-t-3xl bg-white dark:bg-slate-800 shadow-xl max-h-[90dvh] flex flex-col">
        {/* 헤더 - 고정 */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-100 dark:border-slate-700 shrink-0">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {isEdit ? '루틴 수정 ✏️' : '새 루틴 등록 🐾'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        {/* 기존 반려동물 빠른 선택 */}
        {knownPets.length > 0 && (
          <div className="px-6 pt-4 pb-1 shrink-0">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2">
              기존 반려동물 선택
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {knownPets.map((p) => (
                <button
                  key={p.petName}
                  type="button"
                  onClick={() => selectKnownPet(p)}
                  className={`flex flex-col items-center gap-1 shrink-0 rounded-2xl px-3 py-2 border-2 transition-all active:scale-95 ${
                    form.petName === p.petName
                      ? 'border-pink-400 bg-pink-50 dark:bg-pink-950/40'
                      : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700'
                  }`}
                >
                  {p.photo ? (
                    <img src={p.photo} alt={p.petName} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-slate-600 flex items-center justify-center text-xl">
                      🐾
                    </div>
                  )}
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 max-w-[60px] truncate">
                    {p.petName}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 폼 내용 - 스크롤 가능 */}
        <form id="routine-form" onSubmit={handleSubmit} className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
          {/* 사진 업로드 */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="h-16 w-16 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-slate-500 hover:border-pink-400 transition-colors"
              >
                {photoLoading ? (
                  <span className="text-xs text-gray-400">...</span>
                ) : preview ? (
                  <img src={preview} alt="preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl">📷</span>
                )}
              </button>
              {preview && (
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-400 text-white text-xs flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="text-sm text-gray-400 dark:text-gray-500">
              <p className="font-medium text-gray-600 dark:text-gray-300">반려동물 사진</p>
              <p>탭하여 {preview ? '변경' : '추가'} (선택)</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
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
            <p className="rounded-lg bg-red-50 dark:bg-red-950/40 px-3 py-2 text-sm text-red-500">{error}</p>
          )}
        </form>

        {/* 등록 버튼 - 항상 화면에 보임 */}
        <div className="px-6 pb-6 pt-3 shrink-0 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700">
          <button
            type="submit"
            form="routine-form"
            className="w-full rounded-xl bg-pink-400 py-3 font-bold text-white shadow-md hover:bg-pink-500 active:scale-95 transition-all"
          >
            {isEdit ? '수정 완료 ✅' : '등록하기 🐾'}
          </button>
        </div>
      </div>
    </div>
  )
}
