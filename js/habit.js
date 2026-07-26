/* habit.js — data/habits.json を読み込み、連載「今日の30秒」を1件描画
   使い方: <div data-habit></div>

   日替わりの仕組み：端末のローカル日付から通日を出し、件数で割った余りを添字にする。
   乱数も保存も使わないので「同じ日は何度開いても同じ／日付が変わると次の回」になる。 */
(function () {
  "use strict";

  var mount = document.querySelector("[data-habit]");
  if (!mount) return;

  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  // エスケープ後に \n だけを <br> にする（HTML注入は不可）
  var nl2br = function (s) { return esc(s).replace(/\n/g, "<br>"); };

  // ローカル日付の通日（タイムゾーンのズレで前後しないよう 0時基準で算出）
  function dayNumber(d) {
    return Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 86400000);
  }

  fetch("data/habits.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error("habits.json " + r.status); return r.json(); })
    .then(function (data) { render(data.items || []); })
    .catch(function (err) {
      mount.innerHTML = "";
      if (window.console) console.error(err);
    });

  function render(items) {
    if (!items.length) { mount.innerHTML = ""; return; }

    var now = new Date();
    var idx = ((dayNumber(now) % items.length) + items.length) % items.length; // 常に正
    var it = items[idx];

    var steps = (it.steps || []).filter(function (s) { return s && String(s).trim(); });
    var stepsHTML = steps.length
      ? '<ol class="habit__steps">' + steps.map(function (s) {
          return "<li>" + esc(s) + "</li>";
        }).join("") + "</ol>"
      : "";

    mount.innerHTML =
      '<article class="habit">' +
        '<div class="habit__meta">' +
          '<span class="habit__no">第' + (idx + 1) + "回</span>" +
          '<span class="habit__date">' + (now.getMonth() + 1) + "月" + now.getDate() + "日</span>" +
          (it.tag ? '<span class="habit__tag">' + esc(it.tag) + "</span>" : "") +
        "</div>" +
        '<h3 class="habit__title">' + esc(it.title) + "</h3>" +
        (it.body ? '<p class="habit__body">' + nl2br(it.body) + "</p>" : "") +
        stepsHTML +
      "</article>";
  }
})();
