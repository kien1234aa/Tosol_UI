import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

const FilterSheetHostContext = createContext(false);

type SetFilterSheetPortal = (node: ReactNode | null) => void;
const FilterSheetPortalContext = createContext<SetFilterSheetPortal | null>(
  null,
);

/** Bật khi nằm trong sheet/modal lọc — picker con dùng overlay inline trên iOS. */
export const FilterSheetHostProvider = FilterSheetHostContext.Provider;

export function useInsideFilterSheetHost(): boolean {
  return useContext(FilterSheetHostContext);
}

/** Gắn overlay (date picker, v.v.) lên root host — tránh bị ScrollView cắt. */
export function useFilterSheetPortal(): SetFilterSheetPortal | null {
  return useContext(FilterSheetPortalContext);
}

/**
 * Bọc nội dung modal/sheet lọc: bật context host + slot portal ở cuối cây.
 * Dùng thay cho `<FilterSheetHostProvider value>` ở modal lọc nâng cao.
 */
export function FilterSheetHost({ children }: { children: ReactNode }) {
  const [portalNode, setPortalNode] = useState<ReactNode>(null);
  const setPortal = useCallback((node: ReactNode | null) => {
    setPortalNode(node);
  }, []);

  return (
    <FilterSheetHostContext.Provider value>
      <FilterSheetPortalContext.Provider value={setPortal}>
        <View style={hostStyles.wrap}>
          {children}
          {portalNode}
        </View>
      </FilterSheetPortalContext.Provider>
    </FilterSheetHostContext.Provider>
  );
}

const hostStyles = StyleSheet.create({
  wrap: {
    flex: 1,
    position: 'relative',
  },
});

export type FilterSheetOverlayProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  sheetStyle?: StyleProp<ViewStyle>;
  /** Ép overlay inline (mặc định: iOS + đang trong FilterSheetHost). */
  inline?: boolean;
};

/**
 * Sheet phụ (chọn option, date picker…) — tránh Modal lồng Modal trên iOS.
 */
export function FilterSheetOverlay({
  visible,
  onClose,
  children,
  sheetStyle,
  inline,
}: FilterSheetOverlayProps) {
  const inHost = useInsideFilterSheetHost();
  const useInline = inline ?? (Platform.OS === 'ios' && inHost);

  if (!visible) {
    return null;
  }

  const body = (
    <>
      <Pressable
        style={overlayStyles.backdrop}
        onPress={onClose}
        accessibilityRole="button"
      />
      <Pressable
        style={[overlayStyles.sheet, sheetStyle]}
        onPress={e => e.stopPropagation()}
      >
        {children}
      </Pressable>
    </>
  );

  if (useInline) {
    return <View style={overlayStyles.inlineHost}>{body}</View>;
  }

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      presentationStyle={Platform.OS === 'ios' ? 'overFullScreen' : undefined}
    >
      <View style={overlayStyles.modalHost}>{body}</View>
    </Modal>
  );
}

const overlayStyles = StyleSheet.create({
  modalHost: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  inlineHost: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 2000,
    elevation: 2000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    maxHeight: '72%',
  },
});
