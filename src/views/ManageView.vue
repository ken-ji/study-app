<template>
  <v-container class="py-8" style="max-width: 800px;">

    <h1 class="text-h5 mb-6">問題管理</h1>

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

      <!-- フィルタ・操作バー -->
      <div class="d-flex align-center ga-3 mb-4 flex-wrap">
        <v-select
          v-model="selectedUnit"
          :items="unitOptions"
          label="単元で絞り込む"
          variant="outlined"
          density="compact"
          hide-details
          style="max-width: 240px;"
        />
        <v-spacer />
        <span class="text-body-2 text-medium-emphasis">
          {{ filteredProblems.length }}問 / {{ checkedIds.size }}件選択中
        </span>
        <v-btn
          color="error"
          variant="elevated"
          :disabled="checkedIds.size === 0"
          prepend-icon="mdi-delete"
          @click="confirmDialog = true"
        >
          削除
        </v-btn>
      </div>

      <!-- 問題テーブル -->
      <v-card elevation="1">
        <v-table>
          <thead>
            <tr>
              <th style="width: 48px;">
                <v-checkbox
                  :model-value="allChecked"
                  :indeterminate="someChecked"
                  hide-details
                  @change="toggleAll"
                />
              </th>
              <th style="width: 110px;">ID</th>
              <th style="width: 130px;">単元</th>
              <th>問題文</th>
              <th style="width: 60px;" class="text-center">種別</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="problem in filteredProblems" :key="problem.id">
              <td>
                <v-checkbox
                  :model-value="checkedIds.has(problem.id)"
                  hide-details
                  @change="toggleOne(problem.id)"
                />
              </td>
              <td class="text-caption text-medium-emphasis">{{ problem.id }}</td>
              <td class="text-body-2">{{ problem.unit }}</td>
              <td class="text-body-2">{{ problem.question }}</td>
              <td class="text-center">
                <v-chip size="x-small" :color="problem.type === 'choice' ? 'primary' : 'secondary'" variant="tonal">
                  {{ problem.type === 'choice' ? '4択' : '入力' }}
                </v-chip>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>

    </template>

    <!-- 削除確認ダイアログ -->
    <v-dialog v-model="confirmDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6 pa-4">削除の確認</v-card-title>
        <v-card-text>
          選択した <strong>{{ checkedIds.size }}問</strong> を削除しますか？<br />
          この操作は元に戻せません。
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="confirmDialog = false">キャンセル</v-btn>
          <v-btn color="error" variant="elevated" @click="deleteSelected">削除する</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProblemsStore } from '../stores/problems.js'

const problemsStore = useProblemsStore()

const selectedUnit = ref('all')
const checkedIds = ref(new Set())
const confirmDialog = ref(false)

onMounted(() => {
  problemsStore.loadFromStorage()
})

const unitOptions = computed(() => [
  { title: 'すべて', value: 'all' },
  ...problemsStore.units.map((u) => ({ title: u, value: u })),
])

const filteredProblems = computed(() =>
  problemsStore.getByUnit(selectedUnit.value)
)

const allChecked = computed(
  () => filteredProblems.value.length > 0 && filteredProblems.value.every((p) => checkedIds.value.has(p.id))
)

const someChecked = computed(
  () => !allChecked.value && filteredProblems.value.some((p) => checkedIds.value.has(p.id))
)

function toggleOne(id) {
  const next = new Set(checkedIds.value)
  next.has(id) ? next.delete(id) : next.add(id)
  checkedIds.value = next
}

function toggleAll() {
  if (allChecked.value) {
    const next = new Set(checkedIds.value)
    filteredProblems.value.forEach((p) => next.delete(p.id))
    checkedIds.value = next
  } else {
    const next = new Set(checkedIds.value)
    filteredProblems.value.forEach((p) => next.add(p.id))
    checkedIds.value = next
  }
}

function deleteSelected() {
  problemsStore.deleteProblems([...checkedIds.value])
  checkedIds.value = new Set()
  confirmDialog.value = false
}
</script>
