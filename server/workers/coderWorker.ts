import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

export interface CoderToolContext {
  projectDir: string;
  onEvent?: (type: any, payload: any) => void;
  abortSignal?: AbortSignal;
}

export class CoderWorker {
  /**
   * Safely resolves a path inside the project directory
   */
  static resolvePath(projectDir: string, relativePath: string): string {
    const normalized = path.normalize(relativePath || '.');
    const resolved = path.isAbsolute(normalized)
      ? normalized
      : path.resolve(projectDir, normalized);

    if (!resolved.startsWith(projectDir)) {
      throw new Error(`Path traversal denied: ${relativePath} is outside project root.`);
    }
    return resolved;
  }

  /**
   * Deeply inspects repository structure, language, package manager, and test suites
   */
  static async inspectRepository(context: CoderToolContext): Promise<{
    language: string;
    framework: string;
    packageManager: string;
    testRunner: string;
    structure: string[];
    hasGit: boolean;
  }> {
    const { projectDir } = context;
    const pkgPath = path.join(projectDir, 'package.json');
    let language = 'unknown';
    let framework = 'vanilla';
    let packageManager = 'npm';
    let testRunner = 'none';

    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };

        language = deps.typescript || fs.existsSync(path.join(projectDir, 'tsconfig.json'))
          ? 'TypeScript'
          : 'JavaScript';

        if (deps.react) framework = 'React';
        else if (deps.vue) framework = 'Vue';
        else if (deps.express) framework = 'Express';
        else if (deps.next) framework = 'Next.js';

        if (pkg.scripts?.test) {
          testRunner = pkg.scripts.test;
        } else if (deps.vitest) {
          testRunner = 'vitest';
        } else if (deps.jest) {
          testRunner = 'jest';
        }

