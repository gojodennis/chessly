import { AnalyzedMove } from './analysisEngine';

export interface KeyMoment {
  plyIndex: number;
  type: 'first_book' | 'last_book' | 'mistake' | 'blunder' | 'miss' | 'inaccuracy' | 'brilliant' | 'great' | 'game_end';
  headline: string;
}

/**
 * Extracts the instructional "Key Moments" from the game review.
 * Matches Chess.com's flow:
 * 1. First book move
 * 2. Last book move
 * 3. Every tactical mistake, blunder, miss, inaccuracy, brilliant, and great move
 * 4. Game conclusion
 */
export function extractKeyMoments(moves: AnalyzedMove[]): KeyMoment[] {
  if (!moves || moves.length === 0) return [];

  const keyMoments: KeyMoment[] = [];

  // Find book moves range
  let firstBookIndex = -1;
  let lastBookIndex = -1;

  for (let i = 0; i < moves.length; i++) {
    if (moves[i].classification === 'book') {
      if (firstBookIndex === -1) firstBookIndex = i;
      lastBookIndex = i;
    }
  }

  // 1. First book move
  if (firstBookIndex !== -1) {
    keyMoments.push({
      plyIndex: firstBookIndex,
      type: 'first_book',
      headline: `${moves[firstBookIndex].san} is a book move`,
    });
  }

  // 2. Last book move (if different from first)
  if (lastBookIndex !== -1 && lastBookIndex !== firstBookIndex) {
    keyMoments.push({
      plyIndex: lastBookIndex,
      type: 'last_book',
      headline: `${moves[lastBookIndex].san} is the last book move`,
    });
  }

  // 3. Scan for critical moments
  for (let i = 0; i < moves.length; i++) {
    const m = moves[i];
    // Skip if it was already marked as first/last book
    if (i === firstBookIndex || i === lastBookIndex) continue;

    const c = m.classification;
    if (c === 'brilliant') {
      keyMoments.push({
        plyIndex: i,
        type: 'brilliant',
        headline: `${m.san} is a brilliant move!`,
      });
    } else if (c === 'great') {
      keyMoments.push({
        plyIndex: i,
        type: 'great',
        headline: `${m.san} is a great move`,
      });
    } else if (c === 'blunder') {
      keyMoments.push({
        plyIndex: i,
        type: 'blunder',
        headline: `${m.san} is a blunder`,
      });
    } else if (c === 'miss') {
      keyMoments.push({
        plyIndex: i,
        type: 'miss',
        headline: `${m.san} is a missed win`,
      });
    } else if (c === 'mistake') {
      keyMoments.push({
        plyIndex: i,
        type: 'mistake',
        headline: `${m.san} is a mistake`,
      });
    } else if (c === 'inaccuracy') {
      keyMoments.push({
        plyIndex: i,
        type: 'inaccuracy',
        headline: `${m.san} is an inaccuracy`,
      });
    }
  }

  // 4. Always include the final move if not already present
  const lastMoveIndex = moves.length - 1;
  if (!keyMoments.some(km => km.plyIndex === lastMoveIndex)) {
    keyMoments.push({
      plyIndex: lastMoveIndex,
      type: 'game_end',
      headline: `${moves[lastMoveIndex].san} concludes the game`,
    });
  }

  // Sort key moments strictly in chronological order
  return keyMoments.sort((a, b) => a.plyIndex - b.plyIndex);
}

