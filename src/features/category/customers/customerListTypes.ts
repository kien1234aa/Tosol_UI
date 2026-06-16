export type CustomerListRow = {
  id: number;
  key: string;
  name: string;
  /** SĐT — null nếu không có. */
  phoneLabel: string | null;
  /** Email — null nếu không có. */
  emailLabel: string | null;
  /** Địa chỉ — null nếu không có. */
  addressLabel: string | null;
  /** Liên hệ gọn (SĐT · email) — null nếu không có. */
  contactLabel: string | null;
  ordersCount: number;
  /** Ngày tạo — null nếu không có. */
  createdLabel: string | null;
};
