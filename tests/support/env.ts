import os from 'node:os'
import path from 'node:path'

export const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
export const apiBaseURL =
  process.env.E2E_API_URL ?? 'http://localhost:8080/api/v1'

export const adminEmail = process.env.E2E_ADMIN_EMAIL ?? 'admin@example.com'
export const adminPassword = process.env.E2E_ADMIN_PASSWORD ?? 'admin123'

export const authFile =
  process.env.E2E_AUTH_FILE ?? path.resolve(process.cwd(), '.auth/admin.json')

export const tmpDir =
  process.env.E2E_TMP_DIR ?? path.join(os.tmpdir(), 'cardtalogue-e2e')
