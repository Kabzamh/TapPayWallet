import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  Code2,
  Copy,
  Smartphone,
  Sparkles,
  Store,
  TrendingUp,
  Truck,
  Utensils,
} from 'lucide-react';
import { formatZAR } from '../data/tappayData';
import { useTapPay } from '../context/TapPayContext';

const API_SNIPPETS = {
  intent: `// 1. Create an EMVCo L2 SoftPOS Tap-on-Phone Intent
const response = await fetch('https://api.tappay.co.za/v1/softpos/intents', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer tp_live_za_99481029481',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amountZar: 1280.00,
    settlementRail: 'acc-fnb-250655', // or 'tappay-wallet'
    merchantRef: 'INV-BRAAM-4419',
    feeCapApplied: true, // Max R 18.00 commercial card cap
  }),
});

const { intentId, rfFrequencyMhz, status } = await response.json();
// -> { intentId: "spi_884120", rfFrequencyMhz: 13.56, status: "AWAITING_TAP" }`,

  webhook: `// 2. Verify Real-Time BankservAfrica UTR Settlement Webhook
app.post('/webhooks/tappay-zar', (req, res) => {
  const sig = req.headers['x-tappay-hmac-sha256'];
  const event = verifyTapPaySignature(req.rawBody, sig, process.env.TAPPAY_SECRET);

  if (event.type === 'softpos.settled') {
    console.log('Settled Instantly:', {
      utrReference: event.data.utrReference, // "ZA-POS-20261112-774102"
      grossZar: event.data.amount,           // 1280.00
      clearingFeeZar: event.data.fee,        // 5.76 (0.45%)
      netCreditedZar: event.data.netAmount,  // 1274.24
      popUrl: event.data.officialPopUrl,
    });
  }
  res.status(200).json({ received: true });
});`,

  payshap: `// 3. Dispatch Instant PayShap Request-to-Pay (ShapID)
const rtp = await tappay.payshap.requestToPay({
  payerShapId: '0836149021@capitec',
  amountZar: 450.00,
  statementReference: 'Order #9042 - Rosebank Roastery',
  expirySeconds: 300,
});
// Clears 24/7/365 directly into your linked SA business account`,
};

