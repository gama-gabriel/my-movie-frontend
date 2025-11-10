import { FlashList } from '@shopify/flash-list';
import { Skeleton } from 'moti/skeleton';
import React from 'react'
import { View } from 'react-native';

export function SkeletonFlashList() {
  const data = Array.from({ length: 4 });

  const renderItem = () => (
    <View className="w-[95%] self-center my-2">
      <Skeleton
        colorMode="dark"
        width={'100%'}
        height={200}
        radius={24}
      />
    </View>
  );


  return (
    <View className="flex-1 pt-4 bg-black">
      <FlashList
        data={data}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        estimatedItemSize={200}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      />
    </View>
  );
}
