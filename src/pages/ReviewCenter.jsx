import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopNav from '../components/TopNav'
import BottomNav from '../components/BottomNav'
import { useFavorites } from '../hooks/useFavorites'
import * as storage from '../services/storage'

export default function ReviewCenter() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('favorites')
  
  const { favorites, removeFavorite } = useFavorites('travel')
  const [wrongItems, setWrongItems] = useState(
    () => storage.getWrongBank('travel')
  )
  const [wrongAnswers, setWrongAnswers] = useState({})

  const refreshWrong = () => {
    setWrongItems(storage.getWrongBank('travel'))
  }

  const handlePlay = (text) => {
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'en-US'
    speechSynthesis.speak(utter)
  }

  const handleRemoveFavorite = (item) => {
    if (window.confirm('確定要移除這個收藏嗎？')) {
      removeFavorite(item.id)
    }
  }

  const handleWrongAnswer = (item) => {
    const userAns = wrongAnswers[item.id] ?? ''
    const correct = userAns.trim().toLowerCase() === 
                    item.correctAnswer.trim().toLowerCase()
    storage.updateStreak('travel', item.id, correct)
    refreshWrong()
    setWrongAnswers(prev => ({ ...prev, [item.id]: '' }))
  }

  const handleRemoveWrong = (item) => {
    if (window.confirm('確定要移除這題嗎？')) {
      storage.removeWrongItem('travel', item.id)
      refreshWrong()
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <TopNav
        topicName="複習中心"
        chapterName=""
        onHome={() => navigate('/')}
        onTopic={() => navigate('/travel')}
      />

      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Tab 切換 */}
        <div className="flex mb-6 border-b">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'favorites'
                ? 'border-b-2 border-[#0EA5A0] text-[#0EA5A0]'
                : 'text-gray-500'
            }`}
          >
            ⭐ 收藏夾
          </button>
          <button
            onClick={() => setActiveTab('wrong')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'wrong'
                ? 'border-b-2 border-[#0EA5A0] text-[#0EA5A0]'
                : 'text-gray-500'
            }`}
          >
            📕 錯題本
          </button>
        </div>

        {/* 收藏夾內容 */}
        {activeTab === 'favorites' && (
          <div>
            {favorites.length === 0 ? (
              <p className="text-center text-gray-400 py-8">
                目前沒有收藏的句子 🤍
              </p>
            ) : (
              <div className="space-y-3">
                {favorites.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border rounded-xl p-4 shadow-sm"
                  >
                    <p className="font-medium text-[#0F1F3D] mb-2">
                      {item.en}
                    </p>
                    <p className="text-gray-500 text-sm mb-3">
                      {item.zh}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePlay(item.en)}
                        className="px-3 py-1 bg-[#0EA5A0] text-white rounded text-sm hover:bg-[#0c9090]"
                      >
                        ▶ 播放
                      </button>
                      <button
                        onClick={() => handleRemoveFavorite(item)}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                      >
                        🗑️ 移除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 錯題本內容 */}
        {activeTab === 'wrong' && (
          <div>
            {wrongItems.length === 0 ? (
              <p className="text-center text-gray-400 py-8">
                目前沒有錯題 🎉
              </p>
            ) : (
              <div className="space-y-3">
                {wrongItems.map((q) => (
                  <div
                    key={q.id}
                    className="bg-white border rounded-xl p-4 shadow-sm"
                  >
                    <p className="font-medium mb-2">{q.question}</p>
                    
                    <p className="text-red-500 text-sm mb-1">
                      ✗ {q.userAnswer}
                    </p>
                    
                    <p className="text-green-500 text-sm mb-2">
                      ✓ {q.correctAnswer}
                    </p>
                    
                    <div className="flex gap-1 mb-3">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className={
                            i < (q.streak ?? 0)
                              ? 'text-[#0EA5A0]'
                              : 'text-gray-300'
                          }
                        >
                          ●
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="請輸入答案"
                        value={wrongAnswers[q.id] ?? ''}
                        onChange={(e) =>
                          setWrongAnswers((prev) => ({
                            ...prev,
                            [q.id]: e.target.value,
                          }))
                        }
                        className="flex-1 border rounded px-3 py-2 text-sm"
                      />
                      <button
                        onClick={() => handleWrongAnswer(q)}
                        className="px-4 py-2 bg-[#0EA5A0] text-white rounded text-sm hover:bg-[#0c9090]"
                      >
                        確認
                      </button>
                      <button
                        onClick={() => handleRemoveWrong(q)}
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
        )}
      </div>

      <BottomNav
        currentPage="review"
        onNavigate={(page) => {
          if (page === 'home') navigate('/travel')
          if (page === 'quiz') navigate('/quiz')
          if (page === 'settings') navigate('/settings')
        }}
      />
    </div>
  )
}
