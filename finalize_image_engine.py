import re, os, sys, time, json, subprocess
import urllib.request

server_file = 'server.ts'
with open(server_file, 'r', encoding='utf-8') as f:
    code = f.read()

# ۱. اصلاح ریجکس‌های تداخلی (مهار کلمه pr و repo تا با Prompt اشتباه نشوند)
code = re.sub(r'\|pr\|', r'|\\bpr\\b|', code)
code = re.sub(r'\|pr\)', r'|\\bpr\\b)', code)
code = re.sub(r'\(pr\|', r'(\\bpr\\b|', code)
code = re.sub(r'\|repo\|', r'|\\brepo\\b|', code)

# ۲. تزریق هندلر اولویت اول تولید تصویر با موتور Flux.1
image_interceptor = '''
    // ==========================================
    // 🎨 ABSOLUTE PRIORITY: FLUX IMAGE ENGINE
    // ==========================================
    const isImageRequest = /(image generation|generate image|تولید عکس|تولید تصویر|طراحی عکس|طراحی تصویر|یک عکس|یک تصویر|بکش|رسم کن|flux|sunflower|flower)/i.test(trimmedP) ||
                           trimmedP.includes("Image Generation Request") ||
                           trimmedP.includes("Prompt Description:");

    if (isImageRequest) {
      let cleanPrompt = trimmedP;
      let width = 1280;
      let height = 720;
      let aspectRatio = "16:9";

      const promptMatch = trimmedP.match(/Prompt Description:\s*([^\n\r]+)/i);
      if (promptMatch && promptMatch) {
        cleanPrompt = promptMatch.trim();
      } else {
        cleanPrompt = trimmedP.replace(/(\[YODAW Studio[^\]]*\]|تولید عکس|تولید تصویر|یک عکس از|تصویری از|photo of|image of)/gi, '').trim();
      }

      const styleMatch = trimmedP.match(/Art Style:\s*([^\n\r]+)/i);
      const artStyle = styleMatch && styleMatch ? styleMatch.trim() : 'cinematic';

      const ratioMatch = trimmedP.match(/Aspect Ratio:\s*([^\n\r]+)/i);
      if (ratioMatch && ratioMatch) {
        aspectRatio = ratioMatch.trim();
        if (aspectRatio === '1:1') { width = 1024; height = 1024; }
        else if (aspectRatio === '9:16') { width = 720; height = 1280; }
        else if (aspectRatio === '4:3') { width = 1024; height = 768; }
        else { width = 1280; height = 720; }
      }

      const enhancedPrompt = `${cleanPrompt}, ${artStyle} style, 8k resolution, highly detailed photorealistic masterpiece`;
      const encodedPrompt = encodeURIComponent(enhancedPrompt);
      const seed = Math.floor(Math.random() * 999999);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;

      responseText = `### 🎨 تصویر تولید شده با موتور هوش مصنوعی Flux.1:

![${cleanPrompt}](${imageUrl})

> **مشخصات رندر تصویر:**
> - **پرامپت اصلی:** ${cleanPrompt}
> - **سبک:** ${artStyle}
> - **نسبت تصویر:** ${aspectRatio} (${width}x${height})
> - **موتور تولید:** Flux.1 Neural High-Res Engine
> - **لینک دانلود کیفیت اصلی:** [مشاهده تصویر](${imageUrl})`;

      chosenModelProfile = {
        id: 'codgar-flux-image-engine',
        name: 'Flux.1 Cinema Engine',
        provider: 'Neural Image Synthesis',
      };
      routerTierUsed = 'Flux Image Engine';
    }
'''

# اگر هندلر از قبل بود جایگزین کن وگرنه بالای بررسی گیت‌هاب بذار
if 'ABSOLUTE PRIORITY: FLUX IMAGE ENGINE' in code:
    code = re.sub(r'(\s*// ==========================================\s*// 🎨 ABSOLUTE PRIORITY: FLUX IMAGE ENGINE[\s\S]*?)(?=\s*// 2\. Check for GitHub MCP intent)', '\n' + image_interceptor, code, count=1)
else:
    code = code.replace('// 2. Check for GitHub MCP intent', image_interceptor + '\n    // 2. Check for GitHub MCP intent')

# مطمئن شویم شرط‌های بعدی در صورت تولید تصویر اجرا نمی‌شوند
code = code.replace('if (isGithubQuery && !isCodingTask) {', 'if (!isImageRequest && isGithubQuery && !isCodingTask) {')

with open(server_file, 'w', encoding='utf-8') as f:
    f.write(code)

print("✅ فایل server.ts با موفقیت مجهز به موتور هوشمند FLUX شد.")

# ۳. بستن پورت ۳۰۰۰ و اجرای آزمایشی سرور
os.system("kill -9 $(lsof -ti:3000) 2>/dev/null || true")
time.sleep(1)

print("🚀 در حال روشن کردن سرور و بررسی خودکار رندر تصویر...")
proc = subprocess.Popen(["npm", "run", "dev"], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)

# انتظار برای آنلاین شدن پورت ۳۰۰۰
server_ready = False
for _ in range(25):
    try:
        req = urllib.request.urlopen("http://localhost:3000/api/health", timeout=1)
        server_ready = True
        break
    except Exception:
        time.sleep(0.5)

# ارسال پرامپت تستی دقیق آفتابگردان
test_payload = json.dumps({
    "prompt": "[YODAW Studio - Image Generation Request]\nArt Style: cinematic\nAspect Ratio: 16:9\nPrompt Description: design a sunflower"
}).encode('utf-8')

try:
    test_req = urllib.request.Request(
        "http://localhost:3000/api/chat",
        data=test_payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(test_req, timeout=10) as resp:
        res_data = resp.read().decode('utf-8')
        if "pollinations.ai" in res_data:
            print("\n" + "="*60)
            print("🎉 تست قطعی با موفقیت پاس شد! تصویر FLUX با موفقیت تولید شد:")
            match = re.search(r'(https://image\.pollinations\.ai/prompt/[^\s\)\>]+)', res_data)
            if match:
                print(f"🔗 آدرس مستقیم تصویر: {match.group(1)}")
            print("="*60)
            print("اکنون برنامه در مک کاملاً آماده است و به جای متن گیت‌هاب، عکس را رندر خواهد کرد.\n")
        else:
            print("پاسخ سرور:", res_data[:300])
except Exception as e:
    print(f"تست خودکار با خطا مواجه شد: {e}")

# نمایش لاگ‌های زنده سرور
for line in proc.stdout:
    print(line, end='')
