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

// ─── Sales / invoices ───────────────────────────────────────────────────────────
export type InvoiceType = 'SALE' | 'PROFORMA';
export type InvoiceStatus = 'DRAFT' | 'CONFIRMED' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED';

export interface InvoiceItem {
  id?: number;
  productId?: number;
  variantId?: number;
  variantLabel?: string;
  productName?: string;
  sku?: string;
  quantity?: number;
  unitPrice?: number;
  discount?: number;
  taxRate?: number;
  lineTotal?: number;
}

export interface Invoice {
  id?: number;
  number?: string;
  type?: InvoiceType;
  status?: InvoiceStatus;
  customerId?: number;
  customerName?: string;
  issueDate?: string;
  dueDate?: string;
  subtotal?: number;
  discount?: number;
  taxAmount?: number;
  total?: number;
  paidAmount?: number;
  balance?: number;
  notes?: string;
  items: InvoiceItem[];
}

// ─── Inventory ──────────────────────────────────────────────────────────────────
export type MovementType =
  | 'PURCHASE' | 'SALE' | 'ADJUST_IN' | 'ADJUST_OUT'
  | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'STAGE_IN' | 'STAGE_OUT' | 'RETURN_IN';

export type StageDirection = 'INBOUND' | 'OUTBOUND';

export interface InventoryStage {
  id?: number;
  name: string;
  direction?: StageDirection;
  directionLabel?: string;
  sequence?: number;
  available?: boolean;
}

export interface StockPerWarehouse {
  warehouseId: number;
  warehouseName: string;
  quantity: number;
}

export interface StageStock {
  stageId: number | null;
  stageName: string;
  available: boolean;
  quantity: number;
}

export interface VariantStock {
  variantId: number | null;
  variantLabel: string;
  sku?: string;
  quantity: number;
  availableQuantity: number;
  stages: StageStock[];
  warehouses: StockPerWarehouse[];
}

export interface StockLevel {
  productId: number;
  productName: string;
  sku?: string;
  hasVariants: boolean;
  totalQuantity: number;
  availableQuantity: number;
  variants: VariantStock[];
}

export interface StockMovement {
  id: number;
  productId: number;
  productName: string;
  sku?: string;
  variantId?: number;
  variantLabel?: string;
  warehouseId: number;
  warehouseName: string;
  stageId?: number;
  stageName?: string;
  type: MovementType;
  typeLabel: string;
  quantity: number;
  reference?: string;
  note?: string;
  createdAt: string;
  balanceAfter?: number;
}

export interface StockMovementInput {
  productId: number;
  variantId?: number | null;
  warehouseId: number;
  stageId?: number | null;
  type: MovementType;
  quantity: number;
  note?: string;
}

export interface StockTransferInput {
  productId: number;
  variantId?: number | null;
  stageId?: number | null;
  fromWarehouseId: number;
  toWarehouseId: number;
  quantity: number;
  note?: string;
}

export interface StageAdvanceInput {
  productId: number;
  variantId?: number | null;
  warehouseId: number;
  fromStageId: number;
  toStageId: number;
  quantity: number;
  note?: string;
}

// ─── Auth / RBAC ────────────────────────────────────────────────────────────────
export type Permission =
  | 'USER_MANAGE' | 'ROLE_MANAGE' | 'BASEDATA_READ' | 'BASEDATA_WRITE'
  | 'SALES' | 'INVENTORY' | 'ACCOUNTING' | 'REPORTS';

export interface PermissionInfo {
  name: Permission;
  label: string;
}

export type Feature =
  | 'SALES' | 'INVENTORY' | 'CRM' | 'ACCOUNTING' | 'REPORTS' | 'SUPPLIERS' | 'WOOCOMMERCE';

export interface AuthUser {
  id: number;
  username: string;
  fullName?: string;
  email?: string;
  tenantId: number;
  tenantName: string;
  tenantType: string;
  planLabel: string;
  roleId: number;
  roleName: string;
  permissions: Permission[];
  features: Feature[];
  active: boolean;
  lastLogin?: string;
}

export interface Plan {
  name: string;
  label: string;
  monthlyPrice: number;
  features: Feature[];
  maxUsers: number;
  maxProducts: number;
}

export interface TenantTypeInfo {
  name: string;
  label: string;
  recommendedFeatures: Feature[];
}

export interface Subscription {
  tenantName: string;
  type: string;
  typeLabel: string;
  plan: string;
  planLabel: string;
  monthlyPrice: number;
  features: Feature[];
  maxUsers: number;
  usedUsers: number;
  maxProducts: number;
  usedProducts: number;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface Role {
  id?: number;
  name: string;
  builtin?: boolean;
  permissions: Permission[];
}

export interface UserAccount {
  id?: number;
  username: string;
  password?: string;
  fullName?: string;
  email?: string;
  roleId: number;
  roleName?: string;
  tenantName?: string;
  permissions?: Permission[];
  active?: boolean;
  lastLogin?: string;
}
