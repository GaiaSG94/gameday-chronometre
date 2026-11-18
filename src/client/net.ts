import type {
  CommentResponse,
  ErrorResponse,
  InitResponse,
  StandingsResponse,
  SubmitResponse,
} from '../shared/api';

const call = async <T>(path: string, body?: unknown): Promise<T> => {
  const init: RequestInit | undefined =
    body === undefined
      ? undefined
      : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
  const res = await fetch(path, init);
  const data = (await res.json()) as T | ErrorResponse;
  const failed = (data as ErrorResponse).status === 'error';
  if (!res.ok || failed) throw new Error(failed ? (data as ErrorResponse).message : `HTTP ${res.status}`);
  return data as T;
};

export const net = {
  init: () => call<InitResponse>('/api/init'),
  submit: (time: number) => call<SubmitResponse>('/api/submit', { time }),
  standings: () => call<StandingsResponse>('/api/standings'),
  comment: () => call<CommentResponse>('/api/comment', {}),
};
