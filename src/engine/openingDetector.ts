export interface OpeningRecord {
  eco: string;
  name: string;
  moves: string;
}

let openingsData: OpeningRecord[] | null = null;
let loadPromise: Promise<OpeningRecord[]> | null = null;

export async function initOpeningsDatabase(url = '/data/openings.json'): Promise<OpeningRecord[]> {
  if (openingsData) return openingsData;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status} loading openings`);
      const data: OpeningRecord[] = await response.json();
      openingsData = data;
      return data;
    } catch (err) {
      console.warn('Could not load openings.json:', err);
      openingsData = [];
      return [];
    }
  })();

  return loadPromise;
}

export interface DetectedOpening {
  eco: string;
  name: string;
  matchedPlyCount: number;
}

/**
 * Given an array of UCI moves played in the game (e.g. ['e2e4', 'c7c5', 'g1f3', 'd7d6', ...]),
 * finds the longest matching ECO opening in the database.
 */
export function detectOpening(uciMoves: string[]): DetectedOpening | null {
  if (!openingsData || openingsData.length === 0 || uciMoves.length === 0) {
    return null;
  }

  const playedStr = uciMoves.join(' ');

  for (const op of openingsData) {
    if (playedStr === op.moves || playedStr.startsWith(op.moves + ' ') || op.moves.startsWith(playedStr)) {
      // If played string matches or prefix matches
      const plyCount = op.moves.split(' ').length;
      return {
        eco: op.eco,
        name: op.name,
        matchedPlyCount: plyCount,
      };
    }
  }

  return null;
}

