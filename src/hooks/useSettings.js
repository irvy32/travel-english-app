import { useState, useCallback } from 'react'
import * as storage from '../services/storage'

const DEFAULT_SETTINGS = {
  userName: '',
  fontSize: 20,
  showDifficulty: true,
  maxPlayCount: 3,
}

export function useSettings() {
  const [settings, setSettings] = useState(() => storage.getSettings())

  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value }
      storage.saveSettings({ [key]: value })
      return next
    })
  }, [])

  const resetSettings = useCallback(() => {
    storage.setItem('app_settings', DEFAULT_SETTINGS)
    setSettings(DEFAULT_SETTINGS)
  }, [])

  return {
    settings,
    updateSetting,
    resetSettings,
  }
}
