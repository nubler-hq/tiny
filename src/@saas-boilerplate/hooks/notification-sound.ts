export const NOTIFICATION_SOUND_KEY = 'notification_sound_enabled'

export function getNotificationSoundEnabled(): boolean {
  try {
    const raw =
      typeof window !== 'undefined'
        ? localStorage.getItem(NOTIFICATION_SOUND_KEY)
        : null
    if (raw === null) return true
    return raw === '1'
  } catch (e) {
    return true
  }
}

export function setNotificationSoundEnabled(enabled: boolean): void {
  try {
    if (typeof window === 'undefined') return
    localStorage.setItem(NOTIFICATION_SOUND_KEY, enabled ? '1' : '0')
  } catch (e) {
    // ignore
  }
}
