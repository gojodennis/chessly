import React, { useState } from 'react';
import { Copy, Check, Eye } from 'lucide-react';

interface FenBarProps {
  fen: string;
}

export const FenBar: React.FC<FenBarProps> = ({ fen }) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fen);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  return (
    <div className="w-full max-w-[560px] bg-[#211f1c] border border-[#3b3834] rounded-lg px-3 py-1.5 flex flex-col gap-1.5 text-xs text-gray-300 shadow">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#81b64c] bg-[#2c2925] px-1.5 py-0.5 rounded border border-[#403d39] flex-shrink-0">
            FEN
          </span>
          <span
            className="font-mono text-[11px] text-gray-400 truncate select-all cursor-pointer hover:text-gray-200 transition"
            title={fen}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {fen}
          </span>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-[#34322e] text-gray-400 hover:text-gray-200 rounded transition cursor-pointer"
            title={isExpanded ? 'Collapse FEN' : 'View Full FEN'}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCopy}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
              copied
                ? 'bg-[#81b64c] text-white shadow'
                : 'bg-[#2b2824] hover:bg-[#383530] text-gray-200 border border-[#403d39]'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-white" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-gray-400" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="pt-1.5 border-t border-[#36332f]">
          <input
            type="text"
            readOnly
            value={fen}
            onClick={e => (e.target as HTMLInputElement).select()}
            className="w-full bg-[#181715] border border-[#3b3834] rounded px-2 py-1 font-mono text-[11px] text-gray-200 select-all focus:outline-none focus:border-[#81b64c]"
          />
        </div>
      )}
    </div>
  );
};
