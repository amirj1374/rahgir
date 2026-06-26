import { useState, useMemo } from 'react';
import { ModuleShell, PageHeader } from '../components/layout/ModuleShell';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { TextInput, SelectInput, Textarea } from '../components/ui/Input';
import { COLOR, FONT, RADIUS } from '../styles/tokens';
import { fmtNum } from '../hooks/useFormat';
import {
  useStockLevels, useStockMovements, useRecordMovement, useTransferStock,
  warehouses as warehouseHooks, products as productHooks,
} from '../hooks/queries';
import type { MovementType, StockLevel, VariantStock, Product } from '../types';

interface Props { onBack: () => void }

const ACC = COLOR.module.inventory;
const NAV = [
  { id: 'stock',        label: 'موجودی کالا',  icon: '📦' },
  { id: 'transactions', label: 'تراکنش‌ها',    icon: '📋' },
  { id: 'transfer',     label: 'جابجایی انبار', icon: '🔄' },
];

const MOVEMENT_COLOR: Record<string, string> = {
  PURCHASE: '#4ade80', RETURN_IN: '#4ade80', ADJUST_IN: '#38bdf8', TRANSFER_IN: '#38bdf8',
  SALE: '#ef4444', ADJUST_OUT: '#fb923c', TRANSFER_OUT: '#fb923c',
};
const isInbound = (t: MovementType) => ['PURCHASE', 'RETURN_IN', 'ADJUST_IN', 'TRANSFER_IN'].includes(t);

