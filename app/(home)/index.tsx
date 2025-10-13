import { Button, ButtonIcon, ButtonText } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'
import { Text, ActivityIndicator, RefreshControl, View, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { QueryFunctionContext, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import Animated, { FadeOut } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlashList, FlashListProps } from '@shopify/flash-list';
import { debounce } from 'lodash';
import { Badge, BadgeText } from '@/components/ui/badge'
import { Star } from 'lucide-react-native'
import { neutral700, primaryLight } from '../../constants/constants'
import { useAnimatedStarOpacity } from '@/hooks/AnimatedStarScale'
import { useRatingDrawer } from '@/contexts/RatingDrawerContext';
import { Skeleton } from 'moti/skeleton'
import EventBus from '@/utils/EventBus'


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
  hasRatings: boolean; // 🧩 ADDED
}

interface FetchImagesMeta {
  refresh?: boolean;
}

export function SkeletonFlashList() {
  const data = Array.from({ length: 4 }); // 4 placeholder skeletons

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
    <SafeAreaView edges={['bottom']} className="flex-1 bg-black">
      <FlashList
        data={data}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        estimatedItemSize={200}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={{
          paddingTop: 80,
          paddingBottom: 40,
        }}
      />
    </SafeAreaView>
  );
}

const HeaderList = () => (
  <View className='w-full flex flex-row items-center justify-start gap-4 bg-black px-4 pb-2'>
    <Heading className="m-0 text-xl font-bold text-white w-fit">
      Recomendado para você
    </Heading>
    <Badge size="md" variant="solid" action="muted" className='rounded-full px-4'>
      <BadgeText>Personalizado</BadgeText>
    </Badge>
  </View>
);

type ImagesQueryKey = readonly ['images'];
const imagesQueryKey = (): ImagesQueryKey => ['images'] as const;

// 🧩 New version that handles the 3-stage logic
const fetchImagesBase = async (
  page: number,
  refresh: boolean,
  signal?: AbortSignal,
  clerkId?: string,
  hasRatings?: boolean
): Promise<Pagina> => {
  try {
    console.log("refresh: ", refresh)
    console.log("hasRatings: ", hasRatings)

    // 🧩 Step 1: On first page, determine if the user has ratings
    if (page === 0) {

      const checkRes = await fetch(
        `https://mymovie-nhhq.onrender.com/media/check_ratings?user=${clerkId}`,
        { signal }
      );

      console.log("checkRes.status: ", await checkRes.status)
      if (checkRes.status === 404) {
        // user has no ratings → return select items
        const curatedRes = await fetch(
          `https://mymovie-nhhq.onrender.com/media/startup_medias`,
          { signal }
        );
        const curatedData: APIResponse = await curatedRes.json();
        return {
          media: curatedData.media,
          nextPage: 1,
          hasRatings: false,
        };
      }

      console.log(JSON.stringify({
        clerk_id: clerkId,
        page_number: 1,
        page_size: 10,
        refresh,
      }))
      const recRes = await fetch(
        `https://mymovie-nhhq.onrender.com/media/recommendations?refresh=${refresh}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal,
          body: JSON.stringify({
            clerk_id: clerkId,
            page_number: 1,
            page_size: 10,
            refresh,
          }),
        }
      );

      if (recRes.status === 404) {
        // also fallback if user has no reviews
        const curatedRes = await fetch(
          `https://mymovie-nhhq.onrender.com/media/startup_medias`,
          { signal }
        );
        const curatedData: APIResponse = await curatedRes.json();
        return {
          media: curatedData.media,
          nextPage: 1,
          hasRatings: false,
        };
      }

      const data: APIResponse = await recRes.json();
      return {
        media: data.media,
        nextPage: data.media.length > 0 ? 2 : undefined,
        hasRatings: true,
      };
    }

    // 🧩 Step 2: User has ratings → keep fetching personalized recs
    if (hasRatings) {

      console.log(JSON.stringify({
        clerk_id: clerkId,
        page_number: 1,
        page_size: 10,
        refresh,
      }))
      const res = await fetch(
        `https://mymovie-nhhq.onrender.com/media/recommendations`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal,
          body: JSON.stringify({
            clerk_id: clerkId,
            page_number: page,
            page_size: 10,
            refresh,
          }),
        }
      );

      const data: APIResponse = await res.json();
      return {
        media: data.media,
        nextPage: data.media.length > 0 ? page + 1 : undefined,
        hasRatings: true,
      };
    }

    // 🧩 Step 3: User still has no ratings → recheck before deciding what to fetch
    if (!hasRatings) {
      // 🔁 Recheck whether the user has now rated something
      const recheck = await fetch(
        `https://mymovie-nhhq.onrender.com/media/check_ratings?user=${clerkId}`,
        { signal }
      );

      if (recheck.status !== 404) {
        // 🎯 User now has ratings → switch to recommendations
        const recRes = await fetch(
          `https://mymovie-nhhq.onrender.com/media/recommendations`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal,
            body: JSON.stringify({
              clerk_id: clerkId,
              page_number: page,
              page_size: 10,
              refresh,
            }),
          }
        );
        const data: APIResponse = await recRes.json();
        return {
          media: data.media,
          nextPage: data.media.length > 0 ? page + 1 : undefined,
          hasRatings: true, // ✅ Mark as now rated
        };
      }
    }

    // 🧩 Still no ratings → continue with random media
    const res = await fetch(
      `https://mymovie-nhhq.onrender.com/media/media?page=${page}&page_size=10`,
      { signal }
    );
    const data: APIResponse = await res.json();

    return {
      media: data.media,
      nextPage: data.media.length > 0 ? page + 1 : undefined,
      hasRatings: false,
    };
  } catch (err) {
    console.error('Error in fetchImagesBase:', err);
    throw err;
    // return { media: [], nextPage: undefined, hasRatings: false };
  }
};

