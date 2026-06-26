import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../Badge';

describe('Badge', () => {
  it('renders its label', () => {
    render(<Badge label="فعال" color="#4ade80" />);
    expect(screen.getByText('فعال')).toBeInTheDocument();
  });

  it('defaults background to the color at low opacity', () => {
    render(<Badge label="x" color="#123456" />);
    expect(screen.getByText('x')).toHaveStyle({ color: 'rgb(18, 52, 86)' });
  });
});
