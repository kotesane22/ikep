# ikeP ポートフォリオサイト

静的HTML/CSS/JS（フレームワーク不使用）のポートフォリオサイト。
GitHub Pages公開前提。要件の詳細は [`CLAUDE.md`](./CLAUDE.md)。

デザインは「ikeP通信」踏襲：オフブラック × アンバーゴールド × セリフ
（Noto Serif JP / Playfair Display）。単一ページ構成。

## 構成

```
apps/portfolio/
├── index.html      # 単一ページ（Hero / Statement / Services / Works / Profile / Contact）
├── css/
│   ├── tokens.css  # デザイントークン（色・フォント・余白・角丸・影）※変数のみ
│   └── style.css   # レイアウト / コンポーネント
├── js/
│   ├── main.js     # 共通UI（ナビ開閉・スクロール表示など）
│   ├── works.js    # works.json を読み込みギャラリー描画＋フィルタ
│   └── shop.js     # shop.json を読み込み「販売中」帯を描画
├── data/
│   ├── works.json  # 実績データ（← ここを追記するだけで作品が増える）
│   └── shop.json   # 販売リンク（← ここを追記するだけでリンクが増える）
└── assets/         # favicon / OGP / ポートレート / 作品サムネ
```

## 更新のしかた

- **実績を増やす**: `data/works.json` の `items` に1件追記。
  画像は `assets/works/` に置き、`thumb` にパスを指定。
  `category` は `categories` の `id`（ai-image / copy / content）を使う。
- **販売リンクを増やす**: `data/shop.json` の `items` に1件追記。
  `url` に外部販売ページの直リンクを入れる（空だと「準備中」表示）。
- **色・余白・フォントの調整**: 原則 `css/tokens.css` の変数だけで完結。
  フォントを self-host 化する場合は `index.html` の fonts ブロック1か所を差し替え。

## ローカル確認

`fetch` でJSONを読むため `file://` 直開きでは動きません。簡易サーバー経由で。

```bash
cd apps/portfolio
python3 -m http.server 8000
# → http://localhost:8000/
```

## 公開（GitHub Pages・独立リポジトリ）

このサイトは独立リポジトリ `kotesane22/ikep` のルートに配置して公開する。
`apps/portfolio/` の中身がそのまま `ikep` リポジトリのルートになる。

- 公開URL: `https://kotesane22.github.io/ikep/`
- Pages 設定: Settings → Pages → Source =「Deploy from a branch」→ `main` / `/ (root)`

ビルド不要（純静的）。作品・販売リンクは JSON 追記のみで更新できる。

## 公開前チェック

- [ ] `data/works.json` を実データに差し替え、`assets/works/` に画像配置
- [ ] `data/shop.json` の各 `url`（ファミマ／LINE）を設定
- [ ] Contact の各チャネル（ココナラ／クラウドワークス／X／note／メール）のURLを設定
- [ ] プロフィール本文・実績を確定、`assets/portrait.svg` を実写/実イラストに差し替え
- [ ] `assets/ogp.png` を確定ビジュアルに差し替え（編集元は `assets/ogp.svg`）
