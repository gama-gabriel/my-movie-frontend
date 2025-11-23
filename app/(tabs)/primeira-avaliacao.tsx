import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import React, { memo, Ref, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { View, Text, TextInput, TextInputProps, ActivityIndicator } from 'react-native'
import { AnimatedButton } from '../components/AnimatedButton';
import { danger, neutral900, primary, primaryDark, primaryLight } from '@/constants/constants';
import { ButtonIcon, ButtonText } from '@/components/ui/button';
import { ArrowDown01Icon, ArrowDown10Icon, ArrowDownUpIcon, EraserIcon, SearchIcon, XIcon } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withTiming, } from 'react-native-reanimated';
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import { BuscaRequest, FilterCondition, FilterField } from '@/types/search.types';
import { protectedFetch } from '@/utils/Auth.utils';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useToastVariant } from '@/hooks/useToastVariant';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { MediaSearch, ResponseMediaSearch } from '@/types/media.types';
import { Skeleton } from 'moti/skeleton';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Select, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectIcon, SelectInput, SelectItem, SelectPortal, SelectTrigger } from '@/components/ui/select';
import { useMediaRatingsStore, useRatingFor } from '@/hooks/useMediaStore';
import { useFocusEffect, useRouter } from 'expo-router';
import { StarRating } from '@/components/RatingDrawer';
import { useRating } from '@/hooks/useRating';
import { Icon } from '@/components/ui/icon';

interface Pagina {
  media: MediaSearch[];
  nextPage: number | undefined;
}

type HeaderListProps = {
  termo: string;
  temDados: boolean;
  setSortBy: (s: string) => void;
  changeOrder: () => void;
  sortAtual: string;
  ordemAtual: 'asc' | 'desc';
};

export function SkeletonFlashList() {
  const data = Array.from({ length: 4 });

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
    <View className="flex-1 pt-4 bg-black">
      <FlashList
        data={data}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        estimatedItemSize={200}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      />
    </View>
  );
}

const RatingLeaf = memo(function RatingLeaf({
  id,
  onRate,
  onDeleteRating,
}: {
  id: string;
  onRate: (rating: number, media_id: string) => void;
  onDeleteRating: (media_id: string) => void;
}) {
  const rating = useRatingFor(id);

  const setRating = useMediaRatingsStore((s) => s.setRating);
  const clearRating = useMediaRatingsStore((s) => s.clearRating);

  const [visto, setVisto] = useState<boolean | null>(null);

  const handleRatingChange = useCallback(
    (newRating: number) => {
      setRating(id, newRating);
      onRate(newRating, id);
      setVisto(null)
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
                size='lg'
                onPress={() => setVisto(true)}
                className='flex-grow border border-primary-light'
              >
                <ButtonText className='text-white'>Já assisti</ButtonText>
              </AnimatedButton>
            </View>

          </View>
        </Animated.View>
      }

      {visto &&
        <Animated.View
          entering={FadeIn.duration(200).springify()}
          exiting={FadeOut.duration(200).springify()}
          className='justify-center flex flex-col items-center'
        >
          <Text className="text-white pb-2">Sua avaliação</Text>
          <StarRating
            maxStars={5}
            size={32}
            rating={rating}
            onRatingChange={handleRatingChange}
          />

          {rating === undefined &&
            <Animated.View
              entering={FadeIn.duration(200).springify()}
              exiting={FadeOut.duration(200).springify()}
              className='flex flex-row w-full gap-2 pt-4'
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
          <Text className="text-white pb-2">Sua avaliação</Text>
          <StarRating
            maxStars={5}
            size={32}
            rating={rating}
            onRatingChange={handleRatingChange}
          />

          <Animated.View
            entering={FadeIn.duration(200).springify()}
            exiting={FadeOut.duration(200).springify()}
            className='flex flex-row w-full gap-4 pt-4'
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
},
  (prevProps, nextProps) => prevProps.id === nextProps.id
);


const ImageItem = memo(({
  item,
}: {
  item: MediaSearch;
}) => {
  const { onRate, onDeleteRating } = useRating();

  const blurhash = 'B0JH:g-;fQ_3fQfQ';
  const uri = `https://image.tmdb.org/t/p/original/${item.poster_path}`;

  return (
    <View className='rounded-3xl border border-neutral-900 w-[95%] mx-auto flex flex-row mb-8' >
      <Image
        source={{ uri }}
        style={{ height: "100%", aspectRatio: 2 / 3, borderTopLeftRadius: 20, borderBottomLeftRadius: 20, }}
        cachePolicy="memory-disk"
        recyclingKey={item.id}
        contentFit="cover"
        placeholder={{ thumbhash: blurhash }}
        transition={{ duration: 500, timing: 'ease-in' }}
      />

      <View className='p-4 gap-2 bg-white/5 flex-1 rounded-r-3xl'>
        <View className='gap-1'>
          <Text className='text-white font-bold m-0 flex-shrink'>{item.title}</Text>
          {item.title !== item.original_title &&
            <Text className='text-neutral-100 italic m-0'>{item.original_title}</Text>
          }
        </View>

        <View
          className='flex flex-row justify-between items-center gap-4'
        >
          <Text className='text-neutral-500'>{item.release_date.slice(0, 4)}</Text>

          <Badge size="lg" variant="solid" action="muted" className='rounded-full px-4 mt-1 w-fit'>
            <BadgeText>{item.is_movie ? "Filme" : "Série"}</BadgeText>
          </Badge>
        </View>

        <View className='flex flex-col gap-2 w-full justify-center items-center pt-4'>
          <RatingLeaf
            id={item.id}
            onRate={onRate}
            onDeleteRating={onDeleteRating}
          />
        </View>
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.item.id === nextProps.item.id
  );
});
ImageItem.displayName = "ImageItem";

const HeaderList = ({
  termo,
  temDados,
  setSortBy,
  changeOrder,
  sortAtual,
  ordemAtual
}: HeaderListProps) => (
  <View className='flex flex-col'>
    <View className='w-full flex flex-col items-start justify-start gap-2 bg-black px-4 py-4 border-b border-neutral-900'>
      {termo.length > 0 &&
        <View className='flex flex-col'>
          <Text className='text-neutral-100'>Resultados para: </Text>
          <Text className="m-0 text-xl font-bold text-white w-fit">
            &quot;{termo}&quot;
          </Text>
        </View>
      }

    </View>

    {temDados &&
      <View className='flex flex-row items-end justify-between px-4 py-6'>
        <View className='flex flex-col gap-2'>
          <Text className='text-white font-semibold ps-2'>Ordenar por:</Text>
          <Select
            className='rounded-full'
            onValueChange={(value) => {
              setSortBy(value)
            }}
            defaultValue={sortAtual === 'title' ? 'Nome' : 'Data de lançamento'}
          >
            <SelectTrigger variant="outline" size="md">
              <SelectInput placeholder="Ordenarr por" />
              <SelectIcon className="mr-3" as={ArrowDownUpIcon} />
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent className='border border-b-0 border-neutral-900 bg-black gap-2'>
                <SelectDragIndicatorWrapper>
                  <SelectDragIndicator />
                </SelectDragIndicatorWrapper>
                <SelectItem label="Nome" value="title" />
                <SelectItem label="Data de lançamento" value="release_date" />
                <View className='h-4'></View>
              </SelectContent>
            </SelectPortal>
          </Select>

        </View>
        <View className='flex flex-col gap-1'>
          <AnimatedButton
            inactiveColor='transparent'
            activeColor={neutral900}
            variant='solid'
            size='md'
            onPress={() => changeOrder()}
          >
            {ordemAtual === 'asc' &&
              <>
                <ButtonText className='font-normal'>
                  Crescente
                </ButtonText>
                <ButtonIcon as={ArrowDown01Icon}></ButtonIcon>
              </>
            }

            {ordemAtual === 'desc' &&
              <>
                <ButtonText className='font-normal'>
                  Descrescente
                </ButtonText>
                <ButtonIcon as={ArrowDown10Icon}></ButtonIcon>
              </>
            }
          </AnimatedButton>
        </View>
      </View>

    }

  </View>
);

const PrimeiraAvaliacao = () => {

  const { user } = useUser()

  const router = useRouter()

  const [termoBusca, setTermoBusca] = useState('')
  const [termoBuscaConfirmado, setTermoBuscaConfirmado] = useState('')
  const [queryReady, setQueryReady] = useState(false)
  const [sortBy, setSortBy] = useState('title')
  const [order, setOrder] = useState<'asc' | 'desc'>('asc')

  const inputRef = useRef<TextInput>(null);

  const { getToken } = useAuth()

  const toast = useToastVariant()

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


  const limit = 10;

  const fetchResultados = async ({ pageParam = 0 }: { pageParam: number }): Promise<Pagina> => {
    const filtros: FilterCondition[] = []

    if (termoBuscaConfirmado.length >= 2) {
      filtros.push({
        value: termoBuscaConfirmado,
        field: FilterField.GENERIC,
      })
    }

    const body: BuscaRequest = {
      filters: filtros,
      limit,
      offset: pageParam,
      sort_by: sortBy,
      sort_order: order,
      clerk_id: user!.id
    };

    const response = await protectedFetch('https://mymovie-nhhq.onrender.com/media/search', getToken, {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify(body),
    });

    const jsonResponse: ResponseMediaSearch = await response.json();

    if (!response.ok) throw new Error(JSON.stringify(jsonResponse));
    return {
      media: jsonResponse.media,
      nextPage: pageParam + 1
    }
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    fetchStatus,
    isPending,
    status,
  } = useInfiniteQuery<Pagina, Error, Pagina, [string, string | undefined, string, string], number>({
    queryKey: ['buscaPrimeiraAvaliacao', termoBuscaConfirmado, sortBy, order],
    queryFn: ({ pageParam }) => fetchResultados({ pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.media.length < limit) return undefined;
      return allPages.reduce((acc, page) => acc + page.media.length, 0);
    },
    initialPageParam: 0,
    enabled: !!queryReady,
  });

  const medias = useMemo(
    () => {
      const infiniteData = data as InfiniteData<Pagina> | undefined;
      return infiniteData?.pages.flatMap((page) => page.media) || [];
    }, [data]
  );

  const setRating = useMediaRatingsStore((s) => s.setRating);

  useEffect(() => {
    if (medias.length > 0) {
      medias.forEach((item) => {
        if (item.user_rating && item.user_rating > 0) {
          setRating(item.id, item.user_rating)
        }
      });
    }
  }, [medias, setRating]);

  const validarQuery = (): boolean => {
    inputRef.current?.blur()

    if (termoBusca.trim().length < 2) {
      toast.show("Digite um termo válido.", "warning", 'bottom')
      setQueryReady(false)
      return false;
    }

    setTermoBuscaConfirmado(termoBusca.trim())
    setQueryReady(true)
    return true
  }

  const changeOrder = () => {
    if (order === 'asc') {
      setOrder('desc')
      return
    }
    setOrder('asc')
  }

  return (
    <Animated.View className='flex flex-1 bg-black' style={animatedStyle}>

      <View className='flex flex-col border-b border-neutral-900 py-6 px-4'>

        <View className="flex-row w-full flex items-center justify-between gap-2 h-fit">
          <View className='flex-grow'>
            <Input size='md' className='w-fit' >
              <InputSlot className="pl-4">
                <InputIcon as={SearchIcon} />
              </InputSlot>
              <InputField
                ref={inputRef as Ref<TextInputProps>}
                className='h-auto'
                onSubmitEditing={validarQuery}
                submitBehavior='blurAndSubmit'
                returnKeyType='search'
                enterKeyHint='search'
                value={termoBusca}
                onChangeText={(termo) => {
                  setTermoBusca(termo)
                }}
                autoCapitalize='none'
                placeholder='Buscar filmes, séries, atores'
              />
              <InputSlot className="pr-4" onPress={() => {
                setTermoBusca('')
              }}>
                <InputIcon as={XIcon} />
              </InputSlot>
            </Input>
          </View>

        </View>
      </View>

      {
        isLoading &&
        <SkeletonFlashList />
      }

      {
        isPending && fetchStatus === 'idle' &&
        <>
          <View className='flex-1 bg-black flex items-center justify-center '>
            <View className='flex flex-col w-[90%] items-center justify-center gap-6'>
              <View className='bg-primary-light/25 p-8 rounded-full'>
                <Icon as={SearchIcon} color={primaryLight} size={64} className='text-primary-light'></Icon>
              </View>
              <View className='items-center justify-center flex flex-col gap-2'>
                <Text className='text-white font-bold text-center text-3xl'>Comece a avaliar</Text>
                <Text className='text-neutral-100 text-center'>Procure e adicione os filmes/séries que você já assistiu</Text>
              </View>

            </View>

          </View>
          <View className='flex pb-6 px-4'>
            <AnimatedButton
              activeColor={neutral900}
              inactiveColor='transparent'
              variant='solid'
              size='lg'
              onPress={() => router.replace('/(tabs)/home')}
              className='border border-neutral-500'
            >
              <ButtonText className='text-white'>Pular</ButtonText>
            </AnimatedButton>
          </View>

        </>


      }

      {
        status === 'success' &&
        <>
          <View className='flex-1 bg-black'>
            <FlashList
              data={medias}
              className='flex flex-col gap-2 w-full'
              removeClippedSubviews={true}
              keyExtractor={(item) => item.id}
              estimatedItemSize={400}
              drawDistance={600}
              onEndReachedThreshold={1.5}
              ListHeaderComponent={() =>
                <HeaderList
                  termo={termoBuscaConfirmado}
                  temDados={medias.length > 0}
                  setSortBy={setSortBy}
                  changeOrder={changeOrder}
                  sortAtual={sortBy}
                  ordemAtual={order}
                />}
              ListEmptyComponent={() => (
                <View className='flex-1 bg-black flex items-center justify-center pt-10'>
                  <View className='flex flex-col w-[90%] items-center justify-center gap-6'>
                    <View className='bg-danger/25 p-8 rounded-full'>
                      <Icon as={SearchIcon} color={danger} size={64} className='text-danger'></Icon>
                    </View>
                    <View className='items-center justify-center flex flex-col gap-2'>
                      <Text className='text-white font-bold text-center text-3xl'>Nenhum resultado encontrado</Text>
                      <Text className='text-neutral-100 text-center'>Não encontramos resultados correspondentes a sua busca. Tente usar termos diferentes.</Text>

                    </View>
                  </View>
                </View>
              )}
              renderItem={({ item }) => (
                <ImageItem
                  item={item}
                />
              )}
              onEndReached={() => {
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

          <View className='flex flex-row w-full gap-4 px-4 py-4'>
            <AnimatedButton
              activeColor={neutral900}
              inactiveColor='transparent'
              variant='solid'
              size='lg'
              onPress={() => router.replace('/(tabs)/home')}
              className='flex-1 border border-neutral-500'
            >
              <ButtonText className='text-white'>Pular</ButtonText>
            </AnimatedButton>

            <AnimatedButton
              activeColor={primaryDark}
              inactiveColor={primary}
              variant='solid'
              size='lg'
              onPress={() => router.replace('/(tabs)/home')}
              className='flex-1'
            >
              <ButtonText className='text-white'>Continuar</ButtonText>
            </AnimatedButton>
          </View>
        </>

      }
    </Animated.View >
  )
}

export default PrimeiraAvaliacao