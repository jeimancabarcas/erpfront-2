/**
 * Markup factor applied to average purchase price to compute recommended selling price.
 */
export const PRICE_MARKUP_FACTOR = 1.3;

/**
 * Computes the recommended selling price based on average purchase price.
 * @param avgPurchasePrice The weighted average purchase price (PMP)
 * @returns avgPurchasePrice * PRICE_MARKUP_FACTOR
 */
export function computeRecommendedPrice(avgPurchasePrice: number): number {
  return avgPurchasePrice * PRICE_MARKUP_FACTOR;
}
