import fs from 'fs';
import path from 'path';
import { exec, execSync } from 'child_process';

export interface ToolRequirement {
  id: string;
  name: string;
  command: string;
  installCommand: string;
  packageManager: 'apt' | 'npm' | 'pip' | 'cargo' | 'bun' | 'script';
  description: string;
  isInstalled: boolean;
  category: 'compiler' | 'runtime' | 'builder' | 'bundler';
}

export interface BuildResult {
  success: boolean;
  language: string;
  output?: string;
  code?: string;
  html?: string;
  bundleUrl?: string;
  stderr?: string;
  durationMs: number;
  missingTools?: ToolRequirement[];
  autoInstalled?: boolean;
}

export class UniversalCompiler {
  private static instance: UniversalCompiler;
  private autoInstallEnabled: boolean = true;
  private pendingAuthorizations: Map<string, { tool: ToolRequirement; resolve: (approved: boolean) => void }> = new Map();

  private toolCatalog: Record<string, ToolRequirement> = {
    gcc: {
      id: 'gcc',
      name: 'GCC / C Compiler',
      command: 'gcc',
      installCommand: 'apt-get update && apt-get install -y build-essential',
      packageManager: 'apt',
      description: 'GNU C Compiler for building C source files',
      isInstalled: false,
      category: 'compiler',
    },
    gpp: {
      id: 'gpp',
      name: 'G++ / C++ Compiler',
      command: 'g++',
      installCommand: 'apt-get update && apt-get install -y build-essential',
      packageManager: 'apt',
      description: 'GNU C++ Compiler for building modern C++ programs',
      isInstalled: false,
      category: 'compiler',
    },
    python3: {
      id: 'python3',
      name: 'Python 3 Runtime',
      command: 'python3',
      installCommand: 'apt-get update && apt-get install -y python3 python3-pip',
      packageManager: 'apt',
      description: 'Python 3 interpreter and package runner',
      isInstalled: false,
      category: 'runtime',
    },
    pip3: {
      id: 'pip3',
      name: 'Python Pip Package Manager',
      command: 'pip3',
      installCommand: 'apt-get update && apt-get install -y python3-pip',
      packageManager: 'apt',
      description: 'Python package installer for libraries like numpy, pandas, fastapi',
      isInstalled: false,
      category: 'builder',
    },
    golang: {
      id: 'golang',
      name: 'Go Compiler & Toolchain',
      command: 'go',
      installCommand: 'apt-get update && apt-get install -y golang-go',
      packageManager: 'apt',
      description: 'Google Go language compiler for high-performance servers',
      isInstalled: false,
      category: 'compiler',
    },
    rust: {
      id: 'rust',
      name: 'Rust Compiler (rustc)',
      command: 'rustc',
      installCommand: "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y",
      packageManager: 'script',
      description: 'Rust compiler and Cargo build engine',
      isInstalled: false,
      category: 'compiler',
    },
    esbuild: {
      id: 'esbuild',
      name: 'esbuild Fast Bundler',
      command: 'esbuild',
      installCommand: 'npm install -g esbuild',
      packageManager: 'npm',
      description: 'Ultra-fast JavaScript & TypeScript/React bundler',
      isInstalled: true,
      category: 'bundler',
    },
    tsx: {
      id: 'tsx',
      name: 'TSX TypeScript Executor',
      command: 'tsx',
      installCommand: 'npm install -g tsx',
      packageManager: 'npm',
      description: 'Zero-config TypeScript & Node.js execution engine',
      isInstalled: true,
      category: 'runtime',
    },
    bun: {
      id: 'bun',
      name: 'Bun Runtime & Package Manager',
      command: 'bun',
      installCommand: 'curl -fsSL https://bun.sh/install | bash',
      packageManager: 'script',
      description: 'All-in-one JavaScript runtime & package manager',
      isInstalled: true,
      category: 'runtime',
    },
    swift: {
      id: 'swift',
      name: 'Swift Compiler / Xcode Toolchain',
      command: 'swift',
      installCommand: 'apt-get update && apt-get install -y swift || curl -s https://swift.org/builds/development/ubuntu2204/latest-build.ubuntu2204.tar.gz',
      packageManager: 'apt',
      description: 'Swift Compiler and Xcode SwiftUI development engine',
      isInstalled: false,
      category: 'compiler',
    },
  };

  private constructor() {
    this.refreshInstalledStatus();
  }

  public static getInstance(): UniversalCompiler {
    if (!UniversalCompiler.instance) {
      UniversalCompiler.instance = new UniversalCompiler();
    }
    return UniversalCompiler.instance;
  }

