import React, { useState } from 'react';
import { GameReviewResult } from '../../engine/analysisEngine';
import { MoveClassification } from '../../engine/moveClassifier';
import { GameMetadata } from '../../engine/pgnParser';
import { estimateGameRating } from '../../engine/ratingEstimator';
import { EvalGraph } from '../Board/EvalGraph';
import { Heart, Search, ChevronDown, ChevronUp, Lock, Star, Check, ThumbsUp } from 'lucide-react';

interface ReviewOverviewProps {
  analysis: GameReviewResult;
  metadata: GameMetadata;
  onStartReview: () => void;
  onSelectPly: (ply: number) => void;
  currentPly: number;
}

export const ReviewOverview: React.FC<ReviewOverviewProps> = ({
  analysis,
  metadata,
  onStartReview,
  onSelectPly,
  currentPly,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const whiteRating = estimateGameRating(
    analysis.whiteAccuracy,
    analysis.counts.white.blunder
  );
  const blackRating = estimateGameRating(
    analysis.blackAccuracy,
    analysis.counts.black.blunder
  );

  const breakdownRows = [
    { key: 'great', label: 'Great', badge: 'great.svg' },
    { key: 'best', label: 'Best', badge: 'best.svg' },
    { key: 'excellent', label: 'Excellent', badge: 'excellent.svg' },
    { key: 'good', label: 'Good', badge: 'good.svg' },
    { key: 'book', label: 'Book', badge: 'book.svg' },
    { key: 'inaccuracy', label: 'Inaccuracy', badge: 'inaccuracy.svg' },
    { key: 'mistake', label: 'Mistake', badge: 'mistake.svg' },
    { key: 'miss', label: 'Miss', badge: 'miss.svg' },
    { key: 'blunder', label: 'Blunder', badge: 'blunder.svg' },
  ] as const;

  const visibleRows = isExpanded ? breakdownRows : breakdownRows.filter(r => 
    r.key === 'great' || r.key === 'best' || r.key === 'excellent' || r.key === 'mistake' || r.key === 'miss' || r.key === 'blunder'
  );

  return (
    <div className="w-full bg-[#272522] rounded-lg border border-[#3b3834] overflow-hidden shadow-2xl flex flex-col text-white select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#36332f] bg-[#211f1c]">
        <button className="text-gray-400 hover:text-white transition">
          <Heart className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5 font-bold text-sm tracking-wide text-gray-200">
          <div className="w-4 h-4 rounded-full bg-[#81b64c] flex items-center justify-center text-[10px] text-white">
            ★
          </div>
          <span>Game Review</span>
        </div>

        <button className="text-gray-400 hover:text-white transition">
          <Search className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto max-h-[640px]">
        {/* Coach Speech Bubble */}
        <div className="flex items-start gap-3">
          {/* Coach Avatar (Danny Style) */}
          <div className="w-12 h-12 rounded-full bg-[#36332f] border-2 border-[#81b64c] flex items-center justify-center text-2xl flex-shrink-0 shadow">
            🧔🏻‍♂️
          </div>
          {/* Speech Bubble */}
          <div className="relative flex-1 bg-white text-black text-xs font-medium px-4 py-3 rounded-xl shadow-md before:content-[''] before:absolute before:top-4 before:-left-2 before:w-0 before:h-0 before:border-y-8 before:border-y-transparent before:border-r-8 before:border-r-white">
            Let's review some key moments from your game.
          </div>
        </div>

        {/* Evaluation Graph */}
        <div className="bg-[#1e1c18] rounded-md border border-[#36332f] p-2 overflow-hidden shadow-inner">
          <EvalGraph
            moves={analysis.moves}
            currentPly={currentPly}
            onSelectPly={onSelectPly}
          />
        </div>

        {/* Players & Accuracy Grid */}
        <div className="grid grid-cols-12 items-center gap-2 pt-1 border-t border-[#36332f]">
          <div className="col-span-4 text-xs font-semibold text-gray-400">Players</div>
          <div className="col-span-4 flex flex-col items-center">
            <div className="w-10 h-10 rounded-md bg-[#312e2b] border-2 border-[#81b64c] flex items-center justify-center text-xl mb-1 shadow">
              ♟️
            </div>
            <span className="text-[11px] font-bold text-gray-200 truncate w-full text-center">
              {metadata.white.name}
            </span>
          </div>
          <div className="col-span-4 flex flex-col items-center">
            <div className="w-10 h-10 rounded-md bg-[#312e2b] border border-[#403d39] flex items-center justify-center text-xl mb-1 shadow">
              🐱
            </div>
            <span className="text-[11px] font-bold text-gray-200 truncate w-full text-center">
              {metadata.black.name}
            </span>
          </div>
        </div>

        {/* Accuracy Scores */}
        <div className="grid grid-cols-12 items-center gap-2">
          <div className="col-span-4 text-xs font-semibold text-gray-400">Accuracy</div>
          <div className="col-span-4 flex justify-center">
            <div className="w-16 py-1 bg-white text-black font-extrabold text-sm rounded shadow text-center font-mono">
              {analysis.whiteAccuracy.toFixed(1)}
            </div>
          </div>
          <div className="col-span-4 flex justify-center">
            <div className="w-16 py-1 bg-white text-black font-extrabold text-sm rounded shadow text-center font-mono">
              {analysis.blackAccuracy.toFixed(1)}
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="grid grid-cols-12 items-center gap-2">
          <div className="col-span-4 text-xs font-semibold text-gray-400">Skills</div>
          <div className="col-span-8 flex justify-end items-center gap-1.5 pr-2">
            <div className="w-5 h-5 rounded-full bg-[#3582ba] flex items-center justify-center text-white text-[11px]">
              ★
            </div>
            <span className="text-xs font-bold text-[#4596d1]">+2</span>
          </div>
        </div>

        {/* Move Breakdown Matrix */}
        <div className="pt-2 border-t border-[#36332f] space-y-1.5">
          {visibleRows.map((r) => {
            const whiteCount = analysis.counts.white[r.key as MoveClassification] || 0;
            const blackCount = analysis.counts.black[r.key as MoveClassification] || 0;

            return (
              <div
                key={r.key}
                className="grid grid-cols-12 items-center text-xs py-0.5 text-gray-300"
              >
                <span className="col-span-3 text-gray-400 font-semibold">{r.label}</span>
                <span className="col-span-3 text-center font-mono font-bold">{whiteCount}</span>
                <div className="col-span-3 flex justify-center">
                  <img src={`/assets/badges/${r.badge}`} alt={r.label} className="w-4 h-4 drop-shadow" />
                </div>
                <span className="col-span-3 text-center font-mono font-bold">{blackCount}</span>
              </div>
            );
          })}

          {/* Expand/Collapse Toggle */}
          <div className="flex justify-center pt-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-white transition p-1"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Game Rating Estimate */}
        <div className="grid grid-cols-12 items-center gap-2 pt-2 border-t border-[#36332f]">
          <div className="col-span-4 text-xs font-semibold text-gray-400">Game Rating</div>
          <div className="col-span-4 flex justify-center">
            <div className="w-16 py-1 bg-white text-black font-extrabold text-sm rounded shadow text-center font-mono">
              {whiteRating}
            </div>
          </div>
          <div className="col-span-4 flex justify-center">
            <div className="w-16 py-1 bg-white text-black font-extrabold text-sm rounded shadow text-center font-mono">
              {blackRating}
            </div>
          </div>
        </div>

        {/* Advanced Stats */}
        <div className="pt-2 border-t border-[#36332f] space-y-2">
          <div className="text-xs font-bold text-gray-300">Advanced Stats</div>
          <div className="space-y-1 text-xs text-gray-400">
            <div className="flex justify-between items-center py-0.5">
              <span>Opening</span>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">★</span>
                <Lock className="w-3 h-3 text-gray-500" />
              </div>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span>Tactics</span>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <Lock className="w-3 h-3 text-gray-500" />
              </div>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span>Strategy</span>
              <div className="flex items-center gap-2">
                <span className="text-blue-400">👍</span>
                <Lock className="w-3 h-3 text-gray-500" />
              </div>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span>Endgame</span>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <Lock className="w-3 h-3 text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Area */}
        <div className="pt-3 border-t border-[#36332f] space-y-2">
          <button
            onClick={() => alert(`Starting new ${metadata.timeControl} game`)}
            className="w-full py-2 bg-[#312e2b] hover:bg-[#3d3a36] text-gray-300 font-bold rounded-lg text-xs border border-[#403d39] transition cursor-pointer"
          >
            New {metadata.timeControl}
          </button>

          {/* Big Green Start Review Button */}
          <button
            onClick={onStartReview}
            className="w-full py-3 bg-[#81b64c] hover:bg-[#96c85e] active:bg-[#6f9e40] text-white font-extrabold text-sm rounded-lg shadow-lg tracking-wide transition cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <span>Start Review</span>
          </button>
        </div>
      </div>
    </div>
  );
};
