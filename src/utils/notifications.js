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

export function checkAndNotify(pets) {
  if (!isSupported() || Notification.permission !== 'granted') return
  for (const pet of pets) {
    const dday = calcDDay(pet.lastDoneDate, pet.intervalDays)
    let body = null
    if (dday < 0) {
      body = `${pet.routineName} 약이 ${Math.abs(dday)}일이나 늦었어... 나 삐진다...`
    } else if (dday === 0) {
      body = `오늘이 바로 ${pet.routineName} 날이야! 빨리 줘!!`
    } else if (dday <= 3) {
      body = `주인아! ${dday}일 뒤에 ${pet.routineName} 하는 날인 거 안 잊었지?`
    }
    if (body) {
      new Notification(`🐾 ${pet.petName}의 잔소리`, {
        body,
        tag: `nagging-pet-${pet.id}`,
        renotify: false,
      })
    }
  }
}