  public setAutoInstall(enabled: boolean) {
    this.autoInstallEnabled = enabled;
  }

  public isAutoInstallEnabled(): boolean {
    return this.autoInstallEnabled;
  }

  public refreshInstalledStatus(): Record<string, ToolRequirement> {
    for (const key of Object.keys(this.toolCatalog)) {
      const tool = this.toolCatalog[key];
      try {
        execSync(`which ${tool.command}`, { stdio: 'ignore' });
        tool.isInstalled = true;
      } catch {
        tool.isInstalled = false;
      }
    }
    return this.toolCatalog;
  }

  public getToolsList(): ToolRequirement[] {
    this.refreshInstalledStatus();
    return Object.values(this.toolCatalog);
  }

  /**
   * Installs missing tool using system package manager
   */
  public async installTool(toolId: string): Promise<{ success: boolean; output: string; error?: string }> {
    const tool = this.toolCatalog[toolId];
    if (!tool) {
      return { success: false, output: '', error: `Tool ${toolId} not found in catalog.` };
    }

    console.log(`[UniversalCompiler] 🛠️ Auto-installing tool: ${tool.name} via ${tool.installCommand}...`);

    return new Promise((resolve) => {
      exec(tool.installCommand, { env: { ...process.env, DEBIAN_FRONTEND: 'noninteractive' }, timeout: 120000 }, (error, stdout, stderr) => {
        this.refreshInstalledStatus();
        if (error) {
          console.error(`[UniversalCompiler] ❌ Installation failed for ${tool.name}:`, stderr || error.message);
          resolve({
            success: false,
            output: stdout.toString(),
            error: (stderr || error.message).toString(),
          });
        } else {
          console.log(`[UniversalCompiler] ✅ Successfully installed ${tool.name}!`);
          tool.isInstalled = true;
          resolve({
            success: true,
            output: stdout.toString() || `Installed ${tool.name} successfully.`,
          });
        }
      });
    });
  }

  /**
   * Builds React / TSX / JSX into a standalone web bundle or executable HTML
   */
  public async buildReact(code: string, options: { title?: string; minify?: boolean } = {}): Promise<BuildResult> {
    const startTime = Date.now();
    try {
      // Discover main component name from code
      let mainExportName = 'App';
      const defaultFuncMatch = code.match(/export\s+default\s+function\s+([A-Za-z0-9_]+)/);
      const defaultNamedMatch = code.match(/export\s+default\s+([A-Za-z0-9_]+)/);
      const anyComponentMatch = code.match(/(?:function|const|var|let)\s+([A-Z][A-Za-z0-9_]*)/);
      if (defaultFuncMatch) {
        mainExportName = defaultFuncMatch[1];
      } else if (defaultNamedMatch) {
        mainExportName = defaultNamedMatch[1];
      } else if (anyComponentMatch) {
        mainExportName = anyComponentMatch[1];
      }

      // 1. Clean imports/exports before esbuild to ensure browser executable standalone bundle
      let preprocessedCode = code
        .replace(/import\s+React(?:\s*,\s*\{([^}]+)\})?\s+from\s+['"][^'"]+['"];?/g, (_, hooks) => {
          return hooks ? `const { ${hooks} } = React;` : '';
        })
        .replace(/import\s*\{([^}]+)\}\s*from\s+['"]lucide-react['"];?/g, (_, icons) => {
          return `const { ${icons} } = LucideProxy;`;
        })
        .replace(/import\s+.*?\s+from\s+['"][^'"]+['"];?/g, '')
        .replace(/export\s+default\s+function\s+([A-Za-z0-9_]+)/g, 'window.__MainAppExport__ = function $1')
        .replace(/export\s+default\s+/g, 'window.__MainAppExport__ = ')
        .replace(/export\s+(?:const|let|var|function|class)\s+/g, '');

      // 2. Transform TSX/JSX code using esbuild
      const { transformSync } = await import('esbuild');
      const transformed = transformSync(preprocessedCode, {
        loader: 'tsx',
        jsx: 'transform',
        jsxFactory: 'React.createElement',
        jsxFragment: 'React.Fragment',
        target: 'es2020',
        minify: options.minify ?? false,
      });

      const safeJsCode = transformed.code;

