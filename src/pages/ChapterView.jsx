import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import TopNav from '../components/TopNav'
import BottomNav from '../components/BottomNav'
import SentencesTab from '../tabs/SentencesTab'
import ClozeModeTab from '../tabs/ClozeModeTab'
import SpeechTab from '../tabs/SpeechTab'
import QuizTab from '../tabs/QuizTab'
import ChapterReviewTab from '../tabs/ChapterReviewTab'
import OfflineSettingsTab from '../tabs/OfflineSettingsTab'

const TABS = [
  { id: 'sentences', label: '內容學習', icon: '📖' },
  { id: 'cloze', label: '遮蔽模式', icon: '🙈' },
  { id: 'speech', label: '口說練習', icon: '🎙️' },
  { id: 'quiz', label: '章節測驗', icon: '📝' },
  { id: 'review', label: '本章錯題', icon: '🔁' },
  { id: 'settings', label: '設定下載', icon: '⚙️' },
]

export default function ChapterView() {
  const navigate = useNavigate()
  const { topicId, chapterId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentTab = searchParams.get('tab') || 'sentences'

  const [chapterData, setChapterData] = useState(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  // Dynamic chapter loading for both topics
  const allChapters = {
    ...import.meta.glob('../data/travel/*.json'),
    ...import.meta.glob('../data/airport/*.json'),
  }

  useEffect(() => {
    setLoading(true)
    setError(false)
    setChapterData(null)

    const key = Object.keys(allChapters).find(k => k.includes(`/${chapterId}.json`))
    if (key) {
      allChapters[key]().then(m => {
        setChapterData(m.default)
        setLoading(false)
      }).catch(() => {
        setError(true)
        setLoading(false)
      })
    } else {
      setError(true)
      setLoading(false)
    }
  }, [chapterId])

  const switchTab = (tabId) => {
    if (tabId === 'settings') {
      navigate('/settings')
      return
    }
    setSearchParams({ tab: tabId })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return <div>載入中...</div>
  }

  if (error) {
    return <div>找不到章節資料</div>
  }

  const sentences = chapterData?.sentences ?? []

  const renderTabContent = () => {
    if (!chapterData) return null

    switch (currentTab) {
      case 'sentences':
        return (
          <SentencesTab
            sentences={sentences}
            topicId="travel"
            chapterId={chapterId}
          />
        )
      case 'cloze':
        return <ClozeModeTab sentences={sentences} />
      case 'speech':
        return <SpeechTab sentences={sentences} />
      case 'quiz':
        return (
          <QuizTab
            quizData={chapterData.quiz}
            sentences={sentences}
            topicId={topicId}
            chapterId={chapterId}
          />
        )
      case 'review':
        return <ChapterReviewTab topicId={topicId} chapterId={chapterId} />
      case 'settings':
        return <OfflineSettingsTab topicId={topicId} chapterId={chapterId} />
      default:
        return (
          <SentencesTab
            sentences={sentences}
            topicId={topicId}
            chapterId={chapterId}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col">
      
      {/* TopNav 固定頂部 */}
      <div className="sticky top-0 z-50">
        <TopNav
          topicName={topicId === 'travel' ? '旅遊英文' : '初級旅遊英文(二)'}
          chapterName={chapterData?.chapter_name ?? ''}
          onHome={() => navigate('/')}
          onTopic={() => navigate(`/${topicId}`)}
        />
      </div>

      {/* Tab 列固定在 TopNav 下方 */}
      <div className="sticky top-[56px] z-40 bg-white border-b border-gray-200">
        <div className="flex overflow-x-auto scrollbar-hide">
          <div className="mx-auto flex max-w-5xl items-center px-2">
              {TABS.map((tab) => {
                const active = currentTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    className={`flex-shrink-0 flex h-11 min-w-[72px] flex-col items-center justify-center gap-0.5 whitespace-nowrap border-b-2 px-2 text-xs ${
                      active
                        ? 'border-[#0EA5A0] text-[#0EA5A0]'
                        : 'border-transparent text-gray-500'
                    }`}
                    onClick={() => switchTab(tab.id)}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                )
              })}
          </div>
        </div>
      </div>

      {/* 內容區可捲動 */}
      <div className="flex-1 overflow-y-auto">
        <main>{renderTabContent()}</main>
      </div>

      {/* BottomNav 固定底部 */}
      <div className="sticky bottom-0 z-50">
        <BottomNav
          currentPage="home"
          onNavigate={(page) => {
            if (page === 'home') navigate('/travel')
            if (page === 'quiz') switchTab('quiz')
            if (page === 'review') navigate('/review')
            if (page === 'settings') switchTab('settings')
          }}
        />
      </div>
    </div>
  )
}
