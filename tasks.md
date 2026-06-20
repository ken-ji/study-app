# 学習支援アプリ MVP タスク計画

実装フェーズ順に進めること。各タスクは前のフェーズが完了してから着手する。

---

## フェーズ 0: プロジェクトセットアップ

### T-001: Vite + Vue 3 プロジェクト初期化 ✅
- [x] `npm create vite@latest` で Vue 3 プロジェクト作成
- [x] Vuetify インストール・設定（`npm install vuetify`）
- [x] Vue Router インストール・設定（`npm install vue-router`）
- [x] Pinia インストール・設定（`npm install pinia`）
- 完了条件: `npm run dev` でブラウザに初期画面が表示される ✅

### T-002: GitHub Pages 向けビルド設定 ✅
- [x] `vite.config.js` に `base` パスを設定（`/study-app/`）
- [x] Vue Router を `createWebHashHistory` モードに設定
- 完了条件: `npm run build` が成功し、`dist/` が生成される ✅

### T-003: フォルダ構成・基本ファイル作成 ✅
- [x] `src/views/`、`src/components/`、`src/stores/`、`src/utils/` を作成
- [x] `src/router/index.js` に5画面のルーティングを定義
- [x] `App.vue` にナビゲーションバーとルータービューを配置
- 完了条件: 5ルートが定義され、各パスで空の画面が表示される ✅

---

## フェーズ 1: データ層

### T-010: localStorage ユーティリティ ✅
- [x] `studyApp_problems`、`studyApp_history`、`studyApp_stats` の読み書き関数を実装
- [x] `try/catch` で容量不足に対応
- 完了条件: DevTools > Application > localStorage でデータの読み書きが確認できる ✅

### T-011: problems ストア（Pinia） ✅
- [x] `loadFromStorage()` — localStorage から問題データを読み込む
- [x] `importProblems(json)` — 追加インポート・重複排除（ID照合）
- [x] `deleteProblems(ids)` — 選択した問題を削除
- [x] `getByUnit(unit)` — 単元フィルタ
- 完了条件: インポート・削除・フィルタの単体動作確認 ✅

### T-012: stats ストア（Pinia） ✅
- [x] `loadFromStorage()` — 履歴・統計を読み込む
- [x] `recordAnswer(problemId, answer, isCorrect)` — 回答を記録し統計を更新
- [x] `getStatsByProblem(id)` — 問題ごとの統計取得
- [x] `getStatsByUnit(unit)` — 単元ごとの統計集計
- 完了条件: 回答記録後に正答率が正しく計算される ✅

### T-013: session ストア（Pinia） ✅
- [x] `startSession(mode)` — 問題を重み付きランダム抽選してキューを生成（5問 or 10問）
- [x] `submitAnswer(answer)` — 採点・統計記録
- [x] `nextQuestion()` — 次の問題へ進む
- [x] `isFinished` — 全問終了判定
- 完了条件: 5問セッションを通して正常に動作する ✅

---

## フェーズ 2: コアユーティリティ

### T-020: grading.js（採点ロジック） ✅
- [x] `normalize(str)` — 全角→半角変換、前後スペーストリム
- [x] `judge(input, answer)` — 正誤判定
- 完了条件: 全角・半角・スペース混在の入力でも正しく判定される ✅

### T-021: selection.js（重み付きランダム抽選） ✅
- [x] `calcWeight(stats)` — 重み計算（`max(1 - 正答率, 0.1)`、未挑戦は 1.0）
- [x] `selectQuestions(problems, stats, count)` — 重み付きランダム抽選
- 完了条件: 正答率が低い問題が高頻度で選ばれることをテストデータで確認✅

### T-022: distractors.js（誤答自動生成） ✅
- [x] `generateNumeric(answer, count)` — 数値答えに対して誤答3つを生成（近い値）
- [x] `shuffle(choices)` — 選択肢をランダム順に並び替え
- 完了条件: 生成された誤答が正答と重複せず、毎回異なる順で並ぶ ✅

