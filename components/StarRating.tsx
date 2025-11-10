import { neutral700, primaryLight } from '@/constants/constants';
import { Star } from 'lucide-react-native';
import React from 'react'
import { Pressable, View } from 'react-native';

interface StarRatingProps {
  maxStars?: number;
  rating?: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  disabled?: boolean;
}

const StarRating = ({
  maxStars = 5,
  rating,
  onRatingChange,
  size = 24,
  disabled = false,
}: StarRatingProps) => {
  const handlePress = (index: number) => {
    if (disabled) return;
    const newRating = index + 1;
    onRatingChange?.(newRating);
  };

  const stars = Array.from({ length: maxStars }).map((_, i) => {
    const isFilled = i < (rating ?? 0);

    return (
      <Pressable key={i} onPress={() => handlePress(i)} disabled={disabled}>
        <View>
          <Star strokeWidth={1} size={size} color={neutral700} fill="none" />
          <View
            style={[
              { position: 'absolute', top: 0, left: 0, opacity: isFilled ? 1 : 0 },
            ]}
          >
            <Star strokeWidth={1} size={size} color={primaryLight} fill={primaryLight} />
          </View>
        </View>
      </Pressable>
    );
  });

  return <View className="flex-row space-x-1 gap-2">{stars}</View>;

}

export default StarRating