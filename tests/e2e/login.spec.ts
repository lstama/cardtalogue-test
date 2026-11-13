import { test, expect } from '@playwright/test'
import { adminEmail, adminPassword } from '../support/env'

test.describe('login', () => {
  test('redirects an unauthenticated visitor to the login page', async ({
    page,
  }) => {
    await page.goto('/storages')
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByTestId('login-submit')).toBeVisible()
  })

  test('rejects invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('login-email').fill(adminEmail)
    await page.getByTestId('login-password').fill('definitely-wrong')
    await page.getByTestId('login-submit').click()

    await expect(page.getByTestId('login-error')).toContainText(
      'Invalid email or password'
    )
    await expect(page).toHaveURL(/\/login$/)
  })

  test('logs in and keeps the session after a reload', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('login-email').fill(adminEmail)
    await page.getByTestId('login-password').fill(adminPassword)
    await page.getByTestId('login-submit').click()

    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByTestId('nav-logout')).toBeVisible()

    await page.reload()
    await expect(page.getByTestId('nav-logout')).toBeVisible()
  })

  test('logs out through the confirmation modal', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('login-email').fill(adminEmail)
    await page.getByTestId('login-password').fill(adminPassword)
    await page.getByTestId('login-submit').click()

    await expect(page.getByTestId('nav-logout')).toBeVisible()
    await page.getByTestId('nav-logout').click()
    await expect(
      page.getByRole('heading', { name: 'Confirm Logout' })
    ).toBeVisible()
    await page.getByTestId('logout-confirm').click()

    await expect(page.getByTestId('nav-login')).toBeVisible()
    await expect(page.getByTestId('nav-logout')).toHaveCount(0)
  })
})
