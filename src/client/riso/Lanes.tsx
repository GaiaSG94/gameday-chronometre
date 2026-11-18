/* The lanes: pink halftone disc, three blue rings, the blue finish line, your pink mark. */
import { useMemo } from 'react';
import { FINISH_DEG, halftone, markAngle } from './halftone';

const CX = 540;
const CY = 252;
const R = 114;

export const Disc = ({ cx, cy, r }: { cx: number; cy: number; r: number }) => {
  const dots = useMemo(() => halftone(cx, cy, r), [cx, cy, r]);
  return (
    <g className="disc ink" fill="#ff48b0">
      {dots.map((d, i) => (
        <circle key={i} cx={d.x.toFixed(1)} cy={d.y.toFixed(1)} r={d.r.toFixed(2)} />
      ))}
    </g>
  );
};

const turn = (deg: number) => ({ transform: `rotate(${deg.toFixed(2)}deg)` });

export const Lanes = ({ gap }: { gap: number | null }) => (
  <svg className="scene" viewBox="0 0 740 512" aria-hidden="true">
    <Disc cx={CX} cy={CY} r={R} />
    <g className="ring ink" fill="none" stroke="#0078bf" strokeWidth="2.5" transform="translate(-6 4)">
      <circle cx={CX} cy={CY} r="130" />
      <circle cx={CX} cy={CY} r="148" />
      <circle cx={CX} cy={CY} r="166" />
    </g>
    <g className="ring ink" fill="#0078bf" fontWeight="900" fontSize="12" transform="translate(-6 4)">
      <text x="397" y="256">1</text>
      <text x="379" y="256">2</text>
    </g>
    <g className="fin ink" style={turn(FINISH_DEG)}>
      <rect x={CX - 4} y="80" width="8" height="48" fill="#0078bf" />
      <text x={CX + 12} y="96" fontWeight="900" fontSize="11" letterSpacing="2" fill="#0078bf">
        FINISH
      </text>
    </g>
    {gap !== null ? (
      <g className="you ink" style={turn(markAngle(gap))}>
        <rect x={CX - 3} y="74" width="6" height="60" fill="#ff48b0" />
      </g>
    ) : null}
  </svg>
);

/** Blank paper while measuring: only the printer's marks. */
export const PrinterMarks = () => (
  <svg className="scene" viewBox="0 0 740 512" aria-hidden="true">
    <g className="ink" fill="none" strokeWidth="1.5">
      <g stroke="#0078bf">
        <circle cx="370" cy="236" r="22" />
        <path d="M370 200v72M334 236h72" />
        <path d="M18 40h28M40 18v28M722 40h-28M700 18v28M18 472h28M40 494v-28M722 472h-28M700 494v-28" />
      </g>
      <g stroke="#ff48b0" transform="translate(5 -3)">
        <circle cx="370" cy="236" r="22" />
        <path d="M370 200v72M334 236h72" />
      </g>
    </g>
  </svg>
);
