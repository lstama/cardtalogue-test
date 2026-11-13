import { test, expect, type Page } from '@playwright/test'
import { createCard, getProtectedCard, type Card } from '../support/api'
import { uniqueCode, uniqueName } from '../support/test-data'

async function expectSuccessAlert(page: Page, message: string) {
  const dialogPromise = page.waitForEvent('dialog')
  await page.getByTestId('confirm-save').click()
  const dialog = await dialogPromise
  expect(dialog.message()).toBe(message)
  await dialog.accept()
}

test.describe('edit card', () => {
  let fixture: Card

  test.beforeEach(async ({ request }) => {
    fixture = await createCard(request, {
      code: uniqueCode('EDIT'),
      name: uniqueName('Edit Fixture'),
      description: 'Original description',
      price: 111,
      quantity: 1,
    })
  })

  test('loads an existing card, updates it, and persists the update', async ({
    page,
    request,
  }) => {
    const newName = uniqueName('Edited Card')
    const newDescription = 'Updated from the Playwright browser test'

    await page.goto('/')
    await page.getByTestId('search-input').fill(fixture.code)
    await page.getByTestId('search-submit').click()

    const item = page.getByTestId('card-item').filter({
      hasText: fixture.code,
    })
    await expect(item).toHaveCount(1)
    await item.getByTestId('card-details').click()
    await item.getByTestId('card-edit').click()

    await expect(page.getByRole('heading', { name: 'Edit Card' })).toBeVisible()
    await expect(page.getByTestId('card-name')).toHaveValue(fixture.name)
    await expect(page.getByTestId('card-price')).toHaveValue(
      String(fixture.price)
    )

    await page.getByTestId('card-name').fill(newName)
    await page.getByTestId('card-price').fill('777')
    await page.getByTestId('card-description').fill(newDescription)
    await page
      .getByTestId('card-quantity')
      .getByRole('button', { name: '3', exact: true })
      .click()
    await page
      .getByTestId('card-for-sale')
      .getByRole('button', { name: 'No', exact: true })
      .click()

    await page.getByTestId('card-submit').click()
    await expect(
      page.getByRole('heading', { name: 'Are these data correct?' })
    ).toBeVisible()
    await expectSuccessAlert(page, 'Card updated successfully!')
    await expect(page).toHaveURL(/\/$/)

    await page.getByTestId('search-input').fill(newName)
    await page.getByTestId('search-submit').click()

    const updatedItem = page.getByTestId('card-item').filter({
      hasText: fixture.code,
    })
    await expect(updatedItem).toHaveCount(1)
    await expect(updatedItem).toContainText(newName)
    await updatedItem.getByTestId('card-details').click()
    await expect(updatedItem).toContainText(newDescription)
    await expect(updatedItem).toContainText('Price: ¥777')
    await expect(updatedItem).toContainText('Quantity: 3')
    await expect(updatedItem).toContainText('For Sale: No')

    const persisted = await getProtectedCard(request, fixture.id)
    expect(persisted).toMatchObject({
      name: newName,
      description: newDescription,
      price: 777,
      quantity: 3,
      for_sale: 'no',
    })

    await page.goto(`/create/card/${fixture.id}`)
    await expect(page.getByTestId('card-name')).toHaveValue(newName)
    await expect(page.getByTestId('card-description')).toHaveValue(
      newDescription
    )
  })
})
