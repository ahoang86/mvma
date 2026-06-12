import { calcFare } from '../src/store/useAppStore';

describe('calcFare', () => {
  it('returns N/A when distance is missing', () => {
    expect(calcFare(10, 2.5, null)).toBe('N/A');
  });

  it('calculates base plus distance fare', () => {
    expect(calcFare(10, 2.5, 12.4)).toBe('41.00');
  });
});
