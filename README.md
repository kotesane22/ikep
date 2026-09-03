# ikeP ポートフォリオサイト

静的HTML/CSS/JS（フレームワーク不使用）のポートフォリオサイト。
GitHub Pages公開前提。

- **要件・デザイン方針の正本** → [`CLAUDE.md`](./CLAUDE.md)（現行 v3.0）
- **設計原理の調査ノート** → [`RESEARCH.md`](./RESEARCH.md)
- **UI仕上げ用の引き継ぎ** → [`HANDOFF.md`](./HANDOFF.md)
- **運用（目標・タスク・承認）** → [`noah/START_HERE.md`](./noah/START_HERE.md)

このREADMEは「**更新のしかた**」の正本。設計思想は `CLAUDE.md` を見ること。

デザインは「ikeP通信」踏襲：**温かいアイボリーの紙 × エスプレッソの墨 × 真鍮の一点**
（Fraunces / しっぽり明朝 / Noto Sans JP）。単一ページ構成。

## 構成

```
ikep/                # ＝ このリポジトリのルート
├── index.html      # 単一ページ（Hero / Statement / Services / Works / Profile / Contact）
├── css/
│   ├── tokens.css  # デザイントークン（色・フォント・余白・角丸・影）※変数のみ
│   └── style.css   # レイアウト / コンポーネント
├── js/
│   ├── main.js     # 共通UI（ナビ開閉・スクロール表示など）
│   ├── works.js    # works.json を読み込みギャラリー描画＋フィルタ
│   ├── shop.js     # shop.json を読み込み「販売中」帯を描画
│   ├── profile.js  # profile.json を読み込みプロフィールを描画
│   └── contact.js  # contact.json を読み込み問い合わせ導線を描画
├── data/
│   ├── works.json   # 実績データ（← ここを追記するだけで作品が増える）
│   ├── shop.json    # 販売リンク（← ここを追記するだけでリンクが増える）
│   ├── profile.json # プロフィール本文・項目表・実績
│   ├── contact.json # 問い合わせ導線（ココナラ/クラウドワークス/X/note/メール）
│   └── habits.json  # 連載「今日の30秒」（日付で自動的に入れ替わる）
└── assets/         # favicon / OGP / ポートレート / 作品サムネ
```

**HTMLを触らずに中身を更新できる**のがこの構成の要点。文章・リンク・作品はすべて
`data/*.json` にあり、見た目は `css/tokens.css` の変数にある。

## 更新のしかた

- **実績を増やす**: `data/works.json` の `items` に1件追記。
  画像は `assets/works/` に置き、`thumb` にパスを指定（`.jpg`/`.webp` 可）。
  `category` は `categories` の `id`（ai-image / copy / content）、
  `size` に `lg`/`wide`/`tall` を入れると誌面のサイズ差がつく。
- **販売リンクを増やす**: `data/shop.json` の `items` に1件追記。
  `url` に外部販売ページの直リンクを入れる（空だと「準備中」表示）。
- **問い合わせ先のURLを設定**: `data/contact.json` の各 `url` を埋める。
  空のままだとリンクにならず「準備中」と表示されるので、URLが決まった分だけ順次でよい。
- **プロフィールを書き換える**: `data/profile.json` の
  `facts`（項目表）/ `lead`（導入・`\n` で改行）/ `body`（本文の段落配列）/
  `note`（補足・不要なら空に）/ `creds`（実績）を編集。
- **連載「今日の30秒」を増やす**: `data/habits.json` の `items` に1件追記。
  `title`（見出し）/ `body`（本文・`\n` で改行）/ `steps`（任意の手順・不要なら `[]`）/
  `tag`（任意のラベル）。
  **書けば書くほど周期が伸びる**（3件なら3日で一巡、30件なら30日で一巡）。
  日替わりは端末のローカル日付で決まるため、同じ日に何度開いても同じ回が出る。
- **写真を差し替える**: `assets/portrait.svg` を実写真に置き換え
  （`portrait.jpg` 等にする場合は `index.html` 内の2箇所の `src` を変更）。
- **色・余白・フォントの調整**: 原則 `css/tokens.css` の変数だけで完結。
  フォントを self-host 化する場合は `index.html` の fonts ブロック1か所を差し替え。

## ローカル確認

`fetch` でJSONを読むため `file://` 直開きでは動きません。簡易サーバー経由で。

```bash
cd <このリポジトリのルート>
python3 -m http.server 8000
# → http://localhost:8000/
```

## 公開（GitHub Pages）

このリポジトリ `kotesane22/ikep` の**ルートがそのまま公開対象**。ビルド不要（純静的）。

- 公開URL: `https://kotesane22.github.io/ikep/`
- Pages 設定: Settings → Pages → Source =「Deploy from a branch」→ `main` / `/ (root)`
- **Pages の有効化は手動操作が必要**（自動化ワークフローは権限不足のためコミット
  `5a0f422` で撤去済み）

> 🔒 **`main` へのマージ ＝ 公開は、いけPの承認が必要。**
> AIエージェントは作業ブランチまで。詳細は [`noah/APPROVALS.md`](./noah/APPROVALS.md)。

## 公開前チェック

- [ ] `data/works.json` を実データに差し替え、`assets/works/` に画像配置
- [ ] `data/shop.json` の各 `url`（ファミマ／LINE）を設定
- [ ] Contact の各チャネル（ココナラ／クラウドワークス／X／note／メール）のURLを設定
- [ ] プロフィール本文・実績を確定、`assets/portrait.svg` を実写/実イラストに差し替え
- [ ] `assets/ogp.png` を確定ビジュアルに差し替え（編集元は `assets/ogp.svg`）
