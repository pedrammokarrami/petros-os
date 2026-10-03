import { useState } from 'react';
import {
  CreditCard,
  Zap,
  Star,
  Coins,
  X,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  CalendarCheck,
  Check,
  Clock,
  Layers,
  ArrowUpRight,
  Wallet,
} from 'lucide-react';
import { PaymentGatewayModal, PaymentItem } from './PaymentGatewayModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language?: string;
  onTopUpSuccess?: (hours: number) => void;
}

export function BillingModal({
  isOpen,
  onClose,
  language = 'fa',
  onTopUpSuccess,
}: Props) {
  const isFa = language === 'fa';

  // Active Billing Tab: 'hours' (ساعتی) vs 'subscription' (اشتراک ماهانه)
  const [activeTab, setActiveTab] = useState<'hours' | 'subscription'>('hours');

  // Simulated live user credit state
  const [dailyFreeMinutes] = useState(300); // 5 hours = 300 mins
  const [usedMinutesToday] = useState(72); // 1h 12m used
  const [purchasedHours, setPurchasedHours] = useState(15); // Stored booster hours
  const [activePlan, setActivePlan] = useState<'free' | 'pro' | 'unlimited'>('free');
  const [selectedCurrency, setSelectedCurrency] = useState<'irt' | 'usd'>('irt');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Payment Gateway Modal State
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);
  const [selectedPaymentItem, setSelectedPaymentItem] = useState<PaymentItem | null>(null);

  // Calculate free hours remaining
  const remainingFreeMinutes = Math.max(0, dailyFreeMinutes - usedMinutesToday);
  const freeRemainingHours = (remainingFreeMinutes / 60).toFixed(1);
  const freePercent = Math.round((remainingFreeMinutes / dailyFreeMinutes) * 100);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Open Payment Gateway for Top-up Package
  const handleOpenPurchaseGateway = (item: PaymentItem) => {
    setSelectedPaymentItem(item);
    setIsGatewayOpen(true);
  };

  // On Successful payment from gateway
  const handlePaymentCompleted = (item: PaymentItem) => {
    if (item.type === 'hours' && item.hoursAdded) {
      setPurchasedHours((prev) => prev + item.hoursAdded!);
      showToast(
        isFa
          ? `🎉 بسته ${item.hoursAdded} ساعته با موفقیت از طریق درگاه پرداخت به اعتبار شما افزوده شد!`
          : `🎉 Successfully credited ${item.hoursAdded} hours via payment gateway!`
      );
      if (onTopUpSuccess) onTopUpSuccess(item.hoursAdded);
    } else if (item.type === 'subscription' && item.planKey) {
      setActivePlan(item.planKey);
      showToast(
        isFa
          ? `🚀 اشتراک شما با موفقیت از طریق درگاه پرداخت ارتقا یافت!`
          : `🚀 Subscription successfully upgraded via payment gateway!`
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div
        className="w-full max-w-3xl bg-[#080e1b] border border-blue-500/30 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[90vh] text-slate-100 font-sans relative my-auto animate-fadeIn"
        dir={isFa ? 'rtl' : 'ltr'}
      >
        {/* Top Glow Accent Stripe */}
        <div className="h-1 bg-gradient-to-r from-sky-400 via-blue-500 to-emerald-400 w-full" />

        {/* Header - Clean, Compact & Modern */}
        <div className="px-5 py-3.5 bg-[#0b1426] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                {isFa ? 'امور مالی و ارتقای حساب' : 'Billing & Upgrades'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Currency toggle */}
            <div className="flex items-center bg-black/50 p-1 rounded-xl border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setSelectedCurrency('irt')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  selectedCurrency === 'irt'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                تومان
              </button>
              <button
                type="button"
                onClick={() => setSelectedCurrency('usd')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  selectedCurrency === 'usd'
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                USDT ($)
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer border border-white/10"
              title={isFa ? 'بستن' : 'Close'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toast notification */}
        {toastMessage && (
          <div className="px-5 py-2 bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {toastMessage}
            </span>
          </div>
        )}

        {/* Main Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 max-h-[calc(90vh-120px)]">
          {/* ══════════════════════════════════════════════════════════════ */}
          {/* 1. COMPACT DAILY QUOTA & WALLET STATUS STRIP                   */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <div className="rounded-2xl p-3 sm:p-4 bg-gradient-to-r from-blue-950/40 via-[#0d1b33] to-indigo-950/40 border border-blue-400/25 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{isFa ? 'سهمیه روزانه رایگان: ۵ ساعت' : 'Daily Free Allowance: 5h'}</span>
                  <span className="text-[10px] text-emerald-400 font-mono">({freeRemainingHours}h باقی‌مانده)</span>
                </div>
                <div className="w-36 sm:w-44 h-1.5 bg-white/10 rounded-full overflow-hidden mt-1.5">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 rounded-full"
                    style={{ width: `${freePercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
              <div className="text-right text-xs">
                <span className="text-slate-400">{isFa ? 'اعتبار ذخیره شما: ' : 'Banked Extra: '}</span>
                <span className="font-bold text-sky-300 font-mono">{purchasedHours} ساعت</span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono bg-black/40 px-2 py-1 rounded-lg border border-white/10">
                <RefreshCw className="w-3 h-3 text-cyan-400" />
                <span>{isFa ? 'ریست: ۰۰:۰۰' : 'Reset: 00:00'}</span>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* 2. TAB SWITCHER (ساعتی / اشتراک ماهانه)                        */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <div className="flex items-center justify-center">
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab('hours')}
                className={`flex-1 sm:flex-none px-5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'hours'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{isFa ? 'بسته‌های افزایش ساعت' : 'Hourly Top-up Boosts'}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('subscription')}
                className={`flex-1 sm:flex-none px-5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'subscription'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isFa ? 'پلن‌های ماهانه' : 'Monthly Subscriptions'}</span>
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* TAB 1: HOURLY PACKAGES (خرید ۱۰، ۲۵ و ۶۰ ساعت)                  */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'hours' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Pack 1: 10 Hours */}
              <div className="rounded-2xl bg-[#0a1224] border border-white/10 hover:border-cyan-500/40 p-4 transition-all duration-200 flex flex-col justify-between group shadow-sm">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-800/40">
                      {isFa ? 'بسته استارتر' : 'Starter'}
                    </span>
                    <Coins className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="mt-2.5">
                    <div className="text-2xl font-black text-white">+۱۰ {isFa ? 'ساعت' : 'Hours'}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {isFa ? 'بدون تاریخ انقضا' : 'Never expires'}
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-white/10">
                    <span className="text-base font-bold text-white">
                      {selectedCurrency === 'irt' ? '۸۹,۰۰۰ تومان' : '$1.80 USDT'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleOpenPurchaseGateway({
                      id: 'hours_10',
                      type: 'hours',
                      titleFa: 'بسته افزایش ۱۰ ساعت زمان پردازش',
                      titleEn: '10 Hours Compute Boost',
                      hoursAdded: 10,
                      priceToman: 89000,
                      priceUsdt: 1.8,
                      badgeFa: 'بسته استارتر',
                      badgeEn: 'Starter Boost',
                      descriptionFa: 'افزایش ۱۰ ساعت زمان هوش مصنوعی بدون تاریخ انقضا و قابل استفاده در تمام پروژه‌ها',
                      descriptionEn: '10 hours of unexpiring AI compute time for all your projects and sandboxes',
                    })
                  }
                  className="mt-3 w-full py-2 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 hover:text-white border border-cyan-500/30 font-bold text-xs transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <span>{isFa ? 'افزایش ۱۰ ساعت' : 'Add 10 Hours'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Pack 2: 25 Hours (MOST POPULAR) */}
              <div className="rounded-2xl bg-gradient-to-b from-[#0f1f3a] to-[#0a1426] border-2 border-emerald-500/50 p-4 transition-all duration-200 flex flex-col justify-between relative shadow-lg shadow-emerald-950/40">
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-[9px] uppercase tracking-wider">
                  {isFa ? 'محبوب‌ترین' : 'Popular'}
                </div>
                <div>
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-800/40">
                      {isFa ? 'بسته ویژه' : 'Pro Boost'}
                    </span>
                    <Star className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                  </div>
                  <div className="mt-2.5">
                    <div className="text-2xl font-black text-white">+۲۵ {isFa ? 'ساعت' : 'Hours'}</div>
                    <div className="text-[11px] text-emerald-400 mt-0.5 font-medium">
                      {isFa ? 'تخفیف ویژه + اولویت در صف' : 'Priority compile queue'}
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-white/10">
                    <span className="text-base font-bold text-emerald-300">
                      {selectedCurrency === 'irt' ? '۱۸۹,۰۰۰ تومان' : '$3.90 USDT'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleOpenPurchaseGateway({
                      id: 'hours_25',
                      type: 'hours',
                      titleFa: 'بسته محبوب افزایش ۲۵ ساعت زمان پردازش',
                      titleEn: '25 Hours Pro Compute Boost',
                      hoursAdded: 25,
                      priceToman: 189000,
                      priceUsdt: 3.9,
                      badgeFa: 'محبوب‌ترین بسته',
                      badgeEn: 'Most Popular',
                      descriptionFa: 'افزایش ۲۵ ساعت زمان پردازش با اولویت صف بالاتر در ساخت و کامپایل ابری',
                      descriptionEn: '25 hours priority cloud compute boost with instant zero-queue priority',
                    })
                  }
                  className="mt-3 w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs transition cursor-pointer active:scale-95 shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>{isFa ? 'افزایش ۲۵ ساعت' : 'Add 25 Hours'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Pack 3: 60 Hours */}
              <div className="rounded-2xl bg-[#0a1224] border border-white/10 hover:border-purple-500/40 p-4 transition-all duration-200 flex flex-col justify-between group shadow-sm">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded-lg border border-purple-800/40">
                      {isFa ? 'بسته مستر' : 'Master Pack'}
                    </span>
                    <Zap className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="mt-2.5">
                    <div className="text-2xl font-black text-white">+۶۰ {isFa ? 'ساعت' : 'Hours'}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {isFa ? 'مناسب پروژه‌های بزرگ و تیمی' : 'For large projects & teams'}
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-white/10">
                    <span className="text-base font-bold text-white">
                      {selectedCurrency === 'irt' ? '۳۸۰,۰۰۰ تومان' : '$7.90 USDT'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleOpenPurchaseGateway({
                      id: 'hours_60',
                      type: 'hours',
                      titleFa: 'بسته مستر ۶۰ ساعته کُدگر (سازمانی و تیمی)',
                      titleEn: '60 Hours Master Team Pack',
                      hoursAdded: 60,
                      priceToman: 380000,
                      priceUsdt: 7.9,
                      badgeFa: 'بسته مستر ۶۰ ساعت',
                      badgeEn: 'Master Pack 60h',
                      descriptionFa: 'افزایش ۶۰ ساعت کامل کارکرد ایجنت هوش مصنوعی، مناسب توسعه پروژه‌های بزرگ',
                      descriptionEn: '60 hours comprehensive cloud agent runtime for heavy production projects',
                    })
                  }
                  className="mt-3 w-full py-2 px-3 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 hover:text-white border border-purple-500/30 font-bold text-xs transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <span>{isFa ? 'افزایش ۶۰ ساعت' : 'Add 60 Hours'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* TAB 2: MONTHLY SUBSCRIPTIONS                                  */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'subscription' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Pro Tier */}
              <div className="rounded-2xl bg-gradient-to-b from-[#0b172a] to-[#070e1b] border border-cyan-500/40 p-4 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-300 text-sm">{isFa ? 'توسعه‌دهنده حرفه‌ای (Pro)' : 'Pro Developer'}</span>
                  <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800/40 font-bold">
                    {isFa ? 'پیشنهادی' : 'Recommended'}
                  </span>
                </div>
                <div className="text-xl font-black text-white">
                  {selectedCurrency === 'irt' ? '۲۷۰,۰۰۰ تومان' : '$6.90'}
                  <span className="text-xs text-slate-400 font-normal"> / {isFa ? 'ماهانه' : 'mo'}</span>
                </div>
                <ul className="text-xs space-y-1.5 text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{isFa ? '۶۰ ساعت اعتبار اختصاصی در ماه' : '60h monthly booster'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{isFa ? 'اولویت صفی لحظه‌ای و بدون معطلی' : 'Zero-queue priority'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{isFa ? 'حالت استدلال و ریفکتورینگ عمیق' : 'Deep reasoning agent'}</span>
                  </li>
                </ul>
                <button
                  type="button"
                  onClick={() =>
                    handleOpenPurchaseGateway({
                      id: 'sub_pro',
                      type: 'subscription',
                      planKey: 'pro',
                      titleFa: 'اشتراک ماهانه توسعه‌دهنده حرفه‌ای (Pro)',
                      titleEn: 'Pro Developer Monthly Tier',
                      priceToman: 270000,
                      priceUsdt: 6.9,
                      badgeFa: 'اشتراک حرفه‌ای',
                      badgeEn: 'Pro Tier',
                      descriptionFa: 'دسترسی به تمام قابلیت‌های هوش مصنوعی + ۶۰ ساعت اعتبار ماهانه و اولویت در صف کامپایل',
                      descriptionEn: 'Full access + 60h monthly bank + zero-queue priority engine',
                    })
                  }
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold transition cursor-pointer shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                >
                  {activePlan === 'pro' ? (
                    <span>{isFa ? 'پلن فعال شما' : 'Active Tier'}</span>
                  ) : (
                    <span>{isFa ? 'ارتقا به حرفه‌ای' : 'Upgrade to Pro'}</span>
                  )}
                </button>
              </div>

              {/* Unlimited Tier */}
              <div className="rounded-2xl bg-gradient-to-b from-[#161226] to-[#070b16] border border-amber-500/40 p-4 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 text-sm">{isFa ? 'نامحدود (Enterprise VIP)' : 'Unlimited VIP'}</span>
                  <span className="text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800/40 font-bold">
                    VIP
                  </span>
                </div>
                <div className="text-xl font-black text-white">
                  {selectedCurrency === 'irt' ? '۵۹۰,۰۰۰ تومان' : '$14.90'}
                  <span className="text-xs text-slate-400 font-normal"> / {isFa ? 'ماهانه' : 'mo'}</span>
                </div>
                <ul className="text-xs space-y-1.5 text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{isFa ? 'ساعات مصرف کاملاً نامحدود و بدون سقف' : 'Unlimited compute hours'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{isFa ? 'سرورهای اختصاصی پرسرعت GPU' : 'Dedicated GPU sandbox'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{isFa ? 'پشتیبانی اختصاصی مهندسی' : 'Priority 24/7 support'}</span>
                  </li>
                </ul>
                <button
                  type="button"
                  onClick={() =>
                    handleOpenPurchaseGateway({
                      id: 'sub_unlimited',
                      type: 'subscription',
                      planKey: 'unlimited',
                      titleFa: 'اشتراک ماهانه نامحدود (Enterprise VIP)',
                      titleEn: 'Unlimited VIP Enterprise Tier',
                      priceToman: 590000,
                      priceUsdt: 14.9,
                      badgeFa: 'اشتراک نامحدود VIP',
                      badgeEn: 'VIP Enterprise',
                      descriptionFa: 'ساعات نامحدود پردازش ابری، سرور اختصاصی GPU و پشتیبانی مستقیم مهندسی ۲۴/۷',
                      descriptionEn: 'Unlimited compute hours, dedicated GPU sandbox and 24/7 engineering support',
                    })
                  }
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black transition cursor-pointer shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                >
                  {activePlan === 'unlimited' ? (
                    <span>{isFa ? 'پلن فعال شما' : 'Active Tier'}</span>
                  ) : (
                    <span>{isFa ? 'ارتقا به نامحدود VIP' : 'Get Unlimited VIP'}</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Clean Security Footer */}
          <div className="pt-2 flex items-center justify-between text-slate-400 text-[11px] border-t border-white/5">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isFa ? 'پرداخت امن با ضمانت بازگشت وجه' : 'Secure & Guaranteed'}</span>
            </span>
            <span className="text-slate-500 font-mono">
              {isFa ? 'شاپرک (شتاب) • کریپتو (USDT)' : 'Shetab IPG • Web3 Crypto'}
            </span>
          </div>
        </div>

        {/* Integrated Payment Gateway Modal */}
        <PaymentGatewayModal
          isOpen={isGatewayOpen}
          onClose={() => setIsGatewayOpen(false)}
          item={selectedPaymentItem}
          language={language}
          onPaymentSuccess={handlePaymentCompleted}
        />
      </div>
    </div>
  );
}
