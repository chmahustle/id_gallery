import { FORBIDDEN_CONTENT_STRINGS as LIST } from './forbidden-strings.mjs'

export const FORBIDDEN_CONTENT_STRINGS = LIST

export type ForbiddenContentString = (typeof LIST)[number]
