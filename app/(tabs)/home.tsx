import { Heading } from '@/components/ui/heading'
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'
import { Text, ActivityIndicator, RefreshControl, View, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { QueryFunctionContext, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';
import { FlashList, FlashListProps } from '@shopify/flash-list';
import { debounce } from 'lodash';
import { Badge, BadgeText } from '@/components/ui/badge'
import { danger, neutral700, neutral900, primaryLight } from '../../constants/constants'
import EventBus from '@/utils/EventBus'
import { useFocusEffect, useRouter } from 'expo-router'
import { Media, ResponseMedia } from '@/types/media.types'
import { useBookmarkFor, useMediaBookmarkStore, useMediaRatingsStore, useMediaStore, useRatingFor, useRatingStore } from '@/hooks/useMediaStore'
import StarRating from '@/components/StarRating'
import { BookmarkIcon, EraserIcon, FrownIcon } from 'lucide-react-native';
import { AnimatedButton } from '../components/AnimatedButton';
import { ButtonIcon, ButtonText } from '@/components/ui/button';
import { useRating } from '@/hooks/useRating';
import { useBookmark } from '@/hooks/useBookmark';
import { SkeletonFlashList } from '@/components/SkeletonFlashList';
import Header from '@/components/Header';

interface Pagina {
  media: Media[];
  nextPage: number | undefined;
  hasRatings: boolean;
}

interface FetchImagesMeta {
  refresh?: boolean;
}

const HeaderList = () => (
  <View className='w-full flex flex-row items-center justify-start gap-4 px-4 pb-2'>
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
    console.log({ page })

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
          `https://mymovie-nhhq.onrender.com/media/startup_medias?clerk_id=${clerkId}`,
          { signal }
        );
        const curatedData: ResponseMedia = await curatedRes.json();
        return {
          media: curatedData.media,
          nextPage: 1,
          hasRatings: false,
        };
      }

      const recRes = await fetch(
        `https://mymovie-nhhq.onrender.com/media/recommendations`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal,
          body: JSON.stringify({
            clerk_id: clerkId,
            cursor: page * 10,
            limit: 10,
            refresh: true,
          }),
        }
      );

      console.log(JSON.stringify({
        clerk_id: clerkId,
        cursor: page * 10,
        limit: 10,
        refresh: true,
      }),)

      if (recRes.status === 404) {
        // also fallback if user has no reviews
        const curatedRes = await fetch(
          `https://mymovie-nhhq.onrender.com/media/startup_medias?clerk_id=${clerkId}`,
          { signal }
        );
        const curatedData: ResponseMedia = await curatedRes.json();
        return {
          media: curatedData.media,
          nextPage: 1,
          hasRatings: false,
        };
      }

      const data: ResponseMedia = await recRes.json();
      return {
        media: data.media,
        nextPage: data.media.length > 0 ? 1 : undefined,
        hasRatings: true,
      };
    }

    // 🧩 Step 2: User has ratings → keep fetching personalized recs
    if (hasRatings) {

      const res = await fetch(
        `https://mymovie-nhhq.onrender.com/media/recommendations`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal,
          body: JSON.stringify({
            clerk_id: clerkId,
            cursor: page * 10,
            limit: 10,
            refresh,
          }),
        }
      );

      console.log(JSON.stringify({
        clerk_id: clerkId,
        cursor: page * 10,
        limit: 10,
        refresh,
      }),)

      const data: ResponseMedia = await res.json();
      return {
        media: data.media,
        nextPage: data.media.length > 0 ? page + 1 : undefined,
        hasRatings: true,
      };
    }

    // 🧩 Step 3: User still has no ratings → recheck before deciding what to fetch
    if (!hasRatings && page === 1) {
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
              cursor: 0,
              limit: 10,
              refresh,
              from_startup: true
            }),
          }
        );

        console.log(JSON.stringify({
          clerk_id: clerkId,
          cursor: 0,
          limit: 10,
          refresh,
          from_startup: true
        }))
        const data: ResponseMedia = await recRes.json();
        return {
          media: data.media,
          nextPage: data.media.length > 0 ? 1 : undefined,
          hasRatings: true,
        };
      }
    }

    // 🧩 Still no ratings → continue with random media
    const res = await fetch(
      `https://mymovie-nhhq.onrender.com/media/media?page=${page}&page_size=10&clerk_id=${clerkId}`,
      { signal }
    );
    const data: ResponseMedia = await res.json();

    return {
      media: data.media,
      nextPage: data.media.length > 0 ? page + 1 : undefined,
      hasRatings: false,
    };
  } catch (err) {
    console.error('Error in fetchImagesBase:', err);
    throw err;
  }
};

