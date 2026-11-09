import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';

interface ReviewControlsProps {
  canGoPrev: boolean;
  canGoNext: boolean;
  onFirst: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset?: () => void;
  currentPly: number;
  totalPlies: number;
}

export const ReviewControls: React.FC<ReviewControlsProps> = ({
  canGoPrev,
  canGoNext,
  onFirst,
  onPrev,
  onNext,
  onLast,
  isPlaying,
  onTogglePlay,
  onReset,
  currentPly,
  totalPlies,
}) => {
  return (
    <div className="w-full bg-[#272522] p-2 sm:p-2.5 rounded-lg border border-[#3b3834] shadow-lg flex flex-col gap-2 select-none">
      {/* Primary Chess.com Navigation Bar */}
      <div className="flex items-stretch gap-1.5 h-12">
        {/* First Move Button */}
        <button
          onClick={onFirst}
          disabled={!canGoPrev}
          title="First Move (Home / ↑)"
          className="w-12 flex items-center justify-center bg-[#312e2b] hover:bg-[#3d3a36] active:bg-[#252320] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed text-gray-300 hover:text-white rounded-md border border-[#403d39] transition-all cursor-pointer"
        >
          <ChevronsLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Previous Move Button */}
        <button
          onClick={onPrev}
          disabled={!canGoPrev}
          title="Previous Move (←)"
          className="flex-1 flex items-center justify-center gap-1.5 bg-[#312e2b] hover:bg-[#3d3a36] active:bg-[#252320] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed text-gray-200 hover:text-white rounded-md border border-[#403d39] transition-all cursor-pointer font-semibold text-sm"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Next Move Button (Primary Emphasized Button) */}
        <button
          onClick={onNext}
          disabled={!canGoNext}
          title="Next Move (→)"
          className="flex-[1.4] flex items-center justify-center gap-2 bg-[#81b64c] hover:bg-[#96c85e] active:bg-[#6f9e40] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-md font-bold text-sm tracking-wide shadow-md transition-all cursor-pointer border border-[#6f9e40]"
        >
          <span>Next</span>
          <ChevronRight className="w-5 h-5 stroke-[3]" />
        </button>

        {/* Last Move Button */}
        <button
          onClick={onLast}
          disabled={!canGoNext}
          title="Last Move (End / ↓)"
          className="w-12 flex items-center justify-center bg-[#312e2b] hover:bg-[#3d3a36] active:bg-[#252320] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed text-gray-300 hover:text-white rounded-md border border-[#403d39] transition-all cursor-pointer"
        >
          <ChevronsRight className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Sub-toolbar: Autoplay, Ply counter, Reset */}
      <div className="flex items-center justify-between pt-1 px-1 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          {/* Autoplay Play/Pause */}
          <button
            onClick={onTogglePlay}
            disabled={totalPlies === 0}
            className={`flex items-center gap-1.5 px-3 py-1 rounded transition cursor-pointer font-medium text-xs ${
              isPlaying
                ? 'bg-[#ca3431] text-white hover:bg-[#dc3532]'
                : 'bg-[#312e2b] hover:bg-[#3d3a36] text-gray-300 hover:text-white border border-[#403d39]'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Autoplay</span>
              </>
            )}
          </button>

          {onReset && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#312e2b] hover:bg-[#3d3a36] text-gray-400 hover:text-gray-200 rounded border border-[#403d39] transition cursor-pointer"
              title="Reset Position"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Ply progress indicator & keyboard tip */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          {totalPlies > 0 ? (
            <span className="text-gray-300">
              <strong className="text-white">{Math.max(0, currentPly + 1)}</strong> / {totalPlies}
            </span>
          ) : (
            <span>Ready</span>
          )}
          <span className="hidden sm:inline text-gray-500 font-sans text-[10px]">
            (Use <kbd className="px-1 py-0.5 bg-[#1e1c18] border border-[#3b3834] rounded text-gray-400">←</kbd>{' '}
            <kbd className="px-1 py-0.5 bg-[#1e1c18] border border-[#3b3834] rounded text-gray-400">→</kbd> keys)
          </span>
        </div>
      </div>
    </div>
  );
};

