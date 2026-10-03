import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  CheckCircle2,
  X,
  Sparkles,
  Mail,
  CircleDollarSign,
  Clock,
  Layers,
  ArrowUpRight,
  CalendarCheck,
  RefreshCw,
  Receipt,
  Check,
  Zap,
  Star,
  Coins,
  Flame,
} from 'lucide-react';
import { Language } from '../utils/translations';
import { PaymentGatewayModal, PaymentItem } from './PaymentGatewayModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currentProject: string;
  initialTab?: 'billing' | 'invoices';
  onTopUpSuccess?: (hours: number) => void;
}

// Utility to convert Latin digits to Persian digits
const toPersianDigits = (n: number | string): string => {
  const str = String(n);
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[0-9]/g, (w) => persianDigits[parseInt(w, 10)]);
};

export function ProfileModal({
  isOpen,
  onClose,
  language = 'fa',
  currentProject,
  initialTab = 'billing',
  onTopUpSuccess,
}: Props) {
  const isFa = language === 'fa';

  // Active Profile Section Tab: 'billing' | 'invoices'
  const [activeTab, setActiveTab] = useState<'billing' | 'invoices'>(
    initialTab === 'invoices' ? 'invoices' : 'billing'
  );

  // Sub-tab inside Billing: 'hours' (ساعتی) vs 'subscription' (اشتراک ماهانه)
  const [billingSubTab, setBillingSubTab] = useState<'hours' | 'subscription'>('hours');

  // Currency selector: 'irt' (تومان / Tomans) or 'usd' (USDT $)
  const [selectedCurrency, setSelectedCurrency] = useState<'irt' | 'usd'>('irt');

  // Simulated live user credit state
  const [dailyFreeMinutes] = useState(300); // 5 hours = 300 mins
  const [usedMinutesToday] = useState(72); // 1h 12m used
  const [purchasedHours, setPurchasedHours] = useState(15); // Stored booster hours
  const [activePlan, setActivePlan] = useState<'free' | 'pro' | 'unlimited'>('free');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Payment Gateway Modal State
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);
  const [selectedPaymentItem, setSelectedPaymentItem] = useState<PaymentItem | null>(null);

  // Invoices history
  const [invoices, setInvoices] = useState([
    {
      id: 'CDG-902814',
      dateFa: '۲ مهر ۱۴۰۵',
      dateEn: 'Sep 24, 2026',
      titleFa: 'بسته ۲۵ ساعته کُدگر (پرو)',
      titleEn: '25 Hours Pro Compute Boost',
      tomanAmount: 189000,
      usdAmount: 3.9,
      gatewayFa: 'شاپرک (به‌پرداخت)',
      gatewayEn: 'Shetab Gateway',
      status: 'success',
    },
    {
      id: 'CDG-881023',
      dateFa: '۲۵ شهریور ۱۴۰۵',
      dateEn: 'Sep 16, 2026',
      titleFa: 'بسته ۱۰ ساعته استارتر',
      titleEn: '10 Hours Starter Boost',
      tomanAmount: 89000,
      usdAmount: 1.8,
      gatewayFa: 'زرین‌پال',
      gatewayEn: 'ZarinPal IPG',
      status: 'success',
    },
  ]);

  // Calculate free hours remaining
  const remainingFreeMinutes = Math.max(0, dailyFreeMinutes - usedMinutesToday);
  const freeRemainingHours = (remainingFreeMinutes / 60).toFixed(1);
  const freePercent = Math.round((remainingFreeMinutes / dailyFreeMinutes) * 100);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen && !isGatewayOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isGatewayOpen, onClose]);

  // Open Payment Gateway for Top-up Package
  const handleOpenPurchaseGateway = (item: PaymentItem) => {
    setSelectedPaymentItem(item);
    setIsGatewayOpen(true);
  };

  // On Successful payment from gateway
  const handlePaymentCompleted = (item: PaymentItem) => {
    if (item.type === 'hours' && item.hoursAdded) {
      setPurchasedHours((prev) => prev + item.hoursAdded!);
      const newInvoice = {
        id: `CDG-${Math.floor(100000 + Math.random() * 900000)}`,
        dateFa: 'همین الان',
        dateEn: 'Just now',
        titleFa: item.titleFa,
        titleEn: item.titleEn,
        tomanAmount: item.priceToman,
        usdAmount: item.priceUsdt,
        gatewayFa: 'درگاه پرداخت شاپرک / کریپتو',
        gatewayEn: 'Shetab / Web3 Gateway',
        status: 'success',
      };
      setInvoices((prev) => [newInvoice, ...prev]);
      showToast(
        isFa
          ? `🎉 بسته ${toPersianDigits(item.hoursAdded)} ساعته با موفقیت از طریق درگاه پرداخت به حسابتان افزوده شد!`
          : `🎉 Successfully added ${item.hoursAdded} hours via payment gateway!`
      );
      if (onTopUpSuccess) onTopUpSuccess(item.hoursAdded);
    } else if (item.type === 'subscription' && item.planKey) {
      setActivePlan(item.planKey);
      const newInvoice = {
        id: `CDG-${Math.floor(100000 + Math.random() * 900000)}`,
        dateFa: 'همین الان',
        dateEn: 'Just now',
        titleFa: item.titleFa,
        titleEn: item.titleEn,
        tomanAmount: item.priceToman,
        usdAmount: item.priceUsdt,
        gatewayFa: 'درگاه پرداخت شاپرک',
        gatewayEn: 'Shetab IPG',
        status: 'success',
      };
      setInvoices((prev) => [newInvoice, ...prev]);
      showToast(
        isFa
          ? `🚀 اشتراک شما با موفقیت از طریق درگاه پرداخت ارتقا یافت!`
          : `🚀 Subscription successfully upgraded via payment gateway!`
      );
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget && !isGatewayOpen) onClose();
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-slate-900/40 backdrop-blur-md overflow-y-auto"
        dir={isFa ? 'rtl' : 'ltr'}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="w-full max-w-2xl bg-gradient-to-b from-white/95 via-sky-50/95 to-blue-50/95 border-2 border-white/90 rounded-2xl sm:rounded-3xl shadow-[0_25px_80px_rgba(37,99,235,0.22)] overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[92vh] text-slate-800 font-sans relative my-auto backdrop-blur-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Liquid Glass Glow Accent Stripe */}
          <div className="h-1.5 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 w-full shadow-sm" />

          {/* Header & User Profile Info */}
          <div className="px-3.5 sm:px-5 py-3 sm:py-4 bg-white/70 border-b border-sky-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0 backdrop-blur-md">
            {/* User Identity Info */}
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#0ea5e9] via-[#38bdf8] to-[#7dd3fc] p-0.5 shadow-md shadow-sky-400/30 flex items-center justify-center text-white font-black text-base sm:text-lg border border-sky-200/80">
                  K
                </div>
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-xs">
                  <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white stroke-[3]" />
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-normal">
                    {isFa ? 'کیان' : 'Kian'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] bg-sky-100 text-sky-700 font-bold border border-sky-300/60 flex items-center gap-1 shadow-xs">
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-sky-600" />
                    <span>
                      {activePlan === 'unlimited'
                        ? 'VIP Enterprise'
                        : activePlan === 'pro'
                        ? 'Pro'
                        : isFa
                        ? 'کاربر فعال'
                        : 'Active'}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 mt-0.5 font-medium">
                  <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-500" />
                  <span className="truncate max-w-[170px] sm:max-w-none">arminsh00@gmail.com</span>
                </div>
              </div>
            </div>

            {/* Currency Switcher & Close Button */}
            <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center bg-white/80 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl border border-sky-200/80 text-xs shadow-inner">
                <button
                  type="button"
                  onClick={() => setSelectedCurrency('irt')}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl font-bold transition cursor-pointer text-[11px] sm:text-xs ${
                    selectedCurrency === 'irt'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-blue-700'
                  }`}
                >
                  {isFa ? 'تومان' : 'IRT (Toman)'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCurrency('usd')}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl font-bold transition cursor-pointer text-[11px] sm:text-xs ${
                    selectedCurrency === 'usd'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-emerald-700'
                  }`}
                >
                  USDT ($)
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-white/80 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition cursor-pointer border border-sky-200/70 hover:border-rose-300 active:scale-95 shadow-xs"
                title={isFa ? 'بستن' : 'Close'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="px-5 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-fadeIn backdrop-blur-md">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                {toastMessage}
              </span>
            </div>
          )}

          {/* Main Navigation Tabs */}
          <div className="px-5 pt-3 pb-2.5 bg-white/40 border-b border-sky-200/50 flex items-center gap-2 overflow-x-auto">
            {/* TAB 1: Billing */}
            <button
              type="button"
              onClick={() => setActiveTab('billing')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'billing'
                  ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-md shadow-blue-500/25 border border-white/60'
                  : 'text-slate-600 hover:text-blue-700 hover:bg-white/60 border border-transparent'
              }`}
            >
              <CircleDollarSign className="w-4 h-4" />
              <span>{isFa ? 'صورت‌حساب و پکیج‌ها' : 'Billing & Plans'}</span>
            </button>

            {/* TAB 2: Invoices & Receipts */}
            <button
              type="button"
              onClick={() => setActiveTab('invoices')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'invoices'
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-500/25 border border-white/60'
                  : 'text-slate-600 hover:text-teal-700 hover:bg-white/60 border border-transparent'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>{isFa ? 'تراکنش‌ها و فاکتورها' : 'Invoices & Receipts'}</span>
            </button>
          </div>

          {/* Tab Body */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 max-h-[calc(92vh-180px)]">
            {/* ══════════════════════════════════════════════════════════════ */}
            {/* TAB 1: BILLING, HOURLY PACKS & PLANS                          */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'billing' && (
              <div className="space-y-4 animate-fadeIn">
                {/* 1. Daily Quota & Banked Hours Status */}
                <div className="rounded-2xl sm:rounded-3xl p-3 sm:p-4 bg-gradient-to-r from-white/90 via-sky-50/80 to-blue-50/90 border-2 border-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 shadow-md shadow-sky-100 backdrop-blur-xl">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-600 border border-white flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/20">
                      <CalendarCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                        <span>{isFa ? 'سهمیه روزانه رایگان: ۵ ساعت' : 'Daily Free Allowance: 5h'}</span>
                        <span className="text-[10px] sm:text-[11px] text-blue-700 font-bold bg-blue-100/90 px-1.5 sm:px-2 py-0.5 rounded-full border border-blue-200">
                          {isFa
                            ? `(${toPersianDigits(freeRemainingHours)} ساعت باقی‌مانده)`
                            : `(${freeRemainingHours}h remaining)`}
                        </span>
                      </div>
                      <div className="w-full sm:w-56 h-2 sm:h-2.5 bg-slate-200/80 rounded-full overflow-hidden mt-1.5 sm:mt-2 border border-white">
                        <div
                          className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 rounded-full shadow-sm transition-all duration-500"
                          style={{ width: `${freePercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-sky-100 pt-2.5 sm:pt-0">
                    <div className="text-right">
                      <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium">{isFa ? 'اعتبار ذخیره شما:' : 'Banked Extra:'}</div>
                      <div className="font-black text-blue-700 text-xs sm:text-sm">
                        {isFa ? `${toPersianDigits(purchasedHours)} ساعت` : `${purchasedHours} Hours`}
                      </div>
                    </div>
                    <div className="text-[11px] sm:text-xs text-slate-700 font-bold flex items-center gap-1.5 bg-white/90 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl border border-sky-200/70 shadow-xs">
                      <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
                      <span>{isFa ? 'ریست: ۰۰:۰۰' : 'Reset: 00:00'}</span>
                    </div>
                  </div>
                </div>

                {/* Sub-tab Switcher: Hourly Boosts vs Monthly Subscriptions */}
                <div className="flex items-center justify-center">
                  <div className="flex bg-white/80 p-1.5 rounded-2xl border border-sky-200/80 w-full sm:w-auto shadow-sm">
                    <button
                      type="button"
                      onClick={() => setBillingSubTab('hours')}
                      className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        billingSubTab === 'hours'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                          : 'text-slate-600 hover:text-blue-700'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      <span>{isFa ? 'بسته‌های افزایش ساعت' : 'Hourly Boosts'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingSubTab('subscription')}
                      className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        billingSubTab === 'subscription'
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25'
                          : 'text-slate-600 hover:text-indigo-700'
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                      <span>{isFa ? 'پلن‌های ماهانه' : 'Monthly Subscriptions'}</span>
                    </button>
                  </div>
                </div>

                {/* Hourly Top-up Packages - VIBRANT 3D LIQUID GLASS */}
                {billingSubTab === 'hours' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {/* Pack 1: 10 Hours (Emerald / Mint 3D Glow) */}
                    <div className="rounded-3xl bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-white/95 border-2 border-emerald-300/80 hover:border-emerald-500 p-4 transition-all duration-300 flex flex-col justify-between group shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 relative backdrop-blur-xl hover:-translate-y-0.5">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-1 rounded-xl border border-emerald-300/60 shadow-xs">
                            {isFa ? 'بسته استارتر' : 'Starter'}
                          </span>
                          <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <Coins className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          </div>
                        </div>
                        <div className="mt-3.5">
                          <div className="text-2xl font-black text-slate-900 tracking-tight">
                            {isFa ? `+${toPersianDigits(10)} ساعت` : '+10 Hours'}
                          </div>
                          <div className="text-xs text-emerald-700 font-semibold mt-1">
                            {isFa ? 'بدون تاریخ انقضا' : 'Never expires'}
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-emerald-200/60">
                          <div className="text-lg font-black text-slate-900">
                            {selectedCurrency === 'irt'
                              ? isFa
                                ? `${toPersianDigits('۸۹,۰۰۰')} تومان`
                                : '89,000 Tomans'
                              : '$1.80 USDT'}
                          </div>
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
                        className="mt-4 w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/25"
                      >
                        <span>{isFa ? 'افزایش ۱۰ ساعت' : 'Add 10 Hours'}</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Pack 2: 25 Hours (Radiant Coral / Orange / Amber - POPULAR CENTERPIECE) */}
                    <div className="rounded-3xl bg-gradient-to-b from-orange-500/15 via-amber-500/10 to-white/95 border-2 border-orange-400 p-4 transition-all duration-300 flex flex-col justify-between relative shadow-[0_12px_40px_rgba(249,115,22,0.25)] hover:shadow-[0_16px_50px_rgba(249,115,22,0.35)] group backdrop-blur-2xl hover:-translate-y-1">
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 text-white font-black text-[10px] tracking-wide shadow-md shadow-orange-500/30 flex items-center gap-1">
                        <Flame className="w-3 h-3 fill-white" />
                        <span>{isFa ? 'محبوب‌ترین بسته' : 'MOST POPULAR'}</span>
                      </div>
                      <div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs font-bold text-orange-900 bg-orange-100/90 px-2.5 py-1 rounded-xl border border-orange-300/80 shadow-xs">
                            {isFa ? 'بسته ویژه' : 'Pro Boost'}
                          </span>
                          <div className="w-7 h-7 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                            <Star className="w-4 h-4 fill-orange-500 text-orange-500 group-hover:rotate-12 transition-transform" />
                          </div>
                        </div>
                        <div className="mt-3.5">
                          <div className="text-2xl font-black text-slate-900 tracking-tight">
                            {isFa ? `+${toPersianDigits(25)} ساعت` : '+25 Hours'}
                          </div>
                          <div className="text-xs text-orange-700 font-bold mt-1">
                            {isFa ? 'تخفیف ویژه + اولویت در صف' : 'Priority queue'}
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-orange-200/70">
                          <div className="text-lg font-black text-orange-600">
                            {selectedCurrency === 'irt'
                              ? isFa
                                ? `${toPersianDigits('۱۸۹,۰۰۰')} تومان`
                                : '189,000 Tomans'
                              : '$3.90 USDT'}
                          </div>
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
                        className="mt-4 w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 hover:brightness-105 text-white font-black text-xs transition-all cursor-pointer active:scale-95 shadow-md shadow-orange-500/30 flex items-center justify-center gap-1.5"
                      >
                        <span>{isFa ? 'افزایش ۲۵ ساعت' : 'Add 25 Hours'}</span>
                        <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>

                    {/* Pack 3: 60 Hours (Electric Pink / Fuchsia / Purple 3D Glow) */}
                    <div className="rounded-3xl bg-gradient-to-b from-fuchsia-500/10 via-pink-500/5 to-white/95 border-2 border-fuchsia-300/80 hover:border-fuchsia-500 p-4 transition-all duration-300 flex flex-col justify-between group shadow-lg shadow-fuchsia-500/10 hover:shadow-fuchsia-500/20 relative backdrop-blur-xl hover:-translate-y-0.5">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-fuchsia-900 bg-fuchsia-100/90 px-2.5 py-1 rounded-xl border border-fuchsia-300/60 shadow-xs">
                            {isFa ? 'بسته مستر' : 'Master Pack'}
                          </span>
                          <div className="w-7 h-7 rounded-xl bg-fuchsia-100 flex items-center justify-center text-fuchsia-600">
                            <Zap className="w-4 h-4 text-fuchsia-600 group-hover:scale-110 transition-transform" />
                          </div>
                        </div>
                        <div className="mt-3.5">
                          <div className="text-2xl font-black text-slate-900 tracking-tight">
                            {isFa ? `+${toPersianDigits(60)} ساعت` : '+60 Hours'}
                          </div>
                          <div className="text-xs text-fuchsia-700 font-semibold mt-1">
                            {isFa ? 'مناسب پروژه‌های بزرگ' : 'For large projects'}
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-fuchsia-200/60">
                          <div className="text-lg font-black text-slate-900">
                            {selectedCurrency === 'irt'
                              ? isFa
                                ? `${toPersianDigits('۳۸۰,۰۰۰')} تومان`
                                : '380,000 Tomans'
                              : '$7.90 USDT'}
                          </div>
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
                        className="mt-4 w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold text-xs transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 shadow-md shadow-fuchsia-500/25"
                      >
                        <span>{isFa ? 'افزایش ۶۰ ساعت' : 'Add 60 Hours'}</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Monthly Subscriptions */}
                {billingSubTab === 'subscription' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Pro Tier (Sky / Indigo Glow) */}
                    <div className="rounded-3xl bg-gradient-to-b from-blue-500/10 via-sky-500/5 to-white/95 border-2 border-blue-300 p-5 space-y-3.5 shadow-lg shadow-blue-500/10 backdrop-blur-xl">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">
                          {isFa ? 'توسعه‌دهنده حرفه‌ای (Pro)' : 'Pro Developer'}
                        </span>
                        <span className="text-[11px] text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-300 font-bold">
                          {isFa ? 'پیشنهادی' : 'Recommended'}
                        </span>
                      </div>
                      <div className="text-2xl font-black text-blue-700">
                        {selectedCurrency === 'irt'
                          ? isFa
                            ? `${toPersianDigits('۲۷۰,۰۰۰')} تومان`
                            : '270,000 Tomans'
                          : '$6.90'}
                        <span className="text-xs text-slate-500 font-normal"> / {isFa ? 'ماهانه' : 'mo'}</span>
                      </div>
                      <ul className="text-xs space-y-2 text-slate-700 font-medium">
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{isFa ? `${toPersianDigits(60)} ساعت اعتبار اختصاصی در ماه` : '60h monthly booster runtime'}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{isFa ? 'اولویت صفی لحظه‌ای و بدون معطلی' : 'Zero-queue priority runtime'}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{isFa ? 'حالت استدلال و ریفکتورینگ عمیق' : 'Deep reasoning & refactoring'}</span>
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
                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-500/25 active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        {activePlan === 'pro' ? (
                          <span>{isFa ? 'پلن فعال شما' : 'Active Tier'}</span>
                        ) : (
                          <span>{isFa ? 'ارتقا به حرفه‌ای' : 'Upgrade to Pro'}</span>
                        )}
                      </button>
                    </div>

                    {/* Unlimited Tier (Amber / Gold VIP) */}
                    <div className="rounded-3xl bg-gradient-to-b from-amber-500/15 via-orange-500/5 to-white/95 border-2 border-amber-400 p-5 space-y-3.5 shadow-lg shadow-amber-500/15 backdrop-blur-xl">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900 text-sm">
                          {isFa ? 'نامحدود (Enterprise VIP)' : 'Unlimited VIP'}
                        </span>
                        <span className="text-[11px] text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 font-bold">
                          VIP
                        </span>
                      </div>
                      <div className="text-2xl font-black text-amber-700">
                        {selectedCurrency === 'irt'
                          ? isFa
                            ? `${toPersianDigits('۵۹۰,۰۰۰')} تومان`
                            : '590,000 Tomans'
                          : '$14.90'}
                        <span className="text-xs text-slate-500 font-normal"> / {isFa ? 'ماهانه' : 'mo'}</span>
                      </div>
                      <ul className="text-xs space-y-2 text-slate-700 font-medium">
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>{isFa ? 'ساعات مصرف کاملاً نامحدود و بدون سقف' : 'Unlimited compute hours'}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>{isFa ? 'سرورهای اختصاصی پرسرعت GPU' : 'Dedicated GPU sandbox instances'}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>{isFa ? 'پشتیبانی اختصاصی مهندسی' : '24/7 dedicated engineering support'}</span>
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
                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-105 text-white text-xs font-black transition-all cursor-pointer shadow-md shadow-amber-500/25 active:scale-95 flex items-center justify-center gap-1.5"
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
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* TAB 2: INVOICES & TRANSACTIONS HISTORY                        */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'invoices' && (
              <div className="space-y-3 animate-fadeIn">
                <div className="text-xs text-slate-600 font-bold flex items-center justify-between">
                  <span>{isFa ? 'تاریخچه سفارش‌ها و پرداخت‌های اخیر' : 'Recent Order Invoices'}</span>
                  <span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    {isFa ? `${toPersianDigits(invoices.length)} فاکتور` : `${invoices.length} records`}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {invoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-4 rounded-3xl bg-white/90 border border-sky-200/80 hover:border-blue-400 transition-all flex items-center justify-between text-xs backdrop-blur-xl shadow-xs"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-black text-slate-900 text-sm">
                            {isFa ? inv.titleFa : inv.titleEn}
                          </div>
                          <div className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                            <span className="text-blue-600 font-bold">{inv.id}</span>
                            <span>•</span>
                            <span>{isFa ? inv.dateFa : inv.dateEn}</span>
                            <span>•</span>
                            <span className="text-slate-600">{isFa ? inv.gatewayFa : inv.gatewayEn}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-black text-slate-900 text-sm">
                          {selectedCurrency === 'irt'
                            ? isFa
                              ? `${toPersianDigits(inv.tomanAmount.toLocaleString())} تومان`
                              : `${inv.tomanAmount.toLocaleString()} Tomans`
                            : `$${inv.usdAmount.toFixed(2)} USDT`}
                        </div>
                        <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 font-bold mt-1 inline-block">
                          {isFa ? 'پرداخت موفق' : 'Completed'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-5 py-3 bg-white/80 border-t border-sky-200/60 flex items-center justify-between text-xs text-slate-600 shrink-0 backdrop-blur-md">
            <span className="flex items-center gap-1.5 text-blue-700 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>
                {isFa
                  ? 'سیستم امن تراکنش‌های مالی شاپرک و وب۳'
                  : 'Secure Shetab & Web3 Payments'}
              </span>
            </span>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-1.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer active:scale-95 shadow-sm shadow-blue-500/20"
            >
              {isFa ? 'بستن' : 'Done'}
            </button>
          </div>
        </motion.div>

        {/* Integrated Payment Gateway Modal */}
        <PaymentGatewayModal
          isOpen={isGatewayOpen}
          onClose={() => setIsGatewayOpen(false)}
          item={selectedPaymentItem}
          language={language}
          onPaymentSuccess={handlePaymentCompleted}
        />
      </div>
    </AnimatePresence>
  );
}
