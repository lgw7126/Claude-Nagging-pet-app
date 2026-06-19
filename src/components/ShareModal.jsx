import { useState } from 'react'
import { calcDDay } from '../utils/dday'
import { shareToKakao } from '../utils/share'

const STATUS = (dday) =>
  dday > 7 ? 'good' : dday >= 1 ? 'soon' : dday === 0 ? 'today' : 'late'

const EMOJI = { good: '✅', soon: '⚠️', today: '🔔', late: '🚨' }
const BADGE = {
  good: 'bg-green-100 text-green-700',
  soon: 'bg-yellow-100 text-yellow-700',
  today: 'bg-orange-100 text-orange-700',
  late: 'bg-red-100 text-red-700',
}

export default function ShareModal({ pets, onClose }) {
  const [state, setState] = useState('idle') // idle | sharing | done | copied

  async function handleShare() {
    setState('sharing')
    try {
      const result = await shareToKakao(pets)
      setState(result === 'copied' ? 'copied' : 'done')
      if (result === 'copied') setTimeout(() => setState('idle'), 2500)
    } catch {
      setState('idle')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-white dark:bg-slate-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            공유 미리보기
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        {/* 카드 미리보기 */}
        <div className="mx-6 rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-600 shadow-sm mb-5">
          {/* 카드 헤더 */}
          <div className="bg-gradient-to-r from-pink-400 to-fuchsia-500 px-5 py-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white text-lg">🐾</span>
              <span className="text-white/80 text-sm font-semibold">잔소리펫</span>
            </div>
            <p className="text-white text-xl font-black leading-tight">
              반려동물 케어 현황
            </p>
          </div>

          {/* 카드 바디 */}
          <div className="bg-white dark:bg-slate-700 px-5 py-4 space-y-3">
            {pets.length === 0 ? (
              <p className="text-sm text-gray-400">등록된 루틴이 없어요</p>
            ) : (
              pets.slice(0, 4).map((pet) => {
                const dday = calcDDay(pet.lastDoneDate, pet.intervalDays)
                const st = STATUS(dday)
                const label =
                  dday > 0 ? `D-${dday}` : dday === 0 ? 'D-Day' : `D+${Math.abs(dday)}`
                return (
                  <div key={pet.id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {pet.photo ? (
                        <img
                          src={pet.photo}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <span className="text-base shrink-0">{EMOJI[st]}</span>
                      )}
                      <span className="text-sm text-gray-700 dark:text-gray-200 truncate">
                        {pet.petName} · {pet.routineName}
                      </span>
                    </div>
                    <span
                      className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${BADGE[st]}`}
                    >
                      {label}
                    </span>
                  </div>
                )
              })
            )}
            {pets.length > 4 && (
              <p className="text-xs text-gray-400">외 {pets.length - 4}개 루틴</p>
            )}
          </div>

          {/* 카드 푸터 */}
          <div className="bg-gray-50 dark:bg-slate-750 border-t border-gray-100 dark:border-slate-600 px-5 py-3">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              링크를 열면 데이터가 자동으로 동기화돼요
            </p>
          </div>
        </div>

        {/* 카카오톡 공유 버튼 */}
        <div className="px-6 pb-8 space-y-3">
          <button
            onClick={handleShare}
            disabled={state === 'sharing'}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#FEE500] py-4 font-bold text-[#3C1E1E] text-[15px] shadow-md hover:bg-yellow-300 active:scale-95 transition-all disabled:opacity-60"
          >
            {/* 카카오 말풍선 아이콘 */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#3C1E1E">
              <path d="M12 3C6.48 3 2 6.69 2 11.26c0 2.87 1.74 5.39 4.36 6.97L5.2 21l4.24-2.07c.83.17 1.7.26 2.56.26 5.52 0 10-3.69 10-8.26S17.52 3 12 3z" />
            </svg>
            {state === 'sharing'
              ? '공유 중...'
              : state === 'copied'
              ? '✅ 링크 복사됨! 카톡에 붙여넣기하세요'
              : '카카오톡으로 공유하기'}
          </button>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500">
            카카오톡 친구 · 채팅방 목록에서 선택할 수 있어요
          </p>
        </div>
      </div>
    </div>
  )
}
