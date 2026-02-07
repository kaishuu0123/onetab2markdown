# OneTab2Markdown

OneTab の URL の読み込み/書き出しからコピーしたテキストをドメイン別に振り分けて markdown 化するツールです。

## 技術スタック

- **React 18** + **TypeScript**
- **Vite** - 高速ビルドツール
- **psl** - Public Suffix List を使った正確なドメイン抽出
- **Yarn** - パッケージマネージャー
- **Docker** + **Nginx** - プロダクションデプロイ

![Screenshot](screenshot.png)

## 機能

- OneTab形式のテキストをMarkdownリンクに変換
- ドメインごとにグループ化（オン/オフ切り替え可能）
- ワンクリックでクリップボードにコピー

## 開発環境

### Dev Container (推奨)

このプロジェクトはDev Container構成を含んでいます。VS CodeとDockerがインストールされている場合：

1. リポジトリをクローン
2. VS Codeでフォルダを開く
3. 「Dev Containerで再度開く」を選択

Dev Containerには以下が含まれます：
- Node.js LTS
- 必要なVS Code拡張機能
- 自動的な依存関係のインストール

### ローカル開発

### 必要なもの

- Node.js 20以上
- Yarn

### セットアップ

```bash
# 依存関係のインストール
yarn install

# 開発サーバーの起動
yarn dev
```

開発サーバーは http://localhost:3000 で起動します。

### ビルド

```bash
yarn build
```

ビルドされたファイルは `dist` ディレクトリに出力されます。

### Linting

```bash
yarn lint
```

## Docker デプロイ

### Docker Composeを使用

```bash
# イメージのビルドとコンテナの起動
docker-compose up -d

# ログの確認
docker-compose logs -f

# 停止
docker-compose down
```

アプリケーションは http://localhost:8080 でアクセスできます。

### Dockerを直接使用

```bash
# イメージのビルド
docker build -t onetab2markdown .

# コンテナの起動
docker run -d -p 8080:80 --name onetab2markdown onetab2markdown
```

## 使い方

1. OneTabで「URLの読み込み/書き出し」を開く
2. 「すべてのタブとウィンドウを書き出し」をクリック
3. コピーしたテキストを左側のテキストエリアに貼り付け
4. 「ドメインごとにグループ化」のオン/オフを選択
5. 「変換」ボタンをクリック
6. 右側に表示されたMarkdownをコピーして使用

## ライセンス

MIT
