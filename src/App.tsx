import { PreviewModal } from './components/PreviewModal';
import AudioVidoUniversalStudio from './components/AudioVidoUniversalStudio';
import { ProjectTimelineDrawer } from './components/ProjectTimelineDrawer';
import { MediaStudioDrawer } from './components/MediaStudioDrawer';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  AgentMode,
  AgentState,
  Message,
  PreviewArtifact,
  ProjectInfo,
  GitStatus,
  PermissionPolicy,
  AgentConfig,
} from './types';
import { Language, translations, SUPPORTED_LANGUAGES } from './utils/translations';
import { Sidebar } from './components/Sidebar';
import { CodedAiChatCard } from './components/CodedAiChatCard';
import { YodawWorkspace } from './components/YodawWorkspace';
import { YodawBrandMark } from './components/YodawBrandMark';
import { playSoftChimeSound } from './utils/audioNotification';
import { LiveArtifactPreview } from './components/LiveArtifactPreview';
import { AnimatedCodeDrawer } from './components/AnimatedCodeDrawer';
import { TerminalPanel } from './components/TerminalPanel';
import { FileExplorer } from './components/FileExplorer';
import { DiffViewerModal } from './components/DiffViewerModal';
import { FreebuffWorkspacesModal } from './components/FreebuffWorkspacesModal';
import { FreebuffQueueDrawer } from './components/FreebuffQueueDrawer';
import { SkillsModal } from './components/SkillsModal';
import { SettingsModal } from './components/SettingsModal';
import { ProfileModal } from './components/ProfileModal';
import { FuelApiKeyView } from './components/FuelApiKeyView';
import { LanguageSelectorModal } from './components/LanguageSelectorModal';
import { LocalBridgeModal } from './components/LocalBridgeModal';
import { LiquidGlassBackground } from './components/LiquidGlassBackground';
import { SiriLiveSpeakerOverlay } from './components/SiriLiveSpeakerOverlay';
import { YodawMenuDrawer, HistorySession } from './components/YodawMenuDrawer';
import { LiveEmailViewerModal } from './components/LiveEmailViewerModal';
import { McpWebViewModal } from './components/McpWebViewModal';
import { GmailMessageData } from './types';
import { voiceAgent } from './services/voiceAgent';
import {
  Sparkles,
  Globe,
  Settings as SettingsIcon,
  User,
  Fuel,
  Terminal as TerminalIcon,
  Bot,
  Menu,
} from 'lucide-react';

