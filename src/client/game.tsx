/* Expanded view: « Jeu » -> « Carte de fin » -> « Séries & classement ». */
import './riso/riso.css';
import './riso/pages.css';

import { StrictMode, useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { net } from './net';
import { Sheet } from './riso/Print';
import { Card } from './screens/Card';
import { Jeu } from './screens/Jeu';
import { Standings } from './screens/Standings';
import type { InitResponse, RunResult } from '../shared/api';

type View = 'jeu' | 'card' | 'standings';

export const Game = () => {
  const [init, setInit] = useState<InitResponse | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);
  const [view, setView] = useState<View>('jeu');

  useEffect(() => {
    net
      .init()
      .then((data) => {
        setInit(data);
        setResult(data.result);
        if (data.result) setView('card');
      })
      .catch(() => setInit(null));
  }, []);

  const onResult = useCallback((r: RunResult) => setResult(r), []);
  const onCommented = useCallback(() => setResult((r) => (r ? { ...r, commented: true } : r)), []);

  if (!init) {
    return (
      <Sheet state="running">
        <div className="count">THE PRESS IS WARMING UP</div>
      </Sheet>
    );
  }
  if (view === 'standings') {
    return <Standings heat={init.heat} hasCard={result !== null} onBack={() => setView(result ? 'card' : 'jeu')} />;
  }
  if (view === 'card' && result) {
    return <Card heat={init.heat} result={result} onStandings={() => setView('standings')} onCommented={onCommented} />;
  }
  return (
    <Jeu
      init={init}
      result={result}
      onResult={onResult}
      onCard={() => setView('card')}
      onStandings={() => setView('standings')}
    />
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Game />
  </StrictMode>
);
