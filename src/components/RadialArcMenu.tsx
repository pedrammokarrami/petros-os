import { useState } from 'react';
import { AgentMode } from '../types';
import { Language, translations } from '../utils/translations';
import { CodgarLogo } from './CodgarLogo';
import {
  Bot,
  MessageSquareCode,
  ListTodo,
  FileSearch,
  Bug,
  Terminal,
  FolderTree,
  GitBranch,
  Settings,
  Sparkles,
  Layers,
  Globe,
  PlusCircle,
  X,
  Compass,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface RadialAction {
  id: string;
  label: string;
  sublabel: string;
  icon: any;
  color: string;
  glowColor: string;
  onClick: () => void;
  angle: number; // in degrees
  radius: number; // distance in px from center
  badge?: string;
  isActive?: boolean;
}

interface Props {
  currentMode: AgentMode;
  onSelectMode: (mode: AgentMode) => void;
  onNewTask: () => void;
  onOpenExplorer: () => void;
  onOpenDiffs: () => void;
  onOpenSkills: () => void;
  onOpenSettings: () => void;
  language: Language;
  onToggleLanguage: () => void;
  gitUncommittedCount?: number;
}

export function RadialArcMenu({
  currentMode,
  onSelectMode,
  onNewTask,
  onOpenExplorer,
  onOpenDiffs,
  onOpenSkills,
  onOpenSettings,
  language,
  onToggleLanguage,
  gitUncommittedCount = 0,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredAction, setHoveredAction] = useState<RadialAction | null>(null);

  const t = translations[language];

  // Radial items distributed in a graceful arc along the edge of the viewport
  // Angles spread from -80 deg to +80 deg (facing right towards the screen)
  const actions: RadialAction[] = [
    {
      id: 'agent',
      label: t.modes.agent,
      sublabel: 'Autonomous Coding Loop',
      icon: Bot,
      color: 'text-emerald-400',
      glowColor: 'rgba(16, 185, 129, 0.4)',
      angle: -75,
      radius: 175,
      isActive: currentMode === 'agent',
      onClick: () => {
        onSelectMode('agent');
        setIsOpen(false);
      },
    },
    {
      id: 'chat',
      label: t.modes.chat,
      sublabel: 'Confidant & Technical Dialogue',
      icon: MessageSquareCode,
      color: 'text-emerald-300',
      glowColor: 'rgba(52, 211, 153, 0.4)',
      angle: -45,
      radius: 195,
      isActive: currentMode === 'chat',
      onClick: () => {
        onSelectMode('chat');
        setIsOpen(false);
      },
    },
    {
      id: 'plan',
      label: t.modes.plan,
      sublabel: 'Architectural Blueprint',
      icon: ListTodo,
      color: 'text-cyan-400',
      glowColor: 'rgba(34, 211, 238, 0.4)',
      angle: -15,
      radius: 205,
      isActive: currentMode === 'plan',
      onClick: () => {
        onSelectMode('plan');
        setIsOpen(false);
      },
    },
    {
      id: 'review',
      label: t.modes.review,
      sublabel: 'Zero-Day Security Audit',
      icon: FileSearch,
      color: 'text-rose-400',
      glowColor: 'rgba(244, 63, 94, 0.4)',
      angle: 15,
      radius: 205,
      isActive: currentMode === 'review',
      onClick: () => {
        onSelectMode('review');
        setIsOpen(false);
      },
    },
    {
      id: 'debug',
      label: t.modes.debug,
      sublabel: 'Root Cause & Exploit Hunt',
      icon: Bug,
      color: 'text-amber-400',
      glowColor: 'rgba(245, 158, 11, 0.4)',
      angle: 45,
      radius: 195,
      isActive: currentMode === 'debug',
      onClick: () => {
        onSelectMode('debug');
        setIsOpen(false);
      },
    },
    {
      id: 'terminal',
      label: t.modes.terminal,
      sublabel: 'Host Root Shell',
      icon: Terminal,
      color: 'text-emerald-400',
      glowColor: 'rgba(16, 185, 129, 0.4)',
      angle: 75,
      radius: 175,
      isActive: currentMode === 'terminal',
      onClick: () => {
        onSelectMode('terminal');
        setIsOpen(false);
      },
    },
  ];

  // Secondary tools in an inner orbit
  const secondaryActions: RadialAction[] = [
    {
      id: 'new',
      label: t.newSession,
      sublabel: 'Wipe current context',
      icon: PlusCircle,
      color: 'text-emerald-400',
      glowColor: 'rgba(16, 185, 129, 0.4)',
      angle: -60,
      radius: 110,
      onClick: () => {
        onNewTask();
        setIsOpen(false);
      },
    },
    {
      id: 'tree',
      label: t.tree,
      sublabel: 'Inspect repository tree',
      icon: FolderTree,
      color: 'text-slate-300',
      glowColor: 'rgba(255, 255, 255, 0.3)',
      angle: -20,
      radius: 115,
      onClick: () => {
        onOpenExplorer();
        setIsOpen(false);
      },
    },
    {
      id: 'diff',
      label: t.diff,
      sublabel: 'Workspace delta',
      icon: GitBranch,
      color: 'text-slate-300',
      glowColor: 'rgba(255, 255, 255, 0.3)',
      badge: gitUncommittedCount > 0 ? String(gitUncommittedCount) : undefined,
      angle: 20,
      radius: 115,
      onClick: () => {
        onOpenDiffs();
        setIsOpen(false);
      },
    },
    {
      id: 'settings',
      label: t.settings,
      sublabel: 'Security & Claude parameters',
      icon: Settings,
      color: 'text-slate-300',
      glowColor: 'rgba(255, 255, 255, 0.3)',
      angle: 60,
      radius: 110,
      onClick: () => {
        onOpenSettings();
        setIsOpen(false);
      },
    },
  ];

  return (
    <>
      {/* Dimmed Backdrop with Blur when Radial Orbit is Active */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        />
      )}

      {/* Floating Mysterious Navigation Hub on Left Edge */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 flex items-center select-none pointer-events-none">
        {/* Mysterious Central Apple-Crafted Orb */}
        <div className="relative pointer-events-auto">
          <button
            id="radial-menu-trigger"
            onClick={() => setIsOpen(!isOpen)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 cursor-pointer relative group ${
              isOpen
                ? 'bg-emerald-950/90 border-2 border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.7)] rotate-90 scale-105'
                : 'glass-panel-elevated border border-white/20 hover:border-emerald-400/80 shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_20px_rgba(16,185,129,0.2)] hover:scale-108 hover:shadow-[0_0_28px_rgba(16,185,129,0.5)]'
            }`}
            title={isOpen ? 'Close command orb' : 'Expand radial command arc'}
          >
            {/* Prismatic edge shimmer */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 via-transparent to-emerald-400/20 opacity-70 pointer-events-none" />

            {/* Glowing Orb Core */}
            {isOpen ? (
              <X className="w-6 h-6 text-emerald-300" />
            ) : (
              <div className="relative flex items-center justify-center">
                <CodgarLogo size={32} />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse" />
              </div>
            )}
          </button>

          {/* Mysterious Orbit Indicator Pulse */}
          {!isOpen && (
            <div className="absolute -inset-2 rounded-full border border-emerald-400/20 pointer-events-none animate-ping opacity-30" />
          )}

          {/* Language Toggle Capsule (Directly below Orb) */}
          <button
            onClick={onToggleLanguage}
            className="absolute left-1/2 -translate-x-1/2 top-16 px-2.5 py-1 rounded-xl glass-panel text-[10px] font-mono font-semibold tracking-wider text-slate-300 hover:text-emerald-400 border border-white/10 hover:border-emerald-400/40 transition-all duration-200 cursor-pointer shadow-lg flex items-center gap-1.5 whitespace-nowrap pointer-events-auto"
            title="Toggle between English and Persian"
          >
            <Globe className="w-3 h-3 text-emerald-400" />
            <span>{language.toUpperCase()}</span>
          </button>

          {/* Quick Active Mode Chip (Above Orb) */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-8 px-2 py-0.5 rounded-lg glass-subtle text-[9px] font-mono text-emerald-400 border border-emerald-500/30 whitespace-nowrap uppercase tracking-widest shadow-md">
            {currentMode}
          </div>

          {/* RADIAL EXPANDED SATELLITES */}
          {isOpen && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              {/* Concentric Orbit Rings */}
              <svg className="absolute -top-64 -left-64 w-[512px] h-[512px] pointer-events-none opacity-25">
                <circle
                  cx="256"
                  cy="256"
                  r="110"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeDasharray="4 6"
                />
                <circle
                  cx="256"
                  cy="256"
                  r="190"
                  fill="none"
                  stroke="rgba(16,185,129,0.3)"
                  strokeDasharray="2 8"
                />
              </svg>

              {/* Primary Outer Ring Actions (Modes) */}
              {actions.map((action, idx) => {
                const rad = (action.angle * Math.PI) / 180;
                const x = Math.round(Math.cos(rad) * action.radius);
                const y = Math.round(Math.sin(rad) * action.radius);
                const Icon = action.icon;

                return (
                  <div
                    key={action.id}
                    style={{
                      transform: `translate(${x}px, ${y}px)`,
                      transitionDelay: `${idx * 35}ms`,
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto transition-all duration-300 animate-in zoom-in-50"
                  >
                    <button
                      onClick={action.onClick}
                      onMouseEnter={() => setHoveredAction(action)}
                      onMouseLeave={() => setHoveredAction(null)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer relative group ${
                        action.isActive
                          ? 'bg-emerald-950/90 border-2 border-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.6)] scale-110'
                          : 'glass-panel-elevated border border-white/15 hover:border-emerald-400 hover:scale-115 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                      }`}
                      title={action.label}
                    >
                      <Icon className={`w-5 h-5 ${action.color}`} />
                      {action.isActive && (
                        <span className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
                      )}
                    </button>
                  </div>
                );
              })}

              {/* Secondary Inner Ring Actions (Tools) */}
              {secondaryActions.map((action, idx) => {
                const rad = (action.angle * Math.PI) / 180;
                const x = Math.round(Math.cos(rad) * action.radius);
                const y = Math.round(Math.sin(rad) * action.radius);
                const Icon = action.icon;

                return (
                  <div
                    key={action.id}
                    style={{
                      transform: `translate(${x}px, ${y}px)`,
                      transitionDelay: `${idx * 30 + 100}ms`,
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto transition-all duration-300 animate-in zoom-in-50"
                  >
                    <button
                      onClick={action.onClick}
                      onMouseEnter={() => setHoveredAction(action)}
                      onMouseLeave={() => setHoveredAction(null)}
                      className="w-10 h-10 rounded-2xl glass-panel border border-white/15 hover:border-emerald-400/80 hover:scale-115 hover:shadow-[0_0_18px_rgba(16,185,129,0.3)] transition-all duration-200 cursor-pointer flex items-center justify-center relative group"
                      title={action.label}
                    >
                      <Icon className={`w-4 h-4 ${action.color}`} />
                      {action.badge && (
                        <span className="absolute -top-1 -right-1 px-1 min-w-[14px] h-3.5 rounded-full bg-rose-500 text-white font-mono text-[8px] font-bold flex items-center justify-center">
                          {action.badge}
                        </span>
                      )}
                    </button>
                  </div>
                );
              })}

              {/* Hovered Action Tooltip HUD */}
              {hoveredAction && (
                <div className="absolute left-64 top-1/2 -translate-y-1/2 px-4 py-2.5 rounded-2xl glass-panel-elevated border border-emerald-400/40 text-left shadow-2xl min-w-[190px] animate-in fade-in slide-in-from-left-2 duration-150 pointer-events-none">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white tracking-wide">
                      {hoveredAction.label}
                    </span>
                    {hoveredAction.isActive && (
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-600">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {hoveredAction.sublabel}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
