/* Board engine shared by the v1 planches.
   Mounts the page's <template id="game"> into a desktop and a mobile feed frame,
   and runs the 3 states of the main page: ready -> running -> result.
   No network, no build: open the .html file directly. */
(function () {
  "use strict";

  var DEMO = {
    n: "041", date: "Wed 18 Nov", sheet: "18.11.2026",
    target: 7.30, result: 7.12, players: "3,214", median: 6.84,
    community: "r/chronometre", age: "4h", comments: "1.1k", votes: "2.4k"
  };
  var SCALE = 10; // seconds mapped to one full dial / ruler

  var fmt = function (v) {
    return v.toFixed(2);
  }
  var pad = function (v) {
    return (v < 10 ? "0" : "") + fmt(v);
  }

  var erf = function (x) {
    var t = 1 / (1 + 0.3275911 * x);
    var y = ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t;
    return 1 - y * Math.exp(-x * x);
  }
  /* Demo only: community errors modelled as half-normal, sigma 0.55 s. */
  var closerThan = function (err) {
    return Math.round(100 * (1 - erf(Math.abs(err) / (0.55 * Math.SQRT2))));
  }

  var gapText = function (gap) {
    if (Math.abs(gap) < 0.005) return "Dead on";
    return fmt(Math.abs(gap)) + " s " + (gap < 0 ? "early" : "late");
  }

  var desktopFrame = function () {
    var side = '<div class="feed-side"><i class="sk" style="width:160px"></i><i class="sk" style="width:120px"></i>' +
      '<i class="sk" style="width:180px"></i><i class="sk" style="width:140px"></i></div>';
    var right = '<div class="feed-side" style="width:300px"><i class="sk" style="height:160px"></i>' +
      '<i class="sk" style="width:200px"></i><i class="sk" style="width:240px"></i></div>';
    return '<div class="chrome-bar"><i></i><i></i><i></i><u></u></div>' +
      '<div class="feed-nav"><i class="sk" style="width:96px;height:20px"></i><i class="sk" style="width:420px;height:32px;border-radius:16px;margin-left:220px"></i></div>' +
      '<div class="feed">' + side + post() + right + "</div>";
  }

  var mobileFrame = function () {
    return '<div class="m-status"><span>9:41</span><i class="sk" style="width:60px"></i></div>' +
      '<div class="m-bar"><i class="sk" style="width:24px;height:24px;border-radius:50%"></i><i class="sk" style="width:200px;height:28px;border-radius:14px"></i></div>' +
      post();
  }

  var post = function () {
    return '<article class="post"><div class="post-h"><span class="av"></span><b>' + DEMO.community +
      "</b><span>&middot; " + DEMO.age + '</span></div><h1 class="post-t">Measurement ' + DEMO.n + " &middot; " + DEMO.date +
      '</h1><div class="game-slot"></div><div class="post-a"><span>&uarr; ' + DEMO.votes +
      " &darr;</span><span>" + DEMO.comments + " comments</span><span>Share</span></div></article>";
  }

  var fill = function (game, key, text) {
    game.querySelectorAll('[data-k="' + key + '"]').forEach(function (el) { el.textContent = text; });
  }

  var bindStatic = function (game) {
    var t = fmt(DEMO.target).split(".");
    fill(game, "n", DEMO.n); fill(game, "date", DEMO.date); fill(game, "sheet", DEMO.sheet);
    fill(game, "target", fmt(DEMO.target)); fill(game, "target-pad", pad(DEMO.target));
    fill(game, "target-i", t[0]); fill(game, "target-d", "." + t[1]);
    fill(game, "players", DEMO.players); fill(game, "median", fmt(DEMO.median));
    place(game, "target", DEMO.target);
  }

  /* Places a marker: SVG elements rotate on the dial, HTML elements slide on the ruler. */
  var place = function (game, key, secs) {
    var f = Math.min(secs / SCALE, 1.2);
    game.querySelectorAll('[data-mark="' + key + '"]').forEach(function (el) {
      if (el instanceof SVGElement) el.setAttribute("transform", "rotate(" + (f * 360) + " 50 50)");
      else el.style.left = (Math.min(f, 1) * 100) + "%";
    });
  }

  var placeSpan = function (game, a, b) {
    var lo = Math.min(a, b) / SCALE, len = Math.abs(a - b) / SCALE;
    game.querySelectorAll("[data-span]").forEach(function (el) {
      if (el instanceof SVGElement) {
        var c = 2 * Math.PI * Number(el.getAttribute("r"));
        el.setAttribute("stroke-dasharray", (len * c) + " " + c);
        el.setAttribute("transform", "rotate(" + (-90 + lo * 360) + " 50 50)");
      } else { el.style.left = (lo * 100) + "%"; el.style.width = (len * 100) + "%"; }
    });
  }

  var showResult = function (game, v) {
    var gap = v - DEMO.target, p = fmt(v).split(".");
    fill(game, "result", fmt(v)); fill(game, "result-pad", pad(v));
    fill(game, "result-i", p[0]); fill(game, "result-d", "." + p[1]);
    fill(game, "gap", gapText(gap));
    fill(game, "gap-signed", (gap < 0 ? "−" : "+") + fmt(Math.abs(gap)));
    fill(game, "closer", closerThan(gap) + "%");
    place(game, "result", v); placeSpan(game, v, DEMO.target);
  }

  var setState = function (game, s, v) {
    if (s === "result") showResult(game, v == null ? DEMO.result : v);
    game.dataset.state = s;
  }

  var live = [], chips = [];
  var syncChips = function (s) {
    chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c.dataset.state === s)); });
  }

  var wire = function (game) {
    var t0 = 0, hold = game.dataset.gesture === "hold", btn = game.querySelector("[data-go]");
    var start = function () {
      t0 = performance.now(); setState(game, "running"); syncChips("running");
    }
    var stop = function () {
      setState(game, "result", (performance.now() - t0) / 1000); syncChips("result");
    }
    var reset = function () {
      setState(game, "ready"); syncChips("ready");
    }
    if (hold) {
      btn.addEventListener("pointerdown", function (e) { e.preventDefault(); if (game.dataset.state === "ready") start(); });
      window.addEventListener("pointerup", function () { if (game.dataset.state === "running") stop(); });
      btn.addEventListener("click", function () { if (game.dataset.state === "result") reset(); });
      return;
    }
    btn.addEventListener("click", function () {
      var s = game.dataset.state;
      if (s === "ready") start(); else if (s === "running") stop(); else reset();
    });
  }

  var mount = function (host, tpl) {
    var kind = host.dataset.mount;
    host.innerHTML = '<div class="frame ' + kind + '">' + (kind === "d" ? desktopFrame() : mobileFrame()) + "</div>";
    host.querySelector(".game-slot").appendChild(tpl.content.cloneNode(true));
    var game = host.querySelector(".game-slot").firstElementChild;
    bindStatic(game);
    setState(game, host.dataset.lock || "ready");
    if (!host.dataset.lock) { wire(game); live.push(game); }
  }

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
  }

  document.addEventListener("DOMContentLoaded", init);
})();
