import { useState } from 'react'

const today = new Date().toISOString().split('T')[0]

const EMPTY = {
  petName: '',
  routineName: '',
  intervalDays: 30,
  lastDoneDate: today,
}

export default function AddRoutineForm({ onAdd, onClose }) {
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
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
    })
    setForm(EMPTY)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">새 루틴 등록 🐾</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">
              반려동물 이름
            </label>
            <input
              name="petName"
              value={form.petName}
              onChange={handleChange}
              placeholder="예: 초코, 망고"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">
              루틴 이름
            </label>
            <input
              name="routineName"
              value={form.routineName}
              onChange={handleChange}
              placeholder="예: 심장사상충, 구충제"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-semibold text-gray-600">
                주기 (일)
              </label>
              <input
                name="intervalDays"
                type="number"
                min="1"
                max="365"
                value={form.intervalDays}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-semibold text-gray-600">
                마지막 투약일
              </label>
              <input
                name="lastDoneDate"
                type="date"
                max={today}
                value={form.lastDoneDate}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">
              {error}
            </p>
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
