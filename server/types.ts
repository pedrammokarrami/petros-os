export type TaskStatus = 'idle' | 'queued' | 'running' | 'waiting_approval' | 'completed' | 'failed' | 'cancelled';

export type WorkerType = 'coder' | 'writer' | 'router';

export interface TaskEvent {
  id: string;
  taskId: string;
  type:
    | 'task.created'
    | 'task.started'
    | 'agent.thinking'
    | 'agent.planning'
    | 'worker.started'
    | 'worker.completed'
    | 'tool.started'
    | 'tool.completed'
    | 'file.changed'
    | 'command.started'
    | 'command.output'
    | 'command.completed'
    | 'test.started'
    | 'test.completed'
    | 'approval.required'
    | 'task.completed'
    | 'task.failed'
    | 'task.cancelled';
  payload: Record<string, any>;
  timestamp: number;
}

export interface TaskToolExecution {
  id: string;
  name: string;
  worker: WorkerType;
  description: string;
  input: Record<string, any>;
  output?: string;
  exitCode?: number;
  durationMs?: number;
  status: 'running' | 'success' | 'failed';
}

export interface TaskRecord {
  id: string;
  sessionId: string;
  title: string;
  prompt: string;
  mode: string;
  status: TaskStatus;
  worker?: WorkerType;
  projectDir: string;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  plan?: { goal: string; steps: { id: number; text: string; status: string; tool?: string }[] };
  tools: TaskToolExecution[];
  filesModified: string[];
  testResults?: { command: string; passed: boolean; stdout: string; stderr: string; durationMs: number };
  diff?: string;
  resultSummary?: string;
  error?: string;
}

export interface SessionRecord {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  projectDir: string;
  taskIds: string[];
}
