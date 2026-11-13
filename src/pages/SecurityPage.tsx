import React, { useState } from 'react';
import {
  CheckCircle2,
  EyeOff,
  FileSearch,
  Fingerprint,
  Lock,
  Radio,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useTapPay } from '../context/TapPayContext';
import { formatFullReceiptTimestamp, formatZAR } from '../data/tappayData';

export const SecurityPage: React.FC = () => {
  const { transactions, defaultAccount, nfcSettings, updateNfcSettings, setActiveReceipt } =
    useTapPay();
  const [utrQuery, setUtrQuery] = useState(transactions[0]?.utrReference || 'ZA-TAP-20261112-482910');
  const [copiedShap, setCopiedShap] = useState(false);

  const matchedTx = transactions.find(
    (t) => t.utrReference.toLowerCase() === utrQuery.trim().toLowerCase()
  );

  const validFormat = /^ZA-(TAP|POS|SHP|WLT|ATM|VAS)-\d{8}-\d{6}$/i.test(utrQuery.trim());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-18">
      {/* Hero */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/12 border border-emerald-500/30 text-emerald-500 text-xs font-extrabold">
            <ShieldCheck className="w-3.5 h-3.5" />
            CRYPTOGRAPHIC TOKENIZATION &amp; SARB GOVERNANCE
          </span>

          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-[var(--tp-text)] tracking-tight leading-tight">
            Zero Raw Account Numbers Over the Air. Ever.
          </h1>

          <p className="text-base sm:text-lg text-[var(--tp-text-secondary)] leading-relaxed">
            TapPay Wallet combines hardware-backed ISO/IEC 14443-4 Host Card Emulation, EMVCo L2
            Tap-on-Phone attestation, DebiCheck mandate verification, and ring-fenced trust
            segregation to protect every Rand across South Africa.
          </p>
        </div>

        {/* Mirrors TapPay App ProfileScreen Frosted Light-Glass Security Card (Module 676) */}
        <div className="lg:col-span-5 tp-glass-elevated rounded-[24px] p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-[var(--tp-primary)] text-white font-display font-extrabold text-base flex items-center justify-center shrink-0">
              TM
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display font-extrabold text-base text-[var(--tp-text)]">
                  Thabo Mokoena
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--tp-primary-soft)] text-[var(--tp-primary)] text-[10.5px] font-extrabold">
                  <ShieldCheck className="w-3 h-3" />
                  FICA Verified
                </span>
              </div>
              <p className="text-xs font-mono-tabular text-[var(--tp-text-secondary)] mt-0.5">
                SA ID: 940814 •••• 087 • +27 82 491 7732
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(defaultAccount.shapId).catch(() => {});
              setCopiedShap(true);
              setTimeout(() => setCopiedShap(false), 2200);
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-[13px] tp-muted-box text-xs cursor-pointer"
          >
            <span className="inline-flex items-center gap-1.5 font-bold text-[var(--tp-text)] font-mono-tabular">
              <Zap className="w-4 h-4 text-[var(--tp-primary)]" />
              Active ShapID: {defaultAccount.shapId}
            </span>
            <span className="font-extrabold text-[var(--tp-primary)]">
              {copiedShap ? 'Copied!' : 'Copy'}
            </span>
          </button>

          <div className="divide-y divide-[var(--tp-border-strong)] pt-1">
            <div className="py-2.5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-[var(--tp-text)]">Biometric NFC Passkey</p>
                <p className="text-[11px] text-[var(--tp-text-secondary)]">
                  Approve taps above R {nfcSettings.pinlessLimit} via FaceID / Fingerprint
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  updateNfcSettings({ biometricsEnabled: !nfcSettings.biometricsEnabled })
                }
                className={`px-3 py-1 rounded-full text-[11px] font-extrabold cursor-pointer ${
                  nfcSettings.biometricsEnabled
                    ? 'bg-[var(--tp-primary)] text-white'
                    : 'tp-muted-box text-[var(--tp-text-secondary)]'
                }`}
              >
                {nfcSettings.biometricsEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="py-2.5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-[var(--tp-text)]">Privacy Balance Mask</p>
                <p className="text-[11px] text-[var(--tp-text-secondary)]">
                  Hide Rand balances in public spaces
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateNfcSettings({ hideBalances: !nfcSettings.hideBalances })}
                className={`px-3 py-1 rounded-full text-[11px] font-extrabold cursor-pointer ${
                  nfcSettings.hideBalances
                    ? 'bg-[var(--tp-primary)] text-white'
                    : 'tp-muted-box text-[var(--tp-text-secondary)]'
                }`}
              >
                {nfcSettings.hideBalances ? 'MASKED' : 'VISIBLE'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Live Regulatory & Rail Status Telemetry */}
      <section className="tp-glass rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-[var(--tp-text)]">
              Live NFC &amp; South African Regulatory Rail Telemetry
            </h2>
            <p className="text-xs text-[var(--tp-text-secondary)] mt-0.5">
              Continuous cryptographic health check across national clearing switches
            </p>
          </div>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-500 text-xs font-mono-tabular font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            ALL RAILS 99.99% ONLINE (SAST)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              protocol: 'NFC Controller Protocol',
              spec: 'ISO/IEC 14443-4 Type A/B HCE',
              latency: '14 ms RF Handshake',
            },
            {
              protocol: 'SoftPOS Tap-on-Phone Kernel',
              spec: 'EMVCo L2 Contactless Certified',
              latency: 'PCI CPoC / MPoC Attested',
            },
            {
              protocol: 'Real-Time Interbank Switch',
              spec: 'BankservAfrica PayShap & RTC',
              latency: '640 ms Median Settlement',
            },
            {
              protocol: 'Direct Bank Authorization',
              spec: 'SARB DebiCheck Authenticated Mandate',
              latency: 'FICA ID Cross-Verified',
            },
            {
              protocol: 'e-Money Trust Segregation',
              spec: 'SARB Tier-2 Ring-Fenced Guardian Account',
              latency: '100% Liquid ZAR Reserve',
            },
            {
              protocol: 'Data & Balance Privacy',
              spec: 'POPIA AES-256-GCM + POS Masking',
              latency: 'Zero Plaintext PAN Storage',
            },
          ].map((rail) => (
            <div key={rail.protocol} className="p-4 rounded-2xl tp-muted-box space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--tp-text-muted)]">
                  {rail.protocol}
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="font-display font-bold text-sm text-[var(--tp-text)]">{rail.spec}</p>
              <p className="text-xs font-mono-tabular text-emerald-500">{rail.latency}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive UTR Proof of Payment Verifier */}
      <section className="tp-glass-elevated rounded-[32px] p-6 sm:p-10 space-y-6">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-500">
            <FileSearch className="w-4 h-4" />
            Anti-Fraud POP Verification Tool
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--tp-text)] mt-1">
            Verify Any TapPay Wallet UTR Clearing Reference Instantly
          </h2>
          <p className="text-sm text-[var(--tp-text-secondary)] mt-1">
            Merchants and landlords can paste or click any TapPay Wallet UTR reference (
            <span className="font-mono-tabular">ZA-TAP / ZA-POS / ZA-SHP / ZA-VAS / ZA-ATM</span>)
            to confirm authentic real-time settlement and eliminate fake SMS proof-of-payment fraud.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {transactions.slice(0, 5).map((tx) => (
            <button
              key={tx.id}
              type="button"
              onClick={() => setUtrQuery(tx.utrReference)}
              className={`px-3 py-1.5 rounded-xl font-mono-tabular text-xs font-bold border transition cursor-pointer ${
                utrQuery === tx.utrReference
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'tp-muted-box text-[var(--tp-text-secondary)] hover:text-[var(--tp-text)]'
              }`}
            >
              {tx.utrReference}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={utrQuery}
            onChange={(e) => setUtrQuery(e.target.value)}
            placeholder="ZA-TAP-20261112-482910"
            className="flex-1 px-4 py-3 rounded-2xl tp-muted-box font-mono-tabular text-sm font-bold text-[var(--tp-text)]"
          />
          {matchedTx && (
            <button
              type="button"
              onClick={() => setActiveReceipt(matchedTx)}
              className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-display font-bold text-sm transition cursor-pointer"
            >
              Inspect Official POP Certificate
            </button>
          )}
        </div>

        {matchedTx ? (
          <div className="p-5 rounded-2xl bg-emerald-500/12 border border-emerald-500/35 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs sm:text-sm">
            <div>
              <span className="text-[var(--tp-text-secondary)] block text-xs">Clearing Status</span>
              <span className="font-bold text-emerald-500 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-4 h-4" /> Settled &amp; Irrevocable
              </span>
            </div>
            <div>
              <span className="text-[var(--tp-text-secondary)] block text-xs">Counterparty</span>
              <span className="font-bold text-[var(--tp-text)] block mt-0.5">{matchedTx.title}</span>
            </div>
            <div>
              <span className="text-[var(--tp-text-secondary)] block text-xs">Cleared Amount</span>
              <span className="font-mono-tabular font-extrabold text-[var(--tp-text)] block mt-0.5">
                {formatZAR(matchedTx.amount)} ({matchedTx.channel})
              </span>
            </div>
            <div>
              <span className="text-[var(--tp-text-secondary)] block text-xs">SAST Timestamp</span>
              <span className="font-semibold text-[var(--tp-text)] block mt-0.5">
                {formatFullReceiptTimestamp(matchedTx.timestamp)}
              </span>
            </div>
          </div>
        ) : validFormat ? (
          <div className="p-4 rounded-2xl tp-muted-box text-xs text-emerald-500 font-semibold">
            ✓ Valid South African ZA-NPS UTR syntax verified. Ready for BankservAfrica archive lookup.
          </div>
        ) : (
          <div className="p-4 rounded-2xl tp-muted-box text-xs text-[var(--tp-text-secondary)]">
            Enter a UTR formatted like <span className="font-mono-tabular">ZA-TAP-YYYYMMDD-XXXXXX</span>.
          </div>
        )}
      </section>

      {/* 4 Security Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            icon: Radio,
            title: 'Single-Use 13.56 MHz Cryptograms',
            desc: 'Each contactless tap generates an ephemeral EMV/HCE cryptogram valid for one transaction only — rendering replay skimming impossible.',
          },
          {
            icon: Fingerprint,
            title: 'Biometric Passkey + 5-Digit PIN',
            desc: 'Taps above your custom R 250 / R 500 / R 1,000 threshold require FaceID, Fingerprint, or your encrypted 5-digit SA Banking PIN.',
          },
          {
            icon: EyeOff,
            title: 'POS Balance Privacy Shield',
            desc: 'Balances on the Home card are automatically masked in checkout queues so bystanders never see your Rand savings.',
          },
          {
            icon: Lock,
            title: 'Instant Per-Card NFC Kill-Switch',
            desc: 'Pause or resume the contactless HCE token on your @TapPay Wallet or any individual linked bank in one tap without cancelling your plastic card.',
          },
        ].map((p) => {
          const Icon = p.icon;
          return (
            <div key={p.title} className="tp-glass rounded-3xl p-6 space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-base text-[var(--tp-text)]">{p.title}</h3>
              <p className="text-xs sm:text-sm text-[var(--tp-text-secondary)] leading-relaxed">
                {p.desc}
              </p>
            </div>
          );
        })}
      </section>
    </div>
  );
};
