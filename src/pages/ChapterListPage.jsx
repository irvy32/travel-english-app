import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TopNav from '../components/TopNav'
import BottomNav from '../components/BottomNav'

export default function ChapterListPage() {
  const navigate = useNavigate()
  const { topicId } = useParams()
  const [chapters, setChapters] = useState([])

  const CHAPTER_FILES = [
    '01_Preparation',
    '02_Airport_Checkin',
    '03_Security_and_Gate',
    '04_Inflight_Conversation',
    '05_Immigration',
    '06_Airport_Transportation',
    '07_Hotel_Checkin',
    '08_Dining_Out',
    '09_Shopping_and_Tax_Refund',
    '10_Directions_and_Navigation',
    '11_Sightseeing_and_Tours',
    '12_Car_Rental',
    '13_Emergencies',
    '14_Return_Flight'
  ]

  useEffect(() => {
    const loadChapters = async () => {
      const loaded = await Promise.all(
        CHAPTER_FILES.map(f =>
          import(`../data/travel/${f}.json`).then(m => m.default)
        )
      )
      setChapters(loaded)
    }
    loadChapters()
  }, [])

  const getProgress = (chapterId) => {
    const key = `travel_${chapterId}_progress`
    const saved = localStorage.getItem(key)
    return saved ? parseInt(saved, 10) : 0
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <TopNav
        topicName="旅遊英文"
        chapterName=""
        onHome={() => navigate('/')}
        onTopic={() => navigate('/travel')}
      />

      <div className="px-4 mt-4 mb-3">
        <h2 className="text-2xl font-bold">選擇章節</h2>
      </div>

      <div className="px-4 pb-20">
        {chapters.map((chapter, idx) => {
          const progress = getProgress(chapter.chapter_id)
          
          return (
            <div
              key={chapter.chapter_id}
              onClick={() => navigate(`/travel/${CHAPTER_FILES[idx]}?tab=sentences`)}
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
