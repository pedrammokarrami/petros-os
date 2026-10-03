#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fix_all.py — One-shot auto-fix for petros-os code review findings.
Fixes ~45 issues: security holes, 41 TS errors, broken tests, repo hygiene.
Then re-runs all tests and prints a PASS/FAIL report.

Usage (in terminal):
    cd /path/to/petros-os
    python3 fix_all.py
    # or: python3 fix_all.py /path/to/petros-os

Safe to re-run (idempotent). Review changes afterwards with: git diff
"""
import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else os.getcwd()).resolve()
results: list = []  # (id, desc, status, detail)
PASS, FAIL, SKIP = "OK", "FAIL", "SKIP"


def read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8")


def write(rel: str, s: str) -> None:
    (ROOT / rel).write_text(s, encoding="utf-8")


def rec(pid, desc, status, detail=""):
    results.append((pid, desc, status, detail))
    icon = {"OK": "✅", "SKIP": "⏭️", "FAIL": "❌"}[status]
    print(f"  {icon} [{pid}] {desc}" + (f" — {detail}" if detail else ""), flush=True)


def patch_once(pid, desc, rel, old, new, count=1):
    """Replace `old` with `new` in file. Idempotent."""
    p = ROOT / rel
    if not p.exists():
        rec(pid, desc, FAIL, f"missing file {rel}")
        return False
    content = read(rel)
    if new in content:
        rec(pid, desc, SKIP, "already applied")
        return True
    found = content.count(old)
    if found != count:
        rec(pid, desc, FAIL, f"expected {count} occurrence(s), found {found} — context changed?")
        return False
    write(rel, content.replace(old, new))
    rec(pid, desc, PASS, f"{found} spot(s)")
    return True


def patch_sub_all(pid, desc, rel, pattern, repl):
    """Regex replace-all in file. Idempotent."""
    p = ROOT / rel
    if not p.exists():
        rec(pid, desc, FAIL, f"missing file {rel}")
        return False
    content = read(rel)
    new, n = re.subn(pattern, repl, content)
    if n == 0:
        rec(pid, desc, SKIP, "nothing to replace")
        return True
    write(rel, new)
    rec(pid, desc, PASS, f"{n} replacement(s)")
    return True


def run(cmd, cwd=None, timeout=300):
    try:
        r = subprocess.run(cmd, cwd=str(cwd or ROOT), capture_output=True, text=True, timeout=timeout)
        return r.returncode, (r.stdout or "") + (r.stderr or "")
    except FileNotFoundError:
        return 127, f"command not found: {cmd[0]}"
    except subprocess.TimeoutExpired:
        return 124, "timeout"


def section(title):
    print(f"\n{'='*62}\n{title}\n{'='*62}", flush=True)


# =====================================================================
# 0. PREFLIGHT
# =====================================================================
section("0) Preflight checks")
if not (ROOT / "server.ts").exists() or not (ROOT / "package.json").exists():
    print(f"❌ server.ts / package.json not found in {ROOT}")
    print("   Run: python3 fix_all.py /path/to/petros-os")
    sys.exit(1)
print(f"  📁 Repo root: {ROOT}")
code, out = run(["git", "rev-parse", "--show-toplevel"], timeout=15)
IN_GIT = code == 0
print(f"  {'✅' if IN_GIT else '⚠️'} git repo: {'yes' if IN_GIT else 'no (git steps will be skipped)'}")
code, out = run(["node", "--version"], timeout=15)
print(f"  {'✅' if code == 0 else '❌'} node: {out.strip() or 'MISSING'}")
code, out = run(["npm", "--version"], timeout=30)
print(f"  {'✅' if code == 0 else '❌'} npm: {out.strip() or 'MISSING'}")

# =====================================================================
# 1. NEW FILES: server/security.ts, .env.example, .gitignore
# =====================================================================
section("1) New files: security.ts, .env.example, .gitignore")

SECURITY_TS = r'''// [AutoFix] Central security middleware: headers, rate limits,
// loopback-or-token auth for /api, and SSRF guard for the media proxy.
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import type { NextFunction, Request, Response } from 'express';
import dns from 'dns';
import net from 'net';

export const securityHeaders = helmet({
  contentSecurityPolicy: false, // app uses inline scripts; keep UI working
  crossOriginEmbedderPolicy: false,
});

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  standardHeaders: true,
  legacyHeaders: false,
});

export const pinRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many attempts. Try again later.' },
});

// Remote callers may hit these WITHOUT a token. Everything else under /api
// requires loopback origin or a valid x-admin-token. Localhost use is unaffected.
const PUBLIC_API: RegExp[] = [/^\/api\/health\/?$/, /^\/api\/dns\//, /^\/api\/mcp\/ping\/?$/];

function isLoopback(req: Request): boolean {
  const raw = (req.ip || (req.socket && req.socket.remoteAddress) || '').toLowerCase();
  return (
    raw === '127.0.0.1' ||
    raw === '::1' ||
    raw === '::ffff:127.0.0.1' ||
    raw.endsWith('127.0.0.1') ||
    raw === 'localhost'
  );
}

export function loopbackOrTokenAuth(req: Request, res: Response, next: NextFunction): void {
  const p: string = (req.path || req.url || '').split('?')[0];
  if (!p.startsWith('/api/')) {
    next();
    return;
  }
  if (PUBLIC_API.some((rx) => rx.test(p))) {
    next();
    return;
  }
  if (isLoopback(req)) {
    next();
    return;
  }
  const expected = process.env.ADMIN_TOKEN || '';
  const got = req.headers['x-admin-token'];
  if (expected && typeof got === 'string' && got === expected) {
    next();
    return;
  }
  res.status(401).json({
    success: false,
    error: 'Unauthorized: remote access to this API requires the x-admin-token header.',
  });
}

// ---------- SSRF guard for /api/media/proxy ----------
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return true;
  const a = parts[0];
  const b = parts[1];
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 127) return true; // loopback
  if (a === 169 && b === 254) return true; // link-local (cloud metadata!)
  if (a === 0) return true; // unspecified
  return false;
}

function isBlockedIP(ip: string): boolean {
  const v = net.isIP(ip);
  if (v === 4) return isPrivateIPv4(ip);
  if (v === 6) {
    const low = ip.toLowerCase();
    if (low === '::1' || low === '::') return true;
    if (low.startsWith('fe80:') || low.startsWith('fec0:')) return true; // link/site-local
    if (low.startsWith('fc') || low.startsWith('fd')) return true; // unique-local
    if (low.startsWith('::ffff:')) {
      const mapped = low.slice('::ffff:'.length);
      if (net.isIP(mapped) === 4) return isPrivateIPv4(mapped);
    }
    return false;
  }
  return true;
}

export async function assertPublicUrl(raw: string): Promise<URL> {
  let u: URL;
  try {
    u = new URL(String(raw || ''));
  } catch {
    throw new Error('Invalid URL');
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    throw new Error('Only http(s) URLs are allowed');
  }
  const host = u.hostname.toLowerCase();
  if (!host || host === 'localhost') throw new Error('Blocked host');
  if (net.isIP(host)) {
    if (isBlockedIP(host)) throw new Error('Blocked: private/internal address');
    return u;
  }
  let addrs;
  try {
    addrs = await dns.promises.lookup(host, { all: true });
  } catch {
    throw new Error('DNS lookup failed');
  }
  for (const a of addrs) {
    if (isBlockedIP(a.address)) throw new Error('Blocked: resolves to private/internal address');
  }
  return u;
}
'''

ENV_EXAMPLE = """# Copy to .env and fill in. NEVER commit .env to git.
PORT=3000
BIND_HOST=127.0.0.1

