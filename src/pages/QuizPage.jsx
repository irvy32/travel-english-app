import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TopNav from '../components/TopNav'
import BottomNav from '../components/BottomNav'
import topicsData from '../data/topics.json'

const GLOB_MAP = {
  travel1: import.meta.glob('../data/travel1/*.json'),
  travel2: import.meta.glob('../data/travel2/*.json'),
  travel3: import.meta.glob('../data/travel3/*.json'),
  travel4: import.meta.glob('../data/travel4/*.json'),
  daily:   import.meta.glob('../data/daily/*.json'),
  social:  import.meta.glob('../data/social/*.json'),
}

function sortById(a, b) {
  const aId = String(a.chapter_id)
  const bId = String(b.chapter_id)
  const aMatch = aId.match(/^([A-Za-z]*)(\d+)(.*)$/)
  const bMatch = bId.match(/^([A-Za-z]*)(\d+)(.*)$/)
  if (aMatch && bMatch) {
    if (aMatch[1] !== bMatch[1]) return aMatch[1].localeCompare(bMatch[1])
    const diff = parseInt(aMatch[2]) - parseInt(bMatch[2])
    if (diff !== 0) return diff
    return aMatch[3].localeCompare(bMatch[3])
  }
  return aId.localeCompare(bId)
}

export default function QuizPage() {
  const navigate = useNavigate()
  const lastTopicId = localStorage.getItem('lastTopicId') || 'travel1'
  const [selectedTopicId, setSelectedTopicId] = useState(lastTopicId)
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(false)

  const loadChapters = async (topicId) => {
    setLoading(true)
    setChapters([])
    const modules = GLOB_MAP[topicId] ?? {}
    const loaded = []
    await Promise.all(
      Object.keys(modules).map(async (key) => {
        const mod = await modules[key]()
        if (mod.default) loaded.push(mod.default)
      })
    )
    loaded.sort(sortById)
    setChapters(loaded)
    setLoading(false)
  }

  useEffect(() => { loadChapters(selectedTopicId) }, [selectedTopicId])

  const handleSelectTopic = (topicId) => {
    setSelectedTopicId(topicId)
    loadChapters(topicId)
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <TopNav
        topicName="測驗"
        chapterName=""
        onHome={() => navigate('/')}
        onTopic={() => navigate(`/${localStorage.getItem('lastTopicId') || 'travel1'}`)}
      />
      <div className="max-w-2xl mx-auto px-4 py-4">

        {/* 課程選擇器 */}
        <div className="grid grid-cols-2 gap-2 pb-2 mb-4">
          {topicsData.filter(t => t.available).map(topic => (
            <button
              key={topic.id}
              onClick={() => handleSelectTopic(topic.id)}
              className={`w-full px-3 py-1.5 rounded-full text-sm font-medium text-left ${
                selectedTopicId === topic.id
                  ? 'bg-[#0EA5A0] text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {topic.icon} {topic.name}
            </button>
          ))}
        </div>

        <h2 className="text-xl font-bold text-[#0F1F3D] mb-4">選擇章節開始測驗</h2>

        {loading ? (
          <p className="text-center text-gray-400 py-8">載入中...</p>
        ) : (
          chapters.map((ch, idx) => (
            <div
              key={ch.chapter_id}
              onClick={() => navigate(`/${selectedTopicId}/${ch.chapter_id}?tab=quiz`)}
              className="flex items-center bg-white border rounded-xl p-4 mb-3 shadow-sm cursor-pointer hover:border-[#0EA5A0] transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[#0F1F3D] text-white flex items-center justify-center font-bold mr-4 flex-shrink-0">
                {idx + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium text-[#0F1F3D]">{ch.chapter_name}</p>
              </div>
              <span className="text-gray-400">›</span>
            </div>
          ))
        )}
      </div>

      <BottomNav
        currentPage="quiz"
        onNavigate={(page) => {
          if (page === 'home') navigate(`/${localStorage.getItem('lastTopicId') || 'travel1'}`)
          if (page === 'review') navigate('/review')
          if (page === 'settings') navigate('/settings')
        }}
      />
    </div>
  )
}
