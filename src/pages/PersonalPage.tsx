import React, { useState } from 'react';
import {
  Banknote,
  CheckCircle2,
  Shield,
  Sparkles,
  Store,
  Wallet,
  Zap,
} from 'lucide-react';
import { useTapPay } from '../context/TapPayContext';
import {
  BankId,
  LinkedBankAccount,
  RETAIL_VOUCHER_CHANNELS,
  SA_BANK_LIST,
  SA_DATA_BUNDLES,
  SA_ELECTRICITY_VENDORS,
  SA_EWALLET_NETWORKS,
  SA_MOBILE_NETWORKS,
  TAPPAY_WALLET_ID,
  formatZAR,
} from '../data/tappayData';
import { InteractiveCard3D } from '../components/InteractiveCard3D';

const STUDIO_SAMPLE_ACCOUNTS: Record<BankId, LinkedBankAccount> = {
  fnb: {
    id: 'studio-fnb',
    bankId: 'fnb',
    accountHolder: 'T MOKOENA',
    accountNumber: '62849108492',
    accountType: 'Cheque',
    branchCode: '250655',
    balance: 24680.5,
    isDefault: true,
    nfcEnabled: true,
    shapId: '0824917732@fnb',
    mandateRef: 'DBK-FNB-992841',
  },
  capitec: {
    id: 'studio-capitec',
    bankId: 'capitec',
    accountHolder: 'T MOKOENA',
    accountNumber: '16482903109',
    accountType: 'Savings',
    branchCode: '470010',
    balance: 8945.25,
    isDefault: false,
    nfcEnabled: true,
    shapId: '0824917732@capitec',
    mandateRef: 'DBK-CAP-441029',
  },
  standard: {
    id: 'studio-standard',
    bankId: 'standard',
    accountHolder: 'T MOKOENA',
    accountNumber: '01482930114',
    accountType: 'Cheque',
    branchCode: '051001',
    balance: 19420.0,
    isDefault: false,
    nfcEnabled: true,
    shapId: '0824917732@standardbank',
    mandateRef: 'DBK-STD-301928',
  },
  absa: {
    id: 'studio-absa',
    bankId: 'absa',
    accountHolder: 'T MOKOENA',
    accountNumber: '40892014412',
    accountType: 'Cheque',
    branchCode: '632005',
    balance: 14110.8,
    isDefault: false,
    nfcEnabled: true,
    shapId: '0824917732@absa',
    mandateRef: 'DBK-ABS-771029',
  },
  nedbank: {
    id: 'studio-nedbank',
    bankId: 'nedbank',
    accountHolder: 'T MOKOENA',
    accountNumber: '19440281920',
    accountType: 'Cheque',
    branchCode: '198765',
    balance: 16890.4,
    isDefault: false,
    nfcEnabled: true,
    shapId: '0824917732@nedbank',
    mandateRef: 'DBK-NED-552910',
  },
  discovery: {
    id: 'studio-discovery',
    bankId: 'discovery',
    accountHolder: 'T MOKOENA',
    accountNumber: '78291044812',
    accountType: 'Cheque',
    branchCode: '679000',
    balance: 31500.0,
    isDefault: false,
    nfcEnabled: true,
    shapId: '0824917732@discovery',
    mandateRef: 'DBK-DSC-884012',
  },
  tymebank: {
    id: 'studio-tymebank',
    bankId: 'tymebank',
    accountHolder: 'T MOKOENA',
    accountNumber: '51092837411',
    accountType: 'Savings',
    branchCode: '678910',
    balance: 5420.75,
    isDefault: false,
    nfcEnabled: true,
    shapId: '0824917732@tymebank',
    mandateRef: 'DBK-TYM-219044',
  },
};

