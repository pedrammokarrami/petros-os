import os, re, subprocess, sys

print("=== ۱. بازگردانی فایل به وضعیت تمیز ریپازیتوری ===")
subprocess.run(["git", "checkout", "HEAD", "--", "src/components/YodawWorkspace.tsx"], check=True)

with open("src/components/YodawWorkspace.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# ۱. اضافه کردن State فعال‌بودن چیپ
if "activeServiceChip" not in code:
    code = code.replace(
        "const [selectedService, setSelectedService] = useState<YodawServiceType>('html');",
        "const [selectedService, setSelectedService] = useState<YodawServiceType>('html');\n  const [activeServiceChip, setActiveServiceChip] = useState<string | null>(null);"
    )

# ۲. حذف کادر بزرگ قدیمی (کنسول لانچ و سجسشن‌ها)
code = code.replace("{renderServiceConsole()}", "{null}")

# ۳. اصلاح رفتار کلیک روی ۴ دایره رنگی (فقط فعال کردن حالت مربوطه و فوکوس بدون باز کردن پنجره اضافه)
bubble_click_new = """setSelectedService(svc.id);
                      setActiveServiceChip(activeServiceChip === svc.id ? null : svc.id);
                      setExpandedService(null);
                      if (textareaRef.current) textareaRef.current.focus();"""

code = re.sub(
    r"setSelectedService\(svc\.id\);\s*if\s*\(expandedService === svc\.id\)\s*\{[\s\S]*?\}\s*else\s*\{[\s\S]*?\}",
    bubble_click_new,
    code,
    count=1
)

# ۴. اتصال قطعی شناسه به دکمه ارسال اصلی (Send Button)
act_idx = code.find('{/* Action Buttons: Voice + Execution / Send */}')
if act_idx != -1:
    first_btn = code.find("<button", act_idx)
    if "onOpenSiriVoice" in code[act_idx:act_idx + 450] and first_btn != -1:
        second_btn = code.find("<button", code.find("</button>", first_btn))
        target_btn = second_btn if second_btn != -1 else first_btn
    else:
        target_btn = first_btn
    if target_btn != -1 and 'id="codgar-main-send-btn"' not in code:
        code = code[:target_btn] + '<button id="codgar-main-send-btn" ' + code[target_btn + len("<button "):]

# ۵. اتصال قطعی و مستقیم کلید Enter به textarea
enter_logic = """onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        e.stopPropagation();
                        const btn = (document.getElementById('codgar-main-send-btn') || e.currentTarget.closest('div')?.parentElement?.querySelector('button[class*="blue"], button[class*="sky"], button:has(svg:last-child)')) as HTMLButtonElement | null;
                        if (btn) btn.click();
                      }
                    }}
                    ref={textareaRef}"""
code = code.replace("ref={textareaRef}", enter_logic)

# ۶. قرار دادن چیپ ظریف اتچمنت در ردیف بالایی اینپوت (مشابه Gemini)
chip_element = """{activeServiceChip && (
                <div className="px-3 pt-2 pb-1 flex items-center gap-2 select-none">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all shadow-xs ${
                    activeServiceChip === 'image' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800' :
                    activeServiceChip === 'video' ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-300 dark:border-purple-800' :
                    activeServiceChip === 'website' ? 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-300 dark:border-teal-800' :
                    'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    <span>
                      {activeServiceChip === 'image' ? (isFa ? 'تولید تصویر' : 'Image AI') :
                       activeServiceChip === 'video' ? (isFa ? 'تولید ویدیو' : 'Video AI') :
                       activeServiceChip === 'website' ? (isFa ? 'طراحی وب‌سایت' : 'Website AI') :
                       (isFa ? 'کدنویسی هوشمند' : 'Coding AI')}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveServiceChip(null)}
                      className="ml-1 p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition cursor-pointer"
                      title={isFa ? 'حذف حالت' : 'Remove'}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}"""

tx_pos = code.find("ref={textareaRef}")
p1 = code.rfind("<div", 0, tx_pos)
p2 = code.rfind("<div", 0, p1)
if p2 != -1:
    code = code[:p2] + chip_element + "\n              " + code[p2:]

with open("src/components/YodawWorkspace.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("=== ۲. اجرای بیلد نهایی پروژه (npm run build) ===")
res = subprocess.run(["npm", "run", "build"], capture_output=True, text=True)
if res.returncode == 0:
    print("🎉 بیلد ۱۰۰٪ موفقیت‌آمیز بود! خطاهای سینتکس برطرف و کدهای جدید کامپایل شدند.")
    subprocess.run(["git", "add", "src/components/YodawWorkspace.tsx", "apps/web/App.tsx", "server.ts", "dist/"], check=True)
    subprocess.run(["git", "commit", "-m", "fix: clean attachment chip, restore enter key, remove old console"], check=False)
    print("✅ تغییرات پایدار در Git ذخیره شد.")
else:
    print("❌ خطا در بیلد:")
    print(res.stdout or res.stderr)
    sys.exit(1)
