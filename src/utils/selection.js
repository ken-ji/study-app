const MIN_WEIGHT = 0.1

function calcWeight(stats, id) {
  const s = stats[id]
  if (!s || s.attemptCount === 0) return 1.0
  const correctRate = s.correctCount / s.attemptCount
  return Math.max(1 - correctRate, MIN_WEIGHT)
}

function selectQuestions(problems, stats, count) {
  if (problems.length === 0) return []

  const actual = Math.min(count, problems.length)
  const weights = problems.map((p) => calcWeight(stats, p.id))
  const selected = []
  const remaining = [...problems]
  const remainingWeights = [...weights]

  for (let i = 0; i < actual; i++) {
    const total = remainingWeights.reduce((sum, w) => sum + w, 0)
    let rand = Math.random() * total
    let idx = 0
    for (let j = 0; j < remainingWeights.length; j++) {
      rand -= remainingWeights[j]
      if (rand <= 0) {
        idx = j
        break
      }
    }
    selected.push(remaining[idx])
    remaining.splice(idx, 1)
    remainingWeights.splice(idx, 1)
  }

  return selected
}

export { calcWeight, selectQuestions }
