export const estimateCopy = {
  screenTitle: 'Ước tính chi phí',
  back: 'Quay lại',
  buyForMeTab: 'Mua hộ',
  consignmentTab: 'Ký gửi',
  priceCnyPlaceholder: 'Giá gốc sản phẩm (Nhân dân tệ)*',
  weightPlaceholder: 'Cân nặng sau đóng gói (kg)',
  dimensionsLabel: 'Kích thước đóng gói (cm) Dài x Rộng x Cao:',
  lengthPlaceholder: 'Dài (cm)',
  widthPlaceholder: 'Rộng (cm)',
  heightPlaceholder: 'Cao (cm)',
  submitBuyForMe: 'Tính chi phí mua hộ',
  submitConsignment: 'Tính chi phí ký gửi',
  priceRequired: 'Vui lòng nhập giá gốc sản phẩm',
  weightRequired: 'Vui lòng nhập cân nặng',
  resultTitle: 'Chi phí ước tính',
  goodsLabel: 'Tiền hàng:',
  serviceFeeLabel: 'Phí dịch vụ:',
  chargeableWeightLabel: 'Cân nặng tính phí:',
  shippingLabel: 'Phí vận chuyển:',
  totalLabel: 'Tổng tạm tính:',
  resultNote: 'Đây là chi phí tạm tính, có thể thay đổi theo thực tế. (mock)',
} as const;

/** Mock pricing assumptions for the estimate calculator. */
export const estimateConfig = {
  shippingPerKgVnd: 25_000,
  volumetricDivisor: 6_000,
  serviceFeeRate: 0.03,
} as const;
