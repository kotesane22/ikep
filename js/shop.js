/* shop.js — data/shop.json を読み込み「販売中」リンク帯を描画（外部リンクのみ） */
(function () {
  "use strict";

  var mount = document.querySelector("[data-shop]");
  if (!mount) return;

  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  fetch("data/shop.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error("shop.json " + r.status); return r.json(); })
    .then(function (data) { render(data.items || []); })
    .catch(function (err) { mount.innerHTML = ""; if (window.console) console.error(err); });

  function render(items) {
    if (!items.length) { mount.innerHTML = ""; return; }
    mount.innerHTML = items.map(function (it) {
      var hasLink = it.url && it.url.length;
      var el = hasLink ? "a" : "span";
      var attr = hasLink ? ' href="' + esc(it.url) + '" target="_blank" rel="noopener"' : ' aria-disabled="true"';
      return "<" + el + ' class="sell"' + attr + ">" + esc(it.name) + (hasLink ? "" : "（準備中）") + "</" + el + ">";
    }).join("");
  }
})();
