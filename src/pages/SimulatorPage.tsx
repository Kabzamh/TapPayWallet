import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Building2,
  CheckCircle2,
  Fingerprint,
  Lock,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  ShieldCheck,
  Smartphone,
  Wallet,
  Wifi,
  Zap,
} from 'lucide-react';
import { useTapPay } from '../context/TapPayContext';
import {
  BankId,
  QUICK_CONTACTS,
  RETAIL_VOUCHER_CHANNELS,
  SA_BANKS,
  SA_BANK_LIST,
  SA_DATA_BUNDLES,
  SA_ELECTRICITY_VENDORS,
  SA_EWALLET_NETWORKS,
  SA_MOBILE_NETWORKS,
  SA_MUNICIPALITIES,
  SIMULATED_SA_MERCHANTS,
  SIMULATED_SOFTPOS_PAYERS,
  TAPPAY_WALLET_ID,
  formatSASTShort,
  formatZAR,
  maskAccountNumber,
} from '../data/tappayData';
import { InteractiveCard3D } from '../components/InteractiveCard3D';
import { NfcRadarVisualizer, NfcStage } from '../components/NfcRadarVisualizer';

type SimTab = 'nfc' | 'payshap_atm' | 'vas' | 'wallet_banks' | 'ledger';

export const SimulatorPage: React.FC = () => {
  const {
    wallet,
    accounts,
    defaultAccount,
    activeNfcSourceId,
    transactions,
    nfcSettings,
    todayNfcSpend,
    totalBalance,
    selectPrimaryNfcSource,
    toggleAccountNfc,
    toggleWalletNfc,
    updateNfcSettings,
    executeTapPayment,
    executeSoftPosReceive,
    executePayShapTransfer,
    executeCashSend,
    executeVasPurchase,
    topUpWallet,
    cashOutWalletToBank,
    linkNewBankAccount,
    setActiveReceipt,
    resetDemoState,
  } = useTapPay();

  const [activeTab, setActiveTab] = useState<SimTab>('nfc');
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);

  // NFC & SoftPOS tab state
  const [nfcMode, setNfcMode] = useState<'pay' | 'receive'>('pay');
  const [merchant, setMerchant] = useState(SIMULATED_SA_MERCHANTS[0]);
  const [useCustomTap, setUseCustomTap] = useState(false);
  const [customMerchantName, setCustomMerchantName] = useState('Checkers Sixty60 Till');
  const [customTapAmount, setCustomTapAmount] = useState('650');
  const [payer, setPayer] = useState(SIMULATED_SOFTPOS_PAYERS[0]);
  const [softPosAmount, setSoftPosAmount] = useState('320');
  const [stage, setStage] = useState<NfcStage>('idle');
  const [stageNote, setStageNote] = useState('Hold phone near POS terminal or TapPay device');
  const [pinPromptOpen, setPinPromptOpen] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinErr, setPinErr] = useState('');

  // PayShap & ATM Cash tab state
  const [transferSubTab, setTransferSubTab] = useState<'payshap' | 'atm'>('payshap');
  const [psRecipient, setPsRecipient] = useState(QUICK_CONTACTS[0].name);
  const [psShapId, setPsShapId] = useState(QUICK_CONTACTS[0].shapId);
  const [psBankName, setPsBankName] = useState(QUICK_CONTACTS[0].bankName);
  const [psAmount, setPsAmount] = useState('250');
  const [psRef, setPsRef] = useState('Saturday Braai');

  const [atmNetwork, setAtmNetwork] = useState(SA_EWALLET_NETWORKS[0]);
  const [atmRecipient, setAtmRecipient] = useState('Lerato Ndlovu');
  const [atmPhone, setAtmPhone] = useState('0836149021');
  const [atmAmount, setAtmAmount] = useState('500');
  const [atmSecretPin, setAtmSecretPin] = useState('4829');

  // VAS & Bills tab state
  const [vasType, setVasType] = useState<'electricity' | 'data' | 'airtime' | 'municipal'>('electricity');
  const [elecVendor, setElecVendor] = useState(SA_ELECTRICITY_VENDORS[0]);
  const [elecMeter, setElecMeter] = useState('04218890412');
  const [elecAmt, setElecAmt] = useState('250');
  const [mobNet, setMobNet] = useState(SA_MOBILE_NETWORKS[0]);
  const [mobPhone, setMobPhone] = useState('0824917732');
  const [selectedBundle, setSelectedBundle] = useState(SA_DATA_BUNDLES[1]);
  const [airtimeAmt, setAirtimeAmt] = useState('60');
  const [muni, setMuni] = useState(SA_MUNICIPALITIES[0]);

  // Wallet & Link Bank state
  const [walletAction, setWalletAction] = useState<'topup_voucher' | 'topup_bank' | 'cashout'>('topup_voucher');
  const [walletActionAmt, setWalletActionAmt] = useState('500');
  const [voucherChannel, setVoucherChannel] = useState(RETAIL_VOUCHER_CHANNELS[0]);
  const [newBankId, setNewBankId] = useState<BankId>('standard');
  const [newBankAccNo, setNewBankAccNo] = useState('0184920319');
  const [newBankType, setNewBankType] = useState<'Cheque' | 'Savings' | 'Business'>('Cheque');

  // Ledger Search & Filter
  const [ledgerFilter, setLedgerFilter] = useState<'all' | 'wallet' | 'nfc' | 'vas'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const notify = (msg: string) => {
    setBannerMsg(msg);
    setTimeout(() => setBannerMsg(null), 4000);
  };

  const isPrimaryWallet = activeNfcSourceId === TAPPAY_WALLET_ID;
  const currentTapAmount = useCustomTap ? parseFloat(customTapAmount) || 0 : merchant.amount;
  const requiresPin = currentTapAmount > nfcSettings.pinlessLimit;

  const startTapFlow = (pinAlreadyVerified = false) => {
    if (nfcMode === 'pay' && requiresPin && !pinAlreadyVerified) {
      setEnteredPin('');
      setPinErr('');
      setPinPromptOpen(true);
      return;
    }

    setStage('scanning');
    setStageNote('13.56 MHz RF Field Detected...');
    setTimeout(() => {
      setStage('authenticating');
      setStageNote(
        nfcMode === 'pay'
          ? 'Exchanging HCE Direct-to-Bank Cryptogram...'
          : 'Validating EMVCo L2 Contactless Card Token...'
      );
    }, 550);
    setTimeout(() => {
      setStage('settling');
      setStageNote('Clearing Real-Time ZAR via BankservAfrica...');
    }, 1150);
    setTimeout(() => {
      if (nfcMode === 'pay') {
        const res = executeTapPayment({
          merchantName: useCustomTap ? customMerchantName || 'SA Retail POS' : merchant.name,
          subtitle: useCustomTap ? 'Direct HCE Tap to Pay' : `${merchant.branch} • Tap to Pay`,
          amount: currentTapAmount,
          category: useCustomTap ? 'Market & Retail' : merchant.category,
          acquirerBank: useCustomTap ? 'SA Open Acquiring POS' : merchant.acquirerBank,
          pinVerified: pinAlreadyVerified,
        });
        if (!res.ok || !res.tx) {
          setStage('idle');
          setStageNote(res.error || 'NFC Tap declined.');
          return;
        }
        setStage('approved');
        setStageNote(`Approved! Settled ${formatZAR(res.tx.amount)}`);
        setActiveReceipt(res.tx);
      } else {
        const amt = parseFloat(softPosAmount) || 0;
        const res = executeSoftPosReceive({
          payerName: payer.customerName,
          payerBank: payer.bank,
          cardOrDeviceHint: payer.hint,
          amount: amt,
          referenceNote: 'TapPay Web SoftPOS',
          isCommercialCard: payer.isCommercialCard,
        });
        if (!res.ok || !res.tx) {
          setStage('idle');
          setStageNote(res.error || 'SoftPOS Tap declined.');
          return;
        }
        setStage('approved');
        setStageNote(`Credited ${formatZAR(res.tx.amount)} Instantly!`);
        setActiveReceipt(res.tx);
      }
    }, 1800);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin === nfcSettings.pinCode) {
      setPinPromptOpen(false);
      startTapFlow(true);
    } else {
      setPinErr(`Incorrect 5-digit PIN (Demo PIN is ${nfcSettings.pinCode})`);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (ledgerFilter === 'wallet' && tx.accountId !== TAPPAY_WALLET_ID && tx.channel !== 'Wallet Transfer') {
      return false;
    }
    if (ledgerFilter === 'nfc' && tx.channel !== 'NFC Tap to Pay' && tx.channel !== 'NFC SoftPOS Receive') {
      return false;
    }
    if (ledgerFilter === 'vas' && tx.channel !== 'Prepaid & Bills' && tx.channel !== 'PayShap Instant') {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        tx.title.toLowerCase().includes(q) ||
        tx.utrReference.toLowerCase().includes(q) ||
        tx.channel.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Simulator Header Bar */}
      <div className="tp-glass rounded-3xl p-5 sm:p-6 mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono-tabular font-bold uppercase tracking-wider text-emerald-500">
              INTERACTIVE TAPPAY WALLET WEB SANDBOX • THABO MOKOENA (FICA VERIFIED)
            </span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--tp-text)] mt-1">
            Combined Liquidity:{' '}
            <span className="font-mono-tabular text-emerald-500">
              {nfcSettings.hideBalances ? 'R ••••••••' : formatZAR(totalBalance)}
            </span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => updateNfcSettings({ hideBalances: !nfcSettings.hideBalances })}
            className="px-3.5 py-2 rounded-xl tp-muted-box text-xs font-bold text-[var(--tp-text)] hover:border-emerald-500/40 cursor-pointer"
          >
            {nfcSettings.hideBalances ? 'Reveal Balances' : 'Mask Balances'}
          </button>
          <button
            type="button"
            onClick={() => {
              resetDemoState();
              notify('Restored initial FNB, Capitec & @TapPay Wallet demo state.');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl tp-muted-box text-xs font-bold text-[var(--tp-text-secondary)] hover:text-rose-400 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Demo Ledger
          </button>
        </div>
      </div>

      {bannerMsg && (
        <div className="mb-6 px-4 py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-500 text-xs sm:text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{bannerMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: ACTIVE 3D CARD + RAIL SWITCHER */}
        <div className="lg:col-span-5 space-y-5">
          <div className="tp-glass-elevated rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--tp-text-secondary)]">
                Active Contactless Settlement Source
              </span>
              <span className="text-[11px] font-mono-tabular text-emerald-500 font-bold">
                Today NFC: {formatZAR(todayNfcSpend)} / {formatZAR(nfcSettings.dailyLimit)}
              </span>
            </div>

            {/* Source Pills */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => selectPrimaryNfcSource(TAPPAY_WALLET_ID)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  isPrimaryWallet
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'tp-muted-box text-[var(--tp-text)]'
                }`}
              >
                @TapPay Wallet ({formatZAR(wallet.balance)})
              </button>
              {accounts.map((acc) => {
                const active = !isPrimaryWallet && defaultAccount.id === acc.id;
                const b = SA_BANKS[acc.bankId];
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => selectPrimaryNfcSource(acc.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      active
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'tp-muted-box text-[var(--tp-text)]'
                    }`}
                  >
                    {b.shortName} ••{acc.accountNumber.slice(-4)} ({formatZAR(acc.balance)})
                  </button>
                );
              })}
            </div>

            <InteractiveCard3D
              mode={isPrimaryWallet ? 'wallet' : 'bank'}
              wallet={wallet}
              account={defaultAccount}
              privacyMask={nfcSettings.hideBalances}
              onTogglePrivacy={() =>
                updateNfcSettings({ hideBalances: !nfcSettings.hideBalances })
              }
            />
          </div>

          {/* Recent 3 Settlements Mini-Feed */}
          <div className="tp-glass rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-[var(--tp-text)]">
                Latest Real-Time Settlements
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab('ledger')}
                className="text-xs font-bold text-emerald-500 hover:underline cursor-pointer"
              >
                Full Ledger ({transactions.length}) →
              </button>
            </div>
            <div className="space-y-2">
              {transactions.slice(0, 3).map((tx) => (
                <button
                  key={tx.id}
                  type="button"
                  onClick={() => setActiveReceipt(tx)}
                  className="w-full p-3 rounded-2xl tp-muted-box hover:border-emerald-500/40 flex items-center justify-between gap-3 text-left transition cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.direction === 'in'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-500'
                          : 'bg-sky-500/15 text-sky-600 dark:text-sky-400'
                      }`}
                    >
                      {tx.direction === 'in' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[var(--tp-text)] truncate">{tx.title}</p>
                      <p className="text-[11px] text-[var(--tp-text-muted)] truncate">
                        {tx.channel} • {tx.bankShortName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={`text-xs font-mono-tabular font-extrabold ${
                        tx.direction === 'in' ? 'text-emerald-500' : 'text-[var(--tp-text)]'
                      }`}
                    >
                      {formatZAR(tx.amount, tx.direction)}
                    </p>
                    <span className="text-[10px] font-bold text-emerald-500">POP</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: MULTI-TAB INTERACTIVE WORKSPACE */}
        <div className="lg:col-span-7 space-y-5">
          {/* Workspace Tab Navigation */}
          <div className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl tp-glass">
            {[
              { id: 'nfc', label: 'NFC Tap & SoftPOS', icon: Wifi },
              { id: 'payshap_atm', label: 'PayShap & ATM Cash', icon: Zap },
              { id: 'vas', label: 'STS Power & VAS', icon: Smartphone },
              { id: 'wallet_banks', label: 'Wallet & SA Banks', icon: Building2 },
              { id: 'ledger', label: 'POP Ledger', icon: Receipt },
            ].map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id as SimTab)}
                  className={`flex-1 min-w-[128px] inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                    active
                      ? 'bg-emerald-500 text-white shadow'
                      : 'text-[var(--tp-text-secondary)] hover:text-[var(--tp-text)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: NFC TAP & SOFTPOS */}
          {activeTab === 'nfc' && (
            <div className="tp-glass-elevated rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl tp-muted-box">
                <button
                  type="button"
                  onClick={() => {
                    setNfcMode('pay');
                    setStage('idle');
                    setStageNote('Hold phone near POS terminal or TapPay device');
                  }}
                  className={`py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer ${
                    nfcMode === 'pay' ? 'bg-emerald-500 text-white' : 'text-[var(--tp-text-secondary)]'
                  }`}
                >
                  Tap to Pay (Consumer HCE)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNfcMode('receive');
                    setStage('idle');
                    setStageNote('Ask customer to tap card, phone or watch');
                  }}
                  className={`py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer ${
                    nfcMode === 'receive' ? 'bg-sky-500 text-white' : 'text-[var(--tp-text-secondary)]'
                  }`}
                >
                  Receive via SoftPOS
                </button>
              </div>

              <div className="text-center py-2">
                <NfcRadarVisualizer stage={stage} mode={nfcMode} size={156} />
                <p className="font-display font-extrabold text-3xl font-mono-tabular text-[var(--tp-text)] mt-4">
                  {nfcMode === 'pay'
                    ? formatZAR(currentTapAmount)
                    : formatZAR(parseFloat(softPosAmount) || 0)}
                </p>
                <p className="text-xs sm:text-sm text-[var(--tp-text-secondary)] mt-1">
                  {stageNote}
                </p>
                {nfcMode === 'pay' && requiresPin && (
                  <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 text-xs font-bold">
                    <Lock className="w-3.5 h-3.5" />
                    Above R {nfcSettings.pinlessLimit} PIN-Free Limit — 5-Digit PIN ({nfcSettings.pinCode}) or Biometric Required
                  </span>
                )}
              </div>

              {nfcMode === 'pay' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--tp-text-secondary)]">
                      {useCustomTap ? 'Custom Merchant POS Amount' : 'Select Simulated SA Merchant'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setUseCustomTap((c) => !c)}
                      className="text-xs font-bold text-emerald-500 hover:underline cursor-pointer"
                    >
                      {useCustomTap ? 'Use Preset SA Merchants' : 'Enter Custom Amount (> R500 PIN test)'}
                    </button>
                  </div>

                  {useCustomTap ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={customMerchantName}
                        onChange={(e) => setCustomMerchantName(e.target.value)}
                        placeholder="Merchant Name"
                        className="px-4 py-2.5 rounded-xl tp-muted-box text-sm font-semibold text-[var(--tp-text)]"
                      />
                      <input
                        type="number"
                        value={customTapAmount}
                        onChange={(e) => setCustomTapAmount(e.target.value)}
                        placeholder="Amount in ZAR"
                        className="px-4 py-2.5 rounded-xl tp-muted-box font-mono-tabular text-sm font-bold text-[var(--tp-text)]"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {SIMULATED_SA_MERCHANTS.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setMerchant(m)}
                          className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                            merchant.id === m.id
                              ? 'bg-emerald-500/15 border-emerald-500'
                              : 'tp-muted-box'
                          }`}
                        >
                          <div className="flex justify-between">
                            <span className="text-xs font-bold text-[var(--tp-text)]">{m.name}</span>
                            <span className="text-xs font-mono-tabular font-bold text-emerald-500">
                              {formatZAR(m.amount)}
                            </span>
                          </div>
                          <span className="text-[11px] text-[var(--tp-text-muted)]">{m.branch}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--tp-text-secondary)] mb-1.5">
                      Amount to Charge Customer (ZAR)
                    </label>
                    <input
                      type="number"
                      value={softPosAmount}
                      onChange={(e) => setSoftPosAmount(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl tp-muted-box font-mono-tabular text-sm font-bold text-[var(--tp-text)]"
                    />
                  </div>
                  <div className="space-y-2">
                    {SIMULATED_SOFTPOS_PAYERS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPayer(p)}
                        className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left cursor-pointer ${
                          payer.id === p.id ? 'bg-sky-500/15 border-sky-400' : 'tp-muted-box'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-[var(--tp-text)]">
                            {p.customerName} • {p.label}
                          </p>
                          <p className="text-[11px] font-mono-tabular text-[var(--tp-text-secondary)]">
                            {p.hint}
                          </p>
                        </div>
                        <span className="text-[11px] font-mono-tabular font-bold text-emerald-500">
                          {p.isCommercialCard ? '0.45%' : 'R 0 Fee'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => startTapFlow(false)}
                disabled={stage === 'scanning' || stage === 'authenticating' || stage === 'settling'}
                className={`w-full py-4 rounded-2xl font-display font-extrabold text-sm text-white shadow-xl transition cursor-pointer disabled:opacity-60 ${
                  nfcMode === 'receive'
                    ? 'bg-sky-500 hover:bg-sky-600'
                    : 'bg-emerald-500 hover:bg-emerald-600'
                }`}
              >
                {nfcMode === 'pay'
                  ? `Tap Phone Now (${formatZAR(currentTapAmount)})`
                  : `Accept SoftPOS Tap (${formatZAR(parseFloat(softPosAmount) || 0)})`}
              </button>
            </div>
          )}

          {/* TAB 2: PAYSHAP & CARDLESS ATM CASH SEND */}
          {activeTab === 'payshap_atm' && (
            <div className="tp-glass-elevated rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl tp-muted-box">
                <button
                  type="button"
                  onClick={() => setTransferSubTab('payshap')}
                  className={`py-2.5 rounded-xl text-xs font-extrabold cursor-pointer ${
                    transferSubTab === 'payshap'
                      ? 'bg-emerald-500 text-white'
                      : 'text-[var(--tp-text-secondary)]'
                  }`}
                >
                  PayShap Instant (ShapID)
                </button>
                <button
                  type="button"
                  onClick={() => setTransferSubTab('atm')}
                  className={`py-2.5 rounded-xl text-xs font-extrabold cursor-pointer ${
                    transferSubTab === 'atm'
                      ? 'bg-emerald-500 text-white'
                      : 'text-[var(--tp-text-secondary)]'
                  }`}
                >
                  Cardless ATM Cash Send
                </button>
              </div>

              {transferSubTab === 'payshap' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--tp-text-secondary)] mb-2">
                      Quick South African ShapID Contacts
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_CONTACTS.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setPsRecipient(c.name);
                            setPsShapId(c.shapId);
                            setPsBankName(c.bankName);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                            psShapId === c.shapId
                              ? 'bg-emerald-500 text-white border-emerald-500'
                              : 'tp-muted-box text-[var(--tp-text)]'
                          }`}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[var(--tp-text-secondary)] mb-1">
                        Recipient Name
                      </label>
                      <input
                        type="text"
                        value={psRecipient}
                        onChange={(e) => setPsRecipient(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl tp-muted-box text-sm font-semibold text-[var(--tp-text)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--tp-text-secondary)] mb-1">
                        ShapID or SA Cell Number
                      </label>
                      <input
                        type="text"
                        value={psShapId}
                        onChange={(e) => setPsShapId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl tp-muted-box font-mono-tabular text-sm font-semibold text-[var(--tp-text)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[var(--tp-text-secondary)] mb-1">
                        Amount (ZAR)
                      </label>
                      <input
                        type="number"
                        value={psAmount}
                        onChange={(e) => setPsAmount(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl tp-muted-box font-mono-tabular text-sm font-bold text-[var(--tp-text)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--tp-text-secondary)] mb-1">
                        Statement Reference
                      </label>
                      <input
                        type="text"
                        value={psRef}
                        onChange={(e) => setPsRef(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl tp-muted-box text-sm text-[var(--tp-text)]"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const res = executePayShapTransfer({
                        recipientName: psRecipient,
                        shapId: psShapId,
                        recipientBank: psBankName,
                        amount: parseFloat(psAmount) || 0,
                        reference: psRef,
                      });
                      if (res.ok && res.tx) setActiveReceipt(res.tx);
                      else notify(res.error || 'PayShap transfer failed.');
                    }}
                    className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-display font-extrabold text-sm transition cursor-pointer"
                  >
                    Send Instant PayShap ({formatZAR(parseFloat(psAmount) || 0)})
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--tp-text-secondary)] mb-2">
                      Select SA Cardless ATM Network
                    </label>
                    <select
                      value={atmNetwork.id}
                      onChange={(e) =>
                        setAtmNetwork(
                          SA_EWALLET_NETWORKS.find((n) => n.id === e.target.value) ||
                            SA_EWALLET_NETWORKS[0]
                        )
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl tp-muted-box text-sm font-bold text-[var(--tp-text)]"
                    >
                      {SA_EWALLET_NETWORKS.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.name} — {n.collectionHint}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={atmRecipient}
                      onChange={(e) => setAtmRecipient(e.target.value)}
                      placeholder="Recipient Name"
                      className="px-3.5 py-2.5 rounded-xl tp-muted-box text-sm text-[var(--tp-text)]"
                    />
                    <input
                      type="tel"
                      value={atmPhone}
                      onChange={(e) => setAtmPhone(e.target.value)}
                      placeholder="0836149021"
                      className="px-3.5 py-2.5 rounded-xl tp-muted-box font-mono-tabular text-sm text-[var(--tp-text)]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[var(--tp-text-secondary)] mb-1">
                        ATM Note Amount (R)
                      </label>
                      <input
                        type="number"
                        step={50}
                        value={atmAmount}
                        onChange={(e) => setAtmAmount(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl tp-muted-box font-mono-tabular text-sm font-bold text-[var(--tp-text)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--tp-text-secondary)] mb-1">
                        4-Digit Secret ATM PIN
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        value={atmSecretPin}
                        onChange={(e) => setAtmSecretPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3.5 py-2.5 rounded-xl tp-muted-box font-mono-tabular text-sm font-bold text-[var(--tp-text)]"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const res = executeCashSend({
                        recipientName: atmRecipient,
                        recipientPhone: atmPhone,
                        networkName: atmNetwork.name,
                        collectionHint: atmNetwork.collectionHint,
                        amount: parseFloat(atmAmount) || 0,
                        secretPin: atmSecretPin || '4829',
                      });
                      if (res.ok && res.tx) setActiveReceipt(res.tx);
                      else notify(res.error || 'Cash send error.');
                    }}
                    className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-display font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Banknote className="w-4 h-4" />
                    Dispatch Instant ATM Voucher
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STS ELECTRICITY, AIRTIME, DATA & MUNICIPAL */}
          {activeTab === 'vas' && (
            <div className="tp-glass-elevated rounded-3xl p-6 sm:p-8 space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'electricity', label: 'STS Power' },
                  { id: 'data', label: 'Mobile Data' },
                  { id: 'airtime', label: 'Pinless Airtime' },
                  { id: 'municipal', label: 'Metro Bills' },
                ].map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVasType(v.id as typeof vasType)}
                    className={`py-2.5 rounded-xl text-xs font-extrabold border cursor-pointer ${
                      vasType === v.id
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'tp-muted-box text-[var(--tp-text)]'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>

              {vasType === 'electricity' && (
                <div className="space-y-4">
                  <select
                    value={elecVendor}
                    onChange={(e) => setElecVendor(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl tp-muted-box text-sm font-bold text-[var(--tp-text)]"
                  >
                    {SA_ELECTRICITY_VENDORS.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={elecMeter}
                      onChange={(e) => setElecMeter(e.target.value)}
                      placeholder="11-digit STS Meter"
                      className="px-3.5 py-2.5 rounded-xl tp-muted-box font-mono-tabular text-sm text-[var(--tp-text)]"
                    />
                    <input
                      type="number"
                      value={elecAmt}
                      onChange={(e) => setElecAmt(e.target.value)}
                      placeholder="ZAR Amount"
                      className="px-3.5 py-2.5 rounded-xl tp-muted-box font-mono-tabular text-sm font-bold text-[var(--tp-text)]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const res = executeVasPurchase({
                        serviceType: 'electricity',
                        providerName: elecVendor,
                        productDescription: 'Prepaid Electricity',
                        targetIdentifier: elecMeter,
                        amount: parseFloat(elecAmt) || 0,
                      });
                      if (res.ok && res.tx) setActiveReceipt(res.tx);
                      else notify(res.error || 'Vending failed.');
                    }}
                    className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-display font-extrabold text-sm cursor-pointer"
                  >
                    Vend 20-Digit STS Token ({((parseFloat(elecAmt) || 0) / 3.42).toFixed(1)} kWh)
                  </button>
                </div>
              )}

              {(vasType === 'data' || vasType === 'airtime') && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {SA_MOBILE_NETWORKS.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => setMobNet(n)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                          mobNet.id === n.id
                            ? 'bg-emerald-500 text-white border-emerald-500'
                            : 'tp-muted-box text-[var(--tp-text)]'
                        }`}
                      >
                        {n.name}
                      </button>
                    ))}
                  </div>
                  <input
                    type="tel"
                    value={mobPhone}
                    onChange={(e) => setMobPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl tp-muted-box font-mono-tabular text-sm text-[var(--tp-text)]"
                  />
                  {vasType === 'data' ? (
                    <div className="space-y-2">
                      {SA_DATA_BUNDLES.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setSelectedBundle(b)}
                          className={`w-full px-4 py-2.5 rounded-xl border flex justify-between text-xs font-bold cursor-pointer ${
                            selectedBundle.id === b.id
                              ? 'bg-emerald-500/15 border-emerald-500 text-emerald-500'
                              : 'tp-muted-box text-[var(--tp-text)]'
                          }`}
                        >
                          <span>{b.label}</span>
                          <span className="font-mono-tabular">{formatZAR(b.amount)}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="number"
                      value={airtimeAmt}
                      onChange={(e) => setAirtimeAmt(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl tp-muted-box font-mono-tabular text-sm font-bold text-[var(--tp-text)]"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const amt = vasType === 'data' ? selectedBundle.amount : parseFloat(airtimeAmt) || 0;
                      const res = executeVasPurchase({
                        serviceType: vasType,
                        providerName: mobNet.name,
                        productDescription: vasType === 'data' ? selectedBundle.label : 'Pinless Airtime',
                        targetIdentifier: mobPhone,
                        amount: amt,
                      });
                      if (res.ok && res.tx) setActiveReceipt(res.tx);
                      else notify(res.error || 'Purchase failed.');
                    }}
                    className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-display font-extrabold text-sm cursor-pointer"
                  >
                    Recharge {mobNet.name} Now
                  </button>
                </div>
              )}

              {vasType === 'municipal' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {SA_MUNICIPALITIES.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMuni(m)}
                        className={`w-full p-3.5 rounded-2xl border flex items-center justify-between text-left cursor-pointer ${
                          muni.id === m.id ? 'bg-emerald-500/15 border-emerald-500' : 'tp-muted-box'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-[var(--tp-text)]">{m.name}</p>
                          <p className="text-[11px] text-[var(--tp-text-secondary)]">
                            {m.type} • Acct #{m.sampleAcc}
                          </p>
                        </div>
                        <span className="font-mono-tabular text-xs font-extrabold text-emerald-500">
                          {formatZAR(m.sampleDue)}
                        </span>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const res = executeVasPurchase({
                        serviceType: 'municipal',
                        providerName: muni.name,
                        productDescription: muni.type,
                        targetIdentifier: muni.sampleAcc,
                        amount: muni.sampleDue,
                      });
                      if (res.ok && res.tx) setActiveReceipt(res.tx);
                      else notify(res.error || 'Payment failed.');
                    }}
                    className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-display font-extrabold text-sm cursor-pointer"
                  >
                    Settle {muni.name} ({formatZAR(muni.sampleDue)})
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WALLET TOP-UP / CASH-OUT + LINK NEW SA BANK */}
          {activeTab === 'wallet_banks' && (
            <div className="space-y-6">
              {/* @TapPay Wallet Funding */}
              <div className="tp-glass-elevated rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-extrabold text-lg text-[var(--tp-text)] flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-emerald-500" />
                    @TapPay Ring-Fenced Wallet ({formatZAR(wallet.balance)})
                  </h3>
                  <button
                    type="button"
                    onClick={toggleWalletNfc}
                    className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer ${
                      wallet.nfcEnabled
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-500'
                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {wallet.nfcEnabled ? 'NFC Active' : 'NFC Paused'}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'topup_voucher', label: 'Cash Voucher Load' },
                    { id: 'topup_bank', label: 'RTC Bank Pull' },
                    { id: 'cashout', label: 'Cash Out to Bank' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setWalletAction(m.id as typeof walletAction)}
                      className={`py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                        walletAction === m.id
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'tp-muted-box text-[var(--tp-text)]'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {walletAction === 'topup_voucher' && (
                  <select
                    value={voucherChannel}
                    onChange={(e) => setVoucherChannel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl tp-muted-box text-xs font-bold text-[var(--tp-text)]"
                  >
                    {RETAIL_VOUCHER_CHANNELS.map((ch) => (
                      <option key={ch} value={ch}>
                        {ch}
                      </option>
                    ))}
                  </select>
                )}

                <div className="flex gap-3">
                  <input
                    type="number"
                    value={walletActionAmt}
                    onChange={(e) => setWalletActionAmt(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl tp-muted-box font-mono-tabular text-sm font-bold text-[var(--tp-text)]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const amt = parseFloat(walletActionAmt) || 0;
                      if (walletAction === 'cashout') {
                        const r = cashOutWalletToBank({ amount: amt, bankAccountId: defaultAccount.id });
                        if (r.ok && r.tx) setActiveReceipt(r.tx);
                        else notify(r.error || 'Cash-out failed.');
                      } else {
                        const r = topUpWallet({
                          amount: amt,
                          method: walletAction === 'topup_voucher' ? 'retail_voucher' : 'bank',
                          bankAccountId: defaultAccount.id,
                          voucherLabel: voucherChannel,
                        });
                        if (r.ok && r.tx) setActiveReceipt(r.tx);
                        else notify(r.error || 'Top-up failed.');
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold cursor-pointer"
                  >
                    Execute (R 0 Fee)
                  </button>
                </div>
              </div>

              {/* Link Another SA Bank Mandate */}
              <div className="tp-glass rounded-3xl p-6 space-y-4">
                <h3 className="font-display font-extrabold text-lg text-[var(--tp-text)] flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-500" />
                  Link Additional South African Bank Account (DebiCheck HCE)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select
                    value={newBankId}
                    onChange={(e) => setNewBankId(e.target.value as BankId)}
                    className="px-3.5 py-2.5 rounded-xl tp-muted-box text-xs font-bold text-[var(--tp-text)]"
                  >
                    {SA_BANK_LIST.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.shortName} (Br {b.universalBranchCode})
                      </option>
                    ))}
                  </select>
                  <select
                    value={newBankType}
                    onChange={(e) => setNewBankType(e.target.value as typeof newBankType)}
                    className="px-3.5 py-2.5 rounded-xl tp-muted-box text-xs font-bold text-[var(--tp-text)]"
                  >
                    {['Cheque', 'Savings', 'Business'].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={newBankAccNo}
                    onChange={(e) => setNewBankAccNo(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="10-digit SA Account #"
                    className="px-3.5 py-2.5 rounded-xl tp-muted-box font-mono-tabular text-xs font-bold text-[var(--tp-text)]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (newBankAccNo.length < 9) {
                      notify('Enter a 9 to 11-digit South African account number.');
                      return;
                    }
                    const created = linkNewBankAccount({
                      bankId: newBankId,
                      accountNumber: newBankAccNo,
                      accountHolder: 'T MOKOENA',
                      accountType: newBankType,
                      makeDefault: true,
                    });
                    notify(
                      `Linked & tokenized ${SA_BANKS[created.bankId].name} (${maskAccountNumber(created.accountNumber)})!`
                    );
                  }}
                  className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-display font-bold text-xs sm:text-sm cursor-pointer"
                >
                  Authorize DebiCheck &amp; Provision ISO 14443-4 Token
                </button>

                {/* Existing Linked Accounts List */}
                <div className="space-y-2 pt-2">
                  {accounts.map((acc) => {
                    const b = SA_BANKS[acc.bankId];
                    return (
                      <div
                        key={acc.id}
                        className="p-3 rounded-2xl tp-muted-box flex items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <span className="font-bold text-[var(--tp-text)]">
                            {b.name} ({maskAccountNumber(acc.accountNumber)})
                          </span>
                          <span className="block text-[11px] font-mono-tabular text-[var(--tp-text-muted)]">
                            Mandate {acc.mandateRef} • {formatZAR(acc.balance)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleAccountNfc(acc.id)}
                          className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${
                            acc.nfcEnabled
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-500'
                              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {acc.nfcEnabled ? 'HCE Ready' : 'Paused'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FULL SEARCHABLE SETTLEMENT LEDGER */}
          {activeTab === 'ledger' && (
            <div className="tp-glass-elevated rounded-3xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[var(--tp-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search merchant, rail or ZA-TAP UTR..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl tp-muted-box text-xs sm:text-sm text-[var(--tp-text)]"
                  />
                </div>
                <div className="flex gap-1.5">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'wallet', label: 'Wallet' },
                    { id: 'nfc', label: 'NFC' },
                    { id: 'vas', label: 'VAS/Shap' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setLedgerFilter(f.id as typeof ledgerFilter)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                        ledgerFilter === f.id
                          ? 'bg-emerald-500 text-white'
                          : 'tp-muted-box text-[var(--tp-text-secondary)]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
                {filteredTransactions.map((tx) => (
                  <button
                    key={tx.id}
                    type="button"
                    onClick={() => setActiveReceipt(tx)}
                    className="w-full p-3.5 rounded-2xl tp-muted-box hover:border-emerald-500/45 flex items-center justify-between gap-3 text-left transition cursor-pointer"
                  >
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[var(--tp-text)]">
                        {tx.title}
                      </p>
                      <p className="text-[11px] text-[var(--tp-text-secondary)]">
                        {tx.subtitle} • {formatSASTShort(tx.timestamp)}
                      </p>
                      <p className="text-[10px] font-mono-tabular text-[var(--tp-text-muted)] mt-0.5">
                        {tx.utrReference}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={`text-sm font-mono-tabular font-extrabold ${
                          tx.direction === 'in' ? 'text-emerald-500' : 'text-[var(--tp-text)]'
                        }`}
                      >
                        {formatZAR(tx.amount, tx.direction)}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500 text-[10px] font-bold">
                        Official POP
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5-DIGIT SA BANKING PIN / BIOMETRIC PASSKEY MODAL (Mirrors App Module 671 PinAuthModal) */}
      {pinPromptOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1320]/42 backdrop-blur-md"
          onClick={() => setPinPromptOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-[28px] tp-glass-elevated p-6 space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--tp-primary-soft)] text-[var(--tp-primary)] flex items-center justify-center mx-auto">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-xl text-[var(--tp-text)]">
                Verify Direct Bank PIN
              </h3>
              <p className="text-xs text-[var(--tp-text-secondary)] mt-1">
                Required for contactless security above R {nfcSettings.pinlessLimit} threshold
              </p>
              <span className="inline-block mt-2.5 px-3.5 py-1 rounded-full tp-muted-box font-mono-tabular text-xs font-bold text-[var(--tp-text)]">
                Authorizing {formatZAR(currentTapAmount)}
              </span>
            </div>

            {/* 5 PIN Dots */}
            <div className="flex justify-center gap-3.5 py-2">
              {[0, 1, 2, 3, 4].map((idx) => {
                const filled = idx < enteredPin.length;
                return (
                  <span
                    key={idx}
                    className={`w-4 h-4 rounded-full border-2 transition ${
                      filled
                        ? 'bg-[var(--tp-primary)] border-[var(--tp-primary)]'
                        : 'border-[var(--tp-border-strong)] bg-transparent'
                    }`}
                  />
                );
              })}
            </div>

            {pinErr ? (
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{pinErr}</p>
            ) : (
              <p className="text-xs text-[var(--tp-text-muted)]">
                Enter your 5-digit SA Banking PIN (Default:{' '}
                <strong className="font-mono-tabular text-[var(--tp-text)]">
                  {nfcSettings.pinCode}
                </strong>
                )
              </p>
            )}

            {/* Tactile 3x4 Keypad */}
            <form onSubmit={handlePinSubmit} className="space-y-3">
              <div className="grid grid-cols-3 gap-2.5">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => {
                      if (enteredPin.length >= 5) return;
                      const next = enteredPin + digit;
                      setEnteredPin(next);
                      setPinErr('');
                      if (next.length === 5) {
                        if (next === nfcSettings.pinCode) {
                          setPinPromptOpen(false);
                          startTapFlow(true);
                        } else {
                          setPinErr(`Incorrect 5-digit PIN (Demo PIN: ${nfcSettings.pinCode})`);
                          setTimeout(() => setEnteredPin(''), 350);
                        }
                      }
                    }}
                    className="h-12 rounded-[14px] tp-muted-box hover:border-emerald-500/45 font-mono-tabular text-lg font-bold text-[var(--tp-text)] transition cursor-pointer"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setPinPromptOpen(false);
                    startTapFlow(true);
                  }}
                  className="h-12 rounded-[14px] bg-[var(--tp-primary-soft)] text-[var(--tp-primary)] flex items-center justify-center cursor-pointer"
                  title="Approve with Biometric Passkey"
                >
                  <Fingerprint className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (enteredPin.length >= 5) return;
                    const next = enteredPin + '0';
                    setEnteredPin(next);
                    setPinErr('');
                    if (next.length === 5) {
                      if (next === nfcSettings.pinCode) {
                        setPinPromptOpen(false);
                        startTapFlow(true);
                      } else {
                        setPinErr(`Incorrect 5-digit PIN (Demo PIN: ${nfcSettings.pinCode})`);
                        setTimeout(() => setEnteredPin(''), 350);
                      }
                    }
                  }}
                  className="h-12 rounded-[14px] tp-muted-box hover:border-emerald-500/45 font-mono-tabular text-lg font-bold text-[var(--tp-text)] transition cursor-pointer"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEnteredPin((p) => p.slice(0, -1));
                    setPinErr('');
                  }}
                  className="h-12 rounded-[14px] tp-muted-box text-xs font-bold text-[var(--tp-text-secondary)] cursor-pointer"
                >
                  DEL
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPinPromptOpen(false);
                  startTapFlow(true);
                }}
                className="w-full py-3 rounded-[14px] bg-[var(--tp-primary-soft)] border border-[var(--tp-primary)] text-[var(--tp-primary)] text-xs font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Fingerprint className="w-4 h-4" />
                Approve with Biometric Passkey
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
