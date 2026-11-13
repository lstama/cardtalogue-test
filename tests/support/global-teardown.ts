import fs from 'node:fs'
import { tmpDir } from './env'

export default async function globalTeardown() {
  fs.rmSync(tmpDir, { recursive: true, force: true })
}
