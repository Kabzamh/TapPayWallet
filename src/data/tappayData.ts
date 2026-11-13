export type BankId =
  | 'fnb'
  | 'capitec'
  | 'standard'
  | 'absa'
  | 'nedbank'
  | 'discovery'
  | 'tymebank';

export const TAPPAY_WALLET_ID = 'tappay-wallet';

export interface SaBankMeta {
  id: BankId;
  name: string;
  shortName: string;
  universalBranchCode: string;
  swiftCode: string;
  binPrefix: string;
  lostCardHelpline: string;
  gradient: [string, string, string];
  accentColor: string;
  payShapDomain: string;
}

export const SA_BANKS: Record<BankId, SaBankMeta> = {
  fnb: {
    id: 'fnb',
    name: 'First National Bank (FNB)',
    shortName: 'FNB',
    universalBranchCode: '250655',
    swiftCode: 'FIRNZAJJ',
    binPrefix: '4539 78',
    lostCardHelpline: '087 575 9404',
    gradient: ['#007982', '#005662', '#07222B'],
    accentColor: '#009CA6',
    payShapDomain: 'fnb',
  },
  capitec: {
    id: 'capitec',
    name: 'Capitec Bank',
    shortName: 'Capitec',
    universalBranchCode: '470010',
    swiftCode: 'CABLZAJJ',
    binPrefix: '5399 41',
    lostCardHelpline: '0860 10 20 43',
    gradient: ['#004B6E', '#13315C', '#8F1D2C'],
    accentColor: '#E63946',
    payShapDomain: 'capitec',
  },
  standard: {
    id: 'standard',
    name: 'Standard Bank SA',
    shortName: 'Standard Bank',
    universalBranchCode: '051001',
    swiftCode: 'SBZAZAJJ',
    binPrefix: '5221 60',
    lostCardHelpline: '0800 020 600',
    gradient: ['#0033A1', '#002473', '#07153D'],
    accentColor: '#1E64F0',
    payShapDomain: 'standardbank',
  },
  absa: {
    id: 'absa',
    name: 'Absa Bank',
    shortName: 'Absa',
    universalBranchCode: '632005',
    swiftCode: 'ABSAZAJJ',
    binPrefix: '4038 22',
    lostCardHelpline: '0800 111 155',
    gradient: ['#BE0028', '#8A001D', '#3D0412'],
    accentColor: '#E11D48',
    payShapDomain: 'absa',
  },
  nedbank: {
    id: 'nedbank',
    name: 'Nedbank',
    shortName: 'Nedbank',
    universalBranchCode: '198765',
    swiftCode: 'NEDSZAJJ',
    binPrefix: '5196 18',
    lostCardHelpline: '0800 110 929',
    gradient: ['#006341', '#00452D', '#072419'],
    accentColor: '#10B981',
    payShapDomain: 'nedbank',
  },
  discovery: {
    id: 'discovery',
    name: 'Discovery Bank',
    shortName: 'Discovery',
    universalBranchCode: '679000',
    swiftCode: 'DISCZAJJ',
    binPrefix: '4790 88',
    lostCardHelpline: '0800 07 96 97',
    gradient: ['#1E222B', '#2C261E', '#8C6A2A'],
    accentColor: '#D4AF37',
    payShapDomain: 'discovery',
  },
  tymebank: {
    id: 'tymebank',
    name: 'TymeBank',
    shortName: 'TymeBank',
    universalBranchCode: '678910',
    swiftCode: 'CBZAZAJJ',
    binPrefix: '5338 90',
    lostCardHelpline: '0860 999 119',
    gradient: ['#27272A', '#3F3212', '#B48200'],
    accentColor: '#F5B800',
    payShapDomain: 'tymebank',
  },
};

export const SA_BANK_LIST: SaBankMeta[] = Object.values(SA_BANKS);

export interface TapPayWallet {
  id: string;
  walletNumber: string;
  handle: string;
  shapId: string;
  balance: number;
  maxCap: number;
  nfcEnabled: boolean;
  isPrimaryNfc: boolean;
}

export interface LinkedBankAccount {
  id: string;
  bankId: BankId;
  accountHolder: string;
  accountNumber: string;
  accountType: 'Cheque' | 'Savings' | 'Business';
  branchCode: string;
  balance: number;
  isDefault: boolean;
  nfcEnabled: boolean;
  shapId: string;
  mandateRef: string;
}

