/**
 * Router - routes execution to the right executor
 */

import { run as nativeRun, isNativeLanguage } from "./runner";
import { run as dockerRun, init as initDocker, health as dockerHealth, stats as dockerStats, shutdown as dockerShutdown } from "./docker";
import { resolveLanguage } from "./languages";

export interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;
}

export async function run(code: string, language: string, timeout = 30000): Promise<RunResult> {
  const lang = resolveLanguage(language);

  if (isNativeLanguage(lang)) {
    return nativeRun(code, lang);
  }

  return dockerRun(code, lang, timeout);
}

export async function init(): Promise<void> {
  await initDocker();
}

export async function health() {
  return dockerHealth();
}

export async function stats() {
  return dockerStats();
}

export async function shutdown(): Promise<void> {
  await dockerShutdown();
}
