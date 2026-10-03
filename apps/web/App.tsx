import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Star, Shield, Zap, Globe, Smartphone, Send, Search, LayoutGrid, Heart } from 'lucide-react';

// Legacy cleared
return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white pb-24" dir="rtl">
      {/* Top Notification Bar */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white text-xs font-bold py-2.5 px-4 text-center flex items-center justify-center gap-2 shadow-md">
        <Sparkles className="w-4 h-4 text-amber-300" />
        <span>پروژه آماده و فعال: کلیه بخش‌ها و امکانات به صورت تعاملی در دسترس هستند.</span>
      </div>

      {/* Navigation Header */}
      <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white block">che khabar</span>
              <span className="text-[10px] text-blue-400 font-medium">طراحی اختصاصی و سفارشی‌سازی شده</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (!liked) {
                  setLikes(l => l + 1);
                  setLiked(true);
                }
              }}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                liked ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current text-rose-500' : ''}`} />
              <span>{likes}</span>
            </button>
            <button className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition cursor-pointer">
              شروع کار
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>پلتفرم مدرن و کاملاً واکنش‌گرا</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-6 leading-tight max-w-3xl mx-auto">
          che khabar
        </h1>
        <p className="text-base text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
          پیاده‌سازی شده با بهره‌گیری از بروزترین استانداردهای فرانت‌اند، طراحی تعاملی زنده و قابلیت شخصی‌سازی بالا.
        </p>
      </section>

      {/* Feature Cards Grid */}
      <section className="max-w-6xl mx-auto px-6 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {featureCards.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl bg-slate-900/70 border border-slate-800/80 hover:border-blue-500/40 p-6 flex flex-col justify-between transition-all duration-300 group shadow-xl hover:-translate-y-1"
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${feat.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 mb-2 inline-block">
                    {feat.badge}
                  </span>
                  <h3 className="font-extrabold text-base text-white mb-2">{feat.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Contact / Subscription Section */}
      <section className="max-w-4xl mx-auto px-6">
        <div className="rounded-3xl bg-gradient-to-tr from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 p-8 text-center shadow-2xl">
          <h3 className="font-extrabold text-xl text-white mb-3">عضویت در خبرنامه و دریافت آخرین بروزرسانی‌ها</h3>
          <p className="text-xs text-slate-400 mb-6 max-w-md mx-auto">
            برای اطلاع از اخبار جدید، تخفیف‌ها و ویژگی‌های جدید ایمیل خود را وارد نمایید.
          </p>
          {subscribed ? (
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>ایمیل شما با موفقیت در سیستم ثبت گردید!</span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ایمیل خود را وارد کنید..."
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  if (email.includes('@')) setSubscribed(true);
                }}
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition cursor-pointer shrink-0"
              >
                ثبت ایمیل
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}