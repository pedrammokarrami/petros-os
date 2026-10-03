import { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  ShieldCheck,
  Zap,
  Coins,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  Lock,
  Sparkles,
  Smartphone,
  User,
  Tag,
  AlertCircle,
  RefreshCw,
  Building2,
  Wallet,
  Receipt,
  ArrowRight,
  ExternalLink,
  Settings,
  HelpCircle,
  Key,
  Globe,
  ChevronDown,
  ChevronUp,
  CheckCheck,
} from 'lucide-react';

export interface PaymentItem {
  id: string;
  type: 'hours' | 'subscription';
  titleFa: string;
  titleEn: string;
  hoursAdded?: number;
  planKey?: 'pro' | 'unlimited';
  priceToman: number;
  priceUsdt: number;
  badgeFa?: string;
  badgeEn?: string;
  descriptionFa: string;
  descriptionEn: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: PaymentItem | null;
  language?: string;
  onPaymentSuccess: (item: PaymentItem) => void;
}

// Utility to convert Latin digits to Persian digits
const toPersianDigits = (n: number | string): string => {
  const str = String(n);
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[0-9]/g, (w) => persianDigits[parseInt(w, 10)]);
};

export function PaymentGatewayModal({
  isOpen,
  onClose,
  item,
  language = 'fa',
  onPaymentSuccess,
}: Props) {
  const isFa = language === 'fa';

  // Gateway mode: 'rial' (Shetab / Iran) or 'crypto' (International / USDT / Web3)
  const [gatewayType, setGatewayType] = useState<'rial' | 'crypto'>('rial');

  // Form states for Rial payment
  const [fullName, setFullName] = useState(isFa ? 'آرمین شفیعی' : 'Armin Shafiei');
  const [mobileNumber, setMobileNumber] = useState(isFa ? '۰۹۱۲۳۴۵۶۷۸۹' : '09123456789');
  const [selectedIpg, setSelectedIpg] = useState<'zarinpal' | 'saman' | 'mellat' | 'zibal'>('zarinpal');
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState<number | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);

  // Crypto Gateway Providers (No-KYC Providers)
  const [cryptoProvider, setCryptoProvider] = useState<'oxapay' | 'cryptomus' | 'nowpayments' | 'web3_direct'>('oxapay');
  const [selectedCrypto, setSelectedCrypto] = useState<'usdt_trc20' | 'ton' | 'usdt_bep20' | 'trx' | 'sol' | 'btc'>('usdt_trc20');
  const [txHash, setTxHash] = useState('');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [showNoKycGuide, setShowNoKycGuide] = useState(false);

  // Merchant API Config State (Stored in localStorage for full persistence)
  const [merchantApiKey, setMerchantApiKey] = useState(() => localStorage.getItem('codgar_crypto_merchant_key') || '');
  const [merchantPayoutWallet, setMerchantPayoutWallet] = useState(() => localStorage.getItem('codgar_crypto_payout_wallet') || 'TQ7s8j9vK2Lp4N1wY5xZ6aBcDeFgHiJkLm');
  const [apiSaveStatus, setApiSaveStatus] = useState<string | null>(null);

  // Step state: 'checkout' -> 'bank_terminal' | 'crypto_verifying' -> 'success'
  const [paymentStep, setPaymentStep] = useState<'checkout' | 'bank_terminal' | 'crypto_verifying' | 'success'>('checkout');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(900); // 15 mins
  const [trackingNumber, setTrackingNumber] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  // Bank Terminal Simulation Fields
  const [cardNumber, setCardNumber] = useState('۶۰۳۷ - ۹۹۱۸ - ۲۳۴۵ - ۷۸۲۱');
  const [cvv2, setCvv2] = useState('');
  const [cardMonth, setCardMonth] = useState('۰۶');
  const [cardYear, setCardYear] = useState('۰۷');
  const [dynamicOtp, setDynamicOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(120);

  // Initialize order ID and default gateway on open
  useEffect(() => {
    if (isOpen) {
      setOrderNumber(`CDG-${Math.floor(100000 + Math.random() * 900000)}`);
      setTrackingNumber(`SHP-${Math.floor(1000000000 + Math.random() * 9000000000)}`);
      setPaymentStep('checkout');
      setIsSubmitting(false);
      setDiscountApplied(null);
      setDiscountError(null);
      setGatewayType(language === 'fa' ? 'rial' : 'crypto');
      setCountdownSeconds(900);
      setFullName(language === 'fa' ? 'آرمین شفیعی' : 'Armin Shafiei');
      setMobileNumber(language === 'fa' ? '۰۹۱۲۳۴۵۶۷۸۹' : '09123456789');
    }
  }, [isOpen, language]);

  // Crypto Countdown timer
  useEffect(() => {
    if (paymentStep === 'checkout' && gatewayType === 'crypto' && isOpen) {
      const timer = setInterval(() => {
        setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [paymentStep, gatewayType, isOpen]);

  // OTP Timer countdown
  useEffect(() => {
    if (otpSent && otpTimer > 0) {
      const timer = setInterval(() => setOtpTimer((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [otpSent, otpTimer]);

  if (!isOpen || !item) return null;

  // Calculate pricing
  const baseToman = item.priceToman;
  const discountToman = discountApplied ? Math.round((baseToman * discountApplied) / 100) : 0;
  const finalToman = Math.max(0, baseToman - discountToman);

  const baseUsdt = item.priceUsdt;
  const discountUsdt = discountApplied ? (baseUsdt * discountApplied) / 100 : 0;
  const finalUsdt = Math.max(0, baseUsdt - discountUsdt).toFixed(2);

  // Save Merchant API Key
  const handleSaveMerchantConfig = () => {
    localStorage.setItem('codgar_crypto_merchant_key', merchantApiKey.trim());
    localStorage.setItem('codgar_crypto_payout_wallet', merchantPayoutWallet.trim());
    setApiSaveStatus(isFa ? 'تنظیمات درگاه با موفقیت ذخیره شد!' : 'API Settings saved successfully!');
    setTimeout(() => setApiSaveStatus(null), 3000);
  };

  // Crypto Addresses dictionary
  const CRYPTO_DATA = {
    usdt_trc20: {
      name: 'Tether (USDT - TRC20)',
      network: 'Tron (TRC-20)',
      address: merchantPayoutWallet.startsWith('T') ? merchantPayoutWallet : 'TQ7s8j9vK2Lp4N1wY5xZ6aBcDeFgHiJkLm',
      rate: finalUsdt,
      unit: 'USDT',
    },
    ton: {
      name: 'Toncoin (TON)',
      network: 'The Open Network',
      address: 'EQCD39VS5jcptHL8vMjEXrxNUHzd0qTRPFGKL_CODGAR',
      rate: (parseFloat(finalUsdt) / 5.2).toFixed(3),
      unit: 'TON',
    },
    usdt_bep20: {
      name: 'Tether (USDT - BSC)',
      network: 'BNB Smart Chain (BEP-20)',
      address: '0x71C8727a35F0ce671066A471f494554b29b89A52',
      rate: finalUsdt,
      unit: 'USDT',
    },
    trx: {
      name: 'Tron (TRX)',
      network: 'Tron Native',
      address: merchantPayoutWallet.startsWith('T') ? merchantPayoutWallet : 'TQ7s8j9vK2Lp4N1wY5xZ6aBcDeFgHiJkLm',
      rate: (parseFloat(finalUsdt) / 0.15).toFixed(1),
      unit: 'TRX',
    },
    sol: {
      name: 'Solana (SOL)',
      network: 'Solana Mainnet',
      address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      rate: (parseFloat(finalUsdt) / 145).toFixed(4),
      unit: 'SOL',
    },
    btc: {
      name: 'Bitcoin (BTC)',
      network: 'Bitcoin Lightning / On-chain',
      address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      rate: (parseFloat(finalUsdt) / 64000).toFixed(6),
      unit: 'BTC',
    },
  };

  const currentCrypto = CRYPTO_DATA[selectedCrypto];

  // Handle Discount Coupon
  const handleApplyDiscount = () => {
    setDiscountError(null);
    const code = discountCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'CODGAR' || code === 'CODGAR2026' || code === 'VIP') {
      setDiscountApplied(25); // 25% discount
    } else if (code === 'NOWRUZ' || code === 'OFF50') {
      setDiscountApplied(50); // 50% discount
    } else {
      setDiscountError(isFa ? 'کد تخفیف وارد شده معتبر نیست یا منقضی شده است.' : 'Invalid or expired coupon code.');
    }
  };

  const handleCopy = (text: string, type: 'addr' | 'amount') => {
    navigator.clipboard.writeText(text);
    if (type === 'addr') {
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } else {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    }
  };

  // Proceed from Checkout to Bank Terminal
  const handleProceedToBank = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setPaymentStep('bank_terminal');
    }, 500);
  };

  // Send Dynamic SMS OTP in Bank Terminal
  const handleRequestOtp = () => {
    setOtpSent(true);
    setOtpTimer(120);
    setDynamicOtp('۸۴۲۹۱۰');
  };

  // Finalize Bank Payment
  const handleCompleteBankPayment = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setPaymentStep('success');
      onPaymentSuccess(item);
    }, 800);
  };

  // Finalize Crypto Payment
  const handleCompleteCryptoPayment = () => {
    setIsSubmitting(true);
    setPaymentStep('crypto_verifying');
    setTimeout(() => {
      setIsSubmitting(false);
      setPaymentStep('success');
      onPaymentSuccess(item);
    }, 1800);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    const formatted = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return isFa ? toPersianDigits(formatted) : formatted;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 overflow-y-auto">
      <div
        className="w-full max-w-2xl bg-gradient-to-b from-white/95 via-sky-50/95 to-blue-50/95 border-2 border-white/90 rounded-2xl sm:rounded-3xl shadow-[0_30px_90px_rgba(37,99,235,0.25)] overflow-hidden flex flex-col text-slate-800 font-sans relative my-auto animate-fadeIn backdrop-blur-2xl max-h-[96vh] sm:max-h-[92vh]"
        dir={isFa ? 'rtl' : 'ltr'}
      >
        {/* Top Glowing Ice-Glass Accent Stripe */}
        <div className="h-1.5 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 w-full shadow-sm" />

        {/* Header */}
        <div className="px-3.5 sm:px-6 py-3 sm:py-4 bg-white/70 border-b border-sky-200/60 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 p-0.5 shadow-md shadow-blue-500/20 shrink-0">
              <div className="w-full h-full bg-white rounded-[10px] sm:rounded-[14px] flex items-center justify-center text-blue-600">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 className="text-sm sm:text-lg font-black text-slate-900 tracking-normal truncate">
                  {paymentStep === 'success'
                    ? isFa
                      ? 'رسید پرداخت موفق و شارژ حساب'
                      : 'Payment Receipt & Confirmation'
                    : isFa
                    ? 'درگاه پرداخت و تسویه حساب'
                    : 'Secure Payment Gateway'}
                </h3>
                <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 border border-blue-300/80 text-blue-700 flex items-center gap-1 shadow-xs">
                  <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
                  <span>شاپرک SSL & Web3</span>
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 font-medium">
                {isFa ? `شماره سفارش: ${toPersianDigits(orderNumber)}` : `Order ID: ${orderNumber}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-white/80 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition cursor-pointer border border-sky-200/70 hover:border-rose-300 active:scale-95 shadow-xs shrink-0"
            title={isFa ? 'بستن' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* VIEW 1: CHECKOUT & GATEWAY SELECTION                             */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {paymentStep === 'checkout' && (
          <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Package Summary Card */}
            <div className="rounded-3xl p-4 sm:p-5 bg-gradient-to-r from-white/95 via-sky-50/90 to-blue-50/95 border-2 border-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm backdrop-blur-xl">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                    {isFa ? item.badgeFa || 'بسته شارژ زمان' : item.badgeEn || 'Time Booster'}
                  </span>
                  <h4 className="text-base font-black text-slate-900">
                    {isFa ? item.titleFa : item.titleEn}
                  </h4>
                </div>
                <p className="text-xs text-slate-600 font-medium max-w-md">
                  {isFa ? item.descriptionFa : item.descriptionEn}
                </p>
              </div>

              <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 sm:border-r border-sky-200/70 pt-3 sm:pt-0 sm:pr-4">
                <div className="text-xs text-slate-500 font-medium mb-1">{isFa ? 'مبلغ قابل پرداخت:' : 'Total Amount:'}</div>
                <div className="text-xl sm:text-2xl font-black text-blue-700">
                  {gatewayType === 'rial'
                    ? isFa
                      ? `${toPersianDigits(finalToman.toLocaleString())} تومان`
                      : `${finalToman.toLocaleString()} Tomans`
                    : `$${finalUsdt} USDT`}
                </div>
                {discountApplied && (
                  <div className="text-xs text-emerald-600 font-bold line-through mt-0.5">
                    {gatewayType === 'rial'
                      ? isFa
                        ? `${toPersianDigits(baseToman.toLocaleString())} تومان`
                        : `${baseToman.toLocaleString()} Tomans`
                      : `$${baseUsdt} USDT`}
                  </div>
                )}
              </div>
            </div>

            {/* Gateway Mode Switcher (Rial / Crypto) */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>{isFa ? 'انتخاب روش پرداخت:' : 'Select Payment Gateway:'}</span>
                <span className="text-[11px] text-slate-500 font-normal">
                  {isFa ? 'کارت‌های بانکی شتاب و کلیه کیف‌پول‌های وب۳' : 'Shetab Debit Cards & Crypto'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* 1. Rial Shetab Option */}
                <button
                  type="button"
                  onClick={() => setGatewayType('rial')}
                  className={`p-3.5 rounded-2xl border-2 text-right sm:text-center transition-all cursor-pointer flex items-center gap-3 backdrop-blur-xl ${
                    gatewayType === 'rial'
                      ? 'bg-blue-50/90 border-blue-500 text-blue-900 shadow-md shadow-blue-500/10'
                      : 'bg-white/80 border-sky-200/80 hover:border-blue-300 text-slate-600'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      gatewayType === 'rial' ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-black">
                      <span>{isFa ? 'درگاه بانکی شاپرک (تومان)' : 'Iranian Shetab (Tomans)'}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                      {isFa ? 'کلیه کارت‌های عضو شتاب' : 'Direct Instant Shetab Cards'}
                    </div>
                  </div>
                </button>

                {/* 2. Crypto & International Option */}
                <button
                  type="button"
                  onClick={() => setGatewayType('crypto')}
                  className={`p-3.5 rounded-2xl border-2 text-right sm:text-center transition-all cursor-pointer flex items-center gap-3 backdrop-blur-xl ${
                    gatewayType === 'crypto'
                      ? 'bg-emerald-50/90 border-emerald-500 text-emerald-900 shadow-md shadow-emerald-500/10'
                      : 'bg-white/80 border-sky-200/80 hover:border-emerald-300 text-slate-600'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      gatewayType === 'crypto' ? 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-black">
                      <span>{isFa ? 'درگاه کریپتو و تتر (USDT)' : 'Crypto & USDT (Web3)'}</span>
                    </div>
                    <div className="text-[11px] text-emerald-700 font-bold mt-0.5">
                      {isFa ? 'بدون تحریم • بدون احراز هویت' : 'No KYC • Instant Web3'}
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* ════════════════════════════════════════════════════════════ */}
            {/* RIAL PAYMENT FORM                                            */}
            {/* ════════════════════════════════════════════════════════════ */}
            {gatewayType === 'rial' && (
              <div className="space-y-3.5 pt-1">
                {/* User Info Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>{isFa ? 'نام و نام خانوادگی خریدار:' : 'Full Name:'}</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={isFa ? 'مثال: آرمین شفیعی' : 'e.g. Armin Shafiei'}
                      className="w-full bg-white border border-sky-200 focus:border-blue-500 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 font-medium focus:outline-none transition shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                      <span>{isFa ? 'شماره موبایل (جهت ارسال پیامک پیگیری):' : 'Mobile Number:'}</span>
                    </label>
                    <input
                      type="text"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder={isFa ? '۰۹۱۲۳۴۵۶۷۸۹' : '09123456789'}
                      className="w-full bg-white border border-sky-200 focus:border-blue-500 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 font-bold focus:outline-none transition shadow-xs"
                    />
                  </div>
                </div>

                {/* Bank IPG Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>{isFa ? 'انتخاب درگاه پرداخت شاپرک:' : 'Select Shetab IPG Gateway:'}</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'zarinpal', nameFa: 'زرین‌پال (مستقیم)', nameEn: 'ZarinPal IPG' },
                      { id: 'mellat', nameFa: 'به‌پرداخت ملت', nameEn: 'Mellat IPG' },
                      { id: 'saman', nameFa: 'سامان‌کیش', nameEn: 'Saman Pay' },
                      { id: 'zibal', nameFa: 'زیبال پرداخت', nameEn: 'Zibal Swift' },
                    ].map((ipg) => (
                      <button
                        key={ipg.id}
                        type="button"
                        onClick={() => setSelectedIpg(ipg.id as any)}
                        className={`p-2.5 rounded-2xl border text-center transition cursor-pointer text-xs font-bold ${
                          selectedIpg === ipg.id
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white/80 border-sky-200/80 hover:border-blue-300 text-slate-600'
                        }`}
                      >
                        {isFa ? ipg.nameFa : ipg.nameEn}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Discount Code */}
                <div className="p-3 bg-white/80 rounded-2xl border border-sky-200/80 space-y-2 backdrop-blur-xl">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        placeholder={isFa ? 'کد تخفیف (مثال: CODGAR یا VIP)' : 'Coupon Code (e.g. CODGAR)'}
                        className="w-full bg-slate-50 border border-sky-200/80 focus:border-blue-500 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-800 uppercase font-bold focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyDiscount}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition cursor-pointer active:scale-95 shadow-sm"
                    >
                      {isFa ? 'اعمال کد' : 'Apply'}
                    </button>
                  </div>
                  {discountApplied && (
                    <div className="text-xs text-emerald-700 flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{isFa ? `🎉 تخفیف ${toPersianDigits(discountApplied)}٪ با موفقیت اعمال شد!` : `Coupon applied! ${discountApplied}% off`}</span>
                    </div>
                  )}
                  {discountError && (
                    <div className="text-xs text-rose-600 flex items-center gap-1 font-bold">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>{discountError}</span>
                    </div>
                  )}
                </div>

                {/* Action Submit Button */}
                <button
                  type="button"
                  onClick={handleProceedToBank}
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:brightness-105 text-white font-black text-sm transition-all cursor-pointer shadow-lg shadow-blue-500/25 active:scale-98 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>
                        {isFa
                          ? `ورود به درگاه امن شاپرک (${toPersianDigits(finalToman.toLocaleString())} تومان)`
                          : `Proceed to Secure Bank Gateway (${finalToman.toLocaleString()} T)`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════ */}
            {/* CRYPTO PAYMENT VIEW (NO-KYC + WEB3 AUTOMATION)               */}
            {/* ════════════════════════════════════════════════════════════ */}
            {gatewayType === 'crypto' && (
              <div className="space-y-3.5 pt-1">
                {/* Provider Selector (OxaPay, Cryptomus, NOWPayments, Web3 Direct) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isFa ? 'ارائه‌دهنده درگاه کریپتو (بدون احراز هویت / No-KYC):' : 'Crypto Gateway Provider (No-KYC):'}</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowNoKycGuide(!showNoKycGuide)}
                        className="text-[11px] text-blue-700 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200"
                      >
                        <HelpCircle className="w-3 h-3" />
                        <span>{isFa ? 'آموزش ساخت اکانت ایران' : 'No-KYC Guide'}</span>
                        {showNoKycGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowApiSettings(!showApiSettings)}
                        className="text-[11px] text-slate-700 hover:text-slate-900 font-bold flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded-lg border border-sky-200 shadow-xs"
                      >
                        <Settings className="w-3 h-3 text-slate-500" />
                        <span>{isFa ? 'تنظیم API Key مرچنت' : 'Merchant API'}</span>
                        {showApiSettings ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'oxapay', name: 'OxaPay (پیشنهادی)', badge: isFa ? 'بدون KYC • کارمزد ۰.۴٪' : 'No-KYC 0.4%' },
                      { id: 'cryptomus', name: 'Cryptomus', badge: isFa ? 'تسویه خودکار' : 'Auto Payout' },
                      { id: 'nowpayments', name: 'NOWPayments', badge: isFa ? 'Non-Custodial' : 'Direct Wallet' },
                      { id: 'web3_direct', name: 'Web3 Direct', badge: isFa ? 'تراست‌ولت / متامسک' : 'Wallet Direct' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setCryptoProvider(p.id as any)}
                        className={`p-2 rounded-2xl border text-center transition cursor-pointer text-xs font-bold flex flex-col items-center justify-center gap-0.5 ${
                          cryptoProvider === p.id
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white/80 border-sky-200/80 hover:border-emerald-300 text-slate-700'
                        }`}
                      >
                        <span>{p.name}</span>
                        <span className="text-[10px] opacity-85 font-medium">{p.badge}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Collapsible: Step-by-Step No-KYC Setup Guide for Iran */}
                {showNoKycGuide && (
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-blue-50/95 to-sky-50/90 border-2 border-blue-200 text-xs space-y-2.5 animate-fadeIn">
                    <div className="font-bold text-blue-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        {isFa ? 'راهنمای ثبت‌نام درگاه کریپتو برای کاربران ایران (بدون نیاز به پاسپورت و احراز هویت)' : 'No-KYC Payment Gateway Setup Guide for Iran'}
                      </span>
                    </div>

                    <div className="space-y-2 text-slate-700 leading-relaxed font-medium">
                      <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-sky-200/70">
                        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">۱</div>
                        <div>
                          <strong>{isFa ? 'بهترین سرویس بدون KYC (پیشنهادی): OxaPay.com' : 'Recommended No-KYC Gateway: OxaPay.com'}</strong>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            {isFa
                              ? 'فقط با یک ایمیل (مثلاً جیمیل یا پروتون‌میل) ثبت‌نام کنید. هیچ شماره تلفن، عکس پاسپورت یا احراز هویت نیاز ندارد و هیچ حساسیتی به IP ایران ندارد.'
                              : 'Register with just an email. Zero KYC, no phone verification, zero IP block.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-sky-200/70">
                        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">۲</div>
                        <div>
                          <strong>{isFa ? 'سرویس‌های معتبر جایگزین: Cryptomus.com و NOWPayments.io' : 'Alternatives: Cryptomus.com & NOWPayments.io'}</strong>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            {isFa
                              ? 'این سرویس‌ها نیز سیستم Non-Custodial دارند و تمام تترها و کریپتوها را مستقیماً و خودکار به کیف‌پول شخصی شما (Trust Wallet یا Tonkeeper) واریز می‌کنند.'
                              : 'Non-custodial merchant gateways that forward received crypto straight to your private Trust Wallet / Tonkeeper.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-sky-200/70">
                        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">۳</div>
                        <div>
                          <strong>{isFa ? 'دریافت کلید مرچنت (Merchant Key)' : 'Generate Merchant API Key'}</strong>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            {isFa
                              ? 'در پنل کاربری بخش Merchants یک درگاه بسازید و API Key آن را در بخش «تنظیم API Key مرچنت» زیر قرار دهید تا سیستم به صورت خودکار فاکتور صادر کند.'
                              : 'Create a merchant in your dashboard, copy the Merchant Key into the API settings box below.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Collapsible: Merchant API Key & Wallet Config */}
                {showApiSettings && (
                  <div className="p-4 rounded-2xl bg-white/95 border-2 border-emerald-300 space-y-3 animate-fadeIn shadow-sm">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span className="flex items-center gap-1.5 text-emerald-800">
                        <Key className="w-3.5 h-3.5 text-emerald-600" />
                        {isFa ? 'اتصال مستقیم API Key مرچنت کریپتو' : 'Direct Merchant API Key Connection'}
                      </span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                        {isFa ? 'پشتیبانی از OxaPay / Cryptomus / NOWPayments' : 'Multi-Provider'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          {isFa ? 'کلید مرچنت یا API Key درگاه:' : 'Merchant API Key:'}
                        </label>
                        <input
                          type="password"
                          value={merchantApiKey}
                          onChange={(e) => setMerchantApiKey(e.target.value)}
                          placeholder="oxp_live_xxxxxxxxxxxx or cryptomus_api"
                          className="w-full bg-slate-50 border border-sky-200 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none dir-ltr"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          {isFa ? 'کیف‌پول مقصد جهت تسویه خودکار (USDT / TON):' : 'Payout Wallet Address (Auto Forward):'}
                        </label>
                        <input
                          type="text"
                          value={merchantPayoutWallet}
                          onChange={(e) => setMerchantPayoutWallet(e.target.value)}
                          placeholder="TQ7s8j9vK2Lp4N1wY5xZ6aBcDeFgHiJkLm"
                          className="w-full bg-slate-50 border border-sky-200 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none dir-ltr"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={handleSaveMerchantConfig}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isFa ? 'ذخیره و اتصال خودکار درگاه' : 'Save & Connect Gateway'}</span>
                      </button>

                      {apiSaveStatus && (
                        <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {apiSaveStatus}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Crypto Coin Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isFa ? 'انتخاب رمزارز و شبکه انتقال:' : 'Select Cryptocurrency & Network:'}</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                    {[
                      { id: 'usdt_trc20', name: 'USDT (TRC20)', badge: isFa ? 'محبوب / سریع' : 'Fast & Low Fee' },
                      { id: 'ton', name: 'TON (Toncoin)', badge: isFa ? 'تلگرام / تون‌کیپر' : 'Telegram TON' },
                      { id: 'usdt_bep20', name: 'USDT (BSC)', badge: isFa ? 'کارمزد اندک' : 'BNB Chain' },
                      { id: 'trx', name: 'TRX (Tron)', badge: isFa ? 'ترون بدون کارمزد' : 'Zero Fee TRX' },
                      { id: 'sol', name: 'SOL (Solana)', badge: isFa ? 'سولانا' : 'Solana' },
                      { id: 'btc', name: 'BTC (Bitcoin)', badge: isFa ? 'بیت‌کوین' : 'Bitcoin' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCrypto(c.id as any)}
                        className={`p-2 rounded-2xl border text-center transition cursor-pointer text-xs font-bold flex flex-col items-center justify-center gap-0.5 ${
                          selectedCrypto === c.id
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white/80 border-sky-200/80 hover:border-emerald-300 text-slate-600'
                        }`}
                      >
                        <span>{c.name}</span>
                        <span className="text-[10px] opacity-80 font-normal">{c.badge}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Crypto Deposit Box with QR and Address */}
                <div className="p-4 rounded-3xl bg-white/90 border border-sky-200/80 flex flex-col sm:flex-row items-center gap-4 backdrop-blur-xl shadow-sm">
                  {/* QR Code */}
                  <div className="p-2.5 bg-white rounded-2xl border border-sky-200 shadow-sm shrink-0">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${currentCrypto.address}`}
                      alt="Deposit QR"
                      className="w-28 h-28"
                    />
                  </div>

                  {/* Address & Amount Details */}
                  <div className="flex-1 space-y-2.5 w-full">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span className="font-bold">{isFa ? 'آدرس واریز کیف پول مرچنت:' : 'Deposit Wallet Address:'}</span>
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {currentCrypto.network} • {cryptoProvider === 'oxapay' ? 'OxaPay API' : cryptoProvider === 'cryptomus' ? 'Cryptomus API' : 'Web3 Gateway'}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-sky-200/80">
                        <span className="text-xs font-bold text-slate-800 truncate flex-1 dir-ltr text-left">
                          {currentCrypto.address}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(currentCrypto.address, 'addr')}
                          className="p-1.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-700 transition cursor-pointer shrink-0 active:scale-95"
                          title="Copy Address"
                        >
                          {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-1">
                      <div className="flex-1">
                        <div className="text-xs text-slate-500 font-medium">{isFa ? 'مبلغ دقیق واریزی:' : 'Exact Amount:'}</div>
                        <div className="text-base font-black text-slate-900 flex items-center gap-2 mt-0.5">
                          <span>
                            {currentCrypto.rate} {currentCrypto.unit}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(currentCrypto.rate.toString(), 'amount')}
                            className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs cursor-pointer"
                          >
                            {copiedAmount ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="text-left shrink-0">
                        <div className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span>{isFa ? 'زمان انقضا:' : 'Expires in:'}</span>
                        </div>
                        <div className="text-sm font-bold text-blue-700 mt-0.5">
                          {formatSeconds(countdownSeconds)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* TxID Input */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-blue-600" />
                    <span>{isFa ? 'کد هش تراکنش یا شناسه واریز (TxID / Hash):' : 'Transaction Hash (TxID):'}</span>
                  </label>
                  <input
                    type="text"
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    placeholder={isFa ? 'هش تراکنش را پس از انتقال اینجا وارد کنید (یا دکمه تایید واریز را بزنید)' : '0x7a2f8b... or Tron Tx Hash'}
                    className="w-full bg-white border border-sky-200 focus:border-emerald-500 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none dir-ltr shadow-xs"
                  />
                </div>

                {/* Complete Crypto Button */}
                <button
                  type="button"
                  onClick={handleCompleteCryptoPayment}
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm transition-all cursor-pointer shadow-lg shadow-emerald-500/25 active:scale-98 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>{isFa ? 'تایید خودکار واریز و شارژ آنی حساب' : 'Auto Verify Transfer & Top Up Instantly'}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* VIEW 2: HIGH-FIDELITY SHAPARAK BANK TERMINAL VIEW                */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {paymentStep === 'bank_terminal' && (
          <div className="p-5 sm:p-7 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="p-4 rounded-3xl bg-gradient-to-r from-white/95 via-sky-50/90 to-blue-50/95 border-2 border-white flex items-center justify-between shadow-sm">
              <div>
                <div className="text-xs text-slate-500 font-medium">{isFa ? 'پذیرنده: درگاه هوش مصنوعی کُدگر' : 'Merchant: Codgar AI'}</div>
                <div className="text-base font-black text-slate-900 mt-0.5">
                  {isFa ? item.titleFa : item.titleEn}
                </div>
              </div>
              <div className="text-left">
                <div className="text-xs text-slate-500 font-medium">{isFa ? 'مبلغ قابل پرداخت:' : 'Amount:'}</div>
                <div className="text-xl font-black text-blue-700">
                  {isFa ? `${toPersianDigits(finalToman.toLocaleString())} تومان` : `${finalToman.toLocaleString()} Tomans`}
                </div>
              </div>
            </div>

            {/* Shaparak Card Form */}
            <div className="p-5 rounded-3xl bg-white/95 border-2 border-sky-200/80 space-y-4 shadow-sm backdrop-blur-xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isFa ? 'شماره کارت ۱۶ رقمی شتاب:' : '16-Digit Card Number:'}
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-sky-200 focus:border-blue-500 rounded-2xl px-3.5 py-3 text-base font-bold text-center tracking-widest text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {isFa ? 'کد امنیتی (CVV2):' : 'CVV2:'}
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cvv2}
                    onChange={(e) => setCvv2(e.target.value)}
                    placeholder="•••"
                    className="w-full bg-slate-50 border border-sky-200 focus:border-blue-500 rounded-2xl px-3 py-2.5 text-sm font-bold text-center text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {isFa ? 'تاریخ انقضا (ماه / سال):' : 'Expiry Date:'}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      maxLength={2}
                      value={cardMonth}
                      onChange={(e) => setCardMonth(e.target.value)}
                      className="w-full bg-slate-50 border border-sky-200 focus:border-blue-500 rounded-2xl px-2 py-2.5 text-xs font-bold text-center text-slate-900 focus:outline-none"
                    />
                    <span className="text-slate-400 font-bold">/</span>
                    <input
                      type="text"
                      maxLength={2}
                      value={cardYear}
                      onChange={(e) => setCardYear(e.target.value)}
                      className="w-full bg-slate-50 border border-sky-200 focus:border-blue-500 rounded-2xl px-2 py-2.5 text-xs font-bold text-center text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {isFa ? 'رمز دوم پویا:' : 'Dynamic OTP:'}
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      maxLength={8}
                      value={dynamicOtp}
                      onChange={(e) => setDynamicOtp(e.target.value)}
                      placeholder={isFa ? 'رمز پیامکی' : 'SMS Code'}
                      className="w-full bg-slate-50 border border-sky-200 focus:border-blue-500 rounded-2xl px-2.5 py-2.5 text-xs font-bold text-center text-slate-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      className="px-3 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0 transition cursor-pointer shadow-xs"
                    >
                      {otpSent ? (isFa ? `${toPersianDigits(otpTimer)} ثانیه` : `${otpTimer}s`) : isFa ? 'دریافت رمز' : 'Get OTP'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPaymentStep('checkout')}
                className="py-3 px-5 rounded-2xl bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs transition cursor-pointer active:scale-95 border border-sky-200"
              >
                {isFa ? 'انصراف و بازگشت' : 'Cancel & Back'}
              </button>

              <button
                type="button"
                onClick={handleCompleteBankPayment}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:brightness-105 text-white font-black text-sm transition-all cursor-pointer shadow-lg shadow-blue-500/25 active:scale-98 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>{isFa ? 'تکمیل پرداخت و شارژ حساب' : 'Confirm & Complete Payment'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* VIEW 3: BLOCKCHAIN VERIFYING SIMULATION                          */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {paymentStep === 'crypto_verifying' && (
          <div className="p-8 sm:p-12 text-center space-y-4 max-h-[80vh] flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center animate-spin shadow-lg shadow-emerald-500/20">
              <RefreshCw className="w-8 h-8 text-emerald-600" />
            </div>
            <h4 className="text-lg font-black text-slate-900">
              {isFa ? 'در حال تایید و ثبت تراکنش در شبکه بلاکچین...' : 'Confirming on Blockchain Network...'}
            </h4>
            <p className="text-xs text-slate-600 max-w-md leading-relaxed font-medium">
              {isFa
                ? 'درگاه هوشمند در حال استعلام تاییدیه از نودهای شبکه ترون / وب۳ است. بلافاصله پس از تایید، اعتبار به حسابتان افزوده می‌شود.'
                : 'Please wait a moment while the network confirms your transaction.'}
            </p>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* VIEW 4: OFFICIAL PAYMENT RECEIPT & SUCCESS SCREEN                */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {paymentStep === 'success' && (
          <div className="p-6 sm:p-8 space-y-5 max-h-[80vh] overflow-y-auto text-center">
            {/* Success Icon */}
            <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-600 shadow-lg shadow-emerald-500/25">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div className="space-y-1">
              <h4 className="text-xl sm:text-2xl font-black text-slate-900">
                {isFa ? '🎉 پرداخت با موفقیت انجام شد!' : '🎉 Payment Successful!'}
              </h4>
              <p className="text-xs text-slate-600 font-medium">
                {isFa
                  ? `بسته «${item.titleFa}» به اعتبار شما افزوده شد و فعال گردید.`
                  : `Successfully activated ${item.titleEn}. Your hours have been added to your profile.`}
              </p>
            </div>

            {/* Digital Invoice Box */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white border-2 border-sky-200/80 text-right text-xs space-y-3 max-w-lg mx-auto shadow-sm backdrop-blur-xl">
              <div className="flex items-center justify-between pb-2.5 border-b border-sky-100">
                <span className="text-slate-500 font-medium">
                  {gatewayType === 'rial' ? (isFa ? 'کد پیگیری شاپرک:' : 'Tracking Number:') : (isFa ? 'شناسه تراکنش بلاکچین:' : 'Blockchain TxID:')}
                </span>
                <span className="font-bold text-blue-700">{isFa ? toPersianDigits(trackingNumber) : trackingNumber}</span>
              </div>
              <div className="flex items-center justify-between pb-2.5 border-b border-sky-100">
                <span className="text-slate-500 font-medium">{isFa ? 'شماره سفارش:' : 'Order Number:'}</span>
                <span className="font-bold text-slate-800">{isFa ? toPersianDigits(orderNumber) : orderNumber}</span>
              </div>
              <div className="flex items-center justify-between pb-2.5 border-b border-sky-100">
                <span className="text-slate-500 font-medium">{isFa ? 'بسته خریداری‌شده:' : 'Purchased Package:'}</span>
                <span className="font-black text-slate-900">{isFa ? item.titleFa : item.titleEn}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">{isFa ? 'مبلغ پرداخت‌شده:' : 'Paid Amount:'}</span>
                <span className="font-black text-emerald-600 text-sm">
                  {gatewayType === 'rial'
                    ? isFa
                      ? `${toPersianDigits(finalToman.toLocaleString())} تومان`
                      : `${finalToman.toLocaleString()} Tomans`
                    : `$${finalUsdt} USDT`}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="py-3 px-8 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs transition cursor-pointer shadow-md shadow-blue-500/25 active:scale-95"
            >
              {isFa ? 'بازگشت به محیط کُدگر' : 'Return to Codgar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
