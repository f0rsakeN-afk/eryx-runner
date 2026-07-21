/**
 * Bun native runner - fast execution for JS/TS
 */

import { spawn } from "bun";
import { rmSync } from "fs";

export interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;
}

const EXTENSION: Record<string, string> = {
  javascript: "js",
  typescript: "ts",
  js: "js",
  ts: "ts",
  node: "js",
};

const RUNNER: Record<string, string[]> = {
  javascript: ["node"],
  typescript: ["npx", "tsx"],
  js: ["node"],
  ts: ["npx", "tsx"],
  node: ["node"],
};

export async function run(
  code: string,
  language: string
): Promise<RunResult> {
  const start = Date.now();
  const ext = EXTENSION[language] || "js";
  const runner = RUNNER[language] || ["node"];
  const tempDir = `/tmp/eryx-${Date.now()}`;
  const file = `${tempDir}/main.${ext}`;

  // Write code to temp file
  await Bun.write(file, code);
  await Bun.write(`${file}.lock`, ""); // prevent weird Bun lock

  try {
    // Execute with timeout
    const proc = spawn({
      cmd: [...runner, file],
      cwd: tempDir,
      stdout: "pipe",
      stderr: "pipe",
      env: {
        NODE_ENV: "production",
        PATH: process.env.PATH,
      },
    });

    const [stdout, stderr] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
    ]);

    const exitCode = await proc.exited;

    return {
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      exitCode,
      duration: Date.now() - start,
    };
  } finally {
    // Cleanup
    rmSync(tempDir, { recursive: true, force: true });
  }
}

export function isNativeLanguage(lang: string): boolean {
  return ["javascript", "js", "node", "typescript", "ts"].includes(lang.toLowerCase());
}
