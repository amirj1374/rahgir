import { describe, it, expect } from 'vitest';
import { fmtNum, statusBadge } from '../shared';

describe('fmtNum', () => {
  it('formats numbers with Persian digits', () => {
    expect(fmtNum(1234)).toBe('۱٬۲۳۴');
    expect(fmtNum(0)).toBe('۰');
  });
});

describe('statusBadge', () => {
  it('returns out-of-stock for zero', () => {
    expect(statusBadge(0).label).toBe('ناموجود');
  });
  it('returns low-stock under 10', () => {
    expect(statusBadge(5).label).toBe('کم‌موجودی');
  });
  it('returns active for healthy stock', () => {
    expect(statusBadge(50).label).toBe('فعال');
  });
});
