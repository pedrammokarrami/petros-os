import { AgentState } from '../types';
import {
  Sparkles,
  Search,
  BookOpen,
  PenTool,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Code2,
  ShieldAlert,
} from 'lucide-react';

interface Props {
  state: AgentState;
  customText?: string;
}

export function AgentActivityBadge({ state, customText }: Props) {
  const getStatusConfig = () => {
    switch (state) {
      case 'listening':
        return {
          label: customText || 'Listening to user...',
          icon: Sparkles,
          color: 'text-blue-600',
          bg: 'bg-blue-50/80 border-blue-200/60',
          pulse: true,
        };
      case 'planning':
        return {
          label: customText || 'Synthesizing task plan...',
          icon: Clock,
          color: 'text-indigo-600',
          bg: 'bg-indigo-50/80 border-indigo-200/60',
          pulse: true,
        };
      case 'searching':
        return {
          label: customText || 'Searching workspace symbols...',
          icon: Search,
          color: 'text-amber-600',
          bg: 'bg-amber-50/80 border-amber-200/60',
          pulse: true,
        };
      case 'reading':
        return {
          label: customText || 'Reading source files...',
          icon: BookOpen,
          color: 'text-cyan-600',
          bg: 'bg-cyan-50/80 border-cyan-200/60',
          pulse: true,
        };
      case 'writing':
        return {
          label: customText || 'Writing code patch...',
          icon: PenTool,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50/80 border-emerald-200/60',
          pulse: true,
        };
      case 'running_command':
        return {
          label: customText || 'Executing terminal process...',
          icon: Terminal,
          color: 'text-purple-600',
          bg: 'bg-purple-50/80 border-purple-200/60',
          pulse: true,
        };
      case 'testing':
        return {
          label: customText || 'Running verification suite...',
          icon: Code2,
          color: 'text-blue-700',
          bg: 'bg-blue-50/80 border-blue-300/60',
          pulse: true,
        };
      case 'reviewing':
        return {
          label: customText || 'Analyzing code quality...',
          icon: Code2,
          color: 'text-violet-600',
          bg: 'bg-violet-50/80 border-violet-200/60',
          pulse: true,
        };
      case 'waiting_approval':
        return {
          label: customText || 'Waiting for user approval...',
          icon: ShieldAlert,
          color: 'text-amber-700',
          bg: 'bg-amber-100/80 border-amber-300/80',
          pulse: true,
        };
      case 'completed':
        return {
          label: customText || 'Task completed successfully',
          icon: CheckCircle2,
          color: 'text-emerald-700',
          bg: 'bg-emerald-50/80 border-emerald-200/60',
          pulse: false,
        };
      case 'failed':
        return {
          label: customText || 'Execution stopped with errors',
          icon: AlertTriangle,
          color: 'text-rose-600',
          bg: 'bg-rose-50/80 border-rose-200/60',
          pulse: false,
        };
      case 'idle':
      default:
        return {
          label: customText || 'CODGAR Engine Ready',
          icon: Sparkles,
          color: 'text-slate-600',
          bg: 'bg-slate-100/70 border-slate-200/60',
          pulse: false,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div
      id="agent-activity-indicator"
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-md transition-all duration-300 shadow-sm ${config.bg}`}
    >
      <span className="relative flex h-2 w-2">
        {config.pulse && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            state === 'failed'
              ? 'bg-rose-500'
              : state === 'completed'
              ? 'bg-emerald-500'
              : state === 'idle'
              ? 'bg-slate-400'
              : 'bg-blue-500'
          }`}
        />
      </span>
      <Icon className={`w-3.5 h-3.5 ${config.color}`} />
      <span className={`${config.color} whitespace-nowrap`}>{config.label}</span>
    </div>
  );
}
