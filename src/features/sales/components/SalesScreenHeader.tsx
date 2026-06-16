import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors, useThemeMode } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  AppState,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { logout, setSelectedWarehouse } from '@services/auth/authSlice';
import {
  clearShopWarehouseContext,
  switchShopContextWarehouse,
} from '@services/settings/shopSlice';
import { SystemIcon, type SystemIconName } from '@shared/components/icons/SystemIcon';
import { ChromeControlShell } from '@shared/components/ui/ChromeControlShell';
import { RADIUS } from '@shared/theme/designTokens';
import { SELLER_CHROME_PAD_H } from '@shared/theme/sellerChromeTheme';
import { SellerChromeScreenHeader } from '@shared/components/sellerChrome/SellerChromeScreenHeader';
import { useTranslation } from 'react-i18next';
import { useAppLocale, type AppLocale } from '@app/providers/LocaleContext';
import {
  resolveSectionNavItemLabel,
  settingsSectionNavForAppRole,
  type SectionNavItem,
} from '../navigation/salesSectionNavConfig';
import { refreshCounters } from '@services/system/countersSlice';
import { PUSH_NOTIF_STORAGE_KEY } from '../../notifications/notificationPrefsKeys';
import { navigateSalesStackScreen } from '../navigation/salesNavigationRef';
import { useSalesShellNavOptional } from '../navigation/SalesShellNavContext';
import { StaffChangePasswordModal } from '../../settings/staff/StaffChangePasswordModal';
import { WarehousePickerModal } from './WarehousePickerModal';
import { getInitials } from '../utils/greeting';
import type { LoginUser } from '@services/auth/loginResponseTypes';
import { selectNormalizedAppRole } from '@features/auth/store/authSelectors';
import { SALES_WAREHOUSE_CONTEXT_DROPDOWN_KEY } from '../../dropdownFrequency/dropdownFrequencyKeys';
import { useFrequencyDropdown } from '../../dropdownFrequency/useFrequencyDropdown';

const HEADER_ON_BRAND = '#ffffff';

const LANGUAGE_LOCALES: AppLocale[] = ['vi', 'en', 'ja'];

export type SalesScreenHeaderProps = {
  /** @deprecated Không còn drawer; giữ prop để tương thích màn gọi cũ. */
  onOpenDrawer?: () => void;
  /** Tiêu đề header demo (ghi đè tự suy từ drawer). */
  screenTitle?: string;
  screenSubtitle?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
};

function warehouseSummaryLabel(
  sellerName: string,
  warehouses: { id: number; name: string }[],
  selectedId: number | null,
  t: (key: string, opts?: Record<string, string | number>) => string,
): string {
  const all = t('header.warehouseAll');
  if (selectedId == null) {
    return t('warehousePicker.allRowTitle', { sellerName, all });
  }
  const w = warehouses.find(x => x.id === selectedId);
  return w
    ? `${sellerName} — ${w.name}`
    : t('warehousePicker.allRowTitle', { sellerName, all });
}

type NavPickModalProps = {
  visible: boolean;
  title: string;
  options: { drawerId: string; label: string }[];
  activeDrawerId: string;
  onClose: () => void;
  onPick: (drawerId: string) => void;
  /** Danh mục cài đặt: một hàng «Cài đặt» bấm để xổ các mục con xuống. */
  variant?: 'flat' | 'settingsAccordion';
};

