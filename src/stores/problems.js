import { defineStore } from 'pinia'
import { getProblems, setProblems } from '../utils/storage.js'

export const useProblemsStore = defineStore('problems', {
  state: () => ({
    problems: [],
  }),

  getters: {
    units: (state) => {
      const set = new Set(state.problems.map((p) => p.unit))
      return Array.from(set).sort()
    },

    getByUnit: (state) => (unit) => {
      if (unit === 'all') return state.problems
      return state.problems.filter((p) => p.unit === unit)
    },
  },

  actions: {
    loadFromStorage() {
      this.problems = getProblems()
    },

    importProblems(newProblems) {
      const existingIds = new Set(this.problems.map((p) => p.id))
      let added = 0
      let skipped = 0

      for (const problem of newProblems) {
        if (existingIds.has(problem.id)) {
          skipped++
        } else {
          this.problems.push(problem)
          existingIds.add(problem.id)
          added++
        }
      }

      setProblems(this.problems)
      return { added, skipped }
    },

    deleteProblems(ids) {
      const deleteSet = new Set(ids)
      this.problems = this.problems.filter((p) => !deleteSet.has(p.id))
      setProblems(this.problems)
    },

    addProblem(data) {
      const problem = { id: crypto.randomUUID(), ...data }
      this.problems.push(problem)
      setProblems(this.problems)
    },

    updateProblem(id, data) {
      const index = this.problems.findIndex((p) => p.id === id)
      if (index === -1) return
      this.problems[index] = { ...this.problems[index], ...data }
      setProblems(this.problems)
    },
  },
})
