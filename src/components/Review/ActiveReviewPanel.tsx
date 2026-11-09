import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AnalyzedMove } from '../../engine/analysisEngine';
import { KeyMoment } from '../../engine/keyMoments';
import { EvalGraph } from '../Board/EvalGraph';
import {
  ArrowLeft,
  Heart,
  Search,
  Lightbulb,
  ArrowRight,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Play,
  Pause,
  Share2,
  Star,
} from 'lucide-react';

interface ActiveReviewPanelProps {
  moves: AnalyzedMove[];
  keyMoments: KeyMoment[];
  currentPly: number;
  isPlaying: boolean;
  onSelectPly: (ply: number) => void;
  onNextKeyMoment: () => void;
  onPrevKeyMoment: () => void;
  onTogglePlay: () => void;
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
  onSelectPly,
  onNextKeyMoment,
  onTogglePlay,
  onBackToOverview,
  onFirst,
  onPrev,
  onNext,
  onLast,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const activeRowRef = useRef<HTMLDivElement | null>(null);

  const activeMove = currentPly >= 0 && currentPly < moves.length ? moves[currentPly] : null;

  // Auto-scroll active move row smoothly into view
  useEffect(() => {
    if (activeRowRef.current) {
      activeRowRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [currentPly]);

  // Format evaluation pill (e.g. +0.27, +0.41, -1.20, M2)
  const getEvalPill = (cp: number) => {
    if (Math.abs(cp) >= 28000) {
      return cp > 0 ? '+M' : '-M';
    }
    const val = (cp / 100).toFixed(2);
    return cp >= 0 ? `+${val}` : `${val}`;
  };

  // Determine current headline text
  const currentKeyMoment = keyMoments.find(km => km.plyIndex === currentPly);
  let headlineText = '';
  if (currentKeyMoment) {
    headlineText = currentKeyMoment.headline;
  } else if (activeMove) {
    headlineText = `${activeMove.san} was played`;
  } else {
    headlineText = "Game review ready. Let's begin!";
  }

  // Memoize paired moves by full turn for the 2-column table
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

  return (
    <div className="w-full bg-[#272522] rounded-lg border border-[#3b3834] overflow-hidden shadow-2xl flex flex-col text-white select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#36332f] bg-[#211f1c]">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToOverview}
            className="text-gray-400 hover:text-white transition p-1 cursor-pointer"
            title="Back to Overview"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button className="text-gray-400 hover:text-white transition p-1">
            <Heart className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 font-bold text-xs tracking-wide text-gray-200">
          <div className="w-3.5 h-3.5 rounded-full bg-[#81b64c] flex items-center justify-center text-[9px] text-white">
            ★
          </div>
          <span>Game Review</span>
        </div>

        <button className="text-gray-400 hover:text-white transition p-1">
          <Search className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3.5 space-y-3">
        {/* Coach Speech Bubble with Evaluation Pill */}
        <div className="flex items-start gap-2.5">
          {/* Coach Danny Avatar */}
          <div className="w-11 h-11 rounded-full bg-[#36332f] border-2 border-[#81b64c] flex items-center justify-center text-xl flex-shrink-0 shadow">
            🧔🏻‍♂️
          </div>

          {/* Speech Bubble */}
          <div className="relative flex-1 bg-white text-black px-3.5 py-2.5 rounded-xl shadow-md before:content-[''] before:absolute before:top-3.5 before:-left-2 before:w-0 before:h-0 before:border-y-6 before:border-y-transparent before:border-r-6 before:border-r-white">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {activeMove && (
                  <img
                    src={`/assets/badges/${activeMove.classification}.svg`}
                    alt={activeMove.classification}
                    className="w-4 h-4 flex-shrink-0"
                  />
                )}
                <span className="text-xs font-semibold leading-tight">{headlineText}</span>
              </div>

              {activeMove && (
                <span className="bg-[#f2f2f2] text-gray-700 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-gray-300 flex-shrink-0">
                  {getEvalPill(activeMove.scoreAfter)}
                </span>
              )}
            </div>

            {/* Extended Explanation if toggled */}
            {showExplanation && activeMove && (
              <div className="mt-2 pt-2 border-t border-gray-200 text-[11px] text-gray-700 leading-snug">
                {activeMove.tutorFeedback.advice}
              </div>
            )}
          </div>
        </div>

        {/* Primary Action Buttons: Explain vs Next Key Moment */}
        <div className="flex items-center gap-2">
          {/* Explain Button */}
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex-1 py-2 bg-[#312e2b] hover:bg-[#3d3a36] active:bg-[#252320] border border-[#403d39] text-gray-200 font-semibold text-xs rounded-md shadow transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Lightbulb className="w-3.5 h-3.5 text-[#e58f2a]" />
            <span>{showExplanation ? 'Hide' : 'Explain'}</span>
          </button>

          {/* Big Green NEXT Button (Jumps to Next Key Moment) */}
          <button
            onClick={onNextKeyMoment}
            className="flex-[1.5] py-2 bg-[#81b64c] hover:bg-[#96c85e] active:bg-[#6f9e40] text-white font-bold text-xs rounded-md shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 border border-[#6f9e40]"
          >
            <ArrowRight className="w-4 h-4" />
            <span>Next</span>
          </button>
        </div>

        {/* Two-Column Move Table with Badges */}
        <div className="bg-[#1e1c18] rounded-md border border-[#36332f] p-2 max-h-52 overflow-y-auto space-y-0.5 text-xs">
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
                  isCurrentRow ? 'bg-[#272522]' : 'hover:bg-[#23211e]'
                }`}
              >
                {/* Move Number */}
                <span className="col-span-2 text-gray-500 font-mono text-[11px]">
                  {turn.moveNum}.
                </span>

                {/* White Move */}
                <button
                  onClick={() => onSelectPly(whiteIdx)}
                  className={`col-span-5 flex items-center justify-between px-1.5 py-0.5 rounded cursor-pointer transition ${
                    isWhiteSelected
                      ? 'bg-[#81b64c] text-white font-bold shadow'
                      : 'text-gray-200 hover:text-white'
                  }`}
                >
                  <span>{turn.white?.san}</span>
                  {turn.white && (
                    <img
                      src={`/assets/badges/${turn.white.classification}.svg`}
                      alt={turn.white.classification}
                      className="w-3.5 h-3.5 ml-1"
                    />
                  )}
                </button>

                {/* Black Move */}
                {turn.black ? (
                  <button
                    onClick={() => onSelectPly(blackIdx)}
                    className={`col-span-5 flex items-center justify-between px-1.5 py-0.5 rounded cursor-pointer transition ${
                      isBlackSelected
                        ? 'bg-[#81b64c] text-white font-bold shadow'
                        : 'text-gray-200 hover:text-white'
                    }`}
                  >
                    <span>{turn.black.san}</span>
                    <img
                      src={`/assets/badges/${turn.black.classification}.svg`}
                      alt={turn.black.classification}
                      className="w-3.5 h-3.5 ml-1"
                    />
                  </button>
                ) : (
                  <div className="col-span-5" />
                )}
              </div>
            );
          })}
        </div>

        {/* Mini Evaluation Graph */}
        <div className="bg-[#1e1c18] rounded border border-[#36332f] p-1.5">
          <EvalGraph
            moves={moves}
            currentPly={currentPly}
            onSelectPly={onSelectPly}
          />
        </div>

        {/* Bottom 5-Button Transport Bar */}
        <div className="flex items-center justify-center gap-1 pt-1 border-t border-[#36332f]">
          <button
            onClick={onFirst}
            className="w-9 h-8 flex items-center justify-center bg-[#312e2b] hover:bg-[#3d3a36] rounded text-gray-400 hover:text-white border border-[#403d39] transition cursor-pointer"
            title="First Move"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onPrev}
            className="w-9 h-8 flex items-center justify-center bg-[#312e2b] hover:bg-[#3d3a36] rounded text-gray-400 hover:text-white border border-[#403d39] transition cursor-pointer"
            title="Previous Move"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onTogglePlay}
            className="w-9 h-8 flex items-center justify-center bg-[#312e2b] hover:bg-[#3d3a36] rounded text-gray-200 hover:text-white border border-[#403d39] transition cursor-pointer"
            title={isPlaying ? 'Pause' : 'Autoplay'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>
          <button
            onClick={onNext}
            className="w-9 h-8 flex items-center justify-center bg-[#312e2b] hover:bg-[#3d3a36] rounded text-gray-400 hover:text-white border border-[#403d39] transition cursor-pointer"
            title="Next Move"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={onLast}
            className="w-9 h-8 flex items-center justify-center bg-[#312e2b] hover:bg-[#3d3a36] rounded text-gray-400 hover:text-white border border-[#403d39] transition cursor-pointer"
            title="Last Move"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>

        {/* Footer Sub-links */}
        <div className="flex items-center justify-between pt-1 px-2 text-[11px] text-gray-500">
          <button className="flex items-center gap-1 hover:text-gray-300 transition cursor-pointer">
            <Star className="w-3.5 h-3.5" />
            <span>Skills</span>
          </button>
          <button className="flex items-center gap-1 hover:text-gray-300 transition cursor-pointer">
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};
