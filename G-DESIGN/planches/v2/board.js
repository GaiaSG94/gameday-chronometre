/* Board engine v2 (desktop only).
   Mounts <template id="game"> into a desktop feed frame (data-mount="d")
   or a bare 740 x 512 post slot (data-mount="s"), and runs the 3 states:
   ready -> running -> result. Sets CSS vars on the game root:
   --t (target / scale), --r (result / scale), --gap (signed seconds). */
(function () {
  "use strict";

  var DEMO = {
    n: "041", date: "Wed 18 Nov", day: "Wednesday", sheet: "18.XI",
    target: 7.30, result: 7.12, players: "3,214", median: 6.84,
    community: "r/chronometre", age: "4h", comments: "1.1k", votes: "2.4k"
  };

  var fmt = function (v) {
    return v.toFixed(2);
  };

  var erf = function (x) {
    var t = 1 / (1 + 0.3275911 * x);
    var y = ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t;
    return 1 - y * Math.exp(-x * x);
  };

  /* Demo only: community errors modelled as half-normal, sigma 0.55 s. */
  var closerThan = function (err) {
    return Math.round(100 * (1 - erf(Math.abs(err) / (0.55 * Math.SQRT2))));
  };

  var gapWord = function (gap) {
    if (Math.abs(gap) < 0.005) return "dead on";
    return gap < 0 ? "early" : "late";
  };

  var post = function () {
    return '<article class="post"><div class="post-h"><span class="av"></span><b>' + DEMO.community +
      "</b><span>&middot; " + DEMO.age + '</span></div><h1 class="post-t">Measurement ' + DEMO.n + " &middot; " + DEMO.date +
      '</h1><div class="game-slot"></div><div class="post-a"><span>&uarr; ' + DEMO.votes +
      " &darr;</span><span>" + DEMO.comments + " comments</span><span>Share</span></div></article>";
  };

  var desktopFrame = function () {
    var side = '<div class="feed-side"><i class="sk" style="width:150px"></i><i class="sk" style="width:110px"></i>' +
      '<i class="sk" style="width:170px"></i><i class="sk" style="width:130px"></i><i class="sk" style="width:90px"></i></div>';
    var right = '<div class="feed-side right"><i class="sk" style="height:150px;width:300px"></i>' +
      '<i class="sk" style="width:200px"></i><i class="sk" style="width:240px"></i><i class="sk" style="width:180px"></i></div>';
    return '<div class="chrome-bar"><i></i><i></i><i></i><u></u></div>' +
      '<div class="feed-nav"><i class="sk" style="width:96px;height:20px"></i><i class="sk" style="width:420px;height:32px;border-radius:16px;margin-left:220px"></i></div>' +
      '<div class="feed">' + side + '<div class="col">' + post() + '<div class="ghost"><i class="sk" style="width:160px"></i><i class="sk" style="width:420px;height:16px"></i><i class="sk" style="height:220px"></i></div></div>' + right + "</div>";
  };

  var fill = function (game, key, text) {
    game.querySelectorAll('[data-k="' + key + '"]').forEach(function (el) { el.textContent = text; });
  };

  var bindStatic = function (game) {
    var scale = Number(game.dataset.scale || 10);
    fill(game, "n", DEMO.n); fill(game, "date", DEMO.date); fill(game, "day", DEMO.day);
    fill(game, "sheet", DEMO.sheet); fill(game, "target", fmt(DEMO.target));
    fill(game, "players", DEMO.players); fill(game, "median", fmt(DEMO.median));
    game.style.setProperty("--t", String(DEMO.target / scale));
  };

  var showResult = function (game, v) {
    var scale = Number(game.dataset.scale || 10), gap = v - DEMO.target;
    fill(game, "result", fmt(v));
    fill(game, "gap", fmt(Math.abs(gap)));
    fill(game, "gap-word", gapWord(gap));
    fill(game, "closer", closerThan(gap) + "%");
    game.style.setProperty("--r", String(v / scale));
    game.style.setProperty("--gap", String(Math.max(-2, Math.min(2, gap))));
    game.dataset.side = Math.abs(gap) < 0.005 ? "on" : (gap < 0 ? "early" : "late");
  };

  var setState = function (game, s, v) {
    if (s === "result") showResult(game, v == null ? DEMO.result : v);
    game.dataset.state = s;
  };

  var live = [], chips = [];
  var syncChips = function (s) {
    chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c.dataset.state === s)); });
  };

  var wire = function (game) {
    var t0 = 0;
    game.querySelectorAll("[data-go]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var s = game.dataset.state;
        if (s === "ready") { t0 = performance.now(); setState(game, "running"); syncChips("running"); }
        else if (s === "running") { setState(game, "result", (performance.now() - t0) / 1000); syncChips("result"); }
        else { setState(game, "ready"); syncChips("ready"); }
      });
    });
  };

  var mount = function (host, tpl) {
    var kind = host.dataset.mount;
    host.innerHTML = kind === "d" ? '<div class="frame d">' + desktopFrame() + "</div>" : '<div class="game-slot"></div>';
    var slot = host.querySelector(".game-slot");
    slot.appendChild(tpl.content.cloneNode(true));
    var game = slot.firstElementChild;
    bindStatic(game);
    setState(game, host.dataset.lock || "ready");
    if (!host.dataset.lock) { wire(game); live.push(game); }
  };

  var init = function () {
    var tpl = document.getElementById("game");
    document.querySelectorAll("[data-mount]").forEach(function (h) { mount(h, tpl); });
    chips = Array.prototype.slice.call(document.querySelectorAll(".bd-states button"));
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        live.forEach(function (g) { setState(g, c.dataset.state); });
        syncChips(c.dataset.state);
      });
    });
    syncChips("ready");
  };

  document.addEventListener("DOMContentLoaded", init);
})();
