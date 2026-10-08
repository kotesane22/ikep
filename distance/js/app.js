/* =========================================================
   レジ待ち距離感診断 — 画面遷移・描画・判定
   文言と配点は data.js。ここは処理だけ。
   ========================================================= */
(function () {
  "use strict";

  var D = window.DIAG;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var SVGNS = "http://www.w3.org/2000/svg";
  var TOTAL_STEPS = 2 + D.questions.length;

  var state = { stand: 80, tolerance: 80, qi: 0, answers: [] };
  var friend = readFriend();

  /* ---------- storage（使えない環境でも動くように） ---------- */
  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, val);
    } catch (e) { return null; }
  }

  /* ---------- 共有リンクから届いた相手の結果 ---------- */
  function readFriend() {
    var p = new URLSearchParams(location.search);
    var s = parseInt(p.get("s"), 10), r = parseInt(p.get("r"), 10), t = p.get("t");
    var ok = function (v) { return v >= 20 && v <= 200; };
    if (!ok(s) || !ok(r) || !/^[A-E]$/.test(t || "")) return null;
    var n = (p.get("n") || "").trim().slice(0, 12) || "相手";
    return { n: n, s: s, r: r, t: t };
  }

  /* ---------- 距離帯 ---------- */
  function zoneOf(cm) {
    for (var i = 0; i < D.zones.length; i++) if (cm < D.zones[i].max) return D.zones[i];
    return D.zones[D.zones.length - 1];
  }

  /* ---------- SVG ---------- */
  function el(name, attrs, text) {
    var n = document.createElementNS(SVGNS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    return n;
  }

  var FLOOR = 140, HALF = 12;

  function person(g, x, isYou, label) {
    var cls = isYou ? "fig fig-you" : "fig";
    var grp = el("g", { "class": cls, transform: "translate(" + x + " 0)" });
    if (isYou) {
      // イケピー：触角つきの丸い頭
      grp.appendChild(el("path", { "class": "antenna", d: "M-5 52 L-9 40 M5 52 L10 41", fill: "none" }));
      grp.appendChild(el("circle", { cx: -9, cy: 38, r: 3.5 }));
      grp.appendChild(el("circle", { cx: 10, cy: 39, r: 3.5 }));
      grp.appendChild(el("circle", { cx: 0, cy: 62, r: 13 }));
    } else {
      grp.appendChild(el("circle", { cx: 0, cy: 62, r: 10 }));
    }
    grp.appendChild(el("path", { d: "M-12 " + FLOOR + " V86 Q-12 76 -2 76 H2 Q12 76 12 86 V" + FLOOR + " Z" }));
    grp.appendChild(el("text", { x: 0, y: FLOOR + 15, "class": "fig-label", "text-anchor": "middle" }, label));
    g.appendChild(grp);
  }

  function measure(g, x1, x2, y, cm, below) {
    var warn = cm < 45;
    var grp = el("g", { "class": warn ? "measure is-warn" : "measure" });
    grp.appendChild(el("line", { x1: x1, x2: x2, y1: y, y2: y }));
    grp.appendChild(el("line", { x1: x1, x2: x1, y1: y - 4, y2: y + 4 }));
    grp.appendChild(el("line", { x1: x2, x2: x2, y1: y - 4, y2: y + 4 }));
    grp.appendChild(el("text", { x: (x1 + x2) / 2, y: below ? y + 16 : y - 8, "text-anchor": "middle" }, cm + "cm"));
    g.appendChild(grp);
  }

  function register(g) {
    var grp = el("g", { "class": "register" });
    grp.appendChild(el("rect", { x: 6, y: 92, width: 40, height: FLOOR - 92 }));
    grp.appendChild(el("rect", { x: 14, y: 76, width: 22, height: 14, rx: 2 }));
    grp.appendChild(el("text", { x: 26, y: FLOOR + 15, "text-anchor": "middle", "class": "fig-label" }, "レジ"));
    g.appendChild(grp);
  }

  function base(svg, w) {
    svg.textContent = "";
    svg.appendChild(el("line", { x1: 0, x2: w, y1: FLOOR, y2: FLOOR, "class": "floor" }));
    register(svg);
  }

  // 前の人 → 後ろの人 の2人。zoneは前の人の背中から測る
  function drawPair(svg, cm, youIsBack) {
    var k = 1.3, xF = 84, xB = xF + HALF * 2 + cm * k, edge = xF + HALF;
    base(svg, 400);
    var bands = [[0, 45, "z1", "密接"], [45, 120, "z2", "個体"], [120, 400, "z3", "社会"]];
    bands.forEach(function (b) {
      var x1 = edge + b[0] * k, x2 = Math.min(400, edge + b[1] * k);
      if (x1 >= 400) return;
      svg.insertBefore(el("rect", { x: x1, y: 30, width: x2 - x1, height: FLOOR - 30, "class": "zone " + b[2] }), svg.firstChild);
      svg.appendChild(el("text", { x: x1 + 4, y: 42, "class": "zone-label" }, b[3]));
    });
    person(svg, xF, !youIsBack, youIsBack ? "前の人" : "あなた");
    person(svg, xB, youIsBack, youIsBack ? "あなた" : "後ろの人");
    measure(svg, edge, xB - HALF, 112, cm);
  }

  function drawTrio(svg, s, t) {
    var k = Math.min(1.1, 248 / (s + t)), xF = 80;
    var xY = xF + HALF * 2 + s * k, xB = xY + HALF * 2 + t * k;
    base(svg, 400);
    person(svg, xF, false, "前の人");
    person(svg, xY, true, "あなた");
    person(svg, xB, false, "後ろの人");
    measure(svg, xF + HALF, xY - HALF, 112, s);
    measure(svg, xY + HALF, xB - HALF, 112, t, s + t < 140);
  }

  /* ---------- ダンス ---------- */
  var DANCES = [
    { id: "hop", name: "ぴょんぴょん" },
    { id: "step", name: "サイドステップ" },
    { id: "disco", name: "ディスコ" },
    { id: "turn", name: "くるっとターン" },
    { id: "wiggle", name: "ぷるぷる" },
    { id: "moon", name: "ムーンウォーク" },
    { id: "stretch", name: "のびちぢみ" },
    { id: "flip", name: "宙返り" }
  ];
  // タイプごとの得意ダンス
  var TYPE_DANCE = { A: "step", B: "wiggle", C: "moon", D: "hop", E: "turn" };

  function setDance(fig, id) {
    var d = DANCES.filter(function (x) { return x.id === id; })[0] || DANCES[0];
    $$(".dancer", fig).forEach(function (n) {
      // 同じダンスを付け直しても最初から再生されるように一度外す
      n.removeAttribute("data-dance");
      void n.offsetWidth;
      n.setAttribute("data-dance", d.id);
    });
    fig.setAttribute("data-current", d.id);
    $("[data-dance-name]", fig).textContent = d.name;
  }

  function nextDance(fig) {
    var cur = fig.getAttribute("data-current");
    var i = DANCES.map(function (x) { return x.id; }).indexOf(cur);
    setDance(fig, DANCES[(i + 1) % DANCES.length].id);
  }

  function bindStage(fig, autoMs) {
    var timer = null;
    function auto() {
      clearInterval(timer);
      if (autoMs) timer = setInterval(function () { nextDance(fig); }, autoMs);
    }
    $("[data-stage]", fig).addEventListener("click", function () { nextDance(fig); auto(); });
    auto();
  }

  /* ---------- 画面遷移 ---------- */
  function show(name) {
    $$("[data-screen]").forEach(function (s) { s.hidden = s.getAttribute("data-screen") !== name; });
    var bar = $("[data-progress]");
    bar.hidden = name === "intro" || name === "result";
    var step = name === "stand" ? 1 : name === "tolerance" ? 2 : name === "question" ? state.qi + 3 : 0;
    $("span", bar).style.width = (step / TOTAL_STEPS * 100) + "%";
    window.scrollTo(0, 0);
    var h = $("[data-screen='" + name + "'] h1, [data-screen='" + name + "'] h2");
    if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
  }

  /* ---------- スライダー ---------- */
  function bindRange(key, youIsBack) {
    var input = $("[data-range='" + key + "']");
    var svg = $("[data-scene='" + key + "']");
    function update() {
      var cm = parseInt(input.value, 10);
      state[key] = cm;
      var z = zoneOf(cm);
      $("[data-read='" + key + "']").textContent = cm;
      $("[data-zone='" + key + "']").textContent = z.name;
      $("[data-zone-note='" + key + "']").textContent = z.note;
      drawPair(svg, cm, youIsBack);
    }
    input.addEventListener("input", update);
    update();
  }

  /* ---------- 質問 ---------- */
  function renderQuestion() {
    var q = D.questions[state.qi];
    $("[data-q-step]").textContent = (state.qi + 3) + " / " + TOTAL_STEPS;
    $("[data-q-text]").textContent = q.q;
    $("[data-q-say]").textContent = q.say || "";
    var list = $("[data-q-choices]");
    list.textContent = "";
    q.a.forEach(function (a, i) {
      var li = document.createElement("li");
      var b = document.createElement("button");
      b.type = "button";
      b.className = "choice" + (state.answers[state.qi] === i ? " is-picked" : "");
      b.textContent = a.t;
      b.addEventListener("click", function () { pick(i, b); });
      li.appendChild(b);
      list.appendChild(li);
    });
  }

  var picking = false;
  function pick(i, btn) {
    if (picking) return;
    picking = true;
    state.answers[state.qi] = i;
    btn.classList.add("is-picked");
    setTimeout(function () {
      picking = false;
      if (state.qi < D.questions.length - 1) {
        state.qi++;
        renderQuestion();
        show("question");
      } else {
        renderResult(compute());
        show("result");
      }
    }, 220);
  }

  /* ---------- 判定 ---------- */
  function compute() {
    var adj = 0, u = 0, s = 0, maxU = 0, maxS = 0;
    D.questions.forEach(function (q, qi) {
      var a = q.a[state.answers[qi]] || { d: 0, u: 0, s: 0 };
      adj += a.d; u += a.u; s += a.s;
      maxU += Math.max.apply(null, q.a.map(function (x) { return x.u; }));
      maxS += Math.max.apply(null, q.a.map(function (x) { return x.s; }));
    });
    var w = D.weights;
    var index = state.stand * w.stand + state.tolerance * w.tolerance + adj * w.adjust;
    var ti = 0;
    while (ti < D.types.length - 1 && index >= D.types[ti].max) ti++;
    var diff = state.tolerance - state.stand, gap = D.gaps[D.gaps.length - 1];
    for (var i = 0; i < D.gaps.length; i++) if (diff >= D.gaps[i].min) { gap = D.gaps[i]; break; }
    return {
      type: D.types[ti], ti: ti, index: index, gap: gap,
      stand: state.stand, tolerance: state.tolerance,
      u: Math.round(u / maxU * 100), s: Math.round(s / maxS * 100)
    };
  }

  function typeByCode(c) {
    return D.types.filter(function (t) { return t.code === c; })[0];
  }

  /* ---------- 結果 ---------- */
  var last = null;

  function setText(key, v) { $$("[data-r='" + key + "']").forEach(function (n) { n.textContent = v; }); }

  function renderResult(r) {
    last = r;
    var t = r.type;
    setText("code", t.code); setText("name", t.name); setText("range", "目安 " + t.range);
    setText("catch", t.catch); setText("body", t.body); setText("seen", t.seen); setText("tip", t.tip);
    setText("stand", r.stand); setText("tolerance", r.tolerance);
    setText("gapName", r.gap.name); setText("gapBody", r.gap.body);
    drawTrio($("[data-scene='result']"), r.stand, r.tolerance);
    var fig = $("[data-ikepy-type]");
    fig.setAttribute("data-type", t.code);
    setDance(fig, TYPE_DANCE[t.code]);

    // 5段階スケール
    var scale = $("[data-scale]");
    scale.textContent = "";
    D.types.forEach(function (tp, i) {
      var seg = document.createElement("span");
      seg.className = "seg" + (i === r.ti ? " is-on" : "");
      seg.textContent = tp.code;
      scale.appendChild(seg);
    });
    var lo = r.ti === 0 ? 20 : D.types[r.ti - 1].max;
    var hi = r.ti === D.types.length - 1 ? 200 : t.max;
    var within = Math.max(0.05, Math.min(0.95, (r.index - lo) / (hi - lo)));
    var mark = document.createElement("i");
    mark.className = "mark";
    mark.style.left = ((r.ti + within) / D.types.length * 100) + "%";
    scale.appendChild(mark);

    ["u", "s"].forEach(function (k) {
      $("[data-meter='" + k + "']").style.width = r[k] + "%";
      $("[data-meter-num='" + k + "']").textContent = r[k];
    });

    renderCompare(r);
    renderAllTypes(r.ti);
    updateShareX();
  }

  function compareRow(title, gapCm, mover, whoCalm) {
    var status, text;
    if (gapCm > 10) {
      status = "近すぎ注意";
      text = mover + "があと" + gapCm + "cm下がると、" + whoCalm + "は落ち着いて待てます。";
    } else if (gapCm >= -10) {
      status = "ちょうどいい";
      text = whoCalm + "の許せる距離とほぼ同じ。ぶつかりにくい2人です。";
    } else {
      status = "ゆとりあり";
      text = whoCalm + "にとっては十分な距離。もう少し詰めても大丈夫そうです。";
    }
    var row = document.createElement("div");
    row.className = "cmp-row" + (gapCm > 10 ? " is-warn" : "");
    var h = document.createElement("p"); h.className = "cmp-title"; h.textContent = title;
    var st = document.createElement("p"); st.className = "cmp-status"; st.textContent = status;
    var p = document.createElement("p"); p.textContent = text;
    row.appendChild(h); row.appendChild(st); row.appendChild(p);
    return row;
  }

  function renderCompare(r) {
    var box = $("[data-compare]");
    if (!friend) { box.hidden = true; return; }
    var ft = typeByCode(friend.t);
    var body = $("[data-compare-body]");
    body.textContent = "";
    var head = document.createElement("p");
    head.className = "cmp-types";
    head.textContent = "あなた：" + r.type.code + " " + r.type.name + " ／ " + friend.n + "さん：" + ft.code + " " + ft.name;
    body.appendChild(head);
    body.appendChild(compareRow("あなたが" + friend.n + "さんの後ろに並ぶと", friend.r - r.stand, "あなた", friend.n + "さん"));
    body.appendChild(compareRow(friend.n + "さんがあなたの後ろに並ぶと", r.tolerance - friend.s, friend.n + "さん", "あなた"));
    box.hidden = false;
  }

  function renderAllTypes(ti) {
    var ul = $("[data-all-types]");
    ul.textContent = "";
    D.types.forEach(function (t, i) {
      var li = document.createElement("li");
      if (i === ti) li.className = "is-you";
      li.innerHTML = '<span class="at-code"></span><span class="at-name"></span><span class="at-range"></span>';
      $(".at-code", li).textContent = t.code;
      $(".at-name", li).textContent = t.name;
      $(".at-range", li).textContent = t.range;
      ul.appendChild(li);
    });
  }

  function renderWhy() {
    var ol = $("[data-why]");
    D.whyClose.forEach(function (w) {
      var li = document.createElement("li");
      var h = document.createElement("h3"); h.textContent = w.h;
      var p = document.createElement("p"); p.textContent = w.p;
      li.appendChild(h); li.appendChild(p);
      ol.appendChild(li);
    });
  }

  /* ---------- 共有 ---------- */
  function baseUrl() { return location.origin + location.pathname; }

  function shareUrl() {
    var nick = ($("[data-nick]").value || "").trim().slice(0, 12);
    var q = new URLSearchParams({ s: last.stand, r: last.tolerance, t: last.type.code });
    if (nick) q.set("n", nick);
    return baseUrl() + "?" + q.toString();
  }

  function shareText() {
    return "レジ待ち距離感診断は【" + last.type.code + " " + last.type.name + "】。前の人とは" +
      last.stand + "cm、後ろの人は" + last.tolerance + "cmまでなら平気。あなたは何cm？";
  }

  function updateShareX() {
    $("[data-share-x]").href = "https://twitter.com/intent/tweet?text=" +
      encodeURIComponent(shareText()) + "&url=" + encodeURIComponent(shareUrl());
  }

  function share() {
    var url = shareUrl();
    var c = $("[data-copied]");
    function flash(msg) {
      c.classList.remove("is-url");
      c.textContent = msg;
      c.hidden = false;
      setTimeout(function () { c.hidden = true; }, 2400);
    }
    // 共有もコピーもできない環境では、URLをそのまま表示して選択してもらう
    function showUrl() {
      c.textContent = url;
      c.classList.add("is-url");
      c.hidden = false;
    }
    function copy() {
      if (!navigator.clipboard) return showUrl();
      navigator.clipboard.writeText(url).then(function () { flash("リンクをコピーしました"); }, showUrl);
    }
    if (navigator.share) {
      navigator.share({ title: "レジ待ち距離感診断", text: shareText(), url: url }).catch(function (e) {
        if (!e || e.name !== "AbortError") copy();
      });
      return;
    }
    copy();
  }

  /* ---------- 起動 ---------- */
  function init() {
    var hero = $(".ikepy-hero");
    setDance(hero, "hop");
    bindStage(hero, 3600);
    bindStage($("[data-ikepy-type]"), 0);
    bindRange("stand", true);
    bindRange("tolerance", false);
    renderWhy();

    if (friend) {
      $("[data-friend]").hidden = false;
      $$("[data-friend-name]").forEach(function (n) { n.textContent = friend.n; });
    }

    var nick = $("[data-nick]");
    nick.value = store("distance-nick") || "";
    nick.addEventListener("input", function () { store("distance-nick", nick.value); updateShareX(); });

    $$("[data-go]").forEach(function (b) {
      b.addEventListener("click", function () {
        var to = b.getAttribute("data-go");
        if (to === "question") renderQuestion();
        show(to);
      });
    });
    $("[data-back]").addEventListener("click", function () {
      if (state.qi > 0) { state.qi--; renderQuestion(); show("question"); }
      else show("tolerance");
    });
    $("[data-restart]").addEventListener("click", function () {
      state.qi = 0; state.answers = [];
      show("stand");
    });
    $("[data-share]").addEventListener("click", share);
  }

  init();
})();
