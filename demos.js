/* Interactive demos for the portfolio. Plain JS, no dependencies. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var el = function (tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  /* ---------- 01 Bellwether: swing map ---------- */
  (function () {
    var root = $("#demo-bellwether"); if (!root) return;
    // [state, col, row, electoral votes, 2024 margin (D minus R, points, approx.)]
    var S = [
      ["AK",0,0,3,-13.1],["ME",10,0,4,6.9],["VT",9,1,3,31.5],["NH",10,1,4,2.8],
      ["WA",0,2,12,18.2],["ID",1,2,4,-36.5],["MT",2,2,4,-20.0],["ND",3,2,3,-36.5],["MN",4,2,10,4.2],["IL",5,2,19,10.9],["WI",6,2,10,-0.9],["MI",7,2,15,-1.4],["NY",8,2,28,12.6],["RI",9,2,4,13.8],["MA",10,2,11,25.2],
      ["OR",0,3,8,14.3],["NV",1,3,6,-3.1],["WY",2,3,3,-45.8],["SD",3,3,3,-29.2],["IA",4,3,6,-13.2],["IN",5,3,11,-19.0],["OH",6,3,17,-11.2],["PA",7,3,19,-1.7],["NJ",8,3,14,5.9],["CT",9,3,7,14.5],
      ["CA",0,4,54,20.2],["UT",1,4,6,-21.6],["CO",2,4,10,11.0],["NE",3,4,5,-20.5],["MO",4,4,10,-18.4],["KY",5,4,8,-30.5],["WV",6,4,4,-41.9],["VA",7,4,13,5.8],["MD",8,4,10,28.5],["DE",9,4,3,14.7],
      ["AZ",1,5,11,-5.5],["NM",2,5,5,6.0],["KS",3,5,6,-16.1],["AR",4,5,6,-30.6],["TN",5,5,11,-29.7],["NC",6,5,16,-3.2],["SC",7,5,9,-17.8],["DC",8,5,3,83.0],
      ["OK",3,6,7,-34.3],["LA",4,6,8,-22.0],["MS",5,6,6,-22.9],["AL",6,6,9,-30.5],["GA",7,6,16,-2.2],
      ["HI",0,7,4,23.1],["TX",3,7,40,-13.7],["FL",8,7,30,-13.1]
    ];
    var picks = {}; // state -> "D" | "R" manual override
    var grid = $(".bw-grid", root), slider = $(".bw-swing", root), label = $(".bw-swing-val", root);
    var barD = $(".bw-bar-d", root), barR = $(".bw-bar-r", root), dN = $(".bw-d", root), rN = $(".bw-r", root), verdict = $(".bw-verdict", root);
    var tiles = {};
    S.forEach(function (s) {
      var t = el("button", "bw-tile", "<b>" + s[0] + "</b><small>" + s[3] + "</small>");
      t.style.gridColumn = (s[1] + 1); t.style.gridRow = (s[2] + 1);
      t.setAttribute("aria-label", s[0] + ", " + s[3] + " electoral votes");
      t.addEventListener("click", function () {
        var cur = picks[s[0]];
        picks[s[0]] = cur === undefined ? (winner(s) === "D" ? "R" : "D") : undefined;
        if (picks[s[0]] === undefined) delete picks[s[0]];
        render();
      });
      grid.appendChild(t); tiles[s[0]] = t;
    });
    function swing() { return parseFloat(slider.value); }
    function margin(s) { return s[4] + swing(); }
    function winner(s) { return picks[s[0]] || (margin(s) > 0 ? "D" : "R"); }
    function shade(m, party) {
      var a = Math.min(1, 0.28 + Math.abs(m) / 25);
      return party === "D" ? "rgba(58,92,150," + a + ")" : "rgba(170,62,58," + a + ")";
    }
    function render() {
      var sw = swing(), d = 0, r = 0;
      label.textContent = sw === 0 ? "2024 result" : (sw > 0 ? "D +" : "R +") + Math.abs(sw).toFixed(1) + " pts nationally";
      S.forEach(function (s) {
        var w = winner(s), m = margin(s), t = tiles[s[0]];
        if (w === "D") d += s[3]; else r += s[3];
        t.style.background = picks[s[0]] ? (w === "D" ? "#3A5C96" : "#AA3E3A") : shade(m, w);
        t.classList.toggle("picked", !!picks[s[0]]);
        t.title = s[0] + ": " + (picks[s[0]] ? "picked " + w : (m > 0 ? "D +" : "R +") + Math.abs(m).toFixed(1));
      });
      barD.style.width = (d / 538 * 100) + "%"; barR.style.width = (r / 538 * 100) + "%";
      dN.textContent = d; rN.textContent = r;
      verdict.textContent = d >= 270 ? "Democrats win" : r >= 270 ? "Republicans win" : "269–269 tie";
    }
    slider.addEventListener("input", render);
    $(".bw-reset", root).addEventListener("click", function () { picks = {}; slider.value = 0; render(); });
    render();
  })();

  /* ---------- 02 VoteHub: surrogate tracker chart ---------- */
  (function () {
    var root = $("#demo-votehub"); if (!root) return;
    var views = {
      people: { note: "Out-of-state surrogate-days, Sept. 1 – Oct. 31, 2026", rows: [
        ["Donald Trump", 17, "R"], ["JD Vance", 15, "R"], ["Raphael Warnock", 7, "D"], ["Kamala Harris", 6, "D"],
        ["Elizabeth Warren", 5, "D"], ["Pete Buttigieg", 5, "D"], ["Andy Beshear", 5, "D"], ["Mark Kelly", 5, "D"]] },
      states: { note: "Surrogate-days received by state (where the split is known)", rows: [
        ["Michigan", 35, [18, 17]], ["Georgia", 25, null], ["Ohio", 23, null], ["Iowa", 19, [3, 16]], ["New Hampshire", 14, [13, 1]], ["Maine", 12, [10, 2]]] },
      party: { note: "Total out-of-state surrogate-days by party", rows: [
        ["Republicans · 44 surrogates", 117, "R"], ["Democrats · 46 surrogates", 86, "D"]] }
    };
    var chart = $(".vh-chart", root), note = $(".vh-note", root);
    function draw(key) {
      var v = views[key], max = Math.max.apply(null, v.rows.map(function (r) { return r[1]; }));
      chart.innerHTML = ""; note.textContent = v.note;
      v.rows.forEach(function (r, i) {
        var row = el("div", "vh-row");
        row.appendChild(el("span", "vh-name", r[0]));
        var track = el("div", "vh-track"), bar = el("div", "vh-bar");
        if (Array.isArray(r[2])) {
          bar.appendChild(el("i", "vh-d")).style.flex = r[2][0];
          bar.appendChild(el("i", "vh-r")).style.flex = r[2][1];
          row.title = r[2][0] + " Democratic, " + r[2][1] + " Republican";
        } else {
          bar.appendChild(el("i", r[2] === "D" ? "vh-d" : r[2] === "R" ? "vh-r" : "vh-n")).style.flex = 1;
        }
        bar.style.width = "0%";
        track.appendChild(bar); row.appendChild(track);
        row.appendChild(el("span", "vh-val", r[1]));
        chart.appendChild(row);
        setTimeout(function () { bar.style.width = (r[1] / max * 100) + "%"; }, 30 + i * 40);
      });
      root.querySelectorAll(".seg button").forEach(function (b) { b.classList.toggle("on", b.dataset.v === key); });
    }
    root.querySelectorAll(".seg button").forEach(function (b) { b.addEventListener("click", function () { draw(b.dataset.v); }); });
    draw("people");
  })();

  /* ---------- 03 Focs: focus timer ---------- */
  (function () {
    var root = $("#demo-focs"); if (!root) return;
    var C = 2 * Math.PI * 88;
    var ring = $(".fx-ring-fg", root), time = $(".fx-time", root), phase = $(".fx-phase", root);
    var go = $(".fx-go", root), log = $(".fx-log", root), fast = $(".fx-fast", root);
    ring.style.strokeDasharray = C;
    var mode = "pomodoro", running = false, phaseName = "focus", elapsed = 0, target = 25 * 60, last = 0, done = 0, focusSecs = 0;
    function fmt(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2); }
    function setMode(m) {
      mode = m; running = false; phaseName = "focus"; elapsed = 0;
      target = m === "pomodoro" ? 25 * 60 : 0;
      root.querySelectorAll(".seg button").forEach(function (b) { b.classList.toggle("on", b.dataset.v === m); });
      paint();
    }
    function paint() {
      var shown, frac;
      if (mode === "flow" && phaseName === "focus") { shown = elapsed; frac = (elapsed % 3600) / 3600; }
      else { shown = target - elapsed; frac = target ? elapsed / target : 0; }
      time.textContent = fmt(shown);
      ring.style.strokeDashoffset = C * (1 - frac);
      phase.textContent = phaseName === "focus" ? (mode === "flow" ? "Flowtime · counting up" : "Focus") : "Break";
      go.textContent = running ? "Pause" : (mode === "flow" && phaseName === "focus" && elapsed > 0 ? "Resume" : "Start");
      $(".fx-end", root).hidden = !(mode === "flow" && phaseName === "focus" && elapsed > 0);
      log.textContent = done + (done === 1 ? " session" : " sessions") + " · " + Math.round(focusSecs / 60) + " min focused";
    }
    function finishFocus() {
      done++; focusSecs += elapsed;
      phaseName = "break";
      target = mode === "pomodoro" ? 5 * 60 : Math.max(60, Math.round(elapsed / 5));
      elapsed = 0;
    }
    function tick(t) {
      if (!running) return;
      var dt = (t - last) / 1000 * (fast.checked ? 60 : 1); last = t;
      elapsed += dt;
      if (phaseName === "focus" && mode === "pomodoro" && elapsed >= target) finishFocus();
      else if (phaseName === "break" && elapsed >= target) { phaseName = "focus"; elapsed = 0; target = mode === "pomodoro" ? 25 * 60 : 0; running = false; }
      paint();
      if (running) requestAnimationFrame(tick);
    }
    go.addEventListener("click", function () { running = !running; if (running) { last = performance.now(); requestAnimationFrame(tick); } paint(); });
    $(".fx-end", root).addEventListener("click", function () { finishFocus(); paint(); });
    $(".fx-reset", root).addEventListener("click", function () { setMode(mode); });
    root.querySelectorAll(".seg button").forEach(function (b) { b.addEventListener("click", function () { setMode(b.dataset.v); }); });
    fast.addEventListener("change", paint);
    setMode("pomodoro");
  })();

  /* ---------- 04 frmat: photo splitter ---------- */
  (function () {
    var root = $("#demo-frmat"); if (!root) return;
    var grid = $(".fm-grid", root), n = 3, img = null;
    function sample() {
      var c = document.createElement("canvas"); c.width = 1800; c.height = 1800; var g = c.getContext("2d");
      var sky = g.createLinearGradient(0, 0, 0, 1800);
      sky.addColorStop(0, "#1B2436"); sky.addColorStop(.45, "#C9785A"); sky.addColorStop(.62, "#F0C48A"); sky.addColorStop(1, "#2B2A33");
      g.fillStyle = sky; g.fillRect(0, 0, 1800, 1800);
      g.fillStyle = "rgba(255,236,200,.9)"; g.beginPath(); g.arc(1220, 980, 130, 0, Math.PI * 2); g.fill();
      [["#3B3440", 1100, .0016], ["#28232E", 1230, .0026], ["#17151C", 1380, .004]].forEach(function (L, k) {
        g.fillStyle = L[0]; g.beginPath(); g.moveTo(0, 1800);
        for (var x = 0; x <= 1800; x += 12) g.lineTo(x, L[1] + Math.sin(x * L[2] + k * 2) * (90 - k * 18) + Math.sin(x * L[2] * 3.1) * 30);
        g.lineTo(1800, 1800); g.fill();
      });
      var i = new Image(); i.onload = function () { img = i; draw(); }; i.src = c.toDataURL("image/jpeg", .9);
    }
    function draw() {
      if (!img) return;
      var cols = 3, rows = n / 3, tile = 360;
      var W = cols * tile, H = rows * tile;
      var scale = Math.max(W / img.width, H / img.height);
      var sw = W / scale, sh = H / scale, sx = (img.width - sw) / 2, sy = (img.height - sh) / 2;
      grid.innerHTML = "";
      grid.style.gridTemplateColumns = "repeat(3,1fr)";
      for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
        var cv = document.createElement("canvas"); cv.width = tile; cv.height = tile;
        cv.getContext("2d").drawImage(img, sx + c * sw / cols, sy + r * sh / rows, sw / cols, sh / rows, 0, 0, tile, tile);
        var cell = el("div", "fm-cell"); cell.appendChild(cv);
        cell.appendChild(el("span", "fm-idx", String(n - (r * 3 + c))));
        grid.appendChild(cell);
      }
      for (var k = 0; k < 3; k++) grid.appendChild(el("div", "fm-cell fm-old"));
      root.querySelectorAll(".seg button").forEach(function (b) { b.classList.toggle("on", +b.dataset.v === n); });
    }
    root.querySelectorAll(".seg button").forEach(function (b) { b.addEventListener("click", function () { n = +b.dataset.v; draw(); }); });
    $(".fm-file", root).addEventListener("change", function (e) {
      var f = e.target.files && e.target.files[0]; if (!f) return;
      var url = URL.createObjectURL(f), i = new Image();
      i.onload = function () { img = i; draw(); }; i.src = url;
    });
    sample();
  })();

  /* ---------- 05 Late Night: door check-in ---------- */
  (function () {
    var root = $("#demo-elmo"); if (!root) return;
    var G = [
      ["Ava Martinez","Sam"],["Ben Okafor","Sam"],["Chloe Park","Priya"],["Daniel Cohen","Priya"],["Ella Brooks","Marcus"],
      ["Felix Wang","Marcus"],["Grace Liu","Jordan"],["Henry Adams","Jordan"],["Isla Novak","Sam"],["Jack Rivera","Priya"],
      ["Kira Patel","Marcus"],["Leo Fischer","Jordan"],["Maya Singh","Sam"],["Noah Kim","Priya"],["Olivia Grant","Marcus"],
      ["Owen Hart","Jordan"],["Ruby Chen","Sam"],["Theo Silva","Priya"]
    ].map(function (g) { return { name: g[0], host: g[1], in: false }; });
    var list = $(".el-list", root), q = $(".el-q", root), count = $(".el-count", root), bar = $(".el-bar i", root);
    function render() {
      var term = q.value.trim().toLowerCase(), n = 0;
      list.innerHTML = "";
      G.forEach(function (g) {
        if (g.in) n++;
        if (term && g.name.toLowerCase().indexOf(term) < 0 && g.host.toLowerCase().indexOf(term) < 0) return;
        var b = el("button", "el-row" + (g.in ? " in" : ""), "<span><b>" + g.name + "</b><small>Guest of " + g.host + "</small></span><em>" + (g.in ? "In ✓" : "Check in") + "</em>");
        b.addEventListener("click", function () { g.in = !g.in; render(); });
        list.appendChild(b);
      });
      if (!list.children.length) list.appendChild(el("p", "el-empty", "Not on the list."));
      count.textContent = n + " / " + G.length + " checked in";
      bar.style.width = (n / G.length * 100) + "%";
    }
    q.addEventListener("input", render);
    render();
  })();
})();
