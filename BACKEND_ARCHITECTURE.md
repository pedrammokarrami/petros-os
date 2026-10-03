# مستند مرجع و جامع معماری بک‌اند و مستندات کامل API (ریز به ریز)
# Codgar Autonomous AI Engine - Comprehensive Backend & API Reference Manual

این مستند فنی به عنوان جامع‌ترین مرجع فنی زیرساخت بک‌اند پروژه **کدگر (Codgar)** تدوین شده است. در این سند، معماری تمامی ماژول‌های واقعی فعال در بک‌اند، الگوریتم روترهای سه‌گانه، استخر بی‌نهایت توکن (Infinite Token Pool)، موتور مدیریت کلیدها (KeyManager)، ران‌تایم ایجنت، پایگاه حافظه پروژه، کامپایلر چندزبانه، و **تمامی اندپوینت‌های واقعی API** همراه با ساختار دقیق ورودی، خروجی و نمونه پاسخ‌ها مستند گردیده است.

---

## ۱. نمای کلی زیرساخت سرور (Backend Architecture)

سرور بک‌اند بر پایه **Node.js (v20+)**، **Express** و **TypeScript** توسعه یافته و در فرآیند بیلد پروداکشن از طریق **esbuild** به یک باندل خودکفا و ایزوله (`dist/server.cjs`) کامپایل می‌شود. 

### نمودار جریان اجرای درخواست‌ها و روتینگ:
```
[Client / React UI] 
       │
       ▼  HTTP / REST / SSE Stream
┌────────────────────────────────────────────────────────────────────────┐
│ Express Server (0.0.0.0:3000)                                          │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ 1. Security & KeyManager Layer (Rotation, Decryption, KeyMasking)  │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                   │                                    │
│                                   ▼                                    │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ 2. AI Chat Orchestrator (/api/agent/chat)                          │ │
│ │    - Dynamic Real-Time Grounding (Tehran Shamsi & Gregorian Date)   │ │
│ │    - Temporal Anchor & Prompt Injection                            │ │
│ │    - Fast-Failover Cascade Across Models                           │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                   │                                    │
│            ┌──────────────────────┴──────────────────────┐             │
│            ▼                                             ▼             │
│  [Primary Gemini Live Bridge]                 [Fallback Engine]        │
│  (gemini-3.5-flash -> gemini-3.6 -> etc)      Claude Code Terminal     │
│                                                          │             │
│                                                          ▼             │
│                                              ┌───────────────────────┐ │
│                                              │ Infinite Token Pool   │ │
│                                              │ OmniRoute Gateway     │ │
│                                              │ 9Router Engine (RTK)  │ │
│                                              │ VansRouter Overdrive  │ │
│                                              │ (Circular Recovery)   │ │
│                                              └───────────────────────┘ │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ 3. Subsystem Services                                              │ │
│ │  - Filesystem & Sandbox Guard (resolveSafePath)                    │ │
│ │  - Local Terminal & CLI Bridge                                     │ │
│ │  - Universal Multi-Language Compiler (Python, Go, Rust, C++, JS/TS)│ │
│ │  - Git VCS Integrator                                              │ │
│ │  - AgentRuntime Background Worker & SSE Event Stream               │ │
│ │  - Memory & Skills Registry (.codgar_memory.json)                  │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ۲. تشریح دقیق کارکرد روترها و استخر توکن (Multi-Router Mesh)

سیستم روتینگ بک‌اند کدگر در فایل `server/infiniteTokenPool.ts` و `server.ts` مستقر است و سه گیت‌وی جهانی متن‌باز را به صورت یکپارچه تجمیع کرده است:

### ۲.۱. معرفی روترهای سه‌گانه
1. **OmniRoute Gateway** (`https://github.com/diegosouzapw/OmniRoute`):
   - **نقش**: روتر خط مقدم و پرسرعت برای پردازش‌های عمومی و کم‌تاخیر.
   - **مشخصات**: دارای ۳۵۹ پرووایدر و بیش از ۱۵۰ تایر رایگان (ظرفیت ارزیابی‌شده ~۱.۶۲ میلیارد توکن در ماه).
   - **موتور فشرده‌سازی**: `RTK + Caveman Stacked Compression` با میانگین ۸۹٪ کاهش بار توکن.
   - **مدل‌های پیش‌فرض**: `Gemini 3.6 Flash`, `Gemini 3.5 Flash`, `Claude 3.7 Sonnet`, `DeepSeek V3/R1`, `Qwen 2.5 Coder 32B`.

