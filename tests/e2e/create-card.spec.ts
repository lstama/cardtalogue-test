import { test, expect, type Page } from '@playwright/test'
import { searchCards } from '../support/api'
import { uniqueCode, uniqueName } from '../support/test-data'

async function expectSuccessAlert(page: Page, message: string) {
  const dialogPromise = page.waitForEvent('dialog')
  await page.getByTestId('confirm-save').click()
  const dialog = await dialogPromise
  expect(dialog.message()).toBe(message)
  await dialog.accept()
}

test.describe('create card', () => {
  test('creates a card through the form and finds it in search', async ({
    page,
    request,
  }) => {
    const code = uniqueCode('CREATE')
    const name = uniqueName('Created Card')
    const description = `Created from the browser at ${Date.now()}`

    await page.goto('/')
    await page.getByTestId('nav-add').click()
    await page.getByTestId('nav-add-card').click()

    await expect(page.getByRole('heading', { name: 'Add Card' })).toBeVisible()

    await page.getByTestId('card-code').fill(code)
    await page.getByTestId('card-name').fill(name)
    await page.getByTestId('card-price').fill('250')
    await page
      .getByTestId('card-quantity')
      .getByRole('button', { name: '2', exact: true })
      .click()
    await page
      .getByTestId('card-for-sale')
      .getByRole('button', { name: 'No', exact: true })
      .click()
    await page.getByTestId('card-image-url').fill('https://example.com/e2e.webp')
    await page.getByTestId('card-description').fill(description)

    await page.getByTestId('card-submit').click()
    await expect(
      page.getByRole('heading', { name: 'Are these data correct?' })
    ).toBeVisible()
    await expectSuccessAlert(page, 'Card created successfully!')

    await page.goto('/')
    await page.getByTestId('search-input').fill(code)
    await page.getByTestId('search-submit').click()

    const item = page.getByTestId('card-item').filter({ hasText: code })
    await expect(item).toHaveCount(1)
    await expect(item).toContainText(name)
    await expect(item).toContainText('NOT FOR SALE')

    await item.getByTestId('card-details').click()
    await expect(item).toContainText(description)
    await expect(item).toContainText('Price: ¥250')
    await expect(item).toContainText('Quantity: 2')

    const persisted = await searchCards(request, code)
    const card = persisted.find((entry) => entry.code === code)
    expect(card).toMatchObject({
      name,
      description,
      price: 250,
      quantity: 2,
      for_sale: 'no',
    })
  })
})