function NavPickModal({
  visible,
  title,
  options,
  activeDrawerId,
  onClose,
  onPick,
  variant = 'flat',
}: NavPickModalProps) {
  const { t } = useTranslation();
  const palette = useAppColors();
  const insets = useSafeAreaInsets();
  const styles = useThemeStyleSheet(createNavPickModalStyles);
  const [settingsAccordionOpen, setSettingsAccordionOpen] = useState(false);

  useEffect(() => {
    if (!visible) {
      setSettingsAccordionOpen(false);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        <Pressable
          style={styles.modalBackdrop}
          onPress={onClose}
          accessibilityLabel={t('header.close')}
        />
        <View
          style={[
            styles.modalSheet,
            {
              backgroundColor: palette.bgCard,
              borderColor: palette.border,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          {title.trim().length > 0 ? (
            <Text style={[styles.modalTitle, { color: palette.textPrimary }]}>
              {title}
            </Text>
          ) : null}
          <ScrollView
            style={styles.modalScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {variant === 'settingsAccordion' ? (
              <>
                <Pressable
                  onPress={() => setSettingsAccordionOpen(o => !o)}
                  style={({ pressed }) => [
                    styles.settingsAccordionParent,
                    pressed && { opacity: 0.88 },
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: settingsAccordionOpen }}
                  accessibilityLabel={t('header.settings')}
                >
                  <SystemIcon
                    name="settings"
                    size={22}
                    color={palette.textSecondary}
                  />
                  <Text
                    style={[
                      styles.settingsAccordionParentLabel,
                      { color: palette.textPrimary },
                    ]}
                  >
                    {t('header.settings')}
                  </Text>
                  <SystemIcon
                    name={settingsAccordionOpen ? 'chevronUp' : 'chevronDown'}
                    size={20}
                    color={palette.textMuted}
                  />
                </Pressable>
                {settingsAccordionOpen
                  ? options.map(o => {
                      const active = o.drawerId === activeDrawerId;
                      return (
                        <Pressable
                          key={o.drawerId}
                          onPress={() => {
                            onPick(o.drawerId);
                            onClose();
                          }}
                          style={[
                            styles.settingsAccordionChild,
                            active && {
                              backgroundColor: palette.bgRow,
                              borderColor: palette.borderMid,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.settingsAccordionChildLabel,
                              {
                                color: active
                                  ? palette.textLink
                                  : palette.textPrimary,
                              },
                            ]}
                            numberOfLines={2}
                          >
                            {o.label}
                          </Text>
                          {active ? (
                            <SystemIcon
                              name="check"
                              size={18}
                              color={palette.textLink}
                            />
                          ) : null}
                        </Pressable>
                      );
                    })
                  : null}
              </>
            ) : (
              options.map(o => {
                const active = o.drawerId === activeDrawerId;
                return (
                  <Pressable
                    key={o.drawerId}
                    onPress={() => {
                      onPick(o.drawerId);
                      onClose();
                    }}
                    style={[
                      styles.modalRow,
                      active && {
                        backgroundColor: palette.bgRow,
                        borderColor: palette.borderMid,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.modalRowText,
                        {
                          color: active
                            ? palette.textLink
                            : palette.textPrimary,
                        },
                      ]}
                      numberOfLines={2}
                    >
                      {o.label}
                    </Text>
                    {active ? (
                      <SystemIcon
                        name="check"
                        size={18}
                        color={palette.textLink}
                      />
                    ) : null}
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

type LanguageLocaleModalProps = {
  visible: boolean;
  activeLocale: AppLocale;
  onClose: () => void;
  onPick: (locale: AppLocale) => void;
};

function LanguageLocaleModal({
  visible,
  activeLocale,
  onClose,
  onPick,
}: LanguageLocaleModalProps) {
  const { t } = useTranslation();
  const palette = useAppColors();
  const insets = useSafeAreaInsets();
  const styles = useThemeStyleSheet(createNavPickModalStyles);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        <Pressable
          style={styles.modalBackdrop}
          onPress={onClose}
          accessibilityLabel={t('header.close')}
        />
        <View
          style={[
            styles.modalSheet,
            {
              backgroundColor: palette.bgCard,
              borderColor: palette.border,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          <Text style={[styles.modalTitle, { color: palette.textPrimary }]}>
            {t('language.title')}
          </Text>
          <ScrollView
            style={styles.modalScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {LANGUAGE_LOCALES.map(loc => {
              const active = loc === activeLocale;
              return (
                <Pressable
                  key={loc}
                  onPress={() => {
                    onPick(loc);
                    onClose();
                  }}
                  style={[
                    styles.modalRow,
                    active && {
                      backgroundColor: palette.bgRow,
                      borderColor: palette.borderMid,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.modalRowText,
                      {
                        color: active ? palette.textLink : palette.textPrimary,
                      },
                    ]}
                    numberOfLines={2}
                  >
                    {t(`language.${loc}`)}
                  </Text>
                  {active ? (
                    <SystemIcon
                      name="check"
                      size={18}
                      color={palette.textLink}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

type PersonalInfoModalProps = {
  visible: boolean;
  user: LoginUser | null;
  onClose: () => void;
  onOpenChangePassword?: () => void;
};

function PersonalInfoModal({
  visible,
  user,
  onClose,
  onOpenChangePassword,
}: PersonalInfoModalProps) {
  const { t } = useTranslation();
  const palette = useAppColors();
  const insets = useSafeAreaInsets();
  const styles = useThemeStyleSheet(createNavPickModalStyles);
  const rowStyles = useThemeStyleSheet(createPersonalInfoModalStyles);
  const appRole = useAppSelector(selectNormalizedAppRole);

  if (user == null) {
    return null;
  }

  const roleLabel = t(`role.${appRole}`);
  const org = user.seller?.name?.trim() || '—';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        <Pressable
          style={styles.modalBackdrop}
          onPress={onClose}
          accessibilityLabel={t('header.close')}
        />
        <View
          style={[
            styles.modalSheet,
            {
              backgroundColor: palette.bgCard,
              borderColor: palette.border,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          <Text style={[styles.modalTitle, { color: palette.textPrimary }]}>
            {t('header.personalInfoTitle')}
          </Text>
          <ScrollView
            style={styles.modalScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[rowStyles.fieldBlock, { borderColor: palette.border }]}
            >
              <Text
                style={[rowStyles.fieldLabel, { color: palette.textMuted }]}
              >
                {t('header.fullName')}
              </Text>
              <Text
                style={[rowStyles.fieldValue, { color: palette.textPrimary }]}
              >
                { user.name}
              </Text>
            </View>
            <View
              style={[rowStyles.fieldBlock, { borderColor: palette.border }]}
            >
              <Text
                style={[rowStyles.fieldLabel, { color: palette.textMuted }]}
              >
                {t('auth.email')}
              </Text>
              <Text
                style={[rowStyles.fieldValue, { color: palette.textPrimary }]}
              >
                { user.email}
              </Text>
            </View>
            <View
              style={[rowStyles.fieldBlock, { borderColor: palette.border }]}
            >
              <Text
                style={[rowStyles.fieldLabel, { color: palette.textMuted }]}
              >
                {t('header.role')}
              </Text>
              <Text
                style={[rowStyles.fieldValue, { color: palette.textPrimary }]}
              >
                {roleLabel}
              </Text>
            </View>
            <View
              style={[rowStyles.fieldBlock, { borderColor: palette.border }]}
            >
              <Text
                style={[rowStyles.fieldLabel, { color: palette.textMuted }]}
              >
                {t('header.organization')}
              </Text>
              <Text
                style={[rowStyles.fieldValue, { color: palette.textPrimary }]}
              >
                {org}
              </Text>
            </View>
            {onOpenChangePassword ? (
              <Pressable
                onPress={() => {
                  onClose();
                  onOpenChangePassword();
                }}
                style={[
                  rowStyles.changePwBtn,
                  { borderColor: palette.border, backgroundColor: palette.bgRow },
                ]}
                accessibilityRole="button"
              >
                <SystemIcon name="lock" size={18} color={palette.tealLight} />
                <Text
                  style={[
                    rowStyles.changePwBtnTxt,
                    { color: palette.textPrimary },
                  ]}
                >
                  {t('header.changePassword')}
                </Text>
              </Pressable>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function createPersonalInfoModalStyles(_palette: AppColorPalette) {
  return StyleSheet.create({
    fieldBlock: {
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: RADIUS.control,
      borderWidth: 1,
      marginBottom: 10,
    },
    fieldLabel: {
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 4,
    },
    fieldValue: {
      fontSize: 15,
      fontWeight: '700',
    },
    changePwBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 4,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: RADIUS.control,
      borderWidth: 1,
    },
    changePwBtnTxt: {
      fontSize: 15,
      fontWeight: '700',
    },
  });
}

type ProfileAccountMenuModalProps = {
  visible: boolean;
  onClose: () => void;
  displayName: string;
  email: string;
  initials: string;
  roleLabel: string;
  orgName: string;
  locale: AppLocale;
  mode: 'light' | 'dark';
  onOpenPersonalInfo: () => void;
  settingsItems: SectionNavItem[] | null;
  /** Nhãn accordion (chỉ seller). */
  settingsAccordionTitle?: string;
  /** Icon accordion (chỉ seller). */
  settingsAccordionIcon?: SystemIconName;
  activeSettingsDrawerId: string;
  onNavigateSettings: (drawerId: string) => void;
  onOpenLanguage: () => void;
  onThemeDark: (dark: boolean) => void;
  onLogout: () => void;
  loggingOut: boolean;
};

function ProfileAccountMenuModal({
  visible,
  onClose,
  displayName,
  email,
  initials,
  roleLabel,
  orgName,
  locale,
  mode,
  onOpenPersonalInfo,
  settingsItems,
  settingsAccordionTitle,
  settingsAccordionIcon = 'settings',
  activeSettingsDrawerId,
  onNavigateSettings,
  onOpenLanguage,
  onThemeDark,
  onLogout,
  loggingOut,
}: ProfileAccountMenuModalProps) {
  const { t } = useTranslation();
  const settingsAccordionLabel = settingsAccordionTitle ?? t('header.settings');
  const palette = useAppColors();
  const insets = useSafeAreaInsets();
  const sheetStyles = useThemeStyleSheet(createNavPickModalStyles);
  const st = useThemeStyleSheet(createProfileMenuBodyStyles);
  const langLabel = t(`language.${locale}`);
  const [settingsAccordionOpen, setSettingsAccordionOpen] = useState(false);

  useEffect(() => {
    if (!visible) {
      setSettingsAccordionOpen(false);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={sheetStyles.modalRoot}>
        <Pressable
          style={sheetStyles.modalBackdrop}
          onPress={onClose}
          accessibilityLabel={t('header.closeMenu')}
        />
        <View
          style={[
            sheetStyles.modalSheet,
            {
              backgroundColor: palette.bgCard,
              borderColor: palette.border,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          <Text
            style={[sheetStyles.modalTitle, { color: palette.textPrimary }]}
          >
            {t('header.accountTitle')}
          </Text>
          <ScrollView
            style={sheetStyles.modalScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={st.sheetScrollContent}
          >
            <View style={st.popHeaderRow}>
              <View style={[st.popAvatar, { backgroundColor: palette.green }]}>
                <Text style={st.popAvatarTxt}>{initials}</Text>
              </View>
              <View style={st.popHeaderText}>
                <Text
                  style={[st.popName, { color: palette.textPrimary }]}
                  numberOfLines={1}
                >
                  {displayName}
                </Text>
                <Text
                  style={[st.popEmail, { color: palette.textMuted }]}
                  numberOfLines={2}
                >
                  {email}
                </Text>
              </View>
            </View>

            <View style={[st.divider, { backgroundColor: palette.border }]} />

            <View style={st.badgeRow}>
              <View
                style={[
                  st.roleBadge,
                  {
                    backgroundColor: palette.greenBg,
                    borderColor: palette.border,
                  },
                ]}
              >
                <SystemIcon name="shield" size={14} color={palette.green} />
                <Text
                  style={[st.roleBadgeTxt, { color: palette.textPrimary }]}
                  numberOfLines={1}
                >
                  {roleLabel}
                </Text>
              </View>
              <Text
                style={[st.orgName, { color: palette.textMuted }]}
                numberOfLines={2}
              >
                {orgName}
              </Text>
            </View>

            <View style={[st.divider, { backgroundColor: palette.border }]} />

            <Pressable
              style={({ pressed }) => [
                st.menuRow,
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => {
                onClose();
                onOpenPersonalInfo();
              }}
            >
              <SystemIcon
                name="person"
                size={20}
                color={palette.textSecondary}
              />
              <Text style={[st.menuRowTxt, { color: palette.textPrimary }]}>
                {t('header.personalInfo')}
              </Text>
            </Pressable>
            {settingsItems != null && settingsItems.length > 0 ? (
              <>
                <View
                  style={[st.divider, { backgroundColor: palette.border }]}
                />
                <Pressable
                  onPress={() => setSettingsAccordionOpen(o => !o)}
                  style={({ pressed }) => [
                    sheetStyles.settingsAccordionParent,
                    pressed && { opacity: 0.88 },
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: settingsAccordionOpen }}
                  accessibilityLabel={settingsAccordionLabel}
                >
                  <SystemIcon
                    name={settingsAccordionIcon}
                    size={22}
                    color={palette.textSecondary}
                  />
                  <Text
                    style={[
                      sheetStyles.settingsAccordionParentLabel,
                      { color: palette.textPrimary },
                    ]}
                  >
                    {settingsAccordionLabel}
                  </Text>
                  <SystemIcon
                    name={settingsAccordionOpen ? 'chevronUp' : 'chevronDown'}
                    size={20}
                    color={palette.textMuted}
                  />
                </Pressable>
                {settingsAccordionOpen
                  ? settingsItems.map(item => {
                      const active = item.drawerId === activeSettingsDrawerId;
                      return (
                        <Pressable
                          key={item.drawerId}
                          style={({ pressed }) => [
                            sheetStyles.settingsAccordionChild,
                            active && {
                              backgroundColor: palette.bgRow,
                              borderColor: palette.borderMid,
                            },
                            pressed && { opacity: 0.9 },
                          ]}
                          onPress={() => {
                            onClose();
                            onNavigateSettings(item.drawerId);
                          }}
                        >
                          <Text
                            style={[
                              sheetStyles.settingsAccordionChildLabel,
                              {
                                color: active
                                  ? palette.textLink
                                  : palette.textPrimary,
                              },
                            ]}
                            numberOfLines={2}
                          >
                            {resolveSectionNavItemLabel(item, t)}
                          </Text>
                          {active ? (
                            <SystemIcon
                              name="check"
                              size={18}
                              color={palette.textLink}
                            />
                          ) : null}
                        </Pressable>
                      );
                    })
                  : null}
              </>
            ) : null}

            <View style={[st.divider, { backgroundColor: palette.border }]} />

            <Pressable
              style={({ pressed }) => [
                st.menuRowBetween,
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => {
                onClose();
                onOpenLanguage();
              }}
            >
              <View style={st.menuRowLeft}>
                <SystemIcon
                  name="globe"
                  size={20}
                  color={palette.textSecondary}
                />
                <View>
                  <Text style={[st.menuRowTxt, { color: palette.textPrimary }]}>
                    {t('header.language')}
                  </Text>
                  <Text style={[st.menuRowSub, { color: palette.textMuted }]}>
                    {langLabel}
                  </Text>
                </View>
              </View>
              <SystemIcon
                name="chevronForward"
                size={18}
                color={palette.textMuted}
              />
            </Pressable>

            <View style={st.menuRowBetweenAppearance}>
              <View style={st.menuRowLeft}>
                <SystemIcon
                  name={mode === 'dark' ? 'moon' : 'sunny'}
                  size={20}
                  color={palette.textSecondary}
                />
                <View>
                  <Text style={[st.menuRowTxt, { color: palette.textPrimary }]}>
                    {t('header.appearance')}
                  </Text>
                  <Text style={[st.menuRowSub, { color: palette.textMuted }]}>
                    {mode === 'dark'
                      ? t('header.themeDark')
                      : t('header.themeLight')}
                  </Text>
                </View>
              </View>
              <Switch
                value={mode === 'dark'}
                onValueChange={onThemeDark}
                trackColor={{
                  false: palette.borderMid,
                  true: palette.tealLight,
                }}
                thumbColor={
                  mode === 'dark' ? palette.surfaceWhite : palette.bgLayer2
                }
              />
            </View>

            <View style={[st.divider, { backgroundColor: palette.border }]} />

            <Pressable
              style={({ pressed }) => [
                st.menuRow,
                pressed && { opacity: 0.85 },
              ]}
              onPress={onLogout}
              disabled={loggingOut}
            >
              <SystemIcon name="logOut" size={20} color={palette.red} />
              <Text style={[st.menuRowTxt, { color: palette.red }]}>
                {loggingOut ? t('header.loggingOut') : t('header.logout')}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function createProfileMenuBodyStyles(_c: AppColorPalette) {
  return StyleSheet.create({
    sheetScrollContent: {
      paddingBottom: 8,
    },
    popHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    popAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    popAvatarTxt: {
      color: '#ffffff',
      fontSize: 15,
      fontWeight: '800',
    },
    popHeaderText: {
      flex: 1,
      minWidth: 0,
    },
    popName: {
      fontSize: 17,
      fontWeight: '800',
    },
    popEmail: {
      fontSize: 13,
      fontWeight: '600',
      marginTop: 2,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      marginVertical: 12,
    },
    badgeRow: {
      gap: 8,
    },
    roleBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 999,
      borderWidth: 1,
    },
    roleBadgeTxt: {
      fontSize: 12,
      fontWeight: '700',
    },
    orgName: {
      fontSize: 14,
      fontWeight: '600',
    },
    menuRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
    },
    menuRowBetween: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      paddingVertical: 8,
    },
    menuRowBetweenAppearance: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      paddingVertical: 10,
    },
    menuRowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
      minWidth: 0,
    },
    menuRowTxt: {
      fontSize: 15,
      fontWeight: '600',
    },
    menuRowTxtFlex: {
      flex: 1,
      minWidth: 0,
    },
    menuRowSub: {
      fontSize: 12,
      fontWeight: '600',
      marginTop: 2,
    },
  });
}

export function SalesScreenHeader({
  screenTitle: screenTitleProp,
  screenSubtitle: screenSubtitleProp,
  searchPlaceholder,
  searchValue,
  onSearchChange,
}: SalesScreenHeaderProps) {
  const { t } = useTranslation();
  const styles = useThemeStyleSheet(create_SalesScreenHeader_styles);
  const palette = useAppColors();
  const shell = useSalesShellNavOptional();
  const { mode, setMode } = useThemeMode();
  const { locale, setLocale } = useAppLocale();

  const dispatch = useAppDispatch();
  const { user, selectedWarehouseId, loggingOut } = useAppSelector(s => s.auth);
  const appRole = useAppSelector(selectNormalizedAppRole);
  const shopLoading = useAppSelector(s => s.shop.loading);
  const [whModal, setWhModal] = useState(false);
  const [sectionPickerOpen, setSectionPickerOpen] = useState(false);
  const [settingsPickerOpen, setSettingsPickerOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [personalInfoOpen, setPersonalInfoOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const notifBadgeCount = useAppSelector(s => s.counters.unreadBadge);

  const lastCountersRefreshMs = useRef(0);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          const pushRaw = await AsyncStorage.getItem(PUSH_NOTIF_STORAGE_KEY);
          if (cancelled) {
            return;
          }
          if (pushRaw === '0') {
            setPushEnabled(false);
          } else {
            setPushEnabled(true);
          }
          const now = Date.now();
          if (
            user != null &&
            now - lastCountersRefreshMs.current >= 15_000
          ) {
            lastCountersRefreshMs.current = now;
            dispatch(refreshCounters()).catch(() => {});
          }
        } catch {
          /* ignore */
        }
      })().catch(() => {});
      return () => {
        cancelled = true;
      };
    }, [dispatch, user]),
  );

  useEffect(() => {
    if (user == null) {
      return;
    }
    const sub = AppState.addEventListener('change', next => {
      if (next !== 'active') {
        return;
      }
      dispatch(refreshCounters()).catch(() => {});
    });
    return () => sub.remove();
  }, [dispatch, user]);

  const sellerName = user?.seller?.name ?? t('header.warehouseDefault');
  const warehouses = useMemo(() => user?.warehouses ?? [], [user?.warehouses]);
  const dropdownAccountKey = useMemo(
    () => user?.uuid ?? user?.email ?? null,
    [user?.email, user?.uuid],
  );
  const warehouseFrequencyOptions = useMemo(
    () => warehouses.map(w => ({ ...w, value: w.id })),
    [warehouses],
  );
  const {
    sortedOptions: sortedWarehouseOptions,
    handleSelect: recordWarehouseSelect,
  } = useFrequencyDropdown(
    SALES_WAREHOUSE_CONTEXT_DROPDOWN_KEY,
    warehouseFrequencyOptions,
    dropdownAccountKey,
  );
  const displayName = user?.name ?? t('header.userDefault');
  const userEmail = user?.email ?? '';
  const initials = getInitials(displayName, 2);
  const roleLabel = t(`role.${appRole}`);

  const settingsNavItems = useMemo(
    () => settingsSectionNavForAppRole(appRole),
    [appRole],
  );

  const sellerAvatarSettingsItems = useMemo(
    (): SectionNavItem[] | null => (shell == null ? null : settingsNavItems),
    [shell, settingsNavItems],
  );

  const settingsNavPickOptions = useMemo(
    () =>
      settingsNavItems.map(item => ({
        drawerId: item.drawerId,
        label: resolveSectionNavItemLabel(item, t),
      })),
    [settingsNavItems, t],
  );

  const headerWarehouse = useMemo(
    () => warehouseSummaryLabel(sellerName, warehouses, selectedWarehouseId, t),
    [sellerName, warehouses, selectedWarehouseId, t],
  );

  const handleWarehouseSelect = useCallback(
    async (id: number | null) => {
      const sameSelection =
        (id == null && selectedWarehouseId == null) ||
        (id != null &&
          selectedWarehouseId != null &&
          Number(id) === Number(selectedWarehouseId));
      if (sameSelection) {
        if (id != null) {
          recordWarehouseSelect(id);
        }
        return;
      }
      try {
        await dispatch(setSelectedWarehouse(id)).unwrap();
        if (id == null) {
          await dispatch(clearShopWarehouseContext()).unwrap();
        } else {
          await dispatch(switchShopContextWarehouse(id)).unwrap();
          recordWarehouseSelect(id);
        }
      } catch {
        /* ignore */
      }
    },
    [dispatch, recordWarehouseSelect, selectedWarehouseId],
  );

  const showSectionNav =
    shell?.sectionNav != null && shell.sectionNav.options.length > 0;
  const sectionButtonLabel =
    shell?.sectionNavButtonLabel ??
    shell?.sectionNav?.groupTitle ??
    t('header.choose');
  const handleLogoutFromMenu = useCallback(() => {
    setProfileMenuOpen(false);
    dispatch(logout());
  }, [dispatch]);

  const showNotifBadge = pushEnabled && notifBadgeCount > 0;
  const badgeLabel = notifBadgeCount > 99 ? '99+' : String(notifBadgeCount);

  const headerTitle =
    screenTitleProp ??
    shell?.sectionNavButtonLabel ??
    shell?.sectionNav?.groupTitle ??
    displayName;
  const headerSubtitle = screenSubtitleProp ?? headerWarehouse;

  const openNotifications = useCallback(() => {
    navigateSalesStackScreen('NotificationsList');
  }, []);

  return (
    <>
      <SellerChromeScreenHeader
        title={headerTitle}
        subtitle={headerSubtitle}
        searchPlaceholder={searchPlaceholder}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        onOpenNotifications={openNotifications}
        notificationBadge={showNotifBadge ? badgeLabel : undefined}
        onOpenSettings={() => setProfileMenuOpen(true)}
        compact
      />

      <LanguageLocaleModal
        visible={languageOpen}
        activeLocale={locale}
        onClose={() => setLanguageOpen(false)}
        onPick={setLocale}
      />
      <PersonalInfoModal
        visible={personalInfoOpen}
        user={ user}
        onClose={() => setPersonalInfoOpen(false)}
        onOpenChangePassword={() => setChangePasswordOpen(true)}
      />
      {user?.uuid ? (
        <StaffChangePasswordModal
          visible={changePasswordOpen}
          userUuid={user.uuid}
          forCurrentUser
          onClose={() => setChangePasswordOpen(false)}
          onPasswordChanged={() => {
            void dispatch(logout());
          }}
        />
      ) : null}
      <ProfileAccountMenuModal
        visible={profileMenuOpen}
        onClose={() => setProfileMenuOpen(false)}
        displayName={displayName}
        email={ userEmail}
        initials={initials}
        roleLabel={roleLabel}
        orgName={sellerName}
        locale={locale}
        mode={mode}
        onOpenPersonalInfo={() => setPersonalInfoOpen(true)}
        settingsItems={sellerAvatarSettingsItems}
        settingsAccordionIcon="settings"
        activeSettingsDrawerId={shell?.activeDrawerId ?? ''}
        onNavigateSettings={id => {
          setProfileMenuOpen(false);
          shell?.navigateByDrawerId(id);
        }}
        onOpenLanguage={() => setLanguageOpen(true)}
        onThemeDark={dark => setMode(dark ? 'dark' : 'light')}
        onLogout={handleLogoutFromMenu}
        loggingOut={loggingOut}
      />
      <View
        style={[styles.chromeStripCompact, { backgroundColor: palette.bg }]}
      >
        <View style={styles.chromeRow}>
          <ChromeControlShell style={styles.chromeHalf}>
            <Pressable style={styles.whInner} onPress={() => setWhModal(true)}>
              <Text
                style={[styles.whInnerText, { color: palette.textPrimary }]}
                numberOfLines={1}
              >
                {headerWarehouse}
              </Text>
              <SystemIcon
                name="chevronDown"
                size={16}
                color={palette.textMuted}
              />
            </Pressable>
          </ChromeControlShell>
          {showSectionNav && shell.sectionNav != null ? (
            <ChromeControlShell style={styles.chromeHalf}>
              <Pressable
                style={styles.whInner}
                onPress={() => setSectionPickerOpen(true)}
              >
                <Text
                  style={[styles.whInnerText, { color: palette.textPrimary }]}
                  numberOfLines={1}
                >
                  {sectionButtonLabel}
                </Text>
                <SystemIcon
                  name="chevronDown"
                  size={16}
                  color={palette.textMuted}
                />
              </Pressable>
            </ChromeControlShell>
          ) : null}
        </View>
      </View>

      <WarehousePickerModal
        visible={whModal}
        onClose={() => setWhModal(false)}
        sellerName={sellerName}
        warehouses={sortedWarehouseOptions}
        selectedId={selectedWarehouseId}
        busy={shopLoading}
        onSelect={handleWarehouseSelect}
      />

      {shell != null && shell.sectionNav != null ? (
        <NavPickModal
          visible={sectionPickerOpen}
          title={shell.sectionNav.groupTitle}
          options={shell.sectionNav.options}
          activeDrawerId={shell.activeDrawerId}
          onClose={() => setSectionPickerOpen(false)}
          onPick={id => shell.navigateByDrawerId(id)}
        />
      ) : null}

      {shell != null ? (
        <NavPickModal
          visible={settingsPickerOpen}
          title=""
          options={settingsNavPickOptions}
          activeDrawerId={shell.activeDrawerId}
          variant="settingsAccordion"
          onClose={() => setSettingsPickerOpen(false)}
          onPick={id => {
            shell.navigateByDrawerId(id);
            setSettingsPickerOpen(false);
          }}
        />
      ) : null}
    </>
  );
}

function createNavPickModalStyles(c: AppColorPalette) {
  return StyleSheet.create({
    modalRoot: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    modalBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    modalSheet: {
      borderTopLeftRadius: RADIUS.lg,
      borderTopRightRadius: RADIUS.lg,
      borderTopWidth: 1,
      paddingHorizontal: 16,
      paddingTop: 16,
      maxHeight: '72%',
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: '800',
      marginBottom: 10,
    },
    modalScroll: {
      maxHeight: 420,
    },
    modalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: RADIUS.control,
      borderWidth: 1,
      borderColor: 'transparent',
      marginBottom: 8,
    },
    modalRowText: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
    },
    settingsAccordionParent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: RADIUS.control,
      borderWidth: 1,
      borderColor: 'transparent',
      marginBottom: 8,
    },
    settingsAccordionParentLabel: {
      flex: 1,
      fontSize: 15,
      fontWeight: '800',
    },
    settingsAccordionChild: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      marginLeft: 10,
      paddingLeft: 14,
      paddingVertical: 12,
      paddingRight: 12,
      marginBottom: 6,
      borderLeftWidth: 2,
      borderLeftColor: c.borderMid,
      borderRadius: RADIUS.control,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    settingsAccordionChildLabel: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
    },
  });
}

function create_SalesScreenHeader_styles(c: AppColorPalette) {
  return StyleSheet.create({
    chromeStripCompact: {
      paddingHorizontal: SELLER_CHROME_PAD_H,
      paddingTop: 4,
      paddingBottom: 6,
    },
    chromeRow: {
      flexDirection: 'row',
      gap: 10,
      alignItems: 'stretch',
    },
    chromeHalf: {
      flex: 1,
      minWidth: 0,
    },
    whInner: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 8,
      gap: 8,
      minWidth: 0,
    },
    whInnerText: {
      flex: 1,
      fontSize: 13,
      fontWeight: '600',
    },
  });
}
