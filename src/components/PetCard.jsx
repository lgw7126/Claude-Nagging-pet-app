import { useState } from 'react'
import { calcDDay, getNaggingMessage, STATUS_STYLES } from '../utils/dday'
import DoneModal from './DoneModal'

export default function PetCard({ pet, onMarkDone, onEdit, onDelete }) {
  const [showDoneModal, setShowDoneModal] = useState(false)

  const dday = calcDDay(pet.lastDoneDate, pet.intervalDays)
  const { text, status } = getNaggingMessage(pet.petName, pet.routineName, dday)
  const style = STATUS_STYLES[status]

  const ddayLabel =
    dday > 0 ? `D-${dday}` : dday === 0 ? 'D-Day' : `D+${Math.abs(dday)}`

  function handleConfirm(proofPhoto) {
    onMarkDone(pet.id, proofPhoto)
    setShowDoneModal(false)
  }

  return (
    <>
      <div
        className={`rounded-2xl border-2 ${style.border} bg-gradient-to-br ${style.bg} p-4 shadow-sm`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            {pet.photo ? (
              <img
                src={pet.photo}
                alt={pet.petName}
                className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-white/70 flex items-center justify-center text-2xl shadow-sm shrink-0">
                {style.emoji}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-bold text-gray-800 truncate">{pet.petName}</p>
              <p className="text-sm text-gray-500 truncate">
                {pet.routineName} · {pet.intervalDays}일 주기
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {pet.streak >= 2 && (
              <span className="text-xs font-bold text-orange-500">🔥 {pet.streak}연속</span>
            )}
            <span className={`rounded-full px-3 py-1 text-sm font-bold ${style.badge}`}>
              {ddayLabel}
            </span>
          </div>
        </div>

        <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-sm font-medium text-gray-700 leading-relaxed">
          "{text}"
        </p>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-xs text-gray-400">마지막: {pet.lastDoneDate}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDoneModal(true)}
              className="rounded-lg bg-white/80 px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm hover:bg-white active:scale-95 transition-all"
            >
              완료했어요 ✅
            </button>
            <button
              onClick={() => onEdit(pet)}
              className="rounded-lg bg-white/80 px-3 py-1 text-xs font-semibold text-gray-500 shadow-sm hover:bg-white active:scale-95 transition-all"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(pet.id)}
              className="rounded-lg bg-white/80 px-3 py-1 text-xs font-semibold text-gray-400 shadow-sm hover:bg-white active:scale-95 transition-all"
            >
              🗑
            </button>
          </div>
        </div>
      </div>

      {showDoneModal && (
        <DoneModal
          pet={pet}
          onConfirm={handleConfirm}
          onClose={() => setShowDoneModal(false)}
        />
      )}
    </>
  )
}
