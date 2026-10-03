import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Skill } from '../types';
import {
  Sparkles,
  Check,
  X,
  Shield,
  Code,
  Cpu,
  Layers,
  Globe,
  Database,
  Search,
  FolderGit2,
  Terminal,
  ExternalLink,
  Plus,
  Server,
  Zap,
  GripHorizontal,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
}

interface McpServerItem {
  id: string;
  name: string;
  vendor: string;
  description: string;
  package: string;
  category: 'frontend_ui' | 'database' | 'devops' | 'search' | 'tools' | 'collaboration' | 'ai_tools';
  status: 'active' | 'installed' | 'available';
  command: string;
  rating: string;
}

const DEFAULT_MCP_SERVERS: McpServerItem[] = [
  {
    id: 'mcp-frontend-stylist',
    name: 'Creative UI/UX & Tailwind Pro MCP',
    vendor: 'Codgar Design Guild / MCP.directory',
    description: 'Enforces high-craftsmanship UI/UX design: fluid typography, micro-interactions, cohesive palettes, high contrast & silky motion.',
    package: '@codgar/mcp-creative-uiux-pro',
    category: 'frontend_ui',
    status: 'active',
    command: 'npx -y @codgar/mcp-creative-uiux-pro',
    rating: '5.0 ★',
  },
  {
    id: 'mcp-github',
    name: 'GitHub MCP Server',
    vendor: 'Model Context Protocol (Official)',
    description: 'Inspect repositories, search code, read issues, review pull requests, and manage Git workflows.',
    package: '@modelcontextprotocol/server-github',
    category: 'devops',
    status: 'active',
    command: 'npx -y @modelcontextprotocol/server-github',
    rating: '4.9 ★',
  },
  {
    id: 'mcp-postgres',
    name: 'PostgreSQL Database MCP',
    vendor: 'Model Context Protocol (Official)',
    description: 'Direct read-only & schema introspection inspection for Postgres instances with safe parameterization.',
    package: '@modelcontextprotocol/server-postgres',
    category: 'database',
    status: 'active',
    command: 'npx -y @modelcontextprotocol/server-postgres postgresql://localhost/db',
    rating: '4.9 ★',
  },
  {
    id: 'mcp-filesystem',
    name: 'Filesystem Safe Access',
    vendor: 'Model Context Protocol (Official)',
    description: 'Secure sandboxed filesystem reads, directory exploration, and write operations in allowed project root.',
    package: '@modelcontextprotocol/server-filesystem',
    category: 'tools',
    status: 'active',
    command: 'npx -y @modelcontextprotocol/server-filesystem /workspace',
    rating: '5.0 ★',
  },
  {
    id: 'mcp-brave',
    name: 'Brave Web Search MCP',
    vendor: 'Brave Software / MCP Community',
    description: 'Real-time live web indexing, search summaries, and documentation retrieval without search quotas.',
    package: '@modelcontextprotocol/server-brave-search',
    category: 'search',
    status: 'installed',
    command: 'npx -y @modelcontextprotocol/server-brave-search',
    rating: '4.8 ★',
  },
  {
    id: 'mcp-puppeteer',
    name: 'Puppeteer Headless Browser',
    vendor: 'Model Context Protocol (Official)',
    description: 'Live web scraping, DOM rendering, JavaScript evaluation, and visual screenshot diagnostics.',
    package: '@modelcontextprotocol/server-puppeteer',
    category: 'tools',
    status: 'available',
    command: 'npx -y @modelcontextprotocol/server-puppeteer',
    rating: '4.7 ★',
  },
  {
    id: 'mcp-sqlite',
    name: 'SQLite Local Database',
    vendor: 'Model Context Protocol (Official)',
    description: 'Lightweight embedded relational database management and schema analysis.',
    package: '@modelcontextprotocol/server-sqlite',
    category: 'database',
    status: 'available',
    command: 'npx -y @modelcontextprotocol/server-sqlite ./data.db',
    rating: '4.8 ★',
  },
  {
    id: 'mcp-memory',
    name: 'Knowledge Graph Memory MCP',
    vendor: 'Model Context Protocol (Official)',
    description: 'Persistent associative entity-relation memory graph across multi-turn agent coding sessions.',
    package: '@modelcontextprotocol/server-memory',
    category: 'tools',
    status: 'active',
    command: 'npx -y @modelcontextprotocol/server-memory',
    rating: '4.9 ★',
  },
  {
    id: 'mcp-desktop-organizer',
    name: 'Desktop & Screenshots Autonomous Organizer MCP',
    vendor: 'Model Context Protocol / Codgar Engine',
    description: 'Autonomous desktop cleaner, screenshot collector, folder creator, and file system mover.',
    package: '@codgar/mcp-desktop-organizer',
    category: 'tools',
    status: 'active',
    command: 'npx -y @codgar/mcp-desktop-organizer',
    rating: '5.0 ★',
  },
  {
    id: 'mcp-slack',
    name: 'Slack Collaboration MCP',
    vendor: 'Model Context Protocol (Official)',
    description: 'Post messages, read thread histories, and trigger team notifications directly from agent workflows.',
    package: '@modelcontextprotocol/server-slack',
    category: 'collaboration',
    status: 'available',
    command: 'npx -y @modelcontextprotocol/server-slack',
    rating: '4.6 ★',
  },
];

