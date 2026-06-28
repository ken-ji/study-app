# CLAUDE.md — 学習支援アプリ 開発ガイド

## 設計資料

実装前に必ず参照すること。設計資料はコードより優先する。

| ファイル | 内容 |
|---------|------|
| [requirements.md](requirements.md) | 機能要件・非機能要件・MVPスコープ定義（**最優先**） |
| [architecture.md](architecture.md) | 画面構成・コンポーネント・データフロー・モジュール依存関係 |
| [tasks.md](tasks.md) | 実装タスク一覧と完了基準 |

---

## プロジェクト概要

中学生向け学習支援 SPA。GitHub Pages で公開、サーバーレス、localStorage でデータ管理。

- **公開先**: GitHub Pages（静的ファイルのみ）
- **エントリポイント**: `src/main.js`
- **データ**: localStorage（`studyApp_` プレフィックス）
- **フレームワーク**: Vue 3 + Vite + Vuetify + Pinia + Vue Router

---

## 開発ルール

### 仕様と実装の同期（最重要）

- **requirements.md を最優先とする**。仕様・アーキテクチャの順に従う
- 実装前に対象タスク ID を確認し、関連する設計資料の箇所を特定してから着手する
- **着手前に必ずユーザーへ確認を取ること**（tasks.md のタスク開始前チェックリストを提示）
- requirements.md にない機能は実装しない。追加したい場合は先に requirements.md を更新して承認を得る
- 仕様の不明点・矛盾を発見した場合は、実装を止めて仕様を先に修正する
- 設計変更（requirements / architecture）はコード変更より先に行う

### 作業進行の原則

- **ユーザーへの事前確認なしに実装を進めない**
- ユーザーへの質問・確認への回答を受け取った場合も、そのまま実装に入らず必ずチェックリストを提示して承認を得ること
- タスクの開始・完了・次のステップへの移行は、必ずユーザーの承認を得てから行う
- 1タスクが完了したら報告を行い、次のタスクへは自動的に進まない
- 複数タスクをまとめて実施しない（1タスク1確認）

### ビルド・ツール

- **Vue 3 + Vite** を使用する
- **Vuetify** を UIコンポーネントライブラリとして使用する
- **Pinia** を状態管理に使用する
- **Vue Router** を使用する（hashモード: `createWebHashHistory`）
- TypeScript は使用しない
- **新規ライブラリを追加する場合は、採用前に確認を取る**

### ファイル・パス

- コンポーネントは `src/components/`、画面は `src/views/` に配置する
- ストアは `src/stores/`、ユーティリティは `src/utils/` に配置する
- ルータは `src/router/index.js` に定義する

### JavaScript

- localStorage への直接アクセスは Pinia ストア内に閉じる（Views から直接書かない）
- ストアは utils に依存しない
- utils は Pure Functions のみ（ストア・localStorage・DOMに触れない）
- グローバル変数を使わない
- `id` の生成は `crypto.randomUUID()` を使う
- 循環依存を作らない（依存方向: `Views → Stores → localStorage`, `Views → Utils`）

### 命名規約

**JavaScript / Vue**
- 関数・変数: camelCase（例: `calcWeight`, `problemStats`）
- 定数: UPPER_SNAKE_CASE（例: `MIN_WEIGHT`, `MAX_CHOICES`）
- コンポーネント: PascalCase（例: `QuestionCard`, `ChoiceButtons`）
- ストア: camelCase のファイル名（例: `problems.js`, `session.js`）

**localStorage キー**
- プレフィックス `studyApp_` を維持する（例: `studyApp_problems`, `studyApp_history`）
- 新しいキーを追加する場合は architecture.md に先に追記する

### データ

- localStorage の読み書きは必ず Pinia ストア経由で行う
- `localStorage.setItem` を ストア外（Views / Utils）で直接書いてはいけない
- localStorage 書き込みは `try/catch` でラップする（容量不足対策）

### コメント

- なぜ書いたか（WHY）が非自明な箇所のみコメントを書く
- WHAT を説明するコメントは書かない
- 将来拡張が見えている箇所には `// TODO(future): <内容>` を残してよい

### エラーハンドリング

