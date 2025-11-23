import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import React, { memo, Ref, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { View, Text, Pressable, TextInput, TextInputProps, ActivityIndicator } from 'react-native'
import { AnimatedButton } from '../components/AnimatedButton';
import { danger, generos, generosJson, neutral100, neutral700, neutral900, primary, primaryDark, primaryLight } from '@/constants/constants';
import { ButtonIcon, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { ArrowDown01Icon, ArrowDown10Icon, ArrowDownUpIcon, BookmarkIcon, CircleXIcon, EraserIcon, FrownIcon, SearchIcon, SlidersHorizontalIcon, XIcon } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withTiming, } from 'react-native-reanimated';
import { ScrollView } from 'react-native-gesture-handler';
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
import { CloseIcon, Icon } from '@/components/ui/icon';
import { Drawer, DrawerBackdrop, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader } from '@/components/ui/drawer';
import { Select, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectIcon, SelectInput, SelectItem, SelectPortal, SelectTrigger } from '@/components/ui/select';
import { useBookmarkFor, useMediaBookmarkStore, useMediaRatingsStore, useMediaStore, useRatingFor, useRatingStore } from '@/hooks/useMediaStore';
import { useFocusEffect, useRouter } from 'expo-router';
import { StarRating } from '@/components/RatingDrawer';
import { useBookmark } from '@/hooks/useBookmark';
import { useRating } from '@/hooks/useRating';

interface Pagina {
  media: MediaSearch[];
  nextPage: number | undefined;
}

type HeaderListProps = {
  termo: string;
  listaFiltros: string[];
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
  onBookmark,
}: {
  id: string;
  onRate: (rating: number, media_id: string) => void;
  onDeleteRating: (media_id: string) => void;
  onBookmark: (adicionar: boolean, media_id: string) => void;
}) {
  // subscribe only to the single-id primitive values
  const rating = useRatingFor(id); // returns number | 0 default
  const bookmark = useBookmarkFor(id); // returns boolean | false default

  // get imperative setters once (stable references)
  const setRating = useMediaRatingsStore((s) => s.setRating);
  const clearRating = useMediaRatingsStore((s) => s.clearRating);
  const setBookmark = useMediaBookmarkStore((s) => s.setBookmark);

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

  const handleBookmarkChange = useCallback(
    (newBookmark: boolean) => {
      setBookmark(id, newBookmark);
      onBookmark(newBookmark, id);
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
},
  (prevProps, nextProps) => prevProps.id === nextProps.id
);


const ImageItem = memo(({
  item,
}: {
  item: MediaSearch;
}) => {
  const router = useRouter();
  const setMedia = useMediaStore((state) => state.setMedia);
  const setRatingStore = useRatingStore((state) => state.setRating);

  const { onRate, onDeleteRating } = useRating();
  const { onBookmark } = useBookmark();

  const currentRating = useRatingFor(item.id);

  const handleIrParaDetalhes = useCallback((media: MediaSearch, rating: number) => {
    setMedia(media as any);
    setRatingStore(rating);
    router.push({
      pathname: "/(tabs)/detalhe",
      params: { from: "pesquisa" }
    });
  }, [setMedia, setRatingStore, router]);

  const blurhash = 'B0JH:g-;fQ_3fQfQ';
  const uri = `https://image.tmdb.org/t/p/original/${item.backdrop_path}`;

  return (
    <View className='rounded-3xl border border-neutral-900 w-[95%] mx-auto flex mb-8' >
      <Pressable onPress={() => handleIrParaDetalhes(item, currentRating ?? 0)}>
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
          <RatingLeaf
            id={item.id}
            onRate={onRate}
            onDeleteRating={onDeleteRating}
            onBookmark={onBookmark}
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
  listaFiltros,
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

      {listaFiltros.length > 0 &&
        <>
          <Text className='text-neutral-100'>Filtros aplicados:</Text>
          <View className='flex flex-row gap-2 flex-wrap'>
            {listaFiltros.map((filtro) => (
              <Badge key={filtro} size="lg" variant="solid" action="muted" className='rounded-full bg-primary-light/40 px-4'>
                <BadgeText>{filtro}</BadgeText>
              </Badge>
            ))}
          </View>
        </>
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
            defaultValue={sortAtual === 'title' ? 'Nome' : sortAtual === 'release_date' ? 'Data de lançamento' : 'Popularidade'}
          >
            <SelectTrigger variant="outline" size="md">
              <SelectInput placeholder="Ordenar por" />
              <SelectIcon className="mr-3" as={ArrowDownUpIcon} />
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent className='border border-b-0 border-neutral-900 bg-black gap-2'>
                <SelectDragIndicatorWrapper>
                  <SelectDragIndicator />
                </SelectDragIndicatorWrapper>
                <SelectItem label="Popularidade" value="popularity" />
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
                <ButtonText className='font-normal text-neutral-100'>
                  Crescente
                </ButtonText>
                <ButtonIcon as={ArrowDown01Icon} color={neutral100}></ButtonIcon>
              </>
            }

            {ordemAtual === 'desc' &&
              <>
                <ButtonText className='font-normal text-neutral-100'>
                  Descrescente
                </ButtonText>
                <ButtonIcon as={ArrowDown10Icon} color={neutral100}></ButtonIcon>
              </>
            }
          </AnimatedButton>
        </View>
      </View>

    }

  </View>
);

const Pesquisa = () => {

  const { user } = useUser()

  const [filterOpen, setFilterOpen] = useState(false);
  const [generosSelecionados, setGenerosSelecionados] = useState<string[]>([])
  const [tipoSelecionado, setTipoSelecionado] = useState<string>('')
  const [termoBusca, setTermoBusca] = useState('')
  const [termoBuscaConfirmado, setTermoBuscaConfirmado] = useState('')
  const [filtrosSelecionados, setFiltrosSelecionados] = useState<string[]>([])
  const [queryReady, setQueryReady] = useState(false)
  const [sortBy, setSortBy] = useState('popularity')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')

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

  const adicionarGenero = (genero: string) => {
    if (generosSelecionados.length >= 3) {
      toast.show("Escolha até 3 gêneros.", "warning", 'top')
      return
    }
    setGenerosSelecionados((prev) => {
      const jaNaLista = prev.includes(genero);
      if (jaNaLista) return prev;

      return [...prev, genero];
    });
  }

  const removerGenero = (genero: string) => {
    setGenerosSelecionados((prev) => {
      if (prev.includes(genero)) {
        return prev.filter((g) => g !== genero);
      }
      return prev
    });
  }

  const limit = 10;

  const fetchResultados = async ({ pageParam = 0 }: { pageParam: number }): Promise<Pagina> => {
    const filtros: FilterCondition[] = []

    generosSelecionados.forEach((genero) => {
      filtros.push({
        value: generosJson[genero],
        field: FilterField.GENRE_NAME,
      })
    })

    if (tipoSelecionado.length > 0) {
      filtros.push({
        value: String(tipoSelecionado === 'Filme'),
        field: FilterField.IS_MOVIE,
      })
    }

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
    refetch,
    isFetching,
    isLoading,
    fetchStatus,
    isPending,
    status,
  } = useInfiniteQuery<Pagina, Error, Pagina, [string, string | undefined, string[], string, string], number>({
    queryKey: ['busca', termoBuscaConfirmado, filtrosSelecionados, sortBy, order],
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

  const validarQuery = (): boolean => {
    inputRef.current?.blur()

    const filtros = tipoSelecionado.length > 0
      ? [tipoSelecionado, ...generosSelecionados]
      : generosSelecionados;
    setFiltrosSelecionados(filtros)

    if (termoBusca.trim().length < 2) {
      if (tipoSelecionado.length === 0 && generosSelecionados.length === 0) {
        toast.show("Digite um termo ou escolha ao menos um filtro.", "warning", filterOpen ? 'top' : 'bottom')
        setQueryReady(false)
        return false;
      }
    }

    setTermoBuscaConfirmado(termoBusca.trim())
    setQueryReady(true)
    return true
  }

  const pesquisar = async () => {
    if (validarQuery()) {
      setFilterOpen((prev) => !prev)
      refetch()
    }
  }

  const changeOrder = () => {
    if (order === 'asc') {
      setOrder('desc')
      return
    }
    setOrder('asc')
  }

  const labels = generos;

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

          <AnimatedButton
            inactiveColor='transparent'
            activeColor={neutral900}
            variant='solid'
            size='md'
            onPress={() => setFilterOpen(prev => !prev)}
            className='border border-neutral-500' >
            <ButtonIcon as={SlidersHorizontalIcon}></ButtonIcon>
          </AnimatedButton>

        </View>
      </View>

      <Drawer
        isOpen={filterOpen}
        size="lg"
        anchor="bottom"
        onClose={() => {
          setFilterOpen(false);
        }}
      >
        <DrawerBackdrop />
        <DrawerContent className='gap-6 rounded-3xl border border-b-0 border-neutral-900 h-fit'
        >
          <DrawerHeader>
            <Text className='text-white text-xl font-bold'>Filtros</Text>
            <DrawerCloseButton>
              <Icon as={CloseIcon} className='text-neutral-100' />
            </DrawerCloseButton>
          </DrawerHeader>

          <DrawerBody>
            <View className='flex flex-col gap-6'>
              <View className='flex flex-col gap-4'>
                {(tipoSelecionado.length > 0 || generosSelecionados.length > 0) &&

                  <Animated.View
                    entering={FadeIn.duration(200).springify().withInitialValues({
                      transform: [{ translateY: 20 }],
                    })}

                    className='flex flex-col gap-2'>
                    <View
                      className='gap-2'
                    >
                      <View className='flex flex-row justify-between w-full'>
                        <Text className='text-white font-bold text-base'>Filtros aplicados</Text>
                        {(tipoSelecionado || generosSelecionados.length > 0) &&
                          <Pressable
                            className='flex flex-row gap-1 items-center'
                            onPress={() => {
                              setTipoSelecionado('')
                              setGenerosSelecionados([])
                            }}
                          >
                            <Icon as={CloseIcon} className='text-neutral-100'></Icon>
                            <Text className='text-neutral-100 text-base'>
                              Limpar filtros
                            </Text>
                          </Pressable>
                        }

                      </View>
                      <View className='flex flex-row flex-wrap gap-2'>

                        {tipoSelecionado &&
                          <AnimatedButton
                            activeColor={neutral700}
                            inactiveColor={neutral900}
                            onPress={() => setTipoSelecionado('')}
                          >
                            <Text className='text-white font-semibold'>{tipoSelecionado}</Text>
                            <ButtonIcon as={CircleXIcon}></ButtonIcon>
                          </AnimatedButton>
                        }

                        {generosSelecionados.map((genero) => (
                          <AnimatedButton
                            key={genero}
                            activeColor={neutral700}
                            inactiveColor={neutral900}
                            onPress={() => removerGenero(genero)}
                          >
                            <Text className='text-white font-semibold'>{genero}</Text>
                            <ButtonIcon as={CircleXIcon}></ButtonIcon>
                          </AnimatedButton>
                        ))}
                      </View>
                    </View>

                  </Animated.View>
                }


                <View className='flex flex-col gap-2'>
                  <Text className='text-white font-bold text-base'>Tipo</Text>

                  <View className='flex flex-row flex-wrap gap-2'>
                    <AnimatedButton
                      className='border border-neutral-500'
                      activeColor={neutral900}
                      inactiveColor='transparent'
                      onPress={() => setTipoSelecionado('Filme')}
                    >
                      <Text className='text-white'>Filme</Text>
                    </AnimatedButton>

                    <AnimatedButton
                      className='border border-neutral-500'
                      activeColor={neutral900}
                      inactiveColor='transparent'
                      onPress={() => setTipoSelecionado('Série/TV')}
                    >
                      <Text className='text-white'>Série/TV</Text>
                    </AnimatedButton>
                  </View>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  className='h-52 pb-2'
                  stickyHeaderIndices={[0]}
                >
                  <Text className='text-white font-bold text-base pb-2 bg-black'>Gêneros</Text>
                  <View className='flex flex-row flex-wrap gap-2'>
                    {labels.map((genero) => (
                      <AnimatedButton
                        key={genero}
                        className='border border-neutral-500'
                        activeColor={neutral900}
                        inactiveColor='transparent'
                        onPress={() => adicionarGenero(genero)}
                      >
                        <Text style={{ color: "white" }}>{genero}</Text>
                      </AnimatedButton>
                    ))}
                  </View>
                </ScrollView>

              </View>

              <View className='flex flex-col gap-2 pb-4'>
                <AnimatedButton
                  inactiveColor={primary}
                  activeColor={primaryDark}
                  variant='solid'
                  size='md'
                  className='w-fit'
                  onPress={pesquisar}
                >
                  {isFetching &&
                    <ButtonSpinner color='white' className='pr-2'></ButtonSpinner>
                  }
                  <ButtonIcon as={SearchIcon}></ButtonIcon>
                  <ButtonText className='pl-2'>Buscar com filtros</ButtonText>
                </AnimatedButton>

              </View>

            </View>
          </DrawerBody>

        </DrawerContent>

      </Drawer>

      {
        isLoading &&
        <SkeletonFlashList />
      }

      {
        isPending && fetchStatus === 'idle' &&
        <View className='flex-1 bg-black flex items-center justify-center '>
          <View className='flex flex-col w-3/4 items-center justify-center gap-6'>
            <View className='bg-primary-light/25 p-8 rounded-full'>
              <Icon as={SearchIcon} color={primaryLight} size={64} className='text-primary-light'></Icon>
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
            removeClippedSubviews={true}
            keyExtractor={(item) => item.id}
            estimatedItemSize={800}
            drawDistance={1200}
            onEndReachedThreshold={2}
            ListHeaderComponent={() =>
              <HeaderList
                termo={termoBuscaConfirmado}
                listaFiltros={filtrosSelecionados}
                temDados={medias.length > 0}
                setSortBy={setSortBy}
                changeOrder={changeOrder}
                sortAtual={sortBy}
                ordemAtual={order}
              />}
            ListEmptyComponent={() => (
              <View className='flex-1 bg-black flex items-center justify-center pt-10'>
                <View className='flex flex-col w-3/4 items-center justify-center gap-6'>
                  <View className='bg-danger/25 p-8 rounded-full'>
                    <Icon as={SearchIcon} color={danger} size={64} className='text-danger'></Icon>
                  </View>
                  <View className='items-center justify-center flex flex-col gap-2'>
                    <Text className='text-white font-bold text-center text-3xl'>Nenhum resultado encontrado</Text>
                    <Text className='text-neutral-100 text-center'>Não encontramos resultados correspondentes a sua busca. Tente ajustar os filtros ou use termos diferentes.</Text>

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
      }
    </Animated.View >
  )
}

export default Pesquisa