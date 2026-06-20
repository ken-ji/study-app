const KEYS = {
  PROBLEMS: 'studyApp_problems',
  HISTORY: 'studyApp_history',
  STATS: 'studyApp_stats',
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error(`localStorage への書き込みに失敗しました (${key}):`, e)
  }
}

export function getProblems() {
  return load(KEYS.PROBLEMS, [])
}

export function setProblems(data) {
  save(KEYS.PROBLEMS, data)
}

export function getHistory() {
  return load(KEYS.HISTORY, [])
}

export function setHistory(data) {
  save(KEYS.HISTORY, data)
}

export function getStats() {
  return load(KEYS.STATS, {})
}

export function setStats(data) {
  save(KEYS.STATS, data)
}
