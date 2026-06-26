export interface Company {
  id?: number;
  name: string;
  nationalId?: string;
  registrationNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
  currency?: string;
  fiscalYearStart?: string;
  vatRate?: number;
}

export interface ProductVariant {
  id?: number;
  sku?: string;
  attr1Name?: string;
  attr1Value?: string;
  attr2Name?: string;
  attr2Value?: string;
  price?: number;
  stock?: number;
}

export interface Product {
  id?: number;
  name: string;
  sku?: string;
  category?: string;
  price?: number;
  type?: 'SIMPLE' | 'VARIABLE';
  source?: 'MANUAL' | 'WOOCOMMERCE';
  status?: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  description?: string;
  stock?: number;
  variants?: ProductVariant[];
}

export interface Customer {
  id?: number;
  name: string;
  phone?: string;
  email?: string;
  city?: string;
  address?: string;
  group?: 'VIP' | 'WHOLESALE' | 'RETAIL';
  source?: 'MANUAL' | 'WOOCOMMERCE';
  balance?: number;
  lastOrderDate?: string;
}

export interface Warehouse {
  id?: number;
  name: string;
  location?: string;
  manager?: string;
  capacity?: number;
  active?: boolean;
}

export interface Category {
  id?: number;
  name: string;
  parentName?: string;
  productCount?: number;
}

export interface Unit {
  id?: number;
  name: string;
  symbol?: string;
  type?: string;
}

export interface TaxRate {
  id?: number;
  name: string;
  rate?: number;
  appliesTo?: string;
  active?: boolean;
}
