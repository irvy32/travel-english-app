import { useNavigate } from 'react-router-dom'
import TopNav from '../components/TopNav'
import BottomNav from '../components/BottomNav'
import { useSettings } from '../hooks/useSettings'
import topicsData from '../data/topics.json'
import * as storage from '../services/storage'

export default function HomePage() {
  const navigate = useNavigate()
  const { settings } = useSettings()

  const CHAPTER_IDS = ['01','02','03','04','05','06','07',
    '08','09','10','11','12','13','14']

  const completedCount = CHAPTER_IDS.filter(id => {
    const learned = storage.getProgress('travel', id)
    return learned.length > 0
  }).length

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <TopNav topicName="" chapterName="" />

      <h1 className="mt-6 mb-4 px-4 text-2xl font-bold text-[#0F1F3D]">
        你好，{settings.userName || '旅行者'} 👋
      </h1>

      <div className="grid grid-cols-2 gap-4 px-4 md:grid-cols-3 lg:grid-cols-4">
        {topicsData.map((topic) => {
          const chapterProgress = topic.id === 'travel' ? Math.round((completedCount / 14) * 100) : 0
          const isAvailable = topic.available

          return (
            <button
              key={topic.id}
              type="button"
              className={`relative rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm ${
                isAvailable ? '' : 'pointer-events-none opacity-50'
              }`}
              onClick={() => {
                if (isAvailable) {
                  navigate(`/${topic.id}`)
                }
              }}
            >
              {!isAvailable ? (
                <span className="absolute right-3 top-3 rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-500">
                  即將推出
                </span>
              ) : null}

              <div className="mb-3 text-4xl">{topic.icon}</div>
              <p className="mb-3 font-bold text-[#0F1F3D]">{topic.name}</p>

              <p className="mb-1 text-sm text-gray-400">
                {topic.id === 'travel' ? `${completedCount} / 14 章節完成` : `${chapterProgress} / ${topic.totalChapters} 章節完成`}
              </p>
              <div className="h-1.5 rounded-full bg-gray-100">
                <div
                  className="h-1.5 rounded-full bg-[#0EA5A0]"
                  style={{ width: `${chapterProgress}%` }}
                />
              </div>

              <p className="mt-3 text-sm text-gray-500">{topic.totalChapters} 章節</p>
            </button>
          )
        })}
      </div>

      <BottomNav
        currentPage="home"
        onNavigate={(page) => {
          if (page === 'home') navigate('/travel')
          if (page === 'quiz') navigate('/quiz')
          if (page === 'review') navigate('/review')
          if (page === 'settings') navigate('/settings')
        }}
      />
    </div>
  )
}
