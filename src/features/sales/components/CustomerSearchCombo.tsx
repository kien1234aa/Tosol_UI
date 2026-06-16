import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { toast } from '@shared/components/ui/appFeedback/appFeedback';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { useAppDispatch } from '../../../app/hooks';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import type { CustomerSearchItem } from '@services/category/customerApiTypes';
import { createCustomerThunk } from '@services/category/customerSlice';
import {
  CreateCustomerModal,
  type CreateCustomerFormValues,
} from './CreateCustomerModal';

export type { CustomerSearchItem } from '@services/category/customerApiTypes';
export type { CreateCustomerFormValues } from './CreateCustomerModal';

export type CustomerSearchComboProps = {
  label?: string;
  /** Nền phía sau chữ nhãn (cắt viền) — nên trùng nền thẻ cha; mặc định theo theme. */
  labelBackgroundColor?: string;
  value: CustomerSearchItem | null;
  onChange: (customer: CustomerSearchItem | null) => void;
  /** Danh sách: local = lọc theo query trong bundle; remote = đã lọc từ API. */
  customers: CustomerSearchItem[];
  /** Khách đã chọn trước đó, hiển thị khi chưa nhập đủ ký tự tìm kiếm. */
  recentCustomers?: CustomerSearchItem[];
  remoteSearch?: boolean;
  /** Mỗi lần đổi chữ trong ô (để parent gọi API). */
  onQueryChange?: (query: string) => void;
  remoteLoading?: boolean;
  remoteError?: string | null;
  /**
   * Khi có — nhấn "Tạo khách hàng" gọi callback (vd. mở màn tạo khách đầy đủ)
   * thay cho modal nội bộ.
   */
  onOpenCreateCustomer?: () => void;
  /** Sau khi tạo khách hợp lệ trong modal (tuỳ chọn — ví dụ đồng bộ form đơn). */
  onCustomerCreated?: (
    values: CreateCustomerFormValues,
    item: CustomerSearchItem,
  ) => void;
  placeholder?: string;
  minSearchLength?: number;
};

