// [AutoFix] Central security middleware: headers, rate limits,
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