---

## フェーズ 3: 画面実装

### T-030: HomeView（トップ画面） ✅
- [x] 5問 / 10問モード選択ボタン
- [x] インポート済み問題数の表示
- [x] 苦手分析・問題管理ページへのリンク
- 完了条件: モード選択で QuestionView へ遷移できる ✅

### T-031: インポート機能 ✅
- [x] 「JSONファイルを読み込む」ボタンと `<input type="file">` を HomeView に設置
- [x] ファイル読み込み → JSON パース → problems ストアに渡す
- [x] インポート後に「○問追加、○問スキップ（重複）」をスナックバーで表示
- 完了条件: サンプルJSONをインポートして問題数が増える ✅

### T-040: QuestionView（問題画面） ✅
- [x] session ストアから現在の問題を表示
- [x] `type === "choice"` の場合: 4択ボタンを表示（順序ランダム）
- [x] `type === "text"` の場合: テキスト入力フォームを表示
- [x] 回答後に正誤フィードバック・正答・解説を表示
- [x] 「次の問題」ボタンで次へ進み、全問終了後は ResultView へ遷移
- 完了条件: 5問を通して問題→回答→解説→次の問題が正常に動作する ✅

### T-050: ResultView（セッション結果画面）
- [ ] スコア表示（例：「3 / 5 問正解」）
- [ ] 不正解問題の一覧（問題文・正答・解説）
- [ ] 「トップに戻る」ボタン
- 完了条件: セッション終了後に正しいスコアと不正解一覧が表示される

### T-060: AnalysisView（苦手分析画面）
- [ ] 単元ごとの正答率テーブル（単元名・出題数・正解数・正答率）
- [ ] 苦手問題一覧（正答率が低い順）
- 完了条件: 数回演習後に正答率が正しく反映される

### T-070: ManageView（問題管理画面）
- [ ] インポート済み問題を一覧表示（ID・単元・問題文）
- [ ] 単元でフィルタリング（ドロップダウン）
- [ ] チェックボックスで複数選択 → 一括削除ボタン
- [ ] 削除確認ダイアログ（誤操作防止）
- 完了条件: 選択した問題のみ削除され、削除後も残りの問題が正常に動作する

---

## フェーズ 4: 仕上げ・動作確認

### T-080: サンプルデータ作成
- [ ] 数学（中学1〜3年）の問題を20〜30問作成
- [ ] 単元例: 一次方程式・連立方程式・因数分解・平面図形・関数（一次・二次）
- [ ] `choice` と `text` の両 type を含める
- [ ] ファイル名: `sample_questions.json`（リポジトリルートに配置）
- 完了条件: サンプルJSONをインポートして全機能が動作する

### T-090: レスポンシブ対応確認
- [ ] DevTools でスマホ幅（375px）でレイアウトが崩れないことを確認
- [ ] タップ操作で4択ボタンが押しやすいサイズになっていることを確認

### T-091: ブラウザ動作確認
- [ ] Chrome 最新版で動作確認
- [ ] Edge 最新版で動作確認
- [ ] Safari（可能な場合）で動作確認

### T-092: GitHub Pages デプロイ
- [ ] `npm run build` でビルド
- [ ] GitHub リポジトリ作成
- [ ] `gh-pages` ブランチへデプロイ（または GitHub Actions 設定）
- [ ] 公開 URL で全機能動作確認
- 完了条件: 公開 URL でサンプルJSONをインポートして全機能が動作する

---

## タスク開始前チェックリスト

各タスクの実装前に以下を提示してユーザーの承認を得ること:

```
1. タスクの目的
2. 完了条件
3. 変更対象ファイル
4. 処理フロー
5. 手動テスト項目
6. requirements.md との整合性確認
7. architecture.md との整合性確認
```

## タスク完了後の報告項目

```
1. 実装内容サマリ
2. 変更ファイル一覧
3. 手動テスト手順
4. 推奨コミットメッセージ
5. requirements.md との差異有無
6. architecture.md との差異有無
```
