<template>
  <v-container class="py-8" style="max-width: 720px;">

    <h1 class="text-h5 mb-6">苦手分析</h1>

    <!-- データなし -->
    <v-alert
      v-if="problemsStore.problems.length === 0"
      type="info"
      variant="tonal"
      icon="mdi-information"
    >
      問題データがありません。トップ画面からJSONをインポートしてください。
    </v-alert>

    <template v-else>

      <!-- 単元別正答率 -->
      <h2 class="text-h6 mb-3">単元別正答率</h2>
      <v-card class="mb-8" elevation="1">
        <v-table>
          <thead>
            <tr>
              <th>単元</th>
              <th class="text-center">出題数</th>
              <th class="text-center">正解数</th>
              <th class="text-center">正答率</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in unitStats" :key="row.unit">
              <td>{{ row.unit }}</td>
              <td class="text-center">{{ row.attemptCount }}</td>
              <td class="text-center">{{ row.correctCount }}</td>
              <td class="text-center">
                <v-chip
                  v-if="row.correctRate !== null"
                  :color="rateColor(row.correctRate)"
                  size="small"
                  variant="tonal"
                >
                  {{ rateText(row.correctRate) }}
                </v-chip>
                <span v-else class="text-medium-emphasis text-body-2">未挑戦</span>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>

      <!-- 苦手問題一覧 -->
      <h2 class="text-h6 mb-3">苦手問題一覧</h2>

      <v-alert
        v-if="weakProblems.length === 0"
        type="success"
        variant="tonal"
        icon="mdi-trophy"
        class="mb-4"
      >
        苦手問題はありません。演習を続けて記録を積み上げましょう！
      </v-alert>

      <v-card
        v-for="item in weakProblems"
        :key="item.id"
        class="mb-3"
        elevation="1"
      >
        <v-card-text>
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="text-caption text-medium-emphasis">{{ item.unit }}</span>
            <div class="d-flex align-center ga-2">
              <span class="text-caption text-medium-emphasis">
                {{ item.attemptCount }}回挑戦
              </span>
              <v-chip
                v-if="item.correctRate !== null"
                :color="rateColor(item.correctRate)"
                size="small"
                variant="tonal"
              >
                {{ rateText(item.correctRate) }}
              </v-chip>
              <span v-else class="text-caption text-medium-emphasis">未挑戦</span>
            </div>
          </div>
          <p class="text-body-1">{{ item.question }}</p>
        </v-card-text>
      </v-card>

    </template>

  </v-container>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useProblemsStore } from '../stores/problems.js'
import { useStatsStore } from '../stores/stats.js'

const problemsStore = useProblemsStore()
const statsStore = useStatsStore()

onMounted(() => {
  problemsStore.loadFromStorage()
  statsStore.loadFromStorage()
})

const unitStats = computed(() => {
  return problemsStore.units.map((unit) => {
    const s = statsStore.getStatsByUnit(unit, problemsStore.problems)
    return { unit, ...s }
  }).sort((a, b) => {
    if (a.correctRate === null && b.correctRate === null) return 0
    if (a.correctRate === null) return 1
    if (b.correctRate === null) return -1
    return a.correctRate - b.correctRate
  })
})

const weakProblems = computed(() => {
  return problemsStore.problems
    .map((p) => {
      const s = statsStore.getStatsByProblem(p.id)
      return { ...p, ...s }
    })
    .filter((p) => p.attemptCount > 0)
    .sort((a, b) => a.correctRate - b.correctRate)
})

function rateColor(rate) {
  if (rate >= 0.8) return 'success'
  if (rate >= 0.5) return 'warning'
  return 'error'
}

function rateText(rate) {
  return `${Math.round(rate * 100)}%`
}
</script>
