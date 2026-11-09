import React from 'react';
import { AnalyzedMove } from '../../engine/analysisEngine';
import { scoreToWinPercentage } from '../../engine/evaluation';

interface EvalGraphProps {
  moves: AnalyzedMove[];
  currentPly: number;
  onSelectPly: (plyIndex: number) => void;
}

export const EvalGraph: React.FC<EvalGraphProps> = ({ moves, currentPly, onSelectPly }) => {
  if (!moves || moves.length === 0) return null;

  const totalMoves = moves.length;
  const height = 70;
  const width = 500;

  // Build points array for SVG line: (x, y)
  // y ranges from 5 to 65 (middle is 35)
  // Win% 100 -> y = 5 (top), Win% 0 -> y = 65 (bottom), Win% 50 -> y = 35 (center)
  const points = moves.map((m, idx) => {
    const x = (idx / Math.max(1, totalMoves - 1)) * width;
    const winPct = scoreToWinPercentage(m.scoreAfter);
    const y = 65 - (winPct / 100) * 60;
    return { x, y, move: m, idx };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }, '');

  // Fill path closing at center baseline (y = 35)
  const fillD = `${pathD} L ${width} 35 L 0 35 Z`;

  // Current ply marker
  const currentPt = points[currentPly] || null;

  return (
    <div className="w-full bg-[#272522] p-3 rounded-lg border border-[#3b3834] space-y-2 select-none">
      <div className="flex justify-between items-center text-xs text-gray-400 font-semibold uppercase tracking-wider">
        <span>Evaluation Timeline</span>
        <span className="text-[11px] font-normal lowercase text-gray-500">click graph to jump to move</span>
      </div>

      <div className="relative w-full h-[70px] cursor-pointer">
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
            <linearGradient id="evalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#302e2b" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Center 0.0 line */}
          <line x1="0" y1="35" x2={width} y2="35" stroke="#4a4641" strokeDasharray="3 3" strokeWidth="1" />

          {/* Area fill */}
          <path d={fillD} fill="url(#evalGrad)" />

          {/* Evaluation curve */}
          <path d={pathD} fill="none" stroke="#81b64c" strokeWidth="2" strokeLinejoin="round" />

          {/* Event markers (Blunders, Mistakes, Inaccuracies, Brilliants) */}
          {points.map((pt) => {
            const c = pt.move.classification;
            if (c === 'blunder' || c === 'miss') {
              return (
                <circle
                  key={`dot-${pt.idx}`}
                  cx={pt.x}
                  cy={pt.y}
                  r="3.5"
                  fill="#ca3431"
                  stroke="#ffffff"
                  strokeWidth="1"
                />
              );
            }
            if (c === 'mistake') {
              return (
                <circle
                  key={`dot-${pt.idx}`}
                  cx={pt.x}
                  cy={pt.y}
                  r="3"
                  fill="#e58f2a"
                  stroke="#ffffff"
                  strokeWidth="0.8"
                />
              );
            }
            if (c === 'inaccuracy') {
              return (
                <circle
                  key={`dot-${pt.idx}`}
                  cx={pt.x}
                  cy={pt.y}
                  r="2.5"
                  fill="#f0c15c"
                />
              );
            }
            if (c === 'brilliant') {
              return (
                <circle
                  key={`dot-${pt.idx}`}
                  cx={pt.x}
                  cy={pt.y}
                  r="4"
                  fill="#1baca6"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                />
              );
            }
            return null;
          })}

          {/* Current ply vertical cursor line */}
          {currentPt && (
            <g>
              <line
                x1={currentPt.x}
                y1="0"
                x2={currentPt.x}
                y2={height}
                stroke="#ffffff"
                strokeWidth="1.5"
                opacity="0.9"
              />
              <circle
                cx={currentPt.x}
                cy={currentPt.y}
                r="4.5"
                fill="#81b64c"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};

