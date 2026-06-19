export default function ShareBanner({ pets, onOpen }) {
  return (
    <button
      onClick={onOpen}
      disabled={pets.length === 0}
      className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#FEE500] py-3.5 font-bold text-[#3C1E1E] shadow-md hover:bg-yellow-300 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#3C1E1E">
        <path d="M12 3C6.48 3 2 6.69 2 11.26c0 2.87 1.74 5.39 4.36 6.97L5.2 21l4.24-2.07c.83.17 1.7.26 2.56.26 5.52 0 10-3.69 10-8.26S17.52 3 12 3z" />
      </svg>
      가족에게 카카오톡 공유하기
    </button>
  )
}