# Required for NON-localhost access to /api (localhost always works without it).
# Generate: python3 -c "import secrets; print(secrets.token_hex(32))"
ADMIN_TOKEN=CHANGE_ME_long_random_token

# Local UI PIN for the Fuel/API-key screens (default UI expects 123456)
CODGAR_PIN=123456

# Local custom router key (migrated out of source code by fix_all.py)
LAYA_ROUTER_API_KEY=

# AI providers (optional)
GEMINI_API_KEY=
ANTHROPIC_API_KEY=
OMNIROUTE_API_KEY=
NINEROUTER_API_KEY=
VANSROUTER_API_KEY=

# Safety: overnight_daemon.py only pushes when this is 1
ALLOW_AUTO_PUSH=0
"""

GITIGNORE = """# dependencies
node_modules/
bun.lock

# builds
dist/
build/
out/
*.tsbuildinfo

# backups (use git history instead!)
*.bak
*.bak_*
*.laya_bak

# env & secrets
.env
.env.local
.env.*.local

# python
__pycache__/
*.py[cod]

# OS / IDE
.DS_Store
.vscode/
.idea/

# xcode user state
*.xcuserstate
*.xcuserdatad
.swiftpm/

# logs & runtime state
*.log
overnight.log
overnight_console.out
.codgar_projects.json
.codgar_memory.json

# temp execution artifacts
temp_exec_*.*

# vite
.vite/

# coverage
coverage/

# autofix
.autofix-backup/
"""

for pid, desc, rel, content in [
    ("N1", "create server/security.ts", "server/security.ts", SECURITY_TS),
    ("N2", "create .env.example", ".env.example", ENV_EXAMPLE),
    ("N3", "create .gitignore", ".gitignore", GITIGNORE),
]:
    p = ROOT / rel
    if p.exists():
        rec(pid, desc, SKIP, "already exists")
    else:
        write(rel, content if content.endswith("\n") else content + "\n")
        rec(pid, desc, PASS, "created")

# =====================================================================
# 2. server.ts SECURITY PATCHES
# =====================================================================
section("2) server.ts security patches")

patch_once("S2", "server.ts: add missing 'os' import", "server.ts",
           "import fs from 'fs';",
           "import fs from 'fs';\nimport os from 'os';")

patch_once("S3", "server.ts: define missing getLocalIP() helper", "server.ts",
           "const app = express();\n",
           r"""// [AutoFix] Real local-IP helper (was referenced by /api/dns but never defined)
function getLocalIP(): string {
  try {
    const nets = os.networkInterfaces();
    for (const list of Object.values(nets)) {
      for (const n of list || []) {
        if (n && n.family === 'IPv4' && !n.internal) return n.address;
      }
    }
  } catch {}
  return '127.0.0.1';
}

const app = express();
""")

patch_once("S4", "server.ts: wire security middleware (helmet/rate-limit/auth)", "server.ts",
           "const app = express();\n",
           """const app = express();
