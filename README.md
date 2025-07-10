# MeetzUp

MeetzUpは、グループでの予定調整を簡単に行えるWebアプリケーション。カレンダーのグリッド上で塗り潰すように予定を選択でき、参加可能な人数が多い時間帯ほど色が濃く表示される。

## 主な機能

- **イベント作成**: 匿名でもログインした状態でもイベントを作成可能
- **直感的な予定入力**: マウスでドラッグして塗り潰すように参加可能・不可能を選択
- **視覚的な集計表示**: 参加可能人数が多い時間帯ほど色が濃く表示
- **柔軟な権限設定**: 参加者の制限やメールアドレスの公開範囲を設定可能
- **多言語対応**: 日本語・英語に対応（自動判別＋手動切り替え）

## 既知の問題

### ブラウザ拡張機能によるハイドレーションエラー

DarkReaderなどのブラウザ拡張機能がインストールされている場合、ハイドレーションエラーが発生することがある。これはブラウザ拡張機能がページのスタイルを動的に変更するためで、開発時は拡張機能を無効化することを推奨する。

## 技術スタック

- **フロントエンド**: Next.js 15, React 19, TypeScript
- **バックエンド**: Next.js Server Actions
- **データベース**: PostgreSQL (本番), SQLite (開発)
- **ORM**: Prisma (サーバーレス対応)
- **認証**: Auth0
- **状態管理・エラーハンドリング**: Effect.ts
- **国際化**: next-i18n
- **テスト**: Vitest, Storybook
- **スタイリング**: CSS Modules

## 開発環境のセットアップ

### 必要な環境

- Node.js 20以上
- npm 10以上

### インストール

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

### 環境変数

`.env.local`ファイルを作成し、以下の環境変数を設定:

```env
# Auth0
AUTH0_SECRET=
AUTH0_BASE_URL=
AUTH0_ISSUER_BASE_URL=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=

# Database
DATABASE_URL=
```

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start

# Lint実行
npm run lint

# Lint自動修正
npm run lint-fix

# 型チェック
npm run typecheck

# テスト実行
npm run test

# カバレッジ測定
npm run coverage
```

## アーキテクチャ

### ディレクトリ構成

```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/          # 言語別ルート
│   ├── api/               # API Routes
│   └── layout.tsx         # ルートレイアウト
├── components/            # Reactコンポーネント
│   ├── calendar/         # カレンダー関連
│   ├── event/           # イベント関連
│   └── ui/              # 共通UIコンポーネント
├── lib/                   # ライブラリ・ユーティリティ
│   ├── auth/            # 認証関連
│   ├── db/              # データベース関連
│   └── effects/         # Effect.ts関連
├── hooks/                # カスタムフック
├── types/                # 型定義
└── locales/             # 翻訳ファイル
```

### データモデル

- **Event**: イベント情報（名前、期間、設定など）
- **User**: ユーザー情報（Auth0連携）
- **Schedule**: 個別の予定情報
- **Availability**: 参加可能な時間帯

## 開発ガイドライン

- Effect.tsを活用した関数型プログラミング
- イミュータブルなデータ操作
- テスト駆動開発（TDD）
- Storybookでのコンポーネント開発
- 型安全性の確保（anyやasの使用禁止）

## ライセンス

MIT License

## 貢献

貢献方法については[CONTRIBUTING.md](CONTRIBUTING.md)を参照。
