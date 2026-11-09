import { Chess, Move } from 'chess.js';
import { evaluateStatic, MATE_SCORE } from './evaluation';
import { initPolyglotBook, lookupBookMoves, isBookMove } from './polyglot';
import { initOpeningsDatabase, detectOpening } from './openingDetector';
import { classifyMove, calculateGameAccuracy, MoveClassification } from './moveClassifier';
import { generateTutorCommentary, TutorFeedback } from './tutorEngine';

export interface AnalyzedMove {
  ply: number;
  moveNumber: number;
  turn: 'w' | 'b';
  san: string;
  uci: string;
  from: string;
  to: string;
  fenBefore: string;
  fenAfter: string;
  scoreBefore: number; // centipawns (White's perspective)
  scoreAfter: number;  // centipawns (White's perspective)
  winPctBefore: number;
  winPctAfter: number;
  winPctDelta: number;
  classification: MoveClassification;
  bestMoveSan: string;
  bestMoveUci: string;
  accuracy: number;
  explanation: string;
  tutorFeedback: TutorFeedback;
  opening?: string;
}

export interface GameReviewResult {
  moves: AnalyzedMove[];
  whiteAccuracy: number;
  blackAccuracy: number;
  opening: {
    eco: string;
    name: string;
  } | null;
  counts: {
    white: Record<MoveClassification, number>;
    black: Record<MoveClassification, number>;
  };
}

/**
 * Minimax with Alpha-Beta Pruning using PeSTO tables.
 */
function minimax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  if (depth === 0 || game.isGameOver()) {
    return evaluateStatic(game);
  }

  const moves = game.moves({ verbose: true });
  // Prioritize captures for faster pruning
  moves.sort((a, b) => (b.captured ? 100 : 0) - (a.captured ? 100 : 0));

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const evalScore = minimax(game, depth - 1, alpha, beta, false);
      game.undo();
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const evalScore = minimax(game, depth - 1, alpha, beta, true);
      game.undo();
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export interface SearchResult {
  bestMove: Move;
  bestScore: number;
  secondBestScore?: number;
}

/**
 * Searches the best move and score for the current position.
 */
export function findBestMove(game: Chess, depth = 3): SearchResult | null {
  if (game.isGameOver()) return null;
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return null;

  const isWhite = game.turn() === 'w';
  const evaluated: { move: Move; score: number }[] = [];

  let alpha = -Infinity;
  let beta = Infinity;

  // Order captures first
  moves.sort((a, b) => (b.captured ? 100 : 0) - (a.captured ? 100 : 0));

  for (const move of moves) {
    game.move(move);
    const score = isWhite
      ? minimax(game, depth - 1, alpha, beta, false)
      : -minimax(game, depth - 1, -beta, -alpha, true);
    game.undo();

    evaluated.push({ move, score });
    if (score > alpha) alpha = score;
  }

  evaluated.sort((a, b) => b.score - a.score);

  return {
    bestMove: evaluated[0].move,
    bestScore: isWhite ? evaluated[0].score : -evaluated[0].score,
    secondBestScore:
      evaluated.length > 1
        ? isWhite
          ? evaluated[1].score
          : -evaluated[1].score
        : undefined,
  };
}

/**
 * Analyzes an entire game ply-by-ply and generates the full Game Review.
 */
