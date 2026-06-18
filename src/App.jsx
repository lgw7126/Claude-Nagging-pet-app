import { useState, useEffect } from 'react'
import { loadPets, savePets, decodeFromUrl } from './utils/storage'
import PetCard from './components/PetCard'
import AddRoutineForm from './components/AddRoutineForm'
import ShareBanner from './components/ShareBanner'

export default function App() {
  const [pets, setPets] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [importBanner, setImportBanner] = useState(false)

  useEffect(() => {
    const urlPets = decodeFromUrl()
    if (urlPets && urlPets.length > 0) {
      savePets(urlPets)
      setPets(urlPets)
      setImportBanner(true)
      window.history.replaceState({}, '', window.location.pathname)
      setTimeout(() => setImportBanner(false), 4000)
    } else {
      setPets(loadPets())
    }
  }, [])

  function addPet(pet) {
    const updated = [...pets, pet]
    setPets(updated)
    savePets(updated)
  }

  function markDone(id) {
    const today = new Date().toISOString().split('T')[0]
    const updated = pets.map((p) =>
      p.id === id ? { ...p, lastDoneDate: today } : p
    )
    setPets(updated)
    savePets(updated)
  }

  function deletePet(id) {
    const updated = pets.filter((p) => p.id !== id)
    setPets(updated)
    savePets(updated)
  }

  const urgentFirst = [...pets].sort((a, b) => {
    const dA = calcRaw(a)
    const dB = calcRaw(b)
    return dA - dB
  })

  return (
    <div className="mx-auto min-h-dvh max-w-md bg-gradient-to-b from-pink-50 to-fuchsia-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-5 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-pink-500">🐾 잔소리펫</h1>
            <p className="text-xs text-gray-400">반려동물이 직접 알려드려요</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-full bg-pink-400 px-4 py-2 text-sm font-bold text-white shadow hover:bg-pink-500 active:scale-95 transition-all"
          >
            + 루틴 추가
          </button>
        </div>
      </header>

      <main className="px-4 py-4 space-y-3">
        {importBanner && (
          <div className="rounded-2xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700 font-medium">
            📥 공유 받은 루틴을 불러왔어요!
          </div>
        )}

        {urgentFirst.length === 0 ? (
          <EmptyState onAdd={() => setShowForm(true)} />
        ) : (
          urgentFirst.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              onMarkDone={markDone}
              onDelete={deletePet}
            />
          ))
        )}
      </main>

      <div className="sticky bottom-0 px-4 pb-safe pb-4 pt-2 bg-gradient-to-t from-fuchsia-50 to-transparent">
        <ShareBanner pets={pets} />
      </div>

      {showForm && (
        <AddRoutineForm onAdd={addPet} onClose={() => setShowForm(false)} />
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

function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
      <span className="text-6xl">🐾</span>
      <p className="text-lg font-bold text-gray-600">아직 등록된 루틴이 없어요</p>
      <p className="text-sm text-gray-400">반려동물의 케어 주기를 등록해 보세요</p>
      <button
        onClick={onAdd}
        className="rounded-xl bg-pink-400 px-6 py-3 font-bold text-white shadow hover:bg-pink-500 active:scale-95 transition-all"
      >
        첫 루틴 등록하기
      </button>
    </div>
  )
}