export default function App() {
  // Core App State
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('codgar_lang') as Language) || 'fa';
  });
  const t = translations[language] || translations.en;
  const isFa = language === 'fa';
  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isSpace2Active, setIsSpace2Active] = useState<boolean>(true);
  const [space2Messages, setSpace2Messages] = useState<Message[]>([]);
  const [space2InputText, setSpace2InputText] = useState<string>('');
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [agentState, setAgentState] = useState<AgentState>('idle');
  const [activeWorker, setActiveWorker] = useState<'coder' | 'writer' | null>(null);

  // Persistent Chat Sessions History
  const [chatSessions, setChatSessions] = useState<HistorySession[]>(() => {
    try {
      const saved = localStorage.getItem('yodaw_chat_sessions');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return [
      {
        id: 'sess-1',
        title: 'طراحی رابط کاربری شیشه‌ای لوکس برای کدگر',
        timestamp: Date.now() - 1000 * 60 * 35,
        preview: 'پیاده‌سازی حباب‌های ۳ بعدی و کپسول‌های تعاملی...',
        category: 'html',
        messages: [
          { id: 'm1', role: 'user', content: 'طراحی رابط کاربری شیشه‌ای لوکس برای کدگر', timestamp: Date.now() - 1000 * 60 * 35 },
          { id: 'm2', role: 'agent', content: 'رابط کاربری با ساختار شیشه‌ای ۳ بعدی و افکت‌های نوری با موفقیت آماده شد.', timestamp: Date.now() - 1000 * 60 * 34 },
        ],
      },
      {
        id: 'sess-2',
        title: 'تولید تصویر هنری روبات سایبرپانک یودا',
        timestamp: Date.now() - 1000 * 60 * 60 * 4,
        preview: 'تصویر پرتره با کیفیت سینمایی ۴K از هوش مصنوعی...',
        category: 'image',
        messages: [
          { id: 'm3', role: 'user', content: 'تولید تصویر هنری روبات سایبرپانک', timestamp: Date.now() - 1000 * 60 * 60 * 4 },
          { id: 'm4', role: 'agent', content: 'تصویر اختصاصی با پالت نوری نئونی و رزولوشن بالا خلق شد.', timestamp: Date.now() - 1000 * 60 * 60 * 4 },
        ],
      },
    ];
  });

  // Save chatSessions to localStorage
  useEffect(() => {
    // 🎯 کلید Enter برای اجرای مستقیم دکمه Launch in Yodaw
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        const target = e.target as HTMLElement;
        if (target && (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT')) {
          // اگر داخل مدال یا بخش پرامپت بود، دکمه Launch را پیدا و کلیک کن
          const modal = target.closest('div[role="dialog"], div.fixed, div.absolute, div');
          if (modal) {
            const btns = Array.from(modal.querySelectorAll('button'));
            const launchBtn = btns.find(b => b.textContent && (b.textContent.includes('Launch in') || b.textContent.includes('Launch') || b.textContent.includes('لانچ')));
            if (launchBtn) {
              e.preventDefault();
              (launchBtn as HTMLButtonElement).click();
            }
          }
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);

    try {
      localStorage.setItem('yodaw_chat_sessions', JSON.stringify(chatSessions));
    } catch {}
  }, [chatSessions]);

  // Robust New Chat Handler with automatic archiving of current conversation
  const handleStartNewChatSession = () => {
    const activeMsgs = isSpace2Active ? space2Messages : messages;
    const validMsgs = activeMsgs.filter((m) => m.id !== 'msg-welcome-yodaw');

    if (validMsgs.length > 0) {
      const firstUserMsg = validMsgs.find((m) => m.role === 'user');
      const firstAgentMsg = validMsgs.find((m) => m.role === 'agent');
      const title = firstUserMsg ? firstUserMsg.content.slice(0, 42) : (isFa ? 'گفتگوی قبلی' : 'Previous Chat');
      const preview = firstAgentMsg ? firstAgentMsg.content.slice(0, 95) : (firstUserMsg?.content.slice(0, 95) || '');

      const newSession: HistorySession = {
        id: `sess-${Date.now()}`,
        title,
        timestamp: Date.now(),
        preview,
        category: 'chat',
        messages: [...validMsgs],
      };

      setChatSessions((prev) => [newSession, ...prev.filter((s) => s.id !== newSession.id)]);
    }

    // Reset current conversation cleanly
    setSpace2Messages([]);
    setMessages([]);
    setSpace2InputText('');
    setInputText('');
    setIsExecuting(false);
    setWasStopped(false);
  };

  // Active Artifact for Live Preview
  const [activeArtifact, setActiveArtifact] = useState<PreviewArtifact | null>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsPreviewOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    const handleGlobalEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setIsPreviewOpen(false); };
    window.addEventListener("keydown", handleGlobalEsc);
    return () => window.removeEventListener("keydown", handleGlobalEsc);
  }, []);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  // System & Workspace Data
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);

  // Modals & Panels State
  const [isFuelActive, setIsFuelActive] = useState<boolean>(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false);
  const [isFileExplorerOpen, setIsFileExplorerOpen] = useState<boolean>(false);
  const [isCodeDrawerOpen, setIsCodeDrawerOpen] = useState<boolean>(false);
  const [codeDrawerTab, setCodeDrawerTab] = useState<'editor' | 'terminal' | 'files' | 'agents'>('editor');
  const [isDiffOpen, setIsDiffOpen] = useState<boolean>(false);
  const [isWorkspacesOpen, setIsWorkspacesOpen] = useState<boolean>(false);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [isSkillsOpen, setIsSkillsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState<boolean>(false);
  const [isLocalBridgeOpen, setIsLocalBridgeOpen] = useState<boolean>(false);
  const [isEmailViewerOpen, setIsEmailViewerOpen] = useState<boolean>(false);
  const [selectedEmailForModal, setSelectedEmailForModal] = useState<GmailMessageData | null>(null);
  const [isMcpWebViewOpen, setIsMcpWebViewOpen] = useState<boolean>(false);
  const [mcpWebViewTitle, setMcpWebViewTitle] = useState<string>('Gmail & Google Workspace MCP');
  const [mcpWebViewUrl, setMcpWebViewUrl] = useState<string>('https://mail.google.com/mail/u/0/#inbox');

  // Voice Engine State
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [siriVisualActive, setSiriVisualActive] = useState<boolean>(false);

  // Toggle helper for Live Preview: if artifact is null, create a stylish live demo artifact
  const toggleLivePreview = () => {
    if (isPreviewOpen) {
      setIsPreviewOpen(false);
    } else {
      if (!activeArtifact) {
        setActiveArtifact({
          id: `art-live-${Date.now()}`,
          title: isFa ? 'برنامه واکنش‌گرا و مدرن کدگر' : 'Codgar Live Interactive Workspace',
          type: 'react',
          language: 'react',
          code: `import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState('Active');
  const [items, setItems] = useState([
    { id: 1, name: 'AI Core Engine', ready: true },
    { id: 2, name: 'Live Sandbox Compiler', ready: true },
    { id: 3, name: 'Terminal Execution Pipeline', ready: true },
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              ⚡
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">Codgar Sandbox Live</h2>
              <p className="text-xs text-emerald-400 font-mono">Status: {status}</p>
            </div>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-blue-950 text-blue-400 border border-blue-800/60">
            React 18 + Tailwind
          </span>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Interactive Click Counter</p>
              <h3 className="text-2xl font-black text-white font-mono">{count}</h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCount(c => c - 1)}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition flex items-center justify-center"
              >
                -
              </button>
              <button
                onClick={() => setCount(c => c + 1)}
                className="px-4 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition flex items-center justify-center shadow-md shadow-blue-600/30"
              >
                +
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <p className="text-xs text-slate-400 mb-2 font-mono">Workspace Pipeline Checks</p>
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/40 last:border-0">
                  <span className="text-slate-300">{item.name}</span>
                  <span className="text-emerald-400 font-mono font-bold">✓ READY</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}`,
          timestamp: Date.now(),
        });
      }
      setIsPreviewOpen(true);
    }
  };

  // Permission & Agent Config
  const [policy, setPolicy] = useState<PermissionPolicy>({
    requireApprovalForCommands: false,
    requireApprovalForFileWrite: false,
    requireApprovalForGitCommit: false,
    allowedCommands: ['npm', 'node', 'python3', 'git', 'ls', 'cat', 'cargo', 'go'],
  });

  const [agentConfig, setAgentConfig] = useState<AgentConfig>({
    model: 'gemini-2.5-flash',
    temperature: 0.3,
    maxOutputTokens: 8192,
    systemPromptAdditions: '',
    autoCompactContext: true,
    bashTimeoutSeconds: 30,
    verboseTelemetry: true,
    soundtrackAutoPlay: false,
    typewriterSpeed: 5,
  });

  // System & Workspace Data Fetcher
  const refreshWorkspaceData = useCallback(async () => {
    try {
      const [projRes, gitRes] = await Promise.all([
        fetch('/api/project/info'),
        fetch('/api/git/status'),
      ]);
      const projData = await projRes.json();
      const gitData = await gitRes.json();
      if (projData.success) setProjectInfo(projData.info);
      if (gitData.success) setGitStatus(gitData);
    } catch (err) {
      console.warn('Workspace sync note:', err);
    }
  }, []);

  const getLocalizedWelcome = (lang: Language): string => {
    switch (lang) {
      case 'fa':
        return `سلام! من **کدگر** هستم؛ دستیار هوشمند برنامه‌نویسی شما.\n\nچه پروژه یا فیچری مد نظرتان است؟ درخواست خود را بنویسید یا با دکمه ضبط صدا بیان کنید تا آماده شود.`;
      case 'es':
        return `¡Hola! Soy **Codgar**, tu asistente de programación inteligente.\n\n¿Qué proyecto o función te gustaría desarrollar hoy? Escribe tu solicitud o háblala para comenzar.`;
      case 'fr':
        return `Bonjour ! Je suis **Codgar**, votre assistant de programmation intelligent.\n\nQuel projet ou fonctionnalité souhaitez-vous concevoir aujourd'hui ? Écrivez votre demande ou énoncez-la pour commencer.`;
      case 'ru':
        return `Привет! Я **Codgar**, ваш интеллектуальный помощник по программированию.\n\nКакой проект или функционал вы хотите разработать сегодня? Напишите запрос или продиктуйте его голосом.`;
      case 'zh':
        return `你好！我是 **Codgar**，您的智能编程助手。\n\n今天您想构建或开发什么项目？请在下方输入您的需求或使用语音录音开始。`;
      case 'hi':
        return `नमस्ते! मैं **Codgar** हूँ, आपका बुद्धिमान कोडिंग सहायक।\n\nआज आप कौन सा प्रोजेक्ट या फीचर बनाना चाहते हैं? अपना अनुरोध लिखें یا माइक से बोलें।`;
      case 'pt':
        return `Olá! Eu sou o **Codgar**, seu assistente de programação inteligente.\n\nQual projeto ou funcionalidade você gostaria de construir hoje? Digite sua solicitação ou fale para começar.`;
      case 'en':
      default:
        return `Hello! I am **Codgar**, your intelligent coding assistant.\n\nWhat would you like to build or work on today? Type your request or speak to get started.`;
    }
  };

  const getLocalizedYodawWelcome = (lang: Language): string => {
    switch (lang) {
      case 'fa':
        return 'سلام و درود! به درگاه پذیرش و استودیو هوشمند **یودا (YODAW)** خوش آمدید. ما ۴ سرویس اصلی برای شما آماده کرده‌ایم: ۱. تولید عکس ۲. تولید فیلم ۳. تولید سایت اچ‌تی‌ام‌ال ۴. سرویس کدزنی. با کلیک بر روی هر دایره یا تایپ درخواست، در خدمت شما هستیم!';
      case 'es':
        return '¡Bienvenido a **YODAW Concierge & Studio**! Ofrecemos 4 capacidades principales: 1. Generación de imágenes 2. Creación de videos 3. Diseño web HTML 4. Servicio de codificación autónomo. ¡Seleccione una esfera o escriba para comenzar!';
      case 'fr':
        return "Bienvenue sur **YODAW Concierge & Studio**. Nous proposons 4 capacités principales : 1. Génération d'images 2. Création de vidéos 3. Conception de sites HTML 4. Service de codage autonome. Sélectionnez une sphère ou écrivez pour commencer !";
      case 'ru':
        return 'Добро пожаловать в **YODAW Concierge & Studio**. Мы предлагаем 4 ключевые возможности: 1. Генерация изображений 2. Создание видео 3. Создание сайтов на HTML 4. Автономный сервис кодинга. Выберите сферу или напишите запрос!';
      case 'zh':
        return '欢迎来到 **YODAW Concierge & Studio**。我们提供 4 大核心能力：1. 图像生成 2. 视频生成 3. HTML 网站构建 4. 自主编程服务。点击上方任一球体或输入需求即可开始！';
      case 'hi':
        return '**YODAW Concierge & Studio** में आपका स्वागत है। हम 4 मुख्य क्षमताएं प्रदान करते हैं: 1. इमेज जेनरेशन 2. वीडियो निर्माण 3. HTML वेबसाइट निर्माण 4. ऑटोनॉमस कोडिंग सेवा। प्रारंभ करने के लिए कोई भी गोला चुनें या टाइप करें!';
      case 'pt':
        return 'Bem-vindo ao **YODAW Concierge & Studio**. Oferecemos 4 recursos principais: 1. Geração de imagens 2. Geração de vídeo 3. Criação de sites HTML 4. Serviço de codificação autônomo. Selecione uma esfera ou digite para começar!';
      case 'en':
      default:
        return 'Welcome to **YODAW Concierge & Studio**. We provide 4 core capabilities: 1. Image Generation 2. Video Generation 3. HTML Website Creation 4. Autonomous Coding Service. Select any sphere above or type your prompt to begin!';
    }
  };

  // Real-Time Chat Translation State & Instant Bidirectional Memory Cache
  const [isTranslatingHistory, setIsTranslatingHistory] = useState(false);
  const translationMemoryRef = useRef<Map<string, Record<string, string>>>(new Map());

  // Save Language Preference & Translate Existing Chat History in Place Across Both Workspaces
  const handleSelectLanguage = async (newLang: Language) => {
    if (newLang === language) return;
    setLanguage(newLang);
    localStorage.setItem('codgar_lang', newLang);

    // Instant Dictionary for common bot messages & system templates (0ms latency switch)
    const getFastTemplateMatch = (content: string, target: Language): string | null => {
      if (!content) return null;
      if (/حیطه (انجام )?وظایف|outside (the )?scope of my duties/i.test(content)) {
        return target === 'fa'
          ? `این دستور در حیطه انجام وظایف من نیست و برای این کار طراحی نشده‌ام.\n\nمن به عنوان دستیار تخصصی برنامه‌نویسی و معمار نرم‌افزار **کُدگر (CODGAR)**، برای تولید کد، طراحی سایت، ساخت اپلیکیشن و حل چالش‌های فنی در خدمت شما هستم.`
          : `This request is outside the scope of my duties and I am not designed for this type of task.\n\nAs the **Codgar** AI software architect and coding assistant, I am exclusively designed for software development, web engineering, and technical problem solving.`;
      }
      if (/های! 👋|Hi there! 👋/i.test(content) && /معمار نرم‌افزار|software architect/i.test(content)) {
        return target === 'fa'
          ? 'های! 👋 درود بر شما، من **کُدگر (Codgar)** هستم؛ معمار نرم‌افزار و دستیار هوشمند شما. چطور می‌توانم در پروژه‌ها و برنامه‌نویسی کمکتان کنم؟'
          : 'Hi there! 👋 I am **Codgar**, your AI software architect and coding assistant. How can I assist you with your projects today?';
      }
      if (/سلام و درود! 👋|Hello and greetings! 👋/i.test(content) && /حالم بسیار عالی است|doing great/i.test(content)) {
        return target === 'fa'
          ? 'سلام و درود! 👋 من **کُدگر (Codgar)** هستم؛ دستیار هوشمند برنامه‌نویسی و معمار نرم‌افزار شما. حالم بسیار عالی است و پرانرژی در خدمت شما قرار دارم.\n\nمن می‌توانم در ساخت وب‌سایت‌ها، اپلیکیشن‌ها، طراحی رابط کاربری (UI/UX)، رفع باگ‌ها و اجرای پروژه‌ها در کنارتان باشم. امروز چه کمکی از دست من برای شما برمی‌آید یا چه پروژه‌ای مد نظرتان است؟'
          : 'Hello and greetings! 👋 I am **Codgar**, your AI software architect and coding companion. I am doing great and ready to assist you.\n\nI can help design and build websites, fullstack apps, UI/UX components, and fix code. What would you like to build or work on today?';
      }
      if (/من \*\*کُدگر \(Codgar\)\*\* هستم|My name is \*\*Codgar\*\*/i.test(content) && /وظیفه من تحلیل فنی|specialized AI software/i.test(content)) {
        return target === 'fa'
          ? 'من **کُدگر (Codgar)** هستم؛ دستیار هوشمند و تخصصی برنامه‌نویسی و معماری نرم‌افزار. وظیفه من تحلیل فنی، طراحی و پیاده‌سازی خودکار وب‌سایت‌ها، اپلیکیشن‌ها، اسکریپت‌ها و حل چالش‌های کدنویسی است. چه پروژه‌ای مد نظرتان است تا با هم پیش ببریم؟'
          : 'My name is **Codgar**, your specialized AI software engineer and architect. I help analyze, design, and implement web applications, APIs, UI/UX, and scripts. How can I help you today?';
      }
      if (/خواهش می‌کنم! انجام وظیفه است|You are very welcome!/i.test(content)) {
        return target === 'fa'
          ? 'خواهش می‌کنم! انجام وظیفه است. اگر بخش دیگری از کدها یا پروژه نیاز به توسعه یا بازبینی دارد، با کمال میل در خدمتم.'
          : 'You are very welcome! If there is anything else in your codebase or project you need help with, I am here.';
      }
      if (/سلامت و پاینده باشید|Thank you so much! Wishing you/i.test(content)) {
        return target === 'fa'
          ? 'سلامت و پاینده باشید! ممنون از محبت و انرژی مثبتتان. در آمادگی کامل برای پیشبرد پروژه‌ها در کنارتان هستم.'
          : 'Thank you so much! Wishing you a productive and creative day ahead.';
      }
      if (/پیام شما را دریافت کردم|I received your message/i.test(content)) {
        return target === 'fa'
          ? 'پیام شما را دریافت کردم! در حالت چت سریع آماده گفتگو و پاسخگویی به هر سوالی هستم. بفرمایید چطور می‌توانم کمکتان کنم؟'
          : 'I received your message! In Fast Chat mode, I am ready to converse and assist you. How can I help you?';
      }
      if (/اتصال فعال است و آماده کدنویسی|ready to code and build/i.test(content)) {
        return target === 'fa'
          ? 'درود! درخواست شما دریافت شد. اتصال فعال است و آماده کدنویسی و پیاده‌سازی پروژه هستم. چه برنامه‌ای مدنظرتان است؟'
          : 'Hello! Your request was received and I am ready to code and build your application. What would you like to build?';
      }
      return null;
    };

    // 1. Immediately swap localized welcome banners synchronously
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === 'msg-welcome') {
          const wel = getLocalizedWelcome(newLang);
          return { ...m, content: wel, text: wel };
        }
        return m;
      })
    );

    setSpace2Messages((prev) =>
      prev.map((m) => {
        if (m.id === 'msg-welcome-yodaw') {
          const wel = getLocalizedYodawWelcome(newLang);
          return { ...m, content: wel, text: wel };
        }
        return m;
      })
    );

    // 2. Instant Memory Cache Check & Fast Template Match (0ms latency)
    const mem = translationMemoryRef.current;
    const applyImmediateTranslations = (msgList: Message[]) =>
      msgList.map((m) => {
        // Save original in cache if not yet cached
        const cached = mem.get(m.id) || {};
        if (!cached[language]) {
          cached[language] = m.content || m.text || '';
          mem.set(m.id, cached);
        }

        if (cached && cached[newLang]) {
          return { ...m, content: cached[newLang], text: cached[newLang] };
        }

        const template = getFastTemplateMatch(m.content || m.text || '', newLang);
        if (template) {
          cached[newLang] = template;
          mem.set(m.id, cached);
          return { ...m, content: template, text: template };
        }

        return m;
      });

    setMessages((prev) => applyImmediateTranslations(prev));
    setSpace2Messages((prev) => applyImmediateTranslations(prev));

    // 3. Collect all remaining user and assistant messages that need dynamic translation
    const allMessages = [...messages, ...space2Messages].filter(
      (m) => m.id !== 'msg-welcome' && m.id !== 'msg-welcome-yodaw'
    );

    const pendingToTranslate = allMessages.filter((m) => {
      const cached = mem.get(m.id);
      return (!cached || !cached[newLang]) && !getFastTemplateMatch(m.content || m.text || '', newLang);
    });

    if (pendingToTranslate.length === 0) return;

    // 4. Translate remaining messages in place without losing history or deleting cards
    setIsTranslatingHistory(true);
    try {
      const res = await fetch('/api/translate/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: pendingToTranslate.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content || m.text || '',
          })),
          targetLanguage: newLang,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.translatedMessages) && data.translatedMessages.length > 0) {
        const transMap = new Map<string, string>();
        data.translatedMessages.forEach((tm: any) => {
          if (tm.id && typeof tm.content === 'string') {
            transMap.set(String(tm.id), tm.content);
            // Save to persistent translation cache
            const existing = mem.get(String(tm.id)) || {};
            existing[newLang] = tm.content;
            mem.set(String(tm.id), existing);
          }
        });

        // Update Codgar chat messages
        setMessages((prev) =>
          prev.map((m) => {
            if (transMap.has(m.id)) {
              const trans = transMap.get(m.id)!;
              return { ...m, content: trans, text: trans };
            }
            return m;
          })
        );

        // Update Yodaw Studio workspace messages
        setSpace2Messages((prev) =>
          prev.map((m) => {
            if (transMap.has(m.id)) {
              const trans = transMap.get(m.id)!;
              return { ...m, content: trans, text: trans };
            }
            return m;
          })
        );
      }
    } catch (translateErr) {
      console.warn('Chat translation note:', translateErr);
    } finally {
      setIsTranslatingHistory(false);
    }
  };

  // Initial Data Fetching & Welcome Message (only on mount)
  useEffect(() => {
    refreshWorkspaceData();
    setMessages((prev) => {
      if (prev.length === 0) {
        return [
          {
            id: 'msg-welcome',
            role: 'agent',
            content: getLocalizedWelcome(language),
            timestamp: Date.now(),
          },
        ];
      }
      return prev;
    });

    setSpace2Messages((prev) => {
      if (prev.length === 0) {
        return [
          {
            id: 'msg-welcome-yodaw',
            role: 'agent',
            content: getLocalizedYodawWelcome(language),
            timestamp: Date.now(),
          },
        ];
      }
      return prev;
    });
  }, [refreshWorkspaceData, language]);

  // Active messages updater: sends responses to whichever space is currently active
  const updateActiveMessages = useCallback(
    (updater: (prev: Message[]) => Message[]) => {
      if (isSpace2Active) {
        setSpace2Messages(updater);
      } else {
        setMessages(updater);
      }
    },
    [isSpace2Active]
  );

  // Quick client-side check to detect coding intent for immediate UI feedback
  const [activeTaskIntent, setActiveTaskIntent] = useState<'chat' | 'coding'>('chat');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine ?? true);
  const [wasStopped, setWasStopped] = useState(false);
  const [lastSavedCheckpoint, setLastSavedCheckpoint] = useState<{
    originalPrompt: string;
    pendingCodingPrompt?: string;
    lastCode: string;
    timestamp: number;
  } | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const currentRunningTaskRef = useRef<{
    text: string;
    approvedCoding?: boolean;
    pendingCodingPrompt?: string;
    requestedMode?: AgentMode;
  } | null>(null);

  // Stop generation / execution handler
  const handleStopExecution = useCallback((reason: 'user' | 'offline' = 'user') => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsExecuting(false);
    setAgentState('idle');
    setActiveWorker(null);
    setWasStopped(true);

    if (currentRunningTaskRef.current) {
      const origPrompt =
        currentRunningTaskRef.current.pendingCodingPrompt ||
        currentRunningTaskRef.current.text ||
        '';
      setLastSavedCheckpoint({
        originalPrompt: origPrompt,
        pendingCodingPrompt: currentRunningTaskRef.current.pendingCodingPrompt,
        lastCode: activeArtifact?.code || '',
        timestamp: Date.now(),
      });
    }

    updateActiveMessages((prev) => [
      ...prev,
      {
        id: `msg-stop-${Date.now()}`,
        role: 'agent',
        content: isFa
          ? reason === 'offline'
            ? '⚠️ **ارتباط اینترنت قطع شد!** وضعیت کدها و پروژه تا این لحظه کاملاً ذخیره و محفوظ ماند. به محض اتصال مجدد به اینترنت، روی دکمه **«ادامه دادن (Continue)»** کلیک کنید تا کدیار دقیقاً از همان خط کدنویسی را ادامه دهد.'
            : '⏹️ **فرایند توسط شما متوقف شد.** وضعیت کدهای فعلی ذخیره گردید. هر زمان آماده بودید روی دکمه **«ادامه دادن پاسخ (Continue)»** کلیک کنید تا کدیار کارهای باقیمانده را دقیقاً از همین نقطه تکمیل کند.'
          : reason === 'offline'
          ? '⚠️ **Internet connection lost!** Code checkpoint has been safely stored. Click **Continue** once reconnected to resume seamlessly.'
          : '⏹️ **Generation stopped.** Code checkpoint saved. Click **Continue Generation** whenever you are ready to resume.',
        timestamp: Date.now(),
      },
    ]);
  }, [activeArtifact, isFa, updateActiveMessages]);

  // Network Offline / Online Lifecycle Listeners
  useEffect(() => {
    const onOffline = () => {
      setIsOnline(false);
      if (isExecuting) {
        handleStopExecution('offline');
      } else {
        setWasStopped(true);
      }
    };

    const onOnline = () => {
      setIsOnline(true);
    };

    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);

    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, [isExecuting, handleStopExecution]);

  // Handle Send Message to AI Agent
  const handleSendMessage = async (
    text: string,
    options?: {
      mode?: AgentMode;
      approvedCoding?: boolean;
      pendingCodingPrompt?: string;
      isResume?: boolean;
      resumeContext?: { originalPrompt: string; lastCode: string };
    } | AgentMode
  ) => {
    if (!text.trim() || isExecuting) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortCtrl = new AbortController();
    abortControllerRef.current = abortCtrl;

    const approvedCoding = typeof options === 'object' && options !== null ? Boolean(options.approvedCoding) : false;
    const pendingCodingPrompt = typeof options === 'object' && options !== null ? options.pendingCodingPrompt : undefined;
    const isResume = typeof options === 'object' && options !== null ? Boolean(options.isResume) : false;
    const resumeContext = typeof options === 'object' && options !== null ? options.resumeContext : undefined;
    const requestedMode = typeof options === 'string' ? options : (options?.mode || 'agent');

    // Intent detection: only considered a confirmed coding prompt if explicitly approved by user, resumed, or in formal dev modes
    const isCodingPrompt = approvedCoding || isResume || requestedMode === 'plan' || requestedMode === 'review' || requestedMode === 'debug';

    setActiveTaskIntent(isCodingPrompt ? 'coding' : 'chat');
    setWasStopped(false);

    currentRunningTaskRef.current = {
      text,
      approvedCoding: approvedCoding || isResume,
      pendingCodingPrompt: pendingCodingPrompt || lastSavedCheckpoint?.pendingCodingPrompt,
      requestedMode,
    };

    const userMsg: Message = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      isCodingTask: isCodingPrompt,
      taskType: isCodingPrompt ? 'coding' : 'chat',
    };

    const isEmailQuery = /(ایمیل|جیمیل|صندوق|inbox|email|gmail|ایمیلم|ایمیل‌های|ایمیل های|ایمیل اخیر|آخرین ایمیل|پیام‌ها|پیام هام|نامه هام|نامه‌ها|نامه‌هام|آخرین پیام|خوندن ایمیل|بخون ایمیلم)/i.test(text);
    const isMcpConnectorQuery = isEmailQuery || /(گیت‌هاب|دیتابیس|آنریل|تایید اتصال|ام‌سی‌پی|mcp)/i.test(text);

    if (isMcpConnectorQuery && !isCodingPrompt) {
      setMcpWebViewTitle(isEmailQuery ? 'Gmail & Google Workspace MCP' : 'MCP Connector Automation Hub');
      setMcpWebViewUrl(isEmailQuery ? 'https://mail.google.com/mail/u/0/#inbox' : 'https://mcp.protocol.io/dashboard');
      setIsMcpWebViewOpen(true);

      updateActiveMessages((prev) => [...prev, userMsg]);
      setIsExecuting(false);
      return;
    }

    updateActiveMessages((prev) => [...prev, userMsg]);
    setIsExecuting(true);
    setAgentState(isCodingPrompt ? 'planning' : 'writing');
    setActiveWorker(isCodingPrompt ? 'coder' : 'writer');

    try {
      const activeHistory = (isSpace2Active ? space2Messages : messages).slice(-10);
      const response = await fetch('/api/agent/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortCtrl.signal,
        body: JSON.stringify({
          prompt: text,
          language,
          mode: requestedMode,
          approvedCoding: approvedCoding || isResume,
          pendingCodingPrompt: pendingCodingPrompt || lastSavedCheckpoint?.pendingCodingPrompt,
          isResume,
          resumeContext: resumeContext || (lastSavedCheckpoint ? {
            originalPrompt: lastSavedCheckpoint.originalPrompt,
            lastCode: lastSavedCheckpoint.lastCode,
          } : undefined),
          history: activeHistory,
        }),
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch (parseErr: any) {
        if (abortCtrl.signal.aborted) return;
        const rawText = await response.text().catch(() => '');
        throw new Error(rawText || `Server returned invalid response (status ${response.status})`);
      }

      if (data && data.success) {
        setAgentState('writing');
        const responseContent =
          data.text ||
          data.response ||
          (typeof data.message === 'string' ? data.message : data.message?.content || data.message?.text) ||
          '';

        const assistantMsg: Message = {
          id: `msg-asst-${Date.now()}`,
          role: 'agent',
          content: responseContent,
          timestamp: Date.now(),
          isCodingTask: data.isCodingTask !== undefined ? data.isCodingTask : isCodingPrompt,
          taskType: data.taskType || (isCodingPrompt ? 'coding' : 'chat'),
          requiresCodingPermission: Boolean(data.requiresCodingPermission),
          pendingCodingPrompt: data.pendingCodingPrompt || text,
          emailData: data.emailData,
        };

        updateActiveMessages((prev) => [...prev, assistantMsg]);
        playSoftChimeSound();

        // If backend returned an artifact, update active artifact and automatically open the preview modal
        // Robust Artifact Bridge: Handle explicit data.artifact OR extract code blocks from assistant response
        let resolvedArtifact = data.artifact;

        if (!resolvedArtifact) {
          const rawContent = data.response || data.message || assistantMsg.content || '';
          const codeMatch = rawContent.match(/```(?:tsx|jsx|typescript|javascript|react|html)?\s*([\s\S]*?)```/);
          
          if (codeMatch && codeMatch[1]) {
            resolvedArtifact = {
              id: `art-${Date.now()}`,
              title: 'AI Generated Component',
              type: 'react',
              language: 'react',
              code: codeMatch[1].trim()
            };
          } else if (rawContent.includes('export default function') || rawContent.includes('import React')) {
            resolvedArtifact = {
              id: `art-${Date.now()}`,
              title: 'AI Generated Component',
              type: 'react',
              language: 'react',
              code: rawContent.trim()
            };
          }
        }

        if (resolvedArtifact) {
          setActiveArtifact(resolvedArtifact);
          setIsPreviewOpen(true);
        }

        setAgentState('completed');
        refreshWorkspaceData();
      } else {
        if (!abortCtrl.signal.aborted) {
          throw new Error(data?.error || 'Execution failed');
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError' || abortCtrl.signal.aborted) {
        // User aborted intentionally or network offline handled
        return;
      }
      console.error('Agent execution error:', err);
      setAgentState('failed');
      updateActiveMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          role: 'agent',
          content: isFa
            ? `⚠️ خطا در اجرای فرمان: ${err.message || 'مشکل ارتباطی با سرور'}`
            : `⚠️ Execution error: ${err.message || 'Server connection failed'}`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      if (abortControllerRef.current === abortCtrl) {
        abortControllerRef.current = null;
      }
      setIsExecuting(false);
      setTimeout(() => {
        setAgentState('idle');
        setActiveWorker(null);
      }, 600);
    }
  };

  // Dedicated Resume / Continue Handler
  const handleResumeExecution = () => {
    const resumePrompt = isFa
      ? 'لطفاً ادامه کار قبلی را از سر بگیر و کدهایی که متوقف شده بود را کامل کن.'
      : 'Please continue where you left off and complete the unfinished code.';

    const origPrompt =
      lastSavedCheckpoint?.originalPrompt ||
      currentRunningTaskRef.current?.pendingCodingPrompt ||
      currentRunningTaskRef.current?.text ||
      (isFa ? 'توسعه و پیاده‌سازی پروژه نرم‌افزاری' : 'Software project development and implementation');

    const lastCode = lastSavedCheckpoint?.lastCode || activeArtifact?.code || '';

    handleSendMessage(resumePrompt, {
      mode: 'agent',
      approvedCoding: true,
      isResume: true,
      resumeContext: {
        originalPrompt: origPrompt,
        lastCode: lastCode,
      },
    });
  };

  // Voice Recognition Handler
  const toggleVoiceRecording = () => {
    if (siriVisualActive) {
      voiceAgent.stopListening();
      setIsRecordingVoice(false);
      setSiriVisualActive(false);
    } else {
      setIsRecordingVoice(true);
      setSiriVisualActive(true);
    }
  };

  return (
    <div
      dir={isFa ? 'rtl' : 'ltr'}
      className="relative h-screen max-h-screen h-[100dvh] max-h-[100dvh] w-full text-slate-800 flex flex-col font-sans overflow-hidden select-none"
    >
      {/* Dynamic Visual Canvas Background */}
      <LiquidGlassBackground />

      {/* Top Application Bar (Luxury Ice-Blue Liquid Glass Floating Island Pod - Always Fixed at Top, Invariant LTR Layout) */}
      <div className="sticky top-0 inset-x-0 pt-2 sm:pt-2.5 px-2.5 sm:px-4 md:px-6 z-50 shrink-0" dir="ltr">
        <header
          className="relative py-1.5 sm:py-2 px-3 sm:px-4.5 min-h-[50px] sm:min-h-[56px] bg-gradient-to-r from-sky-100/80 via-blue-50/90 to-indigo-100/70 backdrop-blur-3xl border border-white/95 rounded-full shadow-[0_10px_35px_rgba(37,99,235,0.09),0_2px_8px_rgba(15,23,42,0.04),inset_0_1.5px_2px_rgba(255,255,255,0.95),inset_0_-1px_2px_rgba(37,99,235,0.06)] flex items-center justify-between transition-all"
          dir="ltr"
        >
          {/* Optical Glass Specular Top Highlight perfectly matching the rounded-full arc */}
          <div className="absolute top-0 inset-x-10 sm:inset-x-20 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none rounded-full" />

        {/* Far-Left Brand: Polished round Yoda icon & invariant typography */}
        <div className="flex items-center gap-1.5 sm:gap-2 z-20 select-none cursor-pointer pl-0.5 sm:pl-1" dir="ltr">
          {/* Glossy 3D Round Badge: Robot with 3 Dots for YODAW, Terminal for CODGAR */}
          <div
            className={`relative w-9.5 h-9.5 sm:w-11 sm:h-11 rounded-full p-[1.5px] border border-white/95 transition-all duration-500 hover:scale-105 active:scale-95 shrink-0 shadow-[0_3px_12px_rgba(37,99,235,0.28)] ${
              isExecuting
                ? 'animate-codgar-thinking'
                : isSpace2Active
                ? 'bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500'
                : 'bg-gradient-to-tr from-indigo-600 via-blue-500 to-slate-700'
            }`}
          >
            <div className={`w-full h-full rounded-full flex flex-col items-center justify-center gap-0.5 relative overflow-hidden pt-0.5 shadow-inner ${
              isSpace2Active
                ? 'bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 text-white'
                : 'bg-white text-indigo-600'
            }`}>
              {/* Subtle 3D Top Bevel Specular Glare */}
              <div className="absolute top-0 inset-x-2 h-[35%] rounded-full bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

              {isSpace2Active ? (
                <>
                  <Bot
                    className={`w-4.5 h-4.5 sm:w-5 sm:h-5 text-white drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.35)] relative z-10 ${
                      isExecuting ? 'animate-codgar-icon' : ''
                    }`}
                  />
                  {/* 3 Micro Fluid Dots Under Bot: Pale Sky Blue, Pure White, Tangible Pink */}
                  <div className="flex items-center gap-0.5 pb-0.5 relative z-10 mt-0.5">
                    <span className="w-1 h-1 rounded-full bg-[#38bdf8] shadow-[0_0_3px_#38bdf8]" title="Sky Blue" />
                    <span className="w-1 h-1 rounded-full bg-white shadow-[0_0_3px_#ffffff]" title="White" />
                    <span className="w-1 h-1 rounded-full bg-[#f472b6] shadow-[0_0_3px_#f472b6]" title="Pink" />
                  </div>
                </>
              ) : (
                <TerminalIcon
                  className={`w-4.5 h-4.5 sm:w-5 sm:h-5 text-indigo-600 drop-shadow-[0_1px_2px_rgba(79,70,229,0.3)] transition-all duration-700 relative z-10 ${
                    isExecuting ? 'animate-codgar-icon' : ''
                  }`}
                />
              )}
            </div>
          </div>

          {/* YODAW Title: English Logo Permanent and Symmetrical */}
          <div className="flex items-center" dir="ltr">
            <h1 className="leading-none flex items-center">
              {isSpace2Active ? (
                <YodawBrandMark isFa={false} showPersianBadge={false} />
              ) : (
                <span className="codgar-3d-latin-logo select-none text-lg sm:text-xl">
                  CODGAR
                </span>
              )}
            </h1>
          </div>

          {/* If in full CODGAR mode, show quick Back to YODAW button */}
          {!isSpace2Active && (
            <button
              type="button"
              onClick={() => {
                setIsSpace2Active(true);
                setIsFuelActive(false);
              }}
              className="ml-2 h-7 px-2.5 rounded-full text-[10.5px] font-bold transition cursor-pointer flex items-center gap-1 active:scale-95 bg-white/95 hover:bg-white text-blue-700 border border-sky-300 shadow-2xs"
              title={isFa ? 'بازگشت به صفحه اصلی یودا' : 'Return to YODAW'}
            >
              <Bot className="w-3 h-3 text-blue-600" />
              <span>{isFa ? 'بازگشت به یودا' : 'Back to YODAW'}</span>
            </button>
          )}
        </div>

        {/* Right: Quick Actions (Completely Round 3D Tactile Buttons - Strictly Fixed LTR Order) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 z-20 ml-auto" dir="ltr">
          {/* 1. Round 3D Pale Sky Blue Profile Button (Matches Yoda's signature #38bdf8 dot) */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className="h-8 w-8 sm:h-9 sm:w-9 md:w-auto md:px-3 rounded-full bg-gradient-to-tr from-[#0ea5e9] via-[#38bdf8] to-[#7dd3fc] hover:from-[#0284c7] hover:to-[#38bdf8] border border-sky-200/90 text-white transition-all duration-200 cursor-pointer shadow-[0_3px_12px_rgba(56,189,248,0.4),inset_0_1px_2px_rgba(255,255,255,0.7)] hover:shadow-[0_4px_16px_rgba(56,189,248,0.55)] active:scale-95 flex items-center justify-center gap-1.5 group relative select-none"
            title={isFa ? 'پروفایل کاربری' : 'User Profile'}
            dir="ltr"
          >
            {/* User Avatar Initial */}
            <span className="font-black text-[12px] sm:text-[13px] text-white tracking-tight leading-none drop-shadow-[0_1px_2px_rgba(14,116,144,0.4)]">
              K
            </span>

            <span className="text-[11px] sm:text-xs font-bold text-white hidden md:inline pr-0.5 drop-shadow-[0_1px_2px_rgba(14,116,144,0.3)]">
              {isFa ? 'کیان' : 'Kian'}
            </span>
          </button>

          {/* 2. Round 3D Settings Modal (Includes Language & Agent Configurations) */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white/95 hover:bg-white border border-sky-200/90 hover:border-sky-400 text-slate-800 hover:text-blue-600 transition-all duration-200 cursor-pointer shadow-[0_2px_8px_rgba(37,99,235,0.08),inset_0_1px_0.5px_#fff] hover:shadow-[0_4px_12px_rgba(37,99,235,0.15)] active:scale-95 flex items-center justify-center select-none"
            title={t.settings}
          >
            <SettingsIcon className="w-4 h-4 text-slate-700" />
          </button>
        </div>
      </header>
    </div>

      {/* Main Workspace Layout - Responsive Auto-Layout Engine */}
      <div className="relative z-20 flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden w-full">
        {/* Responsive Sidebar - Exclusively shown in CODGAR workspace */}
        {!isSpace2Active && (
          <Sidebar
            onOpenQueue={() => setIsQueueOpen(!isQueueOpen)}
            onOpenTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
            onOpenPreview={toggleLivePreview}
            onOpenBilling={() => setIsProfileOpen(true)}
            onOpenFuel={() => {
              setIsFuelActive(!isFuelActive);
              setIsSpace2Active(false);
            }}
            onOpenSpace2={() => {
              setIsSpace2Active(!isSpace2Active);
              setIsFuelActive(false);
            }}
            isQueueActive={isQueueOpen}
            isTerminalActive={isTerminalOpen}
            isFuelActive={isFuelActive}
            isSpace2Active={isSpace2Active}
            isPreviewActive={isPreviewOpen}
            isExecuting={isExecuting}
            language={language}
          />
        )}

        {/* Central Content Area */}
        <main className="flex-1 min-h-0 flex flex-col relative overflow-hidden w-full">
          {isFuelActive ? (
            <FuelApiKeyView
              onBackToChat={() => setIsFuelActive(false)}
              userEmail="arminsh00@gmail.com"
              language={language}
            />
          ) : isSpace2Active ? (
            <YodawWorkspace
              messages={space2Messages}
              onSendMessage={handleSendMessage}
              isExecuting={isExecuting}
              onStopExecution={handleStopExecution}
              wasStopped={wasStopped}
              onContinueExecution={handleResumeExecution}
              isOnline={isOnline}
              taskIntent={activeTaskIntent}
              onOpenCodeDrawer={() => setIsCodeDrawerOpen(true)}
              onOpenTerminal={() => setIsTerminalOpen(true)}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenMenuDrawer={() => setIsMenuDrawerOpen(true)}
              onOpenSiriVoice={toggleVoiceRecording}
              isRecordingVoice={isRecordingVoice}
              inputText={space2InputText}
              onInputTextChange={setSpace2InputText}
              language={language}
              onTogglePreview={toggleLivePreview}
              isPreviewOpen={isPreviewOpen}
              isTranslatingHistory={isTranslatingHistory}
              onOpenFullCodgar={() => setIsSpace2Active(false)}
              onOpenQueue={() => setIsQueueOpen(true)}
              onOpenEmailModal={(email) => {
                setSelectedEmailForModal(email || null);
                setIsEmailViewerOpen(true);
              }}
            />
          ) : (
            <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-1 sm:p-3 md:p-4 overflow-hidden w-full h-full">
              <CodedAiChatCard
                messages={messages}
                onSendMessage={handleSendMessage}
                isExecuting={isExecuting}
                onStopExecution={handleStopExecution}
                wasStopped={wasStopped}
                onContinueExecution={handleResumeExecution}
                isOnline={isOnline}
                taskIntent={activeTaskIntent}
                onOpenCodeDrawer={() => setIsCodeDrawerOpen(true)}
                onOpenTerminal={() => setIsTerminalOpen(true)}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onOpenSiriVoice={toggleVoiceRecording}
                isRecordingVoice={isRecordingVoice}
                inputText={inputText}
                onInputTextChange={setInputText}
                language={language}
                onTogglePreview={toggleLivePreview}
                isPreviewOpen={isPreviewOpen}
                isTranslatingHistory={isTranslatingHistory}
                onOpenEmailModal={(email) => {
                  setSelectedEmailForModal(email || null);
                  setIsEmailViewerOpen(true);
                }}
              />
            </div>
          )}
        </main>
      </div>

      {/* Live Email Viewer & Inbox Modal (Gmail MCP) */}
      <LiveEmailViewerModal
        isOpen={isEmailViewerOpen}
        onClose={() => setIsEmailViewerOpen(false)}
        language={language}
        initialEmail={selectedEmailForModal}
        onSendReplyPrompt={(replyPrompt) => {
          if (isSpace2Active) {
            setSpace2InputText(replyPrompt);
            handleSendMessage(replyPrompt);
          } else {
            setInputText(replyPrompt);
            handleSendMessage(replyPrompt);
          }
        }}
      />

      {/* Live Artifact Preview (Interactive App/Code Runner) */}
      {isPreviewOpen && activeArtifact && (
        <LiveArtifactPreview code={activeArtifact?.code || activeArtifact?.content || activeArtifact?.html}
          artifact={activeArtifact}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          language={language}
        />
      )}

      {/* Animated Code Drawer / Monaco Workspace */}
      <AnimatedCodeDrawer
        isOpen={isCodeDrawerOpen}
        onClose={() => setIsCodeDrawerOpen(false)}
        language={language}
        initialTab={codeDrawerTab}
        messages={messages}
        onRefreshWorkspace={refreshWorkspaceData}
      />

      {/* Terminal Panel */}
      {isTerminalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-6xl h-[88vh] bg-[#070b16] border border-cyan-500/30 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <TerminalPanel
              isOpen={true}
              language={language}
              messages={messages}
              onToggle={() => setIsTerminalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* File Explorer Modal */}
      <FileExplorer
        isOpen={isFileExplorerOpen}
        onClose={() => setIsFileExplorerOpen(false)}
        onSelectFileForContext={(path) => {
          setInputText((prev) => `${prev} @${path} `);
          setIsFileExplorerOpen(false);
        }}
      />

      {/* Git Diff Viewer Modal */}
      <DiffViewerModal
        isOpen={isDiffOpen}
        onClose={() => setIsDiffOpen(false)}
        onRefreshGitStatus={refreshWorkspaceData}
      />

      {/* Workspaces Modal */}
      <FreebuffWorkspacesModal
        isOpen={isWorkspacesOpen}
        onClose={() => setIsWorkspacesOpen(false)}
        language={language}
      />

      {/* Task Queue Drawer */}
      <FreebuffQueueDrawer
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        language={language}
        onEnqueueTask={(prompt) => handleSendMessage(prompt, 'agent')}
        isExecuting={isExecuting}
      />

      {/* Skills Modal */}
      <SkillsModal
        isOpen={isSkillsOpen}
        onClose={() => setIsSkillsOpen(false)}
      />

      {/* Settings Modal (Includes Language & Agent Configurations) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        projectInfo={projectInfo}
        policy={policy}
        onUpdatePolicy={setPolicy}
        agentConfig={agentConfig}
        onUpdateAgentConfig={setAgentConfig}
        language={language}
        onSelectLanguage={handleSelectLanguage}
      />

      {/* 3-Line Studio Menu Drawer (New Chat, History, Gallery, Connectors, Stats) */}
      <YodawMenuDrawer
        isOpen={isMenuDrawerOpen}
        onClose={() => setIsMenuDrawerOpen(false)}
        language={language}
        agentConfig={agentConfig}
        onUpdateAgentConfig={setAgentConfig}
        onNewChat={handleStartNewChatSession}
        currentMessages={isSpace2Active ? space2Messages : messages}
        sessions={chatSessions}
        onDeleteSession={(id) => setChatSessions((prev) => prev.filter((s) => s.id !== id))}
        onLoadSession={(loadedMessages) => {
          setSpace2Messages(loadedMessages);
          setMessages(loadedMessages);
          setIsSpace2Active(true);
        }}
        onOpenPreview={() => setIsPreviewOpen(true)}
        onOpenEmailModal={() => setIsEmailViewerOpen(true)}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        language={language}
        currentProject={projectInfo?.name || 'codgar-agent'}
      />

      {/* Language Selector Modal (Preserved as fallback) */}
      <LanguageSelectorModal
        isOpen={isLanguageOpen}
        onClose={() => setIsLanguageOpen(false)}
        currentLanguage={language}
        onSelectLanguage={handleSelectLanguage}
      />

      {/* Local OS Terminal Bridge Modal */}
      <LocalBridgeModal
        isOpen={isLocalBridgeOpen}
        onClose={() => setIsLocalBridgeOpen(false)}
        language={language}
      />

      {/* 70% Screen MCP WebView Automation Modal */}
      <McpWebViewModal
        isOpen={isMcpWebViewOpen}
        onClose={() => setIsMcpWebViewOpen(false)}
        connectorName={mcpWebViewTitle}
        targetUrl={mcpWebViewUrl}
        language={language}
        onFinished={(resultText) => {
          const assistantMsg: Message = {
            id: `msg-asst-${Date.now()}`,
            role: 'agent',
            content: resultText,
            timestamp: Date.now(),
          };
          updateActiveMessages((prev) => [...prev, assistantMsg]);
          playSoftChimeSound();
        }}
      />

      {/* Siri Voice Visual Overlay */}
      {siriVisualActive && (
        <SiriLiveSpeakerOverlay
          isOpen={siriVisualActive}
          currentInputText={inputText}
          onUpdateInputText={(text) => {
            setInputText(text);
          }}
          onClose={() => {
            setSiriVisualActive(false);
            setIsRecordingVoice(false);
            voiceAgent.stopListening();
          }}
          onSendTranscript={(text) => {
            setInputText('');
            handleSendMessage(text);
            setSiriVisualActive(false);
            setIsRecordingVoice(false);
          }}
          language={language}
        />
      )}
    <MediaStudioDrawer />

      <ProjectTimelineDrawer />
</div>);
};