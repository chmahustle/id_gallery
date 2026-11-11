import type { ContentStatus, ProductVariant } from '../types'

/** Образцы исполнения для демо-товаров (не фабричные названия тканей). */
export type FinishSample = ProductVariant & {
  status: ContentStatus
}

export const FINISH_SAMPLES: FinishSample[] = [
  {
    id: 'sample-a',
    name: 'Образец A',
    swatch: 'var(--color-cream)',
    status: 'placeholder',
  },
  {
    id: 'sample-b',
    name: 'Образец B',
    swatch: 'var(--color-ink)',
    status: 'placeholder',
  },
  {
    id: 'sample-c',
    name: 'Образец C',
    swatch: 'var(--color-olive)',
    status: 'placeholder',
  },
  {
    id: 'sample-d',
    name: 'Образец D',
    swatch: 'var(--color-champagne)',
    status: 'placeholder',
  },
]

export function demoFinishSamples(prefix: string): FinishSample[] {
  return FINISH_SAMPLES.map((sample) => ({
    ...sample,
    id: `${prefix}-${sample.id}`,
  }))
}
