/* Page « Séries & classement » — board 04-series-classement.html. */
import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { fmt } from '../../shared/heat';
import { net } from '../net';
import { Masthead, Sheet, Sticker, Stub } from '../riso/Print';
import type { DayMark, Heat, Ranked, StandingsResponse } from '../../shared/api';

const signed = (gap: number): string => (Math.abs(gap) < 0.005 ? '±0.00' : `${gap < 0 ? '−' : '+'}${fmt(Math.abs(gap))}`);

const Histogram = ({ s }: { s: StandingsResponse }) => {
  const max = Math.max(1, ...s.bins);
  return (
    <div className="hist">
      {s.bins.map((count, i) => (
        <i
          key={i}
          className={i === s.youBin ? 'ht pkd me' : 'ht'}
          style={{ height: `${Math.max(3, Math.round((176 * count) / max))}px` }}
        />
      ))}
      <span className="finish">
        <b>FINISH</b>
      </span>
      {s.you && s.youBin !== null ? (
        <span className="youtag pk" style={{ left: `${s.youBin * 13 + 11}px` }}>
          YOU {signed(s.you.gap)}
        </span>
      ) : null}
    </div>
  );
};

const Row = ({ r, me }: { r: Ranked; me?: boolean }) => (
  <div className={me ? 'ln me' : 'ln'}>
    <span className="rk">{r.rank}</span>
    <span className="nm">{me ? 'YOU' : `u/${r.name}`}</span>
    <span className="gp">{signed(r.gap)}</span>
  </div>
);

const Board = ({ s }: { s: StandingsResponse }) => {
  const youInTop = s.you !== null && s.top.some((t) => t.name === s.you?.name);
  return (
    <div className="board-list">
      <div className="lead">CLOSEST TODAY</div>
      {s.top.length === 0 ? <div className="empty">NO RUNNER YET — BE THE FIRST</div> : null}
      {s.top.map((r) => (
        <Row key={r.name} r={r} me={r.name === s.you?.name} />
      ))}
      {s.you && !youInTop ? (
        <>
          <div className="ln dots">···</div>
          <Row r={s.you} me />
        </>
      ) : null}
    </div>
  );
};

const Days = ({ days }: { days: DayMark[] }) => (
  <div className="days">
    {days.map((d) => (
      <div key={d.day}>
        <i
          className={d.gap === null ? 'ht miss' : 'ht pkd'}
          style={d.gap === null ? undefined : ({ '--dot': `${Math.max(0.9, 3 - Math.abs(d.gap) * 2.4).toFixed(1)}px` } as CSSProperties)}
        />
        {d.initial}
      </div>
    ))}
  </div>
);

export const Standings = ({ heat, hasCard, onBack }: { heat: Heat; hasCard: boolean; onBack: () => void }) => {
  const [s, setS] = useState<StandingsResponse | null>(null);
  useEffect(() => {
    net.standings().then(setS).catch(() => setS(null));
  }, []);
  return (
    <Sheet state="result">
      <Masthead n={heat.n} date={heat.dateLabel} tag="STANDINGS" />
      {s ? (
        <>
          <div className="field">
            <div className="lead">TODAY&apos;S FIELD</div>
            <div className="small">{s.players.toLocaleString('en-US')} RUNNERS · WHERE EVERYONE STOPPED</div>
            <Histogram s={s} />
            <div className="axis small">
              <span>1.5 S EARLY</span>
              <span>ON TIME</span>
              <span>1.5 S LATE</span>
            </div>
          </div>
          <Board s={s} />
          <Stub tall>
            <div>
              <div className="lbl">YOUR STREAK</div>
              <div className="lbl pk">{s.streak} {s.streak === 1 ? 'DAY' : 'DAYS IN A ROW'}</div>
            </div>
            <Days days={s.days} />
          </Stub>
        </>
      ) : (
        <div className="count">READING THE FIELD</div>
      )}
      {hasCard ? <Sticker label="CARD" sub="BACK" onPress={onBack} /> : <Sticker label="BACK" onPress={onBack} />}
    </Sheet>
  );
};
