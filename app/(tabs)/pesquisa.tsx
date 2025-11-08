import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import React, { Ref, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { View, Text, Pressable, TextInput, TextInputProps } from 'react-native'
import AnimatedButton from '../components/AnimatedButton';
import { danger, generos, generosJson, neutral700, neutral900, primary, primaryDark, primaryLight } from '@/constants/constants';
import { ButtonIcon, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { ArrowDown01Icon, ArrowDown10Icon, ArrowDownUpIcon, ChevronDownIcon, CircleXIcon, FilterIcon, SearchIcon, SlidersHorizontalIcon } from 'lucide-react-native';
import Animated, { Easing, FadeIn, FadeOut, LightSpeedOutLeft, Layout, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming, ZoomOutDown, ZoomOut, ZoomOutEasyDown, FadeOutLeft, FadeOutUp, FadeOutRight, StretchOutY } from 'react-native-reanimated';
import { ScrollView } from 'react-native-gesture-handler';
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import { BuscaRequest, FilterCondition, FilterField, FilterOperator } from '@/types/search.types';
import { protectedFetch } from '@/utils/Auth.utils';
import { useAuth } from '@clerk/clerk-expo';
import { useToastVariant } from '@/hooks/useToastVariant';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { Media, ResponseMedia } from '@/types/media.types';
import { Skeleton } from 'moti/skeleton';
import { Badge, BadgeText } from '@/components/ui/badge';
import { CloseIcon, Icon } from '@/components/ui/icon';
import { Drawer, DrawerBackdrop, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader } from '@/components/ui/drawer';
import { Select, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectIcon, SelectInput, SelectItem, SelectPortal, SelectTrigger } from '@/components/ui/select';
import { useMediaStore, useRatingStore } from '@/hooks/useMediaStore';
import { useRouter } from 'expo-router';

interface Pagina {
  media: Media[];
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
              console.log("value changed", value)
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

const Pesquisa = () => {

  const [filterOpen, setFilterOpen] = useState(false);
  const [generosSelecionados, setGenerosSelecionados] = useState<string[]>([])
  const [tipoSelecionado, setTipoSelecionado] = useState<string>('')
  const [termoBusca, setTermoBusca] = useState('')
  const [termoBuscaConfirmado, setTermoBuscaConfirmado] = useState('')
  const [filtrosSelecionados, setFiltrosSelecionados] = useState<string[]>([])
  const [queryReady, setQueryReady] = useState(false)
  const [sortBy, setSortBy] = useState('title')
  const [order, setOrder] = useState<'asc' | 'desc'>('asc')

  const inputRef = useRef<TextInput>(null);

  const { getToken } = useAuth()

  const toast = useToastVariant()

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

    console.log("fetchResultados")
    generosSelecionados.forEach((genero) => {
      filtros.push({
        value: generosJson[genero],
        field: FilterField.GENRE_NAME,
        operator: FilterOperator.LIKE
      })
    })

    if (tipoSelecionado.length > 0) {
      filtros.push({
        value: String(tipoSelecionado === 'Filme'),
        field: FilterField.IS_MOVIE,
        operator: FilterOperator.EQ
      })
    }

    if (termoBuscaConfirmado.length >= 2) {
      filtros.push({
        value: termoBuscaConfirmado,
        operator: FilterOperator.LIKE,
        field: FilterField.GENERIC,
      })
    }
    console.log({ filtros })

    const body: BuscaRequest = {
      filters: filtros,
      limit,
      offset: pageParam,
      sort_by: sortBy,
      sort_order: order
    };

    const response = await protectedFetch('https://mymovie-nhhq.onrender.com/media/search', getToken, {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify(body),
    });

    const jsonResponse: ResponseMedia = await response.json();

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


  const setMedia = useMediaStore((state) => state.setMedia);
  const setRatingStore = useRatingStore((state) => state.setRating);
  const router = useRouter()

  const handleIrParaDetalhes = (media: Media, rating: number) => {
    setMedia(media);
    setRatingStore(rating)

    router.navigate("/(tabs)/detalhe");
  };

  const labels = generos;

  console.log("data: ", data)
  console.log("status: ", fetchStatus)

  return (
    <View className='flex flex-1 bg-black'>

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
            renderItem={({ item }) => {
              const uri = `https://image.tmdb.org/t/p/original/${item.backdrop_path}`;
              return (
                <View className='rounded-3xl border border-neutral-900 w-[95%] mx-auto flex mb-8'>
                  <Pressable>
                    <Image
                      source={{ uri }}
                      style={{ width: "100%", aspectRatio: 3 / 2, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
                      cachePolicy="memory-disk"
                      recyclingKey={item.id}
                      contentFit="cover"
                      placeholder={{ thumbhash: "J02$Hej[j[fQM{fQ" }}
                      transition={{ duration: 1000, timing: 'ease-in' }}
                    />
                  </Pressable>

                  <View className='p-4 gap-2 bg-white/5'>
                    <Pressable >
                      <Text className='text-white font-bold m-0'>{item.title}</Text>
                    </Pressable>

                    <Pressable
                      className='flex flex-row justify-between items-center gap-4'
                      onPress={() => handleIrParaDetalhes(item, 0)}
                    >
                      <Text className='text-neutral-500'>{item.release_date.slice(0, 4)}</Text>

                      <Badge size="lg" variant="solid" action="muted" className='rounded-full px-4 mt-1 w-fit'>
                        <BadgeText>{item.is_movie ? "Filme" : "Série"}</BadgeText>
                      </Badge>
                    </Pressable>

                    
                  </View>
                </View>
              )

            }}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View className="py-4 items-center">
                  <Text className="text-neutral-400">Carregando mais...</Text>
                </View>
              ) : null
            }
          />

        </View>
      }
    </View >
  )
}

export default Pesquisa