export const BusinessPage: React.FC = () => {
  const { setDownloadModalOpen } = useTapPay();

  // Interactive Merchant Savings Calculator State
  const [monthlyTurnover, setMonthlyTurnover] = useState(120000);
  const [avgBasket, setAvgBasket] = useState(450);
  const [peerTapShare, setPeerTapShare] = useState(30); // % of customers tapping via TapPay HCE (R 0 fee!)

  // Developer Code Tab
  const [codeTab, setCodeTab] = useState<'intent' | 'webhook' | 'payshap'>('intent');
  const [copiedCode, setCopiedCode] = useState(false);

  const savingsStats = useMemo(() => {
    const txCount = Math.max(1, Math.round(monthlyTurnover / Math.max(20, avgBasket)));
    const peerTxCount = Math.round(txCount * (peerTapShare / 100));
    const cardTxCount = txCount - peerTxCount;

    // Legacy SA POS: 2.75% blended + R 450 monthly terminal & SIM rental
    const legacyMonthlyCost = monthlyTurnover * 0.0275 + 450;

    // TapPay SoftPOS: R 0 rental + R 0 peer taps + 0.45% capped at R 18.00 per commercial card tap!
    const perCardTapFee = Math.min(18, avgBasket * 0.0045);
    const tappayMonthlyCost = cardTxCount * perCardTapFee;

    const monthlySaved = Math.max(0, legacyMonthlyCost - tappayMonthlyCost);
    const annualSaved = monthlySaved * 12;

    return {
      txCount,
      perCardTapFee,
      legacyMonthlyCost,
      tappayMonthlyCost,
      monthlySaved,
      annualSaved,
    };
  }, [monthlyTurnover, avgBasket, peerTapShare]);

  const copySnippet = () => {
    navigator.clipboard?.writeText(API_SNIPPETS[codeTab]).catch(() => {});
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-20">
      {/* ================= HERO ================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-5">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-500/12 border border-sky-500/30 text-sky-700 dark:text-sky-400 text-xs font-extrabold">
            <Smartphone className="w-3.5 h-3.5" />
            EMVCo LEVEL-2 CERTIFIED TAP-ON-PHONE (SOFTPOS)
          </span>

          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-[var(--tp-text)] leading-tight tracking-tight">
            Accept Contactless Cards &amp; Phones on Your Smartphone.{' '}
            <span className="text-emerald-500">Capped at R 18 Max.</span>
          </h1>

          <p className="text-base sm:text-lg text-[var(--tp-text-secondary)] leading-relaxed">
            No Bluetooth dongles. No paper rolls. No R 450/month terminal contracts. Whether you run
            a weekend stall in Braamfontein, a fleet of delivery bikes in Cape Town, or a busy
            franchise, TapPay Wallet turns every staff phone into an instant-settling SA POS terminal.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/simulator"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-display font-bold text-sm shadow-lg shadow-emerald-500/25 transition"
            >
              <Sparkles className="w-4 h-4" />
              Test SoftPOS Terminal Live
            </Link>
            <button
              type="button"
              onClick={() => setDownloadModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl tp-glass font-display font-bold text-sm text-[var(--tp-text)] hover:border-emerald-500/40 transition cursor-pointer"
            >
              Onboard Merchant Account
            </button>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-[28px] overflow-hidden border border-[var(--tp-border-strong)] shadow-2xl">
            <img
              src="/images/merchant-softpos.png"
              alt="South African trader accepting SoftPOS payment"
              className="w-full h-80 object-cover"
            />
          </div>
        </div>
      </section>

      {/* ================= INTERACTIVE ZAR SAVINGS CALCULATOR ================= */}
      <section className="tp-glass-elevated rounded-[32px] p-6 sm:p-10 lg:p-12">
        <div className="max-w-3xl mb-8">
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-500">
            <TrendingUp className="w-4 h-4" />
            Interactive Merchant ROI Calculator
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-[var(--tp-text)] mt-1">
            See How Much Your Business Saves in Rand Every Year
          </h2>
          <p className="text-sm text-[var(--tp-text-secondary)] mt-2">
            Compare legacy South African bank POS terminals (2.75% blended card fee + R 450/mo
            device rental) against TapPay SoftPOS (0.45% commercial card rate capped at R 18.00, and
            R 0.00 on TapPay HCE peer taps).
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Sliders */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-5 rounded-2xl tp-muted-box">
              <div className="flex justify-between items-baseline mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--tp-text-secondary)]">
                  Monthly Contactless Turnover
                </label>
                <span className="font-display font-extrabold text-xl font-mono-tabular text-emerald-500">
                  {formatZAR(monthlyTurnover)}
                </span>
              </div>
              <input
                type="range"
                min={15000}
                max={1000000}
                step={5000}
                value={monthlyTurnover}
                onChange={(e) => setMonthlyTurnover(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono-tabular text-[var(--tp-text-muted)] mt-1">
                <span>R 15,000 / mo</span>
                <span>R 1,000,000 / mo</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl tp-muted-box">
              <div className="flex justify-between items-baseline mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--tp-text-secondary)]">
                  Average Customer Basket Size
                </label>
                <span className="font-display font-extrabold text-xl font-mono-tabular text-[var(--tp-text)]">
                  {formatZAR(avgBasket)}
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={6000}
                step={50}
                value={avgBasket}
                onChange={(e) => setAvgBasket(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono-tabular text-[var(--tp-text-muted)] mt-1">
                <span>R 50 (Coffee / Taxi)</span>
                <span>R 6,000 (Notice R 18 fee cap!)</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl tp-muted-box">
              <div className="flex justify-between items-baseline mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--tp-text-secondary)]">
                  Share of TapPay Direct HCE Taps (R 0.00 Fee)
                </label>
                <span className="font-display font-extrabold text-xl font-mono-tabular text-sky-600 dark:text-sky-400">
                  {peerTapShare}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={70}
                step={5}
                value={peerTapShare}
                onChange={(e) => setPeerTapShare(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Light-Glass Results Summary Card */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl tp-glass-elevated border-2 border-emerald-500/35 space-y-5 relative overflow-hidden">
            <div className="pointer-events-none absolute -right-12 -top-12 w-48 h-48 rounded-full bg-emerald-400/20 blur-2xl" />
            <div className="relative z-10">
              <span className="text-xs font-mono-tabular uppercase tracking-widest text-[var(--tp-primary)] font-extrabold">
                Projected Annual ZAR Savings
              </span>
              <p className="font-display font-extrabold text-4xl sm:text-5xl font-mono-tabular text-[var(--tp-primary)] mt-1">
                {formatZAR(savingsStats.annualSaved)}
              </p>
              <p className="text-xs text-[var(--tp-text-secondary)] mt-1">
                Based on ~{savingsStats.txCount.toLocaleString()} monthly taps (
                {formatZAR(savingsStats.monthlySaved)} saved/month)
              </p>
            </div>

            <div className="relative z-10 space-y-2.5 pt-4 border-t border-[var(--tp-border-strong)] text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--tp-text-secondary)]">Legacy Bank Terminal (2.75% + R450)</span>
                <span className="font-mono-tabular font-bold text-rose-600 dark:text-rose-400">
                  {formatZAR(savingsStats.legacyMonthlyCost)} / mo
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--tp-text-secondary)]">TapPay Wallet SoftPOS Fees</span>
                <span className="font-mono-tabular font-bold text-[var(--tp-primary)]">
                  {formatZAR(savingsStats.tappayMonthlyCost)} / mo
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--tp-text-secondary)]">Fee Per Commercial Card Tap</span>
                <span className="font-mono-tabular font-bold text-[var(--tp-text)]">
                  {formatZAR(savingsStats.perCardTapFee)}{' '}
                  {avgBasket >= 4000 ? '(R 18 Max Cap Hit!)' : '(0.45%)'}
                </span>
              </div>
            </div>

            <Link
              to="/simulator"
              className="relative z-10 block w-full text-center py-3.5 rounded-2xl bg-[var(--tp-primary)] hover:bg-[var(--tp-primary-hover)] text-white font-display font-extrabold text-sm shadow-lg shadow-emerald-600/20 transition"
            >
              Try SoftPOS Terminal in Web Sandbox →
            </Link>
          </div>
        </div>
      </section>

      {/* ================= BUILT FOR EVERY SA SECTOR ================= */}
      <section className="space-y-8">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-500">
            Built for Mzansi Commerce
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-[var(--tp-text)] mt-1">
            Tailored for Informal Traders &amp; Enterprise Fleets Alike
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              icon: Store,
              title: 'Spaza & Township Retail',
              desc: 'Settle directly into an independent @TapPay Wallet or TymeBank/Capitec account with zero monthly hardware rental.',
            },
            {
              icon: Utensils,
              title: 'Markets, Cafés & Hospitality',
              desc: 'Let every waitron take tableside card & Apple Pay taps on Android/iOS with instant tip splitting and WhatsApp POPs.',
            },
            {
              icon: Truck,
              title: 'Couriers & On-Demand Fleets',
              desc: 'Eliminate cash-on-delivery risk. Drivers collect contactless card taps at the customer doorstep with instant UTR reconciliation.',
            },
            {
              icon: Smartphone,
              title: 'High-Ticket Showrooms',
              desc: 'Because commercial card fees cap strictly at R 18.00, accepting a R 25,000 tap costs just R 18 instead of R 687!',
            },
          ].map((sector) => {
            const Icon = sector.icon;
            return (
              <div key={sector.title} className="tp-glass rounded-3xl p-6 space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-extrabold text-lg text-[var(--tp-text)]">
                  {sector.title}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--tp-text-secondary)] leading-relaxed">
                  {sector.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= OPEN ACQUIRING API & SDK EXPLORER ================= */}
      <section className="tp-glass rounded-[32px] p-6 sm:p-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              <Code2 className="w-4 h-4" />
              Developer &amp; POS Integration SDK
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--tp-text)] mt-1">
              Drop-In South African Open Acquiring APIs
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'intent', label: 'SoftPOS Intent' },
              { id: 'webhook', label: 'UTR Webhook' },
              { id: 'payshap', label: 'PayShap RTP' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCodeTab(tab.id as typeof codeTab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  codeTab === tab.id
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'tp-muted-box text-[var(--tp-text-secondary)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl tp-muted-box overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--tp-border-strong)] bg-[var(--tp-surface-elevated)]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-xs font-mono-tabular font-semibold text-[var(--tp-text-secondary)]">
                tappay-za-sdk.ts
              </span>
            </div>
            <button
              type="button"
              onClick={copySnippet}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg tp-muted-box hover:border-emerald-500/40 text-xs font-bold text-[var(--tp-text)] cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-[var(--tp-primary)]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-5 text-xs sm:text-sm font-mono-tabular text-emerald-900 dark:text-emerald-300 overflow-x-auto leading-relaxed">
            <code>{API_SNIPPETS[codeTab]}</code>
          </pre>
        </div>
      </section>
    </div>
  );
};
