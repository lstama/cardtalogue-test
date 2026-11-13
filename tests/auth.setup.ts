import fs from 'node:fs'
import path from 'node:path'
import { test as setup, expect } from '@playwright/test'
import { adminEmail, adminPassword, authFile } from './support/env'

setup('authenticate as admin', async ({ page }) => {
  fs.mkdirSync(path.dirname(authFile), { recursive: true })

  await page.goto('/login')
  await page.getByTestId('login-email').fill(adminEmail)
  await page.getByTestId('login-password').fill(adminPassword)
  await page.getByTestId('login-submit').click()

  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByTestId('nav-logout')).toBeVisible()

  await page.context().storageState({ path: authFile })
})
