import React from 'react';
import { Clock, Settings } from 'lucide-react';

interface PlayerBannerProps {
  name: string;
  rating: string;
  avatarIcon?: string;
  flag?: string;
  time?: string;
  isTop?: boolean;
}

export const PlayerBanner: React.FC<PlayerBannerProps> = ({
  name,
  rating,
  avatarIcon,
  flag = '🌐',
  time = '3:00',
  isTop = false,
}) => {
  return (
    <div className="w-full flex items-center justify-between py-1.5 px-2 bg-[#211f1c] rounded border border-[#312e2b] text-xs select-none">
      {/* Player info */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded bg-[#312e2b] border border-[#403d39] flex items-center justify-center text-sm overflow-hidden flex-shrink-0">
          {avatarIcon || (isTop ? '♟️' : '🐱')}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-gray-200 hover:underline cursor-pointer">{name}</span>
          <span className="text-gray-400 font-mono text-[11px]">({rating})</span>
          <span className="text-xs" title="Country flag">{flag}</span>
        </div>
      </div>

      {/* Clock timer */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 px-2.5 py-1 bg-[#2b2824] border border-[#3b3834] rounded font-mono font-bold text-gray-200 text-xs">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          <span>{time}</span>
        </div>
        {isTop && (
          <button className="text-gray-400 hover:text-gray-200 transition p-0.5">
            <Settings className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

