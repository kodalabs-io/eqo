import { TimeoutError } from "../errors.js";

export async function raceWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMsg: string,
): Promise<T> {
  let rejectTimer: (reason: Error) => void;
  const timer = setTimeout(() => rejectTimer(new TimeoutError(errorMsg)), timeoutMs);
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        rejectTimer = reject;
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
