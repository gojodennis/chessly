import React from 'react';

export interface BoardArrow {
  from: string; // e.g. "e2"
  to: string;   // e.g. "e4"
  color: 'green' | 'red' | 'orange' | 'yellow' | 'blue';
  opacity?: number;
}

interface ArrowOverlayProps {
  arrows: BoardArrow[];
  orientation?: 'w' | 'b';
}

const COLOR_MAP: Record<BoardArrow['color'], { fill: string; stroke: string }> = {
  green: { fill: '#96bc4b', stroke: '#7da438' },
  red: { fill: '#fa412d', stroke: '#d93220' },
  orange: { fill: '#e58f2a', stroke: '#c7781b' },
  yellow: { fill: '#f0c15c', stroke: '#d1a33f' },
  blue: { fill: '#457abb', stroke: '#35639b' },
};

export const ArrowOverlay: React.FC<ArrowOverlayProps> = ({ arrows, orientation = 'w' }) => {
  if (!arrows || arrows.length === 0) return null;

  const getSquareCoords = (square: string): { x: number; y: number } => {
    const file = square.charCodeAt(0) - 97; // 0 to 7
    const rank = parseInt(square[1], 10) - 1; // 0 to 7

    const col = orientation === 'w' ? file : 7 - file;
    const row = orientation === 'w' ? 7 - rank : rank;

    return {
      x: col * 12.5 + 6.25,
      y: row * 12.5 + 6.25,
    };
  };

  const renderArrow = (arrow: BoardArrow, index: number) => {
    const start = getSquareCoords(arrow.from);
    const end = getSquareCoords(arrow.to);

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return null;

    const ux = dx / len;
    const uy = dy / len;
    const px = -uy;
    const py = ux;

    const shaftWidth = 2.4;
    const headLen = 4.2;
    const headWidth = 4.0;

    // Is it a Knight move?
    const fileDiff = Math.abs(arrow.from.charCodeAt(0) - arrow.to.charCodeAt(0));
    const rankDiff = Math.abs(parseInt(arrow.from[1], 10) - parseInt(arrow.to[1], 10));
    const isKnightMove = (fileDiff === 1 && rankDiff === 2) || (fileDiff === 2 && rankDiff === 1);

    const colors = COLOR_MAP[arrow.color] || COLOR_MAP.green;
    const opacity = arrow.opacity ?? 0.85;

    if (isKnightMove) {
      // Draw L-shape path for knight moves
      // Determine corner: move longer direction first, then turn
      let cornerX = start.x;
      let cornerY = start.y;

      if (rankDiff === 2) {
        cornerY = end.y;
      } else {
        cornerX = end.x;
      }

      // Vector of the last leg of the L
      const legDx = end.x - cornerX;
      const legDy = end.y - cornerY;
      const legLen = Math.sqrt(legDx * legDx + legDy * legDy);
      const legUx = legDx / legLen;
      const legUy = legDy / legLen;

      // Stop before the square center for the arrowhead
      const headBaseX = end.x - legUx * headLen;
      const headBaseY = end.y - legUy * headLen;

      return (
        <g key={`arrow-${index}`} opacity={opacity}>
          {/* L-shaft */}
          <path
            d={`M ${start.x} ${start.y} L ${cornerX} ${cornerY} L ${headBaseX} ${headBaseY}`}
            fill="none"
            stroke={colors.fill}
            strokeWidth={shaftWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Arrowhead */}
          <polygon
            points={`
              ${end.x},${end.y}
              ${headBaseX - legUy * headWidth},${headBaseY + legUx * headWidth}
              ${headBaseX + legUy * headWidth},${headBaseY - legUx * headWidth}
            `}
            fill={colors.fill}
          />
        </g>
      );
    }

    // Straight arrow
    const tipX = end.x - ux * 1.5;
    const tipY = end.y - uy * 1.5;
    const headBaseX = tipX - ux * headLen;
    const headBaseY = tipY - uy * headLen;

    const p1X = start.x - px * (shaftWidth / 2);
    const p1Y = start.y - py * (shaftWidth / 2);

    const p2X = headBaseX - px * (shaftWidth / 2);
    const p2Y = headBaseY - py * (shaftWidth / 2);

    const p3X = headBaseX - px * headWidth;
    const p3Y = headBaseY - py * headWidth;

    const p4X = tipX;
    const p4Y = tipY;

    const p5X = headBaseX + px * headWidth;
    const p5Y = headBaseY + py * headWidth;

    const p6X = headBaseX + px * (shaftWidth / 2);
    const p6Y = headBaseY + py * (shaftWidth / 2);

    const p7X = start.x + px * (shaftWidth / 2);
    const p7Y = start.y + py * (shaftWidth / 2);

    const points = `${p1X},${p1Y} ${p2X},${p2Y} ${p3X},${p3Y} ${p4X},${p4Y} ${p5X},${p5Y} ${p6X},${p6Y} ${p7X},${p7Y}`;

    return (
      <polygon
        key={`arrow-${index}`}
        points={points}
        fill={colors.fill}
        opacity={opacity}
      />
    );
  };

  return (
    <svg
      viewBox="0 0 100 100"
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    >
      {arrows.map((a, i) => renderArrow(a, i))}
    </svg>
  );
};

