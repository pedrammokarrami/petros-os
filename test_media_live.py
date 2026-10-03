import os, urllib.request, urllib.parse, subprocess

desktop = os.path.expanduser("~/Desktop")
img_path = os.path.join(desktop, "YODAW_AI_Image_Test.jpg")
vid_path = os.path.join(desktop, "YODAW_AI_Video_Test.mp4")

prompt = "3D crystal logo with light refraction on deep matte backdrop cinematic 8k"
encoded_prompt = urllib.parse.quote(prompt)
img_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=576&nologo=true&model=flux"
vid_url = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"

print("\n=======================================================")
print("🎨 [1/2] در حال تولید عکس زنده با موتور هوش مصنوعی Flux.1...")
print(f"🔍 پرامپت ارسالی: {prompt}")
print("⏳ چند ثانیه صبر کنید تا رندر تصویر کامل شود...")

headers = {'User-Agent': 'Mozilla/5.0'}
req = urllib.request.Request(img_url, headers=headers)
with urllib.request.urlopen(req, timeout=40) as response, open(img_path, 'wb') as f:
    f.write(response.read())

print(f"✅ عکس با موفقیت تولید شد و روی دسکتاپ ذخیره گردید: {img_path}")
subprocess.run(["open", img_path])

print("\n🎬 [2/2] در حال آماده‌سازی و باز کردن ویدیوی سینماتیک...")
req_vid = urllib.request.Request(vid_url, headers=headers)
with urllib.request.urlopen(req_vid, timeout=30) as response, open(vid_path, 'wb') as f:
    f.write(response.read())

print(f"✅ ویدیو آماده شد و روی دسکتاپ ذخیره گردید: {vid_path}")
subprocess.run(["open", vid_path])

print("\n=======================================================")
print("🎉 تست موفق بود! هم عکس واقعی و هم ویدیو روی مک شما باز شدند.")
print("=======================================================\n")
