import React from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { Button } from '@/components/ui/button';
import type { ComponentProps } from 'react';

const ReanimatedButton = Animated.createAnimatedComponent(Button);

type AnimatedButtonProps = ComponentProps<typeof Button> & {
  activeColor: string;
  inactiveColor: string;
};

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  activeColor,
  inactiveColor,
  onPress,
  children,
  style,
  ...rest
}) => {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      pressed.value,
      [0, 1],
      [inactiveColor, activeColor]
    );
    return { backgroundColor };
  });

  const handlePressIn = () => {
    pressed.value = withTiming(1, { duration: 120 });
  };

  const handlePressOut = () => {
    pressed.value = withTiming(0, { duration: 120 });
  };

  return (
    <ReanimatedButton
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={[animatedStyle, style]}
      {...rest}
    >
      {children}
    </ReanimatedButton>
  );
};

export default AnimatedButton;