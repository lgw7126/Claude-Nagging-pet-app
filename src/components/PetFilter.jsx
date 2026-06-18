export default function PetFilter({ pets, selected, onSelect }) {
  const names = [...new Set(pets.map((p) => p.petName))]
  if (names.length <= 1) return null

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      <Tab label="전체" active={selected === null} onClick={() => onSelect(null)} />
      {names.map((name) => (
        <Tab key={name} label={name} active={selected === name} onClick={() => onSelect(name)} />
      ))}
    </div>
  )
}

function Tab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-all active:scale-95
        ${active
          ? 'bg-pink-400 text-white shadow-md'
          : 'bg-white/80 text-gray-500 dark:bg-slate-700 dark:text-gray-300'
        }`}
    >
      {label}
    </button>
  )
}
