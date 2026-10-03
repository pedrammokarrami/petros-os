import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

export interface KeyStatus {
  keyMask: string;
  totalKeys: number;
  currentIndex: number;
  rotationsCount: number;
  lastRotatedAt: number | null;
  keys: Array<{
    mask: string;
    isActive: boolean;
    inCooldown: boolean;
    cooldownRemainingMs: number;
    errorCount: number;
    lastUsedAt: number | null;
  }>;
}

interface ManagedKey {
  key: string;
  mask: string;
  cooldownUntil: number;
  errorCount: number;
  lastUsedAt: number | null;
}

export class KeyManager {
  private static instance: KeyManager;
  private keys: ManagedKey[] = [];
  private currentIndex: number = 0;
  private currentClient: GoogleGenAI | null = null;
  private rotationsCount: number = 0;
  private lastRotatedAt: number | null = null;

  private constructor() {
    this.reloadKeysFromEnv();
  }

  public static getInstance(): KeyManager {
    if (!KeyManager.instance) {
      KeyManager.instance = new KeyManager();
    }
    return KeyManager.instance;
  }

  private maskKey(k: string): string {
    if (!k) return 'NONE';
    if (k.length <= 8) return '****' + k.slice(-3);
    return k.slice(0, 6) + '...' + k.slice(-4);
  }

  /**
   * Reads .env and environment variables to refresh the keys pool
   */
  public reloadKeysFromEnv(): number {
    try {
      const envPath = path.join(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        const envConfig = dotenv.parse(fs.readFileSync(envPath));
        for (const k in envConfig) {
          if (
            k.startsWith('GEMINI_API_KEY') ||
            k.startsWith('OMNIROUTE') ||
            k.startsWith('NINEROUTER') ||
            k.startsWith('VANSROUTER') ||
            k.startsWith('AI_API_KEY')
          ) {
            process.env[k] = envConfig[k];
          }
        }
      }
    } catch {
      // ignore
    }

    const foundKeys: string[] = [];

    // Check GEMINI_API_KEY & Service specific keys (OmniRoute, 9Router, VansRouter)
    const keyEnvVars = [
      'GEMINI_API_KEY',
      'OMNIROUTE_API_KEY',
      'NINEROUTER_API_KEY',
      'VANSROUTER_API_KEY',
      'AI_API_KEY',
    ];

    for (const v of keyEnvVars) {
      if (process.env[v] && process.env[v]!.trim()) {
        foundKeys.push(process.env[v]!.trim());
      }
    }

    // Check delimited collection keys
    const collectionEnvVars = [
      'GEMINI_API_KEYS',
      'OMNIROUTE_API_KEYS',
      'NINEROUTER_API_KEYS',
      'VANSROUTER_API_KEYS',
    ];

    for (const c of collectionEnvVars) {
      if (process.env[c]) {
        const parts = process.env[c]!
          .split(/[\n,;]+/)
          .map((s) => s.trim())
          .filter(Boolean);
        foundKeys.push(...parts);
      }
    }

    // Check numbered keys like GEMINI_API_KEY_2, GEMINI_API_KEY_3... and service keys
    for (let i = 2; i <= 20; i++) {
      const k1 = process.env[`GEMINI_API_KEY_${i}`];
      if (k1 && k1.trim()) foundKeys.push(k1.trim());

      const k2 = process.env[`OMNIROUTE_API_KEY_${i}`];
      if (k2 && k2.trim()) foundKeys.push(k2.trim());

      const k3 = process.env[`NINEROUTER_API_KEY_${i}`];
      if (k3 && k3.trim()) foundKeys.push(k3.trim());

      const k4 = process.env[`VANSROUTER_API_KEY_${i}`];
      if (k4 && k4.trim()) foundKeys.push(k4.trim());
    }

    // Deduplicate
    const uniqueKeys = Array.from(new Set(foundKeys));

    // Merge into managed keys while preserving cooldown states
    const existingMap = new Map<string, ManagedKey>();
    for (const mk of this.keys) {
      existingMap.set(mk.key, mk);
    }

    this.keys = uniqueKeys.map((key) => {
      const existing = existingMap.get(key);
      if (existing) return existing;
      return {
        key,
        mask: this.maskKey(key),
        cooldownUntil: 0,
        errorCount: 0,
        lastUsedAt: null,
      };
    });

    if (this.currentIndex >= this.keys.length) {
      this.currentIndex = 0;
    }

    return this.keys.length;
  }