export type PaymentChannel =
  | 'NFC Tap to Pay'
  | 'NFC SoftPOS Receive'
  | 'PayShap Instant'
  | 'Wallet Transfer'
  | 'e-Wallet Cash Send'
  | 'Prepaid & Bills';

export interface LedgerTransaction {
  id: string;
  utrReference: string;
  title: string;
  subtitle: string;
  amount: number;
  fee: number;
  direction: 'in' | 'out';
  channel: PaymentChannel;
  category: string;
  accountId: string;
  bankShortName: string;
  maskedAccount: string;
  counterpartyBank: string;
  cardOrDeviceHint: string;
  vasToken?: string;
  vasMeta?: string;
  timestamp: string;
  status: 'Settled';
}

export const INITIAL_WALLET: TapPayWallet = {
  id: TAPPAY_WALLET_ID,
  walletNumber: 'TP-884-920-114',
  handle: '@thabo.tappay',
  shapId: '0824917732@tappay',
  balance: 2450.0,
  maxCap: 25000,
  nfcEnabled: true,
  isPrimaryNfc: false,
};

export const INITIAL_ACCOUNTS: LinkedBankAccount[] = [
  {
    id: 'acc-fnb-primary',
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
  {
    id: 'acc-capitec-secondary',
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
];

export interface SimulatedMerchant {
  id: string;
  name: string;
  branch: string;
  amount: number;
  category: string;
  acquirerBank: string;
}

export const SIMULATED_SA_MERCHANTS: SimulatedMerchant[] = [
  {
    id: 'm-woolies',
    name: 'Woolworths Food',
    branch: 'Sandton City, JHB',
    amount: 342.9,
    category: 'Groceries',
    acquirerBank: 'Standard Bank POS',
  },
  {
    id: 'm-vida',
    name: 'Vida e Caffè',
    branch: 'Rosebank Mall, JHB',
    amount: 58.0,
    category: 'Coffee & Dining',
    acquirerBank: 'Nedbank Tap POS',
  },
  {
    id: 'm-gautrain',
    name: 'Gautrain Transit Gate',
    branch: 'Sandton → Rosebank',
    amount: 64.0,
    category: 'Fuel & Gautrain',
    acquirerBank: 'FNB Transit Reader',
  },
  {
    id: 'm-engen',
    name: 'Engen 1Plus Forecourt',
    branch: 'Midrand N1 North',
    amount: 780.0,
    category: 'Fuel & Gautrain',
    acquirerBank: 'Absa Verifone NFC',
  },
  {
    id: 'm-checkers',
    name: 'Checkers Sixty60 / Hyper',
    branch: 'Menlyn Maine, PTA',
    amount: 615.4,
    category: 'Groceries',
    acquirerBank: 'Capitec Business POS',
  },
];

export interface SimulatedSoftPosPayer {
  id: string;
  label: string;
  hint: string;
  bank: string;
  customerName: string;
  isCommercialCard: boolean;
}

export const SIMULATED_SOFTPOS_PAYERS: SimulatedSoftPosPayer[] = [
  {
    id: 'p-2',
    label: 'TapPay HCE Direct Phone',
    hint: 'TapPay Direct • FNB Cheque •••• 2204',
    bank: 'FNB',
    customerName: 'Naledi Molefe',
    isCommercialCard: false,
  },
  {
    id: 'p-1',
    label: 'Capitec Contactless Card',
    hint: 'ISO 14443-4 • Mastercard •••• 5519',
    bank: 'Capitec Bank',
    customerName: 'Bongani Sithole',
    isCommercialCard: true,
  },
  {
    id: 'p-3',
    label: 'Discovery Apple Pay Watch',
    hint: 'EMV Token • Visa Infinite •••• 9081',
    bank: 'Discovery Bank',
    customerName: 'Johan Pretorius',
    isCommercialCard: true,
  },
];

export const QUICK_CONTACTS = [
  {
    id: 'c-1',
    name: 'Lerato Ndlovu',
    initials: 'LN',
    shapId: '0836149021@capitec',
    bankName: 'Capitec Bank',
    avatarBg: '#0D9488',
    phone: '0836149021',
  },
  {
    id: 'c-2',
    name: 'Sipho Khumalo',
    initials: 'SK',
    shapId: '0728814410@fnb',
    bankName: 'First National Bank',
    avatarBg: '#2563EB',
    phone: '0728814410',
  },
  {
    id: 'c-3',
    name: 'Pieter van Wyk',
    initials: 'PV',
    shapId: '0823091182@standardbank',
    bankName: 'Standard Bank SA',
    avatarBg: '#7C3AED',
    phone: '0823091182',
  },
  {
    id: 'c-4',
    name: 'Zanele Dlamini',
    initials: 'ZD',
    shapId: '0614498823@nedbank',
    bankName: 'Nedbank',
    avatarBg: '#059669',
    phone: '0614498823',
  },
  {
    id: 'c-5',
    name: 'Amahle Zulu',
    initials: 'AZ',
    shapId: '0795520194@discovery',
    bankName: 'Discovery Bank',
    avatarBg: '#D97706',
    phone: '0795520194',
  },
];

export const SA_EWALLET_NETWORKS = [
  {
    id: 'ew-fnb',
    name: 'FNB eWallet',
    bank: 'First National Bank',
    collectionHint: 'Any FNB ATM nationwide (*120*277#)',
    color: '#009CA6',
  },
  {
    id: 'ew-capitec',
    name: 'Capitec Send Cash',
    bank: 'Capitec Bank',
    collectionHint: 'Capitec ATMs, Checkers, Shoprite, PnP & Boxer',
    color: '#E63946',
  },
  {
    id: 'ew-standard',
    name: 'Standard Bank Instant Money',
    bank: 'Standard Bank SA',
    collectionHint: 'Standard Bank ATMs, Spar, PnP & Shoprite',
    color: '#1E64F0',
  },
  {
    id: 'ew-absa',
    name: 'Absa CashSend',
    bank: 'Absa Bank',
    collectionHint: 'Any Absa ATM nationwide (Cardless CashSend)',
    color: '#E11D48',
  },
  {
    id: 'ew-nedbank',
    name: 'Nedbank Send-iMali',
    bank: 'Nedbank',
    collectionHint: 'Nedbank ATMs & Pick n Pay / Boxer tills',
    color: '#10B981',
  },
  {
    id: 'ew-discovery',
    name: 'Discovery Instant Cash',
    bank: 'Discovery Bank',
    collectionHint: 'Discovery / FNB Cardless ATM Network',
    color: '#D4AF37',
  },
  {
    id: 'ew-tymebank',
    name: 'TymeBank Cash Voucher',
    bank: 'TymeBank',
    collectionHint: 'Pick n Pay & Boxer Tills Nationwide',
    color: '#F5B800',
  },
];

export const SA_MOBILE_NETWORKS = [
  { id: 'vodacom', name: 'Vodacom', color: '#E60000' },
  { id: 'mtn', name: 'MTN SA', color: '#FFCC00' },
  { id: 'telkom', name: 'Telkom Mobile', color: '#0083C2' },
  { id: 'cellc', name: 'Cell C', color: '#F36F21' },
  { id: 'rain', name: 'Rain 5G', color: '#00A8E8' },
];

export const SA_DATA_BUNDLES = [
  { id: 'd-1', label: '1 GB Anytime (7 Days)', amount: 65 },
  { id: 'd-2', label: '2 GB Anytime (30 Days)', amount: 99 },
  { id: 'd-3', label: '3 GB WhatsApp & Social', amount: 49 },
  { id: 'd-4', label: '5 GB + 5 GB Night (30 Days)', amount: 199 },
  { id: 'd-5', label: '10 GB Anytime (30 Days)', amount: 299 },
];

export const SA_ELECTRICITY_VENDORS = [
  'Eskom Direct Prepaid',
  'City Power (Johannesburg)',
  'City of Cape Town Electricity',
  'City of Tshwane Prepaid',
  'eThekwini Electricity',
];

export const SA_MUNICIPALITIES = [
  {
    id: 'muni-coj',
    name: 'City of Johannesburg (COJ)',
    type: 'Rates, Water & Refuse',
    sampleAcc: '550918442',
    sampleDue: 1485.6,
  },
  {
    id: 'muni-cct',
    name: 'City of Cape Town',
    type: 'Consolidated Municipal Bill',
    sampleAcc: '310488219',
    sampleDue: 1240.0,
  },
  {
    id: 'muni-eth',
    name: 'eThekwini Metro (Durban)',
    type: 'Metro Services & Water',
    sampleAcc: '883012945',
    sampleDue: 980.45,
  },
  {
    id: 'muni-cot',
    name: 'City of Tshwane (Pretoria)',
    type: 'Utility & Property Rates',
    sampleAcc: '601928374',
    sampleDue: 1620.0,
  },
  {
    id: 'muni-eku',
    name: 'City of Ekurhuleni',
    type: 'Municipal Rates & Taxes',
    sampleAcc: '449012831',
    sampleDue: 1115.2,
  },
];

export const RETAIL_VOUCHER_CHANNELS = [
  'Pick n Pay / Boxer Till Cash',
  '1Voucher (Flash / Pep / Ackermans)',
  'OTT Voucher (Spaza & Forecourts)',
  'Blu Voucher (Checkers / Shoprite)',
];

function hoursAgoIso(h: number): string {
  return new Date(Date.now() - h * 3600 * 1000).toISOString();
}

export const INITIAL_TRANSACTIONS: LedgerTransaction[] = [
  {
    id: 'tx-101',
    utrReference: 'ZA-TAP-20261112-482910',
    title: 'Woolworths Food',
    subtitle: 'Sandton City • Tap to Pay',
    amount: 284.5,
    fee: 0,
    direction: 'out',
    channel: 'NFC Tap to Pay',
    category: 'Groceries',
    accountId: 'acc-fnb-primary',
    bankShortName: 'FNB',
    maskedAccount: '•••• 8492',
    counterpartyBank: 'Standard Bank Acquiring',
    cardOrDeviceHint: 'HCE Direct Token •••• 8492',
    timestamp: hoursAgoIso(2.1),
    status: 'Settled',
  },
  {
    id: 'tx-102',
    utrReference: 'ZA-POS-20261112-918344',
    title: 'Lerato Ndlovu',
    subtitle: 'Saturday Braai Split • Tap Received',
    amount: 450.0,
    fee: 0,
    direction: 'in',
    channel: 'NFC SoftPOS Receive',
    category: 'Peer Transfer',
    accountId: 'acc-fnb-primary',
    bankShortName: 'FNB',
    maskedAccount: '•••• 8492',
    counterpartyBank: 'Capitec Bank',
    cardOrDeviceHint: 'TapPay Direct • Capitec •••• 7104',
    timestamp: hoursAgoIso(5.4),
    status: 'Settled',
  },
  {
    id: 'tx-103',
    utrReference: 'ZA-TAP-20261111-339120',
    title: 'Vida e Caffè',
    subtitle: 'Rosebank • Paid via TapPay Wallet',
    amount: 76.0,
    fee: 0,
    direction: 'out',
    channel: 'NFC Tap to Pay',
    category: 'Coffee & Dining',
    accountId: TAPPAY_WALLET_ID,
    bankShortName: 'TapPay Wallet',
    maskedAccount: '•• 0114',
    counterpartyBank: 'Nedbank POS',
    cardOrDeviceHint: 'TapPay e-Money Token •• 0114',
    timestamp: hoursAgoIso(21.5),
    status: 'Settled',
  },
  {
    id: 'tx-103b',
    utrReference: 'ZA-WLT-20261111-512094',
    title: 'Pick n Pay Till Top-Up',
    subtitle: 'Sandton Retail Cash Deposit → Wallet',
    amount: 1000.0,
    fee: 0,
    direction: 'in',
    channel: 'Wallet Transfer',
    category: 'Wallet Funding',
    accountId: TAPPAY_WALLET_ID,
    bankShortName: 'TapPay Wallet',
    maskedAccount: '•• 0114',
    counterpartyBank: 'SARB Ring-Fenced e-Money Trust',
    cardOrDeviceHint: 'Retail Cash / 1Voucher Instant Load',
    timestamp: hoursAgoIso(25.2),
    status: 'Settled',
  },
  {
    id: 'tx-104',
    utrReference: 'ZA-POS-20261111-774102',
    title: 'Neighbourgoods Market Stall',
    subtitle: 'Braamfontein • Customer Card Tap',
    amount: 1280.0,
    fee: 5.76,
    direction: 'in',
    channel: 'NFC SoftPOS Receive',
    category: 'Market & Retail',
    accountId: 'acc-capitec-secondary',
    bankShortName: 'Capitec',
    maskedAccount: '•••• 3109',
    counterpartyBank: 'Discovery Bank',
    cardOrDeviceHint: 'EMV Contactless • Visa •••• 9081',
    timestamp: hoursAgoIso(28.0),
    status: 'Settled',
  },
  {
    id: 'tx-104b',
    utrReference: 'ZA-ATM-20261110-664291',
    title: 'FNB eWallet • Zanele Dlamini',
    subtitle: 'Instant ATM Cash Send • 061 449 8823',
    amount: 500.0,
    fee: 7.5,
    direction: 'out',
    channel: 'e-Wallet Cash Send',
    category: 'Peer Transfer',
    accountId: TAPPAY_WALLET_ID,
    bankShortName: 'TapPay Wallet',
    maskedAccount: '•• 0114',
    counterpartyBank: 'FNB Cardless ATM Network',
    cardOrDeviceHint: 'Any FNB ATM (*120*277#) • Valid 30 Days',
    vasToken: 'Voucher 4918 302 841 • PIN 7390',
    vasMeta: 'Recipient 0614498823 • FNB eWallet ATM',
    timestamp: hoursAgoIso(34.0),
    status: 'Settled',
  },
  {
    id: 'tx-105',
    utrReference: 'ZA-SHP-20261110-609188',
    title: 'Sipho Khumalo',
    subtitle: 'PayShap • Padel Court Booking',
    amount: 320.0,
    fee: 0,
    direction: 'out',
    channel: 'PayShap Instant',
    category: 'Peer Transfer',
    accountId: 'acc-fnb-primary',
    bankShortName: 'FNB',
    maskedAccount: '•••• 8492',
    counterpartyBank: 'First National Bank',
    cardOrDeviceHint: 'ShapID 0728814410@fnb',
    timestamp: hoursAgoIso(46.0),
    status: 'Settled',
  },
  {
    id: 'tx-105b',
    utrReference: 'ZA-VAS-20261109-301842',
    title: 'City Power (Johannesburg)',
    subtitle: 'Prepaid Electricity • 73.1 kWh',
    amount: 250.0,
    fee: 0,
    direction: 'out',
    channel: 'Prepaid & Bills',
    category: 'Mobile & Utilities',
    accountId: TAPPAY_WALLET_ID,
    bankShortName: 'TapPay Wallet',
    maskedAccount: '•• 0114',
    counterpartyBank: 'STS National Vending Switch',
    cardOrDeviceHint: 'Meter #04218890412 (73.1 kWh)',
    vasToken: '4821 9034 7712 6509 1184',
    vasMeta: '73.1 kWh • Meter 04218890412',
    timestamp: hoursAgoIso(58.0),
    status: 'Settled',
  },
];

export function formatZAR(amount: number, direction?: 'in' | 'out'): string {
  const fixed = Math.abs(amount).toFixed(2);
  const [whole, cents] = fixed.split('.');
  const formatted = `R ${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${cents}`;
  if (direction === 'in') return `+${formatted}`;
  if (direction === 'out') return `-${formatted}`;
  return formatted;
}

export function maskAccountNumber(acc: string): string {
  const clean = acc.replace(/\s+/g, '');
  return `•••• ${clean.slice(-4)}`;
}

export function generateUTR(prefix = 'TAP'): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `ZA-${prefix}-${y}${m}${day}-${rand}`;
}

export function generateStsToken(): string {
  const groups: string[] = [];
  for (let i = 0; i < 5; i++) {
    groups.push(String(Math.floor(1000 + Math.random() * 9000)));
  }
  return groups.join(' ');
}

export function generateCashVoucher(): string {
  const a = String(Math.floor(1000 + Math.random() * 9000));
  const b = String(Math.floor(100 + Math.random() * 900));
  const c = String(Math.floor(100 + Math.random() * 900));
  return `${a} ${b} ${c}`;
}

export function formatSASTShort(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  const yest = new Date(now);
  yest.setDate(now.getDate() - 1);
  const isYest =
    d.getDate() === yest.getDate() &&
    d.getMonth() === yest.getMonth() &&
    d.getFullYear() === yest.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  if (isToday) return `Today, ${hh}:${mm}`;
  if (isYest) return `Yesterday, ${hh}:${mm}`;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${hh}:${mm}`;
}

export function formatFullReceiptTimestamp(iso: string): string {
  const d = new Date(iso);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} at ${hh}:${mm}:${ss} SAST`;
}
