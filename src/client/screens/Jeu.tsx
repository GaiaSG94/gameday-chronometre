/* Page « Jeu » — board C-riso.html: ready -> measuring (blank paper) -> result. */
import { useCallback, useRef, useState } from 'react';
import { showToast } from '@devvit/web/client';
import { fmt, round2 } from '../../shared/heat';
import { useSpaceKey } from '../hooks';
import { net } from '../net';
import { Sticker } from '../riso/Print';
import { BlankPoster, ReadyPoster, ResultPoster } from './Poster';
import type { InitResponse, RunResult } from '../../shared/api';

type Props = {
  init: InitResponse;
  result: RunResult | null;
  onResult: (result: RunResult) => void;
  onCard: () => void;
  onStandings: () => void;
};

export const Jeu = ({ init, result, onResult, onCard, onStandings }: Props) => {
  const { heat } = init;
  const [phase, setPhase] = useState<'ready' | 'running' | 'sending'>('ready');
  const t0 = useRef(0);

  const press = useCallback(async () => {
    if (phase === 'ready') {
      t0.current = performance.now();
      setPhase('running');
      return;
    }
    if (phase !== 'running') return;
    const time = round2((performance.now() - t0.current) / 1000);
    setPhase('sending');
    try {
      onResult((await net.submit(time)).result);
    } catch (err) {
      showToast(err instanceof Error && err.message === 'time out of range' ? 'Too quick or too long — try again' : 'Could not record your run');
      setPhase('ready');
    }
  }, [phase, onResult]);

  useSpaceKey(() => void press(), heat.open && result === null);

  if (result) {
    return (
      <ResultPoster
        heat={heat}
        result={result}
        lead="YOU STOPPED AT"
        stub={
          <>
            <span>
              CLOSER THAN <em>{result.closer}%</em> OF {result.players.toLocaleString('en-US')}
            </span>
            <span>
              TARGET {fmt(heat.target)} · MEDIAN {fmt(result.median)}
            </span>
          </>
        }
        sticker={<Sticker label="CARD" onPress={onCard} />}
      />
    );
  }
  if (!heat.open) {
    return (
      <ReadyPoster
        heat={heat}
        stub={<span>{init.players.toLocaleString('en-US')} RAN THIS HEAT</span>}
        sticker={<Sticker label="FIELD" onPress={onStandings} />}
      />
    );
  }
  if (phase !== 'ready') {
    return <BlankPoster heat={heat} sticker={<Sticker label="STOP" pink disabled={phase === 'sending'} onPress={() => void press()} />} />;
  }
  return (
    <ReadyPoster
      heat={heat}
      stub={
        <>
          <span>{init.players.toLocaleString('en-US')} RAN TODAY</span>
          <span>
            <em>ONE TRY EACH</em>
          </span>
        </>
      }
      sticker={<Sticker label="GO" onPress={() => void press()} />}
    />
  );
};
