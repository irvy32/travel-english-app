import { useState } from 'react'

export default function SpeechTab({ sentences = [] }) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [status, setStatus] = useState('idle') // idle | listening | success | fail
  const [transcript, setTranscript] = useState('')
  const [score, setScore] = useState(null)
  const [results, setResults] = useState([]) // [{ id, en, zh, transcript, score, passed }]

  function similarity(a, b) {
    const s1 = a.toLowerCase().trim()
    const s2 = b.toLowerCase().trim()
    if (s1 === s2) return 100
    const longer = s1.length > s2.length ? s1 : s2
    const shorter = s1.length > s2.length ? s2 : s1
    const longerLength = longer.length
    if (longerLength === 0) return 100
    const costs = []
    for (let i = 0; i <= shorter.length; i++) {
      let lastValue = i
      for (let j = 0; j <= longer.length; j++) {
        if (i === 0) { costs[j] = j }
        else if (j > 0) {
          let newValue = costs[j - 1]
          if (shorter[i-1] !== longer[j-1]) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1
          }
          costs[j - 1] = lastValue
          lastValue = newValue
        }
      }
      if (i > 0) costs[longer.length] = lastValue
    }
    return Math.round((1 - costs[longer.length] / longerLength) * 100)
  }

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('您的瀏覽器不支援語音辨識，請使用 Chrome')
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    setStatus('listening')
    setTranscript('')
    setScore(null)
    
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript
      const s = similarity(text, sentences[currentIdx].en)
      setTranscript(text)
      setScore(s)
      setStatus(s >= 70 ? 'success' : 'fail')
      setResults(prev => [...prev.filter(r => r.id !== sentences[currentIdx].id), {
        id: sentences[currentIdx].id,
        en: sentences[currentIdx].en,
        zh: sentences[currentIdx].zh,
        transcript: text,
        score: s,
        passed: s >= 70
      }])
    }
    
    recognition.onerror = () => setStatus('idle')
    recognition.start()
  }

  const handlePlay = () => {
    const utter = new SpeechSynthesisUtterance(sentences[currentIdx].en)
    utter.lang = 'en-US'
    speechSynthesis.speak(utter)
  }

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1)
      setStatus('idle')
      setTranscript('')
      setScore(null)
    }
  }

  const handleNext = () => {
    if (currentIdx < sentences.length - 1) {
      setCurrentIdx(currentIdx + 1)
      setStatus('idle')
      setTranscript('')
      setScore(null)
    }
  }

  const handleComplete = () => {
    const passed = results.filter(r => r.passed).length
    const failed = results.filter(r => !r.passed).length
    alert(`練習完成！\n過關：${passed} 句\n需要加強：${failed} 句`)
  }

  const isPassed = results.find(r => r.id === sentences[currentIdx]?.id)?.passed

  if (sentences.length === 0) {
    return (
      <div className="px-4 py-6 max-w-2xl mx-auto">
        <p className="text-center text-gray-400">本章節尚無內容</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2">
          {currentIdx + 1} / {sentences.length} 句
        </p>
        <div className="h-2 rounded-full bg-gray-200">
          <div
            style={{ width: `${((currentIdx + 1) / sentences.length) * 100}%` }}
            className="h-2 rounded-full bg-[#0EA5A0] transition-all"
          />
        </div>
      </div>

      {/* Current Sentence Card */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <p className="text-xl font-medium text-[#0F1F3D] mb-3">
              {sentences[currentIdx].en}
            </p>
            <p className="text-gray-500">
              {sentences[currentIdx].zh}
            </p>
          </div>
          {isPassed && (
            <span className="text-green-500 text-xl">✅</span>
          )}
        </div>

        <button
          onClick={handlePlay}
          className="w-full mb-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          ▶ 先聽一次
        </button>

        <button
          onClick={startListening}
          disabled={status === 'listening'}
          className={`w-full px-4 py-3 rounded-lg text-white font-medium transition-colors ${
            status === 'idle' ? 'bg-[#0EA5A0] hover:bg-[#0c9090]' :
            status === 'listening' ? 'bg-red-400 animate-pulse cursor-not-allowed' :
            status === 'success' ? 'bg-green-500 hover:bg-green-600' :
            'bg-orange-400 hover:bg-orange-500'
          }`}
        >
          {status === 'idle' && '🎙️ 開始說話'}
          {status === 'listening' && '⏹ 聆聽中...'}
          {status === 'success' && '✅ 過關！再試一次'}
          {status === 'fail' && '❌ 再試一次'}
        </button>

        {/* Recognition Results */}
        {score !== null && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">
              你說的：{transcript}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              相似度：{score}%
            </p>
            {score >= 70 ? (
              <p className="text-green-500 font-medium">✅ 過關！</p>
            ) : (
              <p className="text-orange-500 font-medium">
                💪 再試試！建議：{sentences[currentIdx].en}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className={`flex-1 px-4 py-2 rounded-lg font-medium ${
            currentIdx === 0
              ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          ← 上一句
        </button>
        <button
          onClick={currentIdx === sentences.length - 1 ? handleComplete : handleNext}
          className="flex-1 px-4 py-2 bg-[#0EA5A0] text-white rounded-lg font-medium hover:bg-[#0c9090]"
        >
          {currentIdx === sentences.length - 1 ? '完成練習 🎉' : '下一句 →'}
        </button>
      </div>
    </div>
  )
}