const DEFAULT_SKILLS: Skill[] = [
  {
    id: 'skill_tdd',
    name: 'Test-Driven Development (TDD)',
    description: 'Enforces red-green-refactor cycle. Writes unit tests before writing implementations.',
    enabled: true,
    category: 'Testing',
  },
  {
    id: 'skill_security',
    name: 'Zero-Day Vulnerability Auditor',
    description: 'Checks for command injection, prototype pollution, secret leakage, and unsafe path traversal.',
    enabled: true,
    category: 'Security',
  },
  {
    id: 'skill_refactor',
    name: 'Refactoring & Clean Architecture',
    description: 'Splits monolithic modules into clean, typed functions with single responsibility.',
    enabled: true,
    category: 'Architecture',
  },
  {
    id: 'skill_perf',
    name: 'Performance & Latency Profiler',
    description: 'Identifies slow loops, memory leaks, unnecessary re-renders, and bloated bundles.',
    enabled: false,
    category: 'Performance',
  },
  {
    id: 'skill_git',
    name: 'Conventional Commits & Release',
    description: 'Auto-generates semantic commit messages and tracks clean branch history.',
    enabled: true,
    category: 'Git',
  },
];

export function SkillsModal({ isOpen, onClose, embedded = false }: Props) {
  const [activeTab, setActiveTab] = useState<'mcp' | 'registries' | 'skills'>('mcp');
  const [searchQuery, setSearchQuery] = useState('');
  const [mcpServers, setMcpServers] = useState<McpServerItem[]>(DEFAULT_MCP_SERVERS);
  const [skills, setSkills] = useState<Skill[]>(DEFAULT_SKILLS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);
  const [syncStatusText, setSyncStatusText] = useState('All Registries Synced');

  if (!isOpen) return null;

  const toggleSkill = (id: string) => {
    setSkills((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const toggleMcpServer = (id: string) => {
    setMcpServers((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            status: s.status === 'active' ? 'installed' : 'active',
          };
        }
        return s;
      })
    );
  };

  const handleSyncRegistries = () => {
    setIsAutoSyncing(true);
    setSyncStatusText('Scanning mcp.directory, Smithery.ai & PulseMCP...');
    setTimeout(() => {
      setIsAutoSyncing(false);
      setSyncStatusText('✓ 1,600+ MCP Servers & UI Skills Live Synchronized');
    }, 1200);
  };

  const filteredMcp = mcpServers.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.package.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const REGISTRIES_LIST = [
    // Category 1: Agent Skills Core & Guidelines
    {
      id: 'agentskills-core',
      category: 'agent_core',
      categoryName: 'هسته مهارت‌های عامل',
      name: 'Agent Skills Core Standard (agentskills)',
      url: 'https://github.com/agentskills/agentskills',
      desc: 'استاندارد اصلی و پروتکل تعریف مهارت‌های شناختی، اجرای ابزارها و دانش زمینه‌ای برای ایجنت‌های هوشمند.',
      badge: 'AGENT SPEC',
      badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
      count: 'Core Spec',
    },
    {
      id: 'vercel-agent-skills',
      category: 'agent_core',
      categoryName: 'هسته مهارت‌های عامل',
      name: 'Vercel Labs Agent Skills',
      url: 'https://github.com/vercel-labs/agent-skills',
      desc: 'مهارت‌ها و گایدلاین‌های رسمی Vercel برای برنامه‌نویسی ایجنت‌محور، وب پرفورمنس و معماری Next.js/React.',
      badge: 'VERCEL LABS',
      badgeColor: 'bg-black text-white border-slate-700',
      count: 'Official Repo',
    },
    {
      id: 'agent-skills-hub',
      category: 'agent_core',
      categoryName: 'هسته مهارت‌های عامل',
      name: 'Agent Skills Hub Community',
      url: 'https://github.com/agent-skills-hub/agent-skills-hub',
      desc: 'مخزن جامع و آزاد جامعه توسعه‌دهندگان برای به‌اشتراک‌گذاری مهارت‌های کاربردی ایجنت‌ها.',
      badge: 'COMMUNITY',
      badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      count: '250+ Skills',
    },
    {
      id: 'jakubkrehel-skills',
      category: 'agent_core',
      categoryName: 'هسته مهارت‌های عامل',
      name: 'Jakub Krehel Skills Standard',
      url: 'https://github.com/jakubkrehel/skills',
      desc: 'مجموعه تخصصی مهارت‌های کدنویسی هوشمند و دستورالعمل‌های خودکارسازی پروژه‌ها.',
      badge: 'EXPERT REPO',
      badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      count: 'Curated',
    },
    {
      id: 'joshuadavidthomas-skills',
      category: 'agent_core',
      categoryName: 'هسته مهارت‌های عامل',
      name: 'Joshua David Thomas Agent Skills',
      url: 'https://github.com/joshuadavidthomas/agent-skills',
      desc: 'گایدلاین‌ها و الگوهای پیشرفته گردش‌کار برای ایجنت‌های کدنویسی خودکار.',
      badge: 'WORKFLOWS',
      badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
      count: 'Verified',
    },

    // Category 2: Cursorrules & Prompts
    {
      id: 'awesome-cursorrules-patrick',
      category: 'cursorrules',
      categoryName: 'قوانین و پرامپت‌ها',
      name: 'Awesome Cursorrules (PatrickJS)',
      url: 'https://github.com/PatrickJS/awesome-cursorrules',
      desc: 'مجموعه فوق‌العاده قوانین .cursorrules برای فریم‌ورک‌های مدرن، تایپ‌اسکریپت، پایتون و ری‌اکت.',
      badge: 'POPULAR',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      count: '1.2k+ Rules',
    },
    {
      id: 'cursor-directory',
      category: 'cursorrules',
      categoryName: 'قوانین و پرامپت‌ها',
      name: 'Cursor.directory Repository',
      url: 'https://github.com/pontusab/cursor.directory',
      desc: 'دایرکتوری رسمی قوانین هوشمند برای سیستم‌های توسعه خودکار و پرامپت انجینیرینگ.',
      badge: 'DIRECTORY',
      badgeColor: 'bg-sky-100 text-sky-700 border-sky-200',
      count: 'Live Index',
    },
    {
      id: 'gregpr07-cursorrules',
      category: 'cursorrules',
      categoryName: 'قوانین و پرامپت‌ها',
      name: 'Awesome Cursorrules (GregPR07)',
      url: 'https://github.com/gregpr07/awesome-cursorrules',
      desc: 'قوانین استیک و بهینه‌شده برای توسعه سریع اپلیکیشن‌های وب و موبایل.',
      badge: 'PROMPTS',
      badgeColor: 'bg-rose-100 text-rose-700 border-rose-200',
      count: 'Curated',
    },

    // Category 3: Desktop & HIG Experience
    {
      id: 'windows-dev-docs',
      category: 'desktop_hig',
      categoryName: 'دسکتاپ و سیستم‌عامل',
      name: 'Microsoft Windows Dev Docs & Fluent Design',
      url: 'https://github.com/MicrosoftDocs/windows-dev-docs',
      desc: 'مستندات مرجع توسعه دسکتاپ وین‌دیزاین، زبان طراحی Fluent UI و اپلیکیشن‌های نپای.',
      badge: 'MICROSOFT',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      count: 'Official HIG',
    },
    {
      id: 'win32-api-docs',
      category: 'desktop_hig',
      categoryName: 'دسکتاپ و سیستم‌عامل',
      name: 'Microsoft Win32 API Reference',
      url: 'https://github.com/MicrosoftDocs/win32',
      desc: 'مستندات جامع سیستم‌عامل و APIهای سطح پایین Win32 برای توسعه بومی.',
      badge: 'WIN32 API',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
      count: 'Low-Level Spec',
    },
    {
      id: 'gnome-hig',
      category: 'desktop_hig',
      categoryName: 'دسکتاپ و سیستم‌عامل',
      name: 'GNOME Human Interface Guidelines (HIG)',
      url: 'https://gitlab.gnome.org/Teams/Design/hig-welcome',
      desc: 'راهنما و شیوه نامه رسمی طراحی رابط‌های کاربری سیستم‌عامل گنوم و لینوکس.',
      badge: 'GNOME HIG',
      badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      count: 'Linux HIG',
    },
    {
      id: 'kde-develop-docs',
      category: 'desktop_hig',
      categoryName: 'دسکتاپ و سیستم‌عامل',
      name: 'KDE Development & HIG Docs',
      url: 'https://invent.kde.org/documentation/develop-kde-org',
      desc: 'مستندات رسمی توسعه دسکتاپ KDE Plasma و شیوه نامه‌های رابط کاربری اکوسیستم Qt.',
      badge: 'KDE PLASMA',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
      count: 'Qt Docs',
    },

    // Category 4: Game Engines & 3D
    {
      id: 'unreal-cursorrules',
      category: 'game_3d',
      categoryName: 'موتورهای بازی و ۳D',
      name: 'Unreal Engine C++ Cursor Rules',
      url: 'https://github.com/Dark-Frost-Games/unreal-engine-cursorrules',
      desc: 'قوانین اختصاصی کدنویسی C++ و ساختار معماری آنریل انجین برای ایجنت‌های هوش مصنوعی.',
      badge: 'UNREAL C++',
      badgeColor: 'bg-stone-100 text-stone-800 border-stone-300',
      count: 'UE5 Rules',
    },
    {
      id: 'ue5-style-guide',
      category: 'game_3d',
      categoryName: 'موتورهای بازی و ۳D',
      name: 'UE5 Style Guide & Standards (Allar)',
      url: 'https://github.com/Allar/ue5-style-guide',
      desc: 'شیوه نامه و استانداردهای نام‌گذاری و معماری دارایی‌های سه‌بعدی در آنریل انجین ۵.',
      badge: 'UE5 STYLE',
      badgeColor: 'bg-neutral-100 text-neutral-800 border-neutral-300',
      count: 'Standard Spec',
    },
    {
      id: 'unity-cursorrules',
      category: 'game_3d',
      categoryName: 'موتورهای بازی و ۳D',
      name: 'Unity C# & Shader Cursor Rules',
      url: 'https://github.com/pau-andreu/unity-cursorrules',
      desc: 'دستورالعمل‌ها و قوانین هوشمند کدنویسی C#، شیدرها و بهینه‌سازی پروژه‌های یونینی.',
      badge: 'UNITY C#',
      badgeColor: 'bg-slate-200 text-slate-900 border-slate-400',
      count: 'Unity Rules',
    },
    {
      id: 'habrador-computational-geometry',
      category: 'game_3d',
      categoryName: 'موتورهای بازی و ۳D',
      name: 'Computational Geometry Algorithms in Unity',
      url: 'https://github.com/Habrador/Computational-geometry',
      desc: 'الگوریتم‌های محاسبات هندسی ۳ بعدی، تولید مش، Voronoi و Triangulation در یونینی.',
      badge: '3D GEOMETRY',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      count: '3D Math',
    },
    {
      id: 'unity-ui-toolkit-samples',
      category: 'game_3d',
      categoryName: 'موتورهای بازی و ۳D',
      name: 'Unity UI Toolkit Official Samples',
      url: 'https://github.com/Unity-Technologies/ui-toolkit-samples',
      desc: 'نمونه‌های رسمی طراحی رابط‌های کاربری مدرن در بازی‌ها با استفاده از Unity UI Toolkit.',
      badge: 'UNITY UI',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
      count: 'Samples',
    },

    // Category 5: Spatial XR & Embedded GUI
    {
      id: 'xr-interaction-toolkit',
      category: 'spatial_embedded',
      categoryName: 'محاسبات فضایی و تعبیه شده',
      name: 'Unity XR Interaction Toolkit Examples',
      url: 'https://github.com/Unity-Technologies/XR-Interaction-Toolkit-Examples',
      desc: 'الگوهای تعاملات فضایی واقعیت افزوده و واقعیت مجازی (AR/VR/XR) و دستکش‌های هپتیک.',
      badge: 'SPATIAL XR',
      badgeColor: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
      count: 'XR Samples',
    },
    {
      id: 'icecubes-visionos',
      category: 'spatial_embedded',
      categoryName: 'محاسبات فضایی و تعبیه شده',
      name: 'IceCubesApp Spatial visionOS SwiftUI',
      url: 'https://github.com/Dimillian/IceCubesApp',
      desc: 'کد مرجع فوق‌العاده اپلیکیشن فضایی visionOS با معماری SwiftUI و انیمیشن‌های چندبعدی.',
      badge: 'VISION OS',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
      count: 'SwiftUI XR',
    },
    {
      id: 'lvgl-embedded-gui',
      category: 'spatial_embedded',
      categoryName: 'محاسبات فضایی و تعبیه شده',
      name: 'LVGL - Light Embedded Graphics Library',
      url: 'https://github.com/lvgl/lvgl',
      desc: 'کتابخانه گرافیكی قدرتمند و سبك برای سیستم‌های تعبیه شده (Embedded)، میکروکنترلرها و نمایشگرها.',
      badge: 'EMBEDDED GUI',
      badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
      count: 'Embedded C',
    },
    {
      id: 'slint-ui-framework',
      category: 'spatial_embedded',
      categoryName: 'محاسبات فضایی و تعبیه شده',
      name: 'Slint UI Framework (Rust / C++)',
      url: 'https://github.com/slint-ui/slint',
      desc: 'فریم‌ورک رابط کاربری سبک، سریع و مدرن برای برنامه‌های دسکتاپ و سخت‌افزارهای کم‌مصرف با Rust/C++.',
      badge: 'RUST GUI',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      count: 'Rust/C++',
    },
    {
      id: 'juce-audio-spatial-framework',
      category: 'spatial_embedded',
      categoryName: 'محاسبات فضایی و تعبیه شده',
      name: 'JUCE Framework for Audio & Spatial UI',
      url: 'https://github.com/juce-framework/JUCE',
      desc: 'فریم‌ورک قدرتمند C++ برای ساخت پلاگین‌های صوتی پردازش واقعی و واجه‌های چندرسانه‌ای فضایی.',
      badge: 'JUCE AUDIO',
      badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-200',
      count: 'C++ Framework',
    },

    // Additional MCP Registries
    {
      id: 'mcp-dir',
      category: 'agent_core',
      categoryName: 'هسته مهارت‌های عامل',
      name: 'MCP.directory (Premier Catalog)',
      url: 'https://mcp.directory/',
      desc: 'بزرگترین و جامع‌ترین دایرکتوری سرورهای رسمی و غیررسمی پروتکل کانتکست مدل با دسته‌بندی و تست زنده.',
      badge: 'OFFICIAL HUB',
      badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      count: '420+ Servers',
    },
    {
      id: 'smithery',
      category: 'agent_core',
      categoryName: 'هسته مهارت‌های عامل',
      name: 'Smithery.ai Registry',
      url: 'https://smithery.ai/',
      desc: 'رجیستری نامتمرکز و ابزار نصب تک‌کلیک ابزارهای MCP برای تمامی ایجنت‌های هوش مصنوعی.',
      badge: '1-CLICK INSTALL',
      badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      count: '380+ Servers',
    },
  ];

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const content = (
    <div className={`w-full ${embedded ? 'h-full' : 'max-w-2xl ice-glass-window rounded-3xl border border-white/90 shadow-2xl max-h-[90vh]'} flex flex-col overflow-hidden text-slate-800 bg-white/95 cursor-default select-none`}>
      {/* Header */}
      <div className={`px-6 py-3.5 border-b border-white/60 flex items-center justify-between bg-white/50 ${embedded ? '' : 'cursor-grab active:cursor-grabbing'}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white flex items-center justify-center shadow-md shrink-0">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-xs sm:text-sm text-slate-900 tracking-wider flex items-center gap-1.5">
                <span>MCP DIRECTORY & EXTENSIONS</span>
                {!embedded && <GripHorizontal className="w-3.5 h-3.5 text-slate-400" />}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>AUTO-PROVISION ACTIVE</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Model Context Protocol Servers & Agent Skills</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/80 hover:bg-rose-50 text-slate-600 hover:text-rose-600 flex items-center justify-center transition cursor-pointer shadow-sm border border-white"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 pb-2 bg-white/40 border-b border-white/50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('mcp')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'mcp'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white/70 text-slate-700 hover:bg-white'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>MCP Servers ({mcpServers.filter((m) => m.status === 'active').length})</span>
            </button>
            <button
              onClick={() => setActiveTab('registries')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'registries'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white/70 text-slate-700 hover:bg-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Top Registries ({REGISTRIES_LIST.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'skills'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white/70 text-slate-700 hover:bg-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Skills ({skills.filter((s) => s.enabled).length})</span>
            </button>
          </div>

          {activeTab === 'mcp' && (
            <div className="relative shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search servers..."
                className="pl-8 pr-3 py-1 text-xs rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 w-36 sm:w-44"
              />
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-3 max-h-[62vh] overflow-y-auto bg-white/60">
          {activeTab === 'mcp' ? (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 flex items-center justify-between">
                <div className="text-xs text-indigo-900 leading-relaxed">
                  <span className="font-bold">⚡ اتصال و دریافت خودکار:</span> قبل از اجرای هر پرامپت، ایجنت به صورت هوشمند اسکیل‌ها و سرورهای موردنیاز فرانت، بک‌اند و دیتابیس را لود می‌کند.
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {['all', 'frontend_ui', 'database', 'tools', 'search', 'devops', 'collaboration'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-slate-800 text-white'
                        : 'bg-white/80 text-slate-600 hover:bg-white border border-slate-200'
                    }`}
                  >
                    {cat.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {filteredMcp.map((server) => (
                  <div
                    key={server.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 shadow-sm ${
                      server.status === 'active'
                        ? 'bg-indigo-50/90 border-indigo-200 shadow-sm'
                        : 'bg-white/80 border-slate-200/80 hover:bg-white'
                    }`}
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{server.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white text-indigo-700 border border-indigo-100">
                          {server.package}
                        </span>
                        <span className="text-[10px] text-amber-600 font-bold ml-auto">{server.rating}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{server.description}</p>
                      <div className="flex items-center gap-2 pt-1 font-mono text-[10px] text-slate-500">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {server.command}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleMcpServer(server.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                        server.status === 'active'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                      }`}
                    >
                      {server.status === 'active' ? '✓ Connected' : '+ Connect'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'registries' ? (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                <div>
                  <h3 className="font-bold text-xs text-slate-900">مستندات، استانداردهای عامل و مخازن مرجع (Agent Skills & Standards)</h3>
                  <p className="text-[11px] text-slate-500">تمامی این گایدلاین‌ها، قوانین کدنویسی و مرجع‌ها قبل از اجرای هر وظیفه آنالیز می‌شوند.</p>
                </div>
                <button
                  onClick={handleSyncRegistries}
                  disabled={isAutoSyncing}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm shrink-0"
                >
                  <Zap className={`w-3.5 h-3.5 ${isAutoSyncing ? 'animate-spin' : ''}`} />
                  <span>{isAutoSyncing ? 'Syncing...' : 'Sync All Standards'}</span>
                </button>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {[
                  { id: 'all', label: 'همه موارد (ALL)' },
                  { id: 'agent_core', label: '۱. هسته مهارت‌های عامل' },
                  { id: 'cursorrules', label: '۲. قوانین توسعه' },
                  { id: 'desktop_hig', label: '۳. سیستم‌عامل و HIG' },
                  { id: 'game_3d', label: '۴. موتور بازی و ۳D' },
                  { id: 'spatial_embedded', label: '۵. محاسبات فضایی و XR' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer whitespace-nowrap ${
                      selectedCategory === cat.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white/80 text-slate-600 hover:bg-white border border-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {REGISTRIES_LIST.filter(
                  (reg) => selectedCategory === 'all' || reg.category === selectedCategory
                ).map((reg) => (
                  <div key={reg.id} className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/90 shadow-sm space-y-2 hover:border-indigo-200 transition">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-slate-900">{reg.name}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${reg.badgeColor}`}>
                          {reg.badge}
                        </span>
                      </div>
                      <a
                        href={reg.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline shrink-0"
                      >
                        <span>مشاهده مخزن</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{reg.desc}</p>
                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                      <span className="truncate max-w-[280px]">URL: <strong className="text-slate-700">{reg.url}</strong></span>
                      <span className="text-indigo-600 font-bold shrink-0">{reg.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 mb-2 leading-relaxed font-medium">
                مهارت‌ها و دستورالعمل‌های شناختی و معماری فعال در کدنویسی:
              </p>

              {skills.map((skill) => (
                <div
                  key={skill.id}
                  onClick={() => toggleSkill(skill.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 shadow-sm ${
                    skill.enabled
                      ? 'bg-blue-50/80 border-blue-300 shadow-md shadow-blue-500/10'
                      : 'bg-white/70 border-white opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-xs text-slate-900">{skill.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-blue-700 border border-blue-100">
                        {skill.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
                      {skill.description}
                    </p>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition ${
                      skill.enabled
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'border-2 border-slate-300 bg-white'
                    }`}
                  >
                    {skill.enabled && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/60 bg-white/40 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>{syncStatusText}</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full coral-pill-btn text-white text-xs font-bold transition cursor-pointer shadow-md"
          >
            Done
          </button>
        </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <AnimatePresence>
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/35 backdrop-blur-xs"
      >
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0.08}
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="w-full max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

