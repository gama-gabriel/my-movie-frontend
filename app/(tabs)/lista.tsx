import { Icon } from '@/components/ui/icon';
import { SignedIn, SignedOut, useAuth } from '@clerk/clerk-expo';
import { useFocusEffect, useRouter } from 'expo-router';
import { BookmarkIcon, UserRound } from 'lucide-react-native';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { View, Text, Pressable, Animated, ActivityIndicator } from "react-native";
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Logo from '@/assets/logo.svg'
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import { Media, MediaSearch, ResponseMediaSearch } from '@/types/media.types';
import { protectedFetch } from '@/utils/Auth.utils';
import { danger, primaryLight } from '@/constants/constants';
import { Heading } from '@/components/ui/heading';
import { Badge, BadgeText } from '@/components/ui/badge';
import { useMediaBookmarkStore, useMediaRatingsStore, useMediaStore, useRatingStore } from '@/hooks/useMediaStore';
import { useRatingDrawer } from '@/contexts/RatingDrawerContext';
import { Image } from 'expo-image';
import { StarRating } from '@/components/RatingDrawer';
import { FlashList } from '@shopify/flash-list';
import { SkeletonFlashList } from '@/components/SkeletonFlashList';

interface Pagina {
  media: MediaSearch[];
  nextPage: number | undefined;
}

const HeaderList = () => (
  <View className='w-full flex flex-row items-center justify-start gap-4 px-4 pb-2'>
    <Heading className="m-0 text-xl font-bold text-white w-fit">
      Minha lista
    </Heading>
  </View>
);

const ImageItem = ({ item }: { item: MediaSearch }) => {

  const router = useRouter();
  const setMedia = useMediaStore((state) => state.setMedia);
  const setRatingStore = useRatingStore((state) => state.setRating);

  const { onRate } = useRatingDrawer();

  const setRating = useMediaRatingsStore((s) => s.setRating);

  const currentRating = useMediaRatingsStore(
    useCallback((s) => s.ratings.get(item.id) ?? 0, [item.id])
  );

  const handleIrParaDetalhes = (media: Media, rating: number) => {
    setMedia(media);
    setRatingStore(rating)

    router.push({
      pathname: "/(tabs)/detalhe",
      params: { from: "pesquisa" }
    });
  };
  const blurhash = 'B0JH:g-;fQ_3fQfQ';

  const uri = `https://image.tmdb.org/t/p/original/${item.backdrop_path}`;

  const handleRatingFromItem = useCallback((newRating: number) => {
    setRating(item.id, newRating);
    setTimeout(() => onRate(newRating, item), 0);
  }, [item, onRate, setRating]);

  useEffect(() => {
    if (item.user_rating !== null && item.user_rating > 0) {
      setRating(item.id, item.user_rating)
    }
  }, [item, item.user_rating, setRating])

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
          <RatingLeaf id={item.id} onRate={handleRatingFromItem}></RatingLeaf>
        </View>
      </View>
    </View>
  );
};

const RatingLeaf = memo(function RatingLeaf({
  id,
  onRate,
}: {
  id: string;
  onRate: (rating: number, item: Media) => void;
}) {
  const rating = useMediaRatingsStore((s) => s.ratings.get(id) ?? 0);

  const setRating = useMediaRatingsStore((s) => s.setRating);

  const handleRatingChange = useCallback(
    (newRating: number) => {
      setRating(id, newRating);
      setTimeout(() => {
        onRate?.(newRating, { id } as any);
      }, 0);
    },
    [id, onRate, setRating]
  );

  return (
    <>
      <Text className="text-white text-lg">Toque em uma estrela para avaliar</Text>
      <StarRating
        maxStars={5}
        size={48}
        rating={rating}
        disabled={!!rating}
        onRatingChange={handleRatingChange}
      />
    </>
  );
});

