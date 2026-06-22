import React, { useCallback } from 'react';
import {
  FlatList,
  ListRenderItem,
  Pressable as RNPressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MinusCircle, PlusCircle } from 'lucide-react-native';
import { walletCopy } from '@/src/configs/wallet';
import { mainLayout } from '@/src/configs/main';
import { lightTokens } from '@/src/configs/theme';
import { useWallet } from '@/src/hooks/wallet';
import { useFeatureInDevelopmentNotice } from '@/src/hooks/common';
import { useStackGoBack } from '@/src/navigation/useStackGoBack';
import type { HomeStackScreenProps } from '@/src/navigation/types';
import type { WalletTransaction } from '@/src/types/wallet/wallet.types';
import {
  WalletForm,
  WalletSegmentedTabs,
  WalletTransactionCard,
} from '@/src/components/wallet';
import { StackHeader } from '@/src/components/main';
import { FormKeyboardAvoidingView } from '@/src/shared/components/ui/FormKeyboardAvoidingView';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

type WalletScreenProps = HomeStackScreenProps<'Wallet'>;

export function WalletScreen({ navigation }: WalletScreenProps) {
  const blockFeature = useFeatureInDevelopmentNotice();
  const {
    mode,
    activeTab,
    amount,
    transactions,
    setAmount,
  } = useWallet();

  const handleBack = useStackGoBack(navigation, 'HomeMain');

  const isTopup = mode === 'topup';
  const title = isTopup ? walletCopy.topupTitle : walletCopy.withdrawTitle;
  const ToggleIcon = isTopup ? MinusCircle : PlusCircle;
  const toggleLabel = isTopup
    ? walletCopy.toggleToWithdraw
    : walletCopy.toggleToTopup;

  const handlePrimary = useCallback(() => {
    blockFeature();
  }, [blockFeature]);

  const handleSecondary = useCallback(() => {
    blockFeature();
  }, [blockFeature]);

  const handleToggleMode = useCallback(() => {
    blockFeature();
  }, [blockFeature]);

  const handleTabChange = useCallback(() => {
    blockFeature();
  }, [blockFeature]);

  const renderItem = useCallback<ListRenderItem<WalletTransaction>>(
    ({ item }) => <WalletTransactionCard item={item} />,
    [],
  );

  const keyExtractor = useCallback((item: WalletTransaction) => item.id, []);

  const rightAction = (
    <RNPressable
      onPress={handleToggleMode}
      accessibilityRole="button"
      accessibilityLabel={toggleLabel}
      hitSlop={8}
      style={styles.toggleAction}>
      <ToggleIcon color={lightTokens.typography900} size={18} />
      <Text size="sm" className="font-semibold text-typography-900">
        {toggleLabel}
      </Text>
    </RNPressable>
  );

  return (
    <Box className="flex-1 bg-background-50">
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <VStack className="flex-1">
          <StackHeader
            title={title}
            onPressBack={handleBack}
            backAccessibilityLabel={walletCopy.back}
            rightAction={rightAction}
          />

          <Box style={styles.tabsWrap}>
            <WalletSegmentedTabs
              mode={mode}
              activeTab={activeTab}
              onChange={handleTabChange}
            />
          </Box>

          {activeTab === 'form' ? (
            <FormKeyboardAvoidingView extraOffset={56}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                contentContainerStyle={styles.formContent}>
                <WalletForm
                  mode={mode}
                  amount={amount}
                  onChangeAmount={setAmount}
                  onPrimary={handlePrimary}
                  onSecondary={handleSecondary}
                />
              </ScrollView>
            </FormKeyboardAvoidingView>
          ) : (
            <FlatList
              data={transactions}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={
                transactions.length === 0
                  ? styles.emptyContent
                  : styles.listContent
              }
              ItemSeparatorComponent={ListSeparator}
              ListEmptyComponent={
                <Center className="py-16">
                  <Text size="md" className="text-center text-typography-500">
                    {walletCopy.historyEmpty}
                  </Text>
                </Center>
              }
            />
          )}
        </VStack>
      </SafeAreaView>
    </Box>
  );
}

function ListSeparator() {
  return <Box style={styles.separator} />;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  toggleAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tabsWrap: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  formContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: mainLayout.tabContentBottomPadding,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: mainLayout.tabContentBottomPadding,
  },
  emptyContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  separator: {
    height: 12,
  },
});
