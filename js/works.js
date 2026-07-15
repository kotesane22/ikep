/* works.js — data/works.json を読み込みギャラリー描画＋カテゴリフィルタ
   使い方（HTML側）:
   <div data-works data-works-limit="3" data-works-filters="false"></div>
   - data-works-limit  : 表示件数の上限（省略で全件）
   - data-works-filters: "true" でカテゴリフィルタUIを表示（省略時 true）
*/
(function () {
  "use strict";

  var mount = document.querySelector("[data-works]");
  if (!mount) return;

  var limit = parseInt(mount.getAttribute("data-works-limit") || "0", 10);
  var showFilters = mount.getAttribute("data-works-filters") !== "false";

  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  fetch("data/works.json", { cache: "no-cache" })
    .then(function (r) {
      if (!r.ok) throw new Error("works.json load failed: " + r.status);
      return r.json();
    })
    .then(function (data) { render(data); })
    .catch(function (err) {
      mount.innerHTML = '<p class="gallery__empty">作品データを読み込めませんでした。</p>';
      if (window.console) console.error(err);
    });

  function render(data) {
    var cats = data.categories || [];
    var catLabel = {};
    cats.forEach(function (c) { catLabel[c.id] = c.label; });

    var items = (data.items || []).slice();
    // 新しい順（date 降順）に並べる。date が無いものは末尾寄り。
    items.sort(function (a, b) { return String(b.date || "").localeCompare(String(a.date || "")); });

    var filtersEl = null;
    var galleryEl = document.createElement("div");
    galleryEl.className = "gallery";

    if (showFilters && cats.length) {
      filtersEl = document.createElement("div");
      filtersEl.className = "filters";
      filtersEl.setAttribute("role", "group");
      filtersEl.setAttribute("aria-label", "カテゴリで絞り込み");

      var all = makeFilter("all", "すべて", true);
      filtersEl.appendChild(all);
      cats.forEach(function (c) { filtersEl.appendChild(makeFilter(c.id, c.label, false)); });

      filtersEl.addEventListener("click", function (e) {
        var btn = e.target.closest(".filter");
        if (!btn) return;
        filtersEl.querySelectorAll(".filter").forEach(function (b) {
          b.setAttribute("aria-pressed", String(b === btn));
        });
        apply(btn.getAttribute("data-cat"));
      });
      mount.appendChild(filtersEl);
    }

    mount.appendChild(galleryEl);
    apply("all");

    function apply(cat) {
      var list = items.filter(function (it) { return cat === "all" || it.category === cat; });
      if (limit > 0) list = list.slice(0, limit);

      if (!list.length) {
        galleryEl.innerHTML = '<p class="gallery__empty">該当する作品がまだありません。</p>';
        return;
      }
      galleryEl.innerHTML = list.map(cardHTML).join("");
    }

    function cardHTML(it) {
      var label = catLabel[it.category] || it.category || "";
      var hasLink = it.url && it.url.length;
      var el = hasLink ? "a" : "div";
      var attr = hasLink ? ' href="' + esc(it.url) + '" target="_blank" rel="noopener"' : "";
      return (
        "<" + el + ' class="work"' + attr + ">" +
          '<div class="work__media">' +
            '<img src="' + esc(it.thumb) + '" alt="' + esc(it.title) + '" loading="lazy" width="600" height="600">' +
            (label ? '<span class="work__cat">' + esc(label) + "</span>" : "") +
          "</div>" +
          '<div class="work__body">' +
            '<h3 class="work__title">' + esc(it.title) + "</h3>" +
            (it.description ? '<p class="work__desc">' + esc(it.description) + "</p>" : "") +
          "</div>" +
        "</" + el + ">"
      );
    }
  }

  function makeFilter(cat, label, pressed) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "filter";
    b.setAttribute("data-cat", cat);
    b.setAttribute("aria-pressed", String(!!pressed));
    b.textContent = label;
    return b;
  }
})();
