import React from 'react';

/**
 * Animated POS Robot Mascot for StudentHub Smart Cloud POS
 * Features animated blinking eyes, pulsing glowing antenna, and waving arm.
 */
export default function PosBot({ size = 'md', className = '', waving = true }) {
  const sizeMap = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40',
  };

  const dim = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative inline-flex items-center justify-center ${dim} ${className}`}>
      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xl"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="bodyGrad" x1="20" y1="50" x2="140" y2="150" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0B3B60" />
            <stop offset="1" stopColor="#062033" />
          </linearGradient>
          <linearGradient id="screenGrad" x1="45" y1="65" x2="115" y2="105" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0a1926" />
            <stop offset="1" stopColor="#0f2b3e" />
          </linearGradient>
          <linearGradient id="antennaGrad" x1="80" y1="10" x2="80" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#43B02A" />
            <stop offset="1" stopColor="#2e801c" />
          </linearGradient>
          <linearGradient id="earGrad" x1="20" y1="65" x2="35" y2="95" gradientUnits="userSpaceOnUse">
            <stop stopColor="#43B02A" />
            <stop offset="1" stopColor="#0B3B60" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <style>{`
          @keyframes botWave {
            0%, 100% { transform: rotate(0deg); }
            20% { transform: rotate(-28deg); }
            40% { transform: rotate(12deg); }
            60% { transform: rotate(-24deg); }
            80% { transform: rotate(8deg); }
          }
          @keyframes eyeBlink {
            0%, 90%, 100% { transform: scaleY(1); }
            95% { transform: scaleY(0.1); }
          }
          @keyframes antennaPulse {
            0%, 100% { opacity: 0.6; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
          }
          @keyframes botFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-6px); }
          }
          .bot-float {
            animation: botFloat 3s ease-in-out infinite;
          }
          .bot-wave-arm {
            transform-origin: 125px 95px;
            animation: ${waving ? 'botWave 2s ease-in-out infinite' : 'none'};
          }
          .bot-eye {
            transform-origin: center;
            animation: eyeBlink 3.5s infinite;
          }
          .antenna-light {
            transform-origin: 80px 18px;
            animation: antennaPulse 1.8s infinite;
          }
        `}</style>

        <g className="bot-float">
          {/* Antenna */}
          <line x1="80" y1="40" x2="80" y2="24" stroke="#43B02A" strokeWidth="4" strokeLinecap="round" />
          <circle cx="80" cy="18" r="8" fill="#43B02A" className="antenna-light" filter="url(#glow)" />
          <circle cx="80" cy="18" r="4" fill="#ffffff" />

          {/* Left Ear */}
          <rect x="22" y="70" width="10" height="24" rx="5" fill="#43B02A" />
          <rect x="20" y="74" width="4" height="16" rx="2" fill="#0B3B60" />

          {/* Right Ear */}
          <rect x="128" y="70" width="10" height="24" rx="5" fill="#43B02A" />
          <rect x="136" y="74" width="4" height="16" rx="2" fill="#0B3B60" />

          {/* Head & Body Chassis */}
          <rect x="30" y="40" width="100" height="85" rx="28" fill="url(#bodyGrad)" stroke="#1a4d75" strokeWidth="2.5" />

          {/* Inner Face Screen */}
          <rect x="42" y="55" width="76" height="54" rx="18" fill="url(#screenGrad)" stroke="#43B02A" strokeWidth="1.5" />

          {/* Eyes (Blinking Animation) */}
          <g className="bot-eye">
            {/* Left Eye */}
            <circle cx="64" cy="78" r="9" fill="#43B02A" filter="url(#glow)" />
            <circle cx="64" cy="78" r="6" fill="#ffffff" />
            <circle cx="66" cy="76" r="2.5" fill="#43B02A" />

            {/* Right Eye */}
            <circle cx="96" cy="78" r="9" fill="#43B02A" filter="url(#glow)" />
            <circle cx="96" cy="78" r="6" fill="#ffffff" />
            <circle cx="98" cy="76" r="2.5" fill="#43B02A" />
          </g>

          {/* Cute Smile / Mouth */}
          <path
            d="M 70 93 Q 80 100 90 93"
            stroke="#43B02A"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Cheeks Blush */}
          <circle cx="52" cy="88" r="4" fill="#43B02A" opacity="0.4" />
          <circle cx="108" cy="88" r="4" fill="#43B02A" opacity="0.4" />

          {/* Left Resting Arm */}
          <path
            d="M 32 95 Q 24 110 32 125"
            stroke="#0B3B60"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="32" cy="125" r="6" fill="#43B02A" />

          {/* Right Waving Arm */}
          <g className="bot-wave-arm">
            <path
              d="M 128 95 Q 146 80 144 60"
              stroke="#0B3B60"
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
            />
            {/* Hand */}
            <circle cx="144" cy="58" r="7" fill="#43B02A" />
            {/* Waving spark */}
            <path d="M 148 48 L 152 44" stroke="#43B02A" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 154 55 L 160 55" stroke="#43B02A" strokeWidth="2.5" strokeLinecap="round" />
          </g>

          {/* Chest POS Badge */}
          <g transform="translate(68, 114)">
            <rect x="0" y="0" width="24" height="7" rx="3.5" fill="#43B02A" />
            <text x="12" y="5.5" fontSize="4.5" fontWeight="bold" fill="#ffffff" textAnchor="middle">
              POS
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}
