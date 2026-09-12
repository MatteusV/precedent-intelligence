/**
 * React 19.2 Flight performance tracks initialize childrenEndTime to
 * -Infinity and then call performance.measure on aborted prerenders
 * (auth, redirect, notFound). Chrome throws "negative time stamp";
 * Firefox throws "cannot be negative". See vercel/next.js#86060.
 */
export function isFlightNegativeTimestampError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes("negative time stamp") ||
    error.message.includes("cannot be negative")
  );
}

/**
 * Swallows the Next.js/React Flight measure throw so the dev overlay
 * does not treat a framework timing abort as an application crash.
 */
export function installFlightPerformanceMeasureGuard(): void {
  const originalMeasure = performance.measure.bind(performance);

  performance.measure = ((
    ...args: Parameters<typeof performance.measure>
  ): PerformanceMeasure => {
    try {
      return originalMeasure(...args);
    } catch (error) {
      if (isFlightNegativeTimestampError(error)) {
        return undefined as unknown as PerformanceMeasure;
      }

      throw error;
    }
  }) as typeof performance.measure;
}
