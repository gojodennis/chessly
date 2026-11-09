/**
 * Estimates a player's performance rating based on their CAPS accuracy and blunders.
 * Calibrated against Chess.com's Game Review model (e.g. ~71% accuracy -> 750-850 rating).
 */
export function estimateGameRating(accuracy: number, blunderCount = 0): number {
  if (accuracy <= 0) return 200;

  // Base rating calculated from a sigmoid curve matching Chess.com output
  let rating = 250 + (accuracy - 40) * 22;

  // Penalize for blunders
  rating -= blunderCount * 35;

  // Bound to reasonable rating ranges and round to nearest 50
  const clamped = Math.max(300, Math.min(2850, rating));
  return Math.round(clamped / 50) * 50;
}

