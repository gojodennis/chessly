import React from 'react';

/**
 * Clean SVG pawn avatar matching White's player avatar in the screenshots.
 */
export const PawnAvatar: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className = '',
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-lg bg-[#dedcd8] border-2 border-[#81b64c] flex items-center justify-center p-1 shadow ${className}`}
    >
      <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-sm select-none">
        {/* Stylized chess pawn */}
        <circle cx="22.5" cy="11.5" r="5" fill="#fcfcfc" stroke="#686560" strokeWidth="1.5" />
        <path
          d="M 16.5 18 C 17.5 16.5 27.5 16.5 28.5 18 C 29 20 27.5 23 25.5 24 C 27 27 30 33 32 35 C 32 37 13 37 13 35 C 15 33 18 27 19.5 24 C 17.5 23 16 20 16.5 18 Z"
          fill="#ffffff"
          stroke="#686560"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M 11 36 C 11 35 34 35 34 36 L 34 39 C 34 40 11 40 11 39 Z"
          fill="#eceae6"
          stroke="#686560"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
};

/**
 * Clean SVG Cat with hat avatar matching Black's player avatar in the screenshots.
 */
export const CatHatAvatar: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className = '',
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-lg bg-[#272522] border border-[#403d39] overflow-hidden flex items-center justify-center p-0.5 shadow ${className}`}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full select-none">
        <defs>
          <clipPath id="catClip">
            <rect width="100" height="100" rx="10" />
          </clipPath>
        </defs>
        <g clipPath="url(#catClip)">
          {/* Background */}
          <rect width="100" height="100" fill="#32302d" />

          {/* Cat Ears */}
          <polygon points="25,50 18,22 45,38" fill="#d8cbba" stroke="#504439" strokeWidth="2" />
          <polygon points="75,50 82,22 55,38" fill="#d8cbba" stroke="#504439" strokeWidth="2" />
          <polygon points="27,45 22,27 40,38" fill="#e8a8a4" />
          <polygon points="73,45 78,27 60,38" fill="#e8a8a4" />

          {/* Cat Face */}
          <ellipse cx="50" cy="62" rx="34" ry="28" fill="#e8ded2" stroke="#504439" strokeWidth="1.5" />

          {/* Cat Eyes */}
          <ellipse cx="38" cy="60" rx="5" ry="6" fill="#362f27" />
          <ellipse cx="62" cy="60" rx="5" ry="6" fill="#362f27" />
          <circle cx="39.5" cy="58.5" r="1.8" fill="#ffffff" />
          <circle cx="63.5" cy="58.5" r="1.8" fill="#ffffff" />

          {/* Nose & Mouth */}
          <polygon points="48,68 52,68 50,71" fill="#e8a8a4" />
          <path d="M 46 72 Q 50 75 54 72" fill="none" stroke="#504439" strokeWidth="1.5" strokeLinecap="round" />

          {/* Hat (Black/navy bucket hat) */}
          <path
            d="M 16 38 C 28 32 72 32 84 38 C 76 40 24 40 16 38 Z"
            fill="#22242b"
            stroke="#15171c"
            strokeWidth="1.5"
          />
          <path
            d="M 28 36 C 29 18 36 12 50 12 C 64 12 71 18 72 36 Z"
            fill="#2c2f38"
            stroke="#15171c"
            strokeWidth="1.5"
          />
          {/* Hat Ribbon */}
          <path
            d="M 28 34 C 38 31 62 31 72 34 L 72 37 C 62 34 38 34 28 37 Z"
            fill="#4f566b"
          />
        </g>
      </svg>
    </div>
  );
};

/**
 * Indonesian flag SVG (matching player newbieme1112 in screenshots).
 */
export const FlagIndonesia: React.FC<{ className?: string }> = ({ className = 'w-4 h-3' }) => (
  <svg viewBox="0 0 3 2" className={`rounded-[2px] overflow-hidden border border-black/20 ${className}`}>
    <rect width="3" height="1" fill="#e70011" />
    <rect y="1" width="3" height="1" fill="#ffffff" />
  </svg>
);

/**
 * Chess Piece SVGs for algebraic move notation (e.g. ♞ Nf3, ♗ Bf5, ♖ Rhe1, ♕ Qc3, ♔ Kd7).
 */
export const PieceGlyph: React.FC<{ piece: 'N' | 'B' | 'R' | 'Q' | 'K'; className?: string }> = ({
  piece,
  className = 'w-3.5 h-3.5 inline-block mx-0.5',
}) => {
  switch (piece) {
    case 'N':
      return (
        <svg viewBox="0 0 45 45" className={className} fill="currentColor">
          <path
            d="M 22 10 C 27 10 32 14 32 20 C 32 24 29 27 28 29 C 31 29 33 27 34 24 C 34 29 30 33 26 35 L 26 38 L 13 38 C 13 35 15 32 15 30 C 13 30 11 28 11 25 C 11 23 13 22 14 22 C 14 18 16 14 18 12 C 19 11 20 10 22 10 Z"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
      );
    case 'B':
      return (
        <svg viewBox="0 0 45 45" className={className} fill="currentColor">
          <circle cx="22.5" cy="10" r="2.5" />
          <path
            d="M 22.5 12 C 18 16 15 22 15 27 C 15 32 18 35 22.5 35 C 27 35 30 32 30 27 C 30 22 27 16 22.5 12 Z"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path d="M 16 36 L 29 36 L 29 39 L 16 39 Z" />
        </svg>
      );
    case 'R':
      return (
        <svg viewBox="0 0 45 45" className={className} fill="currentColor">
          <path
            d="M 12 14 L 12 19 L 15 19 L 15 17 L 19 17 L 19 19 L 26 19 L 26 17 L 30 17 L 30 19 L 33 19 L 33 14 L 29 14 L 29 22 L 16 22 L 16 14 Z"
          />
          <path d="M 15 22 L 15 33 L 30 33 L 30 22 Z" />
          <path d="M 12 34 L 33 34 L 33 38 L 12 38 Z" />
        </svg>
      );
    case 'Q':
      return (
        <svg viewBox="0 0 45 45" className={className} fill="currentColor">
          <circle cx="12" cy="15" r="2" />
          <circle cx="18" cy="12" r="2" />
          <circle cx="22.5" cy="11" r="2" />
          <circle cx="27" cy="12" r="2" />
          <circle cx="33" cy="15" r="2" />
          <path d="M 13 17 L 16 28 L 29 28 L 32 17 L 26 23 L 22.5 14 L 19 23 Z" />
          <path d="M 14 30 L 31 30 L 31 36 L 14 36 Z" />
        </svg>
      );
    case 'K':
      return (
        <svg viewBox="0 0 45 45" className={className} fill="currentColor">
          {/* Cross on top */}
          <path d="M 22.5 7 L 22.5 14 M 19 10.5 L 26 10.5" stroke="currentColor" strokeWidth="2" />
          <path d="M 22.5 14 C 18 16 15 21 15 26 C 15 31 18 34 22.5 34 C 27 34 30 31 30 26 C 30 21 27 16 22.5 14 Z" />
          <path d="M 13 35 L 32 35 L 32 39 L 13 39 Z" />
        </svg>
      );
    default:
      return null;
  }
};

