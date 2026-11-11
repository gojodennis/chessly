import React from 'react';
import { Clock, Settings } from 'lucide-react';
import { PawnAvatar, CatHatAvatar, FlagIndonesia } from './PlayerAvatars';

interface PlayerBannerProps {
  name: string;
  rating: string;
  isTop?: boolean;
  time?: string;
}

export const PlayerBanner: React.FC<PlayerBannerProps> = ({
  name,
  rating,
  isTop = false,
  time = '3:00',
}) => {
  return (
    <div className="w-full flex items-center justify-between py-1.5 px-2 bg-transparent text-xs select-none">
      {/* Player info */}
      <div className="flex items-center gap-2">
        {isTop ? (
          <PawnAvatar size={28} className="rounded-md" />
        ) : (
          <CatHatAvatar size={28} className="rounded-md" />
        )}
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-gray-100 hover:underline cursor-pointer text-xs">
            {name}
          </span>
          <span className="text-gray-400 font-mono text-[11px]">({rating})</span>
          {isTop ? (
            <FlagIndonesia className="w-3.5 h-2.5 ml-0.5" />
          ) : (
            <div className="w-3.5 h-3.5 rounded-sm bg-[#457abb] flex items-center justify-center text-[9px] text-white font-bold">
              ♟
            </div>
          )}
        </div>
      </div>

      {/* Clock timer */}
      <div className="flex items-center gap-2">
        {isTop ? (
          // Top clock (White rounded box in screenshot)
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white text-black rounded font-mono font-bold text-xs shadow-sm">
            <Clock className="w-3.5 h-3.5 text-gray-700" />
            <span>{time}</span>
          </div>
        ) : (
          // Bottom clock (Dark rounded box in screenshot)
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#262421] text-gray-200 border border-[#3b3834] rounded font-mono font-bold text-xs shadow-sm">
            <span>{time}</span>
          </div>
        )}

        {isTop && (
          <button className="text-gray-400 hover:text-gray-200 transition p-0.5 cursor-pointer">
            <Settings className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
