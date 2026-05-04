import { useEffect } from 'react'
import { useSettings } from './hooks/useSettings'
import { HashRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ChapterListPage from './pages/ChapterListPage'
import ChapterView from './pages/ChapterView'
import QuizPage from './pages/QuizPage'
import ReviewCenter from './pages/ReviewCenter'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  const { settings } = useSettings()

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--content-font-size', settings.fontSize + 'px'
    )
  }, [settings.fontSize])

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/travel" element={<ChapterListPage />} />
        <Route path="/travel/:chapterId" element={<ChapterView />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/review" element={<ReviewCenter />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </HashRouter>
  )
}
