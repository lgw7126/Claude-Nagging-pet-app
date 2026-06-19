import { useState } from 'react'
import { calcDDay, STATUS_STYLES } from '../utils/dday'
import PetCard from './PetCard'

export default function PetGroup({ petName, routines, onMarkDone, onEdit, onDelete }) {
  const [open, setOpen] = useState(true)

  // 가장 급한 루틴의 상태로 그룹 헤더 색상 결정
  const worstDday = Math.min(...routines.map((p) => calcDDay(p.lastDoneDate, p.intervalDays)))
  const worstStatus =
    worstDday > 7 ? 'good' : worstDday >= 1 ? 'soon' : worstDday === 0 ? 'today' : 'late'
  const style = STATUS_STYLES[worstStatus]
  const photo = routines.find((p) => p.photo)?.photo ?? null

  const ddayLabel =
    worstDday > 0 ? `D-${worstDday}` : worstDday === 0 ? 'D-Day' : `D+${Math.abs(worstDday)}`

  return (
    <div className="space-y-2">
      {/* 그룹 헤더 */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center gap-3 rounded-2xl border-2 ${style.border} bg-gradient-to-br ${style.bg} px-4 py-3 text-left`}
      >
        {photo ? (
          <img src={photo} alt={petName} className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm shrink-0" />
        ) : (
          <div className="h-10 w-10 rounded-full bg-white/70 flex items-center justify-center text-xl shadow-sm shrink-0">
            {style.emoji}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-black text-gray-800">{petName}</p>
          <p className="text-xs text-gray-500">{routines.length}개 루틴</p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${style.badge}`}>
          {ddayLabel}
        </span>
        <span className="text-gray-400 text-sm ml-1">{open ? '▲' : '▼'}</span>
      </button>

      {/* 개별 루틴 카드 */}
      {open && (
        <div className="pl-3 space-y-2 border-l-2 border-pink-100 dark:border-slate-700">
          {routines.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              onMarkDone={onMarkDone}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
