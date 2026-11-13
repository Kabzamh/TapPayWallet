import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Smartphone, Sparkles, X, ShieldCheck } from 'lucide-react';
import { useTapPay } from '../context/TapPayContext';
import { TapPayBrandMark } from './Icons';

export const DownloadAppModal: React.FC = () => {
  const { downloadModalOpen, setDownloadModalOpen } = useTapPay();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [smsSent, setSmsSent] = useState(false);

  if (!downloadModalOpen) return null;

  const handleSendSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.replace(/\D/g, '').length < 9) return;
    setSmsSent(true);
    setTimeout(() => setSmsSent(false), 4000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1320]/42 backdrop-blur-md"
      onClick={() => setDownloadModalOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-3xl tp-glass-elevated p-6 sm:p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setDownloadModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-xl tp-muted-box text-[var(--tp-text-secondary)] hover:text-[var(--tp-text)] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <TapPayBrandMark size={44} />
          <div>
            <h3 className="font-display font-extrabold text-xl sm:text-2xl text-[var(--tp-text)]">
              Get TapPay Wallet
            </h3>
            <p className="text-xs sm:text-sm text-[var(--tp-text-secondary)]">
              iOS 17+, Android NFC HCE &amp; Huawei HarmonyOS (EMVCo L2 Certified)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-5 items-center my-6">
          {/* Stylized Vector QR Code */}
          <div className="sm:col-span-2 p-4 rounded-2xl bg-white text-slate-900 flex flex-col items-center shadow-inner">
            <svg viewBox="0 0 120 120" className="w-32 h-32">
              <rect width="120" height="120" rx="8" fill="#FFFFFF" />
              {/* Finder patterns */}
              <rect x="10" y="10" width="30" height="30" rx="4" stroke="#059669" strokeWidth="5" fill="none" />
              <rect x="18" y="18" width="14" height="14" rx="2" fill="#0B1320" />
              <rect x="80" y="10" width="30" height="30" rx="4" stroke="#059669" strokeWidth="5" fill="none" />
              <rect x="88" y="18" width="14" height="14" rx="2" fill="#0B1320" />
              <rect x="10" y="80" width="30" height="30" rx="4" stroke="#059669" strokeWidth="5" fill="none" />
              <rect x="18" y="88" width="14" height="14" rx="2" fill="#0B1320" />
              {/* Data modules */}
              <g fill="#0B1320">
                <rect x="48" y="12" width="6" height="6" />
                <rect x="60" y="12" width="6" height="6" />
                <rect x="54" y="20" width="12" height="6" />
                <rect x="48" y="30" width="6" height="10" />
                <rect x="64" y="30" width="6" height="6" />
                <rect x="12" y="48" width="10" height="6" />
                <rect x="28" y="48" width="6" height="12" />
                <rect x="46" y="46" width="28" height="28" rx="6" fill="#059669" />
                <circle cx="60" cy="60" r="6" fill="#FFFFFF" />
                <rect x="82" y="48" width="8" height="6" />
                <rect x="96" y="48" width="12" height="6" />
                <rect x="84" y="60" width="10" height="10" />
                <rect x="102" y="64" width="6" height="12" />
                <rect x="48" y="82" width="8" height="8" />
                <rect x="62" y="84" width="12" height="6" />
                <rect x="80" y="82" width="14" height="8" />
                <rect x="100" y="82" width="8" height="14" />
                <rect x="50" y="98" width="16" height="10" />
                <rect x="74" y="98" width="10" height="10" />
                <rect x="90" y="102" width="18" height="6" />
              </g>
            </svg>
            <span className="text-[11px] font-bold text-slate-700 mt-2">
              Scan with Camera to Install
            </span>
          </div>

          {/* Store Badges + SMS */}
          <div className="sm:col-span-3 space-y-3">
            <div className="grid grid-cols-1 gap-2">
              {[
                { store: 'Apple App Store', sub: 'iPhone NFC & Biometric Passkey' },
                { store: 'Google Play Store', sub: 'Android HCE & SoftPOS Kernel' },
                { store: 'Huawei AppGallery', sub: 'HMS Core NFC Direct Certified' },
              ].map((item) => (
                <button
                  key={item.store}
                  type="button"
                  onClick={() => {
                    setDownloadModalOpen(false);
                    navigate('/simulator');
                  }}
                  className="flex items-center justify-between px-4 py-2.5 rounded-xl tp-muted-box hover:border-emerald-500/50 text-left transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-emerald-500 shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[var(--tp-text)]">
                        {item.store}
                      </p>
                      <p className="text-[11px] text-[var(--tp-text-secondary)]">{item.sub}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-500">Install →</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Send SMS Link */}
        <form onSubmit={handleSendSms} className="pt-4 border-t border-[var(--tp-border)]">
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--tp-text-secondary)] mb-2">
            Send Instant Download Link via SA SMS (Free)
          </label>
          <div className="flex gap-2">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+27 82 491 7732"
              className="flex-1 px-4 py-2.5 rounded-xl tp-muted-box text-sm font-mono-tabular text-[var(--tp-text)] focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold transition cursor-pointer"
            >
              Text Link
            </button>
          </div>
          {smsSent && (
            <p className="mt-2 text-xs font-semibold text-emerald-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Download link dispatched via SA SMS gateway!
            </p>
          )}
        </form>

        {/* Instant Web Sandbox Option */}
        <div className="mt-5 pt-4 border-t border-[var(--tp-border)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[var(--tp-text-secondary)]">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Want to test TapPay Wallet right now in your browser?</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setDownloadModalOpen(false);
              navigate('/simulator');
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-500 text-xs font-extrabold hover:bg-emerald-500/25 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Open Interactive Web App
          </button>
        </div>
      </div>
    </div>
  );
};