const fetchImages = async (
  ctx: QueryFunctionContext<any, number> & { meta?: FetchImagesMeta },
  clerkId?: string,
  hasRatings?: boolean
): Promise<Pagina> => {
  const pageParam = (ctx.pageParam ?? 0) as number;
  const { signal, meta } = ctx;

  return fetchImagesBase(pageParam, !!meta?.refresh, signal, clerkId, hasRatings);
};

type AnimatedFlashListType<T> = React.ComponentClass<FlashListProps<T>>;
export const AnimatedFlashList = Animated.createAnimatedComponent(
  FlashList as AnimatedFlashListType<any>
);

const RatingLeaf = memo(function RatingLeaf({
  id,
  onRate,
  onDeleteRating,
  onBookmark
}: {
  id: string;
  onRate: (rating: number, media_id: string) => void;
  onDeleteRating: (media_id: string) => void;
  onBookmark: (adicionar: boolean, media_id: string) => void;
}) {

  // const rating = useMediaRatingsStore(
  //   useCallback((s) => s.ratings.get(id) ?? 0, [id])
  // );

  // const bookmark = useMediaBookmarkStore(
  //   useCallback((s) => s.bookmarks.get(id) ?? false, [id])
  // );

  const rating = useRatingFor(id); // returns number | 0 default
  const bookmark = useBookmarkFor(id); // returns boolean | false default

  const setRating = useMediaRatingsStore((s) => s.setRating);
  const clearRating = useMediaRatingsStore((s) => s.clearRating);
  const setBookmark = useMediaBookmarkStore((s) => s.setBookmark);

  const [visto, setVisto] = useState<boolean | null>(null);

  const handleRatingChange = useCallback(
    (newRating: number) => {
      setRating(id, newRating);
      onRate(newRating, id);
      setVisto(false)
    },
    [id, onRate, setRating]
  );

  const handleDeleteRating = useCallback(
    (mediaId: string) => {
      clearRating(mediaId);
      onDeleteRating(mediaId);
    },
    [clearRating, onDeleteRating]
  );

  const handleBookmarkChange = useCallback(
    (newBookmark: boolean) => {
      setBookmark(id, newBookmark);
      onBookmark(newBookmark, id)
    },
    [id, onBookmark, setBookmark]
  );

  return (
    <>
      {!visto &&
        rating === undefined &&
        <Animated.View
          entering={FadeIn.duration(200).springify()}
          exiting={FadeOut.duration(200).springify()}
          className='flex flex-col gap-4 w-full justify-center items-center'
        >
          <View className='w-full flex flex-row gap-2 justify-center'>
            <View className='flex flex-row gap-2 flex-grow justify-center'>
              <AnimatedButton
                activeColor={neutral900}
                inactiveColor='transparent'
                variant='solid'
                size='xl'
                onPress={() => setVisto(true)}
                className='flex-grow border border-primary-light'
              >
                <ButtonText className='text-white'>Já assisti</ButtonText>
              </AnimatedButton>
            </View>

            <AnimatedButton
              inactiveColor='transparent'
              activeColor={neutral900}
              variant='solid'
              size='xl'
              onPress={() => handleBookmarkChange(!bookmark)}
              className='self-center px-4'
            >
              <ButtonIcon
                as={BookmarkIcon}
                size={24}
                fill={bookmark ? primaryLight : ''}
                className='text-primary-light'
              />
            </AnimatedButton>
          </View>

          <View className='flex flex-row w-full justify-center'>
            <AnimatedButton
              inactiveColor='transparent'
              activeColor={neutral900}
              variant='solid'
              size='md'
              onPress={() => handleRatingChange(0)}
            >
              <ButtonIcon as={FrownIcon} className='text-danger/70' />
              <ButtonText className='text-white pl-2'>Não tenho interesse</ButtonText>
            </AnimatedButton>
          </View>
        </Animated.View>
      }

      {visto &&
        <Animated.View
          entering={FadeIn.duration(200).springify()}
          exiting={FadeOut.duration(200).springify()}
          className='justify-center flex flex-col items-center'
        >
          <Text className="text-white text-lg pb-2">Toque em uma estrela para avaliar</Text>
          <StarRating
            maxStars={5}
            size={48}
            rating={rating}
            onRatingChange={handleRatingChange}
          />

          {rating === undefined &&
            <Animated.View
              entering={FadeIn.duration(200).springify()}
              exiting={FadeOut.duration(200).springify()}
              className='flex flex-row w-full gap-2 pt-8'
            >
              <View className='flex-1'>
                <AnimatedButton
                  inactiveColor='transparent'
                  activeColor={neutral900}
                  variant='solid'
                  size='md'
                  onPress={() => setVisto(false)}
                  className='border border-neutral-700'
                >
                  <ButtonText className='text-white'>Voltar</ButtonText>
                </AnimatedButton>
              </View>

              <View className='flex-1'>
                <AnimatedButton
                  inactiveColor='transparent'
                  activeColor={neutral900}
                  variant='solid'
                  size='md'
                  onPress={() => handleBookmarkChange(!bookmark)}
                  className='border border-neutral-700'
                >
                  <ButtonIcon as={BookmarkIcon} fill={bookmark ? primaryLight : ''} className='text-primary-light' />
                  <ButtonText className='text-white pl-2'>{bookmark ? 'Salvo' : 'Salvar'}</ButtonText>
                </AnimatedButton>
              </View>
            </Animated.View>
          }

        </Animated.View>
      }

      {rating! > 0 &&
        <Animated.View
          entering={FadeIn.duration(200).springify()}
          exiting={FadeOut.duration(200).springify()}
          className='justify-center flex flex-col items-center'
        >
          <Text className="text-white text-lg pb-2">Toque em uma estrela para avaliar</Text>
          <StarRating
            maxStars={5}
            size={48}
            rating={rating}
            onRatingChange={handleRatingChange}
          />

          <Animated.View
            entering={FadeIn.duration(200).springify()}
            exiting={FadeOut.duration(200).springify()}
            className='flex flex-row w-full gap-4 pt-8'
          >
            <AnimatedButton
              inactiveColor={`${danger}40`}
              activeColor={`${danger}70`}
              variant='solid'
              size='md'
              onPress={() => handleDeleteRating(id)}
              className='border border-danger/70 flex-1'
            >
              <ButtonIcon as={EraserIcon} className='text-neutral-500' />
              <ButtonText className='text-white pl-2'>Remover avaliação</ButtonText>
            </AnimatedButton>

            <AnimatedButton
              inactiveColor='transparent'
              activeColor={neutral900}
              variant='solid'
              size='md'
              onPress={() => handleBookmarkChange(!bookmark)}
              className='border border-neutral-700'
            >
              <ButtonIcon as={BookmarkIcon} fill={bookmark ? primaryLight : ''} className='text-primary-light' />
            </AnimatedButton>
          </Animated.View>


        </Animated.View>

      }

      {rating === 0 &&
        <Animated.View
          entering={FadeIn.duration(200).springify()}
          exiting={FadeOut.duration(200).springify()}
          className='flex flex-col w-full gap-4'
        >
          <Text className="text-white text-center">Esse item não será recomendado novamente</Text>
          <AnimatedButton
            inactiveColor='transparent'
            activeColor={neutral900}
            variant='solid'
            size='md'
            onPress={() => handleDeleteRating(id)}
            className='flex-1 border border-neutral-700'
          >
            <ButtonText className='text-white pl-2'>Desfazer</ButtonText>
          </AnimatedButton>
        </Animated.View>
      }

    </>
  );
});

