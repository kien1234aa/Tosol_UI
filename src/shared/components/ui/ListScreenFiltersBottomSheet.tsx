import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppColors } from '../../theme/ThemeContext';
import { useThemeStyleSheet } from '../../theme/useThemeStyleSheet';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FilterSheetHost } from './filterSheetHost';
import { ListScreenFilterPickerSessionProvider } from './listScreenFilterPickerSession';
import { createListScreenFilterModalStyles } from './listScreenFilterModalStyles';

export type ListScreenFiltersBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

/** Sheet bộ lọc — các `ListScreenFilterPickerSection` bên trong. */
export function ListScreenFiltersBottomSheet({
  visible,
  onClose,
  title,
  children,
}: ListScreenFiltersBottomSheetProps) {
  const { t } = useTranslation();
  const styles = useThemeStyleSheet(createListScreenFilterModalStyles);
  const insets = useSafeAreaInsets();
  const colors = useAppColors();
  const panelTitle = title ?? t('common.listToolbar.filter');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      presentationStyle={Platform.OS === 'ios' ? 'overFullScreen' : undefined}
    >
      <FilterSheetHost>
        <ListScreenFilterPickerSessionProvider sheetVisible={visible}>
        <View style={sheetHostStyles.host}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityRole="button"
          />
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: insets.bottom + 150,
              backgroundColor: colors.bgCard,
            }}
          />
          <Pressable
            style={[styles.panel, { paddingBottom: insets.bottom + 20 }]}
            onPress={e => e.stopPropagation()}
          >
            <Text style={styles.panelTitle}>{panelTitle}</Text>
            {children}
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.doneBtn,
                pressed && styles.ddTriggerPressed,
              ]}
            >
              <Text style={styles.doneBtnText}>{t('common.done')}</Text>
            </Pressable>
          </Pressable>
        </View>
        </ListScreenFilterPickerSessionProvider>
      </FilterSheetHost>
    </Modal>
  );
}

const sheetHostStyles = StyleSheet.create({
  host: {
    flex: 1,
    justifyContent: 'flex-end',
  },
});
