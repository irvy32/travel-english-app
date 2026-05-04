const SETTINGS_KEY = 'app_settings'
const MAX_STREAK = 3

const DEFAULT_SETTINGS = {
  userName: '',
  fontSize: 20,
  showDifficulty: true,
  maxPlayCount: 3,
}

function getProgressKey(topicId, chapterId) {
  return `progress_${topicId}_${chapterId}`
}

function getFavoritesKey(topicId) {
  return `favorites_${topicId}`
}

function getWrongKey(topicId) {
  return `wrong_${topicId}`
}

export function getItem(key) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return null
    return JSON.parse(raw)
  } catch (error) {
    console.error('getItem failed:', error)
    return null
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('setItem failed:', error)
  }
}

export function removeItem(key) {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('removeItem failed:', error)
  }
}

export function getProgress(topicId, chapterId) {
  try {
    const data = getItem(getProgressKey(topicId, chapterId))
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('getProgress failed:', error)
    return []
  }
}

export function addLearnedSentence(topicId, chapterId, sentenceId) {
  try {
    const progress = getProgress(topicId, chapterId)
    if (!progress.includes(sentenceId)) {
      progress.push(sentenceId)
      setItem(getProgressKey(topicId, chapterId), progress)
    }
  } catch (error) {
    console.error('addLearnedSentence failed:', error)
  }
}

export function clearProgress(topicId, chapterId) {
  try {
    removeItem(getProgressKey(topicId, chapterId))
  } catch (error) {
    console.error('clearProgress failed:', error)
  }
}

export function getFavorites(topicId) {
  try {
    const data = getItem(getFavoritesKey(topicId))
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('getFavorites failed:', error)
    return []
  }
}

export function addFavorite(topicId, item) {
  try {
    const favorites = getFavorites(topicId)
    const exists = favorites.some((entry) => entry?.id === item?.id)
    if (!exists) {
      favorites.push(item)
      setItem(getFavoritesKey(topicId), favorites)
    }
  } catch (error) {
    console.error('addFavorite failed:', error)
  }
}

export function removeFavorite(topicId, sentenceId) {
  try {
    const favorites = getFavorites(topicId)
    const next = favorites.filter((entry) => entry?.id !== sentenceId)
    setItem(getFavoritesKey(topicId), next)
  } catch (error) {
    console.error('removeFavorite failed:', error)
  }
}

export function isFavorite(topicId, sentenceId) {
  try {
    const favorites = getFavorites(topicId)
    return favorites.some((entry) => entry?.id === sentenceId)
  } catch (error) {
    console.error('isFavorite failed:', error)
    return false
  }
}

export function getWrongBank(topicId) {
  try {
    const data = getItem(getWrongKey(topicId))
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('getWrongBank failed:', error)
    return []
  }
}

export function addWrongItem(topicId, item) {
  try {
    const wrongBank = getWrongBank(topicId)
    const exists = wrongBank.some((entry) => entry?.id === item?.id)
    if (!exists) {
      wrongBank.push(item)
      setItem(getWrongKey(topicId), wrongBank)
    }
  } catch (error) {
    console.error('addWrongItem failed:', error)
  }
}

export function updateStreak(topicId, questionId, correct) {
  try {
    const wrongBank = getWrongBank(topicId)
    const index = wrongBank.findIndex((entry) => entry?.id === questionId)
    if (index === -1) return

    const current = wrongBank[index]
    const nextStreak = correct ? (current.streak || 0) + 1 : 0

    if (nextStreak >= MAX_STREAK) {
      wrongBank.splice(index, 1)
    } else {
      wrongBank[index] = { ...current, streak: nextStreak }
    }

    setItem(getWrongKey(topicId), wrongBank)
  } catch (error) {
    console.error('updateStreak failed:', error)
  }
}

export function removeWrongItem(topicId, questionId) {
  try {
    const wrongBank = getWrongBank(topicId)
    const next = wrongBank.filter((entry) => entry?.id !== questionId)
    setItem(getWrongKey(topicId), next)
  } catch (error) {
    console.error('removeWrongItem failed:', error)
  }
}

export function getSettings() {
  try {
    const data = getItem(SETTINGS_KEY)
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return { ...DEFAULT_SETTINGS }
    }
    return { ...DEFAULT_SETTINGS, ...data }
  } catch (error) {
    console.error('getSettings failed:', error)
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(partial) {
  try {
    const current = getSettings()
    const safePartial =
      partial && typeof partial === 'object' && !Array.isArray(partial) ? partial : {}
    setItem(SETTINGS_KEY, { ...current, ...safePartial })
  } catch (error) {
    console.error('saveSettings failed:', error)
  }
}