export function ListaMedias() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const clerkId = user?.id;

  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const setBookmark = useMediaBookmarkStore((s) => s.setBookmark);
  const setRating = useMediaRatingsStore((s) => s.setRating);

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

  useEffect(() => {
    if (images.length > 0) {
      images.forEach((item) => {
        if (item.bookmarked) {
          setBookmark(item.id, true);
        }
      });
    }
  }, [images, setBookmark, setRating]);

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
      <View className='flex-1 pt-20'>
        <SkeletonFlashList />
      </View>
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

  return (
    <View
      className='flex-1 w-full bg-black'
    >
      <FlashList
        contentContainerClassName="pt-20"
        ref={listRef}
        key={refreshKey}
        ListHeaderComponent={HeaderList}
        className='flex flex-col gap-2 w-full'
        data={images}

        keyExtractor={(item) => item.id}
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
        estimatedItemSize={400}
        drawDistance={800}
        removeClippedSubviews={true}
        renderItem={({ item }) => <ImageItem item={item} />}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
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
    </View>
  );
}

const ImageItem = memo(({ item }: { item: Media }) => {
  const router = useRouter();
  const setMedia = useMediaStore((state) => state.setMedia);
  const setRatingStore = useRatingStore((state) => state.setRating);

  const { onRate, onDeleteRating } = useRating();
  const { onBookmark } = useBookmark();

  const currentRating = useRatingFor(item.id); // returns number | 0 default

  const setRating = useMediaRatingsStore((s) => s.setRating);

  const handleIrParaDetalhes = (media: Media, rating: number) => {
    setMedia(media);
    setRatingStore(rating);
    router.push({
      pathname: "/(tabs)/detalhe",
      params: { from: 'home' }
    });
  };

  const blurhash = 'B0JH:g-;fQ_3fQfQ';
  const uri = `https://image.tmdb.org/t/p/original/${item.backdrop_path}`;

  const handleRatingFromItem = useCallback((newRating: number) => {
    setRating(item.id, newRating);
    setTimeout(() => onRate(newRating, item.id), 0);
  }, [item.id, onRate, setRating]);

  const handleBookmarkFromItem = useCallback((adicionar: boolean) => {
    setTimeout(() => onBookmark(adicionar, item.id), 0);
  }, [item.id, onBookmark]);

  return (
    <View className='rounded-3xl border border-neutral-900 w-[95%] mx-auto flex mb-8' >
      <Pressable onPress={() => handleIrParaDetalhes(item, currentRating ?? 0)}
      >
        <Image
          source={{ uri }}
          style={{ width: "100%", aspectRatio: 3 / 2, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
          cachePolicy="memory-disk"
          recyclingKey={item.id}
          contentFit="cover"
          placeholder={{ thumbhash: blurhash }}
          transition={{ duration: 1000, timing: 'ease-in' }}
        />
      </Pressable>

      <View className='p-4 gap-2 bg-white/5'>
        <Pressable onPress={() => handleIrParaDetalhes(item, currentRating ?? 0)}>
          <Text className='text-white font-bold m-0'>{item.title}</Text>
          {item.title !== item.original_title &&
            <Text className='text-neutral-100 italic m-0'>{item.original_title}</Text>
          }
        </Pressable>

        <Pressable
          className='flex flex-row justify-between items-center gap-4'
          onPress={() => handleIrParaDetalhes(item, currentRating ?? 0)}
        >
          <Text className='text-neutral-500'>{item.release_date.slice(0, 4)}</Text>

          <Badge size="lg" variant="solid" action="muted" className='rounded-full px-4 mt-1 w-fit'>
            <BadgeText>{item.is_movie ? "Filme" : "Série"}</BadgeText>
          </Badge>
        </Pressable>

        <View className='flex flex-col gap-2 w-full justify-center items-center pt-4'>
          <RatingLeaf id={item.id} onRate={handleRatingFromItem} onBookmark={handleBookmarkFromItem} onDeleteRating={onDeleteRating}></RatingLeaf>
        </View>
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent re-renders
  return prevProps.item.id === nextProps.item.id;
});
ImageItem.displayName = "ImageItem";

export default function Page() {

  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-20);
  useFocusEffect(
    useCallback(() => {
      opacity.value = withTiming(1, { duration: 300 })
      translateX.value = withTiming(0, { duration: 600 })
      return () => {
        opacity.value = 0
        translateX.value = -20
      }
    }, [opacity, translateX])
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <>
      <SignedIn>
        <Header paginaAtual='home' />

        <Animated.View className='flex-1' style={animatedStyle} >
          <ListaMedias />
        </Animated.View>
      </SignedIn>

      <SignedOut>
        <View className='flex-1 items-center justify-start gap-4 py-4 w-full h-full'>
          <View className='animate-pulse h-16 w-full bg-neutral-900' />
        </View>
      </SignedOut>
    </>
  )
}
