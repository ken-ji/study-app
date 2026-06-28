<template>
  <v-container class="py-8" style="max-width: 800px;">

    <h1 class="text-h5 mb-6">問題管理</h1>

    <!-- フィルタ・操作バー（常時表示） -->
    <div class="d-flex align-center ga-3 mb-4 flex-wrap">
      <v-select
        v-model="selectedUnit"
        :items="unitOptions"
        label="単元で絞り込む"
        variant="outlined"
        density="compact"
        hide-details
        style="max-width: 240px;"
        :disabled="problemsStore.problems.length === 0"
      />
      <v-spacer />
      <span class="text-body-2 text-medium-emphasis">
        {{ filteredProblems.length }}問 / {{ checkedIds.size }}件選択中
      </span>
      <v-btn
        color="primary"
        variant="elevated"
        prepend-icon="mdi-plus"
        @click="openNew"
      >
        追加
      </v-btn>
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

    <!-- データなし -->
    <v-alert
      v-if="problemsStore.problems.length === 0"
      type="info"
      variant="tonal"
      icon="mdi-information"
    >
      問題データがありません。「追加」ボタンで問題を作成するか、トップ画面からJSONをインポートしてください。
    </v-alert>

    <!-- 問題テーブル -->
    <v-card v-if="problemsStore.problems.length > 0" elevation="1">
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
            <th style="width: 88px;"></th>
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
            <td class="text-center">
              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="text"
                @click="openEdit(problem)"
              />
              <v-btn
                icon="mdi-content-copy"
                size="small"
                variant="text"
                @click="openCopy(problem)"
              />
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- 編集ダイアログ -->
    <v-dialog v-model="editDialog" max-width="560">
      <v-card v-if="editForm">
        <v-card-title class="text-h6 pa-4">{{ editDialogTitle }}</v-card-title>
        <v-card-text class="pb-0">
          <v-text-field
            v-if="editMode !== 'edit'"
            v-model="editForm.id"
            label="ID"
            variant="outlined"
            density="compact"
            placeholder="例: MATH101"
          />
          <v-row dense>
            <v-col cols="8">
              <v-text-field
                v-model="editForm.unit"
                label="単元"
                variant="outlined"
                density="compact"
              />
            </v-col>
            <v-col cols="4">
              <v-select
                v-model="editForm.type"
                :items="[{ title: '4択', value: 'choice' }, { title: '記述', value: 'text' }]"
                label="種別"
                variant="outlined"
                density="compact"
              />
            </v-col>
          </v-row>
          <v-textarea
            v-model="editForm.question"
            label="問題文"
            variant="outlined"
            density="compact"
            rows="3"
            auto-grow
          />
          <v-text-field
            v-model="editForm.answer"
            label="正答"
            variant="outlined"
            density="compact"
          />
          <v-textarea
            v-model="editForm.explanation"
            label="解説"
            variant="outlined"
            density="compact"
            rows="3"
            auto-grow
          />
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="editDialog = false">キャンセル</v-btn>
          <v-btn color="primary" variant="elevated" :disabled="!editForm?.question || !editForm?.answer || (editMode !== 'edit' && !editForm?.id)" @click="saveEdit">保存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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

    <v-snackbar v-model="snackbar.show" color="error" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>

  </v-container>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useProblemsStore } from '../stores/problems.js'

const problemsStore = useProblemsStore()

const selectedUnit = ref('all')
const checkedIds = ref(new Set())
const confirmDialog = ref(false)
const editDialog = ref(false)
const editForm = ref(null)
const editMode = ref('edit') // 'edit' | 'new' | 'copy'
const snackbar = reactive({ show: false, message: '' })

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

function openEdit(problem) {
  editMode.value = 'edit'
  editForm.value = {
    unit: problem.unit,
    type: problem.type,
    question: problem.question,
    answer: problem.answer,
    explanation: problem.explanation,
    _id: problem.id,
  }
  editDialog.value = true
}

function openNew() {
  editMode.value = 'new'
  editForm.value = { id: '', unit: '', type: 'text', question: '', answer: '', explanation: '', _id: null }
  editDialog.value = true
}

function openCopy(problem) {
  editMode.value = 'copy'
  editForm.value = {
    id: problem.id + '_copy',
    unit: problem.unit,
    type: problem.type,
    question: problem.question,
    answer: problem.answer,
    explanation: problem.explanation,
    _id: null,
  }
  editDialog.value = true
}

function saveEdit() {
  const { _id, ...data } = editForm.value
  if (editMode.value === 'edit') {
    problemsStore.updateProblem(_id, data)
    editDialog.value = false
  } else {
    const ok = problemsStore.addProblem(data)
    if (!ok) {
      snackbar.message = `ID「${data.id}」はすでに使われています`
      snackbar.show = true
      return
    }
    editDialog.value = false
  }
}

const editDialogTitle = computed(() => {
  if (editMode.value === 'new') return '問題を追加'
  if (editMode.value === 'copy') return '問題をコピー'
  return '問題を編集'
})
</script>
