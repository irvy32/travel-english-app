const noop = () => {}

export default function TopNav({
  topicName = '',
  chapterName = '',
  onHome = noop,
  onTopic = noop,
}) {
  return (
    <header className="sticky top-0 z-50 h-14 bg-[#0F1F3D] text-white">
      <div className="mx-auto flex h-full items-center gap-2 px-4 text-sm">
        <button
          type="button"
          className="shrink-0 hover:opacity-90"
          onClick={onHome}
          aria-label="Go home"
        >
          🏠
        </button>
        {topicName && (
          <>
            <span className="text-white/60">›</span>
            <button
              type="button"
              className="max-w-[120px] truncate underline-offset-2 hover:underline"
              onClick={onTopic}
              title={topicName}
            >
              {topicName}
            </button>
            {chapterName && <span className="text-white/60">›</span>}
          </>
        )}
        {chapterName && (
          <span className="truncate text-gray-300" title={chapterName}>
            {chapterName}
          </span>
        )}
      </div>
    </header>
  )
}
