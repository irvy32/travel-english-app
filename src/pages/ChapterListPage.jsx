import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import topicsData from '../data/topics.json'
import * as storage from '../services/storage'
import TopNav from '../components/TopNav'
import BottomNav from '../components/BottomNav'

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

export default function ChapterListPage() {
  const { topicId } = useParams()
  const navigate = useNavigate()
  const topic = topicsData.find(t => t.id === topicId)
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadChapters = async () => {
      setLoading(true)
      const modules = GLOB_MAP[topicId] ?? {}
      const entries = Object.entries(modules)

      const loaded = await Promise.all(
        entries.map(async ([path, loader]) => {
          const mod = await loader()
          return {
            data: mod.default,
            filename: path.split('/').pop().replace('.json', '')
          }
        })
      )

      loaded.sort((a, b) => sortById(a.data, b.data))
      setChapters(loaded)
      setLoading(false)
    }
    loadChapters()
  }, [topicId])

  if (loading) return <div className="p-8 text-center">載入中...</div>

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <TopNav
        topicName={topic?.name ?? topicId}
        chapterName=""
        onHome={() => navigate('/')}
        onTopic={() => navigate('/')}
      />
      <div className="max-w-2xl mx-auto px-4 py-4">
        <h2 className="text-xl font-bold text-[#0F1F3D] mb-4">選擇章節</h2>
        {chapters.map(({ data: chapter, filename }, idx) => {
          // 用 filename 讀進度，與導航路徑一致
          const learned = storage.getProgress(topicId, filename)
          const total = chapter.sentences?.length ?? 0
          const progress = total > 0 ? Math.round(learned.length / total * 100) : 0
          return (
            <div key={chapter.chapter_id}
              onClick={() => navigate(`/${topicId}/${filename}?tab=sentences`)}
              className="flex items-center bg-white border rounded-xl p-4 mb-3 shadow-sm cursor-pointer hover:border-[#0EA5A0] transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#0F1F3D] text-white flex items-center justify-center font-bold mr-4 flex-shrink-0">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#0F1F3D]">{chapter.chapter_name}</p>
                <p className="text-sm text-gray-400">{total} 句話</p>
                <div className="h-1.5 bg-gray-100 rounded-full mt-1">
                  <div className="h-1.5 bg-[#0EA5A0] rounded-full transition-all"
                    style={{ width: progress + '%' }} />
                </div>
              </div>
              <div className="ml-3 text-sm text-gray-400 flex-shrink-0">{progress}%</div>
              <span className="text-gray-400 ml-2">›</span>
            </div>
          )
        })}
      </div>
      <BottomNav currentPage="home"
        onNavigate={(page) => {
          if (page === 'home') navigate('/')
          if (page === 'quiz') navigate('/quiz')
          if (page === 'review') navigate('/review')
          if (page === 'settings') navigate('/settings')
        }} />
    </div>
  )
}