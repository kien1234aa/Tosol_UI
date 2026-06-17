import React, { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users } from 'lucide-react-native';
import { staffCopy } from '@/src/configs/profile';
import { mainLayout } from '@/src/configs/main';
import { lightTokens } from '@/src/configs/theme';
import { ProfileStackHeader, StaffListCard } from '@/src/components/profile';
import { useStaffList } from '@/src/hooks/profile';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import { selectIsAdminUser } from '@/src/redux/login';
import { useStackGoBack } from '@/src/navigation/useStackGoBack';
import type { ProfileStackScreenProps } from '@/src/navigation/types';
import type { StaffListItem } from '@/src/types/profile/staff.types';
import { ListLoadingGate } from '@/src/shared/components/ui/ListLoadingGate';
import { ListScreenSkeleton } from '@/src/shared/components/ui/skeleton';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { HStack } from '@/src/uikits/hstack';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

type StaffListScreenProps = ProfileStackScreenProps<'StaffList'>;

export function StaffListScreen({ navigation }: StaffListScreenProps) {
  const isAdmin = useAppSelector(selectIsAdminUser);
  const {
    staff,
    total,
    isLoading,
    isRefreshing,
    isLoadingMore,
    loadError,
    hasMore,
    reload,
    loadMore,
  } = useStaffList(isAdmin);

  const handleBack = useStackGoBack(navigation, 'ProfileMain');

  const handleOpenStaff = useCallback(
    (staffUuid: string) => {
      navigation.navigate('StaffDetail', { staffUuid });
    },
    [navigation],
  );

  useEffect(() => {
    if (!isAdmin) {
      navigation.goBack();
    }
  }, [isAdmin, navigation]);

  const renderItem = useCallback<ListRenderItem<StaffListItem>>(
    ({ item }) => <StaffListCard staff={item} onPress={handleOpenStaff} />,
    [handleOpenStaff],
  );

  const keyExtractor = useCallback((item: StaffListItem) => item.uuid, []);

  const handleEndReached = useCallback(() => {
    if (hasMore) {
      loadMore();
    }
  }, [hasMore, loadMore]);

  if (!isAdmin) {
    return null;
  }

  return (
    <Box className="flex-1 bg-background-50">
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <VStack className="flex-1">
          <ProfileStackHeader
            title={staffCopy.screenTitle}
            onPressBack={handleBack}
          />

          <HStack className="items-center justify-between px-4 pb-3">
            <HStack className="items-center gap-2">
              <Users color={lightTokens.tertiary600} size={18} />
              <Text size="sm" className="font-medium text-typography-700">
                {staffCopy.totalLabel}
              </Text>
            </HStack>
            <Text size="sm" className="font-semibold text-tertiary-600">
              {total}
            </Text>
          </HStack>

          <ListLoadingGate
            loading={isLoading}
            refreshing={isRefreshing}
            itemCount={staff.length}
            options={{ canShowSkeleton: !loadError }}
            skeleton={
              <ListScreenSkeleton
                count={5}
                showSectionHeader={false}
                withLeading={false}
                style={styles.skeletonContent}
              />
            }>
            {loadError && staff.length === 0 ? (
              <Center className="flex-1 px-6">
                <Text size="sm" className="mb-4 text-center text-error-500">
                  {loadError}
                </Text>
                <Text
                  size="sm"
                  className="font-semibold text-tertiary-600"
                  onPress={reload}>
                  {staffCopy.retry}
                </Text>
              </Center>
            ) : (
              <FlatList
                data={staff}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={ListSeparator}
                refreshControl={
                  <RefreshControl refreshing={isRefreshing} onRefresh={reload} />
                }
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.35}
                ListEmptyComponent={
                  <Center className="py-12">
                    <Text size="sm" className="text-typography-500">
                      {staffCopy.empty}
                    </Text>
                  </Center>
                }
                ListFooterComponent={
                  isLoadingMore ? (
                    <Center className="py-4">
                      <ActivityIndicator
                        color={lightTokens.tertiary600}
                        size="small"
                      />
                    </Center>
                  ) : null
                }
              />
            )}
          </ListLoadingGate>
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: mainLayout.tabStackFooterPaddingBottom,
  },
  skeletonContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  separator: {
    height: 12,
  },
});
