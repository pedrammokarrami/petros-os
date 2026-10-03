import {
  ProjectInfo,
  GitStatus,
  GitCommit,
  FileItem,
  TaskRecord,
  TaskEvent,
  ProjectItem,
  HealthInfo,
} from '../types';

export class ApiError extends Error {
  public status: number;
  public details?: any;

  constructor(message: string, status = 500, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export class ApiClient {
  private static instance: ApiClient;
  private baseUrl: string = '';
  private defaultTimeoutMs: number = 45000;

  private constructor() {}

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    timeoutMs = this.defaultTimeoutMs
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    // Merge external signal if passed
    if (options.signal) {
      options.signal.addEventListener('abort', () => controller.abort());
    }

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      });

      clearTimeout(timer);

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: response.statusText };
        }
        throw new ApiError(
          errorData.error || `Request failed with status ${response.status}`,
          response.status,
          errorData
        );
      }

      return (await response.json()) as T;
    } catch (err: any) {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        throw new ApiError('Request timed out or was aborted by client', 408);
      }
      if (err instanceof ApiError) throw err;
      throw new ApiError(err.message || 'Network error occurred', 500);
    }
  }

  // ==========================================
  // HEALTH & DIAGNOSTICS
  // ==========================================
  public async getHealth(): Promise<HealthInfo> {
    return this.request<HealthInfo>('/api/health');
  }

  // ==========================================
  // WORKSPACE & PROJECTS
  // ==========================================
  public async getProjectInfo(): Promise<ProjectInfo> {
    return this.request<ProjectInfo>('/api/project/info');
  }

  public async getProjects(): Promise<{ success: boolean; projects: ProjectItem[]; currentProject: string }> {
    return this.request('/api/projects');
  }

  public async switchProject(projectPath: string): Promise<{ success: boolean; currentProject: string }> {
    return this.request('/api/projects/switch', {
      method: 'POST',
      body: JSON.stringify({ projectPath }),
    });
  }

  public async createTestProject(): Promise<{ success: boolean; message: string; testDir: string }> {
    return this.request('/api/projects/create-test', {
      method: 'POST',
    });
  }

  // ==========================================
  // FILESYSTEM
  // ==========================================
  public async getFileTree(dir?: string): Promise<{ success: boolean; root: string; tree: FileItem[] }> {
    const query = dir ? `?dir=${encodeURIComponent(dir)}` : '';
    return this.request(`/api/fs/tree${query}`);
  }

  public async readFile(filePath: string): Promise<{ success: boolean; filePath: string; content: string; lines: number; size: number }> {
    return this.request('/api/fs/read', {
      method: 'POST',
      body: JSON.stringify({ filePath }),
    });
  }

  public async writeFile(filePath: string, content: string): Promise<{ success: boolean; filePath: string; bytesWritten: number }> {
    return this.request('/api/fs/write', {
      method: 'POST',
      body: JSON.stringify({ filePath, content }),
    });
  }

  public async searchFiles(query: string, maxResults = 30): Promise<{ success: boolean; count: number; results: any[] }> {
    return this.request('/api/fs/search', {
      method: 'POST',
      body: JSON.stringify({ query, maxResults }),
    });
  }

  // ==========================================
  // GIT OPERATIONS
  // ==========================================
  public async getGitStatus(): Promise<GitStatus> {
    return this.request<GitStatus>('/api/git/status');
  }

  public async getGitDiff(file?: string, cached = false): Promise<{ success: boolean; diff: string }> {
    const params = new URLSearchParams();
    if (file) params.set('file', file);
    if (cached) params.set('cached', 'true');
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/api/git/diff${query}`);
  }

  public async getGitLog(): Promise<{ success: boolean; commits: GitCommit[] }> {
    return this.request('/api/git/log');
  }

  public async commitGit(message: string, files: string[] = []): Promise<{ success: boolean; output: string }> {
    return this.request('/api/git/commit', {
      method: 'POST',
      body: JSON.stringify({ message, files }),
    });
  }

  // ==========================================
  // TERMINAL EXECUTION
  // ==========================================
  public async executeTerminal(
    command: string,
    cwd?: string,
    timeoutMs = 60000
  ): Promise<{
    success: boolean;
    command: string;
    exitCode: number;
    durationMs: number;
    stdout: string;
    stderr: string;
    executionId: string;
  }> {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    return this.request('/api/terminal/exec', {
      method: 'POST',
      body: JSON.stringify({ command, cwd, timeout: timeoutMs, executionId }),
    });
  }

  public async cancelTerminal(executionId: string): Promise<{ success: boolean; message: string }> {
    return this.request('/api/terminal/cancel', {
      method: 'POST',
      body: JSON.stringify({ executionId }),
    });
  }

  // ==========================================
  // REAL AGENT TASKS & REAL-TIME SSE STREAMING
  // ==========================================
  public async createTask(params: {
    prompt: string;
    mode?: string;
    projectDir?: string;
    sessionId?: string;
  }): Promise<{ success: boolean; task: TaskRecord }> {
    return this.request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  public async getTask(taskId: string): Promise<{ success: boolean; task: TaskRecord }> {
    return this.request(`/api/tasks/${taskId}`);
  }

  public async listTasks(): Promise<{ success: boolean; tasks: TaskRecord[] }> {
    return this.request('/api/tasks');
  }

  public async cancelTask(taskId: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/api/tasks/${taskId}/cancel`, {
      method: 'POST',
    });
  }

  /**
   * Subscribes to real-time events for a task via Server-Sent Events (SSE)
   */
  public subscribeTaskEvents(
    taskId: string,
    onEvent: (event: TaskEvent) => void,
    onError?: (err: any) => void
  ): () => void {
    const eventSource = new EventSource(`${this.baseUrl}/api/tasks/${taskId}/events`);

    eventSource.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data);
        if (parsed.type === 'connected') return;
        onEvent(parsed as TaskEvent);
      } catch (err) {
        console.warn('Failed to parse SSE event data:', err);
      }
    };

    eventSource.onerror = (err) => {
      onError?.(err);
    };

    return () => {
      eventSource.close();
    };
  }

  // ==========================================
  // AGENT CHAT (COMPANION & BRAINSTORM)
  // ==========================================
  public async sendAgentChat(
    prompt: string,
    mode: string,
    context?: any,
    history?: any[],
    signal?: AbortSignal
  ): Promise<{ success: boolean; text: string; mode: string }> {
    return this.request(
      '/api/agent/chat',
      {
        method: 'POST',
        body: JSON.stringify({ prompt, mode, context, history }),
        signal,
      },
      60000
    );
  }

  // ==========================================
  // API KEY ROTATION & POOL MANAGEMENT
  // ==========================================
  public async getKeyStatus(): Promise<any> {
    return this.request('/api/keys/status', { method: 'GET' });
  }

  public async rotateKey(reason?: string): Promise<any> {
    return this.request('/api/keys/rotate', {
      method: 'POST',
      body: JSON.stringify({ reason: reason || 'ui_manual_rotation' }),
    });
  }

  public async addKey(apiKey: string): Promise<any> {
    return this.request('/api/keys/add', {
      method: 'POST',
      body: JSON.stringify({ apiKey }),
    });
  }

  // ==========================================
  // GAIF.DEV AI ROUTER & PACKAGE SUITE
  // ==========================================
  public async getRouterTopology(): Promise<any> {
    return this.request('/api/router/topology', { method: 'GET' });
  }

  public async getRouterModels(): Promise<any> {
    return this.request('/api/router/models', { method: 'GET' });
  }

  public async selectRouterModel(prompt: string, mode?: string): Promise<any> {
    return this.request('/api/router/select-model', {
      method: 'POST',
      body: JSON.stringify({ prompt, mode }),
    });
  }

  public async installPackageSuite(): Promise<any> {
    return this.request('/api/router/install-package', {
      method: 'POST',
    });
  }
}

export const apiClient = ApiClient.getInstance();
