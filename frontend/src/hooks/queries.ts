import { useQuery, useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import {
  companyApi, productsApi, customersApi, warehousesApi,
  categoriesApi, unitsApi, taxRatesApi, usersApi, rolesApi, subscriptionApi,
} from '../api';
import type {
  Company, Product, Customer, Warehouse, Category, Unit, TaxRate,
  UserAccount, Role, PermissionInfo,
} from '../types';

/** A CRUD resource as exposed by the api module. */
interface CrudApi<T> {
  list: () => Promise<T[]>;
  create: (data: T) => Promise<T>;
  update: (id: number, data: T) => Promise<T>;
  delete: (id: number) => Promise<number>;
}

interface Identifiable { id?: number }

/**
 * Builds a set of React Query hooks for a CRUD resource.
 * Mutations invalidate the list query so the UI stays in sync automatically.
 */
function createResourceHooks<T extends Identifiable>(key: QueryKey, resource: CrudApi<T>) {
  const useList = (fallback?: T[]) =>
    useQuery({
      queryKey: key,
      queryFn: resource.list,
      placeholderData: fallback,
    });

  const useCreate = () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (data: T) => resource.create(data),
      onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    });
  };

  const useUpdate = () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: ({ id, data }: { id: number; data: T }) => resource.update(id, data),
      onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    });
  };

  const useRemove = () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (id: number) => resource.delete(id),
      onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    });
  };

  return { useList, useCreate, useUpdate, useRemove };
}

export const users      = createResourceHooks<UserAccount>(['users'], usersApi);
export const roles      = createResourceHooks<Role>(['roles'], rolesApi);
export const products   = createResourceHooks<Product>(['products'], productsApi);
export const customers  = createResourceHooks<Customer>(['customers'], customersApi);
export const warehouses = createResourceHooks<Warehouse>(['warehouses'], warehousesApi);
export const categories = createResourceHooks<Category>(['categories'], categoriesApi);
export const units      = createResourceHooks<Unit>(['units'], unitsApi);
export const taxRates   = createResourceHooks<TaxRate>(['tax-rates'], taxRatesApi);

// ─── Subscription / plans ───────────────────────────────────────────────────────
export function useSubscription() {
  return useQuery({ queryKey: ['subscription'], queryFn: subscriptionApi.current });
}

export function usePlans() {
  return useQuery({ queryKey: ['plans'], queryFn: subscriptionApi.plans, staleTime: Infinity });
}

export function useChangePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (plan: string) => subscriptionApi.changePlan(plan),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscription'] }),
  });
}

/** Read-only catalog of assignable permissions (for building roles). */
export function usePermissionCatalog() {
  return useQuery<PermissionInfo[]>({
    queryKey: ['permissions'],
    queryFn: rolesApi.permissions,
    staleTime: Infinity,
  });
}

/** Company is a singleton (one row), so it gets bespoke hooks. */
export function useCompany(fallback?: Company) {
  return useQuery({
    queryKey: ['company'],
    queryFn: companyApi.get,
    placeholderData: fallback,
  });
}

export function useSaveCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Company) => companyApi.save(data),
    onSuccess: saved => qc.setQueryData(['company'], saved),
  });
}
