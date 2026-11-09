import { analyzeGame } from '../analysisEngine';

self.onmessage = async (e: MessageEvent) => {
  const { type, pgn } = e.data;

  if (type === 'START_ANALYSIS') {
    try {
      const result = await analyzeGame(pgn, (progress, currentPly, totalPlies) => {
        self.postMessage({
          type: 'PROGRESS',
          progress,
          currentPly,
          totalPlies,
        });
      });

      self.postMessage({
        type: 'SUCCESS',
        result,
      });
    } catch (err: any) {
      self.postMessage({
        type: 'ERROR',
        error: err?.message || String(err),
      });
    }
  }
};

