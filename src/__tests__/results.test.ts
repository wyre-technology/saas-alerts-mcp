import { describe, it, expect } from 'vitest';
import { ok, emptyGuard } from '../utils/results.js';

describe('results helpers', () => {
  it('ok wraps data as pretty JSON text', () => {
    const r = ok([{ id: 1 }]);
    expect(r.isError).toBeFalsy();
    expect(r.content[0].text).toContain('"id": 1');
  });

  it('emptyGuard flags an empty array with isError and a clear message', () => {
    const r = emptyGuard([], 'events');
    expect(r.isError).toBe(true);
    expect(r.content[0].text).toMatch(/no events/i);
  });

  it('emptyGuard passes through non-empty data', () => {
    const r = emptyGuard([{ id: 1 }], 'events');
    expect(r.isError).toBeFalsy();
    expect(r.content[0].text).toContain('"id": 1');
  });

  it('emptyGuard flags null/undefined', () => {
    expect(emptyGuard(null, 'customer').isError).toBe(true);
    expect(emptyGuard(undefined, 'customer').isError).toBe(true);
  });

  it('emptyGuard flags empty object', () => {
    expect(emptyGuard({}, 'customer').isError).toBe(true);
  });
});
