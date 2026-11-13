import React from 'react';
import { Check, ShieldCheck } from 'lucide-react';
import { ContactlessWavesSvg } from './Icons';

export type NfcStage = 'idle' | 'scanning' | 'authenticating' | 'settling' | 'approved';

interface NfcRadarVisualizerProps {
  stage: NfcStage;
  mode?: 'pay' | 'receive';
  size?: number;
}

export const NfcRadarVisualizer: React.FC<NfcRadarVisualizerProps> = ({
  stage,
  mode = 'pay',
  size = 164,
}) => {
  const isApproved = stage === 'approved';
  const isReceive = mode === 'receive' && !isApproved;

  const ringBorder = isApproved
    ? 'border-emerald-400 bg-emerald-500/10'
    : isReceive
      ? 'border-sky-400 bg-sky-500/10'
      : 'border-emerald-400 bg-emerald-500/10';

  const coreGradient = isApproved
    ? 'from-emerald-400 via-emerald-500 to-emerald-700 shadow-emerald-500/40'
    : isReceive
      ? 'from-sky-400 via-sky-500 to-blue-700 shadow-sky-500/40'
      : 'from-emerald-400 via-emerald-500 to-teal-700 shadow-emerald-500/40';

  const coreSize = Math.round(size * 0.52);

  return (
    <div
      style={{ width: size, height: size }}
      className="relative flex items-center justify-center mx-auto select-none"
    >
      {!isApproved && (
        <>
          <div
            className={`absolute inset-0 rounded-full border-2 ${ringBorder} animate-nfc-ring-1`}
          />
          <div
            className={`absolute inset-0 rounded-full border-2 ${ringBorder} animate-nfc-ring-2`}
          />
          <div
            className={`absolute inset-0 rounded-full border-2 ${ringBorder} animate-nfc-ring-3`}
          />
        </>
      )}

      <div
        style={{ width: coreSize, height: coreSize }}
        className={`relative z-10 rounded-full bg-gradient-to-br ${coreGradient} shadow-2xl border border-white/30 flex flex-col items-center justify-center transition-transform duration-300 ${
          stage === 'scanning' || stage === 'authenticating' ? 'scale-105' : 'scale-100'
        }`}
      >
        {isApproved ? (
          <Check className="w-9 h-9 text-white stroke-[2.75]" />
        ) : stage === 'authenticating' || stage === 'settling' ? (
          <ShieldCheck className="w-8 h-8 text-white" />
        ) : (
          <ContactlessWavesSvg size={34} color="#FFFFFF" />
        )}
        <span className="text-[9.5px] font-mono-tabular font-extrabold uppercase tracking-wider text-white/95 mt-1">
          {isApproved ? 'SETTLED' : '13.56 MHz'}
        </span>
      </div>
    </div>
  );
};
