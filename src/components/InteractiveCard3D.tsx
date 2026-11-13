import React, { useState } from 'react';
import {
  ArrowLeftRight,
  ArrowUpCircle,
  Building2,
  Check,
  Copy,
  Eye,
  EyeOff,
  Lock,
  MessageSquare,
  Phone,
  PlusCircle,
  RotateCw,
  Signal,
  Wallet,
  Zap,
} from 'lucide-react';
import {
  LinkedBankAccount,
  SA_BANKS,
  TapPayWallet,
  formatZAR,
  maskAccountNumber,
} from '../data/tappayData';
import { ContactlessWavesSvg, EmvChipSvg, MastercardCirclesSvg } from './Icons';

interface BankCard3DProps {
  mode: 'bank' | 'wallet';
  account?: LinkedBankAccount;
  wallet?: TapPayWallet;
  privacyMask?: boolean;
  /** Mirrors the updated TapPay Home screen POS-privacy embossed PAN mode */
  restrictBalance?: boolean;
  showSwitchPill?: boolean;
  onSwitchAccount?: () => void;
  showWalletActions?: boolean;
  onWalletTopUp?: () => void;
  onWalletCashOut?: () => void;
  onWalletVasClick?: (service: string) => void;
  onTogglePrivacy?: () => void;
}

const HologramBadgeSvg: React.FC = () => (
  <svg width="38" height="30" viewBox="0 0 38 30" fill="none" aria-hidden="true">
    <rect
      x="1"
      y="1"
      width="36"
      height="28"
      rx="6"
      fill="rgba(167, 243, 208, 0.24)"
      stroke="rgba(255,255,255,0.48)"
      strokeWidth="1"
    />
    <circle cx="15" cy="15" r="7.5" fill="rgba(56, 189, 248, 0.48)" />
    <circle cx="23" cy="15" r="7.5" fill="rgba(52, 211, 153, 0.48)" />
  </svg>
);

const CardNetworkMark: React.FC<{ isVisa: boolean }> = ({ isVisa }) =>
  isVisa ? (
    <div className="text-right leading-none">
      <span className="block font-display italic font-black text-[15px] tracking-wider text-white">
        VISA
      </span>
      <span className="block text-[7.5px] font-extrabold tracking-widest text-white/75 -mt-0.5">
        DEBIT
      </span>
    </div>
  ) : (
    <MastercardCirclesSvg />
  );

