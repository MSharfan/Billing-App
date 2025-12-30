export const load = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    // If stored value is the literal null (JSON "null"), JSON.parse returns null.
    // Treat that as missing data and return the fallback so callers get proper defaults.
    if (parsed === null) return fallback
    return parsed
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