export const PersonalPage: React.FC = () => {
  const {
    wallet,
    nfcSettings,
    updateNfcSettings,
    executeVasPurchase,
    executeCashSend,
    setActiveReceipt,
  } = useTapPay();

  // 3D Card Studio selector ('wallet' or any of the 7 SA banks)
  const [studioSelection, setStudioSelection] = useState<'wallet' | BankId>('wallet');
  const [privacyPreview, setPrivacyPreview] = useState(false);

  // ATM Cash Send Explorer state
  const [selectedAtmNet, setSelectedAtmNet] = useState(SA_EWALLET_NETWORKS[0]);
  const [atmAmount, setAtmAmount] = useState(500);
  const [atmSource, setAtmSource] = useState<'wallet' | 'bank'>('wallet');

  // STS Electricity & VAS Calculator state
  const [powerVendor, setPowerVendor] = useState(SA_ELECTRICITY_VENDORS[1]);
  const [meterNumber, setMeterNumber] = useState('04218890412');
  const [powerAmount, setPowerAmount] = useState('250');

  const estimatedKwh = ((parseFloat(powerAmount) || 0) / 3.42).toFixed(1);
  const atmFee = atmSource === 'wallet' ? 7.5 : atmAmount <= 1000 ? 9.5 : 15.5;

  const handleVendDemoSts = () => {
    const amt = parseFloat(powerAmount) || 250;
    const res = executeVasPurchase({
      serviceType: 'electricity',
      providerName: powerVendor,
      productDescription: 'Prepaid Electricity',
      targetIdentifier: meterNumber || '04218890412',
      amount: amt,
      sourceId: TAPPAY_WALLET_ID,
    });
    if (res.ok && res.tx) {
      setActiveReceipt(res.tx);
    }
  };

  const handleDemoCashSend = () => {
    const res = executeCashSend({
      recipientName: 'Lerato Ndlovu',
      recipientPhone: '0836149021',
      networkName: selectedAtmNet.name,
      collectionHint: selectedAtmNet.collectionHint,
      amount: atmAmount,
      secretPin: '4829',
      sourceId: atmSource === 'wallet' ? TAPPAY_WALLET_ID : undefined,
    });
    if (res.ok && res.tx) {
      setActiveReceipt(res.tx);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-20">
      {/* ================= HERO + 8-CARD 3D STUDIO ================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6 space-y-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/12 border border-emerald-500/30 text-emerald-500 text-xs font-extrabold">
            <Wallet className="w-3.5 h-3.5" />
            PERSONAL BANKING &amp; RING-FENCED ZAR WALLET
          </span>

          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-[var(--tp-text)] leading-tight tracking-tight">
            Your SA Banks &amp; Independent @TapPay Wallet — Unified.
          </h1>

          <p className="text-base text-[var(--tp-text-secondary)] leading-relaxed">
            Want direct-to-bank NFC taps from your FNB or Capitec cheque account? Or prefer a
            completely separate, SARB ring-fenced{' '}
            <strong className="text-[var(--tp-text)]">@TapPay ZAR Wallet</strong> funded with cash
            at Pick n Pay so coffee runs and prepaid purchases never clutter your bank statement?
            TapPay Wallet gives you both in a single tap.
          </p>

          {/* Selector Pills for 8 Cards */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--tp-text-secondary)] mb-2.5">
              Interactive 3D HCE Token Studio — Select Any Card &amp; Click to Flip:
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setStudioSelection('wallet')}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition cursor-pointer ${
                  studioSelection === 'wallet'
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow'
                    : 'tp-muted-box text-[var(--tp-text)] hover:border-emerald-500/40'
                }`}
              >
                @TapPay Wallet
              </button>
              {SA_BANK_LIST.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setStudioSelection(b.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition cursor-pointer ${
                    studioSelection === b.id
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow'
                      : 'tp-muted-box text-[var(--tp-text)] hover:border-emerald-500/40'
                  }`}
                >
                  {b.shortName}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="tp-glass-elevated rounded-[30px] p-6 sm:p-8">
            <InteractiveCard3D
              mode={studioSelection === 'wallet' ? 'wallet' : 'bank'}
              wallet={wallet}
              account={
                studioSelection === 'wallet'
                  ? undefined
                  : STUDIO_SAMPLE_ACCOUNTS[studioSelection]
              }
              privacyMask={privacyPreview}
              onTogglePrivacy={() => setPrivacyPreview((p) => !p)}
            />
            <div className="mt-5 pt-4 border-t border-[var(--tp-border)] flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--tp-text-secondary)]">
              <span>Click anywhere on the card to inspect the reverse HCE PAN &amp; CVV</span>
              <button
                type="button"
                onClick={() => setPrivacyPreview((p) => !p)}
                className="font-bold text-emerald-500 hover:underline cursor-pointer"
              >
                {privacyPreview ? 'Disable POS Privacy Mask' : 'Test POS Privacy Mask'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BANK-INDEPENDENT WALLET EXPLAINER ================= */}
      <section className="tp-glass rounded-[32px] p-6 sm:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-500">
              100% Bank-Independent Option
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--tp-text)]">
              How the Ring-Fenced @TapPay ZAR e-Money Wallet Works
            </h2>
            <p className="text-sm sm:text-base text-[var(--tp-text-secondary)] leading-relaxed">
              Held in a segregated SARB FICA Tier-2 e-Money trust (up to{' '}
              <strong className="text-[var(--tp-text)]">R 25,000</strong> balance cap), your
              @TapPay Wallet comes with its own virtual HCE contactless Mastercard (
              <span className="font-mono-tabular">5399 48••</span>) and instant{' '}
              <span className="font-mono-tabular">@tappay</span> ShapID — zero monthly fees, zero
              bank account required.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {RETAIL_VOUCHER_CHANNELS.map((ch) => (
                <div key={ch} className="p-3.5 rounded-2xl tp-muted-box flex items-center gap-3">
                  <Store className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-[var(--tp-text)]">{ch}</p>
                    <p className="text-[11px] text-emerald-500 font-semibold">
                      Instant Cash-to-Wallet Deposit • R 0 Fee
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 p-6 rounded-3xl tp-muted-box space-y-3">
            <h3 className="font-display font-bold text-lg text-[var(--tp-text)]">
              Why South Africans Love Dual-Rail Mode
            </h3>
            {[
              'Keep daily coffees, taxis & VAS off home-loan bank statements',
              'Top up free via instant RTC from any linked bank or retail till cash',
              'Cash out back to FNB, Capitec, Standard Bank or Absa in 1 second for R 0.00',
              'Dedicated Wallet NFC kill-switch independent of your physical bank cards',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--tp-text-secondary)]">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 7-NETWORK CARDLESS ATM CASH SEND EXPLORER ================= */}
      <section className="space-y-6">
        <div className="max-w-3xl">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-500">
            Nationwide Cardless Cash Withdrawals
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-[var(--tp-text)] mt-1">
            Send Instant ATM &amp; Retail Cash Across All 7 SA Networks
          </h2>
          <p className="text-sm sm:text-base text-[var(--tp-text-secondary)] mt-2">
            Recipients don&apos;t need a bank card or smartphone — just an SA mobile number and the
            4-digit secret PIN you set. Flat <strong className="text-emerald-500">R 7.50</strong>{' '}
            when funded from your @TapPay Wallet.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SA_EWALLET_NETWORKS.map((net) => {
              const active = selectedAtmNet.id === net.id;
              return (
                <button
                  key={net.id}
                  type="button"
                  onClick={() => setSelectedAtmNet(net)}
                  className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                    active
                      ? 'bg-emerald-500/15 border-emerald-500'
                      : 'tp-glass hover:border-emerald-500/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: net.color }}
                    />
                    <span className="font-display font-bold text-sm text-[var(--tp-text)]">
                      {net.name}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--tp-text-secondary)]">{net.collectionHint}</p>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-5 tp-glass-elevated rounded-3xl p-6 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-500">
                  <Banknote className="w-4 h-4" />
                  LIVE VOUCHER ESTIMATOR
                </span>
                <span className="text-xs font-mono-tabular text-[var(--tp-text-muted)]">
                  Valid 30 Days
                </span>
              </div>

              <h3 className="font-display font-extrabold text-xl text-[var(--tp-text)]">
                {selectedAtmNet.name}
              </h3>
              <p className="text-xs text-[var(--tp-text-secondary)] mt-0.5">
                Collect at: {selectedAtmNet.collectionHint}
              </p>

              <div className="mt-5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--tp-text-secondary)] mb-2">
                  Select ZAR Note Amount
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[100, 200, 500, 1000, 2000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAtmAmount(amt)}
                      className={`py-2 rounded-xl font-mono-tabular text-xs font-bold border transition cursor-pointer ${
                        atmAmount === amt
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'tp-muted-box text-[var(--tp-text)]'
                      }`}
                    >
                      R{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAtmSource('wallet')}
                  className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer ${
                    atmSource === 'wallet'
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-500'
                      : 'tp-muted-box text-[var(--tp-text-secondary)]'
                  }`}
                >
                  @TapPay Wallet (R 7.50)
                </button>
                <button
                  type="button"
                  onClick={() => setAtmSource('bank')}
                  className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer ${
                    atmSource === 'bank'
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-500'
                      : 'tp-muted-box text-[var(--tp-text-secondary)]'
                  }`}
                >
                  Linked Bank (R {atmAmount <= 1000 ? '9.50' : '15.50'})
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--tp-border)] space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--tp-text-secondary)]">Total Debit (incl. ATM Fee)</span>
                <span className="font-mono-tabular font-extrabold text-[var(--tp-text)]">
                  {formatZAR(atmAmount + atmFee)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleDemoCashSend}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-display font-bold text-sm shadow-lg shadow-emerald-500/25 transition cursor-pointer"
              >
                Generate Sample ATM Voucher &amp; POP
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PREPAID ELECTRICITY (STS) & VAS HUB ================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Live STS Prepaid Electricity Calculator */}
        <div className="lg:col-span-7 tp-glass rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Zap className="w-4 h-4" />
              STS National Vending Switch • R 0.00 Fee
            </span>
            <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--tp-text)]">
              Instant 20-Digit Prepaid Electricity Tokens
            </h3>
            <p className="text-sm text-[var(--tp-text-secondary)]">
              Direct integration with Eskom and municipal prepaid switches. Test our live kWh
              calculator and generate an authentic 20-digit STS token receipt right now:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-[var(--tp-text-secondary)] mb-1.5">
                  Electricity Supply Authority
                </label>
                <select
                  value={powerVendor}
                  onChange={(e) => setPowerVendor(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl tp-muted-box text-sm font-semibold text-[var(--tp-text)]"
                >
                  {SA_ELECTRICITY_VENDORS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--tp-text-secondary)] mb-1.5">
                  11-Digit STS Meter Number
                </label>
                <input
                  type="text"
                  value={meterNumber}
                  onChange={(e) => setMeterNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  className="w-full px-3.5 py-2.5 rounded-xl tp-muted-box font-mono-tabular text-sm font-bold text-[var(--tp-text)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--tp-text-secondary)] mb-1.5">
                Purchase Amount (ZAR)
              </label>
              <div className="flex flex-wrap gap-2">
                {['100', '250', '500', '1000'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setPowerAmount(val)}
                    className={`px-4 py-2 rounded-xl font-mono-tabular text-xs font-bold border cursor-pointer ${
                      powerAmount === val
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'tp-muted-box text-[var(--tp-text)]'
                    }`}
                  >
                    R {val}
                  </button>
                ))}
                <input
                  type="number"
                  value={powerAmount}
                  onChange={(e) => setPowerAmount(e.target.value)}
                  className="w-28 px-3 py-2 rounded-xl tp-muted-box font-mono-tabular text-sm font-bold text-[var(--tp-text)]"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-[var(--tp-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-[var(--tp-text-secondary)] block">
                Estimated Meter Units
              </span>
              <span className="font-display font-extrabold text-2xl font-mono-tabular text-emerald-500">
                {estimatedKwh} kWh
              </span>
            </div>
            <button
              type="button"
              onClick={handleVendDemoSts}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-display font-bold text-sm shadow-lg shadow-emerald-500/25 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Vend Demo 20-Digit STS Token
            </button>
          </div>
        </div>

        {/* Pinless SA Mobile Networks + Guardrails */}
        <div className="lg:col-span-5 space-y-6">
          <div className="tp-glass rounded-3xl p-6 space-y-4">
            <h3 className="font-display font-extrabold text-xl text-[var(--tp-text)]">
              Pinless SA Mobile Data &amp; Airtime
            </h3>
            <div className="flex flex-wrap gap-2">
              {SA_MOBILE_NETWORKS.map((net) => (
                <span
                  key={net.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full tp-muted-box text-xs font-bold text-[var(--tp-text)]"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: net.color }}
                  />
                  {net.name}
                </span>
              ))}
            </div>
            <div className="space-y-2 pt-1">
              {SA_DATA_BUNDLES.slice(0, 3).map((b) => (
                <div
                  key={b.id}
                  className="px-3.5 py-2.5 rounded-xl tp-muted-box flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-[var(--tp-text)]">{b.label}</span>
                  <span className="font-mono-tabular font-extrabold text-emerald-500">
                    {formatZAR(b.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Contactless Guardrails */}
          <div className="tp-glass rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-500" />
              <h3 className="font-display font-extrabold text-lg text-[var(--tp-text)]">
                Custom SARB Contactless Guardrails
              </h3>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--tp-text-secondary)] mb-2">
                PIN-Free Tap Threshold
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[250, 500, 1000].map((lim) => (
                  <button
                    key={lim}
                    type="button"
                    onClick={() => updateNfcSettings({ pinlessLimit: lim })}
                    className={`py-2 rounded-xl font-mono-tabular text-xs font-extrabold border transition cursor-pointer ${
                      nfcSettings.pinlessLimit === lim
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'tp-muted-box text-[var(--tp-text)]'
                    }`}
                  >
                    R {lim}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--tp-text-secondary)] mb-2">
                Daily NFC Settlement Cap
              </p>
              <div className="grid grid-cols-4 gap-2">
                {[5000, 15000, 30000, 50000].map((cap) => (
                  <button
                    key={cap}
                    type="button"
                    onClick={() => updateNfcSettings({ dailyLimit: cap })}
                    className={`py-2 rounded-xl font-mono-tabular text-xs font-extrabold border transition cursor-pointer ${
                      nfcSettings.dailyLimit === cap
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'tp-muted-box text-[var(--tp-text)]'
                    }`}
                  >
                    R {cap / 1000}k
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
