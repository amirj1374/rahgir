import type { Product, Customer, Warehouse, Category, Unit, TaxRate } from '../../types';

export type Section =
  | 'dashboard' | 'company' | 'products' | 'customers'
  | 'woocommerce' | 'users' | 'warehouses' | 'categories'
  | 'units' | 'tax' | 'suppliers';

export const fmtNum = (n: number) => n.toLocaleString('fa-IR');

export const statusBadge = (stock: number) => {
  if (stock === 0) return { bg: 'rgba(239,68,68,.1)', color: '#ef4444', label: 'ناموجود' };
  if (stock < 10) return { bg: 'rgba(251,146,60,.1)', color: '#fb923c', label: 'کم‌موجودی' };
  return { bg: 'rgba(74,222,128,.1)', color: '#4ade80', label: 'فعال' };
};

export const META: Record<Section, { title: string; crumb: string }> = {
  dashboard:   { title: 'پیشخوان', crumb: 'اطلاعات پایه / داشبورد' },
  company:     { title: 'اطلاعات شرکت', crumb: 'اطلاعات پایه / شرکت' },
  products:    { title: 'مدیریت محصولات', crumb: 'اطلاعات پایه / محصولات' },
  categories:  { title: 'دسته‌بندی‌ها', crumb: 'اطلاعات پایه / دسته‌بندی‌ها' },
  customers:   { title: 'مشتریان', crumb: 'اطلاعات پایه / مشتریان' },
  suppliers:   { title: 'تامین‌کنندگان', crumb: 'اطلاعات پایه / تامین‌کنندگان' },
  warehouses:  { title: 'انبارها', crumb: 'اطلاعات پایه / انبارها' },
  units:       { title: 'واحدهای اندازه‌گیری', crumb: 'اطلاعات پایه / واحدها' },
  tax:         { title: 'تنظیمات مالیاتی', crumb: 'اطلاعات پایه / مالیات' },
  users:       { title: 'کاربران و دسترسی‌ها', crumb: 'اطلاعات پایه / کاربران' },
  woocommerce: { title: 'اتصال ووکامرس', crumb: 'اطلاعات پایه / ووکامرس' },
};

export const HDR_BTN: Record<Section, string> = {
  dashboard: 'اتصال WC', company: 'ذخیره', products: '+ محصول جدید',
  categories: '+ دسته‌بندی', customers: '+ مشتری جدید', suppliers: 'در حال توسعه',
  warehouses: '+ انبار جدید', units: '+ واحد جدید', tax: '+ نرخ مالیاتی',
  users: '+ کاربر', woocommerce: 'اتصال ←',
};

export const AV_COLORS = ['#e8a94c', '#38bdf8', '#4ade80', '#a78bfa', '#fb923c'];

// ─── Fallback mock data (shown until the API responds) ──────────────────────────
export const MOCK_PRODUCTS: Product[] = [
  { id: 1, sku: 'TSH-001', name: 'تی‌شرت مردانه', category: 'پوشاک', price: 185000, type: 'VARIABLE', source: 'WOOCOMMERCE', status: 'ACTIVE', stock: 125 },
  { id: 2, sku: 'SHO-002', name: 'کفش اسپورت رانینگ', category: 'کفش', price: 850000, type: 'SIMPLE', source: 'WOOCOMMERCE', status: 'ACTIVE', stock: 12 },
  { id: 3, sku: 'JNS-003', name: 'شلوار جین اسلیم فیت', category: 'پوشاک', price: 420000, type: 'VARIABLE', source: 'WOOCOMMERCE', status: 'ACTIVE', stock: 84 },
  { id: 4, sku: 'BAG-004', name: 'کیف چرم زنانه', category: 'کیف', price: 670000, type: 'SIMPLE', source: 'WOOCOMMERCE', status: 'ACTIVE', stock: 8 },
  { id: 5, sku: 'PRF-005', name: 'عطر مردانه کلاسیک', category: 'عطر', price: 1200000, type: 'SIMPLE', source: 'MANUAL', status: 'ACTIVE', stock: 35 },
  { id: 6, sku: 'CAP-006', name: 'کلاه بیسبال', category: 'پوشاک', price: 125000, type: 'SIMPLE', source: 'WOOCOMMERCE', status: 'OUT_OF_STOCK', stock: 0 },
  { id: 7, sku: 'BLT-007', name: 'کمربند چرمی مردانه', category: 'اکسسوری', price: 280000, type: 'SIMPLE', source: 'WOOCOMMERCE', status: 'ACTIVE', stock: 19 },
  { id: 8, sku: 'SRT-008', name: 'شورت ورزشی', category: 'پوشاک', price: 95000, type: 'SIMPLE', source: 'MANUAL', status: 'ACTIVE', stock: 52 },
];

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 1, name: 'علی محمدی', phone: '0912-123-4567', group: 'VIP', balance: 520000, source: 'WOOCOMMERCE' },
  { id: 2, name: 'سارا احمدی', phone: '0935-987-6543', group: 'WHOLESALE', balance: -1200000, source: 'WOOCOMMERCE' },
  { id: 3, name: 'رضا کریمی', phone: '0917-456-7890', group: 'RETAIL', balance: 0, source: 'MANUAL' },
  { id: 4, name: 'مریم تهرانی', phone: '0936-321-0987', group: 'VIP', balance: 85000, source: 'WOOCOMMERCE' },
  { id: 5, name: 'حسن رضایی', phone: '0921-654-3210', group: 'WHOLESALE', balance: -3500000, source: 'WOOCOMMERCE' },
];

export const MOCK_WAREHOUSES: Warehouse[] = [
  { id: 1, name: 'انبار اصلی', location: 'تهران، انبار مرکزی', manager: 'علی محمدی', capacity: 5000, active: true },
  { id: 2, name: 'انبار ۲', location: 'تهران، شعبه غرب', manager: 'رضا کریمی', capacity: 2000, active: true },
  { id: 3, name: 'انبار یدکی', location: 'کرج، مجتمع صنعتی', manager: 'سارا احمدی', capacity: 1000, active: false },
];

export const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: 'پوشاک', parentName: '–', productCount: 12 },
  { id: 2, name: 'کفش و کیف', parentName: '–', productCount: 8 },
  { id: 3, name: 'عطر و بهداشت', parentName: '–', productCount: 5 },
  { id: 4, name: 'تی‌شرت', parentName: 'پوشاک', productCount: 4 },
  { id: 5, name: 'شلوار', parentName: 'پوشاک', productCount: 3 },
  { id: 6, name: 'کفش اسپورت', parentName: 'کفش و کیف', productCount: 5 },
];

export const MOCK_UNITS: Unit[] = [
  { id: 1, name: 'عدد', symbol: 'عدد', type: 'تعداد' },
  { id: 2, name: 'کیلوگرم', symbol: 'kg', type: 'وزن' },
  { id: 3, name: 'متر', symbol: 'm', type: 'طول' },
  { id: 4, name: 'لیتر', symbol: 'L', type: 'حجم' },
  { id: 5, name: 'جفت', symbol: 'جفت', type: 'تعداد' },
  { id: 6, name: 'بسته', symbol: 'بسته', type: 'تعداد' },
];

export const MOCK_TAX: TaxRate[] = [
  { id: 1, name: 'مالیات ارزش افزوده عمومی', rate: 10, active: true, appliesTo: 'همه کالاها' },
  { id: 2, name: 'معاف از مالیات', rate: 0, active: true, appliesTo: 'اقلام غذایی ضروری' },
  { id: 3, name: 'مالیات تجملاتی', rate: 25, active: false, appliesTo: 'کالاهای لوکس' },
];
