import axios from 'axios';
import type { Company, Product, Customer, Warehouse, Category, Unit, TaxRate } from '../types';

/** Backend wraps every response in { success, data, message }. */
interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message: string | null;
}

const api = axios.create({ baseURL: '/api' });

/**
 * Unwrap the ApiResponse envelope so callers receive the raw payload.
 * 204 responses (empty body) pass through as-is.
 */
api.interceptors.response.use(
  response => {
    const body = response.data as ApiEnvelope<unknown> | '' | null;
    if (body && typeof body === 'object' && 'success' in body) {
      response.data = (body as ApiEnvelope<unknown>).data;
    }
    return response;
  },
  error => {
    const envelope = error.response?.data as ApiEnvelope<unknown> | undefined;
    const message = envelope?.message ?? error.message ?? 'خطای ناشناخته';
    return Promise.reject(new Error(message));
  },
);

export const companyApi = {
  get: () => api.get<Company>('/company').then(r => r.data),
  save: (data: Company) => api.put<Company>('/company', data).then(r => r.data),
};

export const productsApi = {
  list: () => api.get<Product[]>('/products').then(r => r.data),
  create: (data: Product) => api.post<Product>('/products', data).then(r => r.data),
  update: (id: number, data: Product) => api.put<Product>(`/products/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/products/${id}`).then(() => id),
};

export const customersApi = {
  list: () => api.get<Customer[]>('/customers').then(r => r.data),
  create: (data: Customer) => api.post<Customer>('/customers', data).then(r => r.data),
  update: (id: number, data: Customer) => api.put<Customer>(`/customers/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/customers/${id}`).then(() => id),
};

export const warehousesApi = {
  list: () => api.get<Warehouse[]>('/warehouses').then(r => r.data),
  create: (data: Warehouse) => api.post<Warehouse>('/warehouses', data).then(r => r.data),
  update: (id: number, data: Warehouse) => api.put<Warehouse>(`/warehouses/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/warehouses/${id}`).then(() => id),
};

export const categoriesApi = {
  list: () => api.get<Category[]>('/categories').then(r => r.data),
  create: (data: Category) => api.post<Category>('/categories', data).then(r => r.data),
  update: (id: number, data: Category) => api.put<Category>(`/categories/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/categories/${id}`).then(() => id),
};

export const unitsApi = {
  list: () => api.get<Unit[]>('/units').then(r => r.data),
  create: (data: Unit) => api.post<Unit>('/units', data).then(r => r.data),
  update: (id: number, data: Unit) => api.put<Unit>(`/units/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/units/${id}`).then(() => id),
};

export const taxRatesApi = {
  list: () => api.get<TaxRate[]>('/tax-rates').then(r => r.data),
  create: (data: TaxRate) => api.post<TaxRate>('/tax-rates', data).then(r => r.data),
  update: (id: number, data: TaxRate) => api.put<TaxRate>(`/tax-rates/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/tax-rates/${id}`).then(() => id),
};
