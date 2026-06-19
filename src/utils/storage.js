import LZString from 'lz-string'
import { syncPetsToSW } from './swManager'

const PETS_KEY = 'nagging-pet-data'
const HISTORY_KEY = 'nagging-pet-history'
const THEME_KEY = 'nagging-pet-theme'

export function loadPets() {
  try {
    const raw = localStorage.getItem(PETS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function savePets(pets) {
  localStorage.setItem(PETS_KEY, JSON.stringify(pets))
  syncPetsToSW(pets)
}

export function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

export function addHistoryEntry(history, entry) {
  const updated = [entry, ...history].slice(0, 200)
  saveHistory(updated)
  return updated
}

export function loadTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || 'light'
  } catch {
    return 'light'
  }
}

export function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme)
}

export function encodeToUrl(pets) {
  // id·photo 제외, 키 이름 단축(n/r/i/d)으로 URL 최소화
  const slim = pets.map(({ petName: n, routineName: r, intervalDays: i, lastDoneDate: d }) => ({ n, r, i, d }))
  const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(slim))
  const url = new URL(window.location.href)
  url.search = ''
  url.searchParams.set('d', compressed)
  return url.toString()
}

export function decodeFromUrl() {
  const params = new URLSearchParams(window.location.search)
  // 새 형식(d=) 우선, 구 형식(data=) 하위 호환
  const compressed = params.get('d')
  const legacy = params.get('data')
  if (!compressed && !legacy) return null
  try {
    if (compressed) {
      const raw = JSON.parse(LZString.decompressFromEncodedURIComponent(compressed))
      // 단축 키(n/r/i/d) 형식이면 복원, 구형식(petName…) 이면 그대로
      return raw.map((p) =>
        'n' in p
          ? { id: crypto.randomUUID(), petName: p.n, routineName: p.r, intervalDays: Number(p.i), lastDoneDate: p.d, photo: null }
          : p
      )
    }
    return JSON.parse(decodeURIComponent(atob(legacy)))
  } catch {
    return null
  }
}
