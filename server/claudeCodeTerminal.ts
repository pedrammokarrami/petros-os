import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import Anthropic from '@anthropic-ai/sdk';

export interface ClaudeTerminalExecutionResult {
  success: boolean;
  output: string;
  stderr: string;
  exitCode: number | null;
  durationMs: number;
  provider: 'claude-cli' | 'anthropic-api' | 'none';
  command: string;
}

export class ClaudeCodeTerminal {
  private static instance: ClaudeCodeTerminal;
  private anthropicApiKey: string | null = null;
  private anthropicClient: Anthropic | null = null;

  private constructor() {
    this.reloadKey();
  }

  public static getInstance(): ClaudeCodeTerminal {
    if (!ClaudeCodeTerminal.instance) {
      ClaudeCodeTerminal.instance = new ClaudeCodeTerminal();
    }
    return ClaudeCodeTerminal.instance;
  }

  public reloadKey(): string | null {
    // 1. Check process.env
    if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim()) {
      this.anthropicApiKey = process.env.ANTHROPIC_API_KEY.trim();
    } else if (process.env.CLAUDE_API_KEY && process.env.CLAUDE_API_KEY.trim()) {
      this.anthropicApiKey = process.env.CLAUDE_API_KEY.trim();
    } else {
      // 2. Check .env file
      try {
        const envPath = path.join(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
          const content = fs.readFileSync(envPath, 'utf8');
          const match = content.match(/^(?:ANTHROPIC_API_KEY|CLAUDE_API_KEY)=["']?([^"'\r\n]+)["']?/m);
          if (match && match[1]) {
            this.anthropicApiKey = match[1].trim();
            process.env.ANTHROPIC_API_KEY = this.anthropicApiKey;
          }
        }
      } catch {
        // ignore
      }
    }

    if (this.anthropicApiKey) {
      try {
        this.anthropicClient = new Anthropic({ apiKey: this.anthropicApiKey });
      } catch {
        this.anthropicClient = null;
      }
    }

