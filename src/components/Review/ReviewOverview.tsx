import React, { useState } from 'react';
import { GameReviewResult } from '../../engine/analysisEngine';
import { MoveClassification } from '../../engine/moveClassifier';
import { GameMetadata } from '../../engine/pgnParser';
import { estimateGameRating } from '../../engine/ratingEstimator';
import { EvalGraph } from '../Board/EvalGraph';
import { CoachDannyAvatar } from './CoachDannyAvatar';
import { PawnAvatar, CatHatAvatar } from '../Board/PlayerAvatars';
import { Heart, Search, ChevronDown, ChevronUp, Lock, BarChart2 } from 'lucide-react';

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
    { key: 'mistake', label: 'Mistake', badge: 'mistake.svg' },
    { key: 'miss', label: 'Miss', badge: 'miss.svg' },
    { key: 'blunder', label: 'Blunder', badge: 'blunder.svg' },
  ] as const;

  const visibleRows = isExpanded ? breakdownRows : breakdownRows.slice(0, 5);

  return (
    <div className="w-full bg-[#262421] rounded-xl border border-[#3b3834] overflow-hidden shadow-2xl flex flex-col text-white select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#36332f] bg-[#211f1c]">
        <button
          className="text-gray-400 hover:text-white transition p-1 cursor-pointer"
          title="Favorite"
        >
          <Heart className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5 font-bold text-sm tracking-wide text-gray-200">
          <div className="w-4 h-4 rounded-full bg-[#81b64c] flex items-center justify-center text-[10px] text-white">
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

      <div className="p-3.5 space-y-3.5 overflow-y-auto max-h-[700px] scrollbar-thin scrollbar-thumb-[#403d39]">
        {/* Coach Speech Bubble (Matches Danny in Image 1) */}
        <div className="flex items-start gap-2.5">
          <CoachDannyAvatar size={46} className="border-2 border-[#81b64c] shadow" />

          {/* Speech Bubble */}
          <div className="relative flex-1 bg-white text-[#1c1c1c] text-xs font-medium px-3.5 py-3 rounded-xl shadow-md before:content-[''] before:absolute before:top-3.5 before:-left-2 before:w-0 before:h-0 before:border-y-6 before:border-y-transparent before:border-r-6 before:border-r-white">
            Let's review some key moments from your game.
          </div>
        </div>

        {/* Evaluation Graph (Directly under coach bubble, matching Image 1) */}
        <EvalGraph
          moves={analysis.moves}
          currentPly={currentPly}
          onSelectPly={onSelectPly}
          showScrubber={false}
          height={52}
        />

        {/* Players Section */}
        <div className="pt-1 border-t border-[#36332f] space-y-2">
          <div className="grid grid-cols-12 items-center">
            <span className="col-span-4 text-xs font-semibold text-gray-400">Players</span>
            <div className="col-span-4 flex flex-col items-center">
              <span className="text-[11px] font-bold text-gray-200 truncate w-full text-center mb-1">
                {metadata.white.name}
              </span>
              <PawnAvatar size={42} />
            </div>
            <div className="col-span-4 flex flex-col items-center">
              <span className="text-[11px] font-bold text-gray-200 truncate w-full text-center mb-1">
                {metadata.black.name}
              </span>
              <CatHatAvatar size={42} />
            </div>
          </div>

          {/* Accuracy Row (White in white box, Black in dark box) */}
          <div className="grid grid-cols-12 items-center">
            <span className="col-span-4 text-xs font-semibold text-gray-400">Accuracy</span>
            <div className="col-span-4 flex justify-center">
              <div className="w-16 py-1 bg-white text-black font-extrabold text-sm rounded shadow text-center font-mono">
                {analysis.whiteAccuracy.toFixed(1)}
              </div>
            </div>
            <div className="col-span-4 flex justify-center">
              <div className="w-16 py-1 bg-[#312e2b] border border-[#44403b] text-white font-extrabold text-sm rounded shadow text-center font-mono">
                {analysis.blackAccuracy.toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        {/* Skills Row */}
        <div className="grid grid-cols-12 items-center pt-1 border-t border-[#36332f]">
          <span className="col-span-4 text-xs font-semibold text-gray-400">Skills</span>
          <div className="col-span-8 flex justify-end items-center gap-1.5 pr-2">
            <div className="w-5 h-5 rounded-full bg-[#3582ba] flex items-center justify-center text-white text-[10px]">
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
                <span className="col-span-4 text-gray-400 font-semibold">{r.label}</span>
                <span className="col-span-2 text-center font-mono font-bold text-gray-200">
                  {whiteCount}
                </span>
                <div className="col-span-4 flex justify-center">
                  <img
                    src={`/assets/badges/${r.badge}`}
                    alt={r.label}
                    className="w-4 h-4 drop-shadow"
                  />
                </div>
                <span className="col-span-2 text-center font-mono font-bold text-gray-200">
                  {blackCount}
                </span>
              </div>
            );
          })}

          {/* Expand/Collapse Toggle */}
          <div className="flex justify-center pt-0.5">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-white transition p-1 cursor-pointer"
              title={isExpanded ? 'Collapse' : 'Show All'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Game Rating Estimate (Matches Image 2) */}
        <div className="grid grid-cols-12 items-center gap-2 pt-2 border-t border-[#36332f]">
          <div className="col-span-4 text-xs font-semibold text-gray-400">Game Rating</div>
          <div className="col-span-4 flex justify-center">
            <div className="w-16 py-1 bg-white text-black font-extrabold text-sm rounded shadow text-center font-mono">
              {whiteRating}
            </div>
          </div>
          <div className="col-span-4 flex justify-center">
            <div className="w-16 py-1 bg-[#312e2b] border border-[#44403b] text-white font-extrabold text-sm rounded shadow text-center font-mono">
              {blackRating}
            </div>
          </div>
        </div>

        {/* Advanced Stats (Matches Image 2) */}
        <div className="pt-2 border-t border-[#36332f] space-y-1.5">
          <div className="text-xs font-bold text-gray-200">Advanced Stats</div>
          <div className="space-y-1 text-xs text-gray-400">
            {/* Opening */}
            <div className="flex justify-between items-center py-0.5">
              <span>Opening</span>
              <div className="flex items-center gap-10">
                <div className="w-4 h-4 rounded-full bg-[#81b64c] flex items-center justify-center text-[9px] text-white">
                  ★
                </div>
                <Lock className="w-3 h-3 text-gray-500" />
              </div>
            </div>

            {/* Tactics */}
            <div className="flex justify-between items-center py-0.5">
              <span>Tactics</span>
              <div className="flex items-center gap-10">
                <div className="w-4 h-4 rounded-full bg-[#81b64c] flex items-center justify-center text-[10px] text-white font-bold">
                  ✓
                </div>
                <Lock className="w-3 h-3 text-gray-500" />
              </div>
            </div>

            {/* Strategy */}
            <div className="flex justify-between items-center py-0.5">
              <span>Strategy</span>
              <div className="flex items-center gap-10">
                <div className="w-4 h-4 rounded-full bg-[#81b64c] flex items-center justify-center text-[10px] text-white font-bold">
                  ✓
                </div>
                <Lock className="w-3 h-3 text-gray-500" />
              </div>
            </div>

            {/* Endgame */}
            <div className="flex justify-between items-center py-0.5">
              <span>Endgame</span>
              <div className="flex items-center gap-10">
                <div className="w-4 h-4 rounded-full bg-[#81b64c] flex items-center justify-center text-[10px] text-white font-bold">
                  ✓
                </div>
                <Lock className="w-3 h-3 text-gray-500" />
              </div>
            </div>

            {/* View All Stats Link */}
            <div className="pt-1.5 flex justify-center">
              <button className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 hover:text-gray-200 transition cursor-pointer">
                <BarChart2 className="w-3.5 h-3.5" />
                <span>View All Stats</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Actions (New 3 min & Big Green Start Review) */}
        <div className="pt-2 border-t border-[#36332f] space-y-2">
          <button
            onClick={() => alert(`Starting new ${metadata.timeControl || '3 min'} game`)}
            className="w-full py-2 bg-[#312e2b] hover:bg-[#3d3a36] text-gray-300 font-bold rounded-lg text-xs border border-[#403d39] transition cursor-pointer"
          >
            New {metadata.timeControl ? `${Math.round(parseInt(metadata.timeControl) / 60)} min` : '3 min'}
          </button>

          {/* Big Green Start Review Button */}
          <button
            onClick={onStartReview}
            className="w-full py-3 bg-[#81b64c] hover:bg-[#8fc558] active:bg-[#6f9e40] text-white font-extrabold text-sm rounded-lg shadow-lg tracking-wide transition cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2 border-b-2 border-[#639235]"
          >
            <span>Start Review</span>
          </button>
        </div>
      </div>
    </div>
  );
};
