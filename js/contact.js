/* contact.js — data/contact.json を読み込みお問い合わせ導線を描画（外部リンクのみ）
   使い方: <div class="contact__channels" data-contact></div>
   url が空の項目はリンクにせず「準備中」表示。 */
(function () {
  "use strict";

  var mount = document.querySelector("[data-contact]");
  if (!mount) return;

  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  fetch("data/contact.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error("contact.json " + r.status); return r.json(); })
    .then(function (data) { render(data.items || []); })
    .catch(function (err) {
      mount.innerHTML = '<p class="gallery__empty">お問い合わせ先を読み込めませんでした。</p>';
      if (window.console) console.error(err);
    });

  function render(items) {
    if (!items.length) { mount.innerHTML = ""; return; }
    mount.innerHTML = items.map(cardHTML).join("");
  }

  function cardHTML(it) {
    var hasLink = it.url && it.url.length;
    var el = hasLink ? "a" : "div";
    var attr = hasLink
      ? ' href="' + esc(it.url) + '" target="_blank" rel="noopener"'
      : ' aria-disabled="true"';
    var go = hasLink ? "&rarr;" : "準備中";
    var goCls = hasLink ? "channel__go" : "channel__go channel__go--soon";
    return (
      "<" + el + ' class="channel"' + attr + ">" +
        "<span>" +
          '<span class="channel__name">' + esc(it.name) + "</span>" +
          (it.desc ? '<span class="channel__desc">' + esc(it.desc) + "</span>" : "") +
        "</span>" +
        '<span class="' + goCls + '" aria-hidden="true">' + go + "</span>" +
      "</" + el + ">"
    );
  }
})();
