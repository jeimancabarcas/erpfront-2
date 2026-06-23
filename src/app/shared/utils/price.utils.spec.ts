import { describe, it, expect } from 'vitest';
import { computeRecommendedPrice, PRICE_MARKUP_FACTOR } from './price.utils';

describe('computeRecommendedPrice', () => {
  it('should return 1.3x the average purchase price for positive values', () => {
    expect(computeRecommendedPrice(50000)).toBe(65000);
  });

  it('should return 0 when average purchase price is 0', () => {
    expect(computeRecommendedPrice(0)).toBe(0);
  });

  it('should return a negative value when average purchase price is negative', () => {
    expect(computeRecommendedPrice(-10000)).toBe(-13000);
  });

  it('should handle decimal values correctly', () => {
    expect(computeRecommendedPrice(12345.67)).toBeCloseTo(16049.371, 3);
  });

  it('should use the exported PRICE_MARKUP_FACTOR constant', () => {
    expect(PRICE_MARKUP_FACTOR).toBe(1.3);
  });
});
