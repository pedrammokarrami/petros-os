export type AgentMode = 'agent' | 'chat' | 'plan' | 'review' | 'debug' | 'explain' | 'terminal' | 'setup';

export type AgentState =
  | 'idle'
  | 'listening'
  | 'planning'
  | 'searching'
  | 'reading'
  | 'writing'
  | 'running_command'
  | 'testing'
  | 'reviewing'
  | 'waiting_approval'
  | 'completed'
  | 'failed';

export interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  mtime?: number;
  children?: FileItem[];
}

export interface GitStatus {
  isGit: boolean;
  branch: string;
  staged: string[];
  unstaged: string[];
  untracked: string[];
  clean: boolean;
}

export interface GitCommit {
  hash: string;
  author: string;
  date: string;
  message: string;
}

export interface ToolCall {
  id: string;
  name: string;
  description: string;
  status: 'running' | 'success' | 'failed' | 'needs_approval';
  input?: Record<string, any>;
  output?: string;
  exitCode?: number;
  durationMs?: number;
}

export interface TaskPlanStep {
  id: number;
  text: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  tool?: string;
}

export interface TaskPlan {
  goal: string;
  steps: TaskPlanStep[];
}

export interface CodeReviewFinding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  file: string;
  line?: number;
  title: string;
  explanation: string;
  suggestedFix?: string;
}

export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: { type: 'add' | 'del' | 'context'; content: string; oldLine?: number; newLine?: number }[];
}

export interface DiffData {
  file: string;
  rawDiff: string;
  hunks: DiffHunk[];
}

export interface GmailMessageData {
  id: string;
  threadId?: string;
  from: string;
  fromName: string;
  to: string;
  subject: string;
  date: string;
  timestamp: number;
  snippet: string;
  body: string;
  isUnread: boolean;
  hasAttachment?: boolean;
  labels?: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  sender?: string;
  text?: string;
  timestamp: number;
  mode?: AgentMode;
  state?: AgentState;
  isCodingTask?: boolean;
  taskType?: 'chat' | 'coding';
  requiresCodingPermission?: boolean;
  pendingCodingPrompt?: string;
  permissionStatus?: 'pending' | 'approved' | 'declined';
  toolCalls?: ToolCall[];
  emailData?: GmailMessageData;
  plan?: TaskPlan;
  findings?: CodeReviewFinding[];
  diff?: DiffData | string;
  executionResult?: {
    command: string;
    stdout: string;
    stderr: string;
    exitCode: number;
    durationMs: number;
  };
}

export interface ProjectInfo {
  root: string;
  name: string;
  version: string;
  platform: string;
  isWindows: boolean;
  isMac: boolean;
  hasGit: boolean;
  packageManager: string;
  testRunner: string;
  hasApiKey: boolean;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: string;
}

export interface PermissionPolicy {
  requireApprovalForCommands: boolean;
  requireApprovalForFileWrite: boolean;
  requireApprovalForGitCommit: boolean;
  allowedCommands: string[];
}

export interface AgentConfig {
  model: string;
  temperature: number;
  maxOutputTokens: number;
  systemPromptAdditions: string;
  autoCompactContext: boolean;
  bashTimeoutSeconds: number;
  verboseTelemetry: boolean;
  soundtrackAutoPlay: boolean;
  typewriterSpeed: number; // ms per char (0 for instant)
  // World-Class AI Coder Tuning (Claude Code, OpenAI Codex, Cursor)
  reasoningEffort?: 'low' | 'medium' | 'high' | 'ultra';
  contextWindowStrategy?: 'auto_compact' | 'sliding_window' | 'hierarchical_rag';
  diffFormat?: 'unified' | 'synthesized_ast' | 'split';
  codeReviewLinter?: 'strict' | 'lenient' | 'pedantic';
  multiFilePlanning?: boolean;
  selfCorrectionPasses?: number;
  autoTerminalExecution?: 'ask_always' | 'safe_only' | 'autonomous';
}

export interface TaskRecord {
  id: string;
  sessionId: string;
  title: string;
  prompt: string;
  mode: string;
  status: 'idle' | 'queued' | 'running' | 'waiting_approval' | 'completed' | 'failed' | 'cancelled';
  worker?: 'coder' | 'writer' | 'router';
  projectDir: string;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  plan?: { goal: string; steps: { id: number; text: string; status: string; tool?: string }[] };
  tools: ToolCall[];
  filesModified: string[];
  testResults?: { command: string; passed: boolean; stdout: string; stderr: string; durationMs: number };
  diff?: string;
  resultSummary?: string;
  error?: string;
}

export interface TaskEvent {
  id: string;
  taskId: string;
  type: string;
  payload: Record<string, any>;
  timestamp: number;
}

export interface ProjectItem {
  path: string;
  name: string;
  isCurrent: boolean;
}

export interface HealthInfo {
  status: string;
  runtime: string;
  version: string;
  timestamp: number;
  workers: string[];
  hasApiKey: boolean;
  workspaceRoot: string;
}

export interface PreviewArtifact {
  id: string;
  title: string;
  description?: string;
  type: 'html' | 'react' | 'canvas' | 'dashboard' | 'app' | 'python' | 'swift' | 'rust' | 'go' | 'cpp' | 'c' | 'vue' | 'javascript' | 'typescript' | 'code';
  language?: string;
  code: string;
  filePath?: string;
  livePreviewHtml?: string;
  executionResult?: {
    success?: boolean;
    stdout?: string;
    stderr?: string;
    exitCode?: number;
    durationMs?: number;
  };
  timestamp: number;
}