2. **9Router Engine** (`https://github.com/decolua/9router`):
   - **نقش**: لایه دوم و پشتیبان هوشمند (Smart 3-Tier Fallback).
   - **مشخصات**: پورت استاندارد `20128`؛ دارای فناوری ذخیره‌سازی توکن `RTK Headroom Token Saver` که خروجی ابزارها (`tool_result`) را حین پرواز تا ۴۰٪ فشرده می‌کند.
   - **مدل‌های پیش‌فرض**: `Claude Code CLI`, `Gemini 2.5 Flash`.

3. **VansRouter Overdrive** (`https://github.com/Vanszs/VansRouter`):
   - **نقش**: لایه سوم و بار سنگین (Overdrive High-Throughput).
   - **مشخصات**: پورت `20132`؛ مدیریت هم‌زمان تا ۲۴۰ درخواست بر ثانیه (TPS)، مناسب برای تولید پروژه‌های حجیم و همپوشانی وظایف سنگین.
   - **مدل‌های پیش‌فرض**: `Vans-Gemini-MultiKey-Aggregator`, `DeepSeek-Coder-Vans`.

### ۲.۲. سازوکار بازیابی بی‌پایان (Infinite Circular Loop Recovery)
هنگامی که سهمیه یکی از مدل‌ها یا کلیدها به اتمام برسد (`429 Rate Limit`):
1. ایونت `cascadeToNextRouter` فراخوانی می‌شود و سیستم بدون قطعی درخواست را به روتر بعدی منتقل می‌کند.
2. در صورتی که هر سه روتر پشت سر هم پر شوند، متد `restartAndRefreshRouters` به صورت خودکار فراخوانی شده، آمار کش پاکسازی می‌شود، شاخص به روتر اول بازمی‌گردد و چرخه با ظرفیت نو مجدداً فعال می‌گردد (هیچ‌گاه خطا به کاربر بازگردانده نمی‌شود).

---

## ۳. ماژول مدیریت کلیدها (KeyManager)

در فایل `server/keyManager.ts`:
- کلیدهای ورودی از فایل محیطی (`process.env.GEMINI_API_KEY`) یا از طریق پنل کاربری لود می‌شوند.
- سیستم کلیدها را در حافظه ماسک کرده (`AIzaSy...****`) تا از فاش شدن در لاگ‌ها یا پاسخ‌های API جلوگیری شود.
- امکان افزودن کلیدهای ثانویه در زمان اجرا و چرخش هوشمند به کلید بعدی با الگوریتم Round-Robin فراهم است.
- یک پین کد جهانی استاندارد (`123456`) برای اعتبارسنجی عملیات حساس امنیتی و ساخت کلیدهای مجازی پیاده‌سازی شده است.

---

## ۴. لایه گراندینگ زمانی زنده (Real-Time Temporal Grounding)

برای جلوگیری از توهم تاریخ (Hallucination)، سرور در متد `handleAgentChat` به طور مستقیم تاریخ دقیق سیستم را بر اساس منطقه زمانی ایران استخراج و در دستورالعمل سیستمی تزریق می‌کند:
- تقویم هجری شمسی دقیق (`fa-IR-u-ca-persian` با منطقه زمانی `Asia/Tehran`).
- تاریخ کامل میلادی و روز دقیق هفته.
- زمان دقیق به ساعت و دقیقه.
بدین ترتیب در صورت پرسش کاربر درباره تاریخ یا روز هفته («امروز چند شنبه است»)، هوش مصنوعی دقیق‌ترین پاسخ لحظه‌ای را ارائه می‌دهد.

