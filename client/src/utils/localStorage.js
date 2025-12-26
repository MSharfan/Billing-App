export const load = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch (e) {
    console.error('localStorage load error', e)
    return fallback
  }
}

export const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('localStorage save error', e)
  }
}

export const remove = (key) => {
  try {
    localStorage.removeItem(key)
  } catch (e) {
    console.error('localStorage remove error', e)
  }
}
