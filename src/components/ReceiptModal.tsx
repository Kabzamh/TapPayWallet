import React, { useState } from 'react';
import {
  ArrowDownLeft,
  CheckCircle2,
  Copy,
  Share2,
  ShieldCheck,
  Wifi,
  X,
  Zap,
} from 'lucide-react';
import { useTapPay } from '../context/TapPayContext';
import { formatFullReceiptTimestamp, formatZAR } from '../data/tappayData';

export const ReceiptModal: React.FC = () => {
  const { activeReceipt, setActiveReceipt } = useTapPay();
  const [toast, setToast] = useState<string | null>(null);

  if (!activeReceipt) return null;

  const isCredit = activeReceipt.direction === 'in';

  const copyText = (text: string, msg: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const buildPopSummary = () =>
    [
      'TAPPAY WALLET SOUTH AFRICA — OFFICIAL PROOF OF PAYMENT (POP)',
      `Status: ${activeReceipt.status} (Real-Time BankservAfrica Clearing)`,
      `Direction: ${isCredit ? 'RECEIVED (CREDIT)' : 'PAID (DEBIT)'}`,
      `Counterparty: ${activeReceipt.title}`,
      `Amount: ${formatZAR(activeReceipt.amount)}`,
      `Clearing Fee: ${activeReceipt.fee === 0 ? 'R 0.00 (Zero Fee Direct)' : formatZAR(activeReceipt.fee)}`,
      `Channel: ${activeReceipt.channel}`,
      `Account / Wallet: ${activeReceipt.bankShortName} (${activeReceipt.maskedAccount})`,
      ...(activeReceipt.vasToken ? [`Token / Voucher: ${activeReceipt.vasToken}`] : []),
      ...(activeReceipt.vasMeta ? [`Details: ${activeReceipt.vasMeta}`] : []),
      `UTR Clearing Ref: ${activeReceipt.utrReference}`,
      `Timestamp: ${formatFullReceiptTimestamp(activeReceipt.timestamp)}`,
    ].join('\n');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1320]/42 backdrop-blur-md"
      onClick={() => setActiveReceipt(null)}
    >
      <div
        className="w-full max-w-lg rounded-3xl tp-glass-elevated p-6 sm:p-7 relative max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 mb-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-500 text-xs font-extrabold tracking-wide border border-emerald-500/25">
            <ShieldCheck className="w-4 h-4" />
            OFFICIAL PROOF OF PAYMENT (POP)
          </span>
          <button
            type="button"
            onClick={() => setActiveReceipt(null)}
            className="p-1.5 rounded-xl tp-muted-box text-[var(--tp-text-secondary)] hover:text-[var(--tp-text)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Amount */}
        <div className="text-center pb-5 border-b border-[var(--tp-border)]">
          <div
            className={`w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center ${
              isCredit
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-500'
                : 'bg-sky-500/15 text-sky-600 dark:text-sky-400'
            }`}
          >
            {isCredit ? <ArrowDownLeft className="w-7 h-7" /> : <Wifi className="w-7 h-7" />}
          </div>
          <p
            className={`font-display font-extrabold text-3xl font-mono-tabular ${
              isCredit ? 'text-emerald-500' : 'text-[var(--tp-text)]'
            }`}
          >
            {formatZAR(activeReceipt.amount, activeReceipt.direction)}
          </p>
          <h3 className="font-display font-bold text-lg text-[var(--tp-text)] mt-1">
            {activeReceipt.title}
          </h3>
          <p className="text-xs text-[var(--tp-text-secondary)] mt-0.5">
            {activeReceipt.subtitle}
          </p>
          <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full bg-emerald-500/12 text-emerald-500 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Settled Instantly via BankservAfrica
          </div>
        </div>

        {/* Optional STS Electricity Token or Cardless ATM Cash Voucher */}
        {activeReceipt.vasToken && (
          <button
            type="button"
            onClick={() =>
              copyText(activeReceipt.vasToken!, 'Copied token / voucher to clipboard!')
            }
            className="w-full text-left mt-4 p-4 rounded-2xl bg-emerald-500/12 border border-emerald-500/35 hover:bg-emerald-500/18 transition cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-500">
              <Zap className="w-3.5 h-3.5" />
              {activeReceipt.channel === 'e-Wallet Cash Send'
                ? 'Instant ATM Cash Voucher & Secret PIN'
                : '20-Digit STS Prepaid Electricity Token'}
            </div>
            <p className="font-mono-tabular font-extrabold text-base sm:text-lg text-[var(--tp-text)] mt-1 tracking-wider">
              {activeReceipt.vasToken}
            </p>
            {activeReceipt.vasMeta && (
              <p className="text-xs text-[var(--tp-text-secondary)] mt-1">
                {activeReceipt.vasMeta} • Click box to copy
              </p>
            )}
          </button>
        )}

        {/* Structured Details */}
        <div className="mt-4 rounded-2xl tp-muted-box divide-y divide-[var(--tp-border)] text-xs sm:text-sm">
          <div className="flex justify-between gap-4 px-4 py-2.5">
            <span className="text-[var(--tp-text-secondary)]">Date &amp; SAST Time</span>
            <span className="font-semibold text-[var(--tp-text)] text-right">
              {formatFullReceiptTimestamp(activeReceipt.timestamp)}
            </span>
          </div>
          <div className="flex justify-between gap-4 px-4 py-2.5">
            <span className="text-[var(--tp-text-secondary)]">Payment Rail</span>
            <span className="font-semibold text-[var(--tp-text)]">{activeReceipt.channel}</span>
          </div>
          <div className="flex justify-between gap-4 px-4 py-2.5">
            <span className="text-[var(--tp-text-secondary)]">
              {isCredit ? 'Credited Wallet / Bank' : 'Debited Wallet / Bank'}
            </span>
            <span className="font-semibold text-[var(--tp-text)] font-mono-tabular">
              {activeReceipt.bankShortName} ({activeReceipt.maskedAccount})
            </span>
          </div>
          <div className="flex justify-between gap-4 px-4 py-2.5">
            <span className="text-[var(--tp-text-secondary)]">
              {isCredit ? 'Originating Bank' : 'Acquiring Bank / Switch'}
            </span>
            <span className="font-semibold text-[var(--tp-text)] text-right">
              {activeReceipt.counterpartyBank}
            </span>
          </div>
          <div className="flex justify-between gap-4 px-4 py-2.5">
            <span className="text-[var(--tp-text-secondary)]">Cryptogram / Token</span>
            <span className="font-mono-tabular text-xs font-semibold text-[var(--tp-text)] text-right">
              {activeReceipt.cardOrDeviceHint}
            </span>
          </div>
          <div className="flex justify-between gap-4 px-4 py-2.5">
            <span className="text-[var(--tp-text-secondary)]">Clearing Fee</span>
            <span className="font-mono-tabular font-bold text-emerald-500">
              {activeReceipt.fee === 0
                ? 'R 0.00 (Zero Fee Direct)'
                : formatZAR(activeReceipt.fee)}
            </span>
          </div>
          <div className="flex justify-between gap-4 px-4 py-2.5">
            <span className="text-[var(--tp-text-secondary)]">UTR Clearing Reference</span>
            <span className="font-mono-tabular font-bold text-[var(--tp-text)]">
              {activeReceipt.utrReference}
            </span>
          </div>
        </div>

        {toast && (
          <div className="mt-4 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-500 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toast}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-5">
          <button
            type="button"
            onClick={() =>
              copyText(
                activeReceipt.utrReference,
                `Copied ${activeReceipt.utrReference} to clipboard`
              )
            }
            className="flex items-center justify-center gap-2 py-3 rounded-xl tp-muted-box hover:border-emerald-500/40 font-bold text-sm text-[var(--tp-text)] transition cursor-pointer"
          >
            <Copy className="w-4 h-4" />
            Copy UTR
          </button>
          <button
            type="button"
            onClick={() =>
              copyText(buildPopSummary(), 'Official Proof of Payment copied & ready to share!')
            }
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            Copy Official POP
          </button>
        </div>
      </div>
    </div>
  );
};
