import { useState } from 'react'
import SentenceCard from '../components/SentenceCard'
import { useProgress } from '../hooks/useProgress'
import { useFavorites } from '../hooks/useFavorites'

export default function SentencesTab({ sentences = [], topicId, chapterId }) {
  const { learnedIds, markLearned, isLearned, progressPercent } = useProgress(
    topicId,
    chapterId,
    sentences.length,
  )

  const { toggleFavorite, isFavorite } = useFavorites(topicId)

  const handlePlay = (sentence) => {
    const utter = new SpeechSynthesisUtterance(sentence.en)
    utter.lang = 'en-US'
    speechSynthesis.speak(utter)
    markLearned(sentence.id)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-4">
      <div className="sticky top-[56px] z-40 bg-[#FAF7F2] py-3">
        <p className="mb-2 text-sm text-gray-600">
          已學 {learnedIds.length} / 總計 {sentences.length} 句
        </p>
        <div className="h-2 rounded-full bg-gray-200">
          <div
            style={{ width: `${progressPercent}%` }}
            className="h-2 rounded-full bg-[#0EA5A0] transition-all"
          />
        </div>
      </div>

      {sentences.length === 0 ? (
        <p className="py-8 text-center text-gray-500">本章節尚無內容</p>
      ) : (
        <div className="space-y-4">
          {sentences.map((s) => (
            <SentenceCard
              key={s.id}
              sentence={s}
              mode="sentences"
              onPlay={handlePlay}
              onFavorite={toggleFavorite}
              isFavorite={isFavorite(s.id)}
              isLearned={isLearned(s.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