---

## ۵. مستندات کامل و ریز به ریز API های سرور (Complete API Documentation)

کلیه اندپوینت‌ها در پورت `3000` و با پیشوند `/api/` در دسترس هستند.

---

### ۵.۱. دسته سلامت سرور و سیستم (Health & Status)

#### `GET /api/health`
بررسی زنده بودن سرور، وضعیت کلید فعال و دایرکتوری کاری.
- **Request Headers**: ندارد
- **Response**:
```json
{
  "status": "ok",
  "runtime": "ready",
  "version": "1.0.0",
  "timestamp": 1774355365000,
  "workers": ["coder", "writer", "router"],
  "hasApiKey": true,
  "keyMask": "AIzaSy...4B8f",
  "totalKeys": 3,
  "workspaceRoot": "/workspace"
}
```

---

### ۵.۲. دسته پردازش هوش مصنوعی و گفتگو (Agent AI & Chat)

#### `POST /api/agent/chat`
اصلی‌ترین اندپوینت پردازش پرامپت، تولید کدهای کامل بدون پلیس‌هولدر، اجرای زنجیره مدل‌ها و تولید پاسخ هوشمند.
- **Request Body**:
```json
{
  "prompt": "امروز چند شنبه است و یک تابع سورت در تایپ‌اسکریپت بنویس",
  "mode": "agent", // "agent" | "code" | "ask"
  "language": "fa", // "fa" | "en"
  "context": {
    "currentFile": "src/utils/sorter.ts",
    "gitBranch": "main"
  },
  "history": [
    { "role": "user", "content": "سلام" },
    { "role": "model", "content": "سلام! در خدمتم." }
  ]
}
```
- **Response**:
```json
{
  "success": true,
  "response": "سلام! امروز یکشنبه ۱ مهر ۱۴۰۵ است ...",
  "model": {
    "id": "gemini-3.5-flash",
    "name": "Google gemini-3.5-flash (Direct AI Engine)",
    "provider": "Google AI Studio"
  },
  "routerTier": "Google gemini-3.5-flash Direct Gateway",
  "executionSource": "live-bridge",
  "extractedArtifact": {
    "id": "art-1774355400123",
    "title": "sorter.ts",
    "type": "typescript",
    "code": "export function quickSort<T>(arr: T[]): T[] { ... }"
  }
}
```

---

### ۵.۳. دسته استخر بی‌نهایت توکن و روترها (Infinite Token Pool & Keys)

#### `GET /api/pool/metrics`
دریافت آمار کامل روترهای سه‌گانه، میزان مصرف، توکن‌های ذخیره‌شده و کلیدهای مجازی.
- **Response**:
```json
{
  "success": true,
  "totalRotations": 4,
  "totalRestarts": 1,
  "currentRouter": {
    "id": "omniroute",
    "name": "OmniRoute Gateway",
    "activeStatus": "running",
    "totalTokensAvailable": "~1.62 Billion Tokens/Month Pool",
    "compressionEngine": "RTK + Caveman Stacked Compression"
  },
  "allRouters": { ... },
  "keysCount": 2,
  "keys": [ ... ]
}
```

#### `POST /api/pool/cascade`
دستور دستی جهت سوییچ آنی به روتر بعدی در زنجیره استخر توکن.
- **Request Body**:
```json
{
  "reason": "Quota reached on current provider"
}
```
- **Response**:
```json
{
  "success": true,
  "previousRouter": "OmniRoute Gateway",
  "newRouter": {
    "id": "9router",
    "name": "9Router Engine",
    "tpsCapacity": 160
  },
  "didLoopRestart": false
}
```

