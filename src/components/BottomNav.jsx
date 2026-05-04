const noop = () => {}

const NAV_ITEMS = [
  { key: 'home', icon: '📚', label: '學習' },
  { key: 'quiz', icon: '📝', label: '測驗' },
  { key: 'review', icon: '⭐', label: '複習' },
  { key: 'settings', icon: '⚙️', label: '設定' },
]

export default function BottomNav({ currentPage = 'home', onNavigate = noop }) {
  return (
    <nav className="sticky bottom-0 z-50 h-14 border-t border-gray-200 bg-white md:hidden">
      <div className="grid h-full grid-cols-4">
        {NAV_ITEMS.map((item) => {
          const isActive = currentPage === item.key
          const colorClass = isActive ? 'text-[#0EA5A0]' : 'text-gray-400'

          return (
            <button
              key={item.key}
              type="button"
              className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center py-2 text-xs ${colorClass}`}
              onClick={() => onNavigate(item.key)}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
