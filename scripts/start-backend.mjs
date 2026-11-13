import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const repoRoot = process.cwd()
const backendDir = path.resolve(repoRoot, '../cardtalogue-backend')
const tmpDir =
  process.env.E2E_TMP_DIR ?? path.join(os.tmpdir(), 'cardtalogue-e2e')

fs.rmSync(tmpDir, { recursive: true, force: true })
fs.mkdirSync(tmpDir, { recursive: true })

const binary = path.join(tmpDir, 'cardtalogue-api')
const build = spawnSync('go', ['build', '-o', binary, './cmd/api'], {
  cwd: backendDir,
  stdio: 'inherit',
})

if (build.status !== 0) {
  process.exit(build.status ?? 1)
}

const child = spawn(binary, [], {
  cwd: backendDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    DATABASE_DRIVER: 'sqlite',
    DATABASE_URL: `file:${path.join(tmpDir, 'data.db')}`,
    PORT: '8080',
    JWT_SECRET: 'e2e-only-secret',
    DEFAULT_ADMIN_EMAIL: process.env.E2E_ADMIN_EMAIL ?? 'admin@example.com',
    DEFAULT_ADMIN_PASSWORD:
      process.env.E2E_ADMIN_PASSWORD ?? 'admin123',
    FRONTEND_HOSTS:
      'http://localhost:3000,http://127.0.0.1:3000',
    MEDIA_UPLOAD_PATH: path.join(tmpDir, 'uploads'),
    // No scanner process is started or called by these tests.
    CARD_SCAN_API_URL: 'http://127.0.0.1:1/api/recognize',
    CAPTCHA_MODE: 'off',
    API_CONTRACT_VALIDATE: '1',
    GIN_MODE: 'release',
    OTEL_TRACES_EXPORTER: 'none',
    OTEL_METRICS_EXPORTER: 'none',
  },
})

const shutdown = (signal) => {
  child.kill(signal)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal)
  process.exit(code ?? 1)
})
