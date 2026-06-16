import React from 'react';
import type { StyleProp, TextStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppColors } from '../../theme/ThemeContext';

/** Ionicons outline — một bộ thống nhất, không emoji. */
const GLYPHS = {
  home: 'home-outline',
  /** Trợ lý / AI */
  ai: 'chatbubble-ellipses-outline',
  cart: 'cart-outline',
  grid: 'grid-outline',
  layers: 'layers-outline',
  wallet: 'wallet-outline',
  settings: 'settings-outline',
  chevronDown: 'chevron-down-outline',
  chevronUp: 'chevron-up-outline',
  chevronForward: 'chevron-forward-outline',
  chevronBack: 'chevron-back-outline',
  clipboard: 'clipboard-outline',
  ruler: 'resize-outline',
  cube: 'cube-outline',
  image: 'image-outline',
  cash: 'cash-outline',
  barcode: 'barcode-outline',
  link: 'link-outline',
  chart: 'bar-chart-outline',
  list: 'list-outline',
  info: 'information-circle-outline',
  build: 'construct-outline',
  document: 'document-text-outline',
  calendar: 'calendar-outline',
  card: 'card-outline',
  store: 'storefront-outline',
  truck: 'car-outline',
  person: 'person-outline',
  analytics: 'analytics-outline',
  activity: 'pulse-outline',
  time: 'time-outline',
  compare: 'git-compare-outline',
  download: 'download-outline',
  business: 'business-outline',
  funnel: 'funnel-outline',
  search: 'search-outline',
  menu: 'menu-outline',
  notifications: 'notifications-outline',
  refresh: 'refresh-outline',
  check: 'checkmark-outline',
  checkCircle: 'checkmark-circle-outline',
  warning: 'warning-outline',
  hourglass: 'hourglass-outline',
  close: 'close-outline',
  pencil: 'pencil-outline',
  save: 'save-outline',
  shield: 'shield-outline',
  ellipsis: 'ellipsis-horizontal',
  ellipsisVertical: 'ellipsis-vertical-outline',
  ellipse: 'ellipse-outline',
  package: 'archive-outline',
  sunny: 'sunny-outline',
  moon: 'moon-outline',
  trash: 'trash-outline',
  star: 'star-outline',
  ban: 'ban-outline',
  print: 'print-outline',
  arrowUp: 'arrow-up-outline',
  arrowDown: 'arrow-down-outline',
  eye: 'eye-outline',
  eyeOff: 'eye-off-outline',
  call: 'call-outline',
  phone: 'call-outline',
  tag: 'pricetag-outline',
  mail: 'mail-outline',
  location: 'location-outline',
  paperclip: 'attach-outline',
  server: 'server-outline',
  lock: 'lock-closed-outline',
  key: 'key-outline',
  globe: 'globe-outline',
  logOut: 'log-out-outline',
  map: 'map-outline',
} as const;

export type SystemIconName = keyof typeof GLYPHS;

type Props = {
  name: SystemIconName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
};

export function SystemIcon({ name, size = 20, color, style }: Props) {
  const c = useAppColors();
  return (
    <Ionicons
      name={GLYPHS[name]}
      size={size}
      color={color ?? c.textSecondary}
      style={style}
    />
  );
}
