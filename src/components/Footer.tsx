import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Sparkles, Lock, Radio } from 'lucide-react';
import { TapPayBrandMark } from './Icons';
import { SA_BANK_LIST } from '../data/tappayData';
import { useTapPay } from '../context/TapPayContext';

export const Footer: React.FC = () => {
  const { setDownloadModalOpen } = useTapPay();

  return (
    <footer className="border-t border-[var(--tp-border)] bg-[var(--tp-bg-alt)] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        {/* Supported SA Banks Universal Branch Directory */}
        <div className="tp-glass rounded-2xl p-5 sm:p-6 mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--tp-text-secondary)]">
              Direct Open Banking &amp; DebiCheck Mandates Supported Across South Africa
            </span>
            <span className="text-xs font-mono-tabular text-emerald-500 font-semibold">
              BankservAfrica PayShap &amp; RTC Clearing
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {SA_BANK_LIST.map((b) => (
              <div
                key={b.id}
                className="px-3 py-2.5 rounded-xl tp-muted-box flex items-center gap-2.5"
              >
                <span
                  className="w-7 h-7 rounded-lg text-white font-display font-extrabold text-[11px] flex items-center justify-center shrink-0"
                  style={{ backgroundColor: b.gradient[0] }}
                >
                  {b.shortName.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[var(--tp-text)] truncate">{b.shortName}</p>
                  <p className="text-[10px] font-mono-tabular text-[var(--tp-text-muted)]">
                    Br {b.universalBranchCode}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[var(--tp-border)]">
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <TapPayBrandMark size={40} />
              <div>
                <span className="font-display font-extrabold text-xl text-[var(--tp-text)]">
                  TapPay Wallet
                </span>
                <span className="block text-xs text-[var(--tp-text-muted)]">
                  13.56 MHz Direct-to-Bank NFC &amp; Ring-Fenced ZAR e-Money
                </span>
              </div>
            </Link>
            <p className="text-sm text-[var(--tp-text-secondary)] leading-relaxed max-w-md">
              Hold your phone near any POS terminal or TapPay Wallet SoftPOS device to settle
              directly in South African Rand (ZAR). Choose between direct SA bank mandates or an
              independent SARB FICA Tier-2 ring-fenced @TapPay Wallet.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/12 text-emerald-500 border border-emerald-500/25">
                <ShieldCheck className="w-3.5 h-3.5" />
                SARB NPS Aligned
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tp-muted-box text-[var(--tp-text-secondary)]">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                POPIA &amp; FICA Verified
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tp-muted-box text-[var(--tp-text-secondary)]">
                <Radio className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                EMVCo L2 SoftPOS
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold text-sm text-[var(--tp-text)] mb-3.5">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm text-[var(--tp-text-secondary)]">
              <li>
                <Link to="/" className="hover:text-emerald-500 transition">
                  Platform Overview
                </Link>
              </li>
              <li>
                <Link to="/personal" className="hover:text-emerald-500 transition">
                  @TapPay ZAR Wallet
                </Link>
              </li>
              <li>
                <Link to="/personal" className="hover:text-emerald-500 transition">
                  7-Bank ATM Cash Send
                </Link>
              </li>
              <li>
                <Link to="/personal" className="hover:text-emerald-500 transition">
                  STS Prepaid Electricity &amp; VAS
                </Link>
              </li>
              <li>
                <Link
                  to="/simulator"
                  className="inline-flex items-center gap-1 text-emerald-500 font-semibold hover:underline"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Interactive Web Sandbox
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-sm text-[var(--tp-text)] mb-3.5">
              Merchants &amp; Rails
            </h4>
            <ul className="space-y-2.5 text-sm text-[var(--tp-text-secondary)]">
              <li>
                <Link to="/business" className="hover:text-emerald-500 transition">
                  SoftPOS Tap-on-Phone
                </Link>
              </li>
              <li>
                <Link to="/business" className="hover:text-emerald-500 transition">
                  R 18 Fee Cap Calculator
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-emerald-500 transition">
                  Transparent ZAR Pricing
                </Link>
              </li>
              <li>
                <Link to="/security" className="hover:text-emerald-500 transition">
                  UTR Proof of Payment Verifier
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setDownloadModalOpen(true)}
                  className="hover:text-emerald-500 transition cursor-pointer"
                >
                  Download iOS / Android / Huawei
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-sm text-[var(--tp-text)] mb-3.5">
              SA Headquarters
            </h4>
            <ul className="space-y-2 text-sm text-[var(--tp-text-secondary)]">
              <li className="font-semibold text-[var(--tp-text)]">140 West Street, Sandton</li>
              <li>Johannesburg, Gauteng, 2196</li>
              <li className="pt-1 font-mono-tabular text-xs">24h Fraud &amp; Mandate Desk:</li>
              <li className="font-mono-tabular font-bold text-emerald-500">0800 827 729 (TAPPAY)</li>
              <li className="text-xs text-[var(--tp-text-muted)] pt-1">
                Clearing Hours: 24/7/365 SAST Real-Time
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[var(--tp-text-muted)]">
          <p>
            © {new Date().getFullYear()} TapPay Wallet (Pty) Ltd. Authorized System Operator &amp;
            Third-Party Payment Provider (TPPP) operating under South African Reserve Bank (SARB)
            National Payment System directives and POPIA encryption standards.
          </p>
          <p className="font-mono-tabular shrink-0">
            13.56 MHz HCE • ZA-NPS-2026
          </p>
        </div>
      </div>
    </footer>
  );
};
