import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ProductsSection } from '../ProductsSection';

// Mock the api layer so the component never hits the network.
vi.mock('../../../api', () => ({
  productsApi: {
    list: vi.fn().mockResolvedValue([
      { id: 101, name: 'محصول تستی', sku: 'TST-1', category: 'تست', price: 5000, stock: 7, source: 'MANUAL' },
    ]),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  customersApi: {}, warehousesApi: {}, categoriesApi: {}, unitsApi: {}, taxRatesApi: {}, companyApi: {},
}));

function wrap(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe('ProductsSection', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders products returned by the API', async () => {
    wrap(<ProductsSection />);
    await waitFor(() => expect(screen.getByText('محصول تستی')).toBeInTheDocument());
  });

  it('shows the fallback mock data immediately while loading', () => {
    wrap(<ProductsSection />);
    // placeholderData (MOCK_PRODUCTS) is shown before the query resolves
    expect(screen.getByText('تی‌شرت مردانه')).toBeInTheDocument();
  });
});
