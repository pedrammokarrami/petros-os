const fs = require('fs');
const path = require('path');

async function runAudit() {
  console.log('====================================================');
  console.log('🔍 گزارش بازرسی مدل‌های زبانی و اسکیل‌های فعال کُدگر');
  console.log('====================================================\n');

  // ۱. بررسی مدل‌های زبانی از طریق اندپوینت روتر
  console.log('📡 ۱. مدل‌های زبانی در دسترس (Active LLM Catalog):');
  try {
    const res = await fetch('http://127.0.0.1:20128/v1/models', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      const models = data.data || data;
      const modelIds = Array.isArray(models) ? models.map(m => m.id) : [];
      console.log(`   ✅ تعداد ${modelIds.length} مدل زبانی در روتر فعال و متصل است:`);
      modelIds.slice(0, 20).forEach((id, idx) => console.log(`      ${idx + 1}. ${id}`));
      if (modelIds.length > 20) {
        console.log(`      ... و ${modelIds.length - 20} مدل دیگر`);
      }
    } else {
      console.log('   ⚠️ پاسخ ناموفق از اندپوینت مدل‌ها:', res.status);
    }
  } catch (err) {
    console.log('   ❌ خطا در اتصال به روتر مدل‌ها:', err.message);
  }

  // ۲. بررسی اسکیل‌های طراحی و کدنویسی
  console.log('\n🛠️ ۲. بررسی اسکیل‌های تخصصی (Skills & Tools):');
  
  const potentialPaths = [
    path.join(process.cwd(), 'skills'),
    path.join(process.cwd(), 'server', 'skills'),
    path.join(process.cwd(), 'src', 'skills'),
    path.join(process.env.HOME || '', 'VansRouter', 'skills')
  ];

  let foundSkills = new Set();

  for (const p of potentialPaths) {
    if (fs.existsSync(p)) {
      try {
        const items = fs.readdirSync(p);
        items.forEach(item => {
          if (!item.startsWith('.')) foundSkills.add(item);
        });
        console.log(`   📂 یافت‌شده در مسیر ${p}:`);
      } catch {}
    }
  }

  if (foundSkills.size > 0) {
    console.log(`   ✅ مجموعاً ${foundSkills.size} اسکیل در سیستم شناسایی شد:`);
    Array.from(foundSkills).forEach((s, idx) => {
      console.log(`      ${idx + 1}. [Skill] ${s}`);
    });
  } else {
    console.log('   ℹ️ اسکیل‌ها در مسیر پوشه مجزا یافت نشدند؛ در حال بررسی تعریف‌های رجیستری در سرور...');
  }

  // ۳. بررسی اسکیل‌ها در رجیستری‌های سرور
  const serverPath = path.join(process.cwd(), 'server.ts');
  if (fs.existsSync(serverPath)) {
    const sCode = fs.readFileSync(serverPath, 'utf8');
    const skillMatches = sCode.match(/(?:skill|Skill|tool|mcp|Mcp)[a-zA-Z0-9_]*/g) || [];
    const uniqueMatches = Array.from(new Set(skillMatches.filter(m => m.length > 5))).slice(0, 15);
    console.log('\n🧩 ۳. ماژول‌ها و ابزارهای شناسایی‌شده در server.ts:');
    uniqueMatches.forEach((m, idx) => console.log(`      ${idx + 1}. ${m}`));
  }

  console.log('\n====================================================');
}

runAudit();
