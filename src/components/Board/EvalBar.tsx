import React from 'react';
import { scoreToWinPercentage, MATE_SCORE } from '../../engine/evaluation';

interface EvalBarProps {
  score: number; // centipawns from White's perspective
  orientation?: 'w' | 'b';
}

export const EvalBar: React.FC<EvalBarProps> = ({ score, orientation = 'w' }) => {
  const isMate = Math.abs(score) >= MATE_SCORE - 1000;
  let mateMoves = 0;
  if (isMate) {
    mateMoves = Math.max(1, Math.round((MATE_SCORE - Math.abs(score)) / 10));
  }

  // Win percentage for White (0 to 100)
  const whiteWinPct = scoreToWinPercentage(score);

  // Height of White's bar (from bottom if orientation is 'w', from top if 'b')
  const whiteBarHeight = orientation === 'w' ? whiteWinPct : 100 - whiteWinPct;

  // Formatting score text
  let scoreText = '';
  if (isMate) {
    scoreText = score > 0 ? `M${mateMoves}` : `-M${mateMoves}`;
  } else {
    const cp = Math.abs(score) / 100;
    scoreText = cp.toFixed(1);
    if (score > 0) scoreText = `+${scoreText}`;
    else if (score < 0) scoreText = `-${scoreText}`;
    else scoreText = '0.0';
  }

  // Determine label position (at bottom if White winning, at top if Black winning)
  const isWhiteWinning = score >= 0;
  const showLabelAtBottom = orientation === 'w' ? isWhiteWinning : !isWhiteWinning;

  return (
    <div className="relative w-6 sm:w-7 h-full bg-[#3b3834] rounded overflow-hidden flex flex-col justify-end shadow-md border border-[#2b2926] select-none flex-shrink-0">
      {/* White Portion of Bar */}
      <div
        className="w-full bg-[#ffffff] transition-all duration-300 ease-out"
        style={{ height: `${whiteBarHeight}%` }}
      />

      {/* Advantage Label Pill */}
      <div
        className={`absolute w-full px-0.5 text-center font-bold font-mono text-[10px] sm:text-[11px] pointer-events-none transition-all duration-300 ${
          showLabelAtBottom
            ? 'bottom-1 text-black'
            : 'top-1 text-white'
        }`}
      >
        {scoreText}
      </div>
    </div>
  );
};

