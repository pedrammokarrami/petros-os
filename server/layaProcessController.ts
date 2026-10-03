import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

export class LayaProcessController {
  private static instance: LayaProcessController;
  private homeDir = os.homedir();

  private constructor() {}

  public static getInstance(): LayaProcessController {
    if (!LayaProcessController.instance) {
      LayaProcessController.instance = new LayaProcessController();
    }
    return LayaProcessController.instance;
  }

  /**
   * Gracefully clears any process listening on a port
   */
  public cleanPort(port: number): void {
    try {
      execSync(`lsof -ti tcp:${port} | xargs kill -15 2>/dev/null || true`);
      execSync(`sleep 0.5`);
      execSync(`lsof -ti tcp:${port} | xargs kill -9 2>/dev/null || true`);
      console.log(`[Laya Controller] 🧹 Cleaned port ${port}`);
    } catch {}
  }

  /**
   * Restarts 9Router (Port 20128)
   */
  public async restart9Router(): Promise<boolean> {
    console.log('[Laya Controller] 🔄 Performing clean restart of 9Router (Port 20128)...');
    this.cleanPort(20128);

    // Clean up any stale sqlite locks if present
    const dbDir = path.join(this.homeDir, '.9router', 'db');
    try {
      if (fs.existsSync(path.join(dbDir, 'data.sqlite-wal'))) {
        fs.unlinkSync(path.join(dbDir, 'data.sqlite-wal'));
      }
    } catch {}

    try {
      const binPath = fs.existsSync(path.join(this.homeDir, '.local', 'bin', '9router'))
        ? path.join(this.homeDir, '.local', 'bin', '9router')
        : '9router';

      const proc = spawn(binPath, ['-p', '20128', '-n', '-t'], {
        detached: true,
        stdio: 'ignore',
        env: {
          ...process.env,
          PATH: `${process.env.PATH}:${path.join(this.homeDir, '.local', 'bin')}:/usr/local/bin:/opt/homebrew/bin`
        }
      });
      proc.unref();

      // Poll up to 10 seconds for service readiness
      for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 500));
        try {
          const res = await fetch('http://127.0.0.1:20128/v1/models', { signal: AbortSignal.timeout(800) });
          if (res.ok) {
            console.log('[Laya Controller] ✅ 9Router online and healthy on port 20128!');
            return true;
          }
        } catch {}
      }
    } catch (e: any) {
      console.error('[Laya Controller] ❌ 9Router restart error:', e?.message);
    }
    return false;
  }

  /**
   * Restarts OmniRoute (Port 20130 / Default)
   */
  public async restartOmniRoute(): Promise<boolean> {
    console.log('[Laya Controller] 🔄 Executing OmniRoute restart/serve...');
    try {
      this.cleanPort(20130);
      const proc = spawn('omniroute', ['serve'], {
        detached: true,
        stdio: 'ignore',
        env: {
          ...process.env,
          PATH: `${process.env.PATH}:${path.join(this.homeDir, '.local', 'bin')}:/usr/local/bin:/opt/homebrew/bin`
        }
      });
      proc.unref();
      console.log('[Laya Controller] ✅ OmniRoute daemon refreshed.');
      return true;
    } catch (e: any) {
      console.error('[Laya Controller] ❌ OmniRoute restart error:', e?.message);
      return false;
    }
  }

  public async rotateAndHeal(failedRouter: 'omniroute' | '9router' | 'vansrouter'): Promise<void> {
    console.log(`[Laya Controller] ⚡ Self-healing invoked for ${failedRouter}...`);
    if (failedRouter === '9router') {
      await this.restart9Router();
    } else if (failedRouter === 'omniroute') {
      await this.restartOmniRoute();
    }
  }
}
