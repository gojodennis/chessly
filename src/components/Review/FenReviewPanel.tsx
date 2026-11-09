import React from 'react';
import { GroqFenAssessment } from '../../services/groqTutorService';
import { ArrowLeft, Sparkles, AlertTriangle, Target, RefreshCw } from 'lucide-react';

interface FenReviewPanelProps {
  fen: string;
  assessment: GroqFenAssessment | null;
  isLoading: boolean;
  onReset: () => void;
  onExit: () => void;
}

export const FenReviewPanel: React.FC<FenReviewPanelProps> = ({
  fen,
  assessment,
  isLoading,
  onReset,
  onExit,
}) => {
  return (
    <div className="w-full bg-[#272522] rounded-lg border border-[#3b3834] overflow-hidden shadow-2xl flex flex-col text-white select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#36332f] bg-[#211f1c]">
        <div className="flex items-center gap-2">
          <button
            onClick={onExit}
            className="text-gray-400 hover:text-white transition p-1 cursor-pointer"
            title="Back to Game Review"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-xs text-gray-200">Position Analysis</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] bg-[#36332f] text-[#81b64c] border border-[#44413c] px-2 py-0.5 rounded font-mono font-bold uppercase">
            Custom FEN
          </span>
          <button
            onClick={onReset}
            className="text-gray-400 hover:text-white transition p-1 cursor-pointer"
            title="Reset to Initial FEN"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Danny Coach Speech Bubble */}
        <div className="flex items-start gap-2.5">
          <div className="w-11 h-11 rounded-full bg-[#36332f] border-2 border-[#81b64c] flex items-center justify-center text-xl flex-shrink-0 shadow">
            🧔🏻‍♂️
          </div>

          <div className="relative flex-1 bg-white text-black px-3.5 py-3 rounded-xl shadow-md before:content-[''] before:absolute before:top-3.5 before:-left-2 before:w-0 before:h-0 before:border-y-6 before:border-y-transparent before:border-r-6 before:border-r-white">
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1">
                <span>Coach Danny</span>
                <span className="text-[10px] text-[#81b64c] bg-[#eef8e6] px-1 py-0.2 rounded border border-[#d2edbf]">
                  AI Tutor
                </span>
              </span>
              {assessment && (
                <span className="text-[10px] font-mono font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                  {assessment.turn} to move
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="flex items-center gap-2 text-xs text-gray-500 py-2">
                <div className="w-3.5 h-3.5 border-2 border-[#81b64c] border-t-transparent rounded-full animate-spin" />
                <span>Danny is analyzing position threats & candidate moves...</span>
              </div>
            ) : assessment ? (
              <div className="space-y-1.5 text-xs text-gray-800">
                <p className="font-semibold text-gray-900">{assessment.evaluationSummary}</p>
                <p className="text-[11px] leading-relaxed text-gray-700">{assessment.coachAdvice}</p>
              </div>
            ) : (
              <p className="text-xs text-gray-700">
                Play any legal move on the board to test ideas or explore tactical variations.
              </p>
            )}
          </div>
        </div>

        {/* Tactical Threats & Candidate Plans */}
        {assessment && (
          <div className="space-y-3 pt-2">
            {/* Key Threats */}
            {assessment.keyThreats && assessment.keyThreats.length > 0 && (
              <div className="bg-[#1e1c18] border border-[#36332f] rounded-lg p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Key Position Factors & Threats</span>
                </div>
                <ul className="list-disc list-inside text-[11px] text-gray-300 space-y-0.5">
                  {assessment.keyThreats.map((threat, idx) => (
                    <li key={idx} className="leading-snug">{threat}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Candidate Plans */}
            {assessment.recommendedPlans && assessment.recommendedPlans.length > 0 && (
              <div className="bg-[#1e1c18] border border-[#36332f] rounded-lg p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#81b64c]">
                  <Target className="w-3.5 h-3.5" />
                  <span>Recommended Ideas & Candidate Moves</span>
                </div>
                <ul className="list-disc list-inside text-[11px] text-gray-300 space-y-0.5">
                  {assessment.recommendedPlans.map((plan, idx) => (
                    <li key={idx} className="leading-snug">{plan}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Tip for Interactive Exploration */}
        <div className="bg-[#211f1c] border border-[#36332f] rounded p-2.5 text-center">
          <p className="text-[11px] text-gray-400">
            💡 The chessboard is fully interactive. Click and drag pieces to test candidate moves!
          </p>
        </div>
      </div>
    </div>
  );
};
