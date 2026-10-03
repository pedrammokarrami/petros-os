#!/usr/bin/env node

/**
 * CODGAR CLI - Global Interactive AI Studio & Coding Terminal
 * Exactly like `claude` (Claude Code) or `cursor`
 * Can run interactive CLI in the terminal or launch the desktop web UI.
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const isUiMode = args.includes('--ui') || args.includes('-u') || args.includes('ui');
const isHelp = args.includes('--help') || args.includes('-h');
const isVersion = args.includes('--version') || args.includes('-v');

if (isVersion) {
  const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  console.log(`CODGAR AI Agent v${pkg.version}`);
  process.exit(0);
}

if (isHelp) {
  console.log(`
\x1b[1m\x1b[36m🚀 CODGAR AI - Autonomous Coding Agent & Studio\x1b[0m

\x1b[1mدستورات و نحوه‌ی استفاده:\x1b[0m
  \x1b[32mcodgar\x1b[0m                 شروع محیط تعاملی و هوشمند ترمینال (عین Claude Code)
  \x1b[32mcodgar --ui\x1b[0m            راه‌اندازی سرور و باز کردن رابط کاربری دسکتاپ (Web UI)
  \x1b[32mcodgar "دستور شما"\x1b[0m     اجرای مستقیم یک فرمان یا درخواست کدنویسی
  \x1b[32mcodgar --help\x1b[0m          نمایش راهنمای دستورات

\x1b[90mمستندات و مخزن: https://github.com/audiovido/CODGAR----V2\x1b[0m
`);
  process.exit(0);
}

// Function to open browser URL
function openBrowser(url) {
  const start = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  spawn(start, [url], { shell: true, stdio: 'ignore' });
}

// Launch Server with UI
function startServerAndUI() {
  console.log('\x1b[1m\x1b[36m🚀 در حال راه‌اندازی استودیو و رابط گرافیکی کدگر...\x1b[0m');
  
  // Make sure .env exists
  const envPath = path.join(rootDir, '.env');
  const envExample = path.join(rootDir, '.env.example');
  if (!fs.existsSync(envPath) && fs.existsSync(envExample)) {
    fs.copyFileSync(envExample, envPath);
  }

  const serverProc = spawn('npx', ['tsx', 'server.ts'], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, PORT: '3000' }
  });

  setTimeout(() => {
    const url = 'http://localhost:3000';
    console.log(`\x1b[1m\x1b[32m✓ رابط گرافیکی کدگر آماده است:\x1b[0m \x1b[4m${url}\x1b[0m`);
    openBrowser(url);
  }, 2500);

  process.on('SIGINT', () => {
    serverProc.kill('SIGINT');
    process.exit(0);
  });
}

// If direct prompt provided as arguments: codgar "build a snake game"
const directPrompt = args.filter(a => !a.startsWith('-')).join(' ');

if (isUiMode) {
  startServerAndUI();
} else if (directPrompt) {
  runOneShotPrompt(directPrompt);
} else {
  startInteractiveTerminal();
}

async function runOneShotPrompt(prompt) {
  console.log(`\x1b[36m⚡ کدگر در حال پردازش:\x1b[0m ${prompt}\n`);
  try {
    const res = await fetch('http://localhost:3000/api/agent/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: prompt,
        language: 'fa',
        context: { currentDir: process.cwd() }
      })
    });
    const data = await res.json();
    console.log(data.text || data.response || 'انجام شد.');
  } catch (err) {
    // If server is not running, start it silently or offer UI
    console.log('\x1b[33m💡 سرور کدگر هنوز فعال نیست. برای اجرای رابط گرافیکی:\x1b[0m \x1b[1mcodgar --ui\x1b[0m');
    startServerAndUI();
  }
}

function startInteractiveTerminal() {
  console.log(`
\x1b[1m\x1b[36m╔════════════════════════════════════════════════════════╗\x1b[0m
\x1b[1m\x1b[36m║           🚀 CODGAR Autonomous AI Terminal             ║\x1b[0m
\x1b[1m\x1b[36m║   (مانند Claude Code - اجرای دستورات، کدنویسی، UI)      ║\x1b[0m
\x1b[1m\x1b[36m╚════════════════════════════════════════════════════════╝\x1b[0m
\x1b[90mبرای اجرای رابط دسکتاپ بنویسید: \x1b[33mui\x1b[90m | برای خروج: \x1b[33mexit\x1b[0m
`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '\x1b[1m\x1b[32mcodgar > \x1b[0m'
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();
    if (!input) {
      rl.prompt();
      return;
    }

    if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
      console.log('\x1b[32mخداحافظ!\x1b[0m');
      process.exit(0);
    }

    if (input.toLowerCase() === 'ui' || input.toLowerCase() === 'open') {
      startServerAndUI();
      return;
    }

    if (input.toLowerCase() === 'clear' || input.toLowerCase() === 'cls') {
      console.clear();
      rl.prompt();
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          language: 'fa',
          context: { currentDir: process.cwd() }
        })
      });
      const data = await res.json();
      console.log('\n' + (data.text || data.response || 'دستور با موفقیت دریافت شد.') + '\n');
    } catch (e) {
      console.log('\n\x1b[33m💡 سرور پس‌زمینه در حال بوت است یا اجرا نشده. در حال بالا آوردن خودکار...\x1b[0m');
      startServerAndUI();
      return;
    }

    rl.prompt();
  });
}
