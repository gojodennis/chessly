import React from 'react';
import { AnalyzedMove } from '../../engine/analysisEngine';
import { scoreToWinPercentage } from '../../engine/evaluation';

interface EvalGraphProps {
  moves: AnalyzedMove[];
  currentPly: number;
  onSelectPly: (plyIndex: number) => void;
  showScrubber?: boolean;
  height?: number;
}

export const EvalGraph: React.FC<EvalGraphProps> = ({
  moves,
  currentPly,
  onSelectPly,
  showScrubber = true,
  height = 54,
}) => {
  if (!moves || moves.length === 0) return null;

  const totalMoves = moves.length;
  const width = 500;
  const midY = height / 2;

  // Build points array for SVG line: (x, y)
  // Win% 100 -> y = 4 (top), Win% 0 -> y = height - 4 (bottom), Win% 50 -> y = midY
  const points = moves.map((m, idx) => {
    const x = (idx / Math.max(1, totalMoves - 1)) * width;
    const winPct = scoreToWinPercentage(m.scoreAfter);
    const y = (height - 8) - (winPct / 100) * (height - 12) + 2;
    return { x, y, move: m, idx };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }, '');

  // Fill path closing at center baseline (midY)
  const fillD = `${pathD} L ${width} ${midY} L 0 ${midY} Z`;

  // Current ply marker
  const currentPt = currentPly >= 0 && currentPly < points.length ? points[currentPly] : null;

  return (
    <div className="w-full bg-[#3d3a37] rounded-md overflow-hidden relative select-none shadow-inner border border-[#48443f]">
      <div className="relative w-full cursor-pointer" style={{ height: `${height}px` }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const ratio = Math.max(0, Math.min(1, clickX / rect.width));
            const targetPly = Math.round(ratio * (totalMoves - 1));
            onSelectPly(targetPly);
          }}
        >
          <defs>
            <linearGradient id="evalCurveGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#2c2a26" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Center 0.0 baseline */}
          <line
            x1="0"
            y1={midY}
            x2={width}
            y2={midY}
            stroke="#66615b"
            strokeWidth="1"
            opacity="0.8"
          />

          {/* Area fill */}
          <path d={fillD} fill="url(#evalCurveGrad)" />

          {/* Evaluation curve top border */}
          <path
            d={pathD}
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Move classification dots matching Chess.com */}
          {points.map((pt) => {
            const c = pt.move.classification;

            // Great: Blue dot
            if (c === 'great') {
              return (
                <circle
                  key={`dot-${pt.idx}`}
                  cx={pt.x}
                  cy={pt.y}
                  r="3.2"
                  fill="#3582ba"
                  stroke="#ffffff"
                  strokeWidth="0.8"
                />
              );
            }
            // Best / Excellent: Green dot
            if (c === 'best' || c === 'excellent') {
              return (
                <circle
                  key={`dot-${pt.idx}`}
                  cx={pt.x}
                  cy={pt.y}
                  r="2.8"
                  fill="#81b64c"
                  stroke="#ffffff"
                  strokeWidth="0.6"
                />
              );
            }
            // Mistake: Orange dot
            if (c === 'mistake') {
              return (
                <circle
                  key={`dot-${pt.idx}`}
                  cx={pt.x}
                  cy={pt.y}
                  r="3.5"
                  fill="#e58f2a"
                  stroke="#ffffff"
                  strokeWidth="0.9"
                />
              );
            }
            // Blunder / Miss: Red dot
            if (c === 'blunder' || c === 'miss') {
              return (
                <circle
                  key={`dot-${pt.idx}`}
                  cx={pt.x}
                  cy={pt.y}
                  r="3.8"
                  fill="#ca3431"
                  stroke="#ffffff"
                  strokeWidth="1"
                />
              );
            }
            // Brilliant: Cyan dot
            if (c === 'brilliant') {
              return (
                <circle
                  key={`dot-${pt.idx}`}
                  cx={pt.x}
                  cy={pt.y}
                  r="3.8"
                  fill="#1baca6"
                  stroke="#ffffff"
                  strokeWidth="1"
                />
              );
            }
            return null;
          })}

          {/* Current ply vertical orange scrubber cursor (matches Screenshot 3 exactly!) */}
          {showScrubber && currentPt && (
            <g>
              <line
                x1={currentPt.x}
                y1="0"
                x2={currentPt.x}
                y2={height}
                stroke="#e58f2a"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle
                cx={currentPt.x}
                cy={currentPt.y}
                r="4"
                fill="#ffffff"
                stroke="#e58f2a"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
