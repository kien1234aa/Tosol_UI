import React, { useCallback } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Box } from '@/src/uikits/box';
import { VStack } from '@/src/uikits/vstack';
import {
  homeCopy,
  orderActions,
  packageActions,
  quickActions,
} from '@/src/configs/home';
import { mainLayout } from '@/src/configs/main';
import { animationConfig } from '@/src/configs/theme';
import { showFeatureInDevelopmentAlert } from '@/src/helpers/app';
import { useHomeDashboard } from '@/src/hooks/home';
import { useResponsiveLayout } from '@/src/hooks/common/useResponsiveLayout';
import { useAppDispatch } from '@/src/hooks/common/useAppDispatch';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import { fetchOrderDashboardCountsThunk } from '@/src/redux/orders';
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
} from '@/src/components/home';

type HomeScreenProps = HomeStackScreenProps<'HomeMain'>;

export function HomeScreen({ navigation }: HomeScreenProps) {
  const dispatch = useAppDispatch();
  const { displayName, badges } = useHomeDashboard();
  const unreadNotificationCount = useAppSelector(selectUnreadNotificationCount);
  const { stagger, screenEntry } = animationConfig;
  const { horizontalPadding, contentMaxWidth, isTablet } = useResponsiveLayout();

  useFocusEffect(
    useCallback(() => {
      void dispatch(fetchOrderDashboardCountsThunk());
    }, [dispatch]),
  );

  const handleOrderAction = useCallback(
    (key: HomeActionKey) => {
      if (key === 'orderCreate') {
        navigation.navigate('CreateOrder', { screen: 'CreateOrderList' });
        return;
      }
      if (key === 'orderList') {
        navigation.navigate('Orders', { screen: 'OrdersMain' });
        return;
      }
      if (key === 'orderPayment') {
        navigation.navigate('Orders', { screen: 'OrdersMain' });
        return;
      }
      if (key === 'orderReady') {
        navigation.navigate('Orders', {
          screen: 'OrdersMain',
          params: { status: 'ready_to_ship' },
        });
        return;
      }
      navigation.navigate('Orders', { screen: 'OrdersMain' });
    },
    [navigation],
  );

  const handlePackageAction = useCallback(
    (key: HomeActionKey) => {
      if (
        key === 'packageCreate' ||
        key === 'packageList' ||
        key === 'packagePayment' ||
        key === 'packageReady'
      ) {
        showFeatureInDevelopmentAlert();
        return;
      }
      navigation.navigate('Orders');
    },
    [navigation],
  );

  const handleNotifications = useCallback(() => {
    navigation.navigate('Notifications');
  }, [navigation]);

  const handleQuickAction = useCallback((key: QuickActionKey) => {
    if (key === 'walletTopup' || key === 'costEstimate') {
      showFeatureInDevelopmentAlert();
    }
  }, []);

  const noop = useCallback(() => {}, []);

  return (
    <Box className="flex-1 bg-background-50">
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            {
              paddingHorizontal: horizontalPadding,
              maxWidth: isTablet ? contentMaxWidth.screen : undefined,
              alignSelf: isTablet ? 'center' : undefined,
              width: isTablet ? '100%' : undefined,
            },
          ]}>
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
                badges={badges}
                onPressItem={handleOrderAction}
              />
            </Animated.View>

            <Animated.View
              entering={FadeInDown.duration(screenEntry).delay(stagger * 2)}>
              <ActionIconGrid
                title={homeCopy.packagesSection}
                items={packageActions}
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
      </SafeAreaView>
    </Box>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingTop: 8,
    paddingBottom: mainLayout.tabContentBottomPadding,
  },
});
