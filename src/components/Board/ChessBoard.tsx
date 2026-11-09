import React, { memo } from 'react';
import { Chess, Square } from 'chess.js';
import { ArrowOverlay, BoardArrow } from './ArrowOverlay';
import { MoveClassification } from '../../engine/moveClassifier';

interface ChessBoardProps {
  game: Chess;
  theme: 'purple' | 'green' | 'dark_wood' | 'glass' | 'tournament';
  orientation: 'w' | 'b';
  selectedSquare: string | null;
  lastMove: { from: string; to: string } | null;
  arrows?: BoardArrow[];
  badge?: { square: string; classification: MoveClassification } | null;
  onSquareClick: (square: string) => void;
}

interface SquareViewProps {
  square: string;
  piece: { type: string; color: string } | null;
  isSelected: boolean;
  isLastFrom: boolean;
  isLastTo: boolean;
  isLegalDest: boolean;
  isKingInCheck: boolean;
  showRank: boolean;
  showFile: boolean;
  rankLabel: number;
  fileLabel: string;
  isDark: boolean;
  badgeClassification?: MoveClassification | null;
  onClick: (square: string) => void;
}

/**
 * Memoized individual square component.
 * Prevents 60+ unaffected squares from re-rendering on every move.
 */
const SquareView = memo<SquareViewProps>(({
  square,
  piece,
  isSelected,
  isLastFrom,
  isLastTo,
  isLegalDest,
  isKingInCheck,
  showRank,
  showFile,
  rankLabel,
  fileLabel,
  isDark,
  badgeClassification,
  onClick,
}) => {
  return (
    <div
      onClick={() => onClick(square)}
      className={`relative flex items-center justify-center cursor-pointer transition-colors duration-75 ${
        isSelected
          ? 'bg-[rgba(247,247,105,0.6)]'
          : isLastFrom || isLastTo
          ? 'bg-[rgba(255,255,0,0.35)]'
          : ''
      }`}
    >
      {/* King in Check Glow */}
      {isKingInCheck && (
        <div className="absolute inset-0 bg-red-600/60 rounded-full blur-sm animate-pulse pointer-events-none" />
      )}

      {/* Rank label */}
      {showRank && (
        <span
          className={`absolute top-0.5 left-1 text-[11px] font-bold select-none pointer-events-none ${
            isDark ? 'text-[#eeeed2]' : 'text-[#769656]'
          }`}
        >
          {rankLabel}
        </span>
      )}

      {/* File label */}
      {showFile && (
        <span
          className={`absolute bottom-0.5 right-1 text-[11px] font-bold select-none pointer-events-none ${
            isDark ? 'text-[#eeeed2]' : 'text-[#769656]'
          }`}
        >
          {fileLabel}
        </span>
      )}

      {/* Legal Move Hint Marker */}
      {isLegalDest && (
        <div
          className={`absolute pointer-events-none z-10 ${
            piece
              ? 'inset-0 border-4 border-black/25 rounded-full'
              : 'w-3 h-3 bg-black/25 rounded-full'
          }`}
        />
      )}

      {/* Piece Image */}
      {piece && (
        <img
          src={`/assets/pieces/neo/${piece.color}${piece.type}.png`}
          alt={`${piece.color}${piece.type}`}
          className="w-[88%] h-[88%] object-contain select-none pointer-events-none drop-shadow"
          style={{ imageRendering: '-webkit-optimize-contrast' }}
          loading="eager"
        />
      )}

      {/* Classification Badge on Destination Square */}
      {badgeClassification && (
        <div className="absolute -top-1.5 -right-1.5 w-6 h-6 z-20 transition-transform transform scale-110">
          <img
            src={`/assets/badges/${badgeClassification}.svg`}
            alt={badgeClassification}
            className="w-full h-full drop-shadow filter"
          />
        </div>
      )}
    </div>
  );
});

SquareView.displayName = 'SquareView';

export const ChessBoard: React.FC<ChessBoardProps> = memo(({
  game,
  theme,
  orientation,
  selectedSquare,
  lastMove,
  arrows = [],
  badge,
  onSquareClick,
}) => {
  const board = game.board();
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  const legalMoves = React.useMemo(() => {
    if (!selectedSquare) return [];
    try {
      const moves = game.moves({ square: selectedSquare as Square, verbose: true });
      return moves.map(m => m.to);
    } catch {
      return [];
    }
  }, [game, selectedSquare]);

  const displayFiles = orientation === 'w' ? files : [...files].reverse();
  const displayRanks = orientation === 'w' ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="relative w-full aspect-square rounded-md overflow-hidden shadow-2xl border-4 border-[#2b2926] select-none">
      {/* Board Theme Background Image */}
      <img
        src={`/assets/boards/${theme}.png`}
        alt="Chess Board"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ imageRendering: 'pixelated' }}
      />

      {/* 8x8 Grid */}
      <div className="absolute inset-0 grid grid-cols-8 grid-rows-8">
        {displayRanks.map((rank, rIdx) => {
          return displayFiles.map((file, cIdx) => {
            const square = `${file}${rank}`;
            const boardRow = 8 - rank;
            const boardCol = file.charCodeAt(0) - 97;
            const piece = board[boardRow]?.[boardCol] || null;

            const isSelected = selectedSquare === square;
            const isLastFrom = lastMove?.from === square;
            const isLastTo = lastMove?.to === square;
            const isLegalDest = (legalMoves as string[]).includes(square);
            const isKingInCheck =
              piece && piece.type === 'k' && piece.color === game.turn() && game.inCheck();

            const isSquareDark = (boardRow + boardCol) % 2 === 1;
            const badgeClass = badge && badge.square === square ? badge.classification : null;

            return (
              <SquareView
                key={square}
                square={square}
                piece={piece}
                isSelected={isSelected}
                isLastFrom={isLastFrom}
                isLastTo={isLastTo}
                isLegalDest={isLegalDest}
                isKingInCheck={Boolean(isKingInCheck)}
                showRank={cIdx === 0}
                showFile={rIdx === 7}
                rankLabel={rank}
                fileLabel={file}
                isDark={isSquareDark}
                badgeClassification={badgeClass}
                onClick={onSquareClick}
              />
            );
          });
        })}
      </div>

      {/* SVG Arrows Layer */}
      <ArrowOverlay arrows={arrows} orientation={orientation} />
    </div>
  );
});

ChessBoard.displayName = 'ChessBoard';