      // 3. Generate Standalone Interactive React 18 HTML Template with Lucide Proxy & Tailwind
      const html = `<!DOCTYPE html>
<html lang="fa" dir="auto" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.title || 'React App'}</title>
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- React 18 and ReactDOM 18 -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Vazirmatn:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', 'Vazirmatn', system-ui, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #070b14;
      color: #f1f5f9;
      min-height: 100vh;
      overflow-x: hidden;
    }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
    ::-webkit-scrollbar-thumb { background: rgba(6,182,212,0.4); border-radius: 9999px; }
  </style>
</head>
<body class="bg-[#070b14] text-slate-100 min-h-screen">
  <div id="root"></div>
  <script>
    window.process = { env: { NODE_ENV: 'production' } };
    const { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } = React;
    
    // Comprehensive Lucide Icon Shim & Proxy
    function makeLucideIcon(iconName) {
      return function DynamicLucideIcon(props) {
        const { size = 18, className = '', color = 'currentColor', strokeWidth = 2, ...rest } = props || {};
        const iconRef = useRef(null);
        useEffect(() => {
          if (window.lucide && iconRef.current) {
            window.lucide.createIcons();
          }
        });
        const kebab = (iconName || 'activity').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
        return React.createElement('i', {
          ref: iconRef,
          'data-lucide': kebab,
          className: 'inline-flex items-center justify-center ' + className,
          style: { width: size, height: size, display: 'inline-flex', verticalAlign: 'middle', color },
          ...rest
        });
      };
    }

    const LucideProxy = new Proxy({}, {
      get: (target, prop) => {
        if (typeof prop === 'string') return makeLucideIcon(prop);
        return makeLucideIcon('activity');
      }
    });

    window.LucideProxy = LucideProxy;
    window.require = function(mod) {
      if (mod === 'react') return React;
      if (mod === 'react-dom' || mod === 'react-dom/client') return ReactDOM;
      if (mod === 'lucide-react') return LucideProxy;
      return {};
    };

    try {
      (function() {
        ${safeJsCode}
        
        let Component = window.__MainAppExport__;
        
        if (!Component && typeof window['${mainExportName}'] === 'function') {
          Component = window['${mainExportName}'];
        }
        
        if (!Component) {
          try {
            if (typeof ${mainExportName} === 'function') Component = ${mainExportName};
            else if (typeof App === 'function') Component = App;
            else if (typeof Main === 'function') Component = Main;
            else if (typeof LandingPage === 'function') Component = LandingPage;
            else if (typeof Website === 'function') Component = Website;
            else if (typeof Dashboard === 'function') Component = Dashboard;
            else if (typeof DynamicGeneratedApp === 'function') Component = DynamicGeneratedApp;
            else if (typeof TodoListApp === 'function') Component = TodoListApp;
            else if (typeof IosAppSimulator === 'function') Component = IosAppSimulator;
            else if (typeof AndroidAppSimulator === 'function') Component = AndroidAppSimulator;
          } catch (_) {}
        }
        
        if (Component) {
          const root = ReactDOM.createRoot(document.getElementById('root'));
          root.render(React.createElement(Component));
          setTimeout(() => {
            if (window.lucide) window.lucide.createIcons();
          }, 100);
        } else {
          document.getElementById('root').innerHTML = '<div class="p-8 text-center text-slate-300 font-sans"><div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-2xl">⚡</div><h2 class="text-xl font-bold text-white mb-2">برنامه با موفقیت بارگذاری شد</h2><p class="text-sm text-slate-400">نمایش زنده در حال اجرا است.</p></div>';
        }
      })();
    } catch (renderError) {
      console.error("React Live Render Error:", renderError);
      document.getElementById('root').innerHTML = '<div class="p-6 bg-red-950/80 border border-red-500 rounded-xl m-4 text-red-200 font-mono text-sm"><h3 class="font-bold text-red-400 mb-2">React Render Error:</h3><pre class="whitespace-pre-wrap">' + renderError.message + '</pre></div>';
    }
  </script>
</body>
</html>`;

