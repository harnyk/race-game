import { Vec2DLegacy } from '../vec/Vec2DLegacy';

describe('Vec2D.fromPolar', () => {
  it('creates vector at given length and angle', () => {
    const v = Vec2DLegacy.fromPolar(5, Math.PI / 4);
    const comp = 5 / Math.sqrt(2);
    expect(v.x).toBeCloseTo(comp);
    expect(v.y).toBeCloseTo(comp);
  });

  it('handles zero angle', () => {
    const v = Vec2DLegacy.fromPolar(3, 0);
    expect(v.x).toBeCloseTo(3);
    expect(v.y).toBeCloseTo(0);
  });
});
