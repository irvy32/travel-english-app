import { useState } from 'react'
import * as storage from '../services/storage'

export default function ChapterReviewTab({ topicId, chapterId }) {
  const [wrongItems, setWrongItems] = useState(
    () => storage.getWrongBank(topicId).filter(w => w.chapter_id === chapterId)
  )
  const [userAnswers, setUserAnswers] = useState({})

  const handleAnswer = (item) => {
    const userAns = userAnswers[item.id] ?? ''
    const correct = userAns.trim().toLowerCase() === 
                    item.correctAnswer.trim().toLowerCase()
    storage.updateStreak(topicId, item.id, correct)
    setWrongItems(
      storage.getWrongBank(topicId).filter(w => w.chapter_id === chapterId)
    )
    setUserAnswers(prev => ({ ...prev, [item.id]: '' }))
  }

  const handleRemove = (item) => {
    if (window.confirm('確定要移除這題嗎？')) {
      storage.removeWrongItem(topicId, item.id)
      setWrongItems(
        storage.getWrongBank(topicId).filter(w => w.chapter_id === chapterId)
      )
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-4">
      {wrongItems.length === 0 ? (
        <p className="mt-10 text-center text-gray-400">🎉 本章節目前沒有錯題！</p>
      ) : (
        <div className="space-y-4">
          {wrongItems.map((q) => (
            <div key={q.id} className="rounded-xl border bg-white p-4 shadow-sm mb-4">
              <div className="mb-3">
                <p className="text-gray-800 mb-2">{q.question}</p>
                
                <p className="text-red-500 text-sm mb-1">
                  ✗ 上次答錯：{q.userAnswer}
                </p>
                
                <p className="text-green-500 text-sm mb-2">
                  ✓ 正確答案：{q.correctAnswer}
                </p>
                
                <div className="text-sm text-gray-500 mb-3">
                  連對進度：
                  {Array.from({length: 3}).map((_, i) => (
                    <span key={i} className="mr-1">
                      {i < (q.streak ?? 0) ? '●' : '○'}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="請輸入你的答案"
                  value={userAnswers[q.id] ?? ''}
                  onChange={e => setUserAnswers(prev => ({ 
                    ...prev, 
                    [q.id]: e.target.value 
                  }))}
                  className="flex-1 border rounded px-3 py-2 text-sm"
                />
                <button
                  onClick={() => handleAnswer(q)}
                  className="px-4 py-2 bg-[#0EA5A0] text-white rounded text-sm hover:bg-[#0c9090]"
                >
                  確認
                </button>
                <button
                  onClick={() => handleRemove(q)}
                  className="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
