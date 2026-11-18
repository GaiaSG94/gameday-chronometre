/* The heat poster, shared by « Post » (feed) and « Jeu » (expanded). Board: C-riso.html / 01-post.html. */
import type { ReactNode } from 'react';
import { fmt } from '../../shared/heat';
import { Lanes, PrinterMarks } from '../riso/Lanes';
import { Masthead, PosterNumber, Sheet, Stamp, Stub } from '../riso/Print';
import type { Heat, RunResult } from '../../shared/api';

type PosterProps = { heat: Heat; stub: ReactNode; sticker: ReactNode };

/** Ready: today's target, the finish line printed on the lanes. */
export const ReadyPoster = ({ heat, stub, sticker }: PosterProps) => (
  <Sheet state="ready">
    <Lanes gap={null} />
    <Masthead n={heat.n} date={heat.dateLabel} />
    <div className="body">
      <div className="lead">{heat.open ? 'STOP THE CLOCK AT' : 'THIS HEAT WAS RUN AT'}</div>
      <PosterNumber value={fmt(heat.target)} big />
      <div className="sub">{heat.open ? 'SECONDS · NO CLOCK · ONE TRY' : 'SECONDS · HEAT CLOSED · RESULTS ONLY'}</div>
    </div>
    <Stub>{stub}</Stub>
    {sticker}
  </Sheet>
);

/** Measuring: blank paper, only the printer's marks. Nothing moves. */
export const BlankPoster = ({ heat, sticker }: { heat: Heat; sticker: ReactNode }) => (
  <Sheet state="running">
    <PrinterMarks />
    <Masthead n={heat.n} date={heat.dateLabel} />
    <div className="count">COUNT IN YOUR HEAD</div>
    {sticker}
  </Sheet>
);

/** Result: your time stamped, your pink mark against the blue finish. */
export const ResultPoster = ({ heat, result, lead, stub, sticker }: PosterProps & { result: RunResult; lead: string }) => (
  <Sheet state="result">
    <Lanes gap={result.gap} />
    <Masthead n={heat.n} date={heat.dateLabel} />
    <div className="body">
      <div className="lead">{lead}</div>
      <PosterNumber value={fmt(result.time)} big />
      <Stamp gap={result.gap} />
    </div>
    <Stub>{stub}</Stub>
    {sticker}
  </Sheet>
);