    return this.anthropicApiKey;
  }

  public setApiKey(key: string): void {
    const trimmed = key.trim();
    if (trimmed) {
      this.anthropicApiKey = trimmed;
      process.env.ANTHROPIC_API_KEY = trimmed;
      this.anthropicClient = new Anthropic({ apiKey: trimmed });
    }
  }

  public getApiKey(): string | null {
    if (!this.anthropicApiKey) {
      this.reloadKey();
    }
    return this.anthropicApiKey;
  }

  public getMaskedKey(): string {
    const k = this.getApiKey();
    if (!k) return 'NOT_CONFIGURED';
    if (k.length <= 10) return '****' + k.slice(-3);
    return k.slice(0, 7) + '...' + k.slice(-4);
  }

  /**
   * Cleans ANSI escape sequences from terminal output
   */
  private cleanAnsi(text: string): string {
    return text.replace(/[\u001B\u009B][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
  }

  /**
   * Executes the prompt directly via Claude Code CLI in the terminal:
   * claude -p "<prompt>" --permission-mode dontAsk < /dev/null
   */
  public async executeInClaudeCli(
    prompt: string,
    options: {
      cwd?: string;
      timeoutMs?: number;
      systemPrompt?: string;
    } = {}
  ): Promise<ClaudeTerminalExecutionResult> {
    const startTime = Date.now();
    const cwd = options.cwd ? path.resolve(process.cwd(), options.cwd) : process.cwd();
    const timeoutMs = options.timeoutMs || 20000;
    const apiKey = this.getApiKey();

    const args: string[] = ['-p', prompt, '--permission-mode', 'dontAsk'];
    if (options.systemPrompt) {
      args.push('--system-prompt', options.systemPrompt);
    }

    const env: NodeJS.ProcessEnv = {
      ...process.env,
      CI: 'true',
      PAGER: 'cat',
      NO_COLOR: '1',
    };

    if (apiKey) {
      env.ANTHROPIC_API_KEY = apiKey;
    }

    const commandStr = `claude ${args.map((a) => (a.includes(' ') ? `"${a.replace(/"/g, '\\"')}"` : a)).join(' ')} < /dev/null`;

    return new Promise((resolve) => {
      let stdout = '';
      let stderr = '';
      let isTimedOut = false;

      // Spawn claude with stdin from /dev/null to avoid blocking on stdin input
      const child = spawn('claude', args, {
        cwd,
        env,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      const timer = setTimeout(() => {
        isTimedOut = true;
        try {
          child.kill('SIGTERM');
          setTimeout(() => {
            try { child.kill('SIGKILL'); } catch { /* ignore */ }
          }, 1000);
        } catch { /* ignore */ }
        stderr += `\n[Claude Code CLI timed out after ${timeoutMs / 1000}s]`;
      }, timeoutMs);

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
        if (stdout.length > 200000) stdout = stdout.slice(0, 200000) + '\n...[output truncated]';
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
        if (stderr.length > 50000) stderr = stderr.slice(0, 50000) + '\n...[truncated]';
      });

      child.on('error', (err) => {
        clearTimeout(timer);
        resolve({
          success: false,
          output: '',
          stderr: `Claude CLI spawn error: ${err.message}`,
          exitCode: -1,
          durationMs: Date.now() - startTime,
          provider: 'claude-cli',
          command: commandStr,
        });
      });

      child.on('close', (code) => {
        clearTimeout(timer);
        const cleanOut = this.cleanAnsi(stdout).trim();
        const cleanErr = this.cleanAnsi(stderr).trim();
        const success = code === 0 && cleanOut.length > 0;

        resolve({
          success,
          output: cleanOut,
          stderr: cleanErr,
          exitCode: isTimedOut ? -2 : code,
          durationMs: Date.now() - startTime,
          provider: 'claude-cli',
          command: commandStr,
        });
      });
    });
  }

  /**
   * Executes via Anthropic Messages API using Claude Sonnet
   */
  public async executeViaAnthropicApi(
    prompt: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }> = [],
    systemInstruction?: string
  ): Promise<{ success: boolean; text: string; error?: string }> {
    const key = this.getApiKey();
    if (!key) {
      return {
        success: false,
        text: '',
        error: 'ANTHROPIC_API_KEY is not configured in backend environment.',
      };
    }

    try {
      const client = this.anthropicClient || new Anthropic({ apiKey: key });
      const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

      for (const h of history.slice(-6)) {
        if (h.content && h.content.trim()) {
          messages.push({
            role: h.role === 'assistant' ? 'assistant' : 'user',
            content: h.content.trim(),
          });
        }
      }

      messages.push({
        role: 'user',
        content: prompt,
      });

      const response = await client.messages.create({
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 8192,
        system: systemInstruction || 'You are Claude Code, an expert autonomous coding assistant. Deliver complete, production-ready code with clean explanations and zero static placeholders.',
        messages,
      });

      const textParts = response.content
        .filter((c) => c.type === 'text')
        .map((c) => (c as any).text || '')
        .join('\n');

      return {
        success: true,
        text: textParts.trim(),
      };
    } catch (err: any) {
      return {
        success: false,
        text: '',
        error: err.message || 'Anthropic API call failed.',
      };
    }
  }

  /**
   * Unified Master Dispatcher for Backend:
   * 1. Runs final instruction directly in Claude Code CLI terminal
   * 2. If CLI reports auth issue, falls back to Anthropic API if key is available
   * 3. Absolutely NO canned mock templates ("چیزی از خودش استفاده نکنه")
   */
  public async runFinalCommand(
    prompt: string,
    options: {
      history?: any[];
      systemInstruction?: string;
      cwd?: string;
      language?: string;
    } = {}
  ): Promise<{
    success: boolean;
    text: string;
    source: 'claude-cli' | 'claude-api' | 'auth-required';
    executionMetadata?: any;
  }> {
    // 1. Run Claude Code CLI in terminal first
    const cliResult = await this.executeInClaudeCli(prompt, {
      cwd: options.cwd,
      systemPrompt: options.systemInstruction,
    });

    if (cliResult.success && cliResult.output) {
      return {
        success: true,
        text: cliResult.output,
        source: 'claude-cli',
        executionMetadata: {
          command: cliResult.command,
          exitCode: cliResult.exitCode,
          durationMs: cliResult.durationMs,
        },
      };
    }

    // If CLI failed because of auth or not logged in, try direct Anthropic API if key is set
    const key = this.getApiKey();
    if (key) {
      const apiResult = await this.executeViaAnthropicApi(
        prompt,
        options.history || [],
        options.systemInstruction
      );

      if (apiResult.success && apiResult.text) {
        return {
          success: true,
          text: apiResult.text,
          source: 'claude-api',
          executionMetadata: {
            model: 'claude-3-7-sonnet-20250219',
          },
        };
      }
    }

    // Check if failure was auth-related
    const isAuthError =
      !key ||
      cliResult.stderr.includes('Not logged in') ||
      cliResult.stderr.includes('Invalid API key') ||
      cliResult.output.includes('Not logged in') ||
      cliResult.output.includes('Please run /login');

    const isFa = options.language === 'fa' || /[\u0600-\u06FF]/.test(prompt);

    if (isAuthError) {
      const authNotice = isFa
        ? `⚠️ **نیاز به احراز هویت Claude Code در ترمینال بک‌اند**

دستور نهایی به ترمینال Claude Code ارسال شد، اما برای اتصال و دریافت مستقیم پاسخ از سرورهای کلاود، به کلید دسترسی معتبر نیاز است:

1. کلید **ANTHROPIC_API_KEY** را در تنظیمات یا متغیرهای محیطی (.env) وارد نمایید.
2. یا در ترمینال دستور \`claude auth login\` یا تنظیم توکن را اجرا کنید.

> **توجه سیستمی:** طبق دستور صریح شما، هیچ‌گونه قالب آماده یا ماک شبیه‌سازی‌شده ("از خودش") استفاده نمی‌شود تا تمام پاسخ‌ها مستقیماً و با اصالت کامل از کلاود دریافت گردند.`
        : `⚠️ **Claude Code Terminal Authentication Required**

The final instruction was dispatched to the Claude Code CLI in the backend, but authenticating with Anthropic requires an active key:

1. Configure **ANTHROPIC_API_KEY** in your environment (.env) or Settings panel.
2. Or run \`claude auth login\` in the terminal.

> **Strict Direct Directive:** Per your explicit directive, no canned or synthetic mock templates are used so that all responses come purely and authentically from Claude.`;

      return {
        success: false,
        text: authNotice,
        source: 'auth-required',
        executionMetadata: {
          cliExitCode: cliResult.exitCode,
          cliStderr: cliResult.stderr,
          hasAnthropicKey: Boolean(key),
        },
      };
    }

    // If other error occurred from Claude CLI, return the genuine error from Claude CLI
    const errText = cliResult.stderr || cliResult.output || 'Unknown Claude CLI error';
    return {
      success: false,
      text: isFa
        ? `خطای خروجی از ترمینال کلاود:\n\`\`\`\n${errText}\n\`\`\``
        : `Claude Terminal Error:\n\`\`\`\n${errText}\n\`\`\``,
      source: 'claude-cli',
      executionMetadata: cliResult,
    };
  }
}
