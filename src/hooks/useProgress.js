import { useState, useCallback } from 'react'
import * as storage from '../services/storage'

export function useProgress(topicId, chapterId, totalCount = 0) {
  const [learnedIds, setLearnedIds] = useState(() =>
    storage.getProgress(topicId, chapterId),
  )

  const markLearned = useCallback(
    (id) => {
      setLearnedIds((prev) => {
        if (prev.includes(id)) return prev
        storage.addLearnedSentence(topicId, chapterId, id)
        return [...prev, id]
      })
    },
    [topicId, chapterId],
  )

  const isLearned = useCallback((id) => learnedIds.includes(id), [learnedIds])

  const clearProgress = useCallback(() => {
    storage.clearProgress(topicId, chapterId)
    setLearnedIds([])
  }, [topicId, chapterId])

  const progressPercent =
    totalCount === 0 ? 0 : Math.round((learnedIds.length / totalCount) * 100)

  return {
    learnedIds,
    totalCount,
    markLearned,
    isLearned,
    progressPercent,
    clearProgress,
  }
}
