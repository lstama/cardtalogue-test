import { test, expect, type Page } from '@playwright/test'
import { createCard, type Card } from '../support/api'
import { uniqueCode, uniqueName } from '../support/test-data'

async function searchFor(page: Page, query: string) {
  await page.goto('/')
  await page.getByTestId('search-input').fill(query)
  await page.getByTestId('search-submit').click()
}

test.describe('card search', () => {
  let fixture: Card

  test.beforeEach(async ({ request }) => {
    fixture = await createCard(request, {
      code: uniqueCode('SEARCH'),
      name: uniqueName('Search Fixture'),
      description: 'A card created for the search test',
      price: 321,
    })
  })

  test('finds a card by name and shows its details', async ({ page }) => {
    await searchFor(page, fixture.name)

    const item = page.getByTestId('card-item').filter({ hasText: fixture.code })
    await expect(item).toHaveCount(1)
    await expect(item).toContainText(fixture.name)

    await item.getByTestId('card-details').click()
    await expect(item).toContainText('A card created for the search test')
    await expect(item).toContainText('Price: ¥321')
  })

  test('finds a card by code', async ({ page }) => {
    await searchFor(page, fixture.code)

    const item = page.getByTestId('card-item').filter({ hasText: fixture.code })
    await expect(item).toHaveCount(1)
    await expect(item).toContainText(fixture.name)
  })

  test('shows the empty state for a non-matching query', async ({ page }) => {
    await searchFor(page, `NO-SUCH-CARD-${Date.now()}`)

    await expect(page.getByTestId('search-empty')).toContainText(
      'No card found'
    )
    await expect(page.getByTestId('card-item')).toHaveCount(0)
  })
})
