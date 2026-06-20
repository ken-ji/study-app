import { defineStore } from 'pinia'
import { getHistory, setHistory, getStats, setStats } from '../utils/storage.js'

export const useStatsStore = defineStore('stats', {
  state: () => ({
    history: [],
    stats: {},
  }),

  getters: {
    getStatsByProblem: (state) => (id) => {
      const s = state.stats[id]
      if (!s) return { attemptCount: 0, correctCount: 0, correctRate: null }
      const correctRate = s.attemptCount > 0 ? s.correctCount / s.attemptCount : null
      return { ...s, correctRate }
    },

    getStatsByUnit: (state) => (unit, problems) => {
      const unitProblems = problems.filter((p) => p.unit === unit)
      let attemptCount = 0
      let correctCount = 0

      for (const p of unitProblems) {
        const s = state.stats[p.id]
        if (s) {
          attemptCount += s.attemptCount
          correctCount += s.correctCount
        }
      }

      const correctRate = attemptCount > 0 ? correctCount / attemptCount : null
      return { attemptCount, correctCount, correctRate }
    },
  },

  actions: {
    loadFromStorage() {
      this.history = getHistory()
      this.stats = getStats()
    },

    recordAnswer(problemId, answer, isCorrect) {
      this.history.push({
        problemId,
        answer,
        isCorrect,
        answeredAt: new Date().toISOString(),
      })
      setHistory(this.history)

      if (!this.stats[problemId]) {
        this.stats[problemId] = { attemptCount: 0, correctCount: 0 }
      }
      this.stats[problemId].attemptCount++
      if (isCorrect) this.stats[problemId].correctCount++
      setStats(this.stats)
    },
  },
})
