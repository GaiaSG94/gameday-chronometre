/* Page « Post » — board 01-post.html: the heat poster in the feed, fresh or already run. */
import './riso/riso.css';
import './riso/pages.css';

import { StrictMode, useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { requestExpandedMode } from '@devvit/web/client';
import { useNextHeat } from './hooks';
import { net } from './net';
import { Sheet, Sticker } from './riso/Print';
import { ReadyPoster, ResultPoster } from './screens/Poster';
import type { InitResponse } from '../shared/api';

const open = (e: MouseEvent) => requestExpandedMode(e.nativeEvent, 'game');

const Played = ({ init }: { init: InitResponse & { result: NonNullable<InitResponse['result']> } }) => {
  const next = useNextHeat();
  return (
    <ResultPoster
      heat={init.heat}
      result={init.result}
      lead="YOU RAN THIS HEAT IN"
      stub={
        <>
          <span>NEXT HEAT IN</span>
          <span className="clock">{next}</span>
          <span>
            <em>CLOSER THAN {init.result.closer}%</em>
          </span>
        </>
      }
      sticker={<Sticker label="CARD" onPress={open} />}
    />
  );
};

export const Splash = () => {
  const [init, setInit] = useState<InitResponse | null>(null);
  useEffect(() => {
    net.init().then(setInit).catch(() => setInit(null));
  }, []);

  if (!init) return <Sheet state="running">{null}</Sheet>;
  if (init.result) return <Played init={{ ...init, result: init.result }} />;
  return (
    <ReadyPoster
      heat={init.heat}
      stub={
        <>
          <span>{init.players.toLocaleString('en-US')} RAN {init.heat.open ? 'TODAY' : 'THIS HEAT'}</span>
          <span>
            <em>{init.heat.open ? 'ONE TRY EACH' : 'HEAT CLOSED'}</em>
          </span>
        </>
      }
      sticker={<Sticker label={init.heat.open ? 'GO' : 'FIELD'} onPress={open} />}
    />
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Splash />
  </StrictMode>
);
