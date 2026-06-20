<template>
  <v-container class="py-8" style="max-width: 640px;">

    <!-- 進捗 -->
    <div class="d-flex align-center justify-space-between mb-4">
      <span class="text-body-2 text-medium-emphasis">
        {{ currentIndex + 1 }} 問目 / {{ sessionStore.queue.length }} 問
      </span>
      <v-progress-linear
        :model-value="progressPercent"
        color="primary"
        rounded
        style="max-width: 200px;"
      />
    </div>

    <!-- 問題カード -->
    <v-card elevation="2" class="mb-5">
      <v-card-text class="text-h6 pa-6">
        {{ currentQuestion.question }}
      </v-card-text>
    </v-card>

    <!-- 4択 -->
    <template v-if="currentQuestion.type === 'choice' && choices">
      <v-row>
        <v-col v-for="choice in choices" :key="choice" cols="6">
          <v-btn
            block
            size="large"
            :variant="choiceVariant(choice)"
            :color="choiceColor(choice)"
            :disabled="answered"
            class="text-wrap"
            style="height: auto; min-height: 56px; white-space: normal;"
            @click="submitChoice(choice)"
          >
            {{ choice }}
          </v-btn>
        </v-col>
      </v-row>
    </template>

    <!-- テキスト入力 -->
    <template v-else>
      <v-text-field
        v-model="userInput"
        label="答えを入力"
        variant="outlined"
        :disabled="answered"
        @keyup.enter="!answered && submitText()"
      />
      <v-btn
        color="primary"
        variant="elevated"
        block
        size="large"
        :disabled="answered || userInput.trim() === ''"
        @click="submitText"
      >
        回答する
      </v-btn>
    </template>

    <!-- 採点結果・解説 -->
    <v-card v-if="answered" class="mt-5" :color="isCorrect ? 'success' : 'error'" variant="tonal">
      <v-card-title class="pa-4">
        <v-icon :icon="isCorrect ? 'mdi-check-circle' : 'mdi-close-circle'" class="mr-2" />
        {{ isCorrect ? '正解！' : '不正解' }}
      </v-card-title>
      <v-card-text>
        <p v-if="!isCorrect" class="mb-2">
          <strong>正答：</strong>{{ currentQuestion.answer }}
        </p>
        <p><strong>解説：</strong>{{ currentQuestion.explanation }}</p>
      </v-card-text>
      <v-card-actions class="pa-4">
        <v-btn
          variant="elevated"
          color="primary"
          block
          size="large"
          @click="goNext"
        >
          {{ sessionStore.isFinished ? '結果を見る' : '次の問題へ' }}
        </v-btn>
      </v-card-actions>
    </v-card>

  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '../stores/session.js'
import { buildChoices } from '../utils/distractors.js'

const router = useRouter()
const sessionStore = useSessionStore()

const answered = ref(false)
const isCorrect = ref(false)
const userInput = ref('')
const choices = ref(null)
const selectedChoice = ref(null)

const currentQuestion = computed(() => sessionStore.currentQuestion)
const currentIndex = computed(() => sessionStore.currentIndex)

const progressPercent = computed(() =>
  Math.round((currentIndex.value / sessionStore.queue.length) * 100)
)

onMounted(() => {
  if (!currentQuestion.value) {
    router.replace('/')
    return
  }
  resetQuestion()
})

watch(currentQuestion, (q) => {
  if (q) resetQuestion()
})

function resetQuestion() {
  answered.value = false
  isCorrect.value = false
  userInput.value = ''
  selectedChoice.value = null
  choices.value = buildChoices(currentQuestion.value.answer, currentQuestion.value.type)
}

function submitChoice(choice) {
  selectedChoice.value = choice
  sessionStore.submitAnswer(choice)
  const last = sessionStore.answers[sessionStore.answers.length - 1]
  isCorrect.value = last?.isCorrect ?? false
  answered.value = true
}

function submitText() {
  sessionStore.submitAnswer(userInput.value)
  const last = sessionStore.answers[sessionStore.answers.length - 1]
  isCorrect.value = last?.isCorrect ?? false
  answered.value = true
}

function choiceVariant(choice) {
  if (!answered.value) return 'outlined'
  if (choice === currentQuestion.value.answer) return 'elevated'
  if (choice === selectedChoice.value) return 'elevated'
  return 'outlined'
}

function choiceColor(choice) {
  if (!answered.value) return 'primary'
  if (choice === currentQuestion.value.answer) return 'success'
  if (choice === selectedChoice.value && !isCorrect.value) return 'error'
  return 'primary'
}

function goNext() {
  sessionStore.nextQuestion()
  if (sessionStore.isFinished) {
    router.push('/result')
  }
}
</script>
