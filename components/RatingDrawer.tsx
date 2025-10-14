import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { Drawer, DrawerBackdrop, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader } from '@/components/ui/drawer';
import { useRatingDrawer } from '@/contexts/RatingDrawerContext';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useAnimatedStarOpacity } from '@/hooks/AnimatedStarScale';
import { Star } from 'lucide-react-native';
import { neutral700, primaryLight } from '@/constants/constants';

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

interface StarRatingProps {
  maxStars?: number;
  rating?: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  disabled?: boolean;
}

export const StarRating = ({
  maxStars = 5,
  rating: initialRating = 1,
  onRatingChange,
  size = 24,
  disabled = false,
}: StarRatingProps) => {
  const [rating, setRating] = useState(initialRating);

  const handlePress = (index: number) => {
    if (disabled) return;
    const newRating = index + 1;
    setRating(newRating);
    onRatingChange?.(newRating);
  };
  const stars = Array.from({ length: maxStars }).map((_, i) => {
    const isFilled = i < rating;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const animatedStyle = useAnimatedStarOpacity(isFilled);

    return (
      <Pressable
        key={i}
        onPress={() => handlePress(i)}
        disabled={disabled}
        className={disabled ? 'opacity-50' : ''}
      >
        <View>
          <Star
            strokeWidth={1}
            size={size}
            color={neutral700}
            fill="none"
          />

          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                left: 0,
              },
              animatedStyle,
            ]}
          >
            <Star
              strokeWidth={1}
              size={size}
              color={primaryLight}
              fill={primaryLight}
            />
          </Animated.View>
        </View>
      </Pressable>
    );
  });

  return <View className="flex-row space-x-1 gap-2">{stars}</View>;
};