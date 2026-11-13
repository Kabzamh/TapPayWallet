import React from 'react';

export const ContactlessWavesSvg: React.FC<{ size?: number; className?: string; color?: string }> = ({
  size = 24,
  className = '',
  color = 'currentColor',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 28 28"
    fill="none"
    className={className}
    aria-hidden="true"
  >
    <circle cx="6.5" cy="14" r="2.1" fill={color} />
    <path
      d="M11.2 9.4C13.8 11.9 13.8 16.1 11.2 18.6"
      stroke={color}
      strokeWidth="2.3"
      strokeLinecap="round"
    />
    <path
      d="M15.8 6.2C20.2 10.5 20.2 17.5 15.8 21.8"
      stroke={color}
      strokeWidth="2.3"
      strokeLinecap="round"
      opacity="0.9"
    />
    <path
      d="M20.4 3.1C26.5 9.1 26.5 18.9 20.4 24.9"
      stroke={color}
      strokeWidth="2.3"
      strokeLinecap="round"
      opacity="0.75"
    />
  </svg>
);

export const EmvChipSvg: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    width="42"
    height="30"
    viewBox="0 0 42 30"
    fill="none"
    className={className}
    aria-hidden="true"
  >
    <rect
      x="0.75"
      y="0.75"
      width="40.5"
      height="28.5"
      rx="5.5"
      fill="url(#emvGold)"
      stroke="rgba(255,255,255,0.45)"
      strokeWidth="1"
    />
    <path
      d="M14 1V29M28 1V29M1 10.5H14M28 10.5H41M1 19.5H14M28 19.5H41M14 15H28"
      stroke="rgba(120, 83, 14, 0.52)"
      strokeWidth="1.1"
    />
    <defs>
      <linearGradient id="emvGold" x1="0" y1="0" x2="42" y2="30" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
  </svg>
);

export const MastercardCirclesSvg: React.FC = () => (
  <svg width="38" height="24" viewBox="0 0 38 24" fill="none" aria-hidden="true">
    <circle cx="14" cy="12" r="10" fill="#EB001B" fillOpacity="0.9" />
    <circle cx="24" cy="12" r="10" fill="#F79E1B" fillOpacity="0.88" />
  </svg>
);

export const TapPayBrandMark: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <div
    style={{ width: size, height: size }}
    className="rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-800 flex items-center justify-center shadow-lg shadow-emerald-500/25 border border-white/25 shrink-0"
  >
    <ContactlessWavesSvg size={Math.round(size * 0.6)} color="#FFFFFF" />
  </div>
);
