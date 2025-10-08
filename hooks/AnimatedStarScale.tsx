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
    opacity.value = withTiming(isFilled ? 1 : 0, {
      duration: 300,
    });
  }, [isFilled, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return animatedStyle;
};
