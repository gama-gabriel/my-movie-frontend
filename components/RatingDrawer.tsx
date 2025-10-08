import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { Drawer, DrawerBackdrop, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader } from '@/components/ui/drawer';
import { StarRating } from '@/app/(home)/index';
import { useRatingDrawer } from '@/contexts/RatingDrawerContext';
import Animated, { FadeIn } from 'react-native-reanimated';

export function RatingDrawer() {
  const { isOpen, selectedMovie, closeDrawer, onRate } = useRatingDrawer();
  const [rating, setRating] = useState(0);

  const handleClose = () => {
    setRating(0);
    closeDrawer();
  };

  const handleRate = () => {
    if (rating > 0) {
      onRate(rating);
    }
    handleClose();
  };

  return (
    <Drawer
      isOpen={isOpen}
      anchor="bottom"
      onClose={handleClose}
    >
      <DrawerBackdrop />
      <DrawerContent className='h-auto flex flex-col gap-6'>
        <DrawerHeader className='flex flex-col p-0 gap-1 w-full justify-center items-center'>
          <Text className='text-white font-bold text-xl'>{selectedMovie?.title || ''}</Text>
          <Text className='text-neutral-100 text-lg'>Toque em uma estrela para avaliar</Text>
        </DrawerHeader>
        <DrawerBody >
          <View className='flex flex-col gap-4 w-full justify-center items-center'>
            <StarRating
              maxStars={5}
              size={48}
              rating={rating}
              onRatingChange={setRating}
            />
            {rating > 0 && (
              <Animated.View
                entering={FadeIn.duration(200).springify().withInitialValues({
                  transform: [{ translateY: 20 }],
                })}
                className="items-center"
              >
                <Text className='text-neutral-100 text-lg'>
                  Você avaliou com {rating} {rating === 1 ? 'estrela' : 'estrelas'}
                </Text>
              </Animated.View>
            )}
          </View>
        </DrawerBody>
        <DrawerFooter className='w-full flex gap-4 pb-8 pt-4'>
          <Button
            className='w-1/2 bg-transparent border border-neutral-700 data-[active=true]:bg-neutral-700'
            onPress={handleClose}
          >
            <ButtonText>Cancelar</ButtonText>
          </Button>
          <Button
            className='w-1/2'
            variant="pr"
            onPress={handleRate}
          >
            <ButtonText>Avaliar</ButtonText>
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}