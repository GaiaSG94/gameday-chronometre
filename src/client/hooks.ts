import { useEffect, useState } from 'react';
import { clockLabel, msToNextHeat } from '../shared/heat';

/** "07:42:10" until the next heat, ticking every second. */
export const useNextHeat = (): string => {
  const [label, setLabel] = useState(() => clockLabel(msToNextHeat()));
  useEffect(() => {
    const id = window.setInterval(() => setLabel(clockLabel(msToNextHeat())), 1000);
    return () => window.clearInterval(id);
  }, []);
  return label;
};

/** Space bar presses the sticker (desktop). */
export const useSpaceKey = (onPress: () => void, enabled: boolean): void => {
  useEffect(() => {
    if (!enabled) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat) return;
      e.preventDefault();
      onPress();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onPress, enabled]);
};
