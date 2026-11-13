let sequence = 0

function suffix() {
  sequence += 1
  const random = Math.random().toString(36).slice(2, 7)
  return `${Date.now().toString(36)}-${sequence.toString(36)}-${random}`
}

export function uniqueCode(prefix = 'E2E') {
  return `${prefix}-${suffix()}`.toUpperCase()
}

export function uniqueName(label = 'E2E Card') {
  return `${label} ${suffix()}`
}

export type CardFixtureInput = {
  code: string
  name: string
  description?: string
  price?: number
  quantity?: number
  forSale?: 'yes' | 'no'
}

export function cardPayload(input: CardFixtureInput) {
  return {
    code: input.code,
    name: input.name,
    price: input.price ?? 123,
    price_multiplier: 100,
    quantity: input.quantity ?? 1,
    image_url: 'https://picsum.photos/230/330.webp',
    description: input.description ?? 'Created by the Playwright E2E suite',
    status: 'enabled',
    for_sale: input.forSale ?? 'yes',
    game_id: 1,
    language_id: 1,
    pack_id: 1,
    rarity_id: 1,
    storage_id: 1,
  }
}
