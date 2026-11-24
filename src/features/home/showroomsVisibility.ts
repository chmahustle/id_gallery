import { featureFlags } from '../../data/featureFlags'
import { isVerifiedShowroom, showrooms } from '../../data/showrooms'

/** Блок «Шоурумы» на главной — только при включённом флаге и хотя бы одном проверенном шоуруме */
export function hasVerifiedShowrooms(): boolean {
  return featureFlags.showShowrooms && showrooms.some(isVerifiedShowroom)
}
