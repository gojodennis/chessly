import { Chess } from 'chess.js';
import { MoveClassification } from './moveClassifier';

export interface TutorFeedback {
  title: string;
  summary: string;
  advice: string;
  showArrowByDefault: boolean;
  bestMoveExplanation?: string;
}

const PIECE_NAMES: Record<string, string> = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
};

/**
 * Generates an intuitive, conversational plain-English explanation of the move.
 */
export function generateTutorCommentary(params: {
  turn: 'w' | 'b';
  san: string;
  classification: MoveClassification;
  gameBefore: Chess;
  bestMoveSan: string;
  bestMoveUci: string;
  winPctAfter: number;
  openingName?: string;
}): TutorFeedback {
  const {
    turn,
    san,
    classification,
    gameBefore,
    bestMoveSan,
    bestMoveUci,
    winPctAfter,
    openingName,
  } = params;

  const player = turn === 'w' ? 'White' : 'Black';
  const oppPlayer = turn === 'w' ? 'Black' : 'White';

  // Check special move attributes
  const isCastle = san === 'O-O' || san === 'O-O-O';
  const isCheck = san.includes('+');
  const isCheckmate = san.includes('#');
  const isCapture = san.includes('x');

  // Explain the engine's suggested best move
  let bestMoveExplanation = '';
  if (bestMoveSan && bestMoveSan !== san) {
    if (bestMoveSan === 'O-O' || bestMoveSan === 'O-O-O') {
      bestMoveExplanation = `Castling into safety was the top priority.`;
    } else if (bestMoveSan.includes('x')) {
      bestMoveExplanation = `Taking the piece with ${bestMoveSan} won material and simplified the defense.`;
    } else if (bestMoveSan.includes('+')) {
      bestMoveExplanation = `Delivering check with ${bestMoveSan} would have kept ${oppPlayer}'s king on the run.`;
    } else {
      bestMoveExplanation = `${bestMoveSan} was the most active and principled continuation.`;
    }
  }

  // 1. Checkmate
  if (isCheckmate) {
    return {
      title: 'Checkmate!',
      summary: `${player} delivers checkmate and wins the game!`,
      advice: 'A clean tactical finish leaving the opponent with nowhere to hide.',
      showArrowByDefault: false,
    };
  }

  // 2. Book Move
  if (classification === 'book') {
    return {
      title: 'Book Move',
      summary: openingName
        ? `Theoretical move in the ${openingName}.`
        : 'Follows established grandmaster opening theory.',
      advice: 'Both sides are developing rapidly and fighting for control of the central squares.',
      showArrowByDefault: false,
    };
  }

  // 3. Brilliant Move (!!)
  if (classification === 'brilliant') {
    return {
      title: 'Brilliant Move!',
      summary: `A stunning sacrifice! ${player} sacrifices material to launch a decisive attack.`,
      advice: 'You recognized that piece activity and king safety are far more important than raw material here.',
      showArrowByDefault: true,
      bestMoveExplanation: 'The tactical follow-up proves this sacrifice is completely winning.',
    };
  }

  // 4. Great Move (!)
  if (classification === 'great') {
    return {
      title: 'Great Find!',
      summary: `In a difficult or critical position, this was the only move that kept ${player} in control.`,
      advice: 'All other candidate moves would have given away the initiative.',
      showArrowByDefault: false,
    };
  }

  // 5. Best Move (★)
  if (classification === 'best') {
    let summary = `The strongest move in the position.`;
    if (isCastle) {
      summary = `Safeguards the king and activates the rook.`;
    } else if (isCapture) {
      summary = `Captures with optimal piece coordination.`;
    } else if (isCheck) {
      summary = `Checks the opponent's king, maintaining high tempo.`;
    }

    return {
      title: 'Best Move',
      summary,
      advice: `${player} is playing accurately and maintaining a win chance of ${Math.round(winPctAfter)}%.`,
      showArrowByDefault: false,
    };
  }

  // 6. Excellent Move (✓)
  if (classification === 'excellent') {
    return {
      title: 'Excellent Move',
      summary: `A very strong choice that keeps full control of the position.`,
      advice: `Nearly as effective as the computer's top recommendation (${bestMoveSan}).`,
      showArrowByDefault: false,
    };
  }

  // 7. Good Move (✓)
  if (classification === 'good') {
    return {
      title: 'Good Move',
      summary: `A solid, natural move that continues the game plan.`,
      advice: `While playable, ${bestMoveSan} offered slightly more initiative.`,
      showArrowByDefault: false,
      bestMoveExplanation,
    };
  }

  // 8. Inaccuracy (?!)
  if (classification === 'inaccuracy') {
    return {
      title: 'Inaccuracy',
      summary: `A slight slip that gives ${oppPlayer} a chance to regroup.`,
      advice: `Instead of ${san}, the tutor suggests ${bestMoveSan}. ${bestMoveExplanation}`,
      showArrowByDefault: true,
      bestMoveExplanation,
    };
  }

  // 9. Mistake (?)
  if (classification === 'mistake') {
    return {
      title: 'Mistake',
      summary: `This move hurts ${player}'s position and surrenders a significant advantage.`,
      advice: `Better was ${bestMoveSan}. ${bestMoveExplanation}`,
      showArrowByDefault: true,
      bestMoveExplanation,
    };
  }

  // 10. Missed Win (✕)
  if (classification === 'miss') {
    return {
      title: 'Missed Win',
      summary: `${player} overlooked a winning tactical blow!`,
      advice: `Playing ${bestMoveSan} would have seized a commanding, winning advantage. Look at the suggested arrow to see the winning path.`,
      showArrowByDefault: true,
      bestMoveExplanation,
    };
  }

  // 11. Blunder (??)
  return {
    title: 'Blunder',
    summary: `A serious error that drastically shifts the evaluation in ${oppPlayer}'s favor.`,
    advice: `This allowed ${oppPlayer} dangerous counterplay. You needed to play ${bestMoveSan} to stay in the game.`,
    showArrowByDefault: true,
    bestMoveExplanation,
  };
}