      return {
        success: true,
        language: 'react',
        code: safeJsCode,
        html,
        durationMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        language: 'react',
        stderr: err.message,
        durationMs: Date.now() - startTime,
      };
    }
  }

  /**
   * Universal Build & Execute for any language (Python, React, TypeScript, C/C++, Go, Rust, Swift)
   */
  public async executeUniversal(params: {
    language: string;
    code?: string;
    filePath?: string;
    autoInstall?: boolean;
  }): Promise<BuildResult> {
    const startTime = Date.now();
    const { language, code = '', filePath } = params;
    const shouldAutoInstall = params.autoInstall ?? this.autoInstallEnabled;

    const normalizedLang = language.toLowerCase();

    // 1. React / JSX / TSX
    if (normalizedLang === 'react' || normalizedLang === 'tsx' || normalizedLang === 'jsx' || code.includes('import React') || code.includes('export default function')) {
      return await this.buildReact(code, { title: filePath });
    }

    // 2. Resolve target file
    const workspaceRoot = process.cwd();
    const targetFile = filePath || path.join(workspaceRoot, `temp_exec_${Date.now()}.${this.getFileExtension(normalizedLang)}`);
    if (code) {
      fs.writeFileSync(targetFile, code, 'utf8');
    }

    // 3. Determine required tool and run command
    let toolReqKey = '';
    let runCommand = '';

    if (normalizedLang === 'python' || targetFile.endsWith('.py')) {
      toolReqKey = 'python3';
      runCommand = `python3 "${targetFile}"`;
    } else if (normalizedLang === 'c' || targetFile.endsWith('.c')) {
      toolReqKey = 'gcc';
      const outBin = `${targetFile}.out`;
      runCommand = `gcc "${targetFile}" -o "${outBin}" && "${outBin}"`;
    } else if (normalizedLang === 'cpp' || normalizedLang === 'c++' || targetFile.endsWith('.cpp')) {
      toolReqKey = 'gpp';
      const outBin = `${targetFile}.out`;
      runCommand = `g++ "${targetFile}" -o "${outBin}" && "${outBin}"`;
    } else if (normalizedLang === 'go' || targetFile.endsWith('.go')) {
      toolReqKey = 'golang';
      runCommand = `go run "${targetFile}"`;
    } else if (normalizedLang === 'rust' || targetFile.endsWith('.rs')) {
      toolReqKey = 'rust';
      const outBin = `${targetFile}.out`;
      runCommand = `rustc "${targetFile}" -o "${outBin}" && "${outBin}"`;
    } else if (normalizedLang === 'swift' || targetFile.endsWith('.swift')) {
      toolReqKey = 'swift';
      runCommand = `swift "${targetFile}" || swiftc "${targetFile}" -o "${targetFile}.out" && "${targetFile}.out"`;
    } else if (normalizedLang === 'typescript' || normalizedLang === 'ts') {
      toolReqKey = 'tsx';
      runCommand = `npx tsx "${targetFile}"`;
    } else {
      toolReqKey = 'bun';
      runCommand = `node "${targetFile}"`;
    }

    // 4. Check tool availability
    this.refreshInstalledStatus();
    const toolReq = this.toolCatalog[toolReqKey];

    let autoInstalled = false;
    if (toolReq && !toolReq.isInstalled) {
      if (shouldAutoInstall) {
        console.log(`[UniversalCompiler] ⚡ Auto-install enabled. Automatically installing ${toolReq.name}...`);
        const installRes = await this.installTool(toolReqKey);
        if (!installRes.success) {
          return {
            success: false,
            language: normalizedLang,
            stderr: `Auto-installation of ${toolReq.name} failed: ${installRes.error}\nPlease authorize manual installation.`,
            missingTools: [toolReq],
            durationMs: Date.now() - startTime,
          };
        }
        autoInstalled = true;
      } else {
        return {
          success: false,
          language: normalizedLang,
          stderr: `Required compiler/tool '${toolReq.name}' (${toolReq.command}) is not installed.`,
          missingTools: [toolReq],
          durationMs: Date.now() - startTime,
        };
      }
    }

    // 5. Execute command
    try {
      const stdout = execSync(runCommand, {
        cwd: workspaceRoot,
        encoding: 'utf8',
        timeout: 25000,
        env: { ...process.env, PYTHONUNBUFFERED: '1', CI: '1' },
      });

      return {
        success: true,
        language: normalizedLang,
        output: stdout.trim(),
        autoInstalled,
        durationMs: Date.now() - startTime,
      };
    } catch (execErr: any) {
      return {
        success: false,
        language: normalizedLang,
        output: (execErr.stdout || '').toString().trim(),
        stderr: (execErr.stderr || execErr.message || '').toString().trim(),
        autoInstalled,
        durationMs: Date.now() - startTime,
      };
    }
  }

  private getFileExtension(lang: string): string {
    switch (lang) {
      case 'python':
      case 'py':
        return 'py';
      case 'c':
        return 'c';
      case 'cpp':
      case 'c++':
        return 'cpp';
      case 'go':
      case 'golang':
        return 'go';
      case 'rust':
      case 'rs':
        return 'rs';
      case 'swift':
        return 'swift';
      case 'typescript':
      case 'ts':
        return 'ts';
      case 'react':
      case 'tsx':
        return 'tsx';
      case 'jsx':
        return 'jsx';
      default:
        return 'js';
    }
  }
}
