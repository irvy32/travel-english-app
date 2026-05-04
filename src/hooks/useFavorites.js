import { useState, useCallback } from 'react'
import * as storage from '../services/storage'

export function useFavorites(topicId) {
  const [favorites, setFavorites] = useState(
    () => storage.getFavorites(topicId)
  )

  const addFavorite = useCallback((item) => {
    storage.addFavorite(topicId, item)
    setFavorites(storage.getFavorites(topicId))
  }, [topicId])

  const removeFavorite = useCallback((sentenceId) => {
    storage.removeFavorite(topicId, sentenceId)
    setFavorites(storage.getFavorites(topicId))
  }, [topicId])

  const toggleFavorite = useCallback((sentence) => {
    if (storage.isFavorite(topicId, sentence.id)) {
      storage.removeFavorite(topicId, sentence.id)
    } else {
      storage.addFavorite(topicId, {
        id: sentence.id,
        en: sentence.en,
        zh: sentence.zh,
        kk_line: sentence.kk_line ?? sentence.keywords ?? [],
        chapter_id: sentence.chapter_id ?? '',
        chapter_name: sentence.chapter_name ?? ''
      })
    }
    setFavorites(storage.getFavorites(topicId))
  }, [topicId])

  const isFavorite = useCallback((sentenceId) => {
    return storage.isFavorite(topicId, sentenceId)
  }, [topicId, favorites])

  return { favorites, addFavorite, removeFavorite, toggleFavorite, isFavorite }
}
