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
  return localStorage.getItem(THEME_KEY) || 'light'
}

export function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme)
}

export function encodeToUrl(pets) {
  // 사진(base64)은 URL에 포함하지 않아 길이 최소화
  const slim = pets.map(({ photo: _photo, ...rest }) => rest)
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
      return JSON.parse(LZString.decompressFromEncodedURIComponent(compressed))
    }
    return JSON.parse(decodeURIComponent(atob(legacy)))
  } catch {
    return null
  }
}
