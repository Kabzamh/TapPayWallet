import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Banknote,
  Bell,
  Building2,
  CheckCircle2,
  ChevronDown,
  Cpu,
  CreditCard,
  Download,
  FileCheck2,
  Lock,
  PlusCircle,
  Radio,
  Receipt,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wallet,
  Wifi,
  Zap,
} from 'lucide-react';
import { useTapPay } from '../context/TapPayContext';
import {
  QUICK_CONTACTS,
  SA_BANKS,
  SA_BANK_LIST,
  SIMULATED_SA_MERCHANTS,
  SIMULATED_SOFTPOS_PAYERS,
  TAPPAY_WALLET_ID,
  formatZAR,
  maskAccountNumber,
} from '../data/tappayData';
import { InteractiveCard3D } from '../components/InteractiveCard3D';
import { NfcRadarVisualizer, NfcStage } from '../components/NfcRadarVisualizer';
import { ContactlessWavesSvg } from '../components/Icons';

const FAQS = [
  {
    q: 'Do I need a South African bank account to use TapPay Wallet?',
    a: 'No! You can open an independent @TapPay ZAR Wallet in under 2 minutes with your SA ID (FICA Tier-2 up to R 25,000) and fund it 100% bank-free with cash at Pick n Pay or Boxer tills, 1Voucher, OTT, or Blu Voucher. Whenever you want, you can also link FNB, Capitec, Standard Bank, Absa, Nedbank, Discovery Bank, or TymeBank.',
  },
  {
    q: 'How does Direct-to-Bank HCE Tap to Pay eliminate card fees?',
    a: 'TapPay Wallet provisions an ISO/IEC 14443-4 Host Card Emulation (HCE) token backed by a SARB Open Banking & DebiCheck mandate. When your phone enters a 13.56 MHz POS field, it exchanges a single-use dynamic cryptogram and clears via BankservAfrica RTC — charging R 0.00 to consumers.',
  },
  {
    q: 'Can any smartphone accept contactless card payments with TapPay Wallet SoftPOS?',
    a: 'Yes. TapPay Wallet embeds an EMVCo Level-2 certified Tap-on-Phone kernel. Market vendors, spaza shops, couriers, and retailers can accept physical Visa/Mastercard taps, Apple Pay, Samsung Wallet, and TapPay Wallet HCE phones directly on the back of their phone — with R 0 monthly hardware rental, R 0 peer-to-peer fees, and a 0.45% commercial card fee capped at R 18.00 max.',
  },
  {
    q: 'How are my balances protected in public spaces or at busy tills?',
    a: 'TapPay Wallet includes POS Balance Privacy Masking by default on the Home screen and supports configurable PIN-free tap thresholds (R 250, R 500, or R 1,000). Any tap above your threshold requires your Biometric Passkey (FaceID / Fingerprint) or 5-digit SA Banking PIN.',
  },
  {
    q: 'Does TapPay Wallet generate official Proof of Payment (POP) and STS tokens?',
    a: 'Every transaction generates an instant, shareable Proof of Payment (POP) stamped with SAST time and a verifiable BankservAfrica UTR clearing reference (e.g., ZA-TAP-20261112-482910). Prepaid electricity purchases return your 20-digit STS meter token immediately on-screen.',
  },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    wallet,
    accounts,
    defaultAccount,
    todayNfcSpend,
    nfcSettings,
    updateNfcSettings,
    executeTapPayment,
    executeSoftPosReceive,
    setActiveReceipt,
    setDownloadModalOpen,
  } = useTapPay();

  // Hero interactive card state
  const [heroCardMode, setHeroCardMode] = useState<'bank' | 'wallet'>('bank');
  const [selectedHeroBankIdx, setSelectedHeroBankIdx] = useState(0);

  // Homepage live NFC Lab state
  const [labMode, setLabMode] = useState<'pay' | 'receive'>('pay');
  const [selectedMerchant, setSelectedMerchant] = useState(SIMULATED_SA_MERCHANTS[0]);
  const [selectedPayer, setSelectedPayer] = useState(SIMULATED_SOFTPOS_PAYERS[0]);
  const [receiveAmount, setReceiveAmount] = useState('450');
  const [labSource, setLabSource] = useState<'bank' | 'wallet'>('bank');
  const [nfcStage, setNfcStage] = useState<NfcStage>('idle');
  const [stageMessage, setStageMessage] = useState(
    'Ready at 13.56 MHz — Choose merchant & trigger contactless tap'
  );
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const heroAccount = accounts[selectedHeroBankIdx % accounts.length] || defaultAccount;

  const runLiveSimulation = () => {
    if (nfcStage !== 'idle' && nfcStage !== 'approved') return;
    setNfcStage('scanning');
    setStageMessage('13.56 MHz RF Field Detected — Waking ISO 14443-4 Controller...');

    setTimeout(() => {
      setNfcStage('authenticating');
      setStageMessage(
        labMode === 'pay'
          ? 'Exchanging HCE Dynamic Cryptogram with Acquiring POS...'
          : 'Reading EMVCo L2 Contactless Kernel Cryptogram...'
      );
    }, 600);

    setTimeout(() => {
      setNfcStage('settling');
      setStageMessage('Clearing Real-Time ZAR via BankservAfrica RTC...');
    }, 1250);

    setTimeout(() => {
      const targetSourceId = labSource === 'wallet' ? TAPPAY_WALLET_ID : defaultAccount.id;
      if (labMode === 'pay') {
        const res = executeTapPayment({
          merchantName: selectedMerchant.name,
          subtitle: `${selectedMerchant.branch} • Tap to Pay`,
          amount: selectedMerchant.amount,
          category: selectedMerchant.category,
          acquirerBank: selectedMerchant.acquirerBank,
          sourceId: targetSourceId,
          pinVerified: selectedMerchant.amount > nfcSettings.pinlessLimit,
        });
        if (res.ok && res.tx) {
          setNfcStage('approved');
          setStageMessage(
            `Settled ${formatZAR(res.tx.amount)} • UTR ${res.tx.utrReference}`
          );
          setActiveReceipt(res.tx);
        } else {
          setNfcStage('idle');
          setStageMessage(res.error || 'Transaction declined.');
        }
      } else {
        const amt = parseFloat(receiveAmount) || 450;
        const res = executeSoftPosReceive({
          payerName: selectedPayer.customerName,
          payerBank: selectedPayer.bank,
          cardOrDeviceHint: selectedPayer.hint,
          amount: amt,
          referenceNote: 'Live Web SoftPOS Demo',
          isCommercialCard: selectedPayer.isCommercialCard,
          sourceId: targetSourceId,
        });
        if (res.ok && res.tx) {
          setNfcStage('approved');
          setStageMessage(
            `Credited ${formatZAR(res.tx.amount)} • UTR ${res.tx.utrReference}`
          );
          setActiveReceipt(res.tx);
        } else {
          setNfcStage('idle');
          setStageMessage(res.error || 'Unable to process SoftPOS tap.');
        }
      }
    }, 1900);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Ambient Radial Glows */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[620px] bg-radial from-emerald-500/16 via-sky-500/6 to-transparent blur-3xl -z-10" />

      {/* ================= HERO SECTION ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-16 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Editorial Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/12 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-extrabold tracking-wide">
              <ContactlessWavesSvg size={16} color="currentColor" />
              <span>TAPPAY WALLET • SOUTH AFRICA&apos;S DUAL-RAIL NFC SUPER-APP</span>
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-[58px] leading-[1.06] tracking-tight text-[var(--tp-text)]">
              Tap, Settle &amp; Bank Across South Africa —{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 dark:from-emerald-400 dark:via-teal-400 dark:to-sky-400 bg-clip-text text-transparent">
                Zero Card Fees.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[var(--tp-text-secondary)] leading-relaxed max-w-2xl">
              Connect any major South African bank via direct HCE mandates, or transact 100%
              bank-free from a ring-fenced{' '}
              <strong className="text-[var(--tp-text)] font-semibold">@TapPay ZAR Wallet</strong>.
              Pay at any retail till, accept contactless cards on your phone via SoftPOS, clear
              instantly over PayShap, and vend 20-digit STS electricity tokens in one tap.
            </p>

            {/* Primary CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                to="/simulator"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-display font-bold text-sm sm:text-base shadow-xl shadow-emerald-500/25 transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Interactive Web App</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={() => setDownloadModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl tp-glass hover:border-emerald-500/50 text-[var(--tp-text)] font-display font-bold text-sm sm:text-base transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-500" />
                <span>Download iOS &amp; Android</span>
              </button>
            </div>

            {/* Live Key Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              {[
                { val: 'R 0.00', label: 'Consumer NFC Tap Fee' },
                { val: '< 850 ms', label: 'BankservAfrica RTC' },
                { val: '0.45%', label: 'SoftPOS Cap (Max R 18)' },
                { val: 'R 25,000', label: 'Bank-Free Wallet Cap' },
              ].map((stat) => (
                <div key={stat.label} className="p-3.5 rounded-2xl tp-glass">
                  <p className="font-display font-extrabold text-xl sm:text-2xl font-mono-tabular text-emerald-500">
                    {stat.val}
                  </p>
                  <p className="text-xs text-[var(--tp-text-secondary)] mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Interactive Frosted Light-Mode TapPay App Frame (Mirrors Updated App Home!) */}
          <div className="lg:col-span-5">
            <div className="tp-glass-elevated rounded-[32px] p-4 sm:p-5 relative overflow-hidden">
              {/* App Greeting Header: Sawubona, Thabo + FICA + Bell */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-[13px] bg-[var(--tp-primary)] flex items-center justify-center shadow-sm">
                    <ContactlessWavesSvg size={20} color="#FFFFFF" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-display font-extrabold text-[17px] tracking-tight text-[var(--tp-text)]">
                        Sawubona, Thabo
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--tp-primary-soft)] text-[var(--tp-primary)] text-[10px] font-extrabold tracking-wide">
                        <CheckCircle2 className="w-3 h-3" />
                        FICA
                      </span>
                    </div>
                    <span className="block text-xs text-[var(--tp-text-secondary)]">
                      TapPay Wallet • SARB Open Banking
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/simulator')}
                  aria-label="Open App Sandbox"
                  className="relative w-10 h-10 rounded-[13px] tp-glass flex items-center justify-center text-[var(--tp-text)] cursor-pointer"
                >
                  <Bell className="w-[19px] h-[19px]" />
                  <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-[var(--tp-primary)]" />
                </button>
              </div>

              {/* Dual-Rail Segmented Switcher (Linked SA Bank vs @TapPay Wallet) */}
              <div className="grid grid-cols-2 gap-1 p-1 rounded-[14px] tp-glass mb-3">
                <button
                  type="button"
                  onClick={() => setHeroCardMode('bank')}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-[10px] text-xs font-extrabold transition cursor-pointer ${
                    heroCardMode === 'bank'
                      ? 'bg-[var(--tp-primary)] text-white shadow-sm'
                      : 'text-[var(--tp-text-secondary)] hover:text-[var(--tp-text)]'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Linked SA Bank</span>
                </button>
                <button
                  type="button"
                  onClick={() => setHeroCardMode('wallet')}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-[10px] text-xs font-extrabold transition cursor-pointer ${
                    heroCardMode === 'wallet'
                      ? 'bg-[var(--tp-primary)] text-white shadow-sm'
                      : 'text-[var(--tp-text-secondary)] hover:text-[var(--tp-text)]'
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>@TapPay Wallet</span>
                </button>
              </div>

              {/* Updated POS-Privacy Embossed 3D Flippable Card */}
              <InteractiveCard3D
                mode={heroCardMode}
                account={heroAccount}
                wallet={wallet}
                restrictBalance={true}
                showSwitchPill={true}
                onSwitchAccount={() => setSelectedHeroBankIdx((i) => i + 1)}
                showWalletActions={true}
                onWalletTopUp={() => navigate('/simulator')}
                onWalletCashOut={() => navigate('/simulator')}
                onWalletVasClick={() => navigate('/simulator')}
              />

              {/* Dual NFC Hero Action Cards (Tap to Pay + Receive via NFC) */}
              <div className="grid grid-cols-2 gap-3 mt-3.5">
                <button
                  type="button"
                  onClick={() => navigate('/simulator')}
                  className="relative overflow-hidden rounded-[20px] p-4 bg-[var(--tp-primary)] hover:bg-[var(--tp-primary-hover)] text-left text-white shadow-lg shadow-emerald-600/20 transition cursor-pointer"
                >
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(125deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 65%)',
                    }}
                  />
                  <div className="w-10 h-10 rounded-[13px] bg-white/20 flex items-center justify-center mb-2.5">
                    <ContactlessWavesSvg size={22} color="#FFFFFF" />
                  </div>
                  <p className="font-display font-extrabold text-[15px] leading-tight">
                    Tap to Pay
                  </p>
                  <p className="text-[11px] text-white/85 mt-1 leading-snug">
                    Hold near POS or phone • Zero card fees
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/simulator')}
                  className="rounded-[20px] p-4 tp-glass-elevated text-left transition hover:border-sky-500/40 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-[13px] bg-[var(--tp-info-soft)] text-[var(--tp-info)] flex items-center justify-center mb-2.5">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <p className="font-display font-extrabold text-[15px] text-[var(--tp-text)] leading-tight">
                    Receive via NFC
                  </p>
                  <p className="text-[11px] text-[var(--tp-text-secondary)] mt-1 leading-snug">
                    SoftPOS terminal • Instant bank credit
                  </p>
                </button>
              </div>

              {/* 4-Pill App Shortcut Row (e-Wallet, PayShap, @Wallet, Link Bank) */}
              <div className="grid grid-cols-4 gap-2 mt-3">
                {[
                  { label: 'e-Wallet', Icon: Banknote, color: 'text-[var(--tp-primary)]' },
                  { label: 'PayShap', Icon: Zap, color: 'text-[var(--tp-primary)]' },
                  { label: '@Wallet', Icon: Wallet, color: 'text-[var(--tp-info)]' },
                  { label: 'Link Bank', Icon: PlusCircle, color: 'text-[var(--tp-gold)]' },
                ].map(({ label, Icon, color }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => navigate('/simulator')}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-1.5 rounded-[13px] tp-glass text-[11px] font-bold text-[var(--tp-text)] hover:border-emerald-500/40 transition cursor-pointer"
                  >
                    <Icon className={`w-3.5 h-3.5 ${color} shrink-0`} />
                    <span className="truncate">{label}</span>
                  </button>
                ))}
              </div>

              {/* App Instant ATM Cash Send (e-Wallet) Frosted Banner */}
              <button
                type="button"
                onClick={() => navigate('/simulator')}
                className="w-full mt-3 p-3 rounded-[18px] tp-glass-elevated flex items-center gap-2.5 text-left hover:border-emerald-500/45 transition cursor-pointer"
              >
                <div className="w-9 h-9 rounded-[12px] bg-[var(--tp-primary-soft)] text-[var(--tp-primary)] flex items-center justify-center shrink-0">
                  <Banknote className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold text-[var(--tp-text)] truncate">
                    Instant ATM Cash Send (e-Wallet)
                  </p>
                  <p className="text-[10.5px] text-[var(--tp-text-secondary)] truncate">
                    FNB eWallet • Capitec • Standard Bank • Absa CashSend
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--tp-primary)] text-white text-[11px] font-extrabold shrink-0">
                  Send <ArrowRight className="w-3 h-3" />
                </span>
              </button>

              {/* App Instant PayShap Contacts Strip */}
              <div className="mt-3 flex items-center justify-between gap-2 px-1">
                {QUICK_CONTACTS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => navigate('/simulator')}
                    className="flex flex-col items-center group cursor-pointer"
                  >
                    <span
                      className="w-9 h-9 rounded-full text-white text-xs font-extrabold flex items-center justify-center shadow-sm group-hover:scale-105 transition"
                      style={{ backgroundColor: c.avatarBg }}
                    >
                      {c.initials}
                    </span>
                    <span className="text-[10.5px] font-bold text-[var(--tp-text)] mt-1">
                      {c.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>

              {/* Signature Frosted Bottom Dock Preview */}
              <div className="mt-4 pt-3 border-t border-[var(--tp-border-strong)] grid grid-cols-5 items-end text-center">
                <span className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-[var(--tp-primary)]">
                  <Wallet className="w-4 h-4" />
                  Home
                </span>
                <button
                  type="button"
                  onClick={() => navigate('/simulator')}
                  className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-[var(--tp-text-muted)] hover:text-[var(--tp-text)] cursor-pointer"
                >
                  <Receipt className="w-4 h-4" />
                  Ledger
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/simulator')}
                  className="flex flex-col items-center -mt-4 cursor-pointer group"
                >
                  <span className="w-11 h-11 rounded-full bg-[var(--tp-primary)] group-hover:scale-105 transition flex items-center justify-center shadow-lg shadow-emerald-600/30 border-2 border-white">
                    <ContactlessWavesSvg size={21} color="#FFFFFF" />
                  </span>
                  <span className="text-[10px] font-extrabold text-[var(--tp-text-muted)] mt-0.5">
                    NFC Tap
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/personal')}
                  className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-[var(--tp-text-muted)] hover:text-[var(--tp-text)] cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  Banks
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/security')}
                  className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-[var(--tp-text-muted)] hover:text-[var(--tp-text)] cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Security
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SUPPORTED SA BANKS STRIP ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="tp-glass rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-500">
                Universal SA Banking Interoperability
              </span>
              <h2 className="font-display font-extrabold text-xl sm:text-2xl text-[var(--tp-text)] mt-0.5">
                Native Open Banking, DebiCheck &amp; PayShap Across All 7 Major SA Banks
              </h2>
            </div>
            <Link
              to="/personal"
              className="text-xs sm:text-sm font-bold text-emerald-500 hover:underline inline-flex items-center gap-1"
            >
              Explore All 7 Bank Cards in 3D <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {SA_BANK_LIST.map((bank) => (
              <div
                key={bank.id}
                className="p-3.5 rounded-2xl tp-muted-box hover:border-emerald-500/40 transition group"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div
                    className="w-9 h-9 rounded-xl text-white font-display font-extrabold text-xs flex items-center justify-center shadow"
                    style={{
                      background: `linear-gradient(135deg, ${bank.gradient[0]}, ${bank.gradient[1]})`,
                    }}
                  >
                    {bank.shortName.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="font-display font-bold text-sm text-[var(--tp-text)] truncate">
                    {bank.shortName}
                  </span>
                </div>
                <div className="text-[11px] font-mono-tabular text-[var(--tp-text-secondary)] space-y-0.5">
                  <p>Branch {bank.universalBranchCode}</p>
                  <p className="text-emerald-500 font-semibold">@{bank.payShapDomain}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 6-PILLAR DUAL-RAIL BENTO GRID ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-500">
            Unified Financial Infrastructure
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[var(--tp-text)] mt-2 tracking-tight">
            Six South African Payment Rails. One Sub-Second Tap.
          </h2>
          <p className="text-[var(--tp-text-secondary)] mt-3 text-base sm:text-lg">
            Built from the ground up around South Africa&apos;s National Payment System — combining
            contactless hardware tokenization with real-time Rand settlement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Wifi,
              badge: 'R 0.00 Consumer Fee',
              title: 'Direct-to-Bank NFC Tap to Pay',
              desc: 'Hold your phone near any Checkers, Woolworths, Gautrain, or forecourt POS terminal. Dynamic ISO 14443-4 HCE cryptograms debit your chosen SA bank or wallet directly.',
              link: '/personal',
              linkText: 'Explore HCE Cards',
            },
            {
              icon: Wallet,
              badge: '100% Bank-Independent',
              title: '@TapPay Ring-Fenced ZAR Wallet',
              desc: 'Keep everyday spending off your bank statements. Load up to R 25,000 free via RTC bank transfer or deposit cash at Pick n Pay, Boxer, 1Voucher, OTT & Blu tills.',
              link: '/personal',
              linkText: 'Inspect ZAR Wallet',
            },
            {
              icon: Smartphone,
              badge: '0.45% Capped at R 18',
              title: 'EMVCo L2 SoftPOS Tap-on-Phone',
              desc: 'Turn your Android or iPhone into an instant contactless card terminal. Accept Visa, Mastercard, Apple Pay & TapPay phones with zero monthly terminal rental.',
              link: '/business',
              linkText: 'Calculate Merchant Savings',
            },
            {
              icon: Zap,
              badge: 'Free ≤ R 500 via Wallet',
              title: 'PayShap Instant (ShapID)',
              desc: 'Send up to R 50,000 across South African banks in real time using just a mobile number or @fnb, @capitec, @standardbank, @nedbank or @tappay ShapID.',
              link: '/pricing',
              linkText: 'See PayShap Tiers',
            },
            {
              icon: Banknote,
              badge: '7 SA ATM Networks',
              title: 'Cardless ATM Cash Send',
              desc: 'Dispatch instant cardless cash vouchers to any SA mobile number redeemable at FNB eWallet, Capitec Send Cash, Standard Bank Instant Money, Absa CashSend & Nedbank ATMs.',
              link: '/personal',
              linkText: 'View ATM Networks',
            },
            {
              icon: Cpu,
              badge: 'Instant 20-Digit STS',
              title: 'Prepaid VAS, Power & Metros',
              desc: 'Buy pinless Vodacom, MTN, Telkom, Cell C & Rain bundles, vend Eskom & City Power 20-digit STS electricity tokens, and settle COJ, Cape Town & eThekwini bills.',
              link: '/simulator',
              linkText: 'Try Live STS Vending',
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="tp-glass rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-emerald-500/45 transition group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-500">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-mono-tabular font-bold px-2.5 py-1 rounded-full tp-muted-box text-emerald-500">
                      {card.badge}
                    </span>
                  </div>
                  <h3 className="font-display font-extrabold text-xl text-[var(--tp-text)] mb-2.5">
                    {card.title}
                  </h3>
                  <p className="text-sm text-[var(--tp-text-secondary)] leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <Link
                  to={card.link}
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-500 mt-6 group-hover:translate-x-1 transition"
                >
                  <span>{card.linkText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= INTERACTIVE LIVE 13.56 MHz NFC LAB ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="tp-glass-elevated rounded-[32px] p-6 sm:p-10 lg:p-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-500">
                <Radio className="w-4 h-4" />
                Interactive Browser Telemetry
              </span>
              <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-[var(--tp-text)] mt-1">
                Test a Real-Time 13.56 MHz Tap &amp; Official POP Receipt
              </h2>
            </div>

            {/* Mode Switcher */}
            <div className="inline-flex p-1.5 rounded-2xl tp-muted-box self-start">
              <button
                type="button"
                onClick={() => {
                  setLabMode('pay');
                  setNfcStage('idle');
                  setStageMessage('Ready at 13.56 MHz — Choose SA merchant & tap');
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer ${
                  labMode === 'pay'
                    ? 'bg-emerald-500 text-white'
                    : 'text-[var(--tp-text-secondary)] hover:text-[var(--tp-text)]'
                }`}
              >
                Tap to Pay (HCE)
              </button>
              <button
                type="button"
                onClick={() => {
                  setLabMode('receive');
                  setNfcStage('idle');
                  setStageMessage('SoftPOS Ready — Ask customer to tap card or phone');
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer ${
                  labMode === 'receive'
                    ? 'bg-sky-500 text-white'
                    : 'text-[var(--tp-text-secondary)] hover:text-[var(--tp-text)]'
                }`}
              >
                Receive (SoftPOS)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Configuration Controls */}
            <div className="lg:col-span-7 space-y-5">
              {/* Source Account Toggle */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--tp-text-secondary)] mb-2">
                  {labMode === 'pay' ? '1. Debit Settlement Rail' : '1. Credit Settlement Rail'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLabSource('bank')}
                    className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                      labSource === 'bank'
                        ? 'bg-emerald-500/15 border-emerald-500'
                        : 'tp-muted-box hover:border-emerald-500/40'
                    }`}
                  >
                    <p className="text-xs font-extrabold text-[var(--tp-text)]">
                      {SA_BANKS[defaultAccount.bankId].shortName}{' '}
                      {maskAccountNumber(defaultAccount.accountNumber)}
                    </p>
                    <p className="text-xs font-mono-tabular text-[var(--tp-text-secondary)] mt-0.5">
                      Available: {formatZAR(defaultAccount.balance)}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLabSource('wallet')}
                    className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                      labSource === 'wallet'
                        ? 'bg-emerald-500/15 border-emerald-500'
                        : 'tp-muted-box hover:border-emerald-500/40'
                    }`}
                  >
                    <p className="text-xs font-extrabold text-[var(--tp-text)]">
                      @TapPay Wallet •• {wallet.walletNumber.slice(-4)}
                    </p>
                    <p className="text-xs font-mono-tabular text-[var(--tp-text-secondary)] mt-0.5">
                      Ring-Fenced: {formatZAR(wallet.balance)}
                    </p>
                  </button>
                </div>
              </div>

              {labMode === 'pay' ? (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--tp-text-secondary)] mb-2">
                    2. Select South African Retail POS Terminal
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {SIMULATED_SA_MERCHANTS.map((m) => {
                      const active = selectedMerchant.id === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedMerchant(m)}
                          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                            active
                              ? 'bg-emerald-500/15 border-emerald-500'
                              : 'tp-muted-box hover:border-emerald-500/40'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-[var(--tp-text)]">
                              {m.name}
                            </span>
                            <span className="font-mono-tabular text-xs font-extrabold text-emerald-500">
                              {formatZAR(m.amount)}
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--tp-text-secondary)] mt-0.5">
                            {m.branch} • {m.acquirerBank}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--tp-text-secondary)] mb-2">
                      2. Enter SoftPOS Sale Amount (ZAR)
                    </label>
                    <div className="flex gap-2">
                      {['185', '450', '1280', '5000'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setReceiveAmount(preset)}
                          className={`px-3.5 py-2 rounded-xl font-mono-tabular text-xs font-bold border transition cursor-pointer ${
                            receiveAmount === preset
                              ? 'bg-sky-500 text-white border-sky-500'
                              : 'tp-muted-box text-[var(--tp-text)]'
                          }`}
                        >
                          R {preset}
                        </button>
                      ))}
                      <input
                        type="number"
                        value={receiveAmount}
                        onChange={(e) => setReceiveAmount(e.target.value)}
                        className="w-28 px-3 py-2 rounded-xl tp-muted-box font-mono-tabular text-sm font-bold text-[var(--tp-text)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--tp-text-secondary)] mb-2">
                      3. Simulated Customer Contactless Device / Card
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {SIMULATED_SOFTPOS_PAYERS.map((p) => {
                        const active = selectedPayer.id === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setSelectedPayer(p)}
                            className={`p-3 rounded-2xl border flex items-center justify-between text-left transition cursor-pointer ${
                              active
                                ? 'bg-sky-500/15 border-sky-400'
                                : 'tp-muted-box hover:border-sky-400/40'
                            }`}
                          >
                            <div>
                              <p className="text-xs sm:text-sm font-bold text-[var(--tp-text)]">
                                {p.customerName} — {p.label}
                              </p>
                              <p className="text-[11px] font-mono-tabular text-[var(--tp-text-secondary)]">
                                {p.hint}
                              </p>
                            </div>
                            <span className="text-[11px] font-mono-tabular font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-500">
                              {p.isCommercialCard ? '0.45% (Cap R18)' : 'R 0.00 Peer'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Radar Visualizer & Trigger */}
            <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl tp-muted-box text-center space-y-5">
              <NfcRadarVisualizer stage={nfcStage} mode={labMode} size={172} />

              <div>
                <p className="font-display font-extrabold text-3xl font-mono-tabular text-[var(--tp-text)]">
                  {labMode === 'pay'
                    ? formatZAR(selectedMerchant.amount)
                    : formatZAR(parseFloat(receiveAmount) || 0)}
                </p>
                <p
                  className={`text-xs sm:text-sm mt-1.5 font-medium ${
                    nfcStage === 'approved'
                      ? 'text-emerald-500 font-bold'
                      : 'text-[var(--tp-text-secondary)]'
                  }`}
                >
                  {stageMessage}
                </p>
              </div>

              <button
                type="button"
                onClick={runLiveSimulation}
                disabled={nfcStage === 'scanning' || nfcStage === 'authenticating' || nfcStage === 'settling'}
                className={`w-full py-4 rounded-2xl font-display font-extrabold text-sm sm:text-base text-white shadow-xl transition cursor-pointer disabled:opacity-60 ${
                  labMode === 'receive'
                    ? 'bg-sky-500 hover:bg-sky-600 shadow-sky-500/25'
                    : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25'
                }`}
              >
                {nfcStage === 'scanning' || nfcStage === 'authenticating' || nfcStage === 'settling'
                  ? 'Settling on 13.56 MHz Field...'
                  : labMode === 'pay'
                    ? `Simulate NFC Tap (${formatZAR(selectedMerchant.amount)})`
                    : `Simulate Customer Card Tap (${formatZAR(parseFloat(receiveAmount) || 0)})`}
              </button>

              <p className="text-[11px] text-[var(--tp-text-muted)] flex items-center justify-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-500" />
                Generates real Proof of Payment (POP) modal &amp; updates demo ledger
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MERCHANT SOFTPOS SPOTLIGHT ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6">
            <div className="rounded-[28px] overflow-hidden border border-[var(--tp-border-strong)] shadow-2xl relative">
              <img
                src="/images/merchant-softpos.png"
                alt="South African entrepreneur accepting TapPay SoftPOS tap-on-phone payment at Braamfontein market"
                className="w-full h-[360px] sm:h-[420px] object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl tp-glass-elevated flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-mono-tabular text-[var(--tp-primary)] font-extrabold">
                    ZA-POS-20261112-774102 • SETTLED INSTANTLY
                  </p>
                  <p className="text-sm font-bold text-[var(--tp-text)] mt-0.5">
                    Neighbourgoods Market Stall, Braamfontein
                  </p>
                </div>
                <div className="text-right font-mono-tabular">
                  <p className="text-base font-extrabold text-[var(--tp-primary)]">+R 1,280.00</p>
                  <p className="text-[11px] text-[var(--tp-text-secondary)]">Fee: R 5.76 (0.45%)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              TapPay Wallet SoftPOS for SA Entrepreneurs &amp; Retail
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[var(--tp-text)] leading-tight">
              Retire Expensive Card Machines. Your Smartphone Is the Terminal.
            </h2>
            <p className="text-[var(--tp-text-secondary)] leading-relaxed">
              Legacy card machines charge South African traders R 399–R 650/month in rental fees
              plus 2.75% per swipe — and hold your money for 48 hours. TapPay SoftPOS turns the NFC
              antenna already in your phone into an EMVCo L2 terminal with instant Rand clearing.
            </p>

            <div className="space-y-3 pt-2">
              {[
                'R 0.00 fee when another TapPay phone or @TapPay Wallet taps you',
                '0.45% commercial Visa / Mastercard / Apple Pay fee — strictly capped at R 18.00 max',
                'Instant settlement into your linked SA bank or @TapPay Wallet 24/7/365',
                'Shareable WhatsApp / SMS Proof of Payment (POP) on every customer tap',
              ].map((bullet) => (
                <div key={bullet} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-[var(--tp-text)] font-medium">{bullet}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 flex flex-wrap gap-3">
              <Link
                to="/business"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition"
              >
                <span>Open SoftPOS Savings Calculator</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl tp-glass text-sm font-bold text-[var(--tp-text)] hover:border-emerald-500/40 transition"
              >
                Compare All ZAR Fees
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECURITY & SARB PREVIEW ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="tp-glass rounded-[32px] p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-500">
              <ShieldCheck className="w-4 h-4" />
              Hardware-Grade Defense
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-[var(--tp-text)]">
              Engineered for SARB NPS, FICA &amp; POPIA Zero-Exposure Privacy
            </h2>
            <p className="text-sm sm:text-base text-[var(--tp-text-secondary)] leading-relaxed">
              Your real SA bank account number never crosses the 13.56 MHz contactless air
              interface. Every tap uses a single-use cryptographic token bound to your device&apos;s
              secure enclave, backed by custom PIN-free thresholds and daily ZAR settlement caps.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { label: 'NFC Protocol', val: 'ISO/IEC 14443-4 Type A/B HCE' },
                { label: 'SoftPOS Kernel', val: 'EMVCo L2 Tap-on-Phone Certified' },
                { label: 'Real-Time Switch', val: 'BankservAfrica PayShap / RTC' },
                { label: 'Wallet Segregation', val: 'SARB Ring-Fenced e-Money Trust' },
              ].map((row) => (
                <div key={row.label} className="p-3.5 rounded-2xl tp-muted-box">
                  <p className="text-[11px] uppercase tracking-wider text-[var(--tp-text-muted)] font-bold">
                    {row.label}
                  </p>
                  <p className="text-xs sm:text-sm font-mono-tabular font-bold text-[var(--tp-text)] mt-0.5">
                    {row.val}
                  </p>
                </div>
              ))}
            </div>
            <div className="pt-2">
              <Link
                to="/security"
                className="inline-flex items-center gap-1.5 text-sm font-extrabold text-emerald-500 hover:underline"
              >
                <Lock className="w-4 h-4" />
                Inspect Security Architecture &amp; Verify UTR References →
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 tp-glass-elevated rounded-[24px] p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[var(--tp-primary)]" />
              <h3 className="font-display font-extrabold text-base text-[var(--tp-text)]">
                Contactless Guardrails (SARB Compliant)
              </h3>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-[var(--tp-text-secondary)]">
                  Today&apos;s NFC Spend
                </span>
                <span className="font-mono-tabular font-extrabold text-[var(--tp-text)]">
                  {formatZAR(todayNfcSpend)} / {formatZAR(nfcSettings.dailyLimit)}
                </span>
              </div>
              <div className="h-2.5 rounded-full tp-muted-box overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--tp-primary)] transition-all"
                  style={{
                    width: `${Math.max(6, Math.min(100, Math.round((todayNfcSpend / Math.max(1, nfcSettings.dailyLimit)) * 100)))}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <p className="text-[10.5px] font-extrabold uppercase tracking-wider text-[var(--tp-text-secondary)] mb-2">
                PIN-FREE CONTACTLESS TAP THRESHOLD
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[250, 500, 1000].map((lim) => (
                  <button
                    key={lim}
                    type="button"
                    onClick={() => updateNfcSettings({ pinlessLimit: lim })}
                    className={`py-2 rounded-xl font-mono-tabular text-xs font-extrabold border transition cursor-pointer ${
                      nfcSettings.pinlessLimit === lim
                        ? 'bg-[var(--tp-primary)] text-white border-[var(--tp-primary)]'
                        : 'tp-muted-box text-[var(--tp-text)]'
                    }`}
                  >
                    R {lim}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10.5px] font-extrabold uppercase tracking-wider text-[var(--tp-text-secondary)] mb-2">
                DAILY NFC SETTLEMENT CAP
              </p>
              <div className="grid grid-cols-4 gap-2">
                {[5000, 15000, 30000, 50000].map((cap) => (
                  <button
                    key={cap}
                    type="button"
                    onClick={() => updateNfcSettings({ dailyLimit: cap })}
                    className={`py-2 rounded-xl font-mono-tabular text-xs font-extrabold border transition cursor-pointer ${
                      nfcSettings.dailyLimit === cap
                        ? 'bg-[var(--tp-primary)] text-white border-[var(--tp-primary)]'
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

      {/* ================= FAQ ACCORDION ================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center mb-10">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-500">
            Frequently Asked Questions
          </span>
          <h2 className="font-display font-extrabold text-3xl text-[var(--tp-text)] mt-1">
            Everything About TapPay Wallet
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((item, idx) => {
            const open = openFaq === idx;
            return (
              <div key={item.q} className="tp-glass rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(open ? null : idx)}
                  className="w-full px-5 sm:px-6 py-4 flex items-center justify-between gap-4 text-left cursor-pointer"
                >
                  <span className="font-display font-bold text-sm sm:text-base text-[var(--tp-text)]">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-emerald-500 shrink-0 transition-transform ${
                      open ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {open && (
                  <div className="px-5 sm:px-6 pb-5 text-sm text-[var(--tp-text-secondary)] leading-relaxed border-t border-[var(--tp-border)] pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= BOTTOM LIGHT-GLASS SA CTA BANNER ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="relative rounded-[32px] overflow-hidden tp-glass-elevated p-8 sm:p-12 lg:p-16">
          <div
            className="pointer-events-none absolute -right-24 -top-24 w-96 h-96 rounded-full bg-emerald-400/20 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -left-24 -bottom-24 w-96 h-96 rounded-full bg-sky-400/15 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-2xl space-y-3">
              <span className="text-xs font-mono-tabular font-extrabold uppercase tracking-widest text-[var(--tp-primary)]">
                From Sandton to Cape Town, Durban to Polokwane
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl leading-tight text-[var(--tp-text)]">
                Experience Direct Contactless Rand Banking Today.
              </h2>
              <p className="text-[var(--tp-text-secondary)] text-sm sm:text-base">
                Open your ring-fenced @TapPay ZAR Wallet or link your South African bank account in
                under 90 seconds. Try the full interactive app right in your browser.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                to="/simulator"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-[var(--tp-primary)] hover:bg-[var(--tp-primary-hover)] text-white font-display font-extrabold text-sm sm:text-base shadow-xl shadow-emerald-600/25 transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Web App Now</span>
              </Link>
              <button
                type="button"
                onClick={() => setDownloadModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl tp-glass hover:border-emerald-500/45 text-[var(--tp-text)] font-display font-extrabold text-sm sm:text-base transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-[var(--tp-primary)]" />
                <span>Get Mobile App</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
