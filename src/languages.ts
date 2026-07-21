/**
 * Language configurations - single source of truth
 */

export interface LanguageConfig {
  image: string;
  entrypoint: string;
  run: string;
  timeout: number;
  memory: number; // MB
  env: string[];
}

// Core 8 languages that cover 95% of use cases
export const LANGUAGES: Record<string, LanguageConfig> = {
  javascript: {
    image: "eryx-runner/javascript",
    entrypoint: "/entrypoint.sh",
    run: "node",
    timeout: 30_000,
    memory: 256,
    env: ["NODE_ENV=production"],
  },
  typescript: {
    image: "eryx-runner/typescript",
    entrypoint: "/entrypoint.sh",
    run: "npx tsx",
    timeout: 30_000,
    memory: 256,
    env: ["NODE_ENV=production"],
  },
  python: {
    image: "eryx-runner/python",
    entrypoint: "/entrypoint.sh",
    run: "python3",
    timeout: 30_000,
    memory: 512,
    env: ["PYTHONDONTWRITEBYTECODE=1"],
  },
  go: {
    image: "eryx-runner/golang",
    entrypoint: "/entrypoint.sh",
    run: "go run",
    timeout: 45_000,
    memory: 512,
    env: [],
  },
  rust: {
    image: "eryx-runner/rust",
    entrypoint: "/entrypoint.sh",
    run: "./main",
    timeout: 60_000,
    memory: 512,
    env: [],
  },
  java: {
    image: "eryx-runner/java",
    entrypoint: "/entrypoint.sh",
    run: "java Main",
    timeout: 45_000,
    memory: 512,
    env: [],
  },
  c: {
    image: "eryx-runner/c",
    entrypoint: "/entrypoint.sh",
    run: "./main",
    timeout: 30_000,
    memory: 256,
    env: [],
  },
  cpp: {
    image: "eryx-runner/cpp",
    entrypoint: "/entrypoint.sh",
    run: "./main",
    timeout: 30_000,
    memory: 256,
    env: [],
  },
  bash: {
    image: "eryx-runner/bash",
    entrypoint: "/entrypoint.sh",
    run: "bash",
    timeout: 15_000,
    memory: 128,
    env: [],
  },
  ruby: {
    image: "eryx-runner/ruby",
    entrypoint: "/entrypoint.sh",
    run: "ruby",
    timeout: 30_000,
    memory: 256,
    env: [],
  },
  php: {
    image: "eryx-runner/php",
    entrypoint: "/entrypoint.sh",
    run: "php",
    timeout: 30_000,
    memory: 256,
    env: [],
  },
};

export const LANGUAGE_ALIASES: Record<string, string> = {
  // JS variants
  js: "javascript",
  node: "javascript",
  nodejs: "javascript",
  ts: "typescript",
  // Python variants
  py: "python",
  python3: "python",
  // Shell
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  // C family
  cxx: "cpp",
  "c++": "cpp",
  // Others
  rb: "ruby",
};

export function resolveLanguage(lang: string): string {
  const lower = lang.toLowerCase();
  return LANGUAGE_ALIASES[lower] || lower;
}

export function isSupported(lang: string): boolean {
  return LANGUAGES[resolveLanguage(lang)] !== undefined;
}
