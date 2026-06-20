import { defineStore } from 'pinia'
import { selectQuestions } from '../utils/selection.js'
import { judge } from '../utils/grading.js'
import { useStatsStore } from './stats.js'

export const useSessionStore = defineStore('session', {
  state: () => ({
    queue: [],
    currentIndex: 0,
    answers: [],
  }),

  getters: {
    currentQuestion: (state) => state.queue[state.currentIndex] ?? null,
    isFinished: (state) => state.currentIndex >= state.queue.length && state.queue.length > 0,
    score: (state) => state.answers.filter((a) => a.isCorrect).length,
  },

  actions: {
    startSession(problems, stats, count) {
      this.queue = selectQuestions(problems, stats, count)
      this.currentIndex = 0
      this.answers = []
    },

    submitAnswer(input) {
      const question = this.currentQuestion
      if (!question) return

      const isCorrect = judge(input, question.answer)
      const statsStore = useStatsStore()
      statsStore.recordAnswer(question.id, input, isCorrect)

      this.answers.push({
        problem: question,
        input,
        isCorrect,
      })
    },

    nextQuestion() {
      this.currentIndex++
    },
  },
})