const fetchImages = async (
  ctx: QueryFunctionContext<any, number> & { meta?: FetchImagesMeta },
  clerkId?: string,
  hasRatings?: boolean
): Promise<Pagina> => {
  // force pageParam to be a number
  const pageParam = (ctx.pageParam ?? 0) as number;
  const { signal, meta } = ctx;

  return fetchImagesBase(pageParam, !!meta?.refresh, signal, clerkId, hasRatings);
};

type AnimatedFlashListType<T> = React.ComponentClass<FlashListProps<T>>;
export const AnimatedFlashList = Animated.createAnimatedComponent(
  FlashList as AnimatedFlashListType<any>
);

export function ImageGallery() {
  const { openDrawer } = useRatingDrawer();
  const queryClient = useQueryClient();
  const { user } = useUser(); // 🧩 get user id
  const clerkId = user?.id;
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const listRef = useRef<FlashList<Media> | null>(null);

  useEffect(() => {
    const scrollToTop = () => {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    };

    EventBus.on('scrollToTopHome', scrollToTop);

    return () => {
      EventBus.off('scrollToTopHome', scrollToTop);
    };
  }, []);

  const {
    data,
    status,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useInfiniteQuery<Pagina>({
    queryKey: imagesQueryKey(),
    initialPageParam: 0,
    // @ts-ignore
    queryFn: (ctx) => fetchImages(ctx, clerkId, (data as { pages?: Pagina[] })?.pages?.[0]?.hasRatings),
    getNextPageParam: (lastPage: Pagina) => lastPage.nextPage,
    enabled: !!clerkId,
  });

  const images = useMemo(
    () => data?.pages.flatMap((page) => page.media) || [],
    [data]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleEndReached = useCallback(
    debounce(() => {
      if (error) return;
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, 200),
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  if (status === 'pending' || isRefetching) {
    return (
      <SkeletonFlashList />
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

  const blurhash = 'B0JH:g-;fQ_3fQfQ';

  return (
    <Animated.View
      className='flex-1 w-full bg-black'
      exiting={FadeOut.duration(200)}>
      <FlashList
        contentContainerClassName="pt-20"
        ref={listRef}
        key={refreshKey}
        ListHeaderComponent={HeaderList}
        className='flex flex-col gap-2 w-full'
        data={images}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            progressBackgroundColor={neutral700}
            colors={['white']}
            refreshing={refreshing || isRefetching}
            onRefresh={async () => {
              setRefreshing(true);
              await queryClient.removeQueries({ queryKey: imagesQueryKey() });
              const result = await queryClient.fetchInfiniteQuery({
                queryKey: imagesQueryKey(),
                initialPageParam: 0,
                queryFn: (ctx) =>
                  fetchImages({ ...ctx, pageParam: 0, meta: { refresh: true } }, clerkId),
              });
              queryClient.setQueryData(imagesQueryKey(), result);
              queryClient.invalidateQueries({ queryKey: imagesQueryKey() });
              setRefreshKey((k) => k + 1);

              setTimeout(() => setRefreshing(false), 300);
            }}
            progressViewOffset={80}
          />
        }
        estimatedItemSize={800}
        drawDistance={1200}
        renderItem={({ item }) => (
          <View className='rounded-3xl border border-neutral-900 w-[95%] mx-auto flex mb-8'>
            <Image
              source={{ uri: `https://image.tmdb.org/t/p/w300/${item.backdrop_path}` }}
              style={{ width: "100%", height: 200, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
              cachePolicy="memory-disk"
              recyclingKey={item.id.toString()}
              contentFit="cover"
              placeholder={{ blurhash }}
              transition={{ duration: 1000, timing: 'ease-in' }}
            />
            <View className='p-4 gap-2 bg-white/5'>
              <Text className='text-white font-bold m-0'>{item.title}</Text>
              <View className='flex flex-row justify-between items-center gap-4'>
                <Text className='text-neutral-500'>{item.release_date.slice(0, 4)}</Text>
                <Badge size="lg" variant="solid" action="muted" className='rounded-full px-4 mt-1 w-fit'>
                  <BadgeText>{item.is_movie ? "Filme" : "Série"}</BadgeText>
                </Badge>
              </View>

              <View className='flex flex-row justify-end mt-2'>
                <Button
                  className='w-full bg-transparent border border-neutral-500 data-[active=true]:bg-neutral-700'
                  onPress={() => openDrawer(item)}
                >
                  <ButtonIcon as={Star} color="#dddddd" />
                  <ButtonText className='px-2'>Avaliar</ButtonText>
                </Button>
              </View>
            </View>
          </View>
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
    </Animated.View>
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
