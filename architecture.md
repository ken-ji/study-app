# 学習支援アプリ アーキテクチャ設計書

## 1. システム全体構成

```
┌─────────────────────────────────────────────────────┐
│                  ブラウザ（SPA）                      │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │           Vue 3 + Vite + Vuetify             │   │
│  │                                              │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  │   │
│  │  │  Views   │→ │ Pinia    │→ │localStorage│  │   │
│  │  │ (5画面)  │  │ Stores   │  │  (3キー)  │  │   │
│  │  └──────────┘  └──────────┘  └──────────┘  │   │
│  │       ↓                                      │   │
│  │  ┌──────────┐                                │   │
│  │  │  Utils   │                                │   │
│  │  │ (3モジュール) │                            │   │
│  │  └──────────┘                                │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  Vue Router（クライアントサイドルーティング）   │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
         ↑
    ユーザーがJSONファイルをアップロード
    （問題データはリポジトリに含まない）
```

**デプロイ先:** GitHub Pages（静的ファイルのみ）  
**バックエンド:** なし  
**データ永続化:** localStorage のみ

---

## 2. 画面遷移図

```
┌──────────────┐
│  HomeView    │  /
│  トップ画面   │
│              │
│ [5問モード]  │──────────────────────────────┐
│ [10問モード] │──────────────────────────────┤
│ [苦手分析]   │──→ AnalysisView (/analysis)  │
│ [問題管理]   │──→ ManageView (/manage)      │
└──────────────┘                              │
                                              ↓
                               ┌──────────────────────┐
                               │   QuestionView        │  /question
                               │   問題画面             │
                               │                       │
                               │ 問題表示               │
                               │ → 回答（text or 4択）  │
                               │ → 採点結果・解説       │
                               │ → [次の問題]           │
                               │ （n問繰り返す）        │
                               └──────────┬────────────┘
                                          │ 全問終了
                                          ↓
                               ┌──────────────────────┐
                               │   ResultView          │  /result
                               │   セッション結果画面  │
                               │                       │
                               │ スコア表示             │
                               │ 不正解問題の解説一覧  │
                               │ [トップに戻る]         │
                               └──────────┬────────────┘
                                          │
                                          ↓
                               HomeView へ戻る
```

---

## 3. コンポーネント構成

```
App.vue
├── v-app-bar（ナビゲーションバー）
│   └── 各画面へのリンク
└── <router-view>
    ├── HomeView.vue（/）
    │   └── ImportButton.vue（JSONインポートUI）
    │
    ├── QuestionView.vue（/question）
    │   ├── QuestionCard.vue（問題文表示）
    │   ├── ChoiceButtons.vue（4択UI）
    │   ├── TextAnswerInput.vue（テキスト入力UI）
    │   └── ResultOverlay.vue（採点結果・解説表示）
    │
    ├── ResultView.vue（/result）
    │   └── ScoreSummary.vue（スコア・不正解一覧）
    │
    ├── AnalysisView.vue（/analysis）
    │   ├── UnitStatsTable.vue（単元別正答率）
    │   └── WeakProblemList.vue（苦手問題一覧）
    │
    └── ManageView.vue（/manage）
        └── ProblemListTable.vue（問題一覧・削除）
```

---

## 4. Pinia ストア構成

```
stores/
├── problems.js      問題データ管理
│   - state: problems[]
│   - actions: loadFromStorage(), importProblems(json), addProblem(data), deleteProblems(ids), updateProblem(id, data)
│   - getters: getByUnit(unit)
│
├── session.js       演習セッション管理
│   - state: queue[], currentIndex, answers[]
│   - actions: startSession(mode), submitAnswer(answer), nextQuestion()
│   - getters: currentQuestion, isFinished, score
│
└── stats.js         統計・履歴管理
    - state: history[], problemStats{}
    - actions: recordAnswer(problemId, answer, isCorrect), loadFromStorage()
    - getters: getStatsByProblem(id), getStatsByUnit(unit), getWeight(id)
```

---

## 5. ユーティリティモジュール

```
utils/
├── grading.js       採点ロジック
│   - normalize(str)        全角→半角変換・スペーストリム
│   - judge(input, answer)  正誤判定
│
├── selection.js     重み付きランダム抽選
│   - calcWeight(stats)     重み計算（max(1 - 正答率, 0.1)）
│   - selectQuestions(problems, stats, count)  抽選
│
└── distractors.js   誤答自動生成（4択用）
    - generate(answer, count)  数値答えの誤答3つを生成
    - shuffle(choices)         選択肢をランダム順に並び替え
```

---

## 6. localStorage データ設計

| キー | 型 | 内容 |
|------|----|------|
| `studyApp_problems` | `Problem[]` | インポート済み問題データ |
| `studyApp_history` | `HistoryEntry[]` | 学習履歴 |
| `studyApp_stats` | `Record<id, Stats>` | 問題ごとの統計 |

### Problem
```js
{
  id: "MATH001",          // string（一意）
  subject: "math",        // string
  grade: 2,               // number（学年）
  unit: "一次方程式",      // string
  tags: ["移項"],         // string[]
  difficulty: 2,          // number（1〜5）
  type: "choice",         // "choice" | "text"
  question: "2x+3=9",     // string
  answer: "3",            // string
  explanation: "..."      // string
}
```

### HistoryEntry
```js
{
  problemId: "MATH001",
  answer: "3",
  isCorrect: true,
  answeredAt: "2026-06-20T10:00:00Z"
}
```

### Stats
```js
{
  attemptCount: 5,
  correctCount: 4
}
```

---

## 7. モジュール依存関係

```
Views
  └→ Pinia Stores
       └→ localStorage（直接アクセス）
  └→ Utils（grading / selection / distractors）
       └→ 依存なし（Pure Functions）

Vue Router
  └→ Views

※ Stores は Utils に依存しない
※ Utils は Stores / localStorage に依存しない
※ 循環依存を作らない
```

---

## 8. ルーティング設計

| パス | コンポーネント | 説明 |
|------|-------------|------|
| `/` | HomeView | トップ・モード選択 |
| `/question` | QuestionView | 問題演習 |
| `/result` | ResultView | セッション結果 |
| `/analysis` | AnalysisView | 苦手分析 |
| `/manage` | ManageView | 問題管理 |

**注意:** GitHub Pages はサブパスで動作するため、Vue Router は `hash` モード (`createWebHashHistory`) を使用する。

---

## 9. GitHub Pages デプロイ構成

```
リポジトリ
└── dist/（npm run build の出力）
    ├── index.html
    ├── assets/
    └── ...

GitHub Pages 設定:
  Source: main ブランチ / docs フォルダ または gh-pages ブランチ

vite.config.js:
  base: '/study-app/'  ← リポジトリ名に合わせて変更
```

デプロイ手順:
1. `npm run build` でビルド
2. `dist/` の内容を `gh-pages` ブランチにプッシュ（または GitHub Actions で自動化）
3. Settings > Pages > Source を設定
