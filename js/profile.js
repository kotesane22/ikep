/* profile.js — data/profile.json を読み込みプロフィールの可変部を描画
   マウント点:
     <ul class="profile__facts" data-profile-facts></ul>
     <div data-profile-body></div>
   見出し・ボタン等の固定要素は index.html 側に残す。 */
(function () {
  "use strict";

  var factsEl = document.querySelector("[data-profile-facts]");
  var bodyEl = document.querySelector("[data-profile-body]");
  if (!factsEl && !bodyEl) return;

  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  // エスケープ後に \n だけを <br> にする（HTML注入は不可）
  var nl2br = function (s) { return esc(s).replace(/\n/g, "<br>"); };

  fetch("data/profile.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error("profile.json " + r.status); return r.json(); })
    .then(render)
    .catch(function (err) { if (window.console) console.error(err); });

  function render(d) {
    if (factsEl) {
      factsEl.innerHTML = (d.facts || []).map(function (f) {
        return '<li class="fact"><span class="fact__k">' + esc(f.k) +
               '</span><span class="fact__v">' + esc(f.v) + "</span></li>";
      }).join("");
    }

    if (bodyEl) {
      var html = "";
      if (d.lead) html += '<p class="profile__lead">' + nl2br(d.lead) + "</p>";
      (d.body || []).forEach(function (p) { html += "<p>" + nl2br(p) + "</p>"; });
      if (d.note) html += '<p class="muted">' + esc(d.note) + "</p>";
      if ((d.creds || []).length) {
        html += '<ul class="creds">' + d.creds.map(function (c) {
          return '<li class="cred"><span class="cred__mark">—</span><span>' +
                 '<span class="cred__t">' + esc(c.t) + "</span> " +
                 '<span class="cred__d">' + esc(c.d) + "</span></span></li>";
        }).join("") + "</ul>";
      }
      bodyEl.innerHTML = html;
    }
  }
})();
