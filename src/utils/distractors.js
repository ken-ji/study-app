function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function generateNumericDistractors(answer, count) {
  const num = parseFloat(answer)
  if (isNaN(num)) return null

  const candidates = []
  for (let diff = 1; candidates.length < count * 4; diff++) {
    candidates.push(num + diff, num - diff)
  }

  const distractors = []
  const seen = new Set([num])
  for (const c of candidates) {
    if (!seen.has(c) && distractors.length < count) {
      seen.add(c)
      // 元の答えが整数なら整数で返す
      distractors.push(Number.isInteger(num) ? String(Math.round(c)) : String(c))
    }
    if (distractors.length >= count) break
  }

  return distractors
}

function buildChoices(answer, type) {
  if (type !== 'choice') return null

  const distractors = generateNumericDistractors(answer, 3)
  if (!distractors) return null

  return shuffle([answer, ...distractors])
}

export { shuffle, generateNumericDistractors, buildChoices }
