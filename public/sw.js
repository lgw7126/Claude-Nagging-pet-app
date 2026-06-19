const DB_NAME = 'nagging-pet-db'
const STORE_NAME = 'pets'
const SYNC_TAG = 'nagging-pet-check'

// ── IndexedDB helpers ──────────────────────────────────────

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror = reject
  })
}

async function getPets() {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const req = tx.objectStore(STORE_NAME).getAll()
      req.onsuccess = () => resolve(req.result || [])
      req.onerror = reject
    })
  } catch {
    return []
  }
}

async function putPets(pets) {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.clear()
    for (const pet of pets) store.put(pet)
  } catch {}
}

// ── D-Day 계산 ─────────────────────────────────────────────

function calcDDay(lastDoneDate, intervalDays) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const last = new Date(lastDoneDate)
  last.setHours(0, 0, 0, 0)
  const next = new Date(last)
  next.setDate(next.getDate() + intervalDays)
  return Math.round((next - today) / 86400000)
}

// ── 알림 발송 ──────────────────────────────────────────────

async function checkAndNotify() {
  const pets = await getPets()
  const base = self.registration.scope

  for (const pet of pets) {
    const dday = calcDDay(pet.lastDoneDate, pet.intervalDays)
    if (dday > 3) continue

    let body
    let requireInteraction = false

    if (dday < 0) {
      body = `${pet.routineName} 약이 ${Math.abs(dday)}일이나 늦었어... 빨리 줘! 🚨`
      requireInteraction = true
    } else if (dday === 0) {
      body = `오늘이 바로 ${pet.routineName} 날이야! 빨리 줘!! 🔔`
      requireInteraction = true
    } else {
      body = `${dday}일 뒤에 ${pet.routineName} 하는 날인 거 안 잊었지? ⚠️`
    }

    await self.registration.showNotification(`🐾 ${pet.petName}의 잔소리`, {
      body,
      tag: `nagging-${pet.id}`,
      renotify: true,
      requireInteraction,
      icon: base + 'og-image.svg',
      badge: base + 'og-image.svg',
      data: { url: base },
    })
  }
}

// ── SW 이벤트 ──────────────────────────────────────────────

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

// 메인 스레드 → SW 로 pet 데이터 동기화
self.addEventListener('message', (e) => {
  if (e.data?.type === 'SYNC_PETS') {
    putPets(e.data.pets)
  }
})

// 백그라운드 주기 체크 (Chrome Android)
self.addEventListener('periodicsync', (e) => {
  if (e.tag === SYNC_TAG) {
    e.waitUntil(checkAndNotify())
  }
})

// 알림 탭 → 앱 열기
self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  const target = e.notification.data?.url || self.registration.scope
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (c.url.startsWith(self.registration.scope) && 'focus' in c) return c.focus()
      }
      return clients.openWindow(target)
    })
  )
})
