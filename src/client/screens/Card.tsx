/* Page « Carte de fin » — board 03-carte-de-fin.html: the official result ticket. */
import { useState } from 'react';
import { showToast } from '@devvit/web/client';
import { fmt, gapWord } from '../../shared/heat';
import { useNextHeat } from '../hooks';
import { net } from '../net';
import { Masthead, PosterNumber, Sheet, Stamp, Sticker, Stub } from '../riso/Print';
import { Disc } from '../riso/Lanes';
import type { Heat, RunResult } from '../../shared/api';

type Props = { heat: Heat; result: RunResult; onStandings: () => void; onCommented: () => void };

const Tally = ({ result }: { result: RunResult }) => (
  <div className="tally">
    {result.days.slice(1).map((d) => (
      <i key={d.day} className={d.gap === null ? 'ht miss' : 'ht pkd'} title={d.day} />
    ))}
  </div>
);

const Stats = ({ result }: { result: RunResult }) => (
  <div className="rcol">
    <div className="blk">
      <div className="lbl">STREAK</div>
      <div className="row">
        <span className="stat pk">{result.streak}</span>
        <span className="lbl pk">{result.streak === 1 ? 'DAY' : 'DAYS IN A ROW'}</span>
      </div>
      <Tally result={result} />
    </div>
    <div className="blk">
      <div className="lbl">TODAY&apos;S FIELD</div>
      <div className="row">
        <span className="stat">{result.closer}%</span>
        <span className="lbl">
          OF {result.players.toLocaleString('en-US')} RUNNERS
          <br />
          STOPPED FURTHER OFF
        </span>
      </div>
    </div>
  </div>
);

export const Card = ({ heat, result, onStandings, onCommented }: Props) => {
  const next = useNextHeat();
  const [busy, setBusy] = useState(false);
  const line = `${fmt(result.time)} on heat Nº${heat.n} — ${fmt(Math.abs(result.gap))} s ${gapWord(result.gap)}.`;

  const comment = async () => {
    if (busy || result.commented) return;
    setBusy(true);
    try {
      await net.comment();
      onCommented();
      showToast('Your time is in the comments');
    } catch {
      showToast('Could not post the comment');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet state="result">
      <svg className="scene" viewBox="0 0 740 512" aria-hidden="true">
        <Disc cx={676} cy={430} r={96} />
        <g className="ink" fill="none" stroke="#0078bf" strokeWidth="2.5" transform="translate(-6 4)">
          <circle cx="676" cy="430" r="110" />
        </g>
      </svg>
      <Masthead n={heat.n} date={heat.dateLabel} tag="RESULT CARD" />
      <div className="card-left">
        <div className="lead">OFFICIAL TIME</div>
        <PosterNumber value={fmt(result.time)} />
        <div className="lbl tgt">
          TARGET {fmt(heat.target)} S · MEDIAN {fmt(result.median)} S
        </div>
        <Stamp gap={result.gap} />
        <div className="quote">
          <div className="small">YOUR LINE FOR THE COMMENTS</div>
          <q>{line}</q>
        </div>
      </div>
      <Stats result={result} />
      <Stub>
        <span>NEXT HEAT IN</span>
        <span className="clock">{next}</span>
        <button className="link" onClick={onStandings}>
          STANDINGS →
        </button>
      </Stub>
      <Sticker
        label={result.commented ? 'POSTED' : 'COMMENT'}
        sub={result.commented ? 'THANKS' : `YOUR ${fmt(result.time)}`}
        disabled={busy || result.commented}
        onPress={() => void comment()}
      />
    </Sheet>
  );
};