  /**
   * Adds a new API key dynamically to the runtime pool
   */
  public addKey(newKey: string, setAsActive: boolean = true): { success: boolean; totalKeys: number } {
    const trimmed = newKey.trim();
    if (!trimmed) return { success: false, totalKeys: this.keys.length };

    const existingIdx = this.keys.findIndex((k) => k.key === trimmed);
    if (existingIdx !== -1) {
      this.keys[existingIdx].cooldownUntil = 0; // reset cooldown
      if (setAsActive) {
        this.currentIndex = existingIdx;
        this.resetClient();
      }
      return { success: true, totalKeys: this.keys.length };
    }

    const managed: ManagedKey = {
      key: trimmed,
      mask: this.maskKey(trimmed),
      cooldownUntil: 0,
      errorCount: 0,
      lastUsedAt: null,
    };

    this.keys.push(managed);
    if (setAsActive) {
      this.currentIndex = this.keys.length - 1;
      this.resetClient();
    }

    return { success: true, totalKeys: this.keys.length };
  }

  /**
   * Check if an error represents a rate limit, 429, quota exhaustion or 503 spike
   */
  public isRateLimitOrExhausted(error: any): boolean {
    if (!error) return false;
    const msg = String(error?.message || error || '').toLowerCase();
    const status = error?.status || error?.code || error?.error?.code || error?.error?.status;

    if (status === 429 || status === 'RESOURCE_EXHAUSTED') return true;
    if (status === 503 || status === 'UNAVAILABLE') return true;
    if (status === 400 && (msg.includes('api key not valid') || msg.includes('api_key_invalid'))) return true;
    if (status === 403 && (msg.includes('quota') || msg.includes('limit') || msg.includes('api key'))) return true;

    if (
      msg.includes('429') ||
      msg.includes('resource_exhausted') ||
      msg.includes('quota exceeded') ||
      msg.includes('rate limit') ||
      msg.includes('too many requests') ||
      msg.includes('spikes in demand') ||
      msg.includes('high demand') ||
      msg.includes('unavailable') ||
      msg.includes('temporarily unavailable') ||
      msg.includes('api key not valid') ||
      msg.includes('api_key_invalid')
    ) {
      return true;
    }

    return false;
  }

  /**
   * Rotates to the next healthy API key in the pool, marking current key in cooldown
   */
  public rotateKey(reason?: string, cooldownMs: number = 60_000): { rotated: boolean; newKeyMask: string } {
    this.reloadKeysFromEnv();

    if (this.keys.length === 0) {
      return { rotated: false, newKeyMask: 'NONE' };
    }

    // Mark current key in cooldown
    const current = this.keys[this.currentIndex];
    if (current) {
      current.cooldownUntil = Date.now() + cooldownMs;
      current.errorCount++;
    }

    this.rotationsCount++;
    this.lastRotatedAt = Date.now();

    // Look for next key that is not in cooldown
    const total = this.keys.length;
    let foundNextIdx = -1;

    for (let offset = 1; offset <= total; offset++) {
      const idx = (this.currentIndex + offset) % total;
      if (Date.now() > this.keys[idx].cooldownUntil) {
        foundNextIdx = idx;
        break;
      }
    }

    // If all are in cooldown, pick the one with earliest expiration
    if (foundNextIdx === -1) {
      let earliestTime = Infinity;
      let earliestIdx = 0;
      for (let i = 0; i < total; i++) {
        if (this.keys[i].cooldownUntil < earliestTime) {
          earliestTime = this.keys[i].cooldownUntil;
          earliestIdx = i;
        }
      }
      foundNextIdx = earliestIdx;
      // Reset its cooldown so it can be retried immediately
      this.keys[foundNextIdx].cooldownUntil = 0;
    }

    this.currentIndex = foundNextIdx;
    this.resetClient();

    const active = this.keys[this.currentIndex];
    console.log(
      `[KeyManager] 🔄 Rotated to API key #${this.currentIndex + 1} (${active?.mask || 'none'}) | Reason: ${reason || 'rate limit'}`
    );

    return { rotated: true, newKeyMask: active?.mask || 'UNKNOWN' };
  }

