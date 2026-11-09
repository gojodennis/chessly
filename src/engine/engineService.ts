import { GameReviewResult, analyzeGame } from './analysisEngine';

/**
 * Executes full game analysis in a background Web Worker so the main UI thread stays at 60 FPS.
 * Automatically falls back to synchronous execution if Web Workers are unavailable.
 */
export function runAnalysisAsync(
  pgn: string,
  onProgress?: (progress: number, currentPly: number, totalPlies: number) => void
): Promise<GameReviewResult> {
  if (typeof Worker !== 'undefined') {
    return new Promise((resolve, reject) => {
      try {
        const worker = new Worker(new URL('./worker/analysisWorker.ts', import.meta.url), {
          type: 'module',
        });

        worker.onmessage = (e: MessageEvent) => {
          const { type, progress, currentPly, totalPlies, result, error } = e.data;
          if (type === 'PROGRESS') {
            onProgress?.(progress, currentPly, totalPlies);
          } else if (type === 'SUCCESS') {
            worker.terminate();
            resolve(result);
          } else if (type === 'ERROR') {
            worker.terminate();
            reject(new Error(error));
          }
        };

        worker.onerror = (err) => {
          worker.terminate();
          console.warn('Worker error, falling back to main thread:', err);
          analyzeGame(pgn, onProgress).then(resolve).catch(reject);
        };

        worker.postMessage({ type: 'START_ANALYSIS', pgn });
      } catch (err) {
        console.warn('Failed to start worker, using main thread:', err);
        analyzeGame(pgn, onProgress).then(resolve).catch(reject);
      }
    });
  }

  return analyzeGame(pgn, onProgress);
}

