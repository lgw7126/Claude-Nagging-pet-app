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
  const json = JSON.stringify(pets)
  const encoded = btoa(encodeURIComponent(json))
  const url = new URL(window.location.href)
  url.search = ''
  url.searchParams.set('data', encoded)
  return url.toString()
}

export function decodeFromUrl() {
  const params = new URLSearchParams(window.location.search)
  const encoded = params.get('data')
  if (!encoded) return null
  try {
    const json = decodeURIComponent(atob(encoded))
    return JSON.parse(json)
  } catch {
    return null
  }
}
