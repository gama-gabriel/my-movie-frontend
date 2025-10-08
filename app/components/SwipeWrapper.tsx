import React, { ReactNode } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.2; // 20% of screen width

interface SwipeNavigatorProps {
  children: ReactNode;
  currentIndex: number;
  totalScreens: number;
  onSwipe: (direction: 'left' | 'right') => void;
}

export const SwipeNavigator = ({ 
  children, 
  currentIndex, 
  totalScreens,
  onSwipe 
}: SwipeNavigatorProps) => {
  const translateX = useSharedValue(0);

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      // Prevent swiping right on first screen or left on last screen
      if (
        (currentIndex === 0 && event.translationX > 0) ||
        (currentIndex === totalScreens - 1 && event.translationX < 0)
      ) {
        translateX.value = event.translationX * 0.2; // Add resistance
      } else {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      const direction = event.translationX > 0 ? 'right' : 'left';
      const velocity = Math.abs(event.velocityX);
      const isQuickSwipe = velocity > 800;

      if (Math.abs(event.translationX) > SWIPE_THRESHOLD || isQuickSwipe) {
        const canSwipe = direction === 'left' 
          ? currentIndex < totalScreens - 1 
          : currentIndex > 0;

        if (canSwipe) {
          translateX.value = withTiming(
            direction === 'left' ? -SCREEN_WIDTH : SCREEN_WIDTH,
            { duration: isQuickSwipe ? 150 : 300 },
            (finished) => {
              if (finished) {
                runOnJS(onSwipe)(direction);
                translateX.value = 0;
              }
            }
          );
        } else {
          translateX.value = withTiming(0, { duration: 150 });
        }
      } else {
        translateX.value = withTiming(0, { duration: 150 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container}>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.animatedView, animatedStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    overflow: 'hidden',
  },
  animatedView: {
    flex: 1,
    width: SCREEN_WIDTH,
  },
});
