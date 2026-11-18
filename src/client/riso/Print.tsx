/* The locked Riso print layer as React parts (G-DESIGN/STYLE.md). */
import { useEffect, useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { FILTER_DEFS } from './filters';
import { fmt, gapWord } from '../../shared/heat';

export const SHEET_W = 740;
export const SHEET_H = 512;

const PAPER_LAYERS = ['mottle', 'fibre', 'fibre2', 'fleck', 'tooth', 'relief', 'cockle', 'light', 'fold'];

const useFit = (): number => {
  const read = () => Math.min(window.innerWidth / SHEET_W, window.innerHeight / SHEET_H);
  const [scale, setScale] = useState(read);
  useEffect(() => {
    const onResize = () => setScale(read());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return scale;
};

/** The poster sheet: 740 x 512 design space, scaled to fit the post, paper underneath. */
export const Sheet = ({ state, children }: { state: string; children: ReactNode }) => {
  const scale = useFit();
  return (
    <div className="stage">
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs dangerouslySetInnerHTML={{ __html: FILTER_DEFS }} />
      </svg>
      <div className="sheet" style={{ transform: `scale(${scale})` }}>
        <div className="g" data-state={state}>
          {PAPER_LAYERS.map((l) => (
            <div key={l} className={`pp pp-${l}`} />
          ))}
          {children}
        </div>
      </div>
    </div>
  );
};

export const Masthead = ({ n, date, tag }: { n: string; date: string; tag?: string }) => (
  <div className="head">
    <b>CHRONOMÈTRE</b>
    <span>
      HEAT Nº{n}
      {tag ? ` · ${tag}` : ''}
    </span>
    <i>{date}</i>
  </div>
);

/** Big number: blue plate + pink plate, misregistered. */
export const PosterNumber = ({ value, big }: { value: string; big?: boolean }) => (
  <div className={big ? 'pnum big' : 'pnum'}>
    <span className="b">{value}</span>
    <span className="p">{value}</span>
  </div>
);

export const Stamp = ({ gap }: { gap: number }) => (
  <span className="stamp">
    {fmt(Math.abs(gap))} S {gapWord(gap).toUpperCase()}
  </span>
);

export const Sticker = (props: {
  label: string;
  sub?: string;
  pink?: boolean;
  disabled?: boolean;
  onPress: (e: MouseEvent) => void;
}) => (
  <button
    className={props.pink ? 'go pinkish' : 'go'}
    disabled={props.disabled}
    onClick={props.onPress}
  >
    {props.label}
    {props.sub ? <small>{props.sub}</small> : null}
  </button>
);

export const Stub = ({ tall, children }: { tall?: boolean; children: ReactNode }) => (
  <div className={tall ? 'stub tall' : 'stub'}>{children}</div>
);
