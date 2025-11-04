// useAnimatedStarOpacity.ts
import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

export const useAnimatedStarOpacity = (isFilled: boolean) => {
  const opacity = useSharedValue(isFilled ? 1 : 0);

  useEffect(() => {
    // Trigger animation only when opacity value should change
    if (opacity.value !== (isFilled ? 1 : 0)) {
      opacity.value = withTiming(isFilled ? 1 : 0, {
        duration: 300,
      });
    }
  }, [isFilled]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return animatedStyle;
};