- localStorage 書き込みは `try/catch` でラップする
- ユーザー向けエラーは Vuetify の `v-snackbar` で表示する
- `console.error` は残してよいが `console.log` はデバッグ後に削除する

### ブラウザ互換性

- 対応ブラウザ: Chrome 最新 / Edge 最新 / Safari（iOS）
- IE・旧ブラウザは対象外
- ポリフィルは原則追加しない

---

## タスク管理

- 実装を進めたら `tasks.md` の該当チェックボックスを更新する
- フェーズ 0 → フェーズ 4 の順番に実装する（依存関係あり）
- **MVP 期間中は大規模リファクタを行わない**

### タスク開始前の標準プロセス（必須）

各タスクの実装を開始する前に、以下を提示してユーザーの承認を得ること。
**承認が得られるまで実装を開始しない。**

```
1. タスクの目的
2. 完了条件
3. 変更対象ファイル
4. 処理フロー
5. 手動テスト項目
6. requirements.md との整合性確認
7. architecture.md との整合性確認
```

### コミット規約

形式: `T-XXX: <変更内容の要約>`

```
T-001: Vite + Vue 3 + Vuetify プロジェクト初期化
T-020: grading.js の採点ロジックを実装
docs: architecture.md のデータモデルを更新   ← 設計資料のみ変更の場合
```

### ローカルサーバーでのテスト

`npm run dev` で起動し、ブラウザで確認する。

```
URL: http://localhost:5173/
ブラウザ: Chrome または Edge を使用
```

手動テスト手順を提示する際は、上記 URL を使うよう明記すること。

### タスク完了の定義

コードを書いただけでは完了としない。以下を満たして初めて完了とする:

1. `npm run dev` でブラウザを開いて目視確認した
2. スマホ幅（DevTools > 375px）でレイアウトが崩れていない
3. localStorage の読み書きが DevTools > Application で正しく確認できた
4. `tasks.md` のチェックボックスを更新した

### タスク完了後の標準報告（必須）

タスク完了後は以下を必ず報告し、ユーザーのレビューを待つこと。
**報告後は次のタスクへ自動的に進まない。**

```
1. 実装内容サマリ
2. 変更ファイル一覧
3. 手動テスト手順
4. 推奨コミットメッセージ
5. requirements.md との差異有無
6. architecture.md との差異有無
```

### タスク完了後のコミット・Pushフロー（必須）

ユーザーが手動テストで動作確認した後、以下の順序で進めること。

1. **Claude がコミットする** — 推奨コミットメッセージでコミットを作成する
2. **Push コマンドを提示する** — `git push` コマンドをユーザーに提示する
3. **ユーザーが Push する** — Claude は Push を実行しない
4. **Push 結果を確認する** — ユーザーから「Push した」と報告を受けたら `git log --oneline origin/main` と `git status` で確認する
5. **次のタスクへ進む** — Push が確認できたら次のタスクの開始前チェックリストを提示する

---

## MVPスコープ外（実装しないこと）

- AI解説・類題生成
- 全問モード
- 保護者向け画面
- 問題作成アプリ（PDF読み込み→問題生成）
- 忘却曲線対応
- OCR連携
- ユーザー認証・クラウド同期

---

## GitHub 操作ルール

- `git push` は**ユーザーの明示的な指示があった場合のみ**実行する
- 実装完了後に push が必要な場合は「push してよいですか？」と確認を取る
- ユーザーが自分で push する場合は、実行すべきコマンドを提示するにとどめる

以下の**読み取り専用 Git コマンド**は確認不要で随時実行してよい:
- `git status`
- `git log` / `git log --oneline`
- `git diff` / `git diff --stat`

---

## デプロイ手順（要約）

1. `npm run build` でビルド（`dist/` 生成）
2. GitHub リポジトリを作成し `main` ブランチにプッシュ
3. `gh-pages` ブランチへ `dist/` をデプロイ（または GitHub Actions で自動化）
4. Settings > Pages > Source を設定
5. 公開 URL: `https://<username>.github.io/study-app/`

詳細は [architecture.md](architecture.md) の「GitHub Pages デプロイ構成」を参照。
