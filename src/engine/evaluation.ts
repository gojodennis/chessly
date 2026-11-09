import { Chess } from 'chess.js';

export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

// Material base values in centipawns
export const PIECE_VALUES: Record<PieceType, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// PeSTO Middle-game Piece-Square Tables (Rank 8 down to Rank 1, A to H)
const MG_PAWN = [
    0,   0,   0,   0,   0,   0,   0,   0,
   98, 134,  61,  95,  68, 126,  34, -11,
   -6,   7,  26,  31,  65,  56,  25, -20,
  -14,  13,   6,  21,  23,  12,  17, -23,
  -27,  -2,  -5,  12,  17,   6,  10, -25,
  -26,  -4,  -4, -10,   3,   3,  33, -12,
  -35,  -1, -20, -23, -15,  24,  38, -22,
    0,   0,   0,   0,   0,   0,   0,   0,
];

const MG_KNIGHT = [
  -167, -89, -34, -49,  61, -97, -15, -107,
   -73, -41,  72,  36,  23,  62,   7,  -17,
   -47,  60,  37,  65,  84, 129,  73,   44,
    -9,  17,  19,  53,  37,  69,  18,   22,
   -13,   4,  16,  13,  28,  19,  21,   -8,
   -23,  -9,  12,  10,  19,  17,  25,  -16,
   -29, -53, -12,  -3,  -1,  18, -14,  -19,
  -105, -21, -58, -33, -17, -28, -19,  -23,
];

const MG_BISHOP = [
  -29,   4, -82, -37, -25, -42,   7,  -8,
  -26,  16, -18, -13,  30,  59,  18, -47,
  -16,  37,  43,  40,  35,  50,  37,  -2,
   -4,   5,  19,  50,  37,  37,   7,  -2,
   -6,  13,  13,  26,  34,  12,  10,   4,
    0,  15,  15,  15,  14,  27,  18,  10,
    4,  15,  16,   0,   7,  21,  33,   1,
  -33,  -3, -14, -21, -13, -12, -39, -21,
];

const MG_ROOK = [
   32,  42,  32,  51,  63,   9,  31,  43,
   27,  32,  58,  62,  80,  67,  26,  44,
   -5,  19,  26,  36,  17,  45,  61,  16,
  -24, -11,   7,  26,  24,  35,  -8, -20,
  -36, -26, -12,  -1,   9,  -7,   6, -23,
  -45, -25, -16, -17,   3,   0,  -5, -33,
  -44, -16, -20,  -9,  -1,  11,  -6, -71,
  -19, -13,   1,  17,  16,   7, -37, -26,
];

const MG_QUEEN = [
  -28,   0,  29,  12,  59,  44,  43,  45,
  -24, -39,  -5,   1, -16,  57,  28,  54,
  -18, -15,  10,  14,  44,  35,  86,  37,
  -27, -27, -16, -16,  -1,  17,  -2,   1,
  -14, -17, -11, -14,  -7,   4,  12,  -5,
  -18, -20, -13,  -8,  -4,   4,  -2,  -6,
  -19, -13,  -8,  -2,   1,  -2,   4, -18,
  -18,   0, -19, -15, -15, -11, -16, -48,
];

const MG_KING = [
  -65,  23,  16, -15, -56, -34,   2,  13,
   29,  -1, -20,  -7,  -8,  -4, -38, -29,
   -9,  24,   2, -16, -20,   6,  22, -22,
  -17, -20, -12, -27, -30, -25, -14, -36,
  -49,  -1, -27, -39, -46, -44, -33, -51,
  -14, -14, -22, -46, -44, -30, -15, -27,
    1,   7,  -8, -64, -43, -16,   9,   8,
  -15,  36,  12, -54,   8, -28,  24,  14,
];

const PST_MAP: Record<PieceType, number[]> = {
  p: MG_PAWN,
  n: MG_KNIGHT,
  b: MG_BISHOP,
  r: MG_ROOK,
  q: MG_QUEEN,
  k: MG_KING,
};

export const MATE_SCORE = 30000;

/**
 * Evaluates the static position in centipawns from White's perspective (+ White advantage, - Black advantage).
 */
export function evaluateStatic(game: Chess): number {
  if (game.isCheckmate()) {
    return game.turn() === 'w' ? -MATE_SCORE : MATE_SCORE;
  }
  if (game.isDraw() || game.isStalemate() || game.isThreefoldRepetition() || game.isInsufficientMaterial()) {
    return 0;
  }

  let mgWhite = 0;
  let mgBlack = 0;
  const board = game.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const val = PIECE_VALUES[piece.type];
      const pst = PST_MAP[piece.type];

      if (piece.color === 'w') {
        const sq = r * 8 + c; // White rank 8 is top (r=0)
        mgWhite += val + (pst ? pst[sq] : 0);
      } else {
        const sq = (7 - r) * 8 + c; // Flip for black
        mgBlack += val + (pst ? pst[sq] : 0);
      }
    }
  }

  // Small mobility incentive
  const moves = game.moves().length;
  const mobility = (game.turn() === 'w' ? moves : -moves) * 4;

  return (mgWhite - mgBlack) + mobility;
}

/**
 * Converts a centipawn evaluation score to a winning probability (0% to 100%) from White's perspective.
 * Uses the calibrated Chess.com / CAPS logistic function:
 * Win% = 50 + 50 * (2 / (1 + 10^(-cp / 400)) - 1)
 */
export function scoreToWinPercentage(cp: number): number {
  if (cp >= MATE_SCORE - 1000) return 100;
  if (cp <= -MATE_SCORE + 1000) return 0;

  // Sigmoid formula
  const win = 100 / (1 + Math.pow(10, -cp / 400));
  return Math.max(0, Math.min(100, win));
}

/**
 * Calculates single-move accuracy from the delta loss in win percentage (0 to 100).
 * CAPS2 Formula: Accuracy = 103.1668 * exp(-0.04354 * delta) - 3.1669
 */
export function deltaToMoveAccuracy(deltaWinPct: number): number {
  if (deltaWinPct <= 0) return 100;
  const acc = 103.1668 * Math.exp(-0.04354 * deltaWinPct) - 3.1669;
  return Math.max(0, Math.min(100, acc));
}
