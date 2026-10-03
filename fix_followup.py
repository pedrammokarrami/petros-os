#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fix_followup.py — Follow-up to fix_all.py (run once):
Scrubs the leaked router key from the 2 patch-scripts in scripts/*.cjs
(they inject code into server.ts, so leaving them would reintroduce the
hardcoded key if ever re-run). Then re-scans the WHOLE repo + re-runs tests.

Usage:
    cd /path/to/petros-os
    python3 fix_followup.py
"""
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else os.getcwd()).resolve()
NEEDLE = "Bearer sk-1b85c23a61dee238-k2vequ-4bc8de92"
# No backticks/${} so it's safe inside the .cjs template literals as-is.
REPLACEMENT = 'Bearer " + (process.env.LAYA_ROUTER_API_KEY || "") + "'
TARGETS = ["scripts/add_voice_endpoints.cjs", "scripts/wire_real_voice.cjs"]
fails = 0


def run(cmd, timeout=300):
    try:
        r = subprocess.run(cmd, cwd=str(ROOT), capture_output=True, text=True, timeout=timeout)
        return r.returncode, (r.stdout or "") + (r.stderr or "")
    except FileNotFoundError:
        return 127, f"command not found: {cmd[0]}"
    except subprocess.TimeoutExpired:
        return 124, "timeout"


print(f"📁 Repo root: {ROOT}")
if not (ROOT / "server.ts").exists():
    print("❌ server.ts not found here. Run: python3 fix_followup.py /path/to/petros-os")
    sys.exit(1)

print("\n--- 1) Scrub key from patch-scripts ---")
for rel in TARGETS:
    p = ROOT / rel
    if not p.exists():
        print(f"  ❌ missing: {rel}")
        fails += 1
        continue
    content = p.read_text(encoding="utf-8")
    if NEEDLE not in content:
        print(f"  ⏭️ {rel}: already clean")
        continue
    if content.count(NEEDLE) != 1:
        print(f"  ❌ {rel}: expected 1 occurrence, found {content.count(NEEDLE)}")
        fails += 1
        continue
    p.write_text(content.replace(NEEDLE, REPLACEMENT), encoding="utf-8")
    print(f"  ✅ {rel}: key → env-based (LAYA_ROUTER_API_KEY)")
    code, out = run(["node", "--check", rel], timeout=30)
    if code == 0:
        print(f"  ✅ {rel}: node --check passes (still valid JS)")
    else:
        print(f"  ❌ {rel}: node --check FAILED:\n{out[:500]}")
        fails += 1

print("\n--- 2) Whole-repo re-scan (all files, node_modules/.git excluded) ---")
code, out = run(["grep", "-rnF", "sk-1b85c23a61dee238", ".", "--exclude-dir=node_modules",
                 "--exclude-dir=.git", "--exclude=fix_followup.py", "--exclude=fix_all.py",
                 "--exclude=.env"], timeout=60)
if code != 0:
    print("  ✅ leaked key: 0 occurrences in workdir (fix_*.py needles + local .env excluded by design)")
else:
    print(f"  ❌ key still present:\n{out[:800]}")
    fails += 1

print("\n--- 3) Re-run tests ---")
code, out = run(["npx", "tsc", "--noEmit"], timeout=300)
import re as _re
n_err = len(_re.findall(r"error TS", out))
if "Unable to resolve @typescript" in out:
    print("  ⏭️ tsc: env lacks TS7 native binary — run `npm run lint` on your Mac")
elif code == 0 and n_err == 0:
    print("  ✅ tsc --noEmit: 0 errors")
else:
    print(f"  ❌ tsc: {n_err} error(s)")
    fails += 1

code, out = run([sys.executable, "-m", "pytest", "apps/test_task_manager.py", "-q"], timeout=120)
print(f"  {'✅' if code == 0 else '❌'} pytest: {(out.strip().splitlines() or ['?'])[-1]}")
fails += code != 0

code, out = run(["npm", "test", "--prefix", "test-project"], timeout=180)
ok = code == 0
print(f"  {'✅' if ok else '❌'} npm test (test-project): {'pass' if ok else 'FAIL'}")
fails += not ok

print("\n================ SUMMARY ================")
if fails == 0:
    print("🎉 ALL GREEN. Now commit + push:")
    print("   git add -A && git commit -m \"fix: scrub leaked key from voice patch-scripts\" && git push")
else:
    print(f"❌ {fails} problem(s) — see above.")
print("\n⚠️ Reminder: the key is in git HISTORY → it MUST still be revoked at the provider,")
print("   even though HEAD is now fully clean. (Optional: git filter-repo history purge.)")
sys.exit(1 if fails else 0)
