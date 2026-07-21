/**
 * eryx-runner client SDK
 * Easy integration for any project
 */

export interface ExecutionResult {
  id: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;
  language: string;
}

export interface PoolStats {
  ready: number;
  inUse: number;
  total: number;
}

export interface RunnerOptions {
  baseUrl?: string;
  timeout?: number;
}

const DEFAULT_URL = process.env.ERYX_RUNNER_URL || "http://localhost:3001";

export class Runner {
  private baseUrl: string;

  constructor(private options: RunnerOptions = {}) {
    this.baseUrl = this.options.baseUrl || DEFAULT_URL;
  }

  /**
   * Execute code and get result
   */
  async run(code: string, language: string): Promise<ExecutionResult> {
    const res = await fetch(`${this.baseUrl}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language, timeout: this.options.timeout }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    return res.json();
  }

  /**
   * Execute and stream output (simple polling for now)
   */
  async *runStreaming(code: string, language: string) {
    const result = await this.run(code, language);
    yield result.stdout;
    if (result.stderr) yield result.stderr;
  }

  /**
   * Health check
   */
  async health(): Promise<{ ok: boolean; stats: Record<string, PoolStats> }> {
    const res = await fetch(`${this.baseUrl}/health`);
    return res.json();
  }

  /**
   * Pool statistics
   */
  async stats(): Promise<Record<string, PoolStats>> {
    const res = await fetch(`${this.baseUrl}/stats`);
    return res.json();
  }

  /**
   * Supported languages
   */
  async languages(): Promise<string[]> {
    const res = await fetch(`${this.baseUrl}/languages`);
    const data = await res.json();
    return data.languages;
  }
}

// Pre-configured instances per language (for convenience)
export const runners: Record<string, Runner> = {
  js: new Runner(),
  python: new Runner(),
  go: new Runner(),
  rust: new Runner(),
};

// Quick execute helpers
export async function run(code: string, language: string, options?: RunnerOptions): Promise<ExecutionResult> {
  return new Runner(options).run(code, language);
}

// Default export
export default new Runner();
