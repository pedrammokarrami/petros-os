# 🚀 کدگر (CODGAR AI) - Autonomous AI Coding Studio & Multi-Router Engine

کدگر (Codgar) یک محیط توسعه مستقل و پیشرفته (Autonomous AI Coding Agent & Full-Stack Architect) است که فرانت‌اند مدرن (React 19 + Tailwind CSS) و بک‌اند ماژولار قدرتمند (Node.js + Express) را به همراه ران‌تایم هوشمند، کامپایلر چندزبانه، و استخر بی‌نهایت توکن (Infinite Token Pool) در یک پکیج آماده و کامل ارائه می‌دهد.

---

## ⚡ نصب و راه‌اندازی ۱۰۰٪ خودکار در سیستم خام (حتی بدون Node.js)

این پروژه مجهز به یک **اسکریپت خودکار تشخیص سیستم خام** (`install.sh` برای مک و لینوکس، و `install.bat` برای ویندوز) است که اگر حتی Node.js یا پیش‌نیازی نصب نباشد، خودکار آن را دانلود، نصب و به‌روزرسانی کرده و سرور را روی پورت 3000 اجرا می‌کند.

### ۱. دستور تک‌خطی برای مک و لینوکس (Terminal):

```bash
git clone https://github.com/audiovido/Codgar-.git && cd Codgar- && ./install.sh
```

### ۲. یا با دستور استاندارد NPM (در صورت داشتن Node.js):

```bash
# ۱. کلون کردن مخزن
git clone https://github.com/audiovido/Codgar-.git
cd Codgar-

# ۲. اجرای خودکار نصب پکیج‌ها و کانفیگ
npm run setup

# ۳. شروع سرور توسعه
npm run dev
```

### ۳. در محیط ویندوز (Windows):
کافیست پروژه را دانلود یا کلون کرده و روی فایل **`install.bat`** دوبار کلیک کنید!

---

## 🌐 آدرس دسترسی محلی
پس از اجرای دستور، پروژه به صورت خودکار بالا آمده و در مرورگر با این آدرس قابل مشاهده است:
👉 **http://localhost:3000**

---

## 🛠️ اسکریپت‌های موجود در پروژه (NPM Scripts)

| دستور | عملکرد |
| :--- | :--- |
| `npm run dev` | اجرای محیط توسعه کامل (بک‌اند با `tsx` + فرانت‌اند با `Vite` روی پورت 3000) |
| `npm run build` | کامپایل فرانت‌اند به استاتیک در `dist/` و باندل سرور با `esbuild` به `dist/server.cjs` |
| `npm start` | اجرای نسخه نهایی و پروداکشن (`node dist/server.cjs`) |
| `npm run lint` | بررسی کامل ساختار تایپ‌اسکریپت و بدون خطا بودن کدها |
| `npm run setup` | کپی خودکار `.env.example` به `.env` و نصب امن تمام وابستگی‌ها |

---

## 📦 پیش‌نیازهای سیستمی (Prerequisites)

- **Node.js**: نسخه 18 به بالا (توصیه شده: Node.js 20.x یا 22.x LTS)
- **NPM**: نسخه 9 به بالا (همراه Node نصب است)
- **Git**: جهت کلون کردن مخزن

> 💡 *نکته:* در صورت استفاده از اسکریپت `./install.sh` یا `install.bat`، تمامی این پیش‌نیازها در صورت عدم وجود به طور خودکار نصب خواهند شد.

---

## 🔑 تنظیم کلیدهای API (اختیاری اما پیشنهادی)

فایل `.env` را در صورت تمایل باز کنید:
```env
GEMINI_API_KEY="کلید_جمنای_شما"
ANTHROPIC_API_KEY="کلید_کلود_اختیاری"
```
> **نکته مهم**: حتی بدون کلید اختصاصی، استخر توکن چندگانه کدگر (`InfiniteTokenPool`) به صورت خودکار از روترهای پشتیبان (OmniRoute, 9Router, VansRouter) برای اجرای دستورات استفاده می‌کند.

---

## 🏗️ ساختار پروژه (Architecture)

- `server.ts`: هسته اصلی سرور اکسپرس و ارکستراتور هوش مصنوعی و ترمینال.
- `server/`: ماژول‌های زیرساختی شامل KeyManager, InfiniteTokenPool, AgentRuntime, UniversalCompiler.
- `src/`: کامپوننت‌های فرانت‌اند (React 19, Motion, Lucide Icons, Tailwind CSS v4).
- `install.sh` / `install.bat`: اسکریپت‌های نصب و اجرای تک‌کلیک روی سیستم‌های خام.
- `BACKEND_ARCHITECTURE.md`: مستند کامل ریزبه‌ریز تمامی اندپوینت‌های API و کارکرد روترها.
