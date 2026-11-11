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

  // Height of White's bar (from top if orientation is 'w', so White is top/middle)
  // In Chess.com standard: White is at the top of the bar when orientation is White, or bottom?
  // LOOK AT IMAGE 1: Score is 0.0. White bar is at the TOP (from y=0 down to 50%), and 0.0 is inside the white bar at the top!
  // LOOK AT IMAGE 3: Score is 3.1. White bar fills ~65% from the top down, with 3.1 at the top!
  // So in Chess.com, White is at the top of the bar!
  const whiteBarHeight = orientation === 'w' ? whiteWinPct : 100 - whiteWinPct;

  // Formatting score text
  let scoreText = '';
  if (isMate) {
    scoreText = score > 0 ? `M${mateMoves}` : `-M${mateMoves}`;
  } else {
    const cp = Math.abs(score) / 100;
    scoreText = cp.toFixed(1);
    if (score === 0) scoreText = '0.0';
  }

  // White winning means white bar is prominent at top
  const isWhiteWinning = score >= 0;

  return (
    <div className="relative w-6 h-full bg-[#262421] rounded-[3px] overflow-hidden flex flex-col justify-start shadow-md border border-[#36332f] select-none flex-shrink-0">
      {/* White Portion of Bar (Top section for White) */}
      <div
        className="w-full bg-[#ffffff] transition-all duration-300 ease-out"
        style={{ height: `${whiteBarHeight}%` }}
      />

      {/* Advantage Label Pill (Matches Image 1 & 3: at top inside the bar) */}
      <div
        className={`absolute w-full px-0.5 text-center font-bold font-mono text-[10px] pointer-events-none transition-all duration-300 ${
          isWhiteWinning ? 'top-1 text-[#262421]' : 'bottom-1 text-white'
        }`}
      >
        {scoreText}
      </div>
    </div>
  );
};
