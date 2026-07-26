# ハンドオフ資料 — ikeP ポートフォリオ（Codex 仕上げ用）

このドキュメントは、別ツール（Codex 等）でUIの最終仕上げをするための引き継ぎ資料。
**土台の設計意図を壊さずに磨く**ためのガイド。まず本書を読んでから着手すること。

---

## 0. これは何か / コンセプト
- ikeP（長野・小諸のフリーランス。AI×コミュニケーション制作／コピー／AI画像生成）の
  ポートフォリオ。**単一ページ**の静的サイト。
- コンセプト：ポートフォリオを *上質な季刊誌「ikeP通信」* として見せる。
  世界観は **ラグジュアリー × 温かい × 洗練**。
- 章立て（和文）：**表紙 / 序 / 仕事 / 作品集 / 人 / 便り**。
- 詳しい設計原理は [`RESEARCH.md`](./RESEARCH.md) を参照。

## 1. アーキテクチャ（触るファイル）
```
index.html        単一ページ本体（セマンティックHTML）
css/tokens.css    ★見た目の“唯一のレバー”：色/フォント/余白/角丸/影/モーションの変数
css/style.css     レイアウト/コンポーネント（値は極力 tokens 参照）
js/main.js        ナビ開閉・スクロール表示(reveal)・年号。冒頭で html に .has-js を付与
js/works.js       data/works.json を読み、作品ギャラリー＋フィルタを描画
js/shop.js        data/shop.json を読み、「販売中」帯を描画
js/profile.js     data/profile.json を読み、プロフィール（項目表・本文・実績）を描画
js/contact.js     data/contact.json を読み、問い合わせ導線を描画
data/works.json   作品データ（追記だけで増える）
data/shop.json    販売リンク
data/profile.json プロフィール本文・項目表・実績
data/contact.json 問い合わせ導線（url が空なら「準備中」表示でリンクにしない）
js/habit.js       data/habits.json を読み、連載「今日の30秒」を日付で1件選んで描画
data/habits.json  連載データ（追記だけで増える）
assets/           favicon / ogp(png+svg) / portrait / works/ サムネ(SVG)
```

**重要**：文言・リンク・作品は**すべて `data/*.json` 側にある**。
`index.html` にはマウント点（`[data-works]` / `[data-shop]` /
`[data-profile-facts]` / `[data-profile-body]` / `[data-contact]`）と、
見出し・レイアウトなどの固定要素だけが残っている。
**テキストを直すときは HTML ではなく JSON を編集すること。**
描画は4つのJSが同じパターン（fetch → items を map → innerHTML、エスケープ必須）。
- **ビルド不要**。ローカルは `python3 -m http.server` 経由で（`file://` 直開きは fetch が失敗）。

## 2. デザイントークン（`css/tokens.css`）— 見た目はここで変える
- 色：`--c-paper*`（アイボリー紙）/ `--c-ink*`（墨・見出し・補足）/ `--c-brass*`（真鍮の差し色）/ `--c-line*`（極細罫）
- 文字：`--ff-display`(Fraunces) / `--ff-mincho`(しっぽり明朝) / `--ff-sans`(Noto Sans JP) と `--fs-*` サイズ、`--lh-*`、`--ls-*`
- 余白：`--sp-1..10`、`--gutter`、`--w-max`、`--w-text`
- 角丸/影/動き：`--r-*` / `--sh-*` / `--ease` / `--dur`
- **原則：色・余白・フォントの調整は tokens の変更だけで完結させる**（レイアウトを壊さない）。

## 3. コンテンツモデル
### data/works.json
```jsonc
{
  "categories": [{ "id": "ai-image", "label": "AI画像" }, ...],
  "items": [{
    "id": "…", "title": "…", "category": "ai-image|copy|content",
    "size": "lg|wide|tall",         // 省略で通常。誌面のサイズ差用
    "thumb": "assets/works/xxx.svg", // 実画像に差し替え可（jpg/webp可）
    "description": "…", "url": "", "date": "2026-06"
  }]
}
```
- 作品を増やす＝`items` に1件追記するだけ。`date` 降順で自動整列。
### data/shop.json
- `items[].name` と `url`（空だと「準備中」表示）。

### data/contact.json
```jsonc
{ "items": [ { "id":"coconala", "name":"ココナラ", "desc":"スキル出品・お仕事のご依頼", "url":"" } ] }
```
- `url` が空 → `<div class="channel" aria-disabled="true">` ＋「準備中」（リンクにしない）
- `url` あり → `<a class="channel" target="_blank" rel="noopener">` ＋ 矢印

### data/habits.json（連載「今日の30秒」）
```jsonc
{ "items": [ { "id":"h001", "title":"見出し", "body":"本文（\\n で改行）",
               "steps":["任意の手順"], "tag":"任意のラベル" } ] }
```
- **日替わりの仕組み**：ローカル日付の通日 % 件数 で1件を選ぶ（`js/habit.js`）。
  乱数・保存を使わないので「同じ日は同じ／翌日は次の回／一巡したら先頭へ」。
  この決定性を壊さないこと（`Math.random()` や `localStorage` を持ち込まない）。
- 1件でも動く。`steps` が空なら `<ol>` ごと出ない。

