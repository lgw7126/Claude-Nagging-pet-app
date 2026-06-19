import { useState, useEffect, useCallback, useRef } from 'react'
import {
  loadPets, savePets, decodeFromUrl,
  loadHistory, saveHistory, addHistoryEntry,
  loadTheme, saveTheme,
} from './utils/storage'
import { checkAndNotify, getPermission } from './utils/notifications'
import { syncPetsToSW } from './utils/swManager'
import PetCard from './components/PetCard'
import AddRoutineForm from './components/AddRoutineForm'
import ShareBanner from './components/ShareBanner'
import ShareModal from './components/ShareModal'
import PetFilter from './components/PetFilter'
import HistoryLog from './components/HistoryLog'
import NotificationBanner from './components/NotificationBanner'

const NOTIFY_INTERVAL_MS = 2 * 60 * 60 * 1000
const STREAK_MILESTONES = [3, 5, 10, 20, 30, 50, 100]

function calcDayRaw(pet) {
  const today = new Date(); today.setHours(0,0,0,0)
  const last = new Date(pet.lastDoneDate); last.setHours(0,0,0,0)
  const next = new Date(last); next.setDate(next.getDate() + pet.intervalDays)
  return Math.round((next - today) / 86400000)
}

export default function App() {
  const [pets, setPets] = useState([])
  const [history, setHistory] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingPet, setEditingPet] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [selectedPet, setSelectedPet] = useState(null)
  const [importBanner, setImportBanner] = useState(false)
  const [successToast, setSuccessToast] = useState('')
  const [dark, setDark] = useState(() => loadTheme() === 'dark')
  const petsRef = useRef(pets)
  petsRef.current = pets

  useEffect(() => {
    const html = document.documentElement
    html.classList.toggle('dark', dark)
    saveTheme(dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    const urlPets = decodeFromUrl()
    if (urlPets && urlPets.length > 0) {
      savePets(urlPets)
      setPets(urlPets)
      setImportBanner(true)
      window.history.replaceState({}, '', window.location.pathname)
      setTimeout(() => setImportBanner(false), 4000)
    } else {
      const loaded = loadPets()
      setPets(loaded)
      syncPetsToSW(loaded) // SW IDB 초기 동기화
    }
    setHistory(loadHistory())
  }, [])

  // 앱 열릴 때 + 2시간마다 알림 체크
  useEffect(() => {
    if (getPermission() !== 'granted' || pets.length === 0) return
    checkAndNotify(pets)
    const timer = setInterval(() => checkAndNotify(petsRef.current), NOTIFY_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [pets.length])

  const handleNotificationGranted = useCallback(() => {
    checkAndNotify(petsRef.current)
  }, [])

  function showToast(msg) {
    setSuccessToast(msg)
    setTimeout(() => setSuccessToast(''), 2500)
  }

  function addPet(pet) {
    const updated = [...pets, pet]
    setPets(updated)
    savePets(updated)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    showToast(`🐾 ${pet.petName}의 루틴이 등록됐어요!`)
  }

  function updatePet(updated) {
    const newPets = pets.map((p) => (p.id === updated.id ? updated : p))
    setPets(newPets)
    savePets(newPets)
    setEditingPet(null)
    showToast('✅ 루틴이 수정됐어요!')
  }

  function markDone(id, proofPhoto = null) {
    const today = new Date().toISOString().split('T')[0]
    const pet = pets.find((p) => p.id === id)
    if (!pet) return

    // 제때 완료면 스트릭 +1, 늦으면 리셋
    const dday = calcDayRaw(pet)
    const newStreak = dday >= 0 ? (pet.streak || 0) + 1 : 0

    const updated = pets.map((p) =>
      p.id === id ? { ...p, lastDoneDate: today, streak: newStreak } : p
    )
    setPets(updated)
    savePets(updated)

    const entry = {
      id: crypto.randomUUID(),
      petId: id,
      petName: pet.petName,
      routineName: pet.routineName,
      doneDate: today,
      proofPhoto,
      createdAt: Date.now(),
    }
    setHistory((prev) => addHistoryEntry(prev, entry))

    const streakMsg = STREAK_MILESTONES.includes(newStreak)
      ? `🎉 ${newStreak}연속 제때 완료! 대단해요!`
      : newStreak >= 2
      ? `🔥 ${newStreak}연속 달성 중!`
      : null
    showToast(streakMsg || `📸 ${pet.petName} ${pet.routineName} 완료 인증됐어요!`)
  }

  function deletePet(id) {
    const updated = pets.filter((p) => p.id !== id)
    setPets(updated)
    savePets(updated)
    if (selectedPet && !updated.some((p) => p.petName === selectedPet)) {
      setSelectedPet(null)
    }
  }

  function clearHistory() {
    setHistory([])
    saveHistory([])
  }

  const filtered = selectedPet ? pets.filter((p) => p.petName === selectedPet) : pets
  const sorted = [...filtered].sort((a, b) => calcRaw(a) - calcRaw(b))

  return (
    <div className="mx-auto min-h-dvh max-w-md bg-gradient-to-b from-pink-50 to-fuchsia-50 dark:from-slate-900 dark:to-slate-950">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-5 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-pink-500">🐾 잔소리펫</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500">반려동물이 직접 알려드려요</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(true)}
              className="relative rounded-full p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              title="투약 기록"
            >
              📋
              {history.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-pink-400" />
              )}
            </button>
            <button
              onClick={() => setDark((d) => !d)}
              className="rounded-full p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              {dark ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="rounded-full bg-pink-400 px-4 py-2 text-sm font-bold text-white shadow hover:bg-pink-500 active:scale-95 transition-all"
            >
              + 루틴
            </button>
          </div>
        </div>
      </header>

      {successToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
          <div className="rounded-2xl bg-green-500 px-5 py-3 text-sm font-bold text-white shadow-lg text-center animate-fade-in">
            {successToast}
          </div>
        </div>
      )}

      <main className="px-4 py-4 space-y-3 pb-32">
        {importBanner && (
          <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-4 py-3 text-sm text-blue-700 dark:text-blue-300 font-medium">
            📥 공유 받은 루틴을 불러왔어요!
          </div>
        )}

        <NotificationBanner onGranted={handleNotificationGranted} />

        {pets.length > 1 && (
          <PetFilter pets={pets} selected={selectedPet} onSelect={setSelectedPet} />
        )}

        {sorted.length === 0 ? (
          <EmptyState onAdd={() => setShowForm(true)} hasPets={pets.length > 0} />
        ) : (
          sorted.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              onMarkDone={markDone}
              onEdit={setEditingPet}
              onDelete={deletePet}
            />
          ))
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 flex justify-center pointer-events-none">
        <div className="w-full max-w-md px-4 pb-6 pt-2 bg-gradient-to-t from-fuchsia-50 dark:from-slate-950 to-transparent pointer-events-auto">
          <ShareBanner pets={pets} onOpen={() => setShowShare(true)} />
        </div>
      </div>

      {showForm && (
        <AddRoutineForm onAdd={addPet} onClose={() => setShowForm(false)} existingPets={pets} />
      )}

      {editingPet && (
        <AddRoutineForm
          editData={editingPet}
          onAdd={updatePet}
          onClose={() => setEditingPet(null)}
        />
      )}

      {showHistory && (
        <HistoryLog history={history} onClear={clearHistory} onClose={() => setShowHistory(false)} />
      )}

      {showShare && (
        <ShareModal pets={pets} onClose={() => setShowShare(false)} />
      )}
    </div>
  )
}

function calcRaw(pet) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const last = new Date(pet.lastDoneDate)
  last.setHours(0, 0, 0, 0)
  const next = new Date(last)
  next.setDate(next.getDate() + pet.intervalDays)
  return Math.round((next - today) / 86400000)
}

function EmptyState({ onAdd, hasPets }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
      <span className="text-6xl">🐾</span>
      <p className="text-lg font-bold text-gray-600 dark:text-gray-300">
        {hasPets ? '이 반려동물의 루틴이 없어요' : '아직 등록된 루틴이 없어요'}
      </p>
      <p className="text-sm text-gray-400 dark:text-gray-500">반려동물의 케어 주기를 등록해 보세요</p>
      <button
        onClick={onAdd}
        className="rounded-xl bg-pink-400 px-6 py-3 font-bold text-white shadow hover:bg-pink-500 active:scale-95 transition-all"
      >
        첫 루틴 등록하기
      </button>
    </div>
  )
}
