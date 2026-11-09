import { Chess } from 'chess.js';
import { scoreToWinPercentage, deltaToMoveAccuracy, PIECE_VALUES, PieceType } from './evaluation';
import { isBookMove, lookupBookMoves } from './polyglot';

export type MoveClassification =
  | 'brilliant'
  | 'great'
  | 'best'
  | 'excellent'
  | 'good'
  | 'book'
  | 'inaccuracy'
  | 'mistake'
  | 'blunder'
  | 'miss';

export interface MoveAnalysisInput {
  ply: number;
  turn: 'w' | 'b';
  san: string;
  uci: string;
  from: string;
  to: string;
  gameBefore: Chess;
  scoreBefore: number; // centipawns (White perspective)
  scoreAfter: number;  // centipawns (White perspective)
  bestMoveSan: string;
  bestMoveUci: string;
  secondBestMoveScore?: number;
  openingName?: string;
}

export interface MoveAnalysisResult {
  classification: MoveClassification;
  winPctBefore: number;
  winPctAfter: number;
  winPctDelta: number;
  accuracy: number;
  explanation: string;
}

/**
 * Checks if the played move was a sacrificial move (piece given up for superior positional compensation).
 */
function isSacrifice(gameBefore: Chess, from: string, to: string): boolean {
  const piece = gameBefore.get(from as any);
  if (!piece) return false;

  // Sacrifices usually involve Knight, Bishop, Rook, or Queen
  if (piece.type === 'p' || piece.type === 'k') return false;

  const captured = gameBefore.get(to as any);
  const pieceVal = PIECE_VALUES[piece.type];
  const capturedVal = captured ? PIECE_VALUES[captured.type] : 0;

  // Sacrificed a higher-value piece for a lower-value piece (e.g. R takes N, or Q takes B)
  if (pieceVal - capturedVal >= 180) {
    return true;
  }

  // Moved a piece into an attacked square without immediate defense
  // In chess.js, check if the destination is attacked by opponent
  const oppColor = piece.color === 'w' ? 'b' : 'w';
  const clone = new Chess(gameBefore.fen());
  try {
    clone.move({ from, to, promotion: 'q' });
    // Check if the opponent can immediately capture this piece on the 'to' square
    const oppMoves = clone.moves({ verbose: true });
    const canCapture = oppMoves.some(m => m.to === to && (PIECE_VALUES[m.piece as PieceType] <= pieceVal));
    if (canCapture && capturedVal === 0) {
      return true;
    }
  } catch {}

  return false;
}

/**
 * Classifies a played move using Chess.com CAPS2 logic.
 */
export function classifyMove(input: MoveAnalysisInput): MoveAnalysisResult {
  const {
    turn,
    san,
    uci,
    from,
    to,
    gameBefore,
    scoreBefore,
    scoreAfter,
    bestMoveSan,
    bestMoveUci,
    secondBestMoveScore,
    openingName,
  } = input;

  // 1. Calculate win percentages from the active player's viewpoint
  const whiteWinBefore = scoreToWinPercentage(scoreBefore);
  const whiteWinAfter = scoreToWinPercentage(scoreAfter);

  const winPctBefore = turn === 'w' ? whiteWinBefore : 100 - whiteWinBefore;
  const winPctAfter = turn === 'w' ? whiteWinAfter : 100 - whiteWinAfter;
  const winPctDelta = Math.max(0, winPctBefore - winPctAfter);

  // 2. Check for Book Move
  if (isBookMove(gameBefore, uci) || isBookMove(gameBefore, san)) {
    return {
      classification: 'book',
      winPctBefore,
      winPctAfter,
      winPctDelta: 0,
      accuracy: 100,
      explanation: openingName
        ? `Book move: ${openingName}.`
        : 'Theoretical opening book move.',
    };
  }

  // 3. Check for Brilliant Move (!!)
  // Criteria: Good material sacrifice, eval remains winning/sound, move is top engine choice
  const isBest = san === bestMoveSan || uci === bestMoveUci || winPctDelta <= 0.6;
  if (isBest && winPctAfter >= 52 && isSacrifice(gameBefore, from, to)) {
    return {
      classification: 'brilliant',
      winPctBefore,
      winPctAfter,
      winPctDelta: 0,
      accuracy: 100,
      explanation: 'Brilliant move! You sacrificed material to seize a decisive advantage.',
    };
  }

  // 4. Check for Great Move (!)
  // Criteria: The only move that preserves advantage (all alternatives lose significant evaluation)
  if (isBest && secondBestMoveScore !== undefined) {
    const whiteSecondWin = scoreToWinPercentage(secondBestMoveScore);
    const secondWin = turn === 'w' ? whiteSecondWin : 100 - whiteSecondWin;
    const secondDelta = Math.max(0, winPctBefore - secondWin);

    if (secondDelta >= 12.0 && winPctDelta <= 1.0) {
      return {
        classification: 'great',
        winPctBefore,
        winPctAfter,
        winPctDelta,
        accuracy: 100,
        explanation: 'Great move! This was the only move that maintained your advantage.',
      };
    }
  }

  // 5. Best Move (★)
  if (isBest) {
    return {
      classification: 'best',
      winPctBefore,
      winPctAfter,
      winPctDelta: 0,
      accuracy: 100,
      explanation: `Best move! ${san} was the strongest option on the board.`,
    };
  }

  // 6. Missed Win / Miss (✕)
  if (winPctBefore >= 82.0 && winPctAfter < 60.0) {
    return {
      classification: 'miss',
      winPctBefore,
      winPctAfter,
      winPctDelta,
      accuracy: deltaToMoveAccuracy(winPctDelta),
      explanation: `Missed win! You had a decisive winning opportunity. ${bestMoveSan} was best.`,
    };
  }

  // 7. Thresholds based on Win% Delta
  let classification: MoveClassification;
  let explanation = '';

  if (winPctDelta <= 2.2) {
    classification = 'excellent';
    explanation = 'Excellent move, keeping the pressure.';
  } else if (winPctDelta <= 5.5) {
    classification = 'good';
    explanation = 'A solid, natural move.';
  } else if (winPctDelta <= 11.0) {
    classification = 'inaccuracy';
    explanation = `Inaccuracy. ${bestMoveSan} was better.`;
  } else if (winPctDelta <= 22.0) {
    classification = 'mistake';
    explanation = `Mistake. This gives away much of your advantage. ${bestMoveSan} was best.`;
  } else {
    classification = 'blunder';
    explanation = `Blunder! This significantly hurts your position. ${bestMoveSan} was best.`;
  }

  return {
    classification,
    winPctBefore,
    winPctAfter,
    winPctDelta,
    accuracy: deltaToMoveAccuracy(winPctDelta),
    explanation,
  };
}

/**
 * Calculates overall White and Black CAPS accuracy scores (0 - 100%).
 */
export function calculateGameAccuracy(
  moves: { turn: 'w' | 'b'; accuracy: number; classification: MoveClassification }[]
): { whiteAccuracy: number; blackAccuracy: number } {
  const whiteMoves = moves.filter(m => m.turn === 'w');
  const blackMoves = moves.filter(m => m.turn === 'b');

  const calc = (list: typeof moves) => {
    if (list.length === 0) return 100;
    const sum = list.reduce((acc, m) => acc + m.accuracy, 0);
    return Math.round((sum / list.length) * 10) / 10;
  };

  return {
    whiteAccuracy: calc(whiteMoves),
    blackAccuracy: calc(blackMoves),
  };
}

