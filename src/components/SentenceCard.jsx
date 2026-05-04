import { useMemo, useState } from 'react'

const noop = () => {}

function maskKeywords(text = '', keywords = []) {
  if (!text || !Array.isArray(keywords) || keywords.length === 0) return text

  return keywords.reduce((result, keyword) => {
    const word = typeof keyword === 'string' ? keyword : keyword?.word
    if (!word) return result
    const escaped = String(word).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi')
    return result.replace(regex, '______')
  }, text)
}

export default function SentenceCard({
  sentence,
  mode = 'sentences',
  onPlay = noop,
  onFavorite = noop,
  isFavorite = false,
  isLearned = false,
}) {
  const [showEnglish, setShowEnglish] = useState(mode !== 'cloze-en')
  const [showChinese, setShowChinese] = useState(mode !== 'cloze-zh')
  const [showKeywordAnswer, setShowKeywordAnswer] = useState(false)
  const [showTips, setShowTips] = useState(false)
  const [playedFlash, setPlayedFlash] = useState(false)

  const difficulty = sentence?.difficulty || sentence?.level || 'A2'
  const borderColor =
    difficulty === 'B1' ? 'border-l-[#F59E0B]' : 'border-l-[#3B82F6]'

  const englishText = sentence?.en || ''
  const chineseText = sentence?.zh || ''
  const keywordMaskedText = useMemo(
    () => maskKeywords(englishText, sentence?.keywords || []),
    [englishText, sentence?.keywords],
  )

  const handlePlay = () => {
    onPlay(sentence)
    setPlayedFlash(true)
    setTimeout(() => setPlayedFlash(false), 500)
  }

  const handleFavorite = () => {
    onFavorite(sentence)
  }

  return (
    <article
      className={`relative rounded-2xl border-l-4 bg-white p-4 shadow-sm ${borderColor}`}
    >
      {isLearned ? (
        <span className="absolute right-3 top-3 text-sm" aria-label="learned">
          ✅
        </span>
      ) : null}

      <div className="mb-3 flex flex-wrap items-center gap-2 pr-8">
        <span className="text-sm text-gray-500">{sentence?.id || ''}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium text-white ${
            difficulty === 'B1' ? 'bg-[#F59E0B]' : 'bg-[#3B82F6]'
          }`}
        >
          {difficulty}
        </span>
        {(sentence?.tags || []).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mb-3 text-[#0F1F3D]">
        {mode === 'cloze-en' && !showEnglish ? (
          <button
            type="button"
            className="rounded bg-gray-200 px-2 py-1 text-gray-600"
            onClick={() => setShowEnglish(true)}
          >
            點擊顯示英文
          </button>
        ) : mode === 'cloze-keyword' && !showKeywordAnswer ? (
          <button
            type="button"
            className="rounded bg-gray-200 px-2 py-1 text-left text-gray-700"
            onClick={() => setShowKeywordAnswer(true)}
          >
            {keywordMaskedText}
          </button>
        ) : (
          <p style={{ fontSize: 'var(--content-font-size)' }} className="font-medium leading-relaxed">{englishText}</p>
        )}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        {(sentence?.kk_line || sentence?.keywords || []).map((item, index) => (
          <span
            key={`${String(item?.word || item)}-${index}`}
            className="inline-flex items-center gap-1"
          >
            <span 
              style={{ fontSize: 'var(--content-font-size)' }}
              className="text-[#0EA5A0]"
            >
              {item?.word || String(item || '')}
            </span>
            <span 
              style={{ fontSize: 'calc(var(--content-font-size) - 2px)' }}
              className="font-mono text-gray-500 [font-family:'DM_Mono',monospace]"
            >
              {item?.kk || ''}
            </span>
            <span 
              style={{ fontSize: 'calc(var(--content-font-size) - 4px)' }}
              className="text-[#E8973A]"
            >
              {item?.zh || ''}
            </span>
          </span>
        ))}
      </div>

      <div className="mb-3 text-gray-700">
        {mode === 'cloze-zh' && !showChinese ? (
          <button
            type="button"
            className="rounded bg-gray-200 px-2 py-1 text-gray-600"
            onClick={() => setShowChinese(true)}
          >
            點擊顯示中文
          </button>
        ) : (
          <p style={{ fontSize: 'var(--content-font-size)' }} className="leading-relaxed">{chineseText}</p>
        )}
      </div>

      {mode === 'sentences' ? (
        <>
          <div className="mb-3">
            <button
              type="button"
              className="text-sm font-medium text-[#0EA5A0]"
              onClick={() => setShowTips((prev) => !prev)}
            >
              💡 {showTips ? '收合提示' : '顯示提示'}
            </button>
            {showTips ? (
              <p className="mt-2 rounded-lg bg-[#FAF7F2] p-3 text-sm text-gray-700">
                {sentence?.tips || ''}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                playedFlash ? 'bg-[#0EA5A0] text-white' : 'bg-gray-100 text-[#0F1F3D]'
              }`}
              onClick={handlePlay}
            >
              ▶ 播放
            </button>
            <button
              type="button"
              className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-[#0F1F3D]"
              onClick={handleFavorite}
            >
              {isFavorite ? '❤️ 收藏' : '🤍 收藏'}
            </button>
          </div>
        </>
      ) : null}
    </article>
  )
}
