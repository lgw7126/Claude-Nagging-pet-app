import { calcDDay } from './dday'

export function isSupported() {
  return 'Notification' in window
}

export async function requestPermission() {
  if (!isSupported()) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  return await Notification.requestPermission()
}

export function getPermission() {
  if (!isSupported()) return 'unsupported'
  return Notification.permission
}

// 완료 전까지 앱을 열 때마다, 그리고 2시간마다 재알림
export function checkAndNotify(pets) {
  if (!isSupported() || Notification.permission !== 'granted') return

  for (const pet of pets) {
    const dday = calcDDay(pet.lastDoneDate, pet.intervalDays)
    if (dday > 3) continue // 여유 있으면 알림 없음

    let body = null
    let urgency = 'low'

    if (dday < 0) {
      body = `${pet.routineName} 약이 ${Math.abs(dday)}일이나 늦었어... 빨리 줘! 🚨`
      urgency = 'high'
    } else if (dday === 0) {
      body = `오늘이 바로 ${pet.routineName} 날이야! 빨리 줘!! 🔔`
      urgency = 'high'
    } else if (dday <= 3) {
      body = `${dday}일 뒤에 ${pet.routineName} 하는 날인 거 안 잊었지? ⚠️`
      urgency = 'low'
    }

    if (body) {
      try {
        // Android Chrome with SW requires showNotification; new Notification() throws there
        new Notification(`🐾 ${pet.petName}의 잔소리`, {
          body,
          tag: `nagging-pet-${pet.id}-${urgency}`,
          renotify: true,
          requireInteraction: urgency === 'high',
        })
      } catch {}
    }
  }
}
