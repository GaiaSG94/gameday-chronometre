/* Print matter as SVG filters — same values as the locked boards (G-DESIGN/STYLE.md §3). */

const paper =
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

/** Grazing light on the paper tooth / slow cockling of the sheet. */
const light = (id: string, freq: string, oct: number, scale: number, elev: number, seed: number): string =>
  `<filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${freq}" ` +
  `numOctaves="${oct}" seed="${seed}" result="n"/><feDiffuseLighting in="n" surfaceScale="${scale}" diffuseConstant=".72" ` +
  `lighting-color="#fff"><feDistantLight azimuth="235" elevation="${elev}"/></feDiffuseLighting></filter>`;

/** Alpha-only colour matrix: a' = k * a + b. */
const am = (src: string, k: number, b: number, res: string): string =>
  `<feColorMatrix in="${src}" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${k} ${b}" result="${res}"/>`;

type Ink = { rough: number; edge: string; band: number; mot: number; grainF: string; grain: number };

/** Ink = ragged edges x drum banding x mottling x riso grain. */
const ink = (id: string, o: Ink): string =>
  `<filter id="${id}" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB">` +
  `<feTurbulence type="fractalNoise" baseFrequency="${o.edge}" numOctaves="2" seed="3" result="e"/>` +
  `<feDisplacementMap in="SourceGraphic" in2="e" scale="${o.rough}" xChannelSelector="R" yChannelSelector="G" result="r"/>` +
  `<feTurbulence type="fractalNoise" baseFrequency=".004 .085" numOctaves="2" seed="8" result="b0"/>` +
  am('b0', o.band, 1.12 - o.band * 0.45, 'b') +
  `<feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="13" result="m0"/>` +
  am('m0', o.mot, 1.08 - o.mot * 0.45, 'm') +
  `<feTurbulence type="fractalNoise" baseFrequency="${o.grainF}" numOctaves="1" seed="11" result="g0"/>` +
  am('g0', -o.grain, o.grain * 0.5 + 1.22, 'g') +
  `<feComposite in="b" in2="m" operator="arithmetic" k1="1" result="bm"/>` +
  `<feComposite in="bm" in2="g" operator="arithmetic" k1="1" result="mask"/>` +
  `<feComposite in="r" in2="mask" operator="in"/></filter>`;

export const FILTER_DEFS =
  paper +
  light('rs-relief', '.7', 3, 2.4, 50, 6) +
  light('rs-cockle', '.005', 3, 9, 38, 27) +
  ink('rs-ink', { rough: 3, edge: '.7', band: 1.7, mot: 1.9, grainF: '2.2', grain: 4.2 }) +
  ink('rs-ink-mid', { rough: 1.8, edge: '.9', band: 1.4, mot: 1.5, grainF: '2.4', grain: 3.2 }) +
  ink('rs-ink-lite', { rough: 1.1, edge: '1.1', band: 1.1, mot: 1.1, grainF: '2.6', grain: 2.4 }) +
  ink('rs-dots', { rough: 3.6, edge: '.45', band: 1.4, mot: 1.6, grainF: '2.2', grain: 2.6 }) +
  ink('rs-stamp', { rough: 4, edge: '.6', band: 2.2, mot: 2.8, grainF: '1.8', grain: 5 });
