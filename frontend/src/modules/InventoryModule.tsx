import { useState, useMemo } from 'react';
import { ModuleShell, PageHeader } from '../components/layout/ModuleShell';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { TextInput, SelectInput, Textarea } from '../components/ui/Input';
import { COLOR, FONT, RADIUS } from '../styles/tokens';
import { fmtNum } from '../hooks/useFormat';
import {
  useStockLevels, useStockMovements, useRecordMovement, useTransferStock, useAdvanceStage,
  useStages, useCreateStage, useUpdateStage, useDeleteStage,
  warehouses as warehouseHooks, products as productHooks,
} from '../hooks/queries';
import type { MovementType, StockLevel, VariantStock, Product, InventoryStage, StageDirection } from '../types';

interface Props { onBack: () => void }

const ACC = COLOR.module.inventory;
const NAV = [
  { id: 'stock',        label: 'موجودی کالا',  icon: '📦' },
  { id: 'stages',       label: 'مراحل انبار',  icon: '🪜' },
  { id: 'transactions', label: 'تراکنش‌ها',    icon: '📋' },
];

const MOVEMENT_COLOR: Record<string, string> = {
  PURCHASE: '#4ade80', RETURN_IN: '#4ade80', ADJUST_IN: '#38bdf8', TRANSFER_IN: '#38bdf8', STAGE_IN: '#a78bfa',
  SALE: '#ef4444', ADJUST_OUT: '#fb923c', TRANSFER_OUT: '#fb923c', STAGE_OUT: '#a78bfa',
};
const isInbound = (t: MovementType) => ['PURCHASE', 'RETURN_IN', 'ADJUST_IN', 'TRANSFER_IN', 'STAGE_IN'].includes(t);

