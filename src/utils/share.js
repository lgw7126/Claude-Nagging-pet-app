import { encodeToUrl } from './storage'
import { calcDDay } from './dday'

export function buildShareContent(pets) {
  const url = encodeToUrl(pets)

  const lines = pets.slice(0, 5).map((pet) => {
    const dday = calcDDay(pet.lastDoneDate, pet.intervalDays)
    const label = dday > 0 ? `D-${dday}` : dday === 0 ? 'D-Day' : `D+${Math.abs(dday)}`
    const emoji = dday > 7 ? '✅' : dday >= 1 ? '⚠️' : dday === 0 ? '🔔' : '🚨'
    return `${emoji} ${pet.petName} ${pet.routineName} ${label}`
  })

  const text = `우리 반려동물 케어 현황을 공유해요!\n\n${lines.join('\n')}`

  return { title: '🐾 잔소리펫 - 반려동물 케어 현황', text, url }
}

export async function shareToKakao(pets) {
  const { title, text, url } = buildShareContent(pets)

  if (navigator.share) {
    await navigator.share({ title, text, url })
    return 'shared'
  }

  await navigator.clipboard.writeText(url)
  return 'copied'
}
