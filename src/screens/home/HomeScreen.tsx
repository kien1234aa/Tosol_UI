import React, { useCallback } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Box } from '@/src/uikits/box';
import { VStack } from '@/src/uikits/vstack';
import {
  homeCopy,
  homeGridColumns,
  orderActions,
  packageActions,
  quickActions,
} from '@/src/configs/home';
import { mainLayout } from '@/src/configs/main';
import { animationConfig } from '@/src/configs/theme';
import { useHomeDashboard } from '@/src/hooks/home';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import { selectUnreadNotificationCount } from '@/src/redux/notifications';
import type { HomeStackScreenProps } from '@/src/navigation/types';
import type {
  HomeActionKey,
  QuickActionKey,
} from '@/src/types/home/home.types';
import {
  ActionIconGrid,
  DashboardHeader,
  QuickActionsSection,
  SupportFab,
} from '@/src/components/home';

type HomeScreenProps = HomeStackScreenProps<'HomeMain'>;

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { displayName, badges } = useHomeDashboard();
  const unreadNotificationCount = useAppSelector(selectUnreadNotificationCount);
  const { stagger, screenEntry } = animationConfig;

  const handleOrderAction = useCallback(
    (key: HomeActionKey) => {
      if (key === 'orderCart') {
        navigation.navigate('Cart');
        return;
      }
      if (key === 'orderDeposit') {
        navigation.navigate('Orders', { screen: 'AwaitingDeposit' });
        return;
      }
      if (key === 'orderReady') {
        navigation.navigate('Orders', { screen: 'DeliveredOrders' });
        return;
      }
      navigation.navigate('Orders');
    },
    [navigation],
  );

  const handlePackageAction = useCallback(
    (key: HomeActionKey) => {
      if (key === 'packageCreate') {
        navigation.navigate('CreateConsignment');
        return;
      }
      if (key === 'packageList') {
        navigation.navigate('ConsignmentList');
        return;
      }
      if (key === 'packagePayment') {
        navigation.navigate('AwaitingPayment');
        return;
      }
      if (key === 'packageReady') {
        navigation.navigate('DeliveredConsignment');
        return;
      }
      navigation.navigate('Orders');
    },
    [navigation],
  );

  const handleNotifications = useCallback(() => {
    navigation.navigate('Notifications');
  }, [navigation]);

  const handleQuickAction = useCallback(
    (key: QuickActionKey) => {
      if (key === 'walletTopup') {
        navigation.navigate('Wallet');
        return;
      }
      if (key === 'costEstimate') {
        navigation.navigate('Estimate');
        return;
      }
      // Remaining quick-action routes are not registered yet.
    },
    [navigation],
  );

  const noop = useCallback(() => {}, []);

  return (
    <Box className="flex-1 bg-background-50">
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}>
          <VStack className="w-full" space="xl">
          <Animated.View entering={FadeInDown.duration(screenEntry)}>
            <DashboardHeader
              name={displayName}
              unreadCount={unreadNotificationCount}
              onPressAvatar={noop}
              onPressNotifications={handleNotifications}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(screenEntry).delay(stagger)}>
            <ActionIconGrid
              title={homeCopy.ordersSection}
              items={orderActions}
              columns={homeGridColumns.orders}
              badges={badges}
              onPressItem={handleOrderAction}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(screenEntry).delay(stagger * 2)}>
            <ActionIconGrid
              title={homeCopy.packagesSection}
              items={packageActions}
              columns={homeGridColumns.packages}
              badges={badges}
              onPressItem={handlePackageAction}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(screenEntry).delay(stagger * 3)}>
            <QuickActionsSection
              title={homeCopy.quickActionsSection}
              items={quickActions}
              onPressItem={handleQuickAction}
            />
          </Animated.View>
          </VStack>
        </ScrollView>

        <SupportFab onPress={noop} />
      </SafeAreaView>
    </Box>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: mainLayout.tabContentBottomPaddingLoose,
  },
});