#### `POST /api/pool/restart`
راه‌اندازی مجدد و ریست کردن تمامی روترها و پاکسازی شمارنده‌های کول‌داون.
- **Response**:
```json
{
  "success": true,
  "message": "All routers (OmniRoute, 9Router, VansRouter) successfully restarted and refreshed.",
  "timestamp": 1774355420000
}
```

#### `GET /api/keys/status`
بررسی وضعیت چرخه کلیدهای فعال و تعداد درخواست‌های ناموفق.
- **Response**:
```json
{
  "success": true,
  "currentIndex": 0,
  "totalKeys": 2,
  "keyMask": "AIzaSy...7X9q",
  "rotationsCount": 5
}
```

#### `POST /api/keys/rotate`
چرخش اجباری به کلید بعدی در KeyManager.
- **Request Body**:
```json
{
  "reason": "manual_rotation"
}
```

#### `POST /api/keys/add`
ثبت کلید جدید در حافظه سرور در زمان اجرا.
- **Request Body**:
```json
{
  "apiKey": "AIzaSy..."
}
```

#### `GET /api/keys/list`
دریافت لیست کلیدهای مجازی استخر توکن به همراه پین پیش‌فرض (`123456`).
- **Response**:
```json
{
  "success": true,
  "keys": [ ... ],
  "defaultPin": "123456"
}
```

#### `POST /api/keys/verify-pin`
اعتبارسنجی پین امنیتی (پیش‌فرض: `123456`).
- **Request Body**:
```json
{
  "pin": "123456"
}
```
- **Response**:
```json
{
  "success": true,
  "valid": true,
  "message": "PIN verified successfully (123456)."
}
```

#### `POST /api/pool/test-infinite`
اجرای تست حلقوی ۴ مرحله‌ای برای اثبات عدم متوقف شدن سیستم روترها.
- **Response**:
```json
{
  "success": true,
  "message": "Infinite cascade loop executed and verified. The system never terminates!",
  "steps": [ ... ],
  "currentRouter": "9Router Engine"
}
```

---

### ۵.۴. دسته سیستم فایل ایمن (Secure Filesystem API)

تمام مسیرها از طریق تابع `resolveSafePath` اعتبارسنجی می‌شوند تا از آسیب‌پذیری Directory Traversal جلوگیری گردد.

#### `GET /api/fs/tree?dir=.`
دریافت ساختار درختی دایرکتوری‌ها و فایل‌ها (تا عمق ۵ لایه با حذف پوشه‌های اضافی نظیر node_modules).
- **Response**:
```json
{
  "success": true,
  "root": ".",
  "tree": [
    {
      "name": "src",
      "path": "src",
      "type": "directory",
      "children": [ ... ]
    },
    {
      "name": "package.json",
      "path": "package.json",
      "type": "file",
      "size": 1420,
      "mtime": 1774355000000
    }
  ]
}
```

#### `POST /api/fs/read`
خواندن محتوای فایل متنی مشخص شده.
- **Request Body**:
```json
{
  "filePath": "src/App.tsx"
}
```
- **Response**:
```json
{
  "success": true,
  "filePath": "src/App.tsx",
  "content": "import React from 'react'...",
  "size": 25408,
  "lines": 623
}
```

#### `POST /api/fs/write`
ایجاد یا بازنویسی فایل به همراه ساخت خودکار دایرکتوری‌های والد در صورت نیاز.
- **Request Body**:
```json
{
  "filePath": "src/utils/helper.ts",
  "content": "export const add = (a: number, b: number) => a + b;",
  "createDirs": true
}
```
- **Response**:
```json
{
  "success": true,
  "filePath": "src/utils/helper.ts",
  "bytesWritten": 51
}
```

#### `POST /api/fs/search`
جستجوی سریع متنی در کلیه فایل‌های پروژه.
- **Request Body**:
```json
{
  "query": "InfiniteTokenPool",
  "maxResults": 20
}
```
- **Response**:
```json
{
  "success": true,
  "query": "InfiniteTokenPool",
  "matchesCount": 5,
  "results": [
    {
      "file": "server/infiniteTokenPool.ts",
      "line": 56,
      "content": "export class InfiniteTokenPool {"
    }
  ]
}
```

