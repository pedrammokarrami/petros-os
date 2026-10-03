import re, subprocess

path = "src/components/YodawWorkspace.tsx"
with open(path, "r", encoding="utf-8") as f:
    c = f.read()

# ۱. افزودن Stateهای چیپ و تنظیمات نسبت تصویر و کیفیت
if "activeServiceChip" not in c:
    state_decl = """
  const [activeServiceChip, setActiveServiceChip] = useState<string | null>('image');
  const [imageAspectRatio, setImageAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('1:1');
  const [imageQuality, setImageQuality] = useState<'standard' | 'hd'>('hd');
  const [showChipSettings, setShowChipSettings] = useState<boolean>(false);
"""
    c = c.replace("const [selectedService, setSelectedService] = useState<YodawServiceType>('html');",
                  "const [selectedService, setSelectedService] = useState<YodawServiceType>('html');" + state_decl)

# ۲. غیرفعال‌سازی کنسول قدیمی (حذف کادر بزرگ و گزینه‌های پیش‌فرض)
c = c.replace("{renderServiceConsole()}", "{/* Modern Chip Enabled - Old Console Disabled */}")

# ۳. اصلاح اکشن کلیک ۴ دایره رنگی (انتخاب چیپ و فوکوس مستقیم روی چت)
bubble_click_pattern = r"onClick=\{([^}]*setSelectedService\(svc\.id\)[^}]*)\}"
replacement_click = """onClick={() => {
                      setSelectedService(svc.id);
                      setActiveServiceChip(svc.id);
                      setExpandedService(null);
                      if (textareaRef.current) textareaRef.current.focus();
                    }}"""
c = re.sub(bubble_click_pattern, replacement_click, c, count=1)

# ۴. طراحی چیپ شیک و پاپ‌اور تنظیمات (مشابه Gemini) درست بالای اینپوت چت
chip_jsx = """
              {/* Gemini-Style Pill Badge & Image Settings Popover */}
              {activeServiceChip && (
                <div className="relative inline-flex items-center gap-1.5 mb-1 px-1 select-none">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/40 border border-rose-200/80 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs font-semibold shadow-xs backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span>{activeServiceChip === 'image' ? (isFa ? 'تولید تصویر' : 'Image AI') : activeServiceChip.toUpperCase()}</span>
                    
                    {activeServiceChip === 'image' && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setShowChipSettings(!showChipSettings); }}
                        className="p-1 hover:bg-rose-200/60 dark:hover:bg-rose-900/60 rounded-full transition cursor-pointer"
                        title={isFa ? 'تنظیمات نسبت و کیفیت' : 'Ratio & Quality'}
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setActiveServiceChip(null); }}
                      className="p-0.5 hover:bg-rose-200/70 dark:hover:bg-rose-900/70 rounded-full transition cursor-pointer text-rose-500"
                      title={isFa ? 'حذف حالت' : 'Remove'}
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>

                  {/* Popover Settings */}
                  {showChipSettings && activeServiceChip === 'image' && (
                    <div className="absolute bottom-9 left-0 z-50 w-60 p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-800 text-xs space-y-2.5">
                      <div>
                        <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">{isFa ? 'نسبت تصویر' : 'Aspect Ratio'}</span>
                        <div className="grid grid-cols-3 gap-1">
                          {(['1:1', '16:9', '9:16'] as const).map((r) => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => setImageAspectRatio(r)}
                              className={`py-1 rounded-lg text-center font-bold text-xs transition border cursor-pointer ${imageAspectRatio === r ? 'bg-rose-500 text-white border-rose-600 shadow-xs' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'}`}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">{isFa ? 'کیفیت خروجی' : 'Quality'}</span>
                        <div className="grid grid-cols-2 gap-1.5">
                          {(['standard', 'hd'] as const).map((q) => (
                            <button
                              key={q}
                              type="button"
                              onClick={() => setImageQuality(q)}
                              className={`py-1 rounded-lg text-center font-bold text-xs capitalize transition border cursor-pointer ${imageQuality === q ? 'bg-rose-500 text-white border-rose-600 shadow-xs' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'}`}
                            >
                              {q === 'hd' ? 'Ultra HD' : 'Standard'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
"""

if "activeServiceChip &&" not in c:
    c = c.replace('<textarea', chip_jsx + '\n                <textarea')

with open(path, "w", encoding="utf-8") as f:
    f.write(c)

print("✅ طراحی جدید اعمال شد. در حال کامپایل پروژه...")
subprocess.run(["npm", "run", "build"], check=True)
print("✅ بیلد با موفقیت انجام شد!")
