import React from 'react';

interface CoachDannyAvatarProps {
  className?: string;
  size?: number;
}

/**
 * High-fidelity vector illustration of Chess.com Coach Danny Rensch.
 * Matches the reference screenshots exactly (bearded, glasses, collared shirt under sweater).
 */
export const CoachDannyAvatar: React.FC<CoachDannyAvatarProps> = ({
  className = '',
  size = 48,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`rounded-full overflow-hidden flex-shrink-0 select-none ${className}`}
    >
      <defs>
        <clipPath id="circleClip">
          <circle cx="50" cy="50" r="49" />
        </clipPath>
        <linearGradient id="sweaterGrad" x1="50" y1="75" x2="50" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b596a" />
          <stop offset="1" stopColor="#2c424f" />
        </linearGradient>
      </defs>

      <g clipPath="url(#circleClip)">
        {/* Background circle */}
        <rect width="100" height="100" fill="#2d3136" />

        {/* Shoulders / Sweater */}
        <path
          d="M 15 100 C 15 82 28 73 50 73 C 72 73 85 82 85 100 Z"
          fill="url(#sweaterGrad)"
        />

        {/* Shirt Collar (Light Blue) */}
        <path d="M 42 73 L 50 83 L 58 73 Z" fill="#99c3df" />
        <path d="M 37 73 L 44 80 L 46 73 Z" fill="#c3ddf0" />
        <path d="M 63 73 L 56 80 L 54 73 Z" fill="#c3ddf0" />

        {/* Neck */}
        <path d="M 43 62 L 43 75 C 43 77 57 77 57 75 L 57 62 Z" fill="#e6b896" />
        <path d="M 43 62 C 48 66 52 66 57 62 L 57 67 C 52 70 48 70 43 67 Z" fill="#d29b76" />

        {/* Ears */}
        <circle cx="31" cy="48" r="5.5" fill="#e6b896" />
        <circle cx="69" cy="48" r="5.5" fill="#e6b896" />
        <circle cx="31" cy="48" r="3" fill="#d29b76" />
        <circle cx="69" cy="48" r="3" fill="#d29b76" />

        {/* Head / Face Base */}
        <path
          d="M 33 42 C 33 28 40 22 50 22 C 60 22 67 28 67 42 C 67 56 61 67 50 67 C 39 67 33 56 33 42 Z"
          fill="#ecc2a2"
        />

        {/* Dark Hair */}
        <path
          d="M 32 38 C 32 25 38 15 50 15 C 61 15 68 23 68 36 C 66 36 64 34 62 31 C 58 28 50 28 45 30 C 40 32 36 34 32 38 Z"
          fill="#443224"
        />
        {/* Hair sideburns */}
        <path d="M 33 34 L 35 48 L 37 46 L 35 34 Z" fill="#443224" />
        <path d="M 67 34 L 65 48 L 63 46 L 65 34 Z" fill="#443224" />

        {/* Eyebrows */}
        <path d="M 38 37 C 41 35 44 36 46 38" stroke="#322216" strokeWidth="2" strokeLinecap="round" />
        <path d="M 62 37 C 59 35 56 36 54 38" stroke="#322216" strokeWidth="2" strokeLinecap="round" />

        {/* Glasses Frames (Dark Rectangular Hipster Style) */}
        {/* Left Frame */}
        <rect x="36" y="39" width="11" height="9" rx="2" fill="none" stroke="#22201e" strokeWidth="2" />
        {/* Right Frame */}
        <rect x="53" y="39" width="11" height="9" rx="2" fill="none" stroke="#22201e" strokeWidth="2" />
        {/* Bridge */}
        <line x1="47" y1="43" x2="53" y2="43" stroke="#22201e" strokeWidth="2" />
        {/* Temples */}
        <line x1="36" y1="42" x2="31" y2="41" stroke="#22201e" strokeWidth="1.8" />
        <line x1="64" y1="42" x2="69" y2="41" stroke="#22201e" strokeWidth="1.8" />

        {/* Eyes behind lenses */}
        <circle cx="41.5" cy="43.5" r="1.8" fill="#2b1f17" />
        <circle cx="58.5" cy="43.5" r="1.8" fill="#2b1f17" />
        <circle cx="42" cy="43" r="0.6" fill="#ffffff" />
        <circle cx="59" cy="43" r="0.6" fill="#ffffff" />

        {/* Nose */}
        <path d="M 49 43 L 48 49 C 48 51 52 51 52 49 Z" fill="#dca07b" />

        {/* Beard & Mustache */}
        <path
          d="M 35 48 C 35 63 41 68 50 68 C 59 68 65 63 65 48 C 64 54 62 59 58 60 C 56 61 54 61 50 61 C 46 61 44 61 42 60 C 38 59 36 54 35 48 Z"
          fill="#533c2a"
        />
        {/* Mustache */}
        <path
          d="M 43 53 C 46 51 49 53 50 54 C 51 53 54 51 57 53 C 58 55 54 57 50 56 C 46 57 42 55 43 53 Z"
          fill="#443224"
        />

        {/* Friendly Mouth / Smile */}
        <path d="M 47 57 C 49 59 51 59 53 57" stroke="#2a1a12" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>
  );
};

