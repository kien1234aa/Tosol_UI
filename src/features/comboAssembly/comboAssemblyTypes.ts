export type ComboAssemblyRowStatus =
  | 'requested'
  | 'completed'
  | 'cancelled'
  | 'other';

export type ComboAssemblyListRow = {
  id: number;
  uuid: string | null;
  assemblyNumber: string;
  rowStatus: ComboAssemblyRowStatus;
  statusLabel: string;
  productName: string;
  sku: string;
  productThumb: string | null;
  warehouseName: string;
  quantityLabel: string;
  pickStrategy: string;
  requesterName: string;
  completerName: string;
  requestNoteSnippet: string;
  createdAtLabel: string;
};