---

### ۵.۵. دسته ترمینال و اسکریپت‌رانر سیستم محلی (Terminal & Local Bridge)

#### `POST /api/terminal/run`
اجرای دستور در شل ایزوله سرور یا کانتینر با سقف خروجی بافر شده و قابلیت لغو (Timeout).
- **Request Body**:
```json
{
  "command": "npm run lint",
  "cwd": ".",
  "timeout": 30000
}
```
- **Response**:
```json
{
  "success": true,
  "executionId": "term-1774355500000",
  "command": "npm run lint",
  "exitCode": 0,
  "durationMs": 1420,
  "stdout": "> codgar-ai-agent@3.0.0 lint\n> tsc --noEmit",
  "stderr": ""
}
```

#### `POST /api/terminal/cancel`
لغو و متوقف‌سازی یک پروسه در حال اجرا از طریق ارسال سیگنال `SIGTERM`.
- **Request Body**:
```json
{
  "executionId": "term-1774355500000"
}
```

#### `GET /api/local-bridge/status`
دریافت وضعیت اتصال به ترمینال سیستم‌عامل محلی کلاینت (Windows / macOS / Linux).
- **Response**:
```json
{
  "success": true,
  "connected": true,
  "mode": "local_os",
  "bridge": {
    "os": "Linux Bash",
    "port": 4000,
    "version": "1.4.2-daemon",
    "commandCount": 14
  }
}
```

#### `POST /api/local-bridge/execute`
ارسال دستور برای اجرا در ماشین کلاینت از طریق دیمون محلی Codgar CLI.
- **Request Body**:
```json
{
  "command": "git status",
  "cwd": "."
}
```

---

### ۵.۶. دسته یکپارچگی گیت (Git VCS Engine)

#### `GET /api/git/status`
بررسی کامل وضعیت مخزن گیت شامل شاخه فعلی، فایل‌های Staged، Unstaged و Untracked.
- **Response**:
```json
{
  "success": true,
  "isGit": true,
  "branch": "main",
  "staged": ["src/App.tsx"],
  "unstaged": ["server.ts"],
  "untracked": [],
  "clean": false
}
```

#### `GET /api/git/diff?file=src/App.tsx&cached=false`
دریافت خروجی استاندارد Unified Diff برای تغییرات اعمال شده روی فایل.
- **Response**:
```json
{
  "success": true,
  "diff": "@@ -349,6 +349,7 @@ ... + ... - ..."
}
```

#### `GET /api/git/log`
دریافت ۸ کامیت اخیر با هش، نویسنده، زمان نسبی و پیام کامیت.
- **Response**:
```json
{
  "success": true,
  "commits": [
    {
      "hash": "7a9f21d",
      "author": "Codgar Architect",
      "date": "2 hours ago",
      "message": "fix: temporal grounding and router mesh optimization"
    }
  ]
}
```

#### `POST /api/git/commit`
ثبت کامیت امن برای تغییرات فایل‌های انتخابی یا تمام فایل‌ها.
- **Request Body**:
```json
{
  "message": "feat: update date grounding",
  "files": ["server.ts", "src/components/CodedAiChatCard.tsx"]
}
```

---

### ۵.۷. دسته کامپایلر چندزبانه و رانر ابری (Universal Compiler API)

در فایل `server/universalCompiler.ts`:

#### `GET /api/compiler/tools`
گزارش وضعیت نصب بودن کامپایلرها در محیط سرور (شامل Python3, Node/TS, Go, Rust, GCC/C++, Swift).
- **Response**:
```json
{
  "success": true,
  "languages": {
    "python": { "installed": true, "version": "3.11.2", "runner": "python3" },
    "javascript": { "installed": true, "version": "20.18.0", "runner": "node / tsx" },
    "cpp": { "installed": true, "version": "12.2.0", "runner": "g++" }
  }
}
```

