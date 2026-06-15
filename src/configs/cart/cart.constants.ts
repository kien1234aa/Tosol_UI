import type { CartGroup } from '@/src/types/cart/cart.types';

export const cartCopy = {
  title: 'Giỏ hàng',
  totalGoodsLabel: 'Tổng tiền hàng:',
  selectAll: 'Chọn tất cả',
  createOrders: 'Tạo đơn hàng',
  supplierPrefix: 'Nhà cung cấp:',
  insurance: 'Bảo hiểm',
  woodPacking: 'Đóng gỗ',
  unitPriceLabel: 'Đơn giá:',
  lineTotalLabel: 'Thành tiền:',
  goodsAmount: 'Tiền hàng:',
  estimatedFee: 'Phí tạm tính:',
  deposit: 'Đặt cọc:',
  totalAmount: 'Tổng tiền:',
  notePlaceholder: 'Nhập ghi chú cho đơn hàng',
  deleteShop: 'Xoá Shop',
  createOrder: 'Tạo đơn',
  decreaseQuantity: 'Giảm số lượng',
  increaseQuantity: 'Tăng số lượng',
  removeProduct: 'Xoá sản phẩm',
  emptyCart: 'Giỏ hàng trống',
  defaultVariant: 'Mặc định',
} as const;

export const cartQuantityLimits = {
  min: 1,
  max: 99,
} as const;

/** Mock cart groups grouped by supplier. */
export const mockCartGroups: CartGroup[] = [
  {
    id: 'cg-1',
    supplierName: '全款旗舰店',
    selected: true,
    insurance: false,
    woodPacking: false,
    note: '',
    products: [
      {
        id: 'cp-1',
        name: 'Phấn phủ dạng bột Marshmallow Finish',
        variant: '颜色分类：【店主强推XL】加强遮瑕',
        priceCny: 6.26,
        quantity: 1,
        selected: true,
      },
    ],
  },
  {
    id: 'cg-2',
    supplierName: 'AudioHub Official',
    selected: false,
    insurance: true,
    woodPacking: false,
    note: 'Giao giờ hành chính',
    products: [
      {
        id: 'p-1',
        name: 'Tai nghe Bluetooth chống ồn',
        variant: 'Màu: Đen | Bảo hành 12 tháng',
        priceCny: 244,
        quantity: 1,
        selected: true,
      },
      {
        id: 'cp-3',
        name: 'Loa mini Bluetooth chống nước',
        variant: 'Màu: Xanh navy',
        priceCny: 123,
        quantity: 2,
        selected: false,
      },
    ],
  },
];
