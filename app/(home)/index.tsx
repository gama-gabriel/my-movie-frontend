import { Button, ButtonIcon, ButtonText } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { SignedIn, SignedOut } from '@clerk/clerk-expo'
import { Text, ActivityIndicator, RefreshControl, View, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useInfiniteQuery } from '@tanstack/react-query';
import Animated from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useCallback, useMemo, useState } from 'react';
import { FlashList } from '@shopify/flash-list';
import { debounce } from 'lodash';
import { Badge, BadgeText } from '@/components/ui/badge'
import { Star } from 'lucide-react-native'
import { neutral700, primaryLight } from '../../constants/constants'
import { useAnimatedStarOpacity } from '@/hooks/AnimatedStarScale'
import { useRatingDrawer } from '@/contexts/RatingDrawerContext';

interface Media {
  id: number;
  title: string;
  description: string;
  release_date: string;
  poster_path: string;
  backdrop_path: string;
  is_movie: boolean;
}

interface APIResponse {
  media: Media[];
}

interface Pagina {
  media: Media[];
  nextPage: number | undefined;
}

const HeaderList = () => (
  <>
    <View className='w-full flex flex-row items-center justify-start gap-4 bg-black px-4 pb-2'>
      <Heading className="m-0 text-xl font-bold text-white w-fit">
        Recomendado para você
      </Heading>
      <Badge size="md" variant="solid" action="muted" className='rounded-full px-4'>
        <BadgeText>Personalizado</BadgeText>
      </Badge>

    </View>
  </>
)

const fetchImages = async ({ pageParam = 0 }): Promise<Pagina> => {
  const response = await fetch(`https://mymovie-nhhq.onrender.com/media/media?page=${pageParam}&page_size=10`);
  const data: APIResponse = await response.json();

  // Preload images for smoother experience
  if (data.media && data.media.length > 0) {
    const backdropUrls = data.media.map((item: Media) => item.backdrop_path);
    Image.prefetch([...backdropUrls]);
  }

  return {
    media: data.media,
    nextPage: data.media.length > 0 ? pageParam + 1 : undefined
  }
}


export function ImageGallery() {
  const { openDrawer } = useRatingDrawer();

  const {
    data,
    status,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['images'],
    initialPageParam: 0,
    queryFn: fetchImages,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const images = useMemo(
    () => data?.pages.flatMap((page) => page.media) || [],
    [data]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleEndReached = useCallback(
    debounce(() => {
      console.log("end reached")
      if (error) return;
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, 200),
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  if (status === 'pending') {
    return (
      <SafeAreaView edges={["bottom"]} className='flex-1 w-full bg-black'>
        <View className='flex-1 items-center justify-center'>
          <ActivityIndicator size="large" color="blue" className='text-primary-light' />
        </View>
      </SafeAreaView>
    );
  }

  if (status === 'error') {
    console.error('Error fetching images:', error);
    return (
      <SafeAreaView edges={["bottom"]} className='flex-1 w-full bg-black'>
        <View className='flex-1 items-center justify-center'>
          <Text className='text-white'>Erro ao carregar as imagens.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const blurhash = 'B0JH:g-;fQ_3fQfQ'


  return (
    <>
      <FlashList
        contentContainerClassName="pt-20"
        onLayout={(event) => {
          const { width, height, x, y } = event.nativeEvent.layout;
          console.log('Size:', { width, height, x, y });
        }}
        ListHeaderComponent={HeaderList}
        className='flex flex-col gap-2 w-full'
        data={images}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            progressBackgroundColor={'#343037'}
            colors={['white']}
            refreshing={isRefetching}
            onRefresh={refetch}
            progressViewOffset={80}
          />
        }
        estimatedItemSize={800}
        drawDistance={1200}
        renderItem={({ item }) => (
          <>
            <View className='rounded-3xl border border-neutral-900 w-[95%] mx-auto flex mb-8'>
              <Image
                source={{ uri: `https://image.tmdb.org/t/p/w300/${item.backdrop_path}` }}
                style={{ width: "100%", height: 200, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
                cachePolicy="memory-disk"
                recyclingKey={item.id.toString()} // Fix image flickering
                contentFit="cover" // Ensure smooth rendering
                placeholder={{ blurhash }} // Add placeholder
                transition={500}

              />
              <View className='p-4 gap-2 bg-white/5'>
                <Text className='text-white font-bold m-0'>{item.title}</Text>
                <View className='flex flex-row justify-between items-center gap-4'>
                  <Text className='text-neutral-500'>{item.release_date.slice(0, 4)}</Text>
                  {item.is_movie ? (
                    <Badge size="lg" variant="solid" action="muted" className='rounded-full px-4 mt-1 w-fit'>
                      <BadgeText>Filme</BadgeText>
                    </Badge>
                  ) : (
                    <Badge size="lg" variant="solid" action="muted" className='rounded-full px-4 mt-1 w-fit'>
                      <BadgeText>Série</BadgeText>
                    </Badge>
                  )}
                </View>

                <View className='flex flex-row justify-end mt-2'>
                  <Button
                    className='w-full bg-transparent border border-neutral-500 data-[active=true]:bg-neutral-700'
                    onPress={() => openDrawer(item)}
                  >
                    <ButtonIcon as={Star} color="#dddddd" ></ButtonIcon>
                    <ButtonText className='px-2'>Avaliar</ButtonText>
                  </Button>
                </View>

              </View>
            </View>
          </>
        )}
        onEndReachedThreshold={1.5}
        onEndReached={handleEndReached}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator
              size="small"
              className='text-primary-light'
              style={{ marginBottom: 20 }}
            />
          ) : null
        }
      />

    </>
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

export default function Page() {
  return (
    <>
      <SignedIn>
        <ImageGallery />
      </SignedIn>

      <SignedOut>
        <View className='flex-1 items-center justify-start gap-4 py-4 w-full h-full'>
          <View className='animate-pulse h-16 w-full bg-neutral-900' />
        </View>
      </SignedOut>
    </>
  )
}
