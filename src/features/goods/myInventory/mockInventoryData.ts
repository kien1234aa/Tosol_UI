import type { InventoryRow } from './myInventoryTypes';

export function isLowStockRow(row: InventoryRow): boolean {
  const m = row.minStock;
  if (m != null && Number.isFinite(m)) {
    return row.available <= m;
  }
  return row.available < 10;
}
