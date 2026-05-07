import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TopNav from '../components/TopNav'
import BottomNav from '../components/BottomNav'
import * as storage from '../services/storage'
import topicsData from '../data/topics.json'

export default function ChapterListPage() {
  const navigate = useNavigate()
  const { topicId } = useParams()
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Find topic configuration
  const topic = topicsData.find(t => t.id === topicId)

  // Dynamic chapter modules for both topics
  const allTravelChapters = import.meta.glob('../data/travel/*.json')
  const allAirportChapters = import.meta.glob('../data/airport/*.json')

  const chapterModules = topicId === 'airport' 
    ? allAirportChapters 
    : allTravelChapters

  useEffect(() => {
    const loadChapters = async () => {
      setLoading(true)
      setError(false)
      try {
        const modules = chapterModules
        const entries = Object.entries(modules)
        const loaded = await Promise.all(
          entries.map(([, loader]) => loader().then(m => m.default))
        )
        // Sort by chapter_id
        loaded.sort((a, b) => {
          const aId = String(a.chapter_id)
          const bId = String(b.chapter_id)
          return aId.localeCompare(bId)
        })
        setChapters(loaded)
      } catch(e) {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    loadChapters()
}, [topicId])

  const getChapterProgress = (chapter) => {
    const learned = storage.getProgress(topicId, chapter.chapter_id)
    const total = chapter.sentences?.length ?? 0
    if (total === 0) return 0
    return Math.round(learned.length / total * 100)
  }

  if (loading) {
    return <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
      <div className="text-gray-500">載入中...</div>
    </div>
  }

  if (error) {
    return <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
      <div className="text-red-500">載入失敗</div>
    </div>
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <TopNav
        topicName={topic?.name || ''}
        chapterName=""
        onHome={() => navigate('/')}
        onTopic={() => navigate(`/${topicId}`)}
      />

      <div className="px-4 mt-4 mb-3">
        <h2 className="text-2xl font-bold">選擇章節</h2>
      </div>

      <div className="px-4 pb-20">
        {chapters.map((chapter, idx) => {
          const progress = getChapterProgress(chapter)
          
          return (
            <div
              key={chapter.chapter_id}
              onClick={() => {
                // Get filename from glob path (without extension)
                const filename = Object.keys(chapterModules)[idx]
                  .split('/').pop().replace('.json', '')
                navigate(`/${topicId}/${filename}?tab=sentences`)
              }}
              className="bg-white rounded-xl p-4 mb-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="bg-[#0F1F3D] text-white rounded-full w-10 h-10 flex items-center justify-center font-medium">
                  {idx + 1}
                </div>
                
                <div className="flex-1 ml-4">
                  <h3 className="font-medium text-gray-800">{chapter.chapter_name}</h3>
                  <p className="text-sm text-gray-400">
                    {chapter.sentences?.length || 0} 句話
                  </p>
                </div>
                
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">
                    {progress}%
                  </span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
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
