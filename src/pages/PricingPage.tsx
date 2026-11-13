import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, CheckCircle2, Sparkles } from 'lucide-react';
import { formatZAR } from '../data/tappayData';

type EstimatorChannel =
  | 'nfc_pay'
  | 'softpos_peer'
  | 'softpos_card'
  | 'payshap'
  | 'atm_cash'
  | 'electricity'
  | 'municipal'
  | 'wallet_load';

export const PricingPage: React.FC = () => {
  const [channel, setChannel] = useState<EstimatorChannel>('softpos_card');
  const [amount, setAmount] = useState<number>(1250);

  const feeComparison = useMemo(() => {
    const amt = Math.max(0, amount);
    switch (channel) {
      case 'nfc_pay':
        return {
          walletFee: 0,
          bankFee: 0,
          note: 'Zero consumer fee on all 13.56 MHz contactless POS & peer taps.',
        };
      case 'softpos_peer':
        return {
          walletFee: 0,
          bankFee: 0,
          note: 'Receiving from another TapPay HCE phone or @TapPay Wallet is 100% free.',
        };
      case 'softpos_card': {
        const f = Math.min(18, Number((amt * 0.0045).toFixed(2)));
        return {
          walletFee: f,
          bankFee: f,
          note: '0.45% acquiring fee on physical Visa/Mastercard/Apple Pay — strictly capped at R 18.00!',
        };
      }
      case 'payshap':
        return {
          walletFee: amt <= 500 ? 0 : 1.5,
          bankFee: amt <= 100 ? 0 : 1.5,
          note: '@TapPay Wallet gives you FREE PayShap transfers all the way up to R 500 (flat R 1.50 above).',
        };
      case 'atm_cash':
        return {
          walletFee: 7.5,
          bankFee: amt <= 1000 ? 9.5 : 15.5,
          note: 'Flat R 7.50 cardless ATM voucher fee from @TapPay Wallet across all 7 SA ATM networks.',
        };
      case 'electricity':
        return {
          walletFee: 0,
          bankFee: 0,
          note: 'Zero convenience surcharge on 20-digit STS prepaid electricity, airtime & data.',
        };
      case 'municipal':
        return {
          walletFee: 0,
          bankFee: 2.0,
          note: 'Pay COJ, Cape Town, eThekwini, Tshwane & Ekurhuleni municipal bills FREE via @TapPay Wallet.',
        };
      case 'wallet_load':
        return {
          walletFee: 0,
          bankFee: 0,
          note: 'Instant RTC bank top-ups, Pick n Pay/Boxer cash loads & wallet-to-bank payouts are R 0.00.',
        };
    }
  }, [channel, amount]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Header */}
      <section className="max-w-3xl space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/12 border border-emerald-500/30 text-emerald-500 text-xs font-extrabold">
          RADICAL FEE TRANSPARENCY (ZAR)
        </span>
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-[var(--tp-text)] tracking-tight">
          R 0 Monthly Fees. No Hidden Bank Markups.
        </h1>
        <p className="text-base sm:text-lg text-[var(--tp-text-secondary)]">
          Every clearing fee in TapPay Wallet is published upfront and verified on your official
          Proof of Payment (POP) receipt.
        </p>
      </section>

      {/* Interactive Fee Estimator */}
      <section className="tp-glass-elevated rounded-[32px] p-6 sm:p-10">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-500 mb-3">
          <Calculator className="w-4 h-4" />
          Interactive Live ZAR Fee Estimator
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--tp-text-secondary)] mb-2">
                Select Transaction Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'nfc_pay', label: 'NFC Tap to Pay' },
                  { id: 'softpos_card', label: 'SoftPOS Card' },
                  { id: 'softpos_peer', label: 'SoftPOS Peer' },
                  { id: 'payshap', label: 'PayShap Send' },
                  { id: 'atm_cash', label: 'ATM Cash Send' },
                  { id: 'electricity', label: 'STS Power / VAS' },
                  { id: 'municipal', label: 'Municipal Bill' },
                  { id: 'wallet_load', label: 'Wallet Top-Up' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setChannel(opt.id as EstimatorChannel)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      channel === opt.id
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'tp-muted-box text-[var(--tp-text)] hover:border-emerald-500/40'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--tp-text-secondary)] mb-2">
                Transaction Amount (ZAR)
              </label>
              <div className="flex flex-wrap gap-2">
                {[85, 350, 750, 2500, 8000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className={`px-3.5 py-2 rounded-xl font-mono-tabular text-xs font-bold border cursor-pointer ${
                      amount === preset
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500'
                        : 'tp-muted-box text-[var(--tp-text-secondary)]'
                    }`}
                  >
                    R {preset.toLocaleString()}
                  </button>
                ))}
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                  className="w-36 px-3.5 py-2 rounded-xl tp-muted-box font-mono-tabular text-sm font-bold text-[var(--tp-text)]"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-emerald-500/12 border border-emerald-500/35">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-500">
                Via @TapPay Wallet
              </span>
              <p className="font-display font-extrabold text-3xl font-mono-tabular text-[var(--tp-text)] mt-2">
                {formatZAR(feeComparison.walletFee)}
              </p>
              <p className="text-xs text-[var(--tp-text-secondary)] mt-1">Clearing Fee</p>
            </div>

            <div className="p-5 rounded-2xl tp-muted-box">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--tp-text-secondary)]">
                Via Linked SA Bank
              </span>
              <p className="font-display font-extrabold text-3xl font-mono-tabular text-[var(--tp-text)] mt-2">
                {formatZAR(feeComparison.bankFee)}
              </p>
              <p className="text-xs text-[var(--tp-text-secondary)] mt-1">Clearing Fee</p>
            </div>

            <div className="sm:col-span-2 p-3.5 rounded-xl tp-muted-box text-xs text-[var(--tp-text-secondary)]">
              {feeComparison.note}
            </div>
          </div>
        </div>
      </section>

      {/* Complete Rail Fee Table */}
      <section className="tp-glass rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-[var(--tp-border)]">
          <h2 className="font-display font-extrabold text-xl sm:text-2xl text-[var(--tp-text)]">
            Complete TapPay Wallet ZAR Fee Schedule
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="tp-muted-box text-xs uppercase tracking-wider text-[var(--tp-text-secondary)]">
              <tr>
                <th className="px-6 py-4 font-bold">Payment Rail / Service</th>
                <th className="px-6 py-4 font-bold">@TapPay ZAR Wallet</th>
                <th className="px-6 py-4 font-bold">Linked SA Bank Mandate</th>
                <th className="px-6 py-4 font-bold">Settlement Speed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--tp-border)]">
              {[
                ['Monthly Account / App Fee', 'R 0.00', 'R 0.00', 'Always Free'],
                ['NFC Tap to Pay at Any POS', 'R 0.00', 'R 0.00', 'Instant (< 850 ms)'],
                ['SoftPOS Receive (TapPay Peer Phone)', 'R 0.00', 'R 0.00', 'Instant RTC Credit'],
                ['SoftPOS Receive (Visa / MC / Watch)', '0.45% (Max R 18.00)', '0.45% (Max R 18.00)', 'Instant RTC Credit'],
                ['PayShap Instant (ShapID)', 'FREE ≤ R 500 (R 1.50 > R 500)', 'FREE ≤ R 100 (R 1.50 > R 100)', 'Instant (Max R 50,000)'],
                ['Wallet Top-Up (RTC Bank or Retail Cash)', 'R 0.00', 'R 0.00', 'Instant'],
                ['Wallet Cash-Out to Linked SA Bank', 'R 0.00', 'R 0.00', 'Instant RTC'],
                ['Cardless ATM Cash Send (7 SA Networks)', 'R 7.50 flat', 'R 9.50 (≤ R1k) / R 15.50 (> R1k)', 'Instant 4-Digit PIN'],
                ['Prepaid Airtime, Data & 20-Digit STS Power', 'R 0.00', 'R 0.00', 'Instant On-Screen'],
                ['Metro Municipal Bills (COJ, CCT, eThekwini)', 'R 0.00', 'R 2.00', 'Same-Day Clearing'],
              ].map(([service, wFee, bFee, speed]) => (
                <tr key={service} className="hover:bg-emerald-500/[0.04] transition">
                  <td className="px-6 py-4 font-semibold text-[var(--tp-text)]">{service}</td>
                  <td className="px-6 py-4 font-mono-tabular font-bold text-emerald-500">{wFee}</td>
                  <td className="px-6 py-4 font-mono-tabular text-[var(--tp-text)]">{bFee}</td>
                  <td className="px-6 py-4 text-xs text-[var(--tp-text-secondary)]">{speed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3 Tier Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            tier: '@TapPay ZAR Wallet',
            sub: '100% Bank-Independent FICA Tier-2',
            price: 'R 0 / mo',
            highlights: [
              'Up to R 25,000 ring-fenced e-Money balance',
              'Deposit cash at Pick n Pay, Boxer, 1Voucher & OTT',
              'Virtual HCE Contactless Mastercard included',
              'Free PayShap transfers up to R 500',
            ],
          },
          {
            tier: 'TapPay Wallet + Linked Bank',
            sub: 'Multi-Bank HCE & Open Banking',
            price: 'R 0 / mo',
            featured: true,
            highlights: [
              'Link FNB, Capitec, Standard, Absa, Nedbank, Discovery & TymeBank',
              'Configurable daily NFC caps up to R 50,000/day',
              'Instant zero-fee switching between bank & wallet',
              'Biometric Passkey + 5-digit SA Banking PIN guardrails',
            ],
          },
          {
            tier: 'SoftPOS Merchant Pro',
            sub: 'EMVCo L2 Tap-on-Phone & APIs',
            price: '0.45% (Cap R 18)',
            highlights: [
              'R 0 monthly hardware rental — use existing phones',
              'Accept physical Visa, Mastercard, Apple Pay & HCE',
              'Unlimited staff SoftPOS sub-accounts & UTR webhooks',
              'Instant settlement 24/7/365 with official POPs',
            ],
          },
        ].map((plan) => (
          <div
            key={plan.tier}
            className={`rounded-3xl p-7 flex flex-col justify-between ${
              plan.featured
                ? 'tp-glass-elevated border-2 border-emerald-500'
                : 'tp-glass'
            }`}
          >
            <div>
              {plan.featured && (
                <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500 text-white mb-3">
                  Most Popular Dual-Rail Setup
                </span>
              )}
              <h3 className="font-display font-extrabold text-xl text-[var(--tp-text)]">
                {plan.tier}
              </h3>
              <p className="text-xs text-[var(--tp-text-secondary)] mt-1">{plan.sub}</p>
              <p className="font-display font-extrabold text-3xl font-mono-tabular text-emerald-500 my-5">
                {plan.price}
              </p>
              <ul className="space-y-2.5">
                {plan.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-xs sm:text-sm text-[var(--tp-text-secondary)]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              to="/simulator"
              className="mt-7 inline-flex items-center justify-center gap-1.5 w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition"
            >
              <Sparkles className="w-4 h-4" />
              Test in Live Web App
            </Link>
          </div>
        ))}
      </section>
    </div>
  );
};
