import { useNavigate } from 'react-router-dom'
import TopNav from '../components/TopNav'
import BottomNav from '../components/BottomNav'
import { useSettings } from '../hooks/useSettings'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { settings, updateSetting, resetSettings } = useSettings()

  const clearAllProgress = () => {
    if (window.confirm('確定要清除所有進度嗎？這個動作無法復原')) {
      Object.keys(localStorage)
        .filter(k => k.startsWith('progress_'))
        .forEach(k => localStorage.removeItem(k))
      alert('所有學習進度已清除')
    }
  }

  const clearAllFavorites = () => {
    if (window.confirm('確定要清除所有收藏嗎？這個動作無法復原')) {
      Object.keys(localStorage)
        .filter(k => k.startsWith('favorites_'))
        .forEach(k => localStorage.removeItem(k))
      alert('所有收藏已清除')
    }
  }

  const handleResetSettings = () => {
    if (window.confirm('確定要還原預設設定嗎？')) {
      resetSettings()
      alert('設定已還原為預設值')
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <TopNav
        topicName="設定"
        chapterName=""
        onHome={() => navigate('/')}
        onTopic={() => navigate(`/${localStorage.getItem('lastTopicId') || 'travel1'}`)}
      />

      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* 個人化設定 */}
        <div className="bg-white rounded-xl mb-4 shadow-sm">
          <p className="text-sm text-gray-400 px-4 pt-4 mb-2">👤 個人化</p>
          
          <div className="px-4 pb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              稱呼
            </label>
            <input
              type="text"
              value={settings.userName}
              onChange={e => updateSetting('userName', e.target.value)}
              placeholder="旅行者"
              className="border rounded px-3 py-2 w-full"
            />
          </div>
        </div>

        {/* 學習設定 */}
        <div className="bg-white rounded-xl mb-4 shadow-sm">
          <p className="text-sm text-gray-400 px-4 pt-4 mb-2">📚 學習設定</p>
          
          <div className="px-4 pb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              內文字體大小
            </label>
            <div className="flex gap-2">
              {[18, 20, 22, 26].map(size => (
                <button
                  key={size}
                  onClick={() => updateSetting('fontSize', size)}
                  className={`px-3 py-1 rounded-lg ${
                    settings.fontSize === size
                      ? 'bg-[#0EA5A0] text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 pb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              顯示難度標籤（A2 / B1）
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.showDifficulty}
                onChange={e => updateSetting('showDifficulty', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#0EA5A0] after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
            </label>
          </div>
        </div>

        {/* 測驗設定 */}
        <div className="bg-white rounded-xl mb-4 shadow-sm">
          <p className="text-sm text-gray-400 px-4 pt-4 mb-2">📝 測驗設定</p>
          
          <div className="px-4 pb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              每題最多播放次數
            </label>
            <div className="flex gap-2">
              {[1, 2, 3].map(count => (
                <button
                  key={count}
                  onClick={() => updateSetting('maxPlayCount', count)}
                  className={`px-3 py-1 rounded-lg ${
                    settings.maxPlayCount === count
                      ? 'bg-[#0EA5A0] text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 資料管理 */}
        <div className="bg-white rounded-xl mb-4 shadow-sm">
          <p className="text-sm text-gray-400 px-4 pt-4 mb-2">🗂 資料管理</p>
          
          <div className="px-4 pb-4 space-y-3">
            <button
              onClick={clearAllProgress}
              className="w-full py-3 rounded-xl bg-red-50 text-red-500 border border-red-200"
            >
              清除所有學習進度
            </button>
            
            <button
              onClick={clearAllFavorites}
              className="w-full py-3 rounded-xl bg-red-50 text-red-500 border border-red-200"
            >
              清除所有收藏
            </button>
            
            <button
              onClick={handleResetSettings}
              className="w-full py-3 rounded-xl bg-gray-50 text-gray-600 border border-gray-200"
            >
              還原預設設定
            </button>
          </div>
        </div>

        {/* 版本資訊 */}
        <p className="text-center text-xs text-gray-300 py-4">
          旅遊英文學習 App v2.2
        </p>
      </div>

      <BottomNav
        currentPage="settings"
        onNavigate={(page) => {
          if (page === 'home') navigate(`/${localStorage.getItem('lastTopicId') || 'travel1'}`)
          if (page === 'quiz') navigate('/quiz')
          if (page === 'review') navigate('/review')
          if (page === 'settings') navigate('/settings')
        }}
      />
    </div>
  )
}
