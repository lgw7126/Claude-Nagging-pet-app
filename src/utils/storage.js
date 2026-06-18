const STORAGE_KEY = 'nagging-pet-data'

export function loadPets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function savePets(pets) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pets))
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
