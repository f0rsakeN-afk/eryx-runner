/**
 * Docker executor - stateless code execution using docker run --rm
 * Each execution creates a fresh container, auto-cleaned after
 */

import { spawn } from "bun";
import { writeFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";

export interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;
}

export async function init(): Promise<void> {
  console.log("[docker] ready (stateless mode)");
}

export async function run(code: string, language: string, timeout = 30000): Promise<RunResult> {
  const start = Date.now();
  const ext = FILE_EXT[language];
  const image = IMAGES[language];
  const runCmd = LANGUAGE_RUN[language];
  const localFile = `${tmpdir()}/eryx-${Date.now()}${ext}`;

  try {
    // Write code to temp file
    writeFileSync(localFile, code);

    // Build docker run command
    const args = [
      "docker", "run", "--rm",
      "--network", "none",
      "--memory", `${MEMORY[language]}m`,
      "--entrypoint", "",
      "-v", `${localFile}:/tmp/main${ext}:ro`,
      image,
      "sh", "-c", runCmd.replace(/\/tmp\/main/g, "/tmp/main"),
    ];

    const proc = spawn({
      cmd: args,
      stdout: "pipe",
      stderr: "pipe",
      timeout: timeout,
    });

    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
      proc.exited,
    ]);

    return {
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      exitCode,
      duration: Date.now() - start,
    };
  } catch (err) {
    return {
      stdout: "",
      stderr: String(err),
      exitCode: 124,
      duration: Date.now() - start,
    };
  } finally {
    // Cleanup temp file
    try { unlinkSync(localFile); } catch {}
  }
}

export async function health() {
  return { ok: true, stats: {} };
}

export async function stats() {
  return {};
}

export async function shutdown(): Promise<void> {
  console.log("[docker] shutdown");
}

// Config
export const IMAGES: Record<string, string> = {
  python: "eryx-runner/python",
  go: "eryx-runner/golang",
  rust: "eryx-runner/rust",
  java: "eryx-runner/java",
  c: "eryx-runner/c",
  cpp: "eryx-runner/cpp",
  bash: "eryx-runner/bash",
  ruby: "eryx-runner/ruby",
  php: "eryx-runner/php",
};

const MEMORY: Record<string, number> = {
  python: 512, go: 512, rust: 512, java: 512, c: 256, cpp: 256, bash: 128, ruby: 256, php: 256,
};

const FILE_EXT: Record<string, string> = {
  python: ".py", go: ".go", rust: ".rs", java: ".java", c: ".c", cpp: ".cpp", bash: ".sh", ruby: ".rb", php: ".php",
};

// Commands assume file is mounted at /tmp/main<ext>
const LANGUAGE_RUN: Record<string, string> = {
  python: "python3 /tmp/main.py",
  go: "cd /tmp && go run main.go",
  rust: "cd /tmp && rustc main.rs -o main && ./main",
  java: "cd /tmp && cp main.java Main.java && javac Main.java && java Main",
  c: "cd /tmp && gcc main.c -o main && ./main",
  cpp: "cd /tmp && g++ main.cpp -o main && ./main",
  bash: "bash /tmp/main.sh",
  ruby: "ruby /tmp/main.rb",
  php: "php /tmp/main.php",
};
