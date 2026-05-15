const DEFAULT_TIMEOUT_MS = 20000;

export function withWriteTimeout(promise, ms = DEFAULT_TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error('Ligação lenta — tente novamente.')),
        ms,
      );
    }),
  ]);
}
