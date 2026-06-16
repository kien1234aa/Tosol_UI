/** Minimal shapes for create-order mappers; extend when wiring API. */

export type CustomerEntity = {
  id?: number;
  uuid: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  full_address?: string;
};

export type ProductEntity = {
  id?: number;
  uuid: string;
  name: string;
  sku?: string | null;
  price?: string | number;
  available_stock?: string | number;
};