### data/profile.json
- `facts[]`（`k`/`v` の項目表）、`lead`（`\n` が `<br>` になる）、
  `body[]`（段落）、`note`（補足・小さい文字）、`creds[]`（`t`/`d`）。
- いずれもエスケープ済みで描画されるため、値にHTMLタグを書いても効かない（仕様）。

## 4. フォント
- Google Fonts を `index.html` の1ブロックで読み込み（Fraunces / Shippori Mincho / Noto Sans JP）。
- self-host 化する場合は**その1ブロックだけ**差し替えれば良い構造。

## 5. 仕上げてほしいこと（Codexへのタスク候補）
UIをさらに“綺麗”にするための、土台を壊さない磨き込みポイント：
1. **実写真の導入トリートメント**：ポートレート/作品を実画像に差し替える際の
   比率統一・トーン合わせ・`object-position`・軽いフィルタ（`saturate`は既に0.96）。
2. **作品ホバー/画像ズーム**：上品な範囲で（現状 scale 1.035）。過度な動きは避ける。
3. **タイポの詰め**：和文見出しの `line-height`/`letter-spacing`、Fraunces の opsz 活用、
   数字の lining/oldstyle 切替。`text-wrap: balance/pretty` は導入済み。
4. **余白リズムの最終調整**：章ラベル周り・セクション間・作品グリッドの gap。
5. **フォント表示**：FOUT/CLS 対策（`font-display`、必要なら preload）。
6. **画像最適化**：実画像時は WebP＋`loading="lazy"`（属性は既に付与）。
7. **アクセシビリティ**：コントラスト・フォーカス可視・alt の実文言。
8. **（任意）作品詳細/ケーススタディ**：`work.url` を内部詳細ページに拡張する余地。

## 6. ガードレール（絶対に壊さない/やらない）
- 静的 HTML/CSS/JS を維持（フレームワーク不使用、GitHub Pages 前提）。
- 色/余白/フォントは原則 `tokens.css` の変数経由で変更（直書きを増やさない）。
- **禁止**：紫グラデ、絵文字装飾、無意味な英語見出しの乱発、
  「羅針盤/設計図」等のテンプレ比喩、全セクション均一密度。
- 世界観は **ラグジュアリー×温かい×洗練**、**スマホ最優先**を外さない。
- `.reveal` は `.has-js` ガード付き（JS無効でも内容が見える）。この安全機構を壊さない。
- 横スクロール0を維持（375px で `document.scrollWidth === innerWidth` を確認）。

## 7. 動作確認
```bash
cd apps/portfolio && python3 -m http.server 8000
# → http://localhost:8000/
```

## 8. 公開
- 公開先リポジトリ：`kotesane22/ikep`（このディレクトリの中身がルート）。
- 公開URL：`https://kotesane22.github.io/ikep/`
- Pages 有効化：Settings → Pages → Source「Deploy from a branch」→ `main` / `/(root)`。
- 開発元は `goodbetter-ai-lab` の `apps/portfolio/`。更新後に `ikep` へ反映する運用。

---

## 9. そのまま貼れる Codex 用プロンプト

> あなたはシニアのUIエンジニア兼アートディレクターです。この静的サイト（`index.html` +
> `css/tokens.css` + `css/style.css` + `js/*` + `data/*.json`）を、**設計思想を壊さずに**
> UI面で最終仕上げしてください。世界観は「ラグジュアリー×温かい×洗練」、コンセプトは
> ポートフォリオを上質な季刊誌『ikeP通信』として見せること。スマホ最優先。
>
> 制約：
> - 静的HTML/CSS/JSのまま（フレームワーク不使用、GitHub Pages前提）。
> - 見た目の変更は原則 `css/tokens.css` のCSS変数で行い、直書きの色/余白を増やさない。
> - 文言・リンク・作品は `data/*.json` にある。**HTMLにテキストを書き戻さないこと**
>   （`index.html` のマウント点 `[data-works]` `[data-shop]` `[data-profile-facts]`
>   `[data-profile-body]` `[data-contact]` を削除・改名しない）。JS描画側は必ずエスケープを維持。
> - 禁止：紫グラデ、絵文字装飾、無意味な英語見出しの乱発、「羅針盤/設計図」等の
>   テンプレ比喩、全セクション均一密度。
> - `.reveal` の `.has-js` ガード（JS無効時に内容が見える機構）を壊さない。
> - 375px幅で横スクロールが出ない（`scrollWidth === innerWidth`）ことを維持。
>
> やってほしい磨き込み（優先度順）：
> 1. タイポグラフィの微調整（和文見出しの行間・字間、Fraunces opsz、数字表現）。
> 2. 余白リズムの最終調整（章ラベル周り・セクション間・作品グリッド）。
> 3. 作品ギャラリーの上品なホバー/画像トリートメント（過度な演出は不可）。
> 4. フォント表示のCLS/FOUT対策、アクセシビリティ（コントラスト・フォーカス・alt）。
> 5. 実写真差し替えを想定した画像トリートメント（比率・トーン・object-position）。
>
> 変更は差分を小さく、各コンポーネント単位で。CSS変数を新設する場合は `tokens.css` に
> 追記し、意味の分かる命名にすること。最後に、変更点と“なぜ”を箇条書きで説明してください。
