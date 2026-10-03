import { ProjectInfo, GitStatus, AgentState } from '../types';
import {
  GitBranch,
  Terminal,
  FolderGit2,
  HardDrive,
  Cpu,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface Props {
  projectInfo: ProjectInfo | null;
  gitStatus: GitStatus | null;
  agentState: AgentState;
  activeWorker?: 'coder' | 'writer' | null;
  onOpenTerminal: () => void;
  onOpenDiff: () => void;
  onOpenExplorer: () => void;
}

export function StatusBar({
  projectInfo,
  gitStatus,
  agentState,
  activeWorker,
  onOpenTerminal,
  onOpenDiff,
  onOpenExplorer,
}: Props) {
  const getStatusBadge = () => {
    switch (agentState) {
      case 'idle':
        return { text: 'DAEMON: LISTENING', color: 'text-emerald-400', glow: 'mr-robot-glow' };
      case 'planning':
        return { text: 'COMPUTING VECTOR PLAN...', color: 'text-cyan-400', glow: 'mr-robot-glow-cyan' };
      case 'searching':
        return { text: 'SCANNING INODE BLOCKS...', color: 'text-amber-400', glow: '' };
      case 'reading':
        return { text: 'DISSECTING PAYLOAD...', color: 'text-blue-400', glow: '' };
      case 'writing':
        return { text: 'PATCHING REPOSITORY...', color: 'text-emerald-400', glow: 'mr-robot-glow' };
      case 'running_command':
        return { text: 'RUNNING ROOT PROCESS...', color: 'text-purple-400', glow: '' };
      case 'testing':
        return { text: 'EXECUTING TEST SUITE...', color: 'text-cyan-400', glow: 'mr-robot-glow-cyan' };
      case 'reviewing':
        return { text: 'ZERO-DAY AUDIT...', color: 'text-rose-400', glow: 'mr-robot-glow-red' };
      case 'completed':
        return { text: 'TASK DEPLOYED [OK]', color: 'text-emerald-400', glow: 'mr-robot-glow' };
      case 'failed':
        return { text: 'SIGSEGV // HALTED', color: 'text-rose-400', glow: 'mr-robot-glow-red' };
      default:
        return { text: 'STANDBY', color: 'text-slate-400', glow: '' };
    }
  };

  const status = getStatusBadge();
  const uncommitted = (gitStatus?.unstaged?.length || 0) + (gitStatus?.untracked?.length || 0);

  return (
    <footer
      id="codgar-global-statusbar"
      className="h-8 w-full glass-panel border-t border-white/10 px-4 flex items-center justify-between text-[11px] font-mono select-none z-20 backdrop-blur-xl"
    >
      {/* Left: Project & Git details */}
      <div className="flex items-center gap-4">
        {/* Workspace Root */}
        <button
          onClick={onOpenExplorer}
          className="flex items-center gap-1.5 text-slate-300 hover:text-cyan-300 transition cursor-pointer"
          title="Open Project Explorer"
        >
          <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-slate-200">
            {projectInfo?.name || 'CODGAR_WORKSPACE'}
          </span>
        </button>

        {/* Git Branch & Diff status */}
        <button
          onClick={onOpenDiff}
          className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition cursor-pointer"
          title="View Git Changes"
        >
          <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-300">{gitStatus?.branch || 'main'}</span>
          {uncommitted > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-950/80 text-rose-400 border border-rose-800/60 font-bold text-[10px]">
              *{uncommitted}
            </span>
          )}
        </button>
      </div>

      {/* Center: Real-time Agent State indicator */}
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            agentState === 'failed'
              ? 'bg-rose-500 shadow-[0_0_8px_#ff1744]'
              : agentState === 'idle' || agentState === 'completed'
              ? 'bg-emerald-400 shadow-[0_0_8px_#00ff88]'
              : 'bg-cyan-400 shadow-[0_0_8px_#00e5ff] animate-ping'
          }`}
        />
        <span className={`font-semibold tracking-wider ${status.color} ${status.glow}`}>
          {status.text}
        </span>
        {activeWorker && (
          <span className="ml-2 px-1.5 py-0.5 rounded-md bg-white/10 text-cyan-300 font-mono text-[9px] uppercase tracking-wider border border-white/15">
            WORKER: {activeWorker}
          </span>
        )}
      </div>

      {/* Right: Quick Terminal Runner & System Stats */}
      <div className="flex items-center gap-4">
        {/* Model ID */}
        <div className="hidden md:flex items-center gap-1 text-slate-400">
          <Zap className="w-3 h-3 text-cyan-400" />
          <span>gemini-3.8-flash</span>
        </div>

        {/* Platform OS */}
        <div className="hidden lg:flex items-center gap-1 text-slate-500">
          <Cpu className="w-3 h-3" />
          <span>{projectInfo?.platform || 'linux'}</span>
        </div>

        {/* Terminal Toggle Button */}
        <button
          onClick={onOpenTerminal}
          className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg liquid-btn text-emerald-400 hover:text-white transition cursor-pointer"
          title="Toggle Terminal Runner"
        >
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-[10px] uppercase">Bash // tty1</span>
        </button>
      </div>
    </footer>
  );
}
