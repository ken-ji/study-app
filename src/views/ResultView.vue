<template>
  <v-container class="py-8" style="max-width: 640px;">

    <!-- スコアカード -->
    <v-card class="mb-6 text-center" :color="scoreColor" variant="tonal" elevation="2">
      <v-card-text class="py-6">
        <div class="text-h3 font-weight-bold mb-2">
          {{ sessionStore.score }} / {{ sessionStore.queue.length }}
        </div>
        <div class="text-h6">問正解</div>
        <div class="text-body-1 mt-2">正答率 {{ correctRateText }}</div>
      </v-card-text>
    </v-card>

    <!-- 全問正解 -->
    <v-alert
      v-if="wrongAnswers.length === 0"
      type="success"
      variant="tonal"
      class="mb-6"
      icon="mdi-trophy"
    >
      全問正解です！素晴らしい！
    </v-alert>

    <!-- 不正解一覧 -->
    <template v-else>
      <h2 class="text-h6 mb-3">間違えた問題</h2>
      <v-card
        v-for="(item, index) in wrongAnswers"
        :key="index"
        class="mb-4"
        elevation="1"
        color="error"
        variant="tonal"
      >
        <v-card-text>
          <p class="font-weight-bold mb-2">{{ item.problem.question }}</p>
          <p class="mb-1">
            <span class="text-medium-emphasis">あなたの回答：</span>
            <span class="text-error">{{ item.input }}</span>
          </p>
          <p class="mb-2">
            <span class="text-medium-emphasis">正答：</span>
            <strong>{{ item.problem.answer }}</strong>
          </p>
          <v-divider class="mb-2" />
          <p class="text-body-2">{{ item.problem.explanation }}</p>
        </v-card-text>
      </v-card>
    </template>

    <!-- トップに戻る -->
    <v-btn
      color="primary"
      variant="elevated"
      block
      size="large"
      class="mt-4"
      prepend-icon="mdi-home"
      @click="goHome"
    >
      トップに戻る
    </v-btn>

  </v-container>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '../stores/session.js'

const router = useRouter()
const sessionStore = useSessionStore()

onMounted(() => {
  if (sessionStore.answers.length === 0) {
    router.replace('/')
  }
})

const wrongAnswers = computed(() =>
  sessionStore.answers.filter((a) => !a.isCorrect)
)

const correctRateText = computed(() => {
  const rate = sessionStore.score / sessionStore.queue.length
  return `${Math.round(rate * 100)}%`
})

const scoreColor = computed(() => {
  const rate = sessionStore.score / sessionStore.queue.length
  if (rate === 1) return 'success'
  if (rate >= 0.6) return 'warning'
  return 'error'
})

function goHome() {
  router.push('/')
}
</script>
