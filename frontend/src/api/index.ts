import axios from 'axios';
import type {
  Company, Product, Customer, Warehouse, Category, Unit, TaxRate,
  AuthResponse, AuthUser, Role, UserAccount, PermissionInfo,
} from '../types';

/** Backend wraps every response in { success, data, message }. */
interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message: string | null;
}

const TOKEN_KEY = 'bc_token';
export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

/** Fired when the server rejects the token; the app listens and logs out. */
export const AUTH_EXPIRED_EVENT = 'bc:auth-expired';

const api = axios.create({ baseURL: '/api' });

// Attach the bearer token to every request.
api.interceptors.request.use(config => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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
    // A 401 on anything other than the login attempt means the session expired.
    const url = error.config?.url ?? '';
    if (error.response?.status === 401 && !url.includes('/auth/login')) {
      tokenStore.clear();
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    const envelope = error.response?.data as ApiEnvelope<unknown> | undefined;
    const message = envelope?.message ?? error.message ?? 'خطای ناشناخته';
    return Promise.reject(new Error(message));
  },
);

export const authApi = {
  login: (username: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { username, password }).then(r => r.data),
  me: () => api.get<AuthUser>('/auth/me').then(r => r.data),
};

export const usersApi = {
  list: () => api.get<UserAccount[]>('/users').then(r => r.data),
  create: (data: UserAccount) => api.post<UserAccount>('/users', data).then(r => r.data),
  update: (id: number, data: UserAccount) => api.put<UserAccount>(`/users/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/users/${id}`).then(() => id),
};

export const rolesApi = {
  list: () => api.get<Role[]>('/roles').then(r => r.data),
  permissions: () => api.get<PermissionInfo[]>('/roles/permissions').then(r => r.data),
  create: (data: Role) => api.post<Role>('/roles', data).then(r => r.data),
  update: (id: number, data: Role) => api.put<Role>(`/roles/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/roles/${id}`).then(() => id),
};

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