function createPersonGlyphStyles(p: AppColorPalette) {
  return StyleSheet.create({
    wrap: {
      width: 22,
      height: 22,
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    head: {
      width: 8,
      height: 8,
      borderRadius: 4,
      borderWidth: 1.5,
      borderColor: p.textSecondary,
      marginBottom: 1,
    },
    body: {
      width: 14,
      height: 8,
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      borderWidth: 1.5,
      borderBottomWidth: 0,
      borderColor: p.textSecondary,
    },
  });
}

function PersonGlyph() {
  const pg = useThemeStyleSheet(createPersonGlyphStyles);
  return (
    <View style={pg.wrap} accessibilityLabel="Khách hàng">
      <View style={pg.head} />
      <View style={pg.body} />
    </View>
  );
}

function matchesQuery(row: CustomerSearchItem, q: string): boolean {
  const s = q.trim().toLowerCase();
  if (s.length < 2) {
    return false;
  }
  const parts = [row.name, row.code, row.email, row.phone]
    .filter(Boolean)
    .map(x => String(x).toLowerCase());
  return parts.some(p => p.includes(s));
}

const EMPTY_RECENT_CUSTOMERS: CustomerSearchItem[] = [];

export function CustomerSearchCombo({
  label = 'Khách hàng',
  labelBackgroundColor,
  value,
  onChange,
  customers,
  recentCustomers = EMPTY_RECENT_CUSTOMERS,
  remoteSearch = false,
  onQueryChange,
  remoteLoading = false,
  remoteError = null,
  onOpenCreateCustomer,
  onCustomerCreated,
  placeholder = 'Tìm theo tên, mã, email, số điện thoại',
  minSearchLength = 2,
}: CustomerSearchComboProps) {
  const palette = useAppColors();
  const s = useThemeStyleSheet(createCustomerSearchComboStyles);
  const dispatch = useAppDispatch();
  const inputRef = useRef<TextInput>(null);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevValueRef = useRef<CustomerSearchItem | null>(null);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const menuOpen = focused;

  useEffect(() => {
    if (value) {
      setQuery(value.name);
    } else if (prevValueRef.current != null && !focused) {
      // Parent bỏ chọn — không xóa khi user đang sửa ô tìm kiếm (focused)
      setQuery('');
    }
    prevValueRef.current = value;
  }, [value, focused]);

  const clearBlurTimer = useCallback(() => {
    if (blurTimer.current) {
      clearTimeout(blurTimer.current);
      blurTimer.current = null;
    }
  }, []);

  const scheduleBlur = useCallback(() => {
    clearBlurTimer();
    blurTimer.current = setTimeout(() => {
      setFocused(false);
      blurTimer.current = null;
    }, 220);
  }, [clearBlurTimer]);

  useEffect(() => () => clearBlurTimer(), [clearBlurTimer]);

  const matchingRecentCustomers = useMemo(() => {
    const q = query.trim();
    if (q.length === 0) {
      return recentCustomers;
    }
    const s = q.toLowerCase();
    return recentCustomers.filter(row =>
      [row.name, row.code, row.email, row.phone]
        .filter(Boolean)
        .some(part => String(part).toLowerCase().includes(s)),
    );
  }, [query, recentCustomers]);

  const results = useMemo(() => {
    const q = query.trim();
    if (q.length < minSearchLength) {
      return matchingRecentCustomers;
    }
    const searched = remoteSearch
      ? customers
      : customers.filter(row => matchesQuery(row, q));
    const seen = new Set<number>();
    return [...matchingRecentCustomers, ...searched].filter(row => {
      if (seen.has(row.id)) {
        return false;
      }
      seen.add(row.id);
      return true;
    });
  }, [customers, query, minSearchLength, remoteSearch, matchingRecentCustomers]);

  const borderColor = menuOpen || focused ? palette.teal : palette.border;

  const labelBg = labelBackgroundColor ?? palette.bgCard;

  const qTrim = query.trim();
  const showMinCharsHint = qTrim.length < minSearchLength;
  const showRecentSuggestions =
    qTrim.length < minSearchLength && matchingRecentCustomers.length > 0;
  const showEmptySearch =
    qTrim.length >= minSearchLength &&
    !remoteLoading &&
    !remoteError &&
    results.length === 0;

  const handleSelect = useCallback(
    (item: CustomerSearchItem) => {
      clearBlurTimer();
      setQuery(item.name);
      onChange(item);
      setFocused(false);
      inputRef.current?.blur();
    },
    [clearBlurTimer, onChange],
  );

  const handleCreate = useCallback(() => {
    clearBlurTimer();
    setFocused(false);
    inputRef.current?.blur();
    if (onOpenCreateCustomer) {
      onOpenCreateCustomer();
      return;
    }
    setCreateModalOpen(true);
  }, [clearBlurTimer, onOpenCreateCustomer]);

  const handleCreateCustomerSubmit = useCallback(
    async (values: CreateCustomerFormValues) => {
      const item = await dispatch(
        createCustomerThunk({
          name: values.name.trim(),
          phone: values.phone.trim(),
          email: values.email.trim(),
          address: values.address.trim(),
        }),
      ).unwrap();
      onChange(item);
      setQuery(item.name);
      onCustomerCreated?.(values, item);
      toast.success(`Đã tạo khách hàng "${item.name}".`);
    },
    [dispatch, onChange, onCustomerCreated],
  );

  const onChangeText = useCallback(
    (text: string) => {
      setQuery(text);
      onQueryChange?.(text);
      if (value && text.trim() !== value.name.trim()) {
        onChange(null);
      }
    },
    [onChange, onQueryChange, value],
  );

  const renderCustomerRow = useCallback(
    ({ item }: { item: CustomerSearchItem }) => (
      <Pressable
        key={String(item.id)}
        style={s.resultRow}
        onPressIn={clearBlurTimer}
        onPress={() => handleSelect(item)}
      >
        <Text style={s.resultName} numberOfLines={1}>
          {item.name}
        </Text>
        {item.phone ? (
          <Text style={s.resultSub} numberOfLines={1}>
            {item.phone}
            {item.email
              ? ` · ${item.email}`
              : item.code
              ? ` · ${item.code}`
              : ''}
          </Text>
        ) : item.email ? (
          <Text style={s.resultSub} numberOfLines={1}>
            {item.email}
          </Text>
        ) : item.code ? (
          <Text style={s.resultSub} numberOfLines={1}>
            {item.code}
          </Text>
        ) : null}
      </Pressable>
    ),
    [clearBlurTimer, handleSelect, s],
  );

  const resultRows = useMemo(
    () => results.map(item => renderCustomerRow({ item })),
    [results, renderCustomerRow],
  );

  let body: React.ReactNode;
  if (showRecentSuggestions) {
    body = (
      <>
        <Text style={s.recentTitle}>Khách hàng gần đây</Text>
        <ScrollView
          keyboardShouldPersistTaps="always"
          style={s.list}
          nestedScrollEnabled
        >
          {resultRows}
        </ScrollView>
      </>
    );
  } else if (showMinCharsHint) {
    body = (
      <Text style={s.hint}>
        Nhập ít nhất {minSearchLength} ký tự để tìm kiếm
      </Text>
    );
  } else if (remoteSearch && remoteLoading) {
    body = (
      <View style={s.loadingWrap}>
        <ActivityIndicator size="small" color={palette.tealLight} />
        <Text style={s.loadingTxt}>Đang tìm…</Text>
      </View>
    );
  } else if (remoteSearch && remoteError) {
    body = <Text style={s.errTxt}>{remoteError}</Text>;
  } else if (showEmptySearch) {
    body = <Text style={s.hint}>Không tìm thấy khách hàng</Text>;
  } else {
    body = (
      <ScrollView
        keyboardShouldPersistTaps="always"
        style={s.list}
        nestedScrollEnabled
      >
        {resultRows}
      </ScrollView>
    );
  }

  return (
    <View style={s.root}>
      <Pressable
        style={[s.outline, { borderColor }]}
        onPress={() => inputRef.current?.focus()}
      >
        <View
          style={[s.labelCut, { backgroundColor: labelBg }]}
          pointerEvents="none"
        >
          <Text style={s.labelTxt}>{label}</Text>
        </View>
        <View style={s.inputRow}>
          <PersonGlyph />
          <TextInput
            ref={inputRef}
            style={s.input}
            value={query}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={palette.textMuted}
            onFocus={() => {
              clearBlurTimer();
              setFocused(true);
            }}
            onBlur={scheduleBlur}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={s.chevSlot}>
            <SystemIcon
              name={menuOpen ? 'chevronUp' : 'chevronDown'}
              size={14}
              color={palette.textMuted}
            />
          </View>
        </View>
      </Pressable>

      {menuOpen ? (
        <View
          style={s.dropdown}
          onStartShouldSetResponder={() => true}
          onTouchEnd={e => e.stopPropagation()}
        >
          <Pressable
            style={s.createRow}
            onPressIn={clearBlurTimer}
            onPress={handleCreate}
          >
            <View style={s.plusCircle}>
              <Text style={s.plusTxt}>+</Text>
            </View>
            <Text style={s.createTxt}>Tạo khách hàng</Text>
          </Pressable>
          <View style={s.sep} />
          {body}
        </View>
      ) : null}

      {onOpenCreateCustomer == null ? (
        <CreateCustomerModal
          visible={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSubmit={handleCreateCustomerSubmit}
        />
      ) : null}
    </View>
  );
}

function createCustomerSearchComboStyles(c: AppColorPalette) {
  return StyleSheet.create({
    root: {
      marginBottom: 0,
      minWidth: 0,
      flexShrink: 1,
      alignSelf: 'stretch',
      width: '100%',
    },
    outline: {
      borderRadius: 10,
      borderWidth: 1.5,
      backgroundColor: c.bgInput,
      paddingHorizontal: 12,
      paddingTop: 12,
      paddingBottom: 10,
      minHeight: 52,
    },
    labelCut: {
      position: 'absolute',
      left: 10,
      top: -9,
      paddingHorizontal: 6,
      zIndex: 2,
    },
    labelTxt: {
      fontSize: 12,
      fontWeight: '700',
      color: c.tealLight,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    input: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: c.textPrimary,
      paddingVertical: 0,
      minHeight: 28,
    },
    chevSlot: { justifyContent: 'center' },
    dropdown: {
      marginTop: 6,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgCard,
      overflow: 'hidden',
      maxHeight: 220,
    },
    createRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 14,
    },
    plusCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: c.teal,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    plusTxt: {
      fontSize: 20,
      fontWeight: '600',
      color: c.tealLight,
      marginTop: -2,
    },
    createTxt: {
      fontSize: 15,
      fontWeight: '700',
      color: c.tealLight,
    },
    sep: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: c.border,
      marginHorizontal: 12,
    },
    recentTitle: {
      color: c.textMuted,
      fontSize: 12,
      fontWeight: '800',
      paddingHorizontal: 14,
      paddingTop: 10,
      paddingBottom: 6,
      textTransform: 'uppercase',
    },
    hint: {
      textAlign: 'center',
      fontSize: 13,
      color: c.textSecondary,
      paddingVertical: 22,
      paddingHorizontal: 16,
      lineHeight: 18,
    },
    errTxt: {
      textAlign: 'center',
      fontSize: 13,
      color: c.red,
      paddingVertical: 18,
      paddingHorizontal: 14,
      lineHeight: 18,
      fontWeight: '600',
    },
    loadingWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      paddingVertical: 20,
    },
    loadingTxt: {
      fontSize: 13,
      color: c.textSecondary,
      fontWeight: '600',
    },
    list: { maxHeight: 160 },
    resultRow: {
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    resultName: {
      fontSize: 15,
      fontWeight: '700',
      color: c.textPrimary,
    },
    resultSub: {
      fontSize: 12,
      color: c.textMuted,
      marginTop: 4,
    },
  });
}
