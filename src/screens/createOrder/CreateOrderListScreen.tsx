import React, { useCallback } from 'react';
import {
  Alert,
  FlatList,
  ListRenderItem,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { draftCopy } from '@/src/configs/createOrder';
import { useAppDispatch } from '@/src/hooks/common/useAppDispatch';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import { useResponsiveLayout } from '@/src/hooks/common/useResponsiveLayout';
import type { CreateOrderStackScreenProps } from '@/src/navigation/types';
import {
  createDraft,
  removeAllDrafts,
  removeDraft,
  selectDraftSummaries,
  setActiveDraftId,
} from '@/src/redux/createOrderDraft';
import type { DraftOrderSummary } from '@/src/types/createOrderDraft/createOrderDraft.types';
import { CreateOrderDraftCard } from '@/src/components/createOrder/CreateOrderDraftCard';
import { CreateOrderNewDraftFab } from '@/src/components/createOrder/CreateOrderNewDraftFab';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

type CreateOrderListScreenProps = CreateOrderStackScreenProps<'CreateOrderList'>;

export function CreateOrderListScreen({
  navigation,
}: CreateOrderListScreenProps) {
  const dispatch = useAppDispatch();
  const summaries = useAppSelector(selectDraftSummaries);
  const { horizontalPadding, contentMaxWidth, isTablet } = useResponsiveLayout();

  useFocusEffect(
    useCallback(() => {
      dispatch(setActiveDraftId(null));
    }, [dispatch]),
  );

  const handleCreateDraft = useCallback(() => {
    const action = dispatch(createDraft());
    const draftId = action.payload.id;
    dispatch(setActiveDraftId(draftId));
    navigation.navigate('CreateOrderEdit', { draftId });
  }, [dispatch, navigation]);

  const handleOpenDraft = useCallback(
    (draftId: string) => {
      dispatch(setActiveDraftId(draftId));
      navigation.navigate('CreateOrderEdit', { draftId });
    },
    [dispatch, navigation],
  );

  const handleRemoveDraft = useCallback(
    (draftId: string) => {
      Alert.alert(draftCopy.deleteDraft, draftCopy.deleteDraftConfirm, [
        {
          text: draftCopy.deleteDraftCancel,
          style: 'cancel',
        },
        {
          text: draftCopy.deleteDraftConfirmAction,
          style: 'destructive',
          onPress: () => {
            dispatch(removeDraft(draftId));
          },
        },
      ]);
    },
    [dispatch],
  );

  const handleRemoveAllDrafts = useCallback(() => {
    Alert.alert(draftCopy.deleteAllDrafts, draftCopy.deleteAllDraftsConfirm, [
      {
        text: draftCopy.deleteDraftCancel,
        style: 'cancel',
      },
      {
        text: draftCopy.deleteDraftConfirmAction,
        style: 'destructive',
        onPress: () => {
          dispatch(removeAllDrafts());
        },
      },
    ]);
  }, [dispatch]);

  const renderItem = useCallback<ListRenderItem<DraftOrderSummary>>(
    ({ item }) => (
      <CreateOrderDraftCard
        summary={item}
        onPress={handleOpenDraft}
        onRemove={handleRemoveDraft}
      />
    ),
    [handleOpenDraft, handleRemoveDraft],
  );

  const keyExtractor = useCallback((item: DraftOrderSummary) => item.id, []);

  return (
    <Box className="flex-1 bg-background-50">
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <VStack
          className="flex-1 pt-2"
          space="md"
          style={[
            styles.frame,
            {
              paddingHorizontal: horizontalPadding,
              maxWidth: isTablet ? contentMaxWidth.screen : undefined,
              alignSelf: isTablet ? 'center' : undefined,
            },
          ]}>
          <HStack className="w-full items-center justify-between">
            <Text size="lg" className="font-bold text-typography-900">
              {draftCopy.title}
            </Text>

            {summaries.length > 0 ? (
              <Pressable
                onPress={handleRemoveAllDrafts}
                accessibilityRole="button"
                accessibilityLabel={draftCopy.deleteAllDrafts}>
                <Text size="sm" className="font-semibold text-error-500">
                  {draftCopy.deleteAllDrafts}
                </Text>
              </Pressable>
            ) : null}
          </HStack>

          {summaries.length === 0 ? (
            <Center className="flex-1 px-4">
              <VStack className="items-center" space="sm">
                <Text size="md" className="text-center font-semibold text-typography-700">
                  {draftCopy.draftListEmpty}
                </Text>
                <Text size="sm" className="text-center text-typography-500">
                  {draftCopy.draftListEmptyHint}
                </Text>
              </VStack>
            </Center>
          ) : (
            <FlatList
              data={summaries}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              ItemSeparatorComponent={ListSeparator}
            />
          )}
        </VStack>
      </SafeAreaView>

      <CreateOrderNewDraftFab onPress={handleCreateDraft} />
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
  frame: {
    width: '100%',
    flex: 1,
  },
  listContent: {
    paddingBottom: 68,
  },
  separator: {
    height: 12,
  },
});
