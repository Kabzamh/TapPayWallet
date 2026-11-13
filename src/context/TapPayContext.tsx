import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  BankId,
  INITIAL_ACCOUNTS,
  INITIAL_TRANSACTIONS,
  INITIAL_WALLET,
  LedgerTransaction,
  LinkedBankAccount,
  SA_BANKS,
  TAPPAY_WALLET_ID,
  TapPayWallet,
  generateCashVoucher,
  generateStsToken,
  generateUTR,
  maskAccountNumber,
} from '../data/tappayData';

export interface NfcGuardrailSettings {
  pinlessLimit: number;
  dailyLimit: number;
  biometricsEnabled: boolean;
  hideBalances: boolean;
  pinCode: string;
}

interface TapPayContextValue {
  isDark: boolean;
  toggleTheme: () => void;
  wallet: TapPayWallet;
  accounts: LinkedBankAccount[];
  defaultAccount: LinkedBankAccount;
  activeNfcSourceId: string;
  transactions: LedgerTransaction[];
  nfcSettings: NfcGuardrailSettings;
  todayNfcSpend: number;
  totalBalance: number;
  activeReceipt: LedgerTransaction | null;
  setActiveReceipt: (tx: LedgerTransaction | null) => void;
  downloadModalOpen: boolean;
  setDownloadModalOpen: (open: boolean) => void;
  selectPrimaryNfcSource: (sourceId: string) => void;
  toggleAccountNfc: (accountId: string) => void;
  toggleWalletNfc: () => void;
  updateNfcSettings: (partial: Partial<NfcGuardrailSettings>) => void;
  executeTapPayment: (params: {
    merchantName: string;
    subtitle: string;
    amount: number;
    category: string;
    acquirerBank: string;
    sourceId?: string;
    pinVerified?: boolean;
  }) => { ok: boolean; error?: string; tx?: LedgerTransaction };
  executeSoftPosReceive: (params: {
    payerName: string;
    payerBank: string;
    cardOrDeviceHint: string;
    amount: number;
    referenceNote?: string;
    isCommercialCard?: boolean;
    sourceId?: string;
  }) => { ok: boolean; error?: string; tx?: LedgerTransaction };
  executePayShapTransfer: (params: {
    recipientName: string;
    shapId: string;
    recipientBank: string;
    amount: number;
    reference?: string;
    sourceId?: string;
  }) => { ok: boolean; error?: string; tx?: LedgerTransaction };
  executeCashSend: (params: {
    recipientName: string;
    recipientPhone: string;
    networkName: string;
    collectionHint: string;
    amount: number;
    secretPin: string;
    sourceId?: string;
  }) => { ok: boolean; error?: string; tx?: LedgerTransaction };
  executeVasPurchase: (params: {
    serviceType: 'data' | 'airtime' | 'electricity' | 'municipal';
    providerName: string;
    productDescription: string;
    targetIdentifier: string;
    amount: number;
    sourceId?: string;
  }) => { ok: boolean; error?: string; tx?: LedgerTransaction };
  topUpWallet: (params: {
    amount: number;
    method: 'bank' | 'retail_voucher';
    bankAccountId?: string;
    voucherLabel?: string;
  }) => { ok: boolean; error?: string; tx?: LedgerTransaction };
  cashOutWalletToBank: (params: {
    amount: number;
    bankAccountId: string;
  }) => { ok: boolean; error?: string; tx?: LedgerTransaction };
  linkNewBankAccount: (params: {
    bankId: BankId;
    accountNumber: string;
    accountHolder: string;
    accountType: 'Cheque' | 'Savings' | 'Business';
    makeDefault: boolean;
  }) => LinkedBankAccount;
  resetDemoState: () => void;
}

const STORAGE_KEYS = {
  THEME: 'tappay_web_theme_light_v3',
  WALLET: 'tappay_web_wallet_v1',
  ACCOUNTS: 'tappay_web_accounts_v1',
  TXS: 'tappay_web_txs_v1',
  SETTINGS: 'tappay_web_settings_v1',
};

