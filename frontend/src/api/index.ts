import axios from 'axios';
import type { Company, Product, Customer, Warehouse, Category, Unit, TaxRate } from '../types';

const api = axios.create({ baseURL: '/api' });

export const companyApi = {
  get: () => api.get<Company>('/company').then(r => r.data),
  save: (data: Company) => api.put<Company>('/company', data).then(r => r.data),
};

export const productsApi = {
  list: () => api.get<Product[]>('/products').then(r => r.data),
  create: (data: Product) => api.post<Product>('/products', data).then(r => r.data),
  update: (id: number, data: Product) => api.put<Product>(`/products/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/products/${id}`),
};

export const customersApi = {
  list: () => api.get<Customer[]>('/customers').then(r => r.data),
  create: (data: Customer) => api.post<Customer>('/customers', data).then(r => r.data),
  update: (id: number, data: Customer) => api.put<Customer>(`/customers/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/customers/${id}`),
};

export const warehousesApi = {
  list: () => api.get<Warehouse[]>('/warehouses').then(r => r.data),
  create: (data: Warehouse) => api.post<Warehouse>('/warehouses', data).then(r => r.data),
  update: (id: number, data: Warehouse) => api.put<Warehouse>(`/warehouses/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/warehouses/${id}`),
};

export const categoriesApi = {
  list: () => api.get<Category[]>('/categories').then(r => r.data),
  create: (data: Category) => api.post<Category>('/categories', data).then(r => r.data),
  update: (id: number, data: Category) => api.put<Category>(`/categories/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

export const unitsApi = {
  list: () => api.get<Unit[]>('/units').then(r => r.data),
  create: (data: Unit) => api.post<Unit>('/units', data).then(r => r.data),
  update: (id: number, data: Unit) => api.put<Unit>(`/units/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/units/${id}`),
};

export const taxRatesApi = {
  list: () => api.get<TaxRate[]>('/tax-rates').then(r => r.data),
  create: (data: TaxRate) => api.post<TaxRate>('/tax-rates', data).then(r => r.data),
  update: (id: number, data: TaxRate) => api.put<TaxRate>(`/tax-rates/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/tax-rates/${id}`),
};