export default function Lista() {

  const { getToken, userId } = useAuth()

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

  const router = useRouter();

  const fetchBookmarks = async ({ pageParam = 0 }: { pageParam: number }): Promise<Pagina> => {
    const params = `clerk_id=${userId!}&page_number=${pageParam}&page_size=10`
    
    console.log(params)
    const response = await protectedFetch('https://mymovie-nhhq.onrender.com/media/watch-later?' + params, getToken, {
      headers: { 'Content-Type': 'application/json' },
      method: 'GET',
    });

    const jsonResponse: ResponseMediaSearch = await response.json();

    if (!response.ok) throw new Error(JSON.stringify(jsonResponse));
    return {
      media: jsonResponse.media,
      nextPage: pageParam + 1
    }
  };

  const versaoAtual = useMediaBookmarkStore((s) => s.getVersion() ?? 0);

  console.log({versaoAtual})

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    fetchStatus,
    isPending,
    status,
    error
  } = useInfiniteQuery<Pagina, Error, Pagina, [string, number], number>({
    queryKey: ['bookmarks', versaoAtual],
    queryFn: ({ pageParam }) => fetchBookmarks({ pageParam }),
    getNextPageParam: (lastPage: Pagina) => lastPage.nextPage,
    initialPageParam: 1,
  });

  const medias = useMemo(
    () => {
      const infiniteData = data as InfiniteData<Pagina> | undefined;
      return infiniteData?.pages.flatMap((page) => page.media) || [];
    }, [data]
  );

  console.log({error})

  return (
    <>
      <SignedIn>
        <View
          className="absolute w-full left-0 z-10 h-20 bg-black/70 border-b border-neutral-900"
        >
          <View className="flex-row items-center justify-between p-6 h-20">

            <Logo height={'100%'} preserveAspectRatio="xMinYMin meet" style={{ flex: 1 }}></Logo>
            <Pressable
              onPress={() => router.push('/(tabs)/perfil')}
              className="p-3 rounded-full bg-neutral-900"
            >
              <Icon as={UserRound} />
            </Pressable>
          </View>
        </View>
        <Animated.View className='flex-1' style={animatedStyle} >
          {
            isLoading &&
            <SkeletonFlashList />
          }

          {
            isPending && fetchStatus === 'idle' &&
            <View className='flex-1 bg-black flex items-center justify-center '>
              <View className='flex flex-col w-3/4 items-center justify-center gap-6'>
                <View className='bg-primary-light/25 p-8 rounded-full'>
                  <Icon as={BookmarkIcon} color={primaryLight} size={64} className='text-primary-light'></Icon>
                </View>
                <View className='items-center justify-center flex flex-col gap-2'>
                  <Text className='text-white font-bold text-center text-3xl'>Comece sua busca</Text>
                  <Text className='text-neutral-100 text-center'>Digite o nome de um filme, série, ator ou gênero, ou escolha os filtros desejados </Text>

                </View>
              </View>
            </View>
          }

          {
            status === 'success' &&
            <View className='flex-1 bg-black'>
              <FlashList
                data={medias}
                className='flex flex-col gap-2 w-full'
                keyExtractor={(item) => item.id}
                estimatedItemSize={800}
                drawDistance={1200}
                onEndReachedThreshold={2}
                ListHeaderComponent={HeaderList}
                ListEmptyComponent={() => (
                  <View className='flex-1 bg-black flex items-center justify-center pt-10'>
                    <View className='flex flex-col w-3/4 items-center justify-center gap-6'>
                      <View className='bg-danger/25 p-8 rounded-full'>
                        <Icon as={BookmarkIcon} color={danger} size={64} className='text-danger'></Icon>
                      </View>
                      <View className='items-center justify-center flex flex-col gap-2'>
                        <Text className='text-white font-bold text-center text-3xl'>Nenhum resultado encontrado</Text>
                        <Text className='text-neutral-100 text-center'>Não encontramos resultados correspondentes a sua busca. Tente ajustar os filtros ou use termos diferentes.</Text>

                      </View>
                    </View>
                  </View>
                )}
                renderItem={({ item }) => <ImageItem item={item} />}
                onEndReached={() => {
                  console.log("on end reached", {hasNextPage}, {isFetchingNextPage})
                  if (hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                  }
                }}
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
          }
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