#### `POST /api/compiler/execute`
کامپایل و اجرای ایزوله اسکریپت‌ها به زبان‌های مختلف با تولید خروجی ترمینال یا سندباکس HTML5.
- **Request Body**:
```json
{
  "language": "python",
  "code": "print('Hello from Codgar Universal Compiler!')",
  "autoInstall": true
}
```
- **Response**:
```json
{
  "success": true,
  "language": "python",
  "stdout": "Hello from Codgar Universal Compiler!\n",
  "stderr": "",
  "exitCode": 0,
  "durationMs": 48
}
```

---

### ۵.۸. دسته مدیریت صف وظایف ایجنت و استریم SSE (Agent Task Queue & SSE)

در فایل `server/agentRuntime.ts`:

#### `POST /api/tasks`
تعریف و آغاز یک تسک چندمرحله‌ای برای ایجنت خودکار.
- **Request Body**:
```json
{
  "prompt": "طراحی سیستم احراز هویت با JWT در Express",
  "mode": "agent"
}
```
- **Response**:
```json
{
  "success": true,
  "task": {
    "id": "task-1774355600000",
    "prompt": "طراحی سیستم احراز هویت با JWT در Express",
    "status": "running",
    "steps": []
  }
}
```

#### `GET /api/tasks`
مشاهده لیست وظایف اخیر صف ایجنت‌ها.

#### `GET /api/tasks/:id`
مشاهده جزئیات یک وظیفه و لاگ‌های گام‌به‌گام.

#### `GET /api/tasks/:id/events`
استریم زنده گام‌ها و خروجی ایجنت از طریق پروتکل **Server-Sent Events (SSE)**.
- **Response Header**: `Content-Type: text/event-stream`
- **Event Chunks**:
```
data: {"type":"connected","taskId":"task-1774355600000","timestamp":1774355600100}

data: {"type":"step","stepIndex":1,"title":"Analyzing repository","status":"completed"}

data: {"type":"finished","success":true,"timestamp":1774355605000}
```

---

### ۵.۹. دسته پروتکل‌های MCP و استانداردهای مهندسی (MCP Registry & Standards)

#### `GET /api/mcp/registries`
دریافت لیست رجیستری‌های رسمی MCP (`mcp.directory`, `Smithery.ai`, `PulseMCP`) و ۱۶۰۰+ ابزار ثبت‌شده.

#### `GET /api/skills/standards/test`
تست و اعتبارسنجی استانداردهای جهانی ایجنت و قوانین `.cursorrules`، داکیومنت‌های HIG مایکروسافت/گنوم، موتورهای یونیتی و آنریل.

#### `GET /api/memory` و `POST /api/memory`
دریافت و ذخیره فایل حافظه بلندمدت پروژه (`.codgar_memory.json`) شامل قراردادهای کدنویسی، فریم‌ورک‌های مجاز و تصمیمات معماری.

---

## ۶. خلاصه وضعیت امنیتی و پایداری (Reliability Summary)

| ویژگی | نحوه پیاده‌سازی در بک‌اند | مزیت فنی |
| :--- | :--- | :--- |
| **Path Traversal Guard** | تابع `resolveSafePath` با متد `path.resolve` و اعتبارسنجی ریشه | جلوگیری از دسترسی کلاینت به فایل‌های خارج از پروژه |
| **Quota Exhaustion Bypass** | استخر توکن `InfiniteTokenPool` با ۳ روتر و مکانیزم ریستارت خودکار | تضمین Uptime ۱۰۰٪ و عدم توقف در اثر Rate Limit |
| **Real-Time Date Accuracy** | تزریق مستقیم تاریخ شمسی و میلادی تهران در پرامپت هر درخواست | رفع کامل توهم زمانی مدل‌ها (No Stale Dates) |
| **Zero Memory Leak** | تایمرهای پاکسازی پردازه‌ها و مانیتورینگ تب‌های مرورگر | مصرف حداقل رم و CPU سرور در مقیاس بالا |
