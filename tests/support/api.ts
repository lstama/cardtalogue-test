import { expect, type APIRequestContext } from '@playwright/test'
import { adminEmail, adminPassword, apiBaseURL } from './env'
import { cardPayload, type CardFixtureInput } from './test-data'

export type Card = {
  id: number
  code: string
  name: string
  description: string
  price: number
  quantity: number
  for_sale: string
  status: string
}

async function token(request: APIRequestContext) {
  const response = await request.post(`${apiBaseURL}/auth/login`, {
    data: { email: adminEmail, password: adminPassword },
  })
  expect(response.ok(), 'API login should succeed').toBeTruthy()
  const body = await response.json()
  expect(body.data?.access_token).toBeTruthy()
  return body.data.access_token as string
}

export async function createCard(
  request: APIRequestContext,
  input: CardFixtureInput
): Promise<Card> {
  const accessToken = await token(request)
  const response = await request.post(`${apiBaseURL}/cards`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    data: cardPayload(input),
  })
  expect(response.ok(), 'fixture card creation should succeed').toBeTruthy()
  const body = await response.json()
  expect(body.data?.id).toBeTruthy()
  return body.data as Card
}

export async function searchCards(
  request: APIRequestContext,
  query: string
): Promise<Card[]> {
  const response = await request.get(`${apiBaseURL}/cards/search`, {
    params: { query, limit: 100, offset: 0 },
  })
  expect(response.ok(), 'card search API should succeed').toBeTruthy()
  const body = await response.json()
  return (body.data ?? []) as Card[]
}

export async function getProtectedCard(
  request: APIRequestContext,
  id: number
): Promise<Card> {
  const accessToken = await token(request)
  const response = await request.get(`${apiBaseURL}/cards/protected/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  expect(response.ok(), 'protected card read should succeed').toBeTruthy()
  const body = await response.json()
  return body.data as Card
}
