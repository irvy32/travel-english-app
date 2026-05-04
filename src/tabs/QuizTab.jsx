import { useState } from 'react'
import { useSettings } from '../hooks/useSettings'
import * as storage from '../services/storage'

export default function QuizTab({ quizData, sentences = [], topicId, chapterId }) {
  const { settings } = useSettings()
  const maxPlay = settings?.maxPlayCount ?? 3

  const mc = quizData?.multiple_choice ?? []
  const fi = quizData?.fill_in ?? []
  const li = quizData?.listening ?? []
  const total = mc.length + fi.length + li.length

  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [playCount, setPlayCount] = useState({})

  const answeredCount = Object.keys(answers).filter(k => (answers[k] ?? '').toString().trim() !== '').length
  const canSubmit = total > 0 && answeredCount >= total

  const setAnswer = (id, val) => setAnswers(prev => ({ ...prev, [id]: val }))

  const handlePlay = (q) => {
    const used = playCount[q.id] ?? 0
    if (used >= maxPlay) return
    const found = sentences.find(s => s.id === q.sentence_id)
    if (found) {
      window.speechSynthesis.cancel()
      const utter = new SpeechSynthesisUtterance(found.en)
      utter.lang = 'en-US'
      window.speechSynthesis.speak(utter)
    }
    setPlayCount(prev => ({ ...prev, [q.id]: (prev[q.id] ?? 0) + 1 }))
  }

  const calcScore = () => {
    let score = 0
    mc.forEach(q => { if (answers[q.id] === q.answer) score++ })
    fi.forEach(q => {
      if ((answers[q.id] ?? '').trim().toLowerCase() === q.answer.toLowerCase()) score++
    })
    li.forEach(q => {
      const found = sentences.find(s => s.id === q.sentence_id)
      if ((answers[q.id] ?? '').trim().toLowerCase() === (found?.en ?? '').toLowerCase()) score++
    })
    return score
  }

  const handleReset = () => {
    setAnswers({})
    setSubmitted(false)
    setPlayCount({})
  }

  if (total === 0) return (
    <p className="text-center text-gray-400 mt-10 px-4">本章節尚無測驗題目</p>
  )

  /* ───── 結果頁 ───── */
  if (submitted) {
    const score = calcScore()
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <p className="text-3xl font-bold text-[#0F1F3D] text-center mb-8">
          答對 {score} / {total} 題 🎉
        </p>

        {mc.length > 0 && <>
          <h3 className="text-lg font-bold text-[#0F1F3D] mb-3">一、選擇題</h3>
          {mc.map((q, idx) => {
            const ok = answers[q.id] === q.answer
            return (
              <div key={q.id} className="border rounded-xl p-4 mb-3 bg-white shadow-sm">
                <p className="text-xs text-gray-400 mb-1">第 {idx + 1} 題</p>
                <p className="font-medium mb-2">{q.question}</p>
                <p className={ok ? 'text-green-600' : 'text-red-500'}>
                  {ok ? '✓' : '✗'} {answers[q.id] ?? '（未作答）'}
                </p>
                {!ok && <p className="text-green-600 text-sm mt-1">正確：{q.answer}</p>}
              </div>
            )
          })}
        </>}

        {fi.length > 0 && <>
          <h3 className="text-lg font-bold text-[#0F1F3D] mb-3 mt-6">二、填空題</h3>
          {fi.map((q, idx) => {
            const ok = (answers[q.id] ?? '').trim().toLowerCase() === q.answer.toLowerCase()
            return (
              <div key={q.id} className="border rounded-xl p-4 mb-3 bg-white shadow-sm">
                <p className="text-xs text-gray-400 mb-1">第 {idx + 1} 題</p>
                <p className="font-medium mb-2">{q.question}</p>
                <p className={ok ? 'text-green-600' : 'text-red-500'}>
                  {ok ? '✓' : '✗'} {answers[q.id] ?? '（未作答）'}
                </p>
                {!ok && <p className="text-green-600 text-sm mt-1">正確：{q.answer}</p>}
              </div>
            )
          })}
        </>}

        {li.length > 0 && <>
          <h3 className="text-lg font-bold text-[#0F1F3D] mb-3 mt-6">三、聽力題</h3>
          {li.map((q, idx) => {
            const found = sentences.find(s => s.id === q.sentence_id)
            const correct_ans = found?.en ?? ''
            const ok = (answers[q.id] ?? '').trim().toLowerCase() === correct_ans.toLowerCase()
            return (
              <div key={q.id} className="border rounded-xl p-4 mb-3 bg-white shadow-sm">
                <p className="text-xs text-gray-400 mb-1">聽力題 {idx + 1}</p>
                <p className={ok ? 'text-green-600' : 'text-red-500'}>
                  {ok ? '✓' : '✗'} {answers[q.id] ?? '（未作答）'}
                </p>
                {!ok && <p className="text-green-600 text-sm mt-1">正確：{correct_ans}</p>}
              </div>
            )
          })}
        </>}

        <button onClick={handleReset}
          className="w-full py-3 rounded-xl bg-[#0F1F3D] text-white text-lg font-medium mt-4">
          再做一次
        </button>
      </div>
    )
  }

  /* ───── 作答頁 ───── */
  return (
    <div className="max-w-2xl mx-auto px-4 py-4">

      {/* 選擇題 */}
      {mc.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-[#0F1F3D] mb-4">一、選擇題</h3>
          {mc.map((q, idx) => (
            <div key={q.id} className="border rounded-xl p-4 mb-3 bg-white shadow-sm">
              <p className="text-xs text-gray-400 mb-1">第 {idx + 1} 題</p>
              <p className="font-medium mb-3">{q.question}</p>
              <div className="flex flex-col gap-2">
                {(q.options ?? []).map(opt => (
                  <button key={opt.en}
                    onClick={() => setAnswer(q.id, opt.en)}
                    className={`text-left border rounded-lg px-3 py-2 transition-colors ${
                      answers[q.id] === opt.en
                        ? 'border-[#0EA5A0] bg-[#0EA5A0]/10'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}>
                    <span className="block text-base">{opt.en}</span>
                    <span className="text-sm text-gray-400">{opt.zh}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 填空題 */}
      {fi.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-[#0F1F3D] mb-4">二、填空題</h3>
          {fi.map((q, idx) => (
            <div key={q.id} className="border rounded-xl p-4 mb-3 bg-white shadow-sm">
              <p className="text-xs text-gray-400 mb-1">第 {idx + 1} 題</p>
              <p className="font-medium mb-2">{q.question}</p>
              <input type="text"
                placeholder="請填入答案"
                value={answers[q.id] ?? ''}
                onChange={e => setAnswer(q.id, e.target.value)}
                className="border rounded px-3 py-2 w-full text-sm focus:outline-none focus:border-[#0EA5A0]"
              />
            </div>
          ))}
        </div>
      )}

      {/* 聽力題 */}
      {li.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-[#0F1F3D] mb-4">三、聽力題</h3>
          {li.map((q, idx) => {
            const used = playCount[q.id] ?? 0
            const remaining = maxPlay - used
            return (
              <div key={q.id} className="border rounded-xl p-4 mb-3 bg-white shadow-sm">
                <p className="text-xs text-gray-400 mb-2">聽力題 {idx + 1}</p>
                <button
                  onClick={() => handlePlay(q)}
                  disabled={remaining <= 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm mb-3 transition-colors ${
                    remaining <= 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#0EA5A0] hover:bg-[#0c9090]'
                  }`}>
                  ▶ 播放（剩 {remaining} 次）
                </button>
                <input type="text"
                  placeholder="請填入聽到的英文句子"
                  value={answers[q.id] ?? ''}
                  onChange={e => setAnswer(q.id, e.target.value)}
                  className="border rounded px-3 py-2 w-full text-sm focus:outline-none focus:border-[#0EA5A0]"
                />
              </div>
            )
          })}
        </div>
      )}

      <button
        onClick={() => {
  // 寫入錯題本
  mc.forEach(q => {
    const userAns = answers[q.id] ?? ''
    const correct = userAns === q.answer
    if (!correct) {
      storage.addWrongItem(topicId, {
        id: q.id,
        question: q.question,
        userAnswer: userAns,
        correctAnswer: q.answer,
        chapter_id: chapterId,
        streak: 0
      })
    }
  })
  fi.forEach(q => {
    const userAns = answers[q.id] ?? ''
    const correct = userAns.trim().toLowerCase() === q.answer.toLowerCase()
    if (!correct) {
      storage.addWrongItem(topicId, {
        id: q.id,
        question: q.question,
        userAnswer: userAns,
        correctAnswer: q.answer,
        chapter_id: chapterId,
        streak: 0
      })
    }
  })
  li.forEach(q => {
    const found = sentences.find(s => s.id === q.sentence_id)
    const correctAnswer = found?.en ?? ''
    const userAns = answers[q.id] ?? ''
    const correct = userAns.trim().toLowerCase() === correctAnswer.toLowerCase()
    if (!correct) {
      storage.addWrongItem(topicId, {
        id: q.id,
        question: `聽力題：${correctAnswer}`,
        userAnswer: userAns,
        correctAnswer: correctAnswer,
        chapter_id: chapterId,
        streak: 0
      })
    }
  })
  setSubmitted(true)
}}
        disabled={!canSubmit}
        className={`w-full py-3 rounded-xl text-white text-lg font-medium transition-opacity ${
          canSubmit ? 'bg-[#0F1F3D] hover:bg-[#1a3360]' : 'bg-gray-300 cursor-not-allowed'
        }`}>
        提交答案（{answeredCount}/{total}）
      </button>
    </div>
  )
}