const DEFAULT_SETTINGS: NfcGuardrailSettings = {
  pinlessLimit: 500,
  dailyLimit: 15000,
  biometricsEnabled: true,
  hideBalances: false,
  pinCode: '25800',
};

const TapPayContext = createContext<TapPayContextValue | undefined>(undefined);

export const TapPayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      return saved ? saved === 'dark' : false;
    } catch {
      return false;
    }
  });

  const [wallet, setWallet] = useState<TapPayWallet>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEYS.WALLET);
      return s ? { ...INITIAL_WALLET, ...JSON.parse(s) } : INITIAL_WALLET;
    } catch {
      return INITIAL_WALLET;
    }
  });

  const [accounts, setAccounts] = useState<LinkedBankAccount[]>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      const parsed = s ? JSON.parse(s) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_ACCOUNTS;
    } catch {
      return INITIAL_ACCOUNTS;
    }
  });

  const [transactions, setTransactions] = useState<LedgerTransaction[]>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEYS.TXS);
      const parsed = s ? JSON.parse(s) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [nfcSettings, setNfcSettings] = useState<NfcGuardrailSettings>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return s ? { ...DEFAULT_SETTINGS, ...JSON.parse(s) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [activeReceipt, setActiveReceipt] = useState<LedgerTransaction | null>(null);
  const [downloadModalOpen, setDownloadModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
    } catch {
      // ignore storage errors
    }
  }, [isDark]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(wallet));
    } catch {}
  }, [wallet]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    } catch {}
  }, [accounts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TXS, JSON.stringify(transactions));
    } catch {}
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(nfcSettings));
    } catch {}
  }, [nfcSettings]);

  const toggleTheme = useCallback(() => setIsDark((prev) => !prev), []);

  const defaultAccount = useMemo(
    () => accounts.find((a) => a.isDefault) || accounts[0],
    [accounts]
  );

  const activeNfcSourceId = useMemo(
    () => (wallet.isPrimaryNfc ? TAPPAY_WALLET_ID : defaultAccount.id),
    [wallet.isPrimaryNfc, defaultAccount.id]
  );

  const totalBalance = useMemo(() => {
    const bankSum = accounts.reduce((sum, a) => sum + a.balance, 0);
    return Number((bankSum + wallet.balance).toFixed(2));
  }, [accounts, wallet.balance]);

  const todayNfcSpend = useMemo(() => {
    const now = new Date();
    return transactions
      .filter((tx) => {
        if (tx.direction !== 'out' || tx.channel === 'Wallet Transfer') return false;
        const d = new Date(tx.timestamp);
        return (
          d.getDate() === now.getDate() &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .reduce((s, tx) => s + tx.amount, 0);
  }, [transactions]);

  const selectPrimaryNfcSource = useCallback(
    (sourceId: string) => {
      if (sourceId === TAPPAY_WALLET_ID) {
        setWallet((w) => ({ ...w, isPrimaryNfc: true }));
        return;
      }
      setAccounts((prev) => prev.map((a) => ({ ...a, isDefault: a.id === sourceId })));
      setWallet((w) => (w.isPrimaryNfc ? { ...w, isPrimaryNfc: false } : w));
    },
    []
  );

  const toggleAccountNfc = useCallback((accountId: string) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === accountId ? { ...a, nfcEnabled: !a.nfcEnabled } : a))
    );
  }, []);

  const toggleWalletNfc = useCallback(() => {
    setWallet((w) => ({ ...w, nfcEnabled: !w.nfcEnabled }));
  }, []);

  const updateNfcSettings = useCallback((partial: Partial<NfcGuardrailSettings>) => {
    setNfcSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const executeTapPayment: TapPayContextValue['executeTapPayment'] = useCallback(
    (params) => {
      const src = params.sourceId || activeNfcSourceId;
      if (!params.amount || params.amount <= 0) {
        return { ok: false, error: 'Enter a valid ZAR payment amount.' };
      }
      if (todayNfcSpend + params.amount > nfcSettings.dailyLimit) {
        return {
          ok: false,
          error: `Exceeds daily NFC guardrail of R ${nfcSettings.dailyLimit.toLocaleString()}.`,
        };
      }

      if (src === TAPPAY_WALLET_ID) {
        if (!wallet.nfcEnabled) {
          return { ok: false, error: 'NFC contactless token is paused on @TapPay Wallet.' };
        }
        if (wallet.balance < params.amount) {
          return {
            ok: false,
            error: 'Insufficient @TapPay Wallet funds. Top up or switch to a linked SA bank.',
          };
        }
        const masked = `•• ${wallet.walletNumber.slice(-4)}`;
        const tx: LedgerTransaction = {
          id: `tx-${Date.now()}`,
          utrReference: generateUTR('TAP'),
          title: params.merchantName,
          subtitle: params.subtitle,
          amount: Number(params.amount.toFixed(2)),
          fee: 0,
          direction: 'out',
          channel: 'NFC Tap to Pay',
          category: params.category,
          accountId: TAPPAY_WALLET_ID,
          bankShortName: 'TapPay Wallet',
          maskedAccount: masked,
          counterpartyBank: params.acquirerBank,
          cardOrDeviceHint: `TapPay e-Money Token ${masked}${params.pinVerified ? ' (PIN Verified)' : ''}`,
          timestamp: new Date().toISOString(),
          status: 'Settled',
        };
        setWallet((w) => ({ ...w, balance: Number((w.balance - params.amount).toFixed(2)) }));
        setTransactions((prev) => [tx, ...prev]);
        return { ok: true, tx };
      }

      const acc = accounts.find((a) => a.id === src) || defaultAccount;
      const bank = SA_BANKS[acc.bankId];
      if (!acc.nfcEnabled) {
        return {
          ok: false,
          error: `HCE Contactless token is paused on ${bank.shortName} ${maskAccountNumber(acc.accountNumber)}.`,
        };
      }
      if (acc.balance < params.amount) {
        return {
          ok: false,
          error: `Insufficient funds in ${bank.shortName} (${maskAccountNumber(acc.accountNumber)}).`,
        };
      }
      const masked = maskAccountNumber(acc.accountNumber);
      const tx: LedgerTransaction = {
        id: `tx-${Date.now()}`,
        utrReference: generateUTR('TAP'),
        title: params.merchantName,
        subtitle: params.subtitle,
        amount: Number(params.amount.toFixed(2)),
        fee: 0,
        direction: 'out',
        channel: 'NFC Tap to Pay',
        category: params.category,
        accountId: acc.id,
        bankShortName: bank.shortName,
        maskedAccount: masked,
        counterpartyBank: params.acquirerBank,
        cardOrDeviceHint: `HCE Direct Token ${masked}${params.pinVerified ? ' (PIN Verified)' : ''}`,
        timestamp: new Date().toISOString(),
        status: 'Settled',
      };
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === acc.id ? { ...a, balance: Number((a.balance - params.amount).toFixed(2)) } : a
        )
      );
      setTransactions((prev) => [tx, ...prev]);
      return { ok: true, tx };
    },
    [activeNfcSourceId, todayNfcSpend, nfcSettings.dailyLimit, wallet, accounts, defaultAccount]
  );

  const executeSoftPosReceive: TapPayContextValue['executeSoftPosReceive'] = useCallback(
    (params) => {
      const src = params.sourceId || activeNfcSourceId;
      if (!params.amount || params.amount <= 0) {
        return { ok: false, error: 'Enter a valid Rand amount to receive.' };
      }
      const fee = params.isCommercialCard
        ? Math.min(18, Number((params.amount * 0.0045).toFixed(2)))
        : 0;
      const net = Number((params.amount - fee).toFixed(2));

      if (src === TAPPAY_WALLET_ID) {
        if (wallet.balance + net > wallet.maxCap) {
          return {
            ok: false,
            error: `Would exceed your R ${wallet.maxCap.toLocaleString()} SARB Tier-2 Wallet cap.`,
          };
        }
        const masked = `•• ${wallet.walletNumber.slice(-4)}`;
        const tx: LedgerTransaction = {
          id: `tx-${Date.now()}`,
          utrReference: generateUTR('POS'),
          title: params.payerName,
          subtitle: params.referenceNote
            ? `${params.referenceNote} • Credited to Wallet`
            : 'SoftPOS Contactless • Credited to Wallet',
          amount: Number(params.amount.toFixed(2)),
          fee,
          direction: 'in',
          channel: 'NFC SoftPOS Receive',
          category: params.isCommercialCard ? 'Market & Retail' : 'Peer Transfer',
          accountId: TAPPAY_WALLET_ID,
          bankShortName: 'TapPay Wallet',
          maskedAccount: masked,
          counterpartyBank: params.payerBank,
          cardOrDeviceHint: params.cardOrDeviceHint,
          timestamp: new Date().toISOString(),
          status: 'Settled',
        };
        setWallet((w) => ({ ...w, balance: Number((w.balance + net).toFixed(2)) }));
        setTransactions((prev) => [tx, ...prev]);
        return { ok: true, tx };
      }

      const acc = accounts.find((a) => a.id === src) || defaultAccount;
      const bank = SA_BANKS[acc.bankId];
      const masked = maskAccountNumber(acc.accountNumber);
      const tx: LedgerTransaction = {
        id: `tx-${Date.now()}`,
        utrReference: generateUTR('POS'),
        title: params.payerName,
        subtitle: params.referenceNote
          ? `${params.referenceNote} • Tap Received`
          : 'SoftPOS Contactless • Tap Received',
        amount: Number(params.amount.toFixed(2)),
        fee,
        direction: 'in',
        channel: 'NFC SoftPOS Receive',
        category: params.isCommercialCard ? 'Market & Retail' : 'Peer Transfer',
        accountId: acc.id,
        bankShortName: bank.shortName,
        maskedAccount: masked,
        counterpartyBank: params.payerBank,
        cardOrDeviceHint: params.cardOrDeviceHint,
        timestamp: new Date().toISOString(),
        status: 'Settled',
      };
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === acc.id ? { ...a, balance: Number((a.balance + net).toFixed(2)) } : a
        )
      );
      setTransactions((prev) => [tx, ...prev]);
      return { ok: true, tx };
    },
    [activeNfcSourceId, wallet, accounts, defaultAccount]
  );

  const executePayShapTransfer: TapPayContextValue['executePayShapTransfer'] = useCallback(
    (params) => {
      const src = params.sourceId || activeNfcSourceId;
      if (!params.amount || params.amount <= 0) {
        return { ok: false, error: 'Enter a valid ZAR amount.' };
      }
      if (params.amount > 50000) {
        return { ok: false, error: 'PayShap real-time maximum is R 50,000 per transfer.' };
      }
      const isWallet = src === TAPPAY_WALLET_ID;
      const fee = isWallet ? (params.amount > 500 ? 1.5 : 0) : params.amount > 100 ? 1.5 : 0;
      const total = Number((params.amount + fee).toFixed(2));

      if (isWallet) {
        if (wallet.balance < total) {
          return { ok: false, error: 'Insufficient funds in your @TapPay Wallet.' };
        }
        const masked = `•• ${wallet.walletNumber.slice(-4)}`;
        const tx: LedgerTransaction = {
          id: `tx-${Date.now()}`,
          utrReference: generateUTR('SHP'),
          title: params.recipientName,
          subtitle: params.reference ? `PayShap • ${params.reference}` : `PayShap • ${params.shapId}`,
          amount: Number(params.amount.toFixed(2)),
          fee,
          direction: 'out',
          channel: 'PayShap Instant',
          category: 'Peer Transfer',
          accountId: TAPPAY_WALLET_ID,
          bankShortName: 'TapPay Wallet',
          maskedAccount: masked,
          counterpartyBank: params.recipientBank,
          cardOrDeviceHint: `ShapID ${params.shapId}`,
          timestamp: new Date().toISOString(),
          status: 'Settled',
        };
        setWallet((w) => ({ ...w, balance: Number((w.balance - total).toFixed(2)) }));
        setTransactions((prev) => [tx, ...prev]);
        return { ok: true, tx };
      }

      const acc = accounts.find((a) => a.id === src) || defaultAccount;
      const bank = SA_BANKS[acc.bankId];
      if (acc.balance < total) {
        return { ok: false, error: `Insufficient funds in ${bank.shortName} account.` };
      }
      const masked = maskAccountNumber(acc.accountNumber);
      const tx: LedgerTransaction = {
        id: `tx-${Date.now()}`,
        utrReference: generateUTR('SHP'),
        title: params.recipientName,
        subtitle: params.reference ? `PayShap • ${params.reference}` : `PayShap • ${params.shapId}`,
        amount: Number(params.amount.toFixed(2)),
        fee,
        direction: 'out',
        channel: 'PayShap Instant',
        category: 'Peer Transfer',
        accountId: acc.id,
        bankShortName: bank.shortName,
        maskedAccount: masked,
        counterpartyBank: params.recipientBank,
        cardOrDeviceHint: `ShapID ${params.shapId}`,
        timestamp: new Date().toISOString(),
        status: 'Settled',
      };
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === acc.id ? { ...a, balance: Number((a.balance - total).toFixed(2)) } : a
        )
      );
      setTransactions((prev) => [tx, ...prev]);
      return { ok: true, tx };
    },
    [activeNfcSourceId, wallet, accounts, defaultAccount]
  );

  const executeCashSend: TapPayContextValue['executeCashSend'] = useCallback(
    (params) => {
      const src = params.sourceId || activeNfcSourceId;
      if (params.amount < 50 || params.amount % 10 !== 0 || params.amount > 5000) {
        return {
          ok: false,
          error: 'Enter an SA ATM note multiple between R 50 and R 5,000 (e.g. R 100, R 500).',
        };
      }
      const isWallet = src === TAPPAY_WALLET_ID;
      const fee = isWallet ? 7.5 : params.amount <= 1000 ? 9.5 : 15.5;
      const total = Number((params.amount + fee).toFixed(2));
      const token = `Voucher ${generateCashVoucher()} • PIN ${params.secretPin}`;
      const meta = `Recipient ${params.recipientPhone} • ${params.networkName}`;

      if (isWallet) {
        if (wallet.balance < total) {
          return { ok: false, error: 'Insufficient @TapPay Wallet funds (incl. R 7.50 ATM fee).' };
        }
        const masked = `•• ${wallet.walletNumber.slice(-4)}`;
        const tx: LedgerTransaction = {
          id: `tx-${Date.now()}`,
          utrReference: generateUTR('ATM'),
          title: `${params.networkName} • ${params.recipientName}`,
          subtitle: `Instant ATM Cash • ${params.recipientPhone}`,
          amount: Number(params.amount.toFixed(2)),
          fee,
          direction: 'out',
          channel: 'e-Wallet Cash Send',
          category: 'Peer Transfer',
          accountId: TAPPAY_WALLET_ID,
          bankShortName: 'TapPay Wallet',
          maskedAccount: masked,
          counterpartyBank: `${params.networkName} ATM Switch`,
          cardOrDeviceHint: `${params.collectionHint} • Valid 30 Days`,
          vasToken: token,
          vasMeta: meta,
          timestamp: new Date().toISOString(),
          status: 'Settled',
        };
        setWallet((w) => ({ ...w, balance: Number((w.balance - total).toFixed(2)) }));
        setTransactions((prev) => [tx, ...prev]);
        return { ok: true, tx };
      }

      const acc = accounts.find((a) => a.id === src) || defaultAccount;
      const bank = SA_BANKS[acc.bankId];
      if (acc.balance < total) {
        return { ok: false, error: `Insufficient funds in ${bank.shortName} account.` };
      }
      const masked = maskAccountNumber(acc.accountNumber);
      const tx: LedgerTransaction = {
        id: `tx-${Date.now()}`,
        utrReference: generateUTR('ATM'),
        title: `${params.networkName} • ${params.recipientName}`,
        subtitle: `Instant ATM Cash • ${params.recipientPhone}`,
        amount: Number(params.amount.toFixed(2)),
        fee,
        direction: 'out',
        channel: 'e-Wallet Cash Send',
        category: 'Peer Transfer',
        accountId: acc.id,
        bankShortName: bank.shortName,
        maskedAccount: masked,
        counterpartyBank: `${params.networkName} ATM Switch`,
        cardOrDeviceHint: `${params.collectionHint} • Valid 30 Days`,
        vasToken: token,
        vasMeta: meta,
        timestamp: new Date().toISOString(),
        status: 'Settled',
      };
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === acc.id ? { ...a, balance: Number((a.balance - total).toFixed(2)) } : a
        )
      );
      setTransactions((prev) => [tx, ...prev]);
      return { ok: true, tx };
    },
    [activeNfcSourceId, wallet, accounts, defaultAccount]
  );

  const executeVasPurchase: TapPayContextValue['executeVasPurchase'] = useCallback(
    (params) => {
      const src = params.sourceId || activeNfcSourceId;
      if (!params.amount || params.amount <= 0) {
        return { ok: false, error: 'Enter a valid ZAR amount.' };
      }
      const isWallet = src === TAPPAY_WALLET_ID;
      const fee = params.serviceType === 'municipal' && !isWallet ? 2.0 : 0;
      const total = Number((params.amount + fee).toFixed(2));
      const isPower = params.serviceType === 'electricity';
      const kwh = isPower ? (params.amount / 3.42).toFixed(1) : null;
      const sts = isPower ? generateStsToken() : undefined;

      const subtitle = isPower
        ? `Prepaid Electricity • ${kwh} kWh`
        : params.serviceType === 'municipal'
          ? `Municipal Acct #${params.targetIdentifier}`
          : `${params.productDescription} • ${params.targetIdentifier}`;

      const switchName = isPower
        ? 'STS National Vending Switch'
        : params.serviceType === 'municipal'
          ? 'EasyPay / Municipal Clearing'
          : `${params.providerName} Pinless Direct`;

      const hint = isPower
        ? `Meter #${params.targetIdentifier} (${kwh} kWh)`
        : params.serviceType === 'municipal'
          ? `Municipal Ref #${params.targetIdentifier}`
          : `SIM ${params.targetIdentifier} • Instant Pinless`;

      const vasMeta = isPower
        ? `${kwh} kWh • Meter ${params.targetIdentifier}`
        : `${params.productDescription} • ${params.targetIdentifier}`;

      if (isWallet) {
        if (wallet.balance < total) {
          return { ok: false, error: 'Insufficient @TapPay Wallet funds.' };
        }
        const masked = `•• ${wallet.walletNumber.slice(-4)}`;
        const tx: LedgerTransaction = {
          id: `tx-${Date.now()}`,
          utrReference: generateUTR('VAS'),
          title: params.providerName,
          subtitle,
          amount: Number(params.amount.toFixed(2)),
          fee,
          direction: 'out',
          channel: 'Prepaid & Bills',
          category: 'Mobile & Utilities',
          accountId: TAPPAY_WALLET_ID,
          bankShortName: 'TapPay Wallet',
          maskedAccount: masked,
          counterpartyBank: switchName,
          cardOrDeviceHint: hint,
          vasToken: sts,
          vasMeta,
          timestamp: new Date().toISOString(),
          status: 'Settled',
        };
        setWallet((w) => ({ ...w, balance: Number((w.balance - total).toFixed(2)) }));
        setTransactions((prev) => [tx, ...prev]);
        return { ok: true, tx };
      }

      const acc = accounts.find((a) => a.id === src) || defaultAccount;
      const bank = SA_BANKS[acc.bankId];
      if (acc.balance < total) {
        return { ok: false, error: `Insufficient funds in ${bank.shortName} account.` };
      }
      const masked = maskAccountNumber(acc.accountNumber);
      const tx: LedgerTransaction = {
        id: `tx-${Date.now()}`,
        utrReference: generateUTR('VAS'),
        title: params.providerName,
        subtitle,
        amount: Number(params.amount.toFixed(2)),
        fee,
        direction: 'out',
        channel: 'Prepaid & Bills',
        category: 'Mobile & Utilities',
        accountId: acc.id,
        bankShortName: bank.shortName,
        maskedAccount: masked,
        counterpartyBank: switchName,
        cardOrDeviceHint: hint,
        vasToken: sts,
        vasMeta,
        timestamp: new Date().toISOString(),
        status: 'Settled',
      };
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === acc.id ? { ...a, balance: Number((a.balance - total).toFixed(2)) } : a
        )
      );
      setTransactions((prev) => [tx, ...prev]);
      return { ok: true, tx };
    },
    [activeNfcSourceId, wallet, accounts, defaultAccount]
  );

  const topUpWallet: TapPayContextValue['topUpWallet'] = useCallback(
    (params) => {
      if (!params.amount || params.amount <= 0) {
        return { ok: false, error: 'Enter a valid ZAR top-up amount.' };
      }
      if (wallet.balance + params.amount > wallet.maxCap) {
        return {
          ok: false,
          error: `SARB FICA Tier-2 e-Money cap is R ${wallet.maxCap.toLocaleString()}.`,
        };
      }
      const masked = `•• ${wallet.walletNumber.slice(-4)}`;
      if (params.method === 'retail_voucher') {
        const label = params.voucherLabel || 'Pick n Pay / Boxer Till Cash';
        const tx: LedgerTransaction = {
          id: `tx-${Date.now()}`,
          utrReference: generateUTR('WLT'),
          title: `${label} Top-Up`,
          subtitle: 'Independent Cash / Voucher → TapPay Wallet',
          amount: Number(params.amount.toFixed(2)),
          fee: 0,
          direction: 'in',
          channel: 'Wallet Transfer',
          category: 'Wallet Funding',
          accountId: TAPPAY_WALLET_ID,
          bankShortName: 'TapPay Wallet',
          maskedAccount: masked,
          counterpartyBank: 'SARB Ring-Fenced e-Money Trust',
          cardOrDeviceHint: `${label} Instant Deposit`,
          timestamp: new Date().toISOString(),
          status: 'Settled',
        };
        setWallet((w) => ({ ...w, balance: Number((w.balance + params.amount).toFixed(2)) }));
        setTransactions((prev) => [tx, ...prev]);
        return { ok: true, tx };
      }

      const acc = accounts.find((a) => a.id === params.bankAccountId) || defaultAccount;
      const bank = SA_BANKS[acc.bankId];
      if (acc.balance < params.amount) {
        return { ok: false, error: `Insufficient funds in ${bank.shortName}.` };
      }
      const tx: LedgerTransaction = {
        id: `tx-${Date.now()}`,
        utrReference: generateUTR('WLT'),
        title: `Wallet Top-Up from ${bank.shortName}`,
        subtitle: `${bank.shortName} ${maskAccountNumber(acc.accountNumber)} → TapPay Wallet`,
        amount: Number(params.amount.toFixed(2)),
        fee: 0,
        direction: 'in',
        channel: 'Wallet Transfer',
        category: 'Wallet Funding',
        accountId: TAPPAY_WALLET_ID,
        bankShortName: 'TapPay Wallet',
        maskedAccount: masked,
        counterpartyBank: `${bank.name} (${maskAccountNumber(acc.accountNumber)})`,
        cardOrDeviceHint: 'Instant RTC Bank-to-Wallet Load',
        timestamp: new Date().toISOString(),
        status: 'Settled',
      };
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === acc.id ? { ...a, balance: Number((a.balance - params.amount).toFixed(2)) } : a
        )
      );
      setWallet((w) => ({ ...w, balance: Number((w.balance + params.amount).toFixed(2)) }));
      setTransactions((prev) => [tx, ...prev]);
      return { ok: true, tx };
    },
    [wallet, accounts, defaultAccount]
  );

  const cashOutWalletToBank: TapPayContextValue['cashOutWalletToBank'] = useCallback(
    (params) => {
      if (!params.amount || params.amount <= 0) {
        return { ok: false, error: 'Enter a valid ZAR payout amount.' };
      }
      if (wallet.balance < params.amount) {
        return { ok: false, error: 'Insufficient available balance in @TapPay Wallet.' };
      }
      const acc = accounts.find((a) => a.id === params.bankAccountId) || defaultAccount;
      const bank = SA_BANKS[acc.bankId];
      const maskedBank = maskAccountNumber(acc.accountNumber);
      const maskedWallet = `•• ${wallet.walletNumber.slice(-4)}`;
      const tx: LedgerTransaction = {
        id: `tx-${Date.now()}`,
        utrReference: generateUTR('WLT'),
        title: `Cash Out to ${bank.shortName}`,
        subtitle: `TapPay Wallet → ${bank.shortName} ${maskedBank}`,
        amount: Number(params.amount.toFixed(2)),
        fee: 0,
        direction: 'out',
        channel: 'Wallet Transfer',
        category: 'Wallet Funding',
        accountId: TAPPAY_WALLET_ID,
        bankShortName: 'TapPay Wallet',
        maskedAccount: maskedWallet,
        counterpartyBank: `${bank.name} (${maskedBank})`,
        cardOrDeviceHint: 'Instant RTC Wallet-to-Bank Payout',
        timestamp: new Date().toISOString(),
        status: 'Settled',
      };
      setWallet((w) => ({ ...w, balance: Number((w.balance - params.amount).toFixed(2)) }));
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === acc.id ? { ...a, balance: Number((a.balance + params.amount).toFixed(2)) } : a
        )
      );
      setTransactions((prev) => [tx, ...prev]);
      return { ok: true, tx };
    },
    [wallet, accounts, defaultAccount]
  );

  const linkNewBankAccount: TapPayContextValue['linkNewBankAccount'] = useCallback(
    (params) => {
      const bank = SA_BANKS[params.bankId];
      const cleanAcc = params.accountNumber.replace(/\D/g, '');
      const newAcc: LinkedBankAccount = {
        id: `acc-${params.bankId}-${Date.now()}`,
        bankId: params.bankId,
        accountHolder: params.accountHolder.trim().toUpperCase() || 'T MOKOENA',
        accountNumber: cleanAcc,
        accountType: params.accountType,
        branchCode: bank.universalBranchCode,
        balance: Number((6500 + Math.random() * 18000).toFixed(2)),
        isDefault: params.makeDefault,
        nfcEnabled: true,
        shapId: `0824917732@${bank.payShapDomain}`,
        mandateRef: `DBK-${bank.id.slice(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
      };
      setAccounts((prev) =>
        params.makeDefault
          ? [...prev.map((a) => ({ ...a, isDefault: false })), newAcc]
          : [...prev, newAcc]
      );
      if (params.makeDefault) {
        setWallet((w) => ({ ...w, isPrimaryNfc: false }));
      }
      return newAcc;
    },
    []
  );

  const resetDemoState = useCallback(() => {
    setWallet(INITIAL_WALLET);
    setAccounts(INITIAL_ACCOUNTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setNfcSettings(DEFAULT_SETTINGS);
  }, []);

  const value = useMemo(
    () => ({
      isDark,
      toggleTheme,
      wallet,
      accounts,
      defaultAccount,
      activeNfcSourceId,
      transactions,
      nfcSettings,
      todayNfcSpend,
      totalBalance,
      activeReceipt,
      setActiveReceipt,
      downloadModalOpen,
      setDownloadModalOpen,
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
      resetDemoState,
    }),
    [
      isDark,
      toggleTheme,
      wallet,
      accounts,
      defaultAccount,
      activeNfcSourceId,
      transactions,
      nfcSettings,
      todayNfcSpend,
      totalBalance,
      activeReceipt,
      downloadModalOpen,
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
      resetDemoState,
    ]
  );

  return <TapPayContext.Provider value={value}>{children}</TapPayContext.Provider>;
};

export function useTapPay(): TapPayContextValue {
  const ctx = useContext(TapPayContext);
  if (!ctx) throw new Error('useTapPay must be used within a TapPayProvider');
  return ctx;
}
