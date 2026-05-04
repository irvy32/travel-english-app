import { useState } from 'react'
import SentenceCard from '../components/SentenceCard'

const MODES = [
  { id: 'cloze-en', label: '遮英文' },
  { id: 'cloze-zh', label: '遮中文' },
  { id: 'cloze-keyword', label: '挖關鍵字' },
]

export default function ClozeModeTab({ sentences }) {
  const [mode, setMode] = useState('cloze-en')

  return (
    <div className="px-4 py-4 max-w-2xl mx-auto">
      {/* 模式切換器 */}
      <div className="sticky top-[100px] bg-white border-b py-2 px-4">
        <div className="flex gap-2">
          {MODES.map((modeOption) => (
            <button
              key={modeOption.id}
              type="button"
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                mode === modeOption.id
                  ? 'bg-[#0EA5A0] text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
              onClick={() => setMode(modeOption.id)}
            >
              {modeOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* 句子列表 */}
      <div className="mt-4 space-y-4">
        {sentences.map((sentence) => (
          <SentenceCard
            key={`${mode}-${sentence.id}`}
            sentence={sentence}
            mode={mode}
          />
        ))}
      </div>
    </div>
  )
}
