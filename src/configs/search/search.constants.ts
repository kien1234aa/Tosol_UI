import type {
  SearchPlatformItem,
  SearchProduct,
} from '@/src/types/search/search.types';

/** Static, localized copy for the search tab. */
export const searchCopy = {
  title: 'Tìm kiếm',
  greeting: 'Hôm nay bạn muốn tìm gì?',
  searchPlaceholder: 'Tìm sản phẩm, thương hiệu...',
  productsSection: 'Sản phẩm',
  emptyResults: 'Không tìm thấy sản phẩm phù hợp',
  currencySuffix: 'đ',
  platformPickerTitle: 'Chọn nền tảng',
  imageSearchLabel: 'Tìm kiếm theo hình ảnh',
} as const;

export const productDetailCopy = {
  screenTitle: 'Chi tiết sản phẩm',
  descriptionSection: 'Mô tả sản phẩm',
  sellerSection: 'Người bán',
  ratingLabel: 'Đánh giá',
  soldLabel: 'Đã bán',
  quantitySection: 'Số lượng',
  exchangeSection: 'Quy đổi tiền',
  unitPriceLabel: 'Đơn giá',
  totalLabel: 'Tổng cộng',
  exchangeRateLabel: 'Tỷ giá',
  approxLabel: '≈',
  addToCart: 'Thêm giỏ hàng',
  buyNow: 'Mua ngay',
  addedToCart: 'Đã thêm vào giỏ hàng',
  notFound: 'Không tìm thấy sản phẩm',
  back: 'Quay lại',
  decreaseQuantity: 'Giảm số lượng',
  increaseQuantity: 'Tăng số lượng',
} as const;

/** Mock CNY → VND rate for order estimation. */
export const exchangeConfig = {
  cnyToVnd: 3650,
} as const;

export const productDetailLimits = {
  minQuantity: 1,
  maxQuantity: 99,
} as const;

export const searchPlatforms: SearchPlatformItem[] = [
  { key: 'taobao', label: 'Taobao' },
  { key: '1688', label: '1688' },
  { key: 'tmall', label: 'Tmall' },
  { key: 'jd', label: 'JD' },
];

export const defaultSearchPlatform = searchPlatforms[0].key;

/** Ten mocked catalog items for the search grid. */
export const mockSearchProducts: SearchProduct[] = [
  {
    id: 'p-1',
    name: 'Tai nghe Bluetooth chống ồn',
    priceCny: 244,
    originalPriceCny: 354,
    description:
      'Tai nghe over-ear chống ồn chủ động, pin 30 giờ, hỗ trợ sạc nhanh USB-C và kết nối đa thiết bị.',
    seller: 'AudioHub Official',
    rating: 4.8,
    soldCount: 2340,
  },
  {
    id: 'p-2',
    name: 'Áo thun nam cotton basic',
    priceCny: 68,
    description:
      'Chất liệu cotton 100% thoáng mát, form regular fit, phù hợp đi làm và dạo phố hàng ngày.',
    seller: 'BasicWear Store',
    rating: 4.6,
    soldCount: 5120,
  },
  {
    id: 'p-3',
    name: 'Máy xay sinh tố đa năng',
    priceCny: 315,
    originalPriceCny: 397,
    description:
      'Công suất 800W, cối thủy tinh 1.5L, 6 tốc độ xay và chế độ nghiền đá an toàn.',
    seller: 'KitchenPro VN',
    rating: 4.7,
    soldCount: 890,
  },
  {
    id: 'p-4',
    name: 'Serum vitamin C dưỡng sáng da',
    priceCny: 88,
    description:
      'Công thức vitamin C 15% giúp làm sáng da, hỗ trợ mờ thâm và cải thiện độ đàn hồi.',
    seller: 'GlowLab Beauty',
    rating: 4.9,
    soldCount: 6780,
  },
  {
    id: 'p-5',
    name: 'Giày chạy bộ đế cao su',
    priceCny: 214,
    originalPriceCny: 260,
    description:
      'Đế cao su bám tốt, thân giày thoáng khí, hỗ trợ giảm chấn khi chạy đường dài.',
    seller: 'RunFast Sports',
    rating: 4.5,
    soldCount: 1430,
  },
  {
    id: 'p-6',
    name: 'Loa mini Bluetooth chống nước',
    priceCny: 123,
    description:
      'Chuẩn chống nước IPX7, pin 12 giờ, kết nối Bluetooth 5.3 ổn định trong phạm vi 10m.',
    seller: 'SoundMini Shop',
    rating: 4.4,
    soldCount: 3210,
  },
  {
    id: 'p-7',
    name: 'Váy midi công sở',
    priceCny: 109,
    description:
      'Kiểu dáng midi thanh lịch, vải dày vừa phải, dễ phối với áo sơ mi và blazer.',
    seller: 'OfficeChic',
    rating: 4.7,
    soldCount: 980,
  },
  {
    id: 'p-8',
    name: 'Bộ nồi chống dính 5 món',
    priceCny: 189,
    originalPriceCny: 244,
    description:
      'Bộ gồm 5 món nồi/chảo, lớp chống dính an toàn, dùng được trên bếp từ và bếp gas.',
    seller: 'HomeChef Mart',
    rating: 4.6,
    soldCount: 760,
  },
  {
    id: 'p-9',
    name: 'Kem chống nắng SPF50+',
    priceCny: 78,
    description:
      'Kem chống nắng SPF50+ PA++++, finish mỏng nhẹ, không bí da, phù hợp makeup hàng ngày.',
    seller: 'SunCare VN',
    rating: 4.8,
    soldCount: 8450,
  },
  {
    id: 'p-10',
    name: 'Bình nước thể thao 750ml',
    priceCny: 44,
    description:
      'Chất liệu Tritan an toàn, nắp khóa chống tràn, phù hợp tập gym và đi làm.',
    seller: 'FitLife Gear',
    rating: 4.5,
    soldCount: 2890,
  },
];
