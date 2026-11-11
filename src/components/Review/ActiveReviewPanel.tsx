import React, { useEffect, useRef, useMemo } from 'react';
import { AnalyzedMove } from '../../engine/analysisEngine';
import { KeyMoment } from '../../engine/keyMoments';
import { EvalGraph } from '../Board/EvalGraph';
import { CoachDannyAvatar } from './CoachDannyAvatar';
import { PieceGlyph } from '../Board/PlayerAvatars';
import {
  ArrowLeft,
  Heart,
  Search,
  Lightbulb,
  Star,
  ArrowRight,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Play,
  Pause,
  Share2,
} from 'lucide-react';

interface ActiveReviewPanelProps {
  moves: AnalyzedMove[];
  keyMoments: KeyMoment[];
  currentPly: number;
  isPlaying: boolean;
  isShowingBest: boolean;
  isExplaining: boolean;
  onSelectPly: (ply: number) => void;
  onNextKeyMoment: () => void;
  onPrevKeyMoment: () => void;
  onTogglePlay: () => void;
  onToggleBestMove: () => void;
  onToggleExplain: () => void;
  onBackToOverview: () => void;
  onFirst: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast: () => void;
}

export const ActiveReviewPanel: React.FC<ActiveReviewPanelProps> = ({
  moves,
  keyMoments,
  currentPly,
  isPlaying,
  isShowingBest,
  isExplaining,
  onSelectPly,
  onNextKeyMoment,
  onPrevKeyMoment,
  onTogglePlay,
  onToggleBestMove,
  onToggleExplain,
  onBackToOverview,
  onFirst,
  onPrev,
  onNext,
  onLast,
}) => {
  const activeRowRef = useRef<HTMLDivElement | null>(null);

  const activeMove = currentPly >= 0 && currentPly < moves.length ? moves[currentPly] : null;

  // Auto-scroll active move row into view
  useEffect(() => {
    if (activeRowRef.current) {
      activeRowRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [currentPly]);

  // Format evaluation pill (e.g. +3.13, -1.20, M2)
  const getEvalPill = (cp: number) => {
    if (Math.abs(cp) >= 28000) {
      return cp > 0 ? '+M' : '-M';
    }
    const val = (cp / 100).toFixed(2);
    return cp >= 0 ? `+${val}` : `${val}`;
  };

  // Determine current headline and commentary
  const currentKeyMoment = keyMoments.find(km => km.plyIndex === currentPly);
  let headlineText = '';
  let commentaryText = '';
  let badgeToUse = activeMove?.classification || 'good';

  if (isShowingBest && activeMove?.bestMoveSan) {
    headlineText = `Best is ${activeMove.bestMoveSan}`;
    badgeToUse = 'best';
    commentaryText = `Instead of ${activeMove.san}, the engine recommends playing ${activeMove.bestMoveSan} to maintain optimal position.`;
  } else if (activeMove) {
    const c = activeMove.classification;
    if (c === 'mistake') {
      headlineText = `${activeMove.san} is a mistake`;
    } else if (c === 'blunder') {
      headlineText = `${activeMove.san} is a blunder`;
    } else if (c === 'miss') {
      headlineText = `${activeMove.san} is a miss`;
    } else if (c === 'inaccuracy') {
      headlineText = `${activeMove.san} is an inaccuracy`;
    } else if (c === 'great') {
      headlineText = `${activeMove.san} is a great move`;
    } else if (c === 'best') {
      headlineText = `${activeMove.san} is the best move`;
    } else if (c === 'brilliant') {
      headlineText = `${activeMove.san} is brilliant!`;
    } else {
      headlineText = `${activeMove.san} was played`;
    }

    commentaryText =
      currentKeyMoment?.commentary ||
      activeMove.tutorFeedback.advice ||
      activeMove.explanation ||
      '';
  } else {
    headlineText = "Game review ready. Let's begin!";
    commentaryText = "Click Next to step through key moments from this game.";
  }

  // Memoize paired moves by turn
  const pairedTurns = useMemo(() => {
    const list: {
      moveNum: number;
      white: AnalyzedMove | null;
      black: AnalyzedMove | null;
    }[] = [];

    for (let i = 0; i < moves.length; i += 2) {
      list.push({
        moveNum: Math.floor(i / 2) + 1,
        white: moves[i] || null,
        black: moves[i + 1] || null,
      });
    }
    return list;
  }, [moves]);

  // Helper to render SAN with piece glyph
  const renderSan = (san: string) => {
    if (!san) return null;
    const firstChar = san[0];
    if (['N', 'B', 'R', 'Q', 'K'].includes(firstChar)) {
      return (
        <span className="inline-flex items-center">
          <PieceGlyph piece={firstChar as any} className="w-3.5 h-3.5 mr-0.5 opacity-90" />
          <span>{san.slice(1)}</span>
        </span>
      );
    }
    return <span>{san}</span>;
  };

  const shouldShowBadgeInTable = (classification?: string) => {
    return (
      classification === 'great' ||
      classification === 'best' ||
      classification === 'excellent' ||
      classification === 'mistake' ||
      classification === 'miss' ||
      classification === 'blunder' ||
      classification === 'inaccuracy' ||
      classification === 'brilliant'
    );
  };

  return (
    <div className="w-full bg-[#262421] rounded-xl border border-[#3b3834] overflow-hidden shadow-2xl flex flex-col text-white select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#36332f] bg-[#211f1c]">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onBackToOverview}
            className="text-gray-400 hover:text-white transition p-1 cursor-pointer"
            title="Back to Overview"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            className="text-gray-400 hover:text-white transition p-1 cursor-pointer"
            title="Favorite"
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 font-bold text-xs tracking-wide text-gray-200">
          <div className="w-3.5 h-3.5 rounded-full bg-[#81b64c] flex items-center justify-center text-[9px] text-white">
            ★
          </div>
          <span>Game Review</span>
        </div>

        <button
          className="text-gray-400 hover:text-white transition p-1 cursor-pointer"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3.5 space-y-3">
        {/* Coach Speech Bubble with Evaluation Pill (Matches Image 3) */}
        <div className="flex items-start gap-2.5">
          <CoachDannyAvatar size={44} className="border-2 border-[#81b64c] shadow" />

          {/* Speech Bubble */}
          <div className="relative flex-1 bg-white text-[#1c1c1c] px-3.5 py-2.5 rounded-xl shadow-md before:content-[''] before:absolute before:top-3.5 before:-left-2 before:w-0 before:h-0 before:border-y-6 before:border-y-transparent before:border-r-6 before:border-r-white">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                {activeMove && (
                  <img
                    src={`/assets/badges/${badgeToUse}.svg`}
                    alt={badgeToUse}
                    className="w-4 h-4 flex-shrink-0 drop-shadow-sm"
                  />
                )}
                <span className="text-xs font-bold leading-tight truncate">
                  {headlineText}
                </span>
              </div>

              {activeMove && (
                <span className="bg-[#f2f2f2] text-gray-800 text-[11px] font-mono font-bold px-1.5 py-0.5 rounded border border-gray-300 flex-shrink-0">
                  {getEvalPill(activeMove.scoreAfter)}
                </span>
              )}
            </div>

            {/* Expanded Tutor Explanation (When Explain is toggled) */}
            {isExplaining && commentaryText && (
              <div className="mt-2 pt-2 border-t border-gray-200 text-[11px] text-gray-700 leading-relaxed font-normal animate-fadeIn">
                <p>{commentaryText}</p>
                {activeMove?.bestMoveSan && (
                  <div className="mt-1 flex items-center gap-1 text-[#3c6b16] font-semibold">
                    <span>Engine recommendation:</span>
                    <span className="bg-[#eef8e6] px-1 py-0.2 rounded border border-[#d2edbf] font-mono">
                      {activeMove.bestMoveSan}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 3 Action Buttons Bar (Matches Image 3) */}
        <div className="grid grid-cols-3 gap-2">
          {/* 1. Explain Button */}
          <button
            onClick={onToggleExplain}
            className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
              isExplaining
                ? 'bg-[#403d39] text-[#f0c15c] border-[#f0c15c] shadow'
                : 'bg-[#312e2b] hover:bg-[#3d3a36] text-gray-200 border-[#403d39]'
            }`}
          >
            <Lightbulb className={`w-3.5 h-3.5 ${isExplaining ? 'text-yellow-400' : 'text-gray-400'}`} />
            <span>Explain</span>
          </button>

          {/* 2. Best Button */}
          <button
            onClick={onToggleBestMove}
            className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
              isShowingBest
                ? 'bg-[#2f4220] text-[#96c85e] border-[#81b64c] shadow'
                : 'bg-[#312e2b] hover:bg-[#3d3a36] text-gray-200 border-[#403d39]'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${isShowingBest ? 'text-[#81b64c] fill-current' : 'text-gray-400'}`} />
            <span>Best</span>
          </button>

          {/* 3. Next Button */}
          <button
            onClick={onNextKeyMoment}
            className="py-2 px-2 bg-[#312e2b] hover:bg-[#3d3a36] active:bg-[#252320] text-gray-200 font-semibold text-xs rounded-lg border border-[#403d39] transition cursor-pointer flex items-center justify-center gap-1.5 shadow"
          >
            <span>Next</span>
            <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>

        {/* Two-Column Move Table with Badges (Matches Image 3) */}
        <div className="bg-[#1e1c18] rounded-md border border-[#36332f] p-1.5 max-h-56 overflow-y-auto space-y-0.5 text-xs font-medium scrollbar-thin scrollbar-thumb-[#403d39]">
          {pairedTurns.map((turn) => {
            const whiteIdx = (turn.moveNum - 1) * 2;
            const blackIdx = whiteIdx + 1;
            const isWhiteSelected = currentPly === whiteIdx;
            const isBlackSelected = currentPly === blackIdx;
            const isCurrentRow = isWhiteSelected || isBlackSelected;

            return (
              <div
                key={turn.moveNum}
                ref={isCurrentRow ? activeRowRef : null}
                className={`grid grid-cols-12 items-center py-0.5 px-1 rounded transition ${
                  isCurrentRow ? 'bg-[#2f2d29]' : 'hover:bg-[#23211e]'
                }`}
              >
                {/* Move Number */}
                <span className="col-span-2 text-gray-500 font-mono text-[11px] pl-1">
                  {turn.moveNum}.
                </span>

                {/* White Move */}
                <button
                  onClick={() => onSelectPly(whiteIdx)}
                  className={`col-span-5 flex items-center gap-1 px-1.5 py-0.5 rounded cursor-pointer transition ${
                    isWhiteSelected
                      ? 'bg-[#3b3834] text-white font-bold shadow'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {turn.white && shouldShowBadgeInTable(turn.white.classification) && (
                    <img
                      src={`/assets/badges/${turn.white.classification}.svg`}
                      alt={turn.white.classification}
                      className="w-3.5 h-3.5 flex-shrink-0"
                    />
                  )}
                  <span className="truncate">{turn.white ? renderSan(turn.white.san) : ''}</span>
                </button>

                {/* Black Move */}
                {turn.black ? (
                  <button
                    onClick={() => onSelectPly(blackIdx)}
                    className={`col-span-5 flex items-center gap-1 px-1.5 py-0.5 rounded cursor-pointer transition ${
                      isBlackSelected
                        ? 'bg-[#3b3834] text-white font-bold shadow'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {shouldShowBadgeInTable(turn.black.classification) && (
                      <img
                        src={`/assets/badges/${turn.black.classification}.svg`}
                        alt={turn.black.classification}
                        className="w-3.5 h-3.5 flex-shrink-0"
                      />
                    )}
                    <span className="truncate">{renderSan(turn.black.san)}</span>
                  </button>
                ) : (
                  <div className="col-span-5" />
                )}
              </div>
            );
          })}
        </div>

        {/* Advantage / Eval Graph with Orange Scrubber Line (Matches Image 3) */}
        <EvalGraph
          moves={moves}
          currentPly={currentPly}
          onSelectPly={onSelectPly}
          showScrubber={true}
          height={50}
        />

        {/* 5-Button Transport Bar (Matches Image 3) */}
        <div className="grid grid-cols-5 gap-1 pt-1 border-t border-[#36332f]">
          {/* 1. First */}
          <button
            onClick={onFirst}
            className="h-9 flex items-center justify-center bg-[#312e2b] hover:bg-[#3d3a36] active:bg-[#252320] rounded text-gray-300 hover:text-white border border-[#403d39] transition cursor-pointer"
            title="First Move"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* 2. Previous */}
          <button
            onClick={onPrev}
            className="h-9 flex items-center justify-center bg-[#312e2b] hover:bg-[#3d3a36] active:bg-[#252320] rounded text-gray-300 hover:text-white border border-[#403d39] transition cursor-pointer"
            title="Previous Move"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* 3. Play / Pause */}
          <button
            onClick={onTogglePlay}
            className="h-9 flex items-center justify-center bg-[#312e2b] hover:bg-[#3d3a36] active:bg-[#252320] rounded text-white border border-[#403d39] transition cursor-pointer"
            title={isPlaying ? 'Pause' : 'Autoplay'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
          </button>

          {/* 4. Next */}
          <button
            onClick={onNext}
            className="h-9 flex items-center justify-center bg-[#312e2b] hover:bg-[#3d3a36] active:bg-[#252320] rounded text-gray-300 hover:text-white border border-[#403d39] transition cursor-pointer"
            title="Next Move"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* 5. Last */}
          <button
            onClick={onLast}
            className="h-9 flex items-center justify-center bg-[#312e2b] hover:bg-[#3d3a36] active:bg-[#252320] rounded text-gray-300 hover:text-white border border-[#403d39] transition cursor-pointer"
            title="Last Move"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>

        {/* Footer Sub-links (Matches Image 3) */}
        <div className="flex items-center justify-between pt-1 px-2 text-[11px] text-gray-400">
          <button className="flex items-center gap-1 hover:text-gray-200 transition cursor-pointer">
            <Star className="w-3.5 h-3.5 text-[#3582ba]" />
            <span>Skills</span>
          </button>
          <button className="flex items-center gap-1 hover:text-gray-200 transition cursor-pointer">
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};
