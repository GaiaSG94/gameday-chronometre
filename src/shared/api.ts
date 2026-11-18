/* Wire types shared by the Devvit server and the React client. */

export type ErrorResponse = {
  status: 'error';
  message: string;
};

/** One day of the streak row: null = no run that day. */
export type DayMark = {
  day: string;
  initial: string;
  gap: number | null;
};

export type RunResult = {
  time: number;
  gap: number;
  rank: number;
  players: number;
  closer: number;
  median: number;
  streak: number;
  days: DayMark[];
  commented: boolean;
};

export type Heat = {
  day: string;
  n: string;
  dateLabel: string;
  target: number;
  /** false when the post belongs to a past day: results only, no new run. */
  open: boolean;
};

export type InitResponse = {
  type: 'init';
  heat: Heat;
  players: number;
  username: string;
  result: RunResult | null;
};

export type SubmitResponse = {
  type: 'submit';
  result: RunResult;
};

export type Ranked = {
  rank: number;
  name: string;
  gap: number;
};

export type StandingsResponse = {
  type: 'standings';
  players: number;
  bins: number[];
  youBin: number | null;
  top: Ranked[];
  you: Ranked | null;
  streak: number;
  days: DayMark[];
};

export type CommentResponse = {
  type: 'comment';
  ok: boolean;
};