export default function InventoryModule({ onBack }: Props) {
  const [section, setSection] = useState('stock');

  const { data: levels = [] } = useStockLevels();
  const { data: movements = [] } = useStockMovements();
  const { data: warehouses = [] } = warehouseHooks.useList();
  const { data: products = [] } = productHooks.useList();

  const [showMove, setShowMove] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const totalUnits = useMemo(() => levels.reduce((a, l) => a + l.totalQuantity, 0), [levels]);
  const lowCount = useMemo(() => levels.filter(l => l.totalQuantity > 0 && l.totalQuantity <= 5).length, [levels]);
  const outCount = useMemo(() => levels.filter(l => l.totalQuantity <= 0).length, [levels]);

  const footer = [
    { label: 'کل واحدها', value: fmtNum(totalUnits) },
    { label: 'رو به اتمام', value: fmtNum(lowCount) },
    { label: 'ناموجود', value: fmtNum(outCount) },
  ];

  const headerAction = section === 'stock'
    ? <Button variant="primary" color={ACC} onClick={() => setShowMove(true)}>+ ثبت ورود / تعدیل</Button>
    : section === 'transfer'
      ? <Button variant="primary" color={ACC} onClick={() => setShowTransfer(true)}>+ جابجایی جدید</Button>
      : undefined;

  const pageTitle = NAV.find(n => n.id === section)?.label ?? '';

  return (
    <ModuleShell accent={ACC} icon="📦" title="انبارداری" subtitle="موجودی و گردش کالا"
      navItems={NAV} section={section} onSection={setSection} onBack={onBack} sidebarFooter={footer}>
      <PageHeader title={pageTitle} color={ACC} action={headerAction} />

      {section === 'stock' && (
        <StockView levels={levels} expanded={expanded} setExpanded={setExpanded} />
      )}

      {section === 'transactions' && (
        <div style={{ background: COLOR.surface, borderRadius: RADIUS.lg, overflow: 'hidden', border: `1px solid ${COLOR.border}` }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: COLOR.surfaceAlt }}>
                {['تاریخ', 'نوع', 'کالا', 'انبار', 'تعداد', 'مانده', 'مرجع'].map(h => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {movements.length === 0 && (
                <tr><td colSpan={7} style={{ padding: 28, textAlign: 'center', color: COLOR.textFaint, fontSize: FONT.base }}>تراکنشی ثبت نشده است</td></tr>
              )}
              {movements.map((m, i) => (
                <tr key={m.id} style={{ background: i % 2 ? 'rgba(255,255,255,.015)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,.03)' }}>
                  <td style={td}><span style={{ direction: 'ltr', display: 'inline-block' }}>{m.createdAt?.slice(0, 16).replace('T', ' ')}</span></td>
                  <td style={td}><span style={{ color: MOVEMENT_COLOR[m.type] ?? COLOR.textSecondary, fontWeight: 700, fontSize: FONT.xs + 2 }}>{m.typeLabel}</span></td>
                  <td style={td}>
                    <div style={{ color: COLOR.textPrimary, fontWeight: 600 }}>{m.productName}</div>
                    {m.variantLabel && <div style={{ fontSize: FONT.xs + 1, color: '#a78bfa' }}>{m.variantLabel}</div>}
                  </td>
                  <td style={td}>{m.warehouseName}</td>
                  <td style={{ ...td, fontWeight: 800, color: isInbound(m.type) ? '#4ade80' : '#ef4444', fontVariantNumeric: 'tabular-nums' }}>
                    {isInbound(m.type) ? '+' : '−'}{fmtNum(m.quantity)}
                  </td>
                  <td style={{ ...td, fontVariantNumeric: 'tabular-nums', color: COLOR.textPrimary }}>{m.balanceAfter != null ? fmtNum(m.balanceAfter) : '—'}</td>
                  <td style={{ ...td, color: COLOR.textFaint, fontSize: FONT.xs + 1 }}>{m.reference || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {section === 'transfer' && (
        <div style={{ background: COLOR.surface, borderRadius: RADIUS.lg, border: `1px solid ${COLOR.border}`, padding: 28, textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12, opacity: .25 }}>🔄</div>
          <p style={{ fontSize: FONT.base, color: COLOR.textFaint, margin: '0 0 16px' }}>کالا را بین انبارها جابجا کنید — گردش آن در تراکنش‌ها ثبت می‌شود.</p>
          <Button variant="primary" color={ACC} onClick={() => setShowTransfer(true)}>+ جابجایی جدید</Button>
        </div>
      )}

      {showMove && <MovementModal onClose={() => setShowMove(false)} products={products} warehouses={warehouses} />}
      {showTransfer && <TransferModal onClose={() => setShowTransfer(false)} products={products} warehouses={warehouses} />}
    </ModuleShell>
  );
}

// ─── Stock view: product → variant → warehouse ────────────────────────────────────
function StockView({ levels, expanded, setExpanded }: {
  levels: StockLevel[];
  expanded: Record<number, boolean>;
  setExpanded: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
}) {
  if (levels.length === 0) {
    return <div style={{ background: COLOR.surface, borderRadius: RADIUS.lg, border: `1px solid ${COLOR.border}`, padding: 28, textAlign: 'center', color: COLOR.textFaint, fontSize: FONT.base }}>کالایی ثبت نشده است</div>;
  }
  return (
    <div style={{ background: COLOR.surface, borderRadius: RADIUS.lg, overflow: 'hidden', border: `1px solid ${COLOR.border}` }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: COLOR.surfaceAlt }}>
            <th style={th}>کالا</th>
            <th style={th}>کد</th>
            <th style={th}>تنوع‌ها</th>
            <th style={{ ...th, textAlign: 'left' }}>موجودی کل</th>
          </tr>
        </thead>
        <tbody>
          {levels.map((l, i) => {
            const open = expanded[l.productId];
            const canExpand = l.hasVariants || l.variants.some(v => v.warehouses.length > 1);
            return (
              <FragmentRows key={l.productId} level={l} index={i} open={open} canExpand={canExpand}
                onToggle={() => setExpanded(p => ({ ...p, [l.productId]: !p[l.productId] }))} />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function FragmentRows({ level, index, open, canExpand, onToggle }: {
  level: StockLevel; index: number; open: boolean; canExpand: boolean; onToggle: () => void;
}) {
  const color = stockColor(level.totalQuantity);
  return (
    <>
      <tr onClick={canExpand ? onToggle : undefined}
        style={{ background: index % 2 ? 'rgba(255,255,255,.015)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,.03)', cursor: canExpand ? 'pointer' : 'default' }}>
        <td style={{ ...td, color: COLOR.textPrimary, fontWeight: 700 }}>
          {canExpand && <span style={{ color: COLOR.textFaint, marginLeft: 6, display: 'inline-block', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}>▸</span>}
          {level.productName}
          {level.hasVariants && <span style={{ marginRight: 6, fontSize: FONT.xs, color: '#a78bfa', background: 'rgba(167,139,250,.1)', padding: '1px 7px', borderRadius: 20 }}>متغیر</span>}
        </td>
        <td style={{ ...td, color: COLOR.textFaint, direction: 'ltr', textAlign: 'right', fontSize: FONT.xs + 1 }}>{level.sku || '—'}</td>
        <td style={{ ...td, color: COLOR.textFaint }}>{level.hasVariants ? `${level.variants.length} تنوع` : '—'}</td>
        <td style={{ ...td, textAlign: 'left', fontWeight: 800, fontSize: FONT.md, color, fontVariantNumeric: 'tabular-nums' }}>{fmtNum(level.totalQuantity)}</td>
      </tr>
      {open && level.variants.map((v: VariantStock) => (
        <tr key={`${level.productId}-${v.variantId ?? 0}`} style={{ background: 'rgba(167,139,250,.04)', borderBottom: '1px solid rgba(255,255,255,.03)' }}>
          <td style={{ ...td, paddingRight: 34, color: '#c4b5fd', fontWeight: 600 }}>{level.hasVariants ? v.variantLabel : 'موجودی'}</td>
          <td style={{ ...td, color: COLOR.textFaint, direction: 'ltr', textAlign: 'right', fontSize: FONT.xs + 1 }}>{v.sku || '—'}</td>
          <td style={{ ...td, color: COLOR.textFaint, fontSize: FONT.xs + 1 }}>
            {v.warehouses.map(w => `${w.warehouseName}: ${fmtNum(w.quantity)}`).join(' · ') || '—'}
          </td>
          <td style={{ ...td, textAlign: 'left', fontWeight: 700, color: stockColor(v.quantity), fontVariantNumeric: 'tabular-nums' }}>{fmtNum(v.quantity)}</td>
        </tr>
      ))}
    </>
  );
}

// ─── Movement modal (receipt / adjustment) ────────────────────────────────────────
function MovementModal({ onClose, products, warehouses }: { onClose: () => void; products: Product[]; warehouses: { id?: number; name: string }[] }) {
  const record = useRecordMovement();
  const [productId, setProductId] = useState<number | ''>('');
  const [variantId, setVariantId] = useState<number | ''>('');
  const [warehouseId, setWarehouseId] = useState<number | ''>('');
  const [type, setType] = useState<MovementType>('PURCHASE');
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const product = products.find(p => p.id === productId);
  const variants = product?.variants ?? [];

  const submit = async () => {
    setError('');
    if (!productId || !warehouseId || !quantity) { setError('کالا، انبار و تعداد الزامی است'); return; }
    if (variants.length > 0 && !variantId) { setError('برای کالای متغیر باید تنوع را انتخاب کنید'); return; }
    try {
      await record.mutateAsync({
        productId: Number(productId),
        variantId: variantId ? Number(variantId) : null,
        warehouseId: Number(warehouseId),
        type,
        quantity: Number(quantity),
        note: note || undefined,
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در ثبت');
    }
  };

  return (
    <Modal open onClose={onClose} title="ثبت ورود / تعدیل موجودی" titleColor={ACC} width={460}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {error && <div style={errBox}>{error}</div>}
        <SelectInput label="کالا" value={productId} onChange={e => { setProductId(Number(e.target.value) || ''); setVariantId(''); }}>
          <option value="">— انتخاب کالا —</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </SelectInput>
        {variants.length > 0 && (
          <SelectInput label="تنوع (رنگ / سایز)" value={variantId} onChange={e => setVariantId(Number(e.target.value) || '')}>
            <option value="">— انتخاب تنوع —</option>
            {variants.map(v => <option key={v.id} value={v.id}>{[v.attr1Value, v.attr2Value].filter(Boolean).join(' / ')}</option>)}
          </SelectInput>
        )}
        <SelectInput label="انبار" value={warehouseId} onChange={e => setWarehouseId(Number(e.target.value) || '')}>
          <option value="">— انتخاب انبار —</option>
          {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </SelectInput>
        <SelectInput label="نوع حرکت" value={type} onChange={e => setType(e.target.value as MovementType)}>
          <option value="PURCHASE">خرید / ورود</option>
          <option value="RETURN_IN">مرجوعی فروش (ورود)</option>
          <option value="ADJUST_IN">تعدیل (افزایش)</option>
          <option value="ADJUST_OUT">تعدیل (کاهش)</option>
        </SelectInput>
        <TextInput label="تعداد" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} />
        <Textarea label="توضیح (اختیاری)" value={note} onChange={e => setNote(e.target.value)} rows={2} />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-start', marginTop: 4 }}>
          <Button variant="primary" color={ACC} onClick={submit} disabled={record.isPending}>{record.isPending ? 'در حال ثبت…' : 'ثبت'}</Button>
          <Button variant="ghost" onClick={onClose}>انصراف</Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Transfer modal ───────────────────────────────────────────────────────────────
function TransferModal({ onClose, products, warehouses }: { onClose: () => void; products: Product[]; warehouses: { id?: number; name: string }[] }) {
  const transfer = useTransferStock();
  const [productId, setProductId] = useState<number | ''>('');
  const [variantId, setVariantId] = useState<number | ''>('');
  const [fromId, setFromId] = useState<number | ''>('');
  const [toId, setToId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');

  const product = products.find(p => p.id === productId);
  const variants = product?.variants ?? [];

  const submit = async () => {
    setError('');
    if (!productId || !fromId || !toId || !quantity) { setError('همه فیلدها الزامی است'); return; }
    if (fromId === toId) { setError('انبار مبدأ و مقصد یکسان است'); return; }
    if (variants.length > 0 && !variantId) { setError('برای کالای متغیر باید تنوع را انتخاب کنید'); return; }
    try {
      await transfer.mutateAsync({
        productId: Number(productId),
        variantId: variantId ? Number(variantId) : null,
        fromWarehouseId: Number(fromId),
        toWarehouseId: Number(toId),
        quantity: Number(quantity),
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در جابجایی');
    }
  };

  return (
    <Modal open onClose={onClose} title="جابجایی بین انبارها" titleColor={ACC} width={460}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {error && <div style={errBox}>{error}</div>}
        <SelectInput label="کالا" value={productId} onChange={e => { setProductId(Number(e.target.value) || ''); setVariantId(''); }}>
          <option value="">— انتخاب کالا —</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </SelectInput>
        {variants.length > 0 && (
          <SelectInput label="تنوع (رنگ / سایز)" value={variantId} onChange={e => setVariantId(Number(e.target.value) || '')}>
            <option value="">— انتخاب تنوع —</option>
            {variants.map(v => <option key={v.id} value={v.id}>{[v.attr1Value, v.attr2Value].filter(Boolean).join(' / ')}</option>)}
          </SelectInput>
        )}
        <SelectInput label="از انبار" value={fromId} onChange={e => setFromId(Number(e.target.value) || '')}>
          <option value="">— مبدأ —</option>
          {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </SelectInput>
        <SelectInput label="به انبار" value={toId} onChange={e => setToId(Number(e.target.value) || '')}>
          <option value="">— مقصد —</option>
          {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </SelectInput>
        <TextInput label="تعداد" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} />
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <Button variant="primary" color={ACC} onClick={submit} disabled={transfer.isPending}>{transfer.isPending ? 'در حال انتقال…' : 'انتقال'}</Button>
          <Button variant="ghost" onClick={onClose}>انصراف</Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────────
const th: React.CSSProperties = { padding: '11px 14px', textAlign: 'right', fontSize: FONT.xs + 2, color: COLOR.textFaint, fontWeight: 600, borderBottom: `1px solid ${COLOR.border}` };
const td: React.CSSProperties = { padding: '11px 14px', fontSize: FONT.base, color: COLOR.textSecondary };
const errBox: React.CSSProperties = { background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', color: '#ef4444', padding: '8px 12px', borderRadius: RADIUS.md, fontSize: FONT.sm };

function stockColor(qty: number) {
  if (qty <= 0) return '#ef4444';
  if (qty <= 5) return '#fb923c';
  return '#4ade80';
}
