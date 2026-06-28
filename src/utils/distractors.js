function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function calcStep(num) {
  const abs = Math.abs(num)
  if (abs <= 20) return 1
  return Math.max(2, Math.round((abs * abs) / 2000))
}

function fmt(num, c) {
  return Number.isInteger(num) ? String(Math.round(c)) : String(c)
}

function generateNumericDistractors(answer, count) {
  const num = parseFloat(answer)
  if (isNaN(num)) return null

  const seen = new Set([num])
  const distractors = []

  // 符号反転を最初の誤答として追加（0以外）
  if (num !== 0) {
    const rev = -num
    if (!seen.has(rev)) {
      seen.add(rev)
      distractors.push(fmt(num, rev))
    }
  }

  // 残りをステップベースで埋める
  const step = calcStep(num)
  for (let i = 1; distractors.length < count; i++) {
    for (const c of [num + step * i, num - step * i]) {
      if (!seen.has(c) && distractors.length < count) {
        seen.add(c)
        distractors.push(fmt(num, c))
      }
    }
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