export async function analyzeGame(
  pgnOrMoves: string[] | string,
  onProgress?: (progress: number, currentPly: number, totalPlies: number) => void
): Promise<GameReviewResult> {
  // 1. Initialize databases
  await Promise.all([initPolyglotBook(), initOpeningsDatabase()]);

  // 2. Parse SAN moves
  let sanMoves: string[] = [];
  if (Array.isArray(pgnOrMoves)) {
    sanMoves = pgnOrMoves;
  } else {
    const parser = new Chess();
    try {
      parser.loadPgn(pgnOrMoves);
    } catch {
      throw new Error('Failed to parse PGN');
    }
    sanMoves = parser.history();
  }

  const totalPlies = sanMoves.length;
  const analyzedMoves: AnalyzedMove[] = [];
  const uciMovesPlayed: string[] = [];

  const replayGame = new Chess();
  let currentOpening = detectOpening([]);

  // Empty classification counts
  const counts = {
    white: {
      brilliant: 0,
      great: 0,
      best: 0,
      excellent: 0,
      good: 0,
      book: 0,
      inaccuracy: 0,
      mistake: 0,
      blunder: 0,
      miss: 0,
    },
    black: {
      brilliant: 0,
      great: 0,
      best: 0,
      excellent: 0,
      good: 0,
      book: 0,
      inaccuracy: 0,
      mistake: 0,
      blunder: 0,
      miss: 0,
    },
  };

  // 3. Process each ply
  for (let ply = 0; ply < totalPlies; ply++) {
    const san = sanMoves[ply];
    const turn = replayGame.turn();
    const fenBefore = replayGame.fen();

    // Check opening database as moves progress
    const searchBefore = findBestMove(replayGame, 3);
    const scoreBefore = searchBefore ? searchBefore.bestScore : evaluateStatic(replayGame);
    const bestMoveSan = searchBefore ? searchBefore.bestMove.san : san;
    const bestMoveUci = searchBefore
      ? `${searchBefore.bestMove.from}${searchBefore.bestMove.to}`
      : '';

    // Play the move
    const moveObj = replayGame.move(san);
    if (!moveObj) {
      console.warn(`Illegal move at ply ${ply}: ${san}`);
      break;
    }

    const uci = `${moveObj.from}${moveObj.to}${moveObj.promotion || ''}`;
    uciMovesPlayed.push(uci);

    const detected = detectOpening(uciMovesPlayed);
    if (detected) {
      currentOpening = detected;
    }

    const fenAfter = replayGame.fen();
    const scoreAfter = evaluateStatic(replayGame);

    // Classify move
    const gameBeforeClone = new Chess(fenBefore);
    const classificationResult = classifyMove({
      ply: ply + 1,
      turn,
      san,
      uci,
      from: moveObj.from,
      to: moveObj.to,
      gameBefore: gameBeforeClone,
      scoreBefore,
      scoreAfter,
      bestMoveSan,
      bestMoveUci,
      secondBestMoveScore: searchBefore?.secondBestScore,
      openingName: currentOpening?.name,
    });

    const moveNumber = Math.floor(ply / 2) + 1;
    const tutorFeedback = generateTutorCommentary({
      turn,
      san,
      classification: classificationResult.classification,
      gameBefore: gameBeforeClone,
      bestMoveSan,
      bestMoveUci,
      winPctAfter: classificationResult.winPctAfter,
      openingName: currentOpening?.name,
    });

    const analyzedMove: AnalyzedMove = {
      ply: ply + 1,
      moveNumber,
      turn,
      san,
      uci,
      from: moveObj.from,
      to: moveObj.to,
      fenBefore,
      fenAfter,
      scoreBefore,
      scoreAfter,
      winPctBefore: classificationResult.winPctBefore,
      winPctAfter: classificationResult.winPctAfter,
      winPctDelta: classificationResult.winPctDelta,
      classification: classificationResult.classification,
      bestMoveSan,
      bestMoveUci,
      accuracy: classificationResult.accuracy,
      explanation: classificationResult.explanation,
      tutorFeedback,
      opening: currentOpening?.name,
    };

    analyzedMoves.push(analyzedMove);

    // Update count
    const side = turn === 'w' ? 'white' : 'black';
    counts[side][analyzedMove.classification]++;

    if (onProgress) {
      const progressPct = Math.round(((ply + 1) / totalPlies) * 100);
      onProgress(progressPct, ply + 1, totalPlies);
    }

    // Yield small delay every 4 plies to keep UI responsive
    if (ply % 4 === 0) {
      await new Promise(r => setTimeout(r, 0));
    }
  }

  // 4. Calculate overall CAPS accuracies
  const { whiteAccuracy, blackAccuracy } = calculateGameAccuracy(analyzedMoves);

  return {
    moves: analyzedMoves,
    whiteAccuracy,
    blackAccuracy,
    opening: currentOpening ? { eco: currentOpening.eco, name: currentOpening.name } : null,
    counts,
  };
}
