/* Riso style — shared print matter. Load BEFORE board.js.
   1. Injects the paper / ink / stamp SVG filters once into the document.
   2. Expands every <div class="fibre"> of <template id="game"> into the paper stack
      (mottling, fibres, inclusions, light, fold).
   3. Prints a real halftone disc into every <g class="disc" data-cx data-cy data-r>. */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";

  var paperFilters =
    '<filter id="rs-mottle" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".007" numOctaves="4" seed="21"/>' +
    '<feColorMatrix values="0 0 0 0 .55  0 0 0 0 .45  0 0 0 0 .3  0 0 0 .75 -.16"/></filter>' +
    '<filter id="rs-fibre" x="0" y="0" width="100%" height="100%"><feTurbulence type="turbulence" baseFrequency=".9 .045" numOctaves="1" seed="5"/>' +
    '<feColorMatrix values="0 0 0 0 .62  0 0 0 0 .55  0 0 0 0 .42  0 0 0 9 -7.05"/></filter>' +
    '<filter id="rs-fibre2" x="0" y="0" width="100%" height="100%"><feTurbulence type="turbulence" baseFrequency=".05 .8" numOctaves="1" seed="17"/>' +
    '<feColorMatrix values="0 0 0 0 .62  0 0 0 0 .55  0 0 0 0 .42  0 0 0 9 -7.2"/></filter>' +
    '<filter id="rs-fleck" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="1" seed="2"/>' +
    '<feColorMatrix values="0 0 0 0 .35  0 0 0 0 .3  0 0 0 0 .22  0 0 0 26 -21.2"/></filter>' +
    '<filter id="rs-tooth" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" seed="4"/>' +
    '<feColorMatrix values="0 0 0 0 .5  0 0 0 0 .45  0 0 0 0 .38  0 0 0 .7 -.25"/></filter>';

  /* Paper relief: grazing light on the paper tooth, and slow cockling waves. */
  var lightFilter = function (id, freq, oct, scale, elev, seed) {
    return '<filter id="' + id + '" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="' + freq +
      '" numOctaves="' + oct + '" seed="' + seed + '" result="n"/><feDiffuseLighting in="n" surfaceScale="' + scale +
      '" diffuseConstant=".72" lighting-color="#fff"><feDistantLight azimuth="235" elevation="' + elev + '"/></feDiffuseLighting></filter>';
  };

  /* alpha-only matrix a' = k*a + b, as a feColorMatrix string */
  var am = function (src, k, b, res) {
    return '<feColorMatrix in="' + src + '" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ' + k + " " + b + '" result="' + res + '"/>';
  };

  /* Ink = ragged edges x drum banding x mottling x riso grain. o = {rough, edge, band, mot, grainF, grain} */
  var inkFilter = function (id, o) {
    return '<filter id="' + id + '" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB">' +
      '<feTurbulence type="fractalNoise" baseFrequency="' + o.edge + '" numOctaves="2" seed="3" result="e"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="e" scale="' + o.rough + '" xChannelSelector="R" yChannelSelector="G" result="r"/>' +
      '<feTurbulence type="fractalNoise" baseFrequency=".004 .085" numOctaves="2" seed="8" result="b0"/>' + am("b0", o.band, 1.12 - o.band * .45, "b") +
      '<feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="13" result="m0"/>' + am("m0", o.mot, 1.08 - o.mot * .45, "m") +
      '<feTurbulence type="fractalNoise" baseFrequency="' + o.grainF + '" numOctaves="1" seed="11" result="g0"/>' + am("g0", -o.grain, o.grain * .5 + 1.22, "g") +
      '<feComposite in="b" in2="m" operator="arithmetic" k1="1" result="bm"/>' +
      '<feComposite in="bm" in2="g" operator="arithmetic" k1="1" result="mask"/>' +
      '<feComposite in="r" in2="mask" operator="in"/></filter>';
  };

  var FILTERS = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' + paperFilters +
    lightFilter("rs-relief", ".7", 3, 2.4, 50, 6) + lightFilter("rs-cockle", ".005", 3, 9, 38, 27) +
    inkFilter("rs-ink", { rough: 3, edge: ".7", band: 1.7, mot: 1.9, grainF: "2.2", grain: 4.2 }) +
    inkFilter("rs-ink-mid", { rough: 1.8, edge: ".9", band: 1.4, mot: 1.5, grainF: "2.4", grain: 3.2 }) +
    inkFilter("rs-ink-lite", { rough: 1.1, edge: "1.1", band: 1.1, mot: 1.1, grainF: "2.6", grain: 2.4 }) +
    inkFilter("rs-dots", { rough: 3.6, edge: ".45", band: 1.4, mot: 1.6, grainF: "2.2", grain: 2.6 }) +
    inkFilter("rs-stamp", { rough: 4, edge: ".6", band: 2.2, mot: 2.8, grainF: "1.8", grain: 5 }) +
    "</defs></svg>";

  var PAPER = '<div class="pp pp-mottle"></div><div class="pp pp-fibre"></div><div class="pp pp-fibre2"></div>' +
    '<div class="pp pp-fleck"></div><div class="pp pp-tooth"></div><div class="pp pp-relief"></div><div class="pp pp-cockle"></div>' +
    '<div class="pp pp-light"></div><div class="pp pp-fold"></div>';

  var halftone = function (g) {
    var cx = Number(g.dataset.cx), cy = Number(g.dataset.cy), R = Number(g.dataset.r);
    var step = 8, a = 15 * Math.PI / 180, x, y, l, r, el;
    for (y = -R; y <= R; y += step) {
      for (x = -R; x <= R; x += step) {
        if (Math.sqrt(x * x + y * y) > R) continue;
        l = Math.sqrt(Math.pow(x + R * .45, 2) + Math.pow(y + R * .45, 2)) / (R * 1.9);
        r = Math.max(.5, Math.min(4.4, 4.6 * l + .4));
        el = document.createElementNS(NS, "circle");
        el.setAttribute("cx", String(cx + x * Math.cos(a) - y * Math.sin(a)));
        el.setAttribute("cy", String(cy + x * Math.sin(a) + y * Math.cos(a)));
        el.setAttribute("r", r.toFixed(2));
        g.appendChild(el);
      }
    }
  };

  document.body.insertAdjacentHTML("afterbegin", FILTERS);
  var tpl = document.getElementById("game");
  if (!tpl) return;
  tpl.content.querySelectorAll(".fibre").forEach(function (f) { f.outerHTML = PAPER; });
  tpl.content.querySelectorAll(".disc[data-r]").forEach(halftone);
})();
