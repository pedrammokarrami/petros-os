import re, subprocess, sys

path = "src/components/YodawWorkspace.tsx"
with open(path, "r", encoding="utf-8") as f:
    c = f.read()

# ۱. پاکسازی کامل متغیرها و کادرهای نامناسب قبلی
c = re.sub(r'const \[imageAspectRatio[^;]+;', '', c)
c = re.sub(r'const \[imageQuality[^;]+;', '', c)
c = re.sub(r'const \[showChipSettings[^;]+;', '', c)
c = re.sub(r'const \[activeServiceChip[^;]+;', "const [activeServiceChip, setActiveServiceChip] = useState<string | null>(null);", c)

# حذف کادر تزریق‌شده قبلی در کنار textarea
c = re.sub(r'\{/\* Gemini-Style Pill Badge[\s\S]*?\{/\* Popover Settings \*/\}[\s\S]*?\</div>\s*\)\}\s*</div>\s*\)\}', '', c)
c = re.sub(r'\{activeServiceChip && \([\s\S]*?\)\}\s*(?=<textarea)', '', c)

# ۲. اتصال شناسه یکتا به دکمه ارسال اصلی (Send Button)
if 'id="codgar-main-send-btn"' not in c:
    # پیدا کردن دکمه آبی ارسال در کنار ورودی
    c = re.sub(r'(<button\b[^>]*?(?:blue|sky|indigo)[^>]*?)(>)', r'\1 id="codgar-main-send-btn"\2', c, count=1)

# ۳. تنظیم کلید Enter روی textarea بدون وابستگی به ساختار DOM
c = re.sub(r'onKeyDown=\{[\s\S]*?\}\s*(?=ref=\{textareaRef\})', '', c)
enter_code = '''onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        e.stopPropagation();
                        const btn = document.getElementById("codgar-main-send-btn") || (e.currentTarget.closest("div")?.parentElement?.querySelector("button[class*=\\"blue\\"], button[class*=\\"sky\\"], button:has(svg)") as HTMLButtonElement);
                        if (btn) btn.click();
                      }
                    }}
                    '''
c = c.replace('ref={textareaRef}', enter_code + 'ref={textareaRef}')

# ۴. چیپ ظریف سبک اتچمنت بالای اینپوت (فقط در صورت انتخاب و خارج از خط افقی متن)
clean_badge = """{activeServiceChip && (
                <div className="flex items-center gap-1.5 px-3 pt-2 pb-0 select-none">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    <span>{activeServiceChip === 'image' ? (isFa ? 'حالت تصویر' : 'Image') : activeServiceChip.toUpperCase()}</span>
                    <button
                      type="button"
                      onClick={() => setActiveServiceChip(null)}
                      className="ml-1 hover:opacity-75 transition cursor-pointer text-rose-500 text-xs font-black"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}"""

if "{activeServiceChip && (" not in c:
    # قرار دادن چیپ بالای خط ورودی
    c = c.replace('<div className="flex items-center gap-1 sm:gap-1.5', clean_badge + '\n              <div className="flex items-center gap-1 sm:gap-1.5')

with open(path, "w", encoding="utf-8") as f:
    f.write(c)

print("✅ فایل اصلاح شد. در حال کامپایل پروژه...")
res = subprocess.run(["npm", "run", "build"], capture_output=True, text=True)
if res.returncode == 0:
    print("🎉 بیلد ۱۰۰٪ موفقیت‌آمیز بود! محیط چت تمیز شد و اینتر فعال است.")
else:
    print(res.stdout or res.stderr)
    sys.exit(1)