        if (fs.existsSync(path.join(projectDir, 'bun.lock')) || fs.existsSync(path.join(projectDir, 'bun.lockb'))) {
          packageManager = 'bun';
        } else if (fs.existsSync(path.join(projectDir, 'pnpm-lock.yaml'))) {
          packageManager = 'pnpm';
        } else if (fs.existsSync(path.join(projectDir, 'yarn.lock'))) {
          packageManager = 'yarn';
        }
      } catch {
        // ignore parse errors
      }
    } else if (fs.existsSync(path.join(projectDir, 'pyproject.toml')) || fs.existsSync(path.join(projectDir, 'requirements.txt'))) {
      language = 'Python';
      testRunner = 'pytest';
    } else if (fs.existsSync(path.join(projectDir, 'Cargo.toml'))) {
      language = 'Rust';
      testRunner = 'cargo test';
    } else if (fs.existsSync(path.join(projectDir, 'go.mod'))) {
      language = 'Go';
      testRunner = 'go test';
    }

    const structure: string[] = [];
    try {
      const entries = fs.readdirSync(projectDir, { withFileTypes: true });
      for (const e of entries) {
        if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'dist') continue;
        structure.push(e.isDirectory() ? `${e.name}/` : e.name);
      }
    } catch {
      // directory error
    }

    const hasGit = fs.existsSync(path.join(projectDir, '.git'));

    return {
      language,
      framework,
      packageManager,
      testRunner,
      structure,
      hasGit,
    };
  }

  /**
   * Reads file content with safety constraints
   */
  static async readFile(context: CoderToolContext, filePath: string): Promise<string> {
    const fullPath = this.resolvePath(context.projectDir, filePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File does not exist: ${filePath}`);
    }
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      throw new Error(`Path is a directory, not a file: ${filePath}`);
    }
    if (stat.size > 2 * 1024 * 1024) {
      throw new Error(`File is too large (>2MB): ${filePath}`);
    }
    return fs.readFileSync(fullPath, 'utf8');
  }

  /**
   * Writes file content to disk, ensuring directory structure exists
   */
  static async writeFile(context: CoderToolContext, filePath: string, content: string): Promise<{
    filePath: string;
    bytesWritten: number;
    created: boolean;
  }> {
    const fullPath = this.resolvePath(context.projectDir, filePath);
    const parentDir = path.dirname(fullPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    const created = !fs.existsSync(fullPath);
    fs.writeFileSync(fullPath, content, 'utf8');
    const bytesWritten = Buffer.byteLength(content, 'utf8');

    context.onEvent?.('file.changed', {
      filePath,
      action: created ? 'created' : 'modified',
      bytesWritten,
    });

    return { filePath, bytesWritten, created };
  }

  /**
   * Surgical edits in a file by finding and replacing exact target content
   */
  static async editFile(
    context: CoderToolContext,
    filePath: string,
    targetContent: string,
    replacementContent: string
  ): Promise<{ filePath: string; replacements: number }> {
    const fullPath = this.resolvePath(context.projectDir, filePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File to edit does not exist: ${filePath}`);
    }
    const original = fs.readFileSync(fullPath, 'utf8');
    if (!original.includes(targetContent)) {
      throw new Error(`Target content not found in file: ${filePath}`);
    }

    const updated = original.replace(targetContent, replacementContent);
    fs.writeFileSync(fullPath, updated, 'utf8');

    context.onEvent?.('file.changed', {
      filePath,
      action: 'modified',
      bytesWritten: Buffer.byteLength(updated, 'utf8'),
    });

    return { filePath, replacements: 1 };
  }

  /**
   * Searches for strings in files within the project
   */
  static async searchFiles(context: CoderToolContext, query: string, maxResults = 25): Promise<any[]> {
    const results: any[] = [];
    const ignored = new Set(['node_modules', '.git', 'dist', '.cache', '.vite']);

    function scan(dir: string) {
      if (results.length >= maxResults) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (results.length >= maxResults) break;
        if (ignored.has(entry.name) || entry.name.startsWith('.')) continue;

        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scan(fullPath);
        } else {
          try {
            const stat = fs.statSync(fullPath);
            if (stat.size > 500 * 1024) continue;
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');
            lines.forEach((line, index) => {
              if (results.length >= maxResults) return;
              if (line.toLowerCase().includes(query.toLowerCase())) {
                results.push({
                  file: path.relative(context.projectDir, fullPath),
                  line: index + 1,
                  match: line.trim(),
                });
              }
            });
          } catch {
            // binary or unreadable file
          }
        }
      }
    }

    scan(context.projectDir);
    return results;
  }

  /**
   * Executes a real test or terminal command in the project directory
   */
  static async runCommand(
    context: CoderToolContext,
    command: string,
    timeoutMs = 60000
  ): Promise<{
    command: string;
    exitCode: number;
    stdout: string;
    stderr: string;
    durationMs: number;
  }> {
    const startTime = Date.now();
    context.onEvent?.('command.started', { command, projectDir: context.projectDir });

    return new Promise((resolve, reject) => {
      const isWindows = process.platform === 'win32';
      const shell = isWindows ? 'cmd.exe' : '/bin/bash';
      const shellArgs = isWindows ? ['/d', '/s', '/c', command] : ['-c', command];

      let stdout = '';
      let stderr = '';

      const child = spawn(shell, shellArgs, {
        cwd: context.projectDir,
        env: { ...process.env, CI: 'true', FORCE_COLOR: '0', PAGER: 'cat' },
      });

      let timedOut = false;
      const timer = setTimeout(() => {
        timedOut = true;
        child.kill('SIGTERM');
        stderr += `\n[Command timed out after ${timeoutMs / 1000}s]`;
      }, timeoutMs);

      if (context.abortSignal) {
        context.abortSignal.addEventListener('abort', () => {
          child.kill('SIGTERM');
        });
      }

      child.stdout?.on('data', (data) => {
        const text = data.toString();
        stdout += text;
        context.onEvent?.('command.output', { stream: 'stdout', text });
      });

      child.stderr?.on('data', (data) => {
        const text = data.toString();
        stderr += text;
        context.onEvent?.('command.output', { stream: 'stderr', text });
      });

      child.on('close', (exitCode) => {
        clearTimeout(timer);
        const durationMs = Date.now() - startTime;
        const result = {
          command,
          exitCode: exitCode ?? (timedOut ? -1 : 0),
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          durationMs,
        };

        context.onEvent?.('command.completed', {
          command,
          exitCode: result.exitCode,
          durationMs,
        });

        resolve(result);
      });

      child.on('error', (err) => {
        clearTimeout(timer);
        const durationMs = Date.now() - startTime;
        resolve({
          command,
          exitCode: -1,
          stdout: stdout.trim(),
          stderr: err.message,
          durationMs,
        });
      });
    });
  }

  /**
   * Executes repository test runner or custom test script
   */
  static async runTests(
    context: CoderToolContext,
    customCommand?: string
  ): Promise<{
    command: string;
    passed: boolean;
    stdout: string;
    stderr: string;
    durationMs: number;
  }> {
    context.onEvent?.('test.started', { customCommand });

    let cmdToRun = customCommand;
    if (!cmdToRun) {
      const pkgPath = path.join(context.projectDir, 'package.json');
      if (fs.existsSync(pkgPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
          if (pkg.scripts?.test && !pkg.scripts.test.includes('no test specified')) {
            cmdToRun = 'npm test';
          }
        } catch {
          // ignore
        }
      }
    }

    if (!cmdToRun) {
      // Look for a test file in the directory
      const testFiles = fs.readdirSync(context.projectDir).filter(f => f.includes('test') || f.includes('spec'));
      if (testFiles.length > 0) {
        cmdToRun = `node --test ${testFiles[0]}`;
      } else {
        cmdToRun = 'npm test';
      }
    }

    const res = await this.runCommand(context, cmdToRun);
    const passed = res.exitCode === 0;

    context.onEvent?.('test.completed', {
      command: cmdToRun,
      passed,
      exitCode: res.exitCode,
      durationMs: res.durationMs,
      details: passed ? 'All tests verified and passed.' : 'Test execution reported failures.',
    });

    return {
      command: cmdToRun,
      passed,
      stdout: res.stdout,
      stderr: res.stderr,
      durationMs: res.durationMs,
    };
  }
}
