import React from 'react';
import { AnalyzedMove } from '../../engine/analysisEngine';
import { Eye, EyeOff, Sparkles, Lightbulb } from 'lucide-react';

interface TutorCardProps {
  move: AnalyzedMove | null;
  showTutorArrow: boolean;
  onToggleArrow: () => void;
}

export const TutorCard: React.FC<TutorCardProps> = ({
  move,
  showTutorArrow,
  onToggleArrow,
}) => {
  if (!move) {
    return (
      <div className="w-full bg-[#272522] p-4 rounded-lg border border-[#3b3834] shadow flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-[#312e2b] border border-[#403d39] flex items-center justify-center text-xl flex-shrink-0">
          🎓
        </div>
        <div className="space-y-0.5">
          <div className="text-sm font-bold text-white flex items-center gap-1.5">
            <span>Chess Tutor</span>
            <span className="text-[10px] bg-[#81b64c] text-white px-1.5 py-0.5 rounded font-semibold">
              Ready
            </span>
          </div>
          <p className="text-xs text-gray-300">
            Use the Next button or arrow keys to step through the game. The tutor will guide you through each move.
          </p>
        </div>
      </div>
    );
  }

  const { tutorFeedback, classification, turn, moveNumber, san, bestMoveSan, winPctAfter } = move;
  const isError =
    classification === 'inaccuracy' ||
    classification === 'mistake' ||
    classification === 'blunder' ||
    classification === 'miss';
  const isSpecial = classification === 'brilliant' || classification === 'great';

  return (
    <div className="w-full bg-[#272522] p-4 rounded-lg border border-[#3b3834] shadow-lg space-y-3 select-none">
      {/* Header: Coach Info & Move Badge */}
      <div className="flex items-start justify-between gap-3 border-b border-[#36332f] pb-3">
        <div className="flex items-center gap-3">
          {/* Coach Avatar */}
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-[#36332f] border-2 border-[#81b64c] flex items-center justify-center text-xl shadow flex-shrink-0">
              🎓
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#81b64c] rounded-full flex items-center justify-center text-[10px] text-white font-black shadow">
              ✓
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Chess Tutor</span>
              <span className="text-xs font-mono text-gray-400">
                Move {moveNumber}
                {turn === 'w' ? '.' : '...'}
                <strong className="text-white ml-0.5">{san}</strong>
              </span>
            </div>
            <div className="text-[11px] text-gray-400">
              Evaluation: <span className="text-gray-200 font-semibold">{Math.round(winPctAfter)}% Win Chance</span>
            </div>
          </div>
        </div>

        {/* Move Classification Badge */}
        <div className="flex items-center gap-1.5 bg-[#1e1c18] px-2.5 py-1 rounded-full border border-[#36332f]">
          <img
            src={`/assets/badges/${classification}.svg`}
            alt={classification}
            className="w-4 h-4 drop-shadow"
          />
          <span className="text-xs font-bold text-white capitalize">{classification}</span>
        </div>
      </div>

      {/* Tutor Feedback Content */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-white">
          {isSpecial && <Sparkles className="w-3.5 h-3.5 text-[#1baca6]" />}
          {isError && <Lightbulb className="w-3.5 h-3.5 text-[#e58f2a]" />}
          <span>{tutorFeedback.title}</span>
        </div>

        <p className="text-xs text-gray-200 leading-relaxed font-medium">
          {tutorFeedback.summary}
        </p>

        <p className="text-xs text-gray-400 leading-relaxed">
          {tutorFeedback.advice}
        </p>
      </div>

      {/* Suggested Move Callout (When Applicable) */}
      {(isError || isSpecial) && bestMoveSan && bestMoveSan !== san && (
        <div className="pt-2 border-t border-[#36332f] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-400">Tutor Recommendation:</span>
            <span className="font-bold text-[#81b64c] bg-[#1e1c18] px-2 py-0.5 rounded border border-[#36332f]">
              {bestMoveSan}
            </span>
          </div>

          {/* Toggle Suggested Move Arrow */}
          <button
            onClick={onToggleArrow}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#312e2b] hover:bg-[#3d3a36] text-gray-300 hover:text-white rounded text-xs font-medium border border-[#403d39] transition cursor-pointer self-start sm:self-auto"
            title="Toggle engine suggestion arrow on board"
          >
            {showTutorArrow ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-[#81b64c]" />
                <span>Hide Suggestion Arrow</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Show Suggestion Arrow</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

