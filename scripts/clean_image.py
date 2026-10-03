import base64, os, sys, urllib.parse, urllib.request
from PIL import Image

if len(sys.argv) < 3:
    sys.exit(1)

_, prompt_b64, output_file, *rest = sys.argv
try:
    prompt = base64.b64decode(prompt_b64).decode("utf-8")
except Exception:
    prompt = prompt_b64

enhanced = urllib.parse.quote(prompt + ", single subject, centered composition, photorealistic, cinematic lighting, 8k resolution, highly detailed")
url = f"https://image.pollinations.ai/prompt/{enhanced}?width=1280&height=780&nologo=true&model=flux"

tmp_file = output_file + ".tmp.jpg"
try:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=45) as resp:
        with open(tmp_file, "wb") as f:
            f.write(resp.read())

    im = Image.open(tmp_file)
    w, h = im.size
    # برش ۶۰ پیکسل انتهایی برای حذف ۱۰۰٪ هرگونه واترمارک و لوگو
    cropped = im.crop((0, 0, w, max(100, h - 60)))
    cropped.save(output_file, "JPEG", quality=95)
    if os.path.exists(tmp_file):
        os.remove(tmp_file)
    print("SUCCESS_CLEANED")
except Exception as e:
    sys.stderr.write(str(e))
    sys.exit(1)
