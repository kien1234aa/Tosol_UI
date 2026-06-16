/** Giá trị `unit` gửi API — nhãn hiển thị theo yêu cầu UI. */
export type ProductUnitValue =
  | 'piece'
  | 'gram'
  | 'kilogram'
  | 'milliliter'
  | 'liter'
  | 'box'
  | 'pack'
  | 'carton'
  | 'meter'
  | 'centimeter'
  | 'square_meter';

export const PRODUCT_UNIT_OPTIONS: {
  value: ProductUnitValue;
  label: string;
}[] = [
  { value: 'piece', label: 'Cái' },
  { value: 'gram', label: 'Gram' },
  { value: 'kilogram', label: 'Kilogram' },
  { value: 'milliliter', label: 'Mililit' },
  { value: 'liter', label: 'Lít' },
  { value: 'box', label: 'Hộp/Thùng' },
  { value: 'pack', label: 'Gói' },
  { value: 'carton', label: 'Thùng Carton' },
  { value: 'meter', label: 'Mét' },
  { value: 'centimeter', label: 'Centimet' },
  { value: 'square_meter', label: 'Mét Vuông' },
];
