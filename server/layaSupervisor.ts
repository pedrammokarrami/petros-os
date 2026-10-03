import { spawn, exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

export interface RouterHealth {
  id: string;
  name: string;
  port: number;
  isOnline: boolean;
  latencyMs: number;
  url: string;
}

export class LayaSupervisor {
  private static instance: LayaSupervisor;
  private homeDir = os.homedir();
  private vansRouterDir = path.join(this.homeDir, 'VansRouter');

  private constructor() {}

  public static getInstance(): LayaSupervisor {
    if (!LayaSupervisor.instance) {
      LayaSupervisor.instance = new LayaSupervisor();
    }
    return LayaSupervisor.instance;
  }

  /**
   * Health check for an HTTP endpoint
   */
  public async checkHealth(url: string, timeoutMs = 1500): Promise<boolean> {
    try {
      const res = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(timeoutMs),
      });
      return res.ok || res.status < 500;
    } catch {
      return false;
    }
  }

  /**
   * Ensures 9Router (port 20128) is online.
   * If not, automatically spawns it in the background (detached).
   */
  public async ensure9RouterOnline(): Promise<boolean> {
    const isUp = await this.checkHealth('http://127.0.0.1:20128/v1/models', 1000);
    if (isUp) return true;

    console.log('[Laya] ⚡ 9Router is offline on port 20128. Auto-spawning background daemon...');
    try {
      const binPath = fs.existsSync(path.join(this.homeDir, '.local', 'bin', '9router'))
        ? path.join(this.homeDir, '.local', 'bin', '9router')
        : '9router';

      const proc = spawn(binPath, ['-p', '20128', '-n', '-t'], {
        detached: true,
        stdio: 'ignore',
        env: {
          ...process.env,
          PATH: `${process.env.PATH}:${path.join(this.homeDir, '.local', 'bin')}:/usr/local/bin:/opt/homebrew/bin`,
        },
      });
      proc.unref();

      // Poll up to 6 seconds for readiness
      for (let i = 0; i < 12; i++) {
        await new Promise((r) => setTimeout(r, 500));
        if (await this.checkHealth('http://127.0.0.1:20128/v1/models', 500)) {
          console.log('[Laya] ✅ 9Router successfully started and responding on port 20128!');
          return true;
        }
      }
    } catch (err: any) {
      console.error('[Laya] ❌ Failed to auto-start 9Router:', err?.message);
    }
    return false;
  }

  /**
   * Auto-update repositories (e.g. VansRouter git pull)
   */
  public async updateRepositories(): Promise<{ success: boolean; output: string }> {
    return new Promise((resolve) => {
      if (!fs.existsSync(path.join(this.vansRouterDir, '.git'))) {
        return resolve({ success: false, output: 'VansRouter git directory not found' });
      }
      console.log('[Laya] 🔄 Pulling latest updates for VansRouter from repository...');
      exec('git pull origin main', { cwd: this.vansRouterDir }, (err, stdout, stderr) => {
        if (err) {
          console.warn('[Laya] ⚠️ Git pull error:', stderr || err.message);
          return resolve({ success: false, output: stderr || err.message });
        }
        console.log('[Laya] ✅ VansRouter repository updated:', stdout.trim());
        resolve({ success: true, output: stdout.trim() });
      });
    });
  }

  /**
   * Intelligently classify whether a user prompt requires code synthesis/generation
   * or is a conversational/consultative exchange.
   */
  public classifyIntent(prompt: string): { isCoding: boolean; reason: string } {
    const trimmed = (prompt || '').trim();

    // 1. Explicit conversational greetings & questions
    const isConversational =
      /^(سلام|درود|چخبر|چه خبر|خوبی|چطوری|حالت چطوره|صبح بخیر|عصر بخیر|شب بخیر|مرسی|ممنون|تشکر|دستت درد نکنه|دمت گرم|ایول|hi|hello|hey|how are you|what's up|sup|thanks)[\s!؟?.,،]*$/i.test(trimmed) ||
      /^(چخبر|چه خبر|حالت چطوره|چیکار میکنی|تو کی هستی|خودتو معرفی کن|اسمت چیه|وظیفت چیه)/i.test(trimmed);

    if (isConversational) {
      return { isCoding: false, reason: 'conversational_greeting' };
    }

    // 2. Explicit coding intent patterns (Must have both action and target)
    const hasCodingAction = /\b(بنویس|بساز|ایجاد کن|طراحی کن|پیاده‌سازی کن|پیاده سازی کن|توسعه بده|درست کن|کد بزن|دیباگ کن|رفع باگ|کد بنویس|build|create|write|code|develop|implement|generate|refactor)\b/i.test(trimmed);
    const hasCodeTarget = /(سایت|وبسایت|وب‌سایت|اپلیکیشن|برنامه|کامپوننت|اسکریپت|الگوریتم|تابع|ماشین حساب|فرم|داشبورد|ریاکت|react|html|css|python|javascript|typescript|api|ui|button|modal)/i.test(trimmed);

    if (hasCodingAction && hasCodeTarget) {
      return { isCoding: true, reason: 'explicit_coding_request' };
    }

    // Default to natural conversational/consultative
    return { isCoding: false, reason: 'consultative_chat' };
  }
}
