import { Icon } from '@/components/ui/icon';
import { SignedIn, SignedOut, useAuth } from '@clerk/clerk-expo';
import { useFocusEffect, useRouter } from 'expo-router';
import { BookmarkIcon, EraserIcon, FrownIcon } from 'lucide-react-native';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import { Media, MediaSearch, ResponseMediaSearch } from '@/types/media.types';
import { protectedFetch } from '@/utils/Auth.utils';
import { danger, neutral900, primaryLight } from '@/constants/constants';
import { Heading } from '@/components/ui/heading';
import { Badge, BadgeText } from '@/components/ui/badge';
import { useBookmarkFor, useMediaBookmarkStore, useMediaRatingsStore, useMediaStore, useRatingFor, useRatingStore } from '@/hooks/useMediaStore';
import { Image } from 'expo-image';
import { StarRating } from '@/components/RatingDrawer';
import { FlashList } from '@shopify/flash-list';
import { SkeletonFlashList } from '@/components/SkeletonFlashList';
import { AnimatedButton } from '../components/AnimatedButton';
import { ButtonIcon, ButtonText } from '@/components/ui/button';
import { useRating } from '@/hooks/useRating';
import { useBookmark } from '@/hooks/useBookmark';
import Header from '@/components/Header';

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

  const { onRate, onDeleteRating } = useRating();
  const { onBookmark } = useBookmark();

  const currentRating = useRatingFor(item.id);

  const setRating = useMediaRatingsStore((s) => s.setRating);

  const handleIrParaDetalhes = (media: Media, rating: number) => {
    setMedia(media);
    setRatingStore(rating);
    router.push({
      pathname: "/(tabs)/detalhe",
      params: { from: 'lista' }
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
};

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

  const rating = useRatingFor(id);
  const bookmark = useBookmarkFor(id);

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

export default function Lista() {

  const { getToken, userId } = useAuth()

  const [versaoAtual, setVersaoAtual] = useState(0);

  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-20);
  useFocusEffect(
    useCallback(() => {
      setVersaoAtual((prev) => (prev + 1))
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

  console.log({ versaoAtual })

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
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

  const setBookmark = useMediaBookmarkStore((s) => s.setBookmark);
  const setRating = useMediaRatingsStore((s) => s.setRating);

  useEffect(() => {
    if (medias.length > 0) {
      medias.forEach((item) => {
        if (item.bookmarked) {
          setBookmark(item.id, true);
        }

        if (item.user_rating && item.user_rating > 0) {
          setRating(item.id, item.user_rating)
        }
      });
    }
  }, [medias, setBookmark, setRating]);


  console.log({ error })

  return (
    <>
      <SignedIn>
        <Header paginaAtual='lista'/>

        <Animated.View className='flex-1 pt-20' style={animatedStyle} >
          {
            isLoading &&
            <SkeletonFlashList />
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
                        <Text className='text-white font-bold text-center text-2xl'>Você não possui nenhum item salvo</Text>
                      </View>
                    </View>
                  </View>
                )}
                renderItem={({ item }) => <ImageItem item={item} />}
                onEndReached={() => {
                  console.log("on end reached", { hasNextPage }, { isFetchingNextPage })
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