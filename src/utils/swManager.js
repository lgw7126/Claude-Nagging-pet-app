const SYNC_TAG = 'nagging-pet-check'
const SW_PATH = import.meta.env.BASE_URL + 'sw.js'
const SW_SCOPE = import.meta.env.BASE_URL

export async function registerSW() {
  if (!('serviceWorker' in navigator)) return null
  try {
    const reg = await navigator.serviceWorker.register(SW_PATH, { scope: SW_SCOPE })
    return reg
  } catch {
    return null
  }
}

// 앱 → SW로 pet 데이터 전송 (SW가 IDB에 저장해 백그라운드에서 사용)
export function syncPetsToSW(pets) {
  if (!('serviceWorker' in navigator)) return
  const msg = { type: 'SYNC_PETS', pets }
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(msg)
  } else {
    navigator.serviceWorker.ready.then((reg) => reg.active?.postMessage(msg))
  }
}

// Periodic Background Sync 등록 (Chrome Android)
export async function requestPeriodicSync() {
  if (!('serviceWorker' in navigator)) return false
  try {
    const reg = await navigator.serviceWorker.ready
    if (!('periodicSync' in reg)) return false
    await reg.periodicSync.register(SYNC_TAG, {
      minInterval: 6 * 60 * 60 * 1000, // 최소 6시간
    })
    return true
  } catch {
    return false
  }
}