// [AutoFix] Security hardening (see server/security.ts)
import { securityHeaders, apiRateLimiter, pinRateLimiter, loopbackOrTokenAuth, assertPublicUrl } from './server/security';
app.use(securityHeaders);
app.use('/api', apiRateLimiter);
app.use(loopbackOrTokenAuth);
""")

patch_once("S8", "server.ts: fix resolveSafePath prefix-traversal bug", "server.ts",
           r"""function resolveSafePath(userPath: string): string {
  const normalized = path.normalize(userPath || '.');
  const resolved = path.isAbsolute(normalized)
    ? normalized
    : path.resolve(WORKSPACE_ROOT, normalized);

  // Allow within workspace root
  if (!resolved.startsWith(WORKSPACE_ROOT)) {
    return WORKSPACE_ROOT;
  }
  return resolved;
}""",
           r"""function resolveSafePath(userPath: string): string {
  const normalized = path.normalize(userPath || '.');
  const resolved = path.isAbsolute(normalized)
    ? normalized
    : path.resolve(WORKSPACE_ROOT, normalized);

  // [AutoFix] proper containment check (startsWith allowed siblings like /root-evil)
  const rel = path.relative(WORKSPACE_ROOT, resolved);
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) {
    return WORKSPACE_ROOT;
  }
  return resolved;
}""")

patch_once("S9", "server.ts: remove duplicate express.json() (kept first=50mb, same behavior)", "server.ts",
           "app.use(express.json({ limit: '15mb' }));",
           "// [AutoFix] removed 2nd express.json() (duplicate of the 50mb one above)")

patch_once("S10", "server.ts: /api/git/diff command-injection → spawn(args)", "server.ts",
           r"""app.get('/api/git/diff', (req: Request, res: Response) => {
  const { file, cached = false } = req.query;
  const flag = cached === 'true' ? '--cached' : '';
  const fileArg = file ? `"${file}"` : '';

  exec(`git diff ${flag} ${fileArg}`, { cwd: WORKSPACE_ROOT }, (err, stdout) => {
    if (err) {
      return res.json({ success: false, error: err.message, diff: '' });
    }
    res.json({ success: true, diff: stdout });
  });
});""",
           r"""app.get('/api/git/diff', (req: Request, res: Response) => {
  const { file, cached = false } = req.query;
  // [AutoFix] no shell interpolation: argv array instead of exec(string)
  const args: string[] = ['diff'];
  if (cached === 'true') args.push('--cached');
  if (typeof file === 'string' && file && !file.includes('\0')) args.push(file);

  const child = spawn('git', args, { cwd: WORKSPACE_ROOT });
  let stdout = '';
  child.stdout?.on('data', (d) => { stdout += d.toString(); });
  child.on('close', (code) => {
    if (code !== 0) return res.json({ success: false, error: `git diff exited with code ${code}`, diff: '' });
    res.json({ success: true, diff: stdout });
  });
  child.on('error', (err) => res.json({ success: false, error: err.message, diff: '' }));
});""")

patch_once("S11", "server.ts: /api/git/commit command-injection → spawn(args)", "server.ts",
           r"""app.post('/api/git/commit', (req: Request, res: Response) => {
  const { message, files = [] } = req.body;
  if (!message) return res.status(400).json({ error: 'Commit message is required' });

  const addCmd = files.length > 0 ? `git add ${files.map((f: string) => `"${f}"`).join(' ')}` : 'git add -A';
  exec(addCmd, { cwd: WORKSPACE_ROOT }, (addErr) => {
    if (addErr) return res.status(500).json({ success: false, error: addErr.message });

    const safeMessage = message.replace(/"/g, '\\"');
    exec(`git commit -m "${safeMessage}"`, { cwd: WORKSPACE_ROOT }, (commitErr, stdout) => {
      if (commitErr) {
        return res.status(500).json({ success: false, error: commitErr.message });
      }
      res.json({ success: true, output: stdout.trim() });
    });
  });
});""",
           r"""app.post('/api/git/commit', (req: Request, res: Response) => {
  const { message, files = [] } = req.body;
  if (!message || typeof message !== 'string') return res.status(400).json({ error: 'Commit message is required' });
  if (message.length > 500) return res.status(400).json({ error: 'Commit message too long (max 500 chars)' });
  const fileList = Array.isArray(files)
    ? files.filter((f: unknown): f is string => typeof f === 'string' && !!f && !f.includes('\0'))
    : [];

  // [AutoFix] no shell interpolation: argv arrays instead of exec(string)
  const runGit = (args: string[]) => new Promise<{ code: number | null; out: string; err: string }>((resolve) => {
    const c = spawn('git', args, { cwd: WORKSPACE_ROOT });
    let out = '';
    let err = '';
    c.stdout?.on('data', (d) => { out += d.toString(); });
    c.stderr?.on('data', (d) => { err += d.toString(); });
    c.on('error', (e) => resolve({ code: -1, out, err: e.message }));
    c.on('close', (code) => resolve({ code, out, err }));
  });

  (async () => {
    const addArgs = fileList.length > 0 ? ['add', '--', ...fileList] : ['add', '-A'];
    const addRes = await runGit(addArgs);
    if (addRes.code !== 0) return res.status(500).json({ success: false, error: addRes.err || 'git add failed' });
    const commitRes = await runGit(['commit', '-m', message]);
    if (commitRes.code !== 0) return res.status(500).json({ success: false, error: commitRes.err || 'git commit failed' });
    res.json({ success: true, output: commitRes.out.trim() });
  })().catch((e: any) => res.status(500).json({ success: false, error: e?.message || 'commit failed' }));
});""")

patch_once("S12a", "server.ts: /api/media/proxy SSRF guard (URL validation)", "server.ts",
           "    const imageRes = await fetch(targetUrl, { signal: AbortSignal.timeout(30000) });",
           "    const safeUrl = await assertPublicUrl(targetUrl); // [AutoFix] SSRF guard\n    \n    const imageRes = await fetch(safeUrl.toString(), { signal: AbortSignal.timeout(30000) });")

patch_once("S12b", "server.ts: /api/media/proxy content-type + size guard", "server.ts",
           '    if (!imageRes.ok) return res.status(imageRes.status).send("Failed to fetch image");',
           '''    if (!imageRes.ok) return res.status(imageRes.status).send("Failed to fetch image");
    const ctype = imageRes.headers.get("content-type") || "";
    if (!/^(image|audio|video)\\//.test(ctype)) return res.status(415).send("Only image/audio/video content allowed");
    const clen = Number(imageRes.headers.get("content-length") || "0");
    if (clen > 25 * 1024 * 1024) return res.status(413).send("Media too large");''')

patch_once("S13", "server.ts: /api/keys/list no longer leaks full keys + default PIN", "server.ts",
           r"""app.get('/api/keys/list', (req: Request, res: Response) => {
  const pool = InfiniteTokenPool.getInstance();
  res.json({
    success: true,
    keys: pool.getGeneratedKeys(),
    defaultPin: '123456',
  });
});""",
           r"""app.get('/api/keys/list', (req: Request, res: Response) => {
  const pool = InfiniteTokenPool.getInstance();
  // [AutoFix] masked list only; full key is shown once at creation (/api/keys/generate)
  res.json({
    success: true,
    keys: pool.getGeneratedKeys().map((k: any) => ({
      id: k.id,
      label: k.label,
      status: k.status,
      createdAt: k.createdAt,
      lastUsedAt: k.lastUsedAt,
      requestsHandled: k.requestsHandled,
      tokensProcessed: k.tokensProcessed,
      keyPreview: typeof k.key === 'string' ? k.key.slice(0, 12) + '...' : '',
    })),
  });
});""")

patch_once("S14", "server.ts: rate-limit /api/keys/verify-pin (brute-force)", "server.ts",
           "app.post('/api/keys/verify-pin', (req: Request, res: Response) => {",
           "app.post('/api/keys/verify-pin', pinRateLimiter, (req: Request, res: Response) => {")

# S15: delete 2nd (dead) /api/projects route — span-based, whitespace-proof
def _del_dup_projects():
    pid, desc, rel = "S15", "server.ts: remove duplicate (dead) GET /api/projects", "server.ts"
    content = read(rel)
    if "[AutoFix] Removed duplicate GET /api/projects" in content:
        rec(pid, desc, SKIP, "already applied")
        return True
    marker = "app.get('/api/projects'"
    idxs = [m.start() for m in re.finditer(re.escape(marker), content)]
    if len(idxs) != 2:
        rec(pid, desc, FAIL if len(idxs) < 2 else SKIP,
            f"expected 2 occurrences, found {len(idxs)}")
        return len(idxs) < 2
    end_marker = "app.post('/api/projects/switch'"
    end = content.find(end_marker, idxs[1])
    if end == -1:
        rec(pid, desc, FAIL, "end anchor /api/projects/switch not found")
        return False
    new = (content[:idxs[1]]
           + "// [AutoFix] Removed duplicate GET /api/projects (dead route; canonical one is registered earlier)\n\n"
           + content[end:])
    write(rel, new)
    rec(pid, desc, PASS, "dead route removed")
    return True
_del_dup_projects()

patch_once("S16a", "server.ts: bind 127.0.0.1 by default (was 0.0.0.0)", "server.ts",
           "app.listen(PORT, '0.0.0.0', () => {",
           "const BIND_HOST = process.env.BIND_HOST || '127.0.0.1';\napp.listen(PORT, BIND_HOST, () => {")

patch_once("S16b", "server.ts: startup log uses BIND_HOST", "server.ts",
           "console.log(`CODGAR Server running on http://0.0.0.0:${PORT}`);",
           "console.log(`CODGAR Server running on http://${BIND_HOST}:${PORT}`);")
# S17: the same leaked router key is ALSO hardcoded in server.ts (2 spots!)
patch_once("S17a", "server.ts: scrub hardcoded key in /api/voice/transcribe", "server.ts",
           '"Authorization": "Bearer sk-1b85c23a61dee238-k2vequ-4bc8de92"',
           '"Authorization": `Bearer ${process.env.LAYA_ROUTER_API_KEY || ""}` // [AutoFix] was hardcoded+leaked')

patch_once("S17b", "server.ts: scrub hardcoded key in YODAW AI pipeline", "server.ts",
           "'Authorization': 'Bearer sk-1b85c23a61dee238-k2vequ-4bc8de92'",
           "'Authorization': `Bearer ${process.env.LAYA_ROUTER_API_KEY || ''}` // [AutoFix] was hardcoded+leaked")

def _scrub_backups():
    pid, desc = "S17c", "scrub leaked key from local *.bak* copies (not committed)"
    n = 0
    pats = list(ROOT.glob("*.bak*")) + list(ROOT.glob("server/*.bak*")) + list(ROOT.glob("*.laya_bak")) + list(ROOT.glob("server/*.laya_bak"))
    for f in pats:
        try:
            c = f.read_text(encoding="utf-8", errors="strict")
        except Exception:
            continue
        if "sk-1b85c23a61dee238" in c:
            f.write_text(c.replace("sk-1b85c23a61dee238-k2vequ-4bc8de92", "REVOKED-ROTATE-ME"), encoding="utf-8")
            n += 1
    rec(pid, desc, PASS if n else SKIP, f"{n} backup file(s) scrubbed" if n else "no key in backups")
_scrub_backups()


# =====================================================================
# 3. server.ts TYPE-ERROR FIXES (part of the 41 tsc errors)
# =====================================================================
section("3) server.ts type-error fixes")

patch_once("T-S1", "server.ts: req.reqLang → typed cast", "server.ts",
           '  const reqLang = req.reqLang || "fa";',
           '  const reqLang = (req as any).reqLang || (globalThis as any).reqLang || "fa";')

patch_once("T-S2", "server.ts: declare pendingCodingPrompt/resumeContext", "server.ts",
           "async function handleAgentChat(req: Request, res: Response) {",
           """// [AutoFix] Conversation resume state (TODO: persist per-session instead of module-global)
let pendingCodingPrompt: string | null = null;
let resumeContext: { originalPrompt?: string; lastCode?: string } | null = null;

async function handleAgentChat(req: Request, res: Response) {""")

patch_once("T-S3", "server.ts: executionSource union += laya-autonomous-engine", "server.ts",
           "    let executionSource: 'claude-cli' | 'claude-api' | 'auth-required' | 'live-bridge' | 'infinite-pool' = 'claude-cli';",
           "    let executionSource: 'claude-cli' | 'claude-api' | 'auth-required' | 'live-bridge' | 'infinite-pool' | 'laya-autonomous-engine' = 'claude-cli';")
# =====================================================================
# 3b. TS7 STRICT-MODE REMAINING ERRORS (TS7 defaults to strict)
# =====================================================================
section("3b) TS7 strict-mode fixes")

patch_once("T-76a", "server.ts: annotate fetchImageBuffer param", "server.ts",
           "const fetchImageBuffer = async (targetUrl) => {",
           "const fetchImageBuffer = async (targetUrl: string) => {")

patch_sub_all("T-76b", "server.ts: annotate bare catch (err)", "server.ts",
              r"} catch \(err\) \{", "} catch (err: any) {")

patch_once("T-76c", "App.tsx: annotate onLoadSession param", "src/App.tsx",
           "onLoadSession={(loadedMessages) => {",
           "onLoadSession={(loadedMessages: Message[]) => {")

patch_once("T-76d", "App.tsx: annotate onFinished param", "src/App.tsx",
           "onFinished={(resultText) => {",
           "onFinished={(resultText: string) => {")

patch_sub_all("T-76e", "YodawWorkspace: title null-guard", "src/components/YodawWorkspace.tsx",
              r"title=\{selectedService\}", "title={selectedService ?? undefined}")

patch_once("T-76f", "tsconfig: explicit strict:true (matches TS7 default)", "tsconfig.json",
           '"target": "ES2022",',
           '"target": "ES2022",\n    "strict": true,')


# =====================================================================
# 4. BACKEND MODULE FIXES
# =====================================================================
section("4) Backend module fixes")

# T14: migrate leaked key -> .env BEFORE scrubbing source
def _migrate_laya_key():
    pid, desc = "T14", "layaAutonomousEngine: move leaked key to .env + read from env"
    rel = "server/layaAutonomousEngine.ts"
    content = read(rel)
    m = re.search(r"private apiKey = '([^']+)';", content)
    if not m:
        if "process.env.LAYA_ROUTER_API_KEY" in content:
            rec(pid, desc, SKIP, "already applied")
            return True
        rec(pid, desc, FAIL, "apiKey line not found")
        return False
    leaked = m.group(1)
    envp = ROOT / ".env"
    if not envp.exists():
        envp.write_text((ROOT / ".env.example").read_text(encoding="utf-8"), encoding="utf-8")
        print("     📝 .env created from .env.example")
    env = envp.read_text(encoding="utf-8")
    if "LAYA_ROUTER_API_KEY=" in env and re.search(r"^LAYA_ROUTER_API_KEY=\S+", env, re.M):
        print("     ℹ️ .env already has LAYA_ROUTER_API_KEY — keeping existing value")
    else:
        env = re.sub(r"^LAYA_ROUTER_API_KEY=.*$", f"LAYA_ROUTER_API_KEY={leaked}", env, flags=re.M)
        if "LAYA_ROUTER_API_KEY=" not in env:
            env += f"\nLAYA_ROUTER_API_KEY={leaked}\n"
        envp.write_text(env, encoding="utf-8")
        try:
            os.chmod(envp, 0o600)
        except Exception:
            pass
        print("     🔑 leaked key migrated into local .env (chmod 600, NOT committed)")
    new_content = content.replace(
        f"private apiKey = '{leaked}';",
        "private apiKey = process.env.LAYA_ROUTER_API_KEY || process.env.NINEROUTER_API_KEY || ''; // [AutoFix] was hardcoded+leaked; set LAYA_ROUTER_API_KEY in .env",
        1)
    write(rel, new_content)
    rec(pid, desc, PASS, "source scrubbed; key preserved locally in .env")
    print("     ⚠️  STILL REQUIRED: revoke this key at the provider — it lives in git history!")
    return True
_migrate_laya_key()

patch_once("T15", "infiniteTokenPool: env-based constant-time verifyPin", "server/infiniteTokenPool.ts",
           """  public verifyPin(pin: string): boolean {
    return pin.trim() === '123456';
  }""",
           """  public verifyPin(pin: string): boolean {
    // [AutoFix] PIN from env (default kept for UI compat) + constant-time compare
    const expected = process.env.CODGAR_PIN || '123456';
    const a = String(pin ?? '').trim();
    if (a.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ expected.charCodeAt(i);
    return diff === 0;
  }""")

patch_once("T16a", "universalCompiler: add 'os' import", "server/universalCompiler.ts",
           "import { exec, execSync } from 'child_process';",
           "import { exec, execSync } from 'child_process';\nimport os from 'os';")

patch_once("T16b", "universalCompiler: sandboxed temp dir + sanitized filename", "server/universalCompiler.ts",
           r"""    const workspaceRoot = process.cwd();
    const targetFile = filePath || path.join(workspaceRoot, `temp_exec_${Date.now()}.${this.getFileExtension(normalizedLang)}`);
    if (code) {
      fs.writeFileSync(targetFile, code, 'utf8');
    }""",
           r"""    const workspaceRoot = process.cwd();
    // [AutoFix] isolate execution in a fresh temp dir (auto-cleaned) + sanitize file name
    const execDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codgar-exec-'));
    const cleanupExecDir = () => { try { fs.rmSync(execDir, { recursive: true, force: true }); } catch {} };
    const safeBase = String(filePath ? path.basename(filePath) : `temp_exec_${Date.now()}`)
      .replace(/[^A-Za-z0-9_.-]/g, '_')
      .slice(0, 80) || 'exec';
    const targetFile = path.join(execDir, `${safeBase}.${this.getFileExtension(normalizedLang)}`);
    if (code) {
      fs.writeFileSync(targetFile, code, 'utf8');
    }""")

def _compiler_cleanup_calls():
    pid, desc, rel = "T16c", "universalCompiler: cleanup temp dir on all return paths", "server/universalCompiler.ts"
    content = read(rel)
    span_start = content.find("public async executeUniversal")
    span_end = content.find("private getFileExtension")
    if span_start == -1 or span_end == -1:
        rec(pid, desc, FAIL, "function span not found")
        return False
    head, span, tail = content[:span_start], content[span_start:span_end], content[span_end:]
    if "cleanupExecDir();" in span:
        rec(pid, desc, SKIP, "already applied")
        return True
    # longest indent first (6-space pattern is a suffix of 10-space!)
    n = 0
    for ind in ["          ", "        ", "      "]:
        old = f"\n{ind}return {{"
        new = f"\n{ind}cleanupExecDir();\n{ind}return {{"
        c = span.count(old)
        span = span.replace(old, new)
        n += c
    if n == 0:
        rec(pid, desc, FAIL, "no return statements found in span")
        return False
    write(rel, head + span + tail)
    rec(pid, desc, PASS, f"{n} return path(s) guarded")
    return True
_compiler_cleanup_calls()

# =====================================================================
# 5. FRONTEND TYPE-ERROR + BUG FIXES
# =====================================================================
section("5) Frontend fixes")

# T-TS1: restore getUserMedia (was replaced by `undefined(...)` → throws at runtime!)
for pid, desc, rel in [
    ("T-G1", "restore getUserMedia", "src/components/SiriLiveSpeakerOverlay.tsx"),
    ("T-G2", "restore getUserMedia", "src/services/siriVoiceEngine.ts"),
    ("T-G3", "restore getUserMedia", "src/services/voiceAgent.ts"),
    ("T-G4", "restore getUserMedia", "src/utils/audio.ts"),
    ("T-G5", "restore getUserMedia", "src/utils/nativeRecorder.ts"),
]:
    patch_sub_all(pid, f"{rel.split('/')[-1]}: {desc}", rel,
                  r"/\* getUserMedia disabled \*/ undefined",
                  "navigator.mediaDevices.getUserMedia")

def _del_dup_fn():
    pid, desc, rel = "T-A1", "audio.ts: remove duplicate updateReactInput()", "src/utils/audio.ts"
    content = read(rel)
    marker = "export function updateReactInput(value: string) {"
    idxs = [m.start() for m in re.finditer(re.escape(marker), content)]
    if len(idxs) == 1:
        rec(pid, desc, SKIP, "already single definition")
        return True
    if len(idxs) != 2:
        rec(pid, desc, FAIL, f"expected 2 definitions, found {len(idxs)}")
        return False
    removed = content[idxs[1]:]
    if removed.count("export ") > 1:
        rec(pid, desc, FAIL, "second occurrence is not the file tail — refusing")
        return False
    write(rel, content[:idxs[1]].rstrip() + "\n")
    rec(pid, desc, PASS, "2nd definition removed (kept richer 1st one)")
    return True
_del_dup_fn()

patch_once("T-Y1", "YodawWorkspace: YodawServiceType += 'website'", "src/components/YodawWorkspace.tsx",
           "export type YodawServiceType = 'image' | 'video' | 'html' | 'coding';",
           "export type YodawServiceType = 'image' | 'video' | 'html' | 'coding' | 'website';")

def _del_dup_handler():
    pid, desc, rel = "T-Y2", "YodawWorkspace: remove duplicate onKeyDown", "src/components/YodawWorkspace.tsx"
    lines = read(rel).split("\n")
    cand = [i for i, l in enumerate(lines) if l.strip() == "onKeyDown={(e) => {"]
    fixed = 0
    # compare consecutive 7-line blocks
    for i in cand:
        block = [l.strip() for l in lines[i:i + 7]]
        nxt = [l.strip() for l in lines[i + 7:i + 14]]
        if len(block) == 7 and block == nxt and block[0] == "onKeyDown={(e) => {":
            del lines[i + 7:i + 14]
            fixed += 1
            break
    if fixed == 0:
        # already fixed or pattern differs
        rec(pid, desc, SKIP, "no doubled handler found")
        return True
    write(rel, "\n".join(lines))
    rec(pid, desc, PASS, "doubled handler collapsed to one")
    return True
_del_dup_handler()

patch_once("T-A2", "types.ts: PreviewArtifact += content/html (matches runtime)", "src/types.ts",
           "  code: string;\n",
           "  code: string;\n  content?: string;\n  html?: string;\n")

patch_once("T-I1", "ImageMessageRenderer: return URL string (was RegExpMatchArray)", "src/components/ImageMessageRenderer.tsx",
           "    if (mdMatch) return mdMatch;",
           "    if (mdMatch) return mdMatch[1] ?? mdMatch[0];")

patch_once("T-I2", "ImageMessageRenderer: return URL string (2nd regex)", "src/components/ImageMessageRenderer.tsx",
           "    if (urlMatch) return urlMatch;",
           "    if (urlMatch) return urlMatch[1] ?? urlMatch[0];")

patch_once("T-P1", "PreviewModal: currentCode → rawCode (was undeclared)", "src/components/PreviewModal.tsx",
           "srcDoc={currentCode ||",
           "srcDoc={rawCode ||")

patch_once("T-M1", "main.tsx: wrap App in ErrorBoundary", "src/main.tsx",
           r"""import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);""",
           r"""import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {ErrorBoundary} from './components/ErrorBoundary.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);""")

patch_once("T-C1", "apiClient: send x-admin-token header (remote auth)", "src/services/apiClient.ts",
           """        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },""",
           """        headers: {
          'Content-Type': 'application/json',
          // [AutoFix] remote API auth; set via localStorage.setItem('codgar_admin_token', '...')
          'x-admin-token': (typeof localStorage !== 'undefined' && localStorage.getItem('codgar_admin_token')) || '',
          ...(options.headers || {}),
        },""")

patch_once("T-H1", "highFidelity: escape user prompt in preview HTML (XSS)", "src/services/highFidelityArtifactGenerator.ts",
           "    const cleanTitle = prompt.length > 50 ? prompt.slice(0, 48) + '...' : prompt;",
           "    const cleanTitle = (prompt.length > 50 ? prompt.slice(0, 48) + '...' : prompt).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;'); // [AutoFix] XSS escape")

# T-H2 via line surgery (avoids backslash-literal ambiguity entirely)
def _th2():
    pid, desc, rel = "T-H2", "highFidelity: escape AI replyText in preview HTML (XSS)", "src/services/highFidelityArtifactGenerator.ts"
    BS = chr(92)  # backslash, built without any escape-sequence ambiguity
    lines = read(rel).split("\n")
    if any("replace(/&/g, '&amp;').replace(/</g, '&lt;')" in l and "replyText" in l for l in lines):
        rec(pid, desc, SKIP, "already applied")
        return True
    target = [i for i, l in enumerate(lines) if "replyText.slice(0, 300)" in l]
    if len(target) != 1:
        rec(pid, desc, FAIL, f"expected 1 target line, found {len(target)}")
        return False
    i = target[0]
    line = lines[i]
    tail = ".replace(/[*#]/g, '')"
    s = line.find("replyText.slice(0, 300)")
    e = line.find(tail)
    if s == -1 or e == -1:
        rec(pid, desc, FAIL, "anchors not found in target line")
        return False
    new_chain = ("replyText.slice(0, 300)"
                 f".replace(/```[{BS}s{BS}S]*?```/g, '')"
                 ".replace(/[*#]/g, '')"
                 ".replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;')")
    lines[i] = line[:s] + new_chain + line[e + len(tail):]
    write(rel, "\n".join(lines))
    rec(pid, desc, PASS, "XSS escaping added")
    return True
_th2()

# window.open noopener (all src)
def _noopener():
    n_files = 0
    n_total = 0
    pat = re.compile(r"""window\.open\((.+?),\s*(['"])_blank\2\)""")
    for f in sorted((ROOT / "src").rglob("*.tsx")):
        content = f.read_text(encoding="utf-8")
        def _r(m):
            return f"window.open({m.group(1)}, {m.group(2)}_blank{m.group(2)}, 'noopener,noreferrer')"
        new, n = pat.subn(_r, content)
        if n:
            f.write_text(new, encoding="utf-8")
            n_files += 1
            n_total += n
    # .ts files too
    for f in sorted((ROOT / "src").rglob("*.ts")):
        content = f.read_text(encoding="utf-8")
        new, n = pat.subn(_r, content)
        if n:
            f.write_text(new, encoding="utf-8")
            n_files += 1
            n_total += n
    if n_total == 0:
        rec("T-W1", "window.open: add noopener", SKIP, "nothing to replace")
    else:
        rec("T-W1", "window.open: add noopener", PASS, f"{n_total} call(s) in {n_files} file(s)")
_noopener()

# PII scrub
def _pii():
    n_total = 0
    for f in list((ROOT / "src").rglob("*.tsx")) + list((ROOT / "src").rglob("*.ts")):
        content = f.read_text(encoding="utf-8")
        new = content.replace("arminsh00@gmail.com", "you@gmail.com").replace("arminsh00 (GitHub)", "you (GitHub)").replace("/arminsh00/codgar", "/you/codgar")
        if new != content:
            f.write_text(new, encoding="utf-8")
            n_total += 1
    if n_total == 0:
        rec("T-E1", "scrub personal email/username from src", SKIP, "already clean")
    else:
        rec("T-E1", "scrub personal email/username from src", PASS, f"{n_total} file(s)")
_pii()

# =====================================================================
# 6. TESTS + MISC FIXES
# =====================================================================
section("6) Broken-test + misc fixes")

def _clamp():
    pid, desc, rel = "T-T1", "test-project: add missing clamp() (test was red)", "test-project/index.js"
    content = read(rel)
    if "clamp" in content:
        rec(pid, desc, SKIP, "already present")
        return True
    write(rel, content.rstrip() + "\n\nexport function clamp(value, min, max) {\n  return Math.min(Math.max(value, min), max);\n}\n")
    rec(pid, desc, PASS, "clamp() added")
    return True
_clamp()

patch_once("T-R1", "README: fix clone URL (repo moved)", "README.md",
           "audiovido/Codgar-", "pedrammokarrami/petros-os", count=2)
patch_once("T-R2", "README: fix cd dir", "README.md",
           "cd Codgar-", "cd petros-os", count=2)

patch_once("T-O1", "overnight_daemon: auto-push requires ALLOW_AUTO_PUSH=1", "overnight_daemon.py",
           """        push_res = subprocess.run(['git', 'push', 'origin', 'main'], capture_output=True, text=True)
        if push_res.returncode == 0:""",
           """        if os.environ.get('ALLOW_AUTO_PUSH') == '1':
            push_res = subprocess.run(['git', 'push', 'origin', 'main'], capture_output=True, text=True)
        else:
            push_res = None
            log("پوش خودکار غیرفعال است (برای فعال‌سازی: ALLOW_AUTO_PUSH=1).")
        if push_res is not None and push_res.returncode == 0:""")

# =====================================================================
# 7. NPM DEPS
# =====================================================================
section("7) Install security dependencies")
print("  ⏳ npm install helmet express-rate-limit ...", flush=True)
code, out = run(["npm", "install", "--no-audit", "--no-fund", "helmet", "express-rate-limit"], timeout=600)
if code != 0 and ("ERESOLVE" in out or "peer dep" in out.lower()):
    print("  ⏳ peer conflict (pre-existing vite/esbuild mismatch) — retrying with --legacy-peer-deps ...", flush=True)
    code, out = run(["npm", "install", "--no-audit", "--no-fund", "--legacy-peer-deps", "helmet", "express-rate-limit"], timeout=600)
if code == 0:
    rec("D1", "npm i helmet express-rate-limit", PASS, "installed")
else:
    rec("D1", "npm i helmet express-rate-limit", FAIL, out.strip().splitlines()[-1] if out.strip() else f"exit {code}")
    print("     ⚠️ Run manually: npm install --legacy-peer-deps helmet express-rate-limit")

# Fresh `npm install` is broken by the same pre-existing ERESOLVE → patch installers
patch_once("D2", "install.sh: --legacy-peer-deps (fix broken fresh install)", "install.sh",
           "npm install --no-audit --no-fund",
           "npm install --no-audit --no-fund --legacy-peer-deps")
patch_once("D3", "install.bat: --legacy-peer-deps (fix broken fresh install)", "install.bat",
           "call npm install --no-audit --no-fund",
           "call npm install --no-audit --no-fund --legacy-peer-deps")
patch_once("D4", "package.json setup: --legacy-peer-deps", "package.json",
           '"setup": "cp -n .env.example .env 2>/dev/null || true && npm install"',
           '"setup": "cp -n .env.example .env 2>/dev/null || true && npm install --legacy-peer-deps"')

# =====================================================================
# 8. GIT HYGIENE (untrack junk; history purge stays manual)
# =====================================================================
section("8) Git hygiene (untrack junk)")
if IN_GIT:
    code, out = run(["git", "ls-files", "-z"], timeout=60)
    if code == 0:
        tracked = out.split("\0")
        junk_pat = re.compile(r"(^|/)(node_modules|\.swiftpm|__pycache__)(/|$)|\.bak(_|$|_.*)|\.laya_bak$|\.DS_Store$|overnight_console\.out$")
        junk = [t for t in tracked if t and junk_pat.search(t)]
        print(f"  🗑️ junk tracked files: {len(junk)}")
        if junk:
            # chunk to stay under arg limits
            ok = True
            for i in range(0, len(junk), 500):
                c, o = run(["git", "rm", "--cached", "-r", "--quiet", "--", *junk[i:i + 500]], timeout=120)
                if c != 0:
                    ok = False
                    print(f"     ⚠️ chunk {i//500} failed: {o.strip()[:200]}")
            rec("G1", "untrack node_modules/.bak/__pycache__/.DS_Store/.swiftpm", PASS if ok else FAIL,
                f"{len(junk)} file(s)")
        else:
            rec("G1", "untrack junk", SKIP, "repo already clean")
    else:
        rec("G1", "untrack junk", FAIL, "git ls-files failed")
else:
    rec("G1", "untrack junk", SKIP, "not a git repo")

# =====================================================================
# 9. RE-TEST EVERYTHING
# =====================================================================
section("9) Re-running all tests")

test_results = []

code, out = run([sys.executable, "-m", "pytest", "apps/test_task_manager.py", "-q"], timeout=120)
ok = code == 0
test_results.append(("pytest apps/test_task_manager.py", ok, out.strip().splitlines()[-1] if out.strip() else ""))
print(f"  {'✅' if ok else '❌'} pytest: {test_results[-1][2]}", flush=True)

code, out = run(["npm", "test", "--prefix", "test-project"], timeout=180)
ok = code == 0
tail = [l for l in out.strip().splitlines() if l.strip()][-3:] if out.strip() else []
test_results.append(("npm test (test-project)", ok, " | ".join(tail)))
print(f"  {'✅' if ok else '❌'} test-project: {' | '.join(tail)}", flush=True)

code, out = run(["npx", "tsc", "--noEmit"], timeout=300)
n_err = len(re.findall(r"error TS", out))
if "Unable to resolve @typescript" in out:
    test_results.append(("tsc --noEmit", None, "SKIP — TS7 native binary missing on this machine (works on macOS)"))
    print("  ⏭️ tsc: env lacks TS7 native binary — could not verify here (run `npm run lint` on your Mac)", flush=True)
else:
    ok = code == 0 and n_err == 0
    test_results.append(("tsc --noEmit", ok, f"{n_err} error(s)" if ok else out.strip().splitlines()[-5:]))
    print(f"  {'✅' if ok else '❌'} tsc --noEmit: {n_err} error(s)", flush=True)
    if not ok:
        for l in out.strip().splitlines()[:15]:
            print(f"     {l}", flush=True)

# security re-scan
print("\n  🔍 Security re-scan:", flush=True)
scans = []
code, out = run(["grep", "-rnF", "sk-1b85c23a61dee238", "--include=*.ts", "--include=*.tsx",
                 "--include=*.js", "--include=*.py", "server", "src", "server.ts"], timeout=30)
scans.append(("leaked key in source", code != 0))
code, out = run(["grep", "-nF", "0.0.0.0", "server.ts"], timeout=15)
scans.append(("0.0.0.0 bind gone", code != 0))
code, out = run(["grep", "-nE", "exec\\(`git", "server.ts"], timeout=15)
scans.append(("git exec() injection gone", code != 0))
scans.append((".gitignore exists", (ROOT / ".gitignore").exists()))
scans.append((".env.example exists", (ROOT / ".env.example").exists()))
if IN_GIT:
    code, out = run(["git", "ls-files", "node_modules"], timeout=30)
    scans.append(("node_modules untracked", out.strip() == ""))
for name, ok in scans:
    print(f"  {'✅' if ok else '❌'} {name}", flush=True)

# =====================================================================
# 10. SUMMARY
# =====================================================================
section("10) Summary")
n_ok = sum(1 for r in results if r[2] == PASS)
n_skip = sum(1 for r in results if r[2] == SKIP)
n_fail = sum(1 for r in results if r[2] == FAIL)
print(f"\n  Patches: ✅ {n_ok} applied   ⏭️ {n_skip} skipped   ❌ {n_fail} failed", flush=True)
if n_fail:
    print("  Failed patches:", flush=True)
    for pid, desc, st, det in results:
        if st == FAIL:
            print(f"    ❌ [{pid}] {desc} — {det}", flush=True)

print("\n  Tests:", flush=True)
all_green = True
for name, ok, det in test_results:
    icon = "✅" if ok else ("⏭️" if ok is None else "❌")
    print(f"    {icon} {name}: {det}", flush=True)
    if ok is False:
        all_green = False

print("\n  ⚠️ MANUAL STEPS LEFT (cannot be automated):", flush=True)
print("    1. REVOKE the leaked router key at its provider (it's in git history).", flush=True)
print("    2. Set ADMIN_TOKEN in .env (long random!) for any non-localhost use.", flush=True)
print("    3. Optional full history purge: git filter-repo ... (rewrites history!)", flush=True)
print("    4. Review: git status && git diff --stat", flush=True)

sys.exit(0 if (n_fail == 0 and all_green) else 1)