  /**
   * Resets the cached GoogleGenAI client instance
   */
  public resetClient() {
    this.currentClient = null;
  }

  /**
   * Returns an active GoogleGenAI client instance
   */
  public getClient(): GoogleGenAI {
    if (this.keys.length === 0) {
      this.reloadKeysFromEnv();
    }

    if (this.keys.length === 0) {
      throw new Error('No GEMINI_API_KEY is configured in the environment.');
    }

    const activeKeyObj = this.keys[this.currentIndex];
    const sdkApiKey = activeKeyObj?.key || process.env.GEMINI_API_KEY || '';

    if (!this.currentClient) {
      this.currentClient = new GoogleGenAI({
        apiKey: sdkApiKey,
      });
    }

    activeKeyObj.lastUsedAt = Date.now();
    return this.currentClient;
  }

  public getActiveKey(): string | null {
    if (this.keys.length === 0) {
      this.reloadKeysFromEnv();
    }
    return this.keys[this.currentIndex]?.key || null;
  }

  /**
   * Wraps an AI operation with automatic rate-limit detection, key rotation, and retry
   */
  public async executeWithRotation<T>(
    operation: (ai: GoogleGenAI, keyInfo: { key: string; mask: string; index: number }) => Promise<T>,
    maxRetries: number = 2
  ): Promise<T> {
    const totalKeys = this.keys.length;
    // If only 1 key is available, don't repeatedly retry on hard rate limit / quota errors
    const effectiveRetries = totalKeys > 1 ? Math.min(maxRetries, totalKeys - 1) : 0;
    let attempt = 0;

    while (attempt <= effectiveRetries) {
      attempt++;
      const activeObj = this.keys[this.currentIndex];
      const ai = this.getClient();

      try {
        return await operation(ai, {
          key: activeObj.key,
          mask: activeObj.mask,
          index: this.currentIndex,
        });
      } catch (err: any) {
        const isLimited = this.isRateLimitOrExhausted(err);
        const isInvalidKey = String(err?.message || err || '').toLowerCase().includes('api key not valid') || String(err?.message || err || '').toLowerCase().includes('api_key_invalid');
        const errSummary = (err?.message || String(err)).slice(0, 80);

        if (isLimited && attempt <= effectiveRetries && totalKeys > 1) {
          console.log(
            `[KeyManager] Key #${this.currentIndex + 1} (${activeObj.mask}) switching internal router candidate (attempt ${attempt}/${effectiveRetries})...`
          );
          const cooldown = isInvalidKey ? 24 * 60 * 60 * 1000 : 60_000;
          this.rotateKey(err.message || 'Rate limit/Invalid Key', cooldown);
          await new Promise((r) => setTimeout(r, 400));
          continue;
        }

        // Re-throw so higher level cascades or fallbacks take over immediately
        throw err;
      }
    }

    throw new Error('All available API keys are currently rate-limited.');
  }

  public getStatus(): KeyStatus {
    const now = Date.now();
    const active = this.keys[this.currentIndex];

    return {
      keyMask: active ? active.mask : 'NONE',
      totalKeys: this.keys.length,
      currentIndex: this.currentIndex,
      rotationsCount: this.rotationsCount,
      lastRotatedAt: this.lastRotatedAt,
      keys: this.keys.map((k, idx) => ({
        mask: k.mask,
        isActive: idx === this.currentIndex,
        inCooldown: now < k.cooldownUntil,
        cooldownRemainingMs: Math.max(0, k.cooldownUntil - now),
        errorCount: k.errorCount,
        lastUsedAt: k.lastUsedAt,
      })),
    };
  }
}