export const InteractiveCard3D: React.FC<BankCard3DProps> = ({
  mode,
  account,
  wallet,
  privacyMask = false,
  restrictBalance = false,
  showSwitchPill = false,
  onSwitchAccount,
  showWalletActions = false,
  onWalletTopUp,
  onWalletCashOut,
  onWalletVasClick,
  onTogglePrivacy,
}) => {
  const [flipped, setFlipped] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [copiedPan, setCopiedPan] = useState(false);

  if (mode === 'wallet' && wallet) {
    const last4 = wallet.walletNumber.slice(-4);
    const fullVirtualPan = `5399 4820 9910 ${last4}`;
    const cardHeightClass = showWalletActions
      ? 'h-[312px] sm:h-[320px]'
      : 'h-[252px] sm:h-[264px]';

    const handleCopy = (e: React.MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard?.writeText(fullVirtualPan).catch(() => {});
      setCopiedPan(true);
      setTimeout(() => setCopiedPan(false), 2000);
    };

    return (
      <div className="perspective-1200 w-full max-w-[440px] mx-auto select-none">
        <div
          className={`relative w-full ${cardHeightClass} transition-transform duration-500 preserve-3d cursor-pointer ${
            flipped ? 'rotate-y-180' : ''
          }`}
          onClick={() => setFlipped((f) => !f)}
        >
          {/* FRONT OF @TAPPAY WALLET CARD (Matches Module 660) */}
          <div
            className="absolute inset-0 backface-hidden rounded-[22px] p-5 text-white overflow-hidden border border-emerald-300/35 shadow-xl"
            style={{
              background: 'linear-gradient(135deg, #064E3B 0%, #065F46 52%, #0A1626 100%)',
            }}
          >
            {/* CardGlassSheen */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(125deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.03) 32%, rgba(255,255,255,0) 68%, rgba(255,255,255,0.09) 100%)',
              }}
            />
            <div className="pointer-events-none absolute inset-0 rounded-[22px] border border-white/25" />
            <div className="pointer-events-none absolute -right-11 -top-16 w-48 h-48 rounded-full bg-emerald-400/16 blur-2xl" />

            <div className="relative z-10 flex flex-col justify-between h-full">
              {/* Top Row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-[11px] bg-emerald-500/22 border border-emerald-300/40 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-display font-extrabold text-[15px] tracking-tight">
                        @TapPay Wallet
                      </span>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-400/22 text-emerald-200 border border-emerald-300/30">
                        BANK-INDEPENDENT
                      </span>
                    </div>
                    <p className="text-[11px] text-white/75 font-mono-tabular mt-0.5">
                      {wallet.handle} • {wallet.walletNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/14 border border-white/28 text-[10px] font-extrabold">
                    <ContactlessWavesSvg size={12} color="#FFFFFF" />
                    {wallet.isPrimaryNfc ? 'Primary' : 'NFC'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFlipped(true);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/18 hover:bg-white/28 border border-white/35 text-[11px] font-extrabold transition cursor-pointer"
                  >
                    <RotateCw className="w-3 h-3" />
                    Flip Card
                  </button>
                </div>
              </div>

              {/* Middle Block: Embossed POS-Privacy Mode OR Unrestricted Balance */}
              <div className="my-auto py-1">
                {restrictBalance ? (
                  <div>
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <EmvChipSvg />
                      <ContactlessWavesSvg size={20} color="rgba(255,255,255,0.88)" />
                      <div className="ml-auto">
                        <MastercardCirclesSvg />
                      </div>
                    </div>
                    <p className="font-mono-tabular font-extrabold text-lg sm:text-[19.5px] tracking-[0.12em] text-white drop-shadow">
                      5399 &nbsp;48•• &nbsp;•••• &nbsp;{last4}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 text-[10.5px] text-white/75 font-semibold">
                      <Lock className="w-3 h-3 text-emerald-200 shrink-0" />
                      <span>Wallet balance restricted on Home • Tap card to flip</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-baseline justify-between gap-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-white/70 font-extrabold">
                        AVAILABLE WALLET FUNDS
                      </p>
                      <p className="font-display font-extrabold text-2xl sm:text-[27px] tracking-tight font-mono-tabular mt-0.5">
                        {privacyMask ? 'R ••••••••' : formatZAR(wallet.balance)}
                      </p>
                      <p className="text-[10.5px] text-white/75 font-mono-tabular font-semibold mt-0.5">
                        ShapID: {wallet.shapId} • Tap card to flip
                      </p>
                    </div>
                    {onTogglePrivacy && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePrivacy();
                        }}
                        className="p-2 rounded-xl bg-black/25 hover:bg-black/40 border border-white/15 text-emerald-100 transition cursor-pointer"
                      >
                        {privacyMask ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Inline Wallet VAS Strip + Top Up / Cash Out Actions (Matches Module 660) */}
              {showWalletActions ? (
                <div className="space-y-2.5" onClick={(e) => e.stopPropagation()}>
                  <div className="grid grid-cols-5 gap-1 p-1 rounded-[14px] bg-white/8 border border-white/20">
                    {[
                      { id: 'data', label: 'Data', Icon: Signal },
                      { id: 'airtime', label: 'Airtime', Icon: Phone },
                      { id: 'bundles', label: 'Bundles', Icon: MessageSquare },
                      { id: 'electricity', label: 'Power', Icon: Zap },
                      { id: 'municipal', label: 'Municipal', Icon: Building2 },
                    ].map(({ id, label, Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => onWalletVasClick?.(id)}
                        className="flex items-center justify-center gap-1 py-1.5 rounded-[10px] hover:bg-white/15 text-[10.5px] font-bold text-emerald-50 transition cursor-pointer"
                      >
                        <Icon className="w-3 h-3 text-emerald-300 shrink-0" />
                        <span className="truncate">{label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={onWalletTopUp}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-[13px] bg-[#34D399] hover:bg-emerald-300 text-[#064E3B] text-xs font-extrabold transition cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Top Up Wallet
                    </button>
                    <button
                      type="button"
                      onClick={onWalletCashOut}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-[13px] bg-white/14 hover:bg-white/22 border border-white/28 text-white text-xs font-bold transition cursor-pointer"
                    >
                      <ArrowUpCircle className="w-4 h-4" />
                      Cash Out to Bank
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between text-[11px] text-emerald-100/85 pt-2 border-t border-white/15">
                  <span className="font-mono-tabular">5399 48•• •••• {last4}</span>
                  <span className="font-semibold text-emerald-200">
                    SARB Tier-2 Cap R 25,000
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* BACK OF @TAPPAY WALLET CARD */}
          <div
            className="absolute inset-0 backface-hidden rotate-y-180 rounded-[22px] text-white overflow-hidden border border-emerald-300/35 shadow-xl flex flex-col justify-between"
            style={{
              background: 'linear-gradient(135deg, #042F2E 0%, #064E3B 52%, #060D18 100%)',
            }}
          >
            <div className="w-full h-9 bg-[#040911] border-y border-emerald-300/20 mt-4" />

            <div className="px-5 py-3 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between text-[8.5px] font-bold uppercase tracking-wider text-emerald-200/65 mb-1">
                  <span>AUTHORIZED VIRTUAL E-MONEY SIGNATURE</span>
                  <span>SECURITY CVV</span>
                </div>
                <div className="flex items-center gap-2 bg-[#D1FAE5] text-[#064E3B] rounded-md px-2.5 py-1.5">
                  <span className="font-mono-tabular text-[11.5px] font-extrabold tracking-wider italic flex-1 truncate">
                    THABO MOKOENA • @TAPPAY
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCvv((s) => !s);
                    }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white text-[#064E3B] font-mono-tabular text-xs font-extrabold cursor-pointer"
                  >
                    <span className="text-[9.5px] text-[#047857]">CVV</span>
                    <span>{showCvv ? '619' : '•••'}</span>
                    {showCvv ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-white/15">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-left cursor-pointer"
                >
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-200/75 flex items-center gap-1">
                    VIRTUAL HCE CARD NUMBER{' '}
                    {copiedPan ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-2.5 h-2.5" />}
                  </span>
                  <span className="font-mono-tabular text-[13.5px] font-extrabold tracking-wider block mt-0.5">
                    {copiedPan ? 'Copied to Clipboard!' : fullVirtualPan}
                  </span>
                </button>
                <div className="text-right">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-200/75 block">
                    VALID THRU
                  </span>
                  <span className="font-mono-tabular text-[13.5px] font-extrabold block mt-0.5">
                    11/29
                  </span>
                </div>
              </div>

              <div className="flex items-end justify-between gap-2 pt-1.5">
                <div className="text-[10px]">
                  <p className="font-bold text-white/85">
                    SARB Ring-Fenced e-Money • ShapID {wallet.shapId}
                  </p>
                  <p className="text-[9.5px] text-white/60">
                    Wallet ID {wallet.walletNumber} • Zero Bank Exposure
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFlipped(false);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/18 hover:bg-white/28 border border-white/35 text-[11px] font-extrabold text-white shrink-0 cursor-pointer"
                >
                  <RotateCw className="w-3 h-3" />
                  Flip to Front
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LINKED SA BANK CARD (Matches Module 321 BankCardView)
  const acc = account!;
  const bank = SA_BANKS[acc.bankId];
  const last4 = acc.accountNumber.slice(-4);
  const dynamicCvv = String(((7 * Number(last4) + 319) % 899) + 100);
  const formattedAcc = acc.accountNumber.replace(/(\d{4})(\d{4})(\d+)/, '$1 $2 $3');
  const embossedMaskedPan = `${bank.binPrefix}••  ••••  ${last4}`;
  const tokenPan = `${bank.binPrefix}${acc.accountNumber.slice(2, 4)}  ${acc.accountNumber.slice(4, 8)}  ${last4}`;
  const isVisa = bank.binPrefix.startsWith('4');

  const handleCopyAcc = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(acc.accountNumber).catch(() => {});
    setCopiedPan(true);
    setTimeout(() => setCopiedPan(false), 2000);
  };

  return (
    <div className="perspective-1200 w-full max-w-[440px] mx-auto select-none">
      <div
        className={`relative w-full h-[256px] sm:h-[268px] transition-transform duration-500 preserve-3d cursor-pointer ${
          flipped ? 'rotate-y-180' : ''
        }`}
        onClick={() => setFlipped((f) => !f)}
      >
        {/* FRONT OF SA BANK CARD */}
        <div
          className="absolute inset-0 backface-hidden rounded-[22px] p-5 text-white overflow-hidden shadow-xl"
          style={{
            background: `linear-gradient(135deg, ${bank.gradient[0]} 0%, ${bank.gradient[1]} 52%, ${bank.gradient[2]} 100%)`,
          }}
        >
          {/* CardGlassSheen + Decorative Orbs */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(125deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.03) 32%, rgba(255,255,255,0) 68%, rgba(255,255,255,0.09) 100%)',
            }}
          />
          <div className="pointer-events-none absolute inset-0 rounded-[22px] border border-white/28" />
          <div className="pointer-events-none absolute -top-16 -right-14 w-52 h-52 rounded-full bg-white/[0.06]" />
          <div className="pointer-events-none absolute -bottom-11 -left-8 w-32 h-32 rounded-full bg-white/[0.04]" />

          <div className="relative z-10 flex flex-col justify-between h-full">
            {/* Top Row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-[11px] bg-white/18 border border-white/22 flex items-center justify-center font-display font-extrabold text-[13px] shrink-0">
                  {bank.shortName.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h4 className="font-display font-bold text-[14.5px] leading-tight truncate">
                    {bank.name}
                  </h4>
                  <p className="text-[11px] text-white/75 font-mono-tabular mt-0.5">
                    {acc.accountType} • Branch {acc.branchCode}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFlipped(true);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/18 hover:bg-white/28 border border-white/35 text-[11px] font-extrabold shrink-0 transition cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                Flip Card
              </button>
            </div>

            {/* Middle Chip + HCE Badge + Embossed PAN / Balance */}
            <div className="my-auto">
              <div className="flex items-center gap-2.5">
                <EmvChipSvg />
                <ContactlessWavesSvg size={22} color="rgba(255,255,255,0.88)" />
                <span
                  className={`ml-auto text-[9.5px] font-mono-tabular font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                    acc.nfcEnabled
                      ? 'bg-emerald-500/28 border-emerald-200/40 text-white'
                      : 'bg-rose-500/32 border-rose-200/40 text-white'
                  }`}
                >
                  {acc.nfcEnabled ? 'HCE DIRECT READY' : 'NFC PAUSED'}
                </span>
              </div>

              {restrictBalance ? (
                <div className="mt-3">
                  <p className="font-mono-tabular font-extrabold text-lg sm:text-[20px] tracking-[0.11em] text-white drop-shadow">
                    {embossedMaskedPan}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 text-[10.5px] text-white/75 font-semibold">
                    <Lock className="w-3 h-3 text-emerald-200 shrink-0" />
                    <span>Balance hidden on Home for POS privacy • Tap card to flip</span>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex items-baseline justify-between gap-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/70 font-bold">
                      AVAILABLE BANK BALANCE
                    </p>
                    <p className="font-display font-extrabold text-2xl sm:text-[27px] tracking-tight font-mono-tabular mt-0.5">
                      {privacyMask ? 'R ••••••••' : formatZAR(acc.balance)}
                    </p>
                  </div>
                  {onTogglePrivacy && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePrivacy();
                      }}
                      className="p-2 rounded-xl bg-black/25 hover:bg-black/40 border border-white/15 text-white transition cursor-pointer"
                    >
                      {privacyMask ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Row: CARDHOLDER + VALID THRU + Switch Pill + Visa/MC */}
            <div className="flex items-end justify-between gap-2">
              <div className="flex items-end gap-4">
                <div>
                  <span className="block text-[8.5px] font-extrabold uppercase tracking-wider text-white/60">
                    CARDHOLDER
                  </span>
                  <span className="block text-[12.5px] font-extrabold tracking-wider mt-0.5">
                    {acc.accountHolder}
                  </span>
                </div>
                <div>
                  <span className="block text-[8.5px] font-extrabold uppercase tracking-wider text-white/60">
                    VALID THRU
                  </span>
                  <span className="block text-[12.5px] font-mono-tabular font-extrabold mt-0.5">
                    08/29
                  </span>
                </div>
                {!restrictBalance && (
                  <div className="hidden sm:block">
                    <span className="block text-[8.5px] font-extrabold uppercase tracking-wider text-white/60">
                      ACCOUNT
                    </span>
                    <span className="block text-[12.5px] font-mono-tabular font-extrabold mt-0.5">
                      {maskAccountNumber(acc.accountNumber)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {showSwitchPill && onSwitchAccount && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSwitchAccount();
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/18 hover:bg-white/28 border border-white/28 text-[11px] font-bold text-white transition cursor-pointer"
                  >
                    <ArrowLeftRight className="w-3 h-3" />
                    Switch
                  </button>
                )}
                <CardNetworkMark isVisa={isVisa} />
              </div>
            </div>
          </div>
        </div>

        {/* BACK OF SA BANK CARD (Matches Module 321 with Signature Lines & Hologram) */}
        <div
          className="absolute inset-0 backface-hidden rotate-y-180 rounded-[22px] text-white overflow-hidden border border-white/25 shadow-xl flex flex-col justify-between"
          style={{
            background: `linear-gradient(135deg, ${bank.gradient[2]} 0%, ${bank.gradient[1]} 55%, #060C17 100%)`,
          }}
        >
          <div className="w-full h-9 bg-[#05080F] border-y border-white/12 mt-4" />

          <div className="px-4 sm:px-5 py-2.5 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between text-[8.5px] font-bold uppercase tracking-wider text-white/55 mb-1">
                <span>AUTHORIZED SIGNATURE — NOT VALID UNLESS SIGNED</span>
                <span>SECURITY CODE</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="relative flex-1 h-9 rounded-md bg-[#E2E8F0] flex items-center justify-between px-2.5 overflow-hidden">
                  <div className="pointer-events-none absolute inset-x-0 top-3 h-2.5 border-y border-slate-400/35" />
                  <span className="relative z-10 font-mono-tabular text-xs font-bold tracking-wider italic text-slate-700 truncate">
                    {acc.accountHolder}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCvv((s) => !s);
                    }}
                    className="relative z-10 inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded text-slate-900 font-mono-tabular text-xs font-extrabold cursor-pointer"
                  >
                    <span className="text-[9.5px] text-slate-500">CVV</span>
                    <span>{showCvv ? dynamicCvv : '•••'}</span>
                    {showCvv ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
                <HologramBadgeSvg />
              </div>
            </div>

            <div className="flex items-start justify-between pt-2 border-t border-white/15">
              <button
                type="button"
                onClick={handleCopyAcc}
                className="text-left cursor-pointer"
              >
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-white/65 flex items-center gap-1">
                  SA ACCOUNT NO {copiedPan ? '• COPIED!' : '(TAP TO COPY)'}{' '}
                  {copiedPan ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                </span>
                <span className="font-mono-tabular text-[12.5px] font-extrabold block mt-0.5">
                  {formattedAcc}
                </span>
                <span className="font-mono-tabular text-[10px] text-white/60 block">
                  Token PAN: {tokenPan}
                </span>
              </button>

              <div className="text-right">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-white/65 block">
                  BRANCH / SWIFT
                </span>
                <span className="font-mono-tabular text-[12.5px] font-extrabold block mt-0.5">
                  {acc.branchCode} • {bank.swiftCode}
                </span>
                <span className="font-mono-tabular text-[10px] text-white/60 block">
                  {acc.shapId}
                </span>
              </div>
            </div>

            <div className="flex items-end justify-between gap-2">
              <div className="text-[10px]">
                <p className="font-mono-tabular font-bold text-white/80">
                  24h SA Lost Card Line: {bank.lostCardHelpline}
                </p>
                <p className="text-[9.5px] text-white/55">
                  Issued under SARB NPS • Mandate {acc.mandateRef}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFlipped(false);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/18 hover:bg-white/28 border border-white/35 text-[11px] font-extrabold text-white shrink-0 cursor-pointer"
              >
                <RotateCw className="w-3 h-3" />
                Flip to Front
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
