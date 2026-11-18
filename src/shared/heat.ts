/* The daily heat: one target duration per UTC day, identical for every player. */

export const DAY_MS = 86_400_000;
/** Heat Nº001 was run on this day. */
export const EPOCH_DAY = '2026-10-09';
export const TARGET_MIN = 3;
export const TARGET_MAX = 12;
/** A run outside these bounds is rejected (mis-tap or tab left open). */
export const TIME_MIN = 0.3;
export const TIME_MAX = 60;
/** Histogram: 30 bins of 0.1 s, from 1.5 s early to 1.5 s late. */
export const BIN_COUNT = 30;
export const BIN_SPAN = 1.5;
export const STREAK_WINDOW = 14;

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const dayKeyUTC = (date: Date = new Date()): string => date.toISOString().slice(0, 10);

const dayStart = (day: string): number => Date.parse(`${day}T00:00:00Z`);

export const shiftDay = (day: string, delta: number): string =>
  dayKeyUTC(new Date(dayStart(day) + delta * DAY_MS));

export const heatNumber = (day: string): string => {
  const index = Math.round((dayStart(day) - dayStart(EPOCH_DAY)) / DAY_MS) + 1;
  return String(Math.max(index, 1)).padStart(3, '0');
};

export const dateLabel = (day: string): string => {
  const d = new Date(dayStart(day));
  return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
};

/** Short weekday initial, for the streak row. */
export const dayInitial = (day: string): string =>
  (DAYS[new Date(dayStart(day)).getUTCDay()] ?? 'S').charAt(0);

/** FNV-1a string hash, then mulberry32: deterministic, platform independent. */
const seededRandom = (seed: string): number => {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let t = (h + 0x6d2b79f5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** Today's target, in seconds with two decimals, between TARGET_MIN and TARGET_MAX. */
export const targetFor = (day: string): number => {
  const steps = (TARGET_MAX - TARGET_MIN) * 100;
  return (TARGET_MIN * 100 + Math.floor(seededRandom(`chronometre:${day}`) * (steps + 1))) / 100;
};

export const round2 = (value: number): number => Math.round(value * 100) / 100;

export const fmt = (value: number): string => value.toFixed(2);

export const isValidTime = (time: unknown): time is number =>
  typeof time === 'number' && Number.isFinite(time) && time >= TIME_MIN && time <= TIME_MAX;

export const gapWord = (gap: number): 'dead on' | 'early' | 'late' => {
  if (Math.abs(gap) < 0.005) return 'dead on';
  return gap < 0 ? 'early' : 'late';
};

/** Share of the other runners who stopped further from the target (rank 1 = closest). */
export const closerThan = (rank: number, players: number): number =>
  players <= 1 ? 100 : Math.round((100 * (players - rank)) / (players - 1));

export const binIndex = (gap: number): number => {
  const raw = Math.floor((gap + BIN_SPAN) / 0.1 + 1e-9);
  return Math.min(BIN_COUNT - 1, Math.max(0, raw));
};

export const msToNextHeat = (now: number = Date.now()): number => DAY_MS - (now % DAY_MS);

export const clockLabel = (ms: number): string => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
};

/** The last STREAK_WINDOW days ending on `day`, oldest first. */
export const windowDays = (day: string): string[] =>
  Array.from({ length: STREAK_WINDOW }, (_, i) => shiftDay(day, i - STREAK_WINDOW + 1));