export default function InventoryModule({ onBack }: Props) {
  const [section, setSection] = useState('stock');

  const { data: levels = [] } = useStockLevels();
  const { data: movements = [] } = useStockMovements();
  const { data: warehouses = [] } = warehouseHooks.useList();
  const { data: products = [] } = productHooks.useList();
  const { data: stages = [] } = useStages();

  const [showMove, setShowMove] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showAdvance, setShowAdvance] = useState(false);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const totalUnits = useMemo(() => levels.reduce((a, l) => a + l.totalQuantity, 0), [levels]);
  const availableUnits = useMemo(() => levels.reduce((a, l) => a + l.availableQuantity, 0), [levels]);
  const inPipeline = totalUnits - availableUnits;

  const footer = [
    { label: 'موجود (قابل‌فروش)', value: fmtNum(availableUnits) },
    { label: 'در مسیر مراحل', value: fmtNum(inPipeline) },
    { label: 'کل واحدها', value: fmtNum(totalUnits) },
  ];

  const headerAction = section === 'stock' ? (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button variant="ghost" onClick={() => setShowTransfer(true)}>🔄 جابجایی انبار</Button>
      <Button variant="ghost" onClick={() => setShowAdvance(true)}>🪜 انتقال بین مراحل</Button>
      <Button variant="primary" color={ACC} onClick={() => setShowMove(true)}>+ ثبت ورود / تعدیل</Button>
    </div>
  ) : undefined;

  const pageTitle = NAV.find(n => n.id === section)?.label ?? '';

  return (
    <ModuleShell accent={ACC} icon="📦" title="انبارداری" subtitle="موجودی و گردش کالا"
      navItems={NAV} section={section} onSection={setSection} onBack={onBack} sidebarFooter={footer}>
      <PageHeader title={pageTitle} color={ACC} action={headerAction} />

      {section === 'stock' && <StockView levels={levels} expanded={expanded} setExpanded={setExpanded} />}

      {section === 'stages' && <StagesView stages={stages} />}

      {section === 'transactions' && (
        <div style={{ background: COLOR.surface, borderRadius: RADIUS.lg, overflow: 'hidden', border: `1px solid ${COLOR.border}` }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: COLOR.surfaceAlt }}>
                {['تاریخ', 'نوع', 'کالا', 'انبار', 'مرحله', 'تعداد', 'مانده', 'مرجع'].map(h => <th key={h} style={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {movements.length === 0 && (
                <tr><td colSpan={8} style={{ padding: 28, textAlign: 'center', color: COLOR.textFaint, fontSize: FONT.base }}>تراکنشی ثبت نشده است</td></tr>
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
                  <td style={{ ...td, color: COLOR.textFaint, fontSize: FONT.xs + 1 }}>{m.stageName || '—'}</td>
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

      {showMove && <MovementModal onClose={() => setShowMove(false)} products={products} warehouses={warehouses} stages={stages} />}
      {showTransfer && <TransferModal onClose={() => setShowTransfer(false)} products={products} warehouses={warehouses} stages={stages} />}
      {showAdvance && <AdvanceModal onClose={() => setShowAdvance(false)} products={products} warehouses={warehouses} stages={stages} />}
    </ModuleShell>
  );
}

// ─── Stock view: product → variant → stage / warehouse ────────────────────────────
function StockView({ levels, expanded, setExpanded }: {
  levels: StockLevel[];
  expanded: Record<number, boolean>;
  setExpanded: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
}) {
  if (levels.length === 0) {
    return <div style={emptyBox}>کالایی ثبت نشده است</div>;
  }
  return (
    <div style={{ background: COLOR.surface, borderRadius: RADIUS.lg, overflow: 'hidden', border: `1px solid ${COLOR.border}` }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: COLOR.surfaceAlt }}>
            <th style={th}>کالا</th>
            <th style={th}>کد</th>
            <th style={{ ...th, textAlign: 'left' }}>قابل‌فروش</th>
            <th style={{ ...th, textAlign: 'left' }}>کل</th>
          </tr>
        </thead>
        <tbody>
          {levels.map((l, i) => (
            <ProductRows key={l.productId} level={l} index={i} open={!!expanded[l.productId]}
              onToggle={() => setExpanded(p => ({ ...p, [l.productId]: !p[l.productId] }))} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProductRows({ level, index, open, onToggle }: {
  level: StockLevel; index: number; open: boolean; onToggle: () => void;
}) {
  return (
    <>
      <tr onClick={onToggle}
        style={{ background: index % 2 ? 'rgba(255,255,255,.015)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,.03)', cursor: 'pointer' }}>
        <td style={{ ...td, color: COLOR.textPrimary, fontWeight: 700 }}>
          <span style={{ color: COLOR.textFaint, marginLeft: 6, display: 'inline-block', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}>▸</span>
          {level.productName}
          {level.hasVariants && <span style={chip('#a78bfa')}>متغیر</span>}
        </td>
        <td style={{ ...td, color: COLOR.textFaint, direction: 'ltr', textAlign: 'right', fontSize: FONT.xs + 1 }}>{level.sku || '—'}</td>
        <td style={{ ...td, textAlign: 'left', fontWeight: 800, fontSize: FONT.md, color: stockColor(level.availableQuantity), fontVariantNumeric: 'tabular-nums' }}>{fmtNum(level.availableQuantity)}</td>
        <td style={{ ...td, textAlign: 'left', fontWeight: 700, color: COLOR.textFaint, fontVariantNumeric: 'tabular-nums' }}>{fmtNum(level.totalQuantity)}</td>
      </tr>
      {open && level.variants.map((v: VariantStock) => (
        <tr key={`${level.productId}-${v.variantId ?? 0}`} style={{ background: 'rgba(167,139,250,.04)', borderBottom: '1px solid rgba(255,255,255,.03)' }}>
          <td style={{ ...td, paddingRight: 34, color: '#c4b5fd', fontWeight: 600 }}>
            {level.hasVariants ? v.variantLabel : 'موجودی'}
            <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {v.stages.map(s => (
                <span key={`${s.stageId ?? 0}`} style={{
                  fontSize: FONT.xs, padding: '2px 8px', borderRadius: 20,
                  background: s.available ? 'rgba(74,222,128,.1)' : 'rgba(255,255,255,.05)',
                  color: s.available ? '#4ade80' : '#94a3b8',
                  border: `1px solid ${s.available ? 'rgba(74,222,128,.25)' : 'rgba(255,255,255,.08)'}`,
                }}>
                  {s.stageName}: {fmtNum(s.quantity)}{s.available ? ' ✓' : ''}
                </span>
              ))}
            </div>
          </td>
          <td style={{ ...td, color: COLOR.textFaint, direction: 'ltr', textAlign: 'right', fontSize: FONT.xs + 1 }}>{v.sku || '—'}</td>
          <td style={{ ...td, textAlign: 'left', fontWeight: 700, color: stockColor(v.availableQuantity), fontVariantNumeric: 'tabular-nums' }}>{fmtNum(v.availableQuantity)}</td>
          <td style={{ ...td, textAlign: 'left', color: COLOR.textFaint, fontVariantNumeric: 'tabular-nums' }}>{fmtNum(v.quantity)}</td>
        </tr>
      ))}
    </>
  );
}

// ─── Stages management ────────────────────────────────────────────────────────────
function StagesView({ stages }: { stages: InventoryStage[] }) {
  const create = useCreateStage();
  const update = useUpdateStage();
  const remove = useDeleteStage();
  const [editing, setEditing] = useState<InventoryStage | null>(null);
  const [showForm, setShowForm] = useState(false);

  const inbound = stages.filter(s => s.direction !== 'OUTBOUND');
  const outbound = stages.filter(s => s.direction === 'OUTBOUND');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <p style={{ fontSize: FONT.sm, color: COLOR.textFaint, margin: 0, lineHeight: 1.8 }}>
          خط فرایند انبار خود را بسازید. کالا از هر مرحله به مرحله بعد منتقل می‌شود؛ تنها مرحله‌ای که «قابل‌فروش» علامت بخورد در فروش و فاکتور دیده می‌شود.
        </p>
        <Button variant="primary" color={ACC} onClick={() => { setEditing(null); setShowForm(true); }}>+ مرحله جدید</Button>
      </div>

      {[{ dir: 'INBOUND' as StageDirection, label: 'مراحل ورود به انبار', list: inbound },
        { dir: 'OUTBOUND' as StageDirection, label: 'مراحل خروج از انبار', list: outbound }].map(group => (
        <div key={group.dir} style={{ marginBottom: 18 }}>
          <div style={{ fontSize: FONT.xs + 2, color: COLOR.textFaint, fontWeight: 700, marginBottom: 8 }}>{group.label}</div>
          {group.list.length === 0 ? (
            <div style={{ ...emptyBox, padding: 18 }}>مرحله‌ای تعریف نشده</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
              {group.list.map((s, idx) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {idx > 0 && <span style={{ color: COLOR.textFaint }}>←</span>}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: RADIUS.md,
                    background: s.available ? 'rgba(74,222,128,.08)' : COLOR.surfaceAlt,
                    border: `1px solid ${s.available ? 'rgba(74,222,128,.3)' : COLOR.border}`,
                  }}>
                    <span style={{ fontSize: FONT.base, color: COLOR.textPrimary, fontWeight: 600 }}>{s.name}</span>
                    {s.available && <span style={{ fontSize: FONT.xs, color: '#4ade80', fontWeight: 700 }}>قابل‌فروش ✓</span>}
                    <button onClick={() => { setEditing(s); setShowForm(true); }} style={iconBtn}>✎</button>
                    <button onClick={() => s.id && confirm(`حذف مرحله «${s.name}»؟`) && remove.mutate(s.id)} style={{ ...iconBtn, color: '#ef4444' }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {showForm && (
        <StageForm stage={editing} onClose={() => setShowForm(false)}
          onSave={(data) => {
            const action = editing?.id
              ? update.mutateAsync({ id: editing.id, data })
              : create.mutateAsync(data);
            action.then(() => setShowForm(false));
          }} />
      )}
    </div>
  );
}

function StageForm({ stage, onClose, onSave }: { stage: InventoryStage | null; onClose: () => void; onSave: (s: InventoryStage) => void }) {
  const [name, setName] = useState(stage?.name ?? '');
  const [direction, setDirection] = useState<StageDirection>(stage?.direction ?? 'INBOUND');
  const [sequence, setSequence] = useState(String(stage?.sequence ?? 1));
  const [available, setAvailable] = useState(stage?.available ?? false);
  const [error, setError] = useState('');

  const submit = () => {
    if (!name.trim()) { setError('نام مرحله الزامی است'); return; }
    onSave({ name: name.trim(), direction, sequence: Number(sequence) || 1, available });
  };

  return (
    <Modal open onClose={onClose} title={stage ? 'ویرایش مرحله' : 'مرحله جدید'} titleColor={ACC} width={420}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {error && <div style={errBox}>{error}</div>}
        <TextInput label="نام مرحله" value={name} onChange={e => setName(e.target.value)} placeholder="مثلاً: کنترل کیفی" />
        <SelectInput label="جهت" value={direction} onChange={e => setDirection(e.target.value as StageDirection)}>
          <option value="INBOUND">ورود به انبار</option>
          <option value="OUTBOUND">خروج از انبار</option>
        </SelectInput>
        <TextInput label="ترتیب در خط فرایند" type="number" value={sequence} onChange={e => setSequence(e.target.value)} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: FONT.base, color: COLOR.textSecondary, cursor: 'pointer' }}>
          <input type="checkbox" checked={available} onChange={e => setAvailable(e.target.checked)} />
          این مرحله موجودیِ قابل‌فروش است (در فروش و فاکتور استفاده می‌شود)
        </label>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <Button variant="primary" color={ACC} onClick={submit}>ذخیره</Button>
          <Button variant="ghost" onClick={onClose}>انصراف</Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Movement / transfer / advance modals ─────────────────────────────────────────
function useVariants(products: Product[], productId: number | '') {
  const product = products.find(p => p.id === productId);
  return { product, variants: product?.variants ?? [] };
}

function MovementModal({ onClose, products, warehouses, stages }: ModalDataProps) {
  const record = useRecordMovement();
  const [productId, setProductId] = useState<number | ''>('');
  const [variantId, setVariantId] = useState<number | ''>('');
  const [warehouseId, setWarehouseId] = useState<number | ''>('');
  const [stageId, setStageId] = useState<number | ''>('');
  const [type, setType] = useState<MovementType>('PURCHASE');
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const { variants } = useVariants(products, productId);

  const submit = async () => {
    setError('');
    if (!productId || !warehouseId || !quantity) { setError('کالا، انبار و تعداد الزامی است'); return; }
    if (variants.length > 0 && !variantId) { setError('برای کالای متغیر تنوع را انتخاب کنید'); return; }
    try {
      await record.mutateAsync({
        productId: Number(productId), variantId: variantId ? Number(variantId) : null,
        warehouseId: Number(warehouseId), stageId: stageId ? Number(stageId) : null,
        type, quantity: Number(quantity), note: note || undefined,
      });
      onClose();
    } catch (e) { setError(e instanceof Error ? e.message : 'خطا در ثبت'); }
  };

  return (
    <Modal open onClose={onClose} title="ثبت ورود / تعدیل موجودی" titleColor={ACC} width={460}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {error && <div style={errBox}>{error}</div>}
        <ProductSelect products={products} value={productId} onChange={v => { setProductId(v); setVariantId(''); }} />
        <VariantSelect variants={variants} value={variantId} onChange={setVariantId} />
        <WarehouseSelect warehouses={warehouses} value={warehouseId} onChange={setWarehouseId} />
        <SelectInput label="مرحله مقصد" value={stageId} onChange={e => setStageId(Number(e.target.value) || '')}>
          <option value="">— مرحله پیش‌فرض (اولین مرحله) —</option>
          {stages.map(s => <option key={s.id} value={s.id}>{s.name}{s.available ? ' (قابل‌فروش)' : ''}</option>)}
        </SelectInput>
        <SelectInput label="نوع حرکت" value={type} onChange={e => setType(e.target.value as MovementType)}>
          <option value="PURCHASE">خرید / ورود</option>
          <option value="RETURN_IN">مرجوعی فروش (ورود)</option>
          <option value="ADJUST_IN">تعدیل (افزایش)</option>
          <option value="ADJUST_OUT">تعدیل (کاهش)</option>
        </SelectInput>
        <TextInput label="تعداد" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} />
        <Textarea label="توضیح (اختیاری)" value={note} onChange={e => setNote(e.target.value)} rows={2} />
        <ModalActions onSubmit={submit} onClose={onClose} pending={record.isPending} />
      </div>
    </Modal>
  );
}

function TransferModal({ onClose, products, warehouses, stages }: ModalDataProps) {
  const transfer = useTransferStock();
  const [productId, setProductId] = useState<number | ''>('');
  const [variantId, setVariantId] = useState<number | ''>('');
  const [stageId, setStageId] = useState<number | ''>('');
  const [fromId, setFromId] = useState<number | ''>('');
  const [toId, setToId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');
  const { variants } = useVariants(products, productId);

  const submit = async () => {
    setError('');
    if (!productId || !fromId || !toId || !quantity) { setError('همه فیلدها الزامی است'); return; }
    if (fromId === toId) { setError('انبار مبدأ و مقصد یکسان است'); return; }
    if (variants.length > 0 && !variantId) { setError('برای کالای متغیر تنوع را انتخاب کنید'); return; }
    try {
      await transfer.mutateAsync({
        productId: Number(productId), variantId: variantId ? Number(variantId) : null,
        stageId: stageId ? Number(stageId) : null,
        fromWarehouseId: Number(fromId), toWarehouseId: Number(toId), quantity: Number(quantity),
      });
      onClose();
    } catch (e) { setError(e instanceof Error ? e.message : 'خطا در جابجایی'); }
  };

  return (
    <Modal open onClose={onClose} title="جابجایی بین انبارها" titleColor={ACC} width={460}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {error && <div style={errBox}>{error}</div>}
        <ProductSelect products={products} value={productId} onChange={v => { setProductId(v); setVariantId(''); }} />
        <VariantSelect variants={variants} value={variantId} onChange={setVariantId} />
        {stages.length > 0 && (
          <SelectInput label="مرحله" value={stageId} onChange={e => setStageId(Number(e.target.value) || '')}>
            <option value="">— بدون مرحله —</option>
            {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
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
        <ModalActions onSubmit={submit} onClose={onClose} pending={transfer.isPending} />
      </div>
    </Modal>
  );
}

function AdvanceModal({ onClose, products, warehouses, stages }: ModalDataProps) {
  const advance = useAdvanceStage();
  const [productId, setProductId] = useState<number | ''>('');
  const [variantId, setVariantId] = useState<number | ''>('');
  const [warehouseId, setWarehouseId] = useState<number | ''>('');
  const [fromStage, setFromStage] = useState<number | ''>('');
  const [toStage, setToStage] = useState<number | ''>('');
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');
  const { variants } = useVariants(products, productId);

  const submit = async () => {
    setError('');
    if (!productId || !warehouseId || !fromStage || !toStage || !quantity) { setError('همه فیلدها الزامی است'); return; }
    if (fromStage === toStage) { setError('مرحله مبدأ و مقصد یکسان است'); return; }
    if (variants.length > 0 && !variantId) { setError('برای کالای متغیر تنوع را انتخاب کنید'); return; }
    try {
      await advance.mutateAsync({
        productId: Number(productId), variantId: variantId ? Number(variantId) : null,
        warehouseId: Number(warehouseId), fromStageId: Number(fromStage), toStageId: Number(toStage),
        quantity: Number(quantity),
      });
      onClose();
    } catch (e) { setError(e instanceof Error ? e.message : 'خطا در انتقال'); }
  };

  if (stages.length < 2) {
    return (
      <Modal open onClose={onClose} title="انتقال بین مراحل" titleColor={ACC} width={420}>
        <p style={{ fontSize: FONT.base, color: COLOR.textFaint }}>برای انتقال بین مراحل، ابتدا حداقل دو مرحله در بخش «مراحل انبار» تعریف کنید.</p>
        <Button variant="ghost" onClick={onClose}>بستن</Button>
      </Modal>
    );
  }

  return (
    <Modal open onClose={onClose} title="انتقال بین مراحل" titleColor={ACC} width={460}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {error && <div style={errBox}>{error}</div>}
        <ProductSelect products={products} value={productId} onChange={v => { setProductId(v); setVariantId(''); }} />
        <VariantSelect variants={variants} value={variantId} onChange={setVariantId} />
        <WarehouseSelect warehouses={warehouses} value={warehouseId} onChange={setWarehouseId} />
        <SelectInput label="از مرحله" value={fromStage} onChange={e => setFromStage(Number(e.target.value) || '')}>
          <option value="">— مبدأ —</option>
          {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </SelectInput>
        <SelectInput label="به مرحله" value={toStage} onChange={e => setToStage(Number(e.target.value) || '')}>
          <option value="">— مقصد —</option>
          {stages.map(s => <option key={s.id} value={s.id}>{s.name}{s.available ? ' (قابل‌فروش)' : ''}</option>)}
        </SelectInput>
        <TextInput label="تعداد" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} />
        <ModalActions onSubmit={submit} onClose={onClose} pending={advance.isPending} />
      </div>
    </Modal>
  );
}

// ─── shared bits ──────────────────────────────────────────────────────────────────
interface ModalDataProps { onClose: () => void; products: Product[]; warehouses: { id?: number; name: string }[]; stages: InventoryStage[] }

function ProductSelect({ products, value, onChange }: { products: Product[]; value: number | ''; onChange: (v: number | '') => void }) {
  return (
    <SelectInput label="کالا" value={value} onChange={e => onChange(Number(e.target.value) || '')}>
      <option value="">— انتخاب کالا —</option>
      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
    </SelectInput>
  );
}

function VariantSelect({ variants, value, onChange }: { variants: NonNullable<Product['variants']>; value: number | ''; onChange: (v: number | '') => void }) {
  if (!variants || variants.length === 0) return null;
  return (
    <SelectInput label="تنوع (رنگ / سایز)" value={value} onChange={e => onChange(Number(e.target.value) || '')}>
      <option value="">— انتخاب تنوع —</option>
      {variants.map(v => <option key={v.id} value={v.id}>{[v.attr1Value, v.attr2Value].filter(Boolean).join(' / ')}</option>)}
    </SelectInput>
  );
}

function WarehouseSelect({ warehouses, value, onChange }: { warehouses: { id?: number; name: string }[]; value: number | ''; onChange: (v: number | '') => void }) {
  return (
    <SelectInput label="انبار" value={value} onChange={e => onChange(Number(e.target.value) || '')}>
      <option value="">— انتخاب انبار —</option>
      {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
    </SelectInput>
  );
}

function ModalActions({ onSubmit, onClose, pending }: { onSubmit: () => void; onClose: () => void; pending: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
      <Button variant="primary" color={ACC} onClick={onSubmit} disabled={pending}>{pending ? 'در حال ثبت…' : 'ثبت'}</Button>
      <Button variant="ghost" onClick={onClose}>انصراف</Button>
    </div>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────────
const th: React.CSSProperties = { padding: '11px 14px', textAlign: 'right', fontSize: FONT.xs + 2, color: COLOR.textFaint, fontWeight: 600, borderBottom: `1px solid ${COLOR.border}` };
const td: React.CSSProperties = { padding: '11px 14px', fontSize: FONT.base, color: COLOR.textSecondary, verticalAlign: 'top' };
const errBox: React.CSSProperties = { background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', color: '#ef4444', padding: '8px 12px', borderRadius: RADIUS.md, fontSize: FONT.sm };
const emptyBox: React.CSSProperties = { background: COLOR.surface, borderRadius: RADIUS.lg, border: `1px solid ${COLOR.border}`, padding: 28, textAlign: 'center', color: COLOR.textFaint, fontSize: FONT.base };
const iconBtn: React.CSSProperties = { background: 'none', border: 'none', color: COLOR.textFaint, cursor: 'pointer', fontSize: FONT.base, padding: 2 };
const chip = (c: string): React.CSSProperties => ({ marginRight: 6, fontSize: FONT.xs, color: c, background: c + '1a', padding: '1px 7px', borderRadius: 20 });

function stockColor(qty: number) {
  if (qty <= 0) return '#ef4444';
  if (qty <= 5) return '#fb923c';
  return '#4ade80';
}
