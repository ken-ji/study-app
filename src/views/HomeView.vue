<template>
  <v-container class="py-8" style="max-width: 600px;">

    <v-card class="mb-5" elevation="2">
      <v-card-title class="text-h6 pa-4">問題データ</v-card-title>
      <v-card-text class="pb-0">
        <v-chip color="primary" variant="tonal" size="large">
          <v-icon start>mdi-book-open-variant</v-icon>
          インポート済み {{ problemsStore.problems.length }} 問
        </v-chip>
      </v-card-text>
      <v-card-actions class="pa-4">
        <v-btn
          color="secondary"
          variant="outlined"
          prepend-icon="mdi-upload"
          @click="triggerImport"
        >
          JSONを読み込む
        </v-btn>
        <input
          ref="fileInput"
          type="file"
          accept=".json"
          style="display: none;"
          @change="handleImport"
        />
      </v-card-actions>
    </v-card>

    <v-card class="mb-5" elevation="2">
      <v-card-title class="text-h6 pa-4">演習を始める</v-card-title>
      <v-card-text class="pb-0">
        <p v-if="problemsStore.problems.length === 0" class="text-medium-emphasis text-body-2">
          問題データをインポートしてください。
        </p>
      </v-card-text>
      <v-card-actions class="pa-4 ga-3">
        <v-btn
          color="primary"
          variant="elevated"
          size="large"
          :disabled="problemsStore.problems.length === 0"
          @click="startSession(5)"
        >
          5問モード
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          size="large"
          :disabled="problemsStore.problems.length === 0"
          @click="startSession(10)"
        >
          10問モード
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-row>
      <v-col cols="6">
        <v-btn
          to="/analysis"
          block
          variant="tonal"
          color="primary"
          prepend-icon="mdi-chart-bar"
          size="large"
        >
          苦手分析
        </v-btn>
      </v-col>
      <v-col cols="6">
        <v-btn
          to="/manage"
          block
          variant="tonal"
          color="primary"
          prepend-icon="mdi-format-list-bulleted"
          size="large"
        >
          問題管理
        </v-btn>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>

  </v-container>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useProblemsStore } from '../stores/problems.js'
import { useStatsStore } from '../stores/stats.js'
import { useSessionStore } from '../stores/session.js'

const router = useRouter()
const problemsStore = useProblemsStore()
const statsStore = useStatsStore()
const sessionStore = useSessionStore()

const fileInput = ref(null)
const snackbar = reactive({ show: false, message: '', color: 'success' })

onMounted(() => {
  problemsStore.loadFromStorage()
  statsStore.loadFromStorage()
})

function triggerImport() {
  fileInput.value.value = ''
  fileInput.value.click()
}

async function handleImport(event) {
  const file = event.target.files[0]
  if (!file) return

  try {
    const text = await file.text()
    const parsed = JSON.parse(text)
    const data = Array.isArray(parsed) ? parsed : parsed.questions ?? []
    const { added, skipped } = problemsStore.importProblems(data)
    showSnackbar(`${added}問追加、${skipped}問スキップ（重複）`, 'success')
  } catch {
    showSnackbar('JSONの読み込みに失敗しました。ファイルを確認してください。', 'error')
  }
}

function startSession(count) {
  sessionStore.startSession(problemsStore.problems, statsStore.stats, count)
  router.push('/question')
}

function showSnackbar(message, color) {
  snackbar.message = message
  snackbar.color = color
  snackbar.show = true
}
</script>
