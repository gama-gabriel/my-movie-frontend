import { useBookmarkFor, useMediaBookmarkStore, useMediaRatingsStore, useMediaStore, useRatingFor } from "@/hooks/useMediaStore";
import { View, Text, BackHandler } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { BookmarkIcon, CalendarIcon, EraserIcon } from "lucide-react-native";
import { FlashList } from "@shopify/flash-list";
import { StarRating } from "@/components/RatingDrawer";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { CastMember } from "@/types/media.types";
import { Skeleton } from "moti/skeleton";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { AnimatedButton } from "../components/AnimatedButton";
import { danger, neutral900, primaryLight } from "@/constants/constants";
import { ButtonIcon, ButtonText } from "@/components/ui/button";
import { useRating } from "@/hooks/useRating";
import { useBookmark } from "@/hooks/useBookmark";

export default function Detalhe() {

  const media = useMediaStore((state) => state.media);

  const clearMedia = useMediaStore(s => s.clearMedia);

  const setRating = useMediaRatingsStore((s) => s.setRating);
  const clearRating = useMediaRatingsStore((s) => s.clearRating);

  const setBookmark = useMediaBookmarkStore((s) => s.setBookmark);

  const { onRate, onDeleteRating } = useRating();

  const { onBookmark } = useBookmark();

  const params = useLocalSearchParams();
  const router = useRouter()

  useEffect(() => {
    const backAction = () => {
      if (params.from === 'pesquisa') {
        router.push('/(tabs)/pesquisa');
      } else {
        router.back();
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [router, params]);


  const handleBookmarkChange = useCallback(
    (adicionar: boolean) => {
      if (!media) return;
      onBookmark(adicionar, media.id);
      setBookmark(media.id, adicionar);
    },
    [media, onBookmark, setBookmark]
  );

  const handleRatingChange = useCallback(
    (id: string, newRating: number) => {
      setRating(id, newRating);
      onRate(newRating, id);
    },
    [onRate, setRating]
  );
  const handleDeleteRating = useCallback(
    (mediaId: string) => {
      clearRating(mediaId);
      onDeleteRating(mediaId);
    },
    [clearRating, onDeleteRating]
  );

  const formatarData = (dataString: string | undefined, tipo: string | undefined) => {
    if (!dataString) return "Data indisponível";

    const meses = [
      "janeiro", "fevereiro", "março", "abril", "maio", "junho",
      "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    ];
    const data = new Date(dataString);
    const dia = data.getDate();
    const mes = meses[data.getMonth()];
    const ano = data.getFullYear();

    return tipo === "serie" ? `${ano}` : `${dia} de ${mes} de ${ano}`;
  };

  const opacity = useSharedValue(0);
  const listRef = useRef<FlashList<any>>(null);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 })
  }, [opacity])

  useFocusEffect(
    useCallback(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
      opacity.value = withTiming(1, { duration: 600 })
      return () => {
        opacity.value = 0
        clearMedia();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opacity])
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const renderCastItem = useCallback(({ item }: { item: CastMember }) => (
    <CastCard item={item} />
  ), []);


  const HeaderComponent = React.memo(({ media, handleRatingChange }: any) => {

    const RatingSection = React.memo(({ media, handleRatingChange }: any) => {
      const rating = useRatingFor(media.id);
      const bookmark = useBookmarkFor(media.id);

      const [visto, setVisto] = useState<boolean | null>(null)

      const rate = useCallback(
        (newRating: number) => {
          handleRatingChange(media.id, newRating);
          setVisto(false)
        },
        [media.id, handleRatingChange]
      );

      return (
        <>
          {!visto && rating === undefined && (
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
            </Animated.View>
          )}

          {visto && (
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
                onRatingChange={rate}
              />

              {rating === undefined && (
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
              )}
            </Animated.View>
          )}

          {rating! > 0 && (
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
                onRatingChange={rate}
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
                  onPress={() => handleDeleteRating(media.id)}
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
          )}

          {rating === 0 && (
            <Animated.View
              entering={FadeIn.duration(200).springify()}
              exiting={FadeOut.duration(200).springify()}
              className='flex flex-col w-full gap-4'
            >
              <Text className="text-white text-center">Esse item não será recomendado para você</Text>
              <AnimatedButton
                inactiveColor='transparent'
                activeColor={neutral900}
                variant='solid'
                size='md'
                onPress={() => handleDeleteRating(media.id)}
                className='border border-neutral-700'
              >
                <ButtonText className='text-white pl-2'>Desfazer</ButtonText>
              </AnimatedButton>
            </Animated.View>
          )}
        </>
      );
    });
    RatingSection.displayName = "RatingSection";

    if (!media) return (
      <View className="w-[95%] self-center my-2">
        <Skeleton
          colorMode="dark"
          width={'100%'}
          height={600}
          radius={24}
        />
      </View>
    );

    return (
      <Animated.View style={animatedStyle}
        renderToHardwareTextureAndroid
        shouldRasterizeIOS
      >
        {!media ? (
          <View className="w-[95%] self-center my-2">
            <Skeleton
              colorMode="dark"
              width={"100%"}
              height={600}
              radius={24}
            />
          </View>
        ) : (
          <Image
            source={`https://image.tmdb.org/t/p/original/${media.poster_path}`}
            style={{ width: "100%", aspectRatio: 2 / 3 }}
            cachePolicy="memory-disk"
            contentFit="cover"
            recyclingKey={media.id}
            transition={500}
            placeholder={{ blurhash: "J02$Hej[j[fQM{fQ" }}
          />
        )}

        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)", "rgba(0,0,0,1)"]}
          locations={[0, 0.1, 0.15]}
          className="-mt-60 pt-24 flex flex-col gap-6 px-4 pb-12"
        >
          <View className="flex flex-col gap-4">
            <Text className="m-0 text-4xl font-bold text-white">{media.title}</Text>

            <View className="flex flex-row flex-wrap gap-4">
              {media.genres?.map((genre: string) => (
                <Badge key={genre} size="lg" variant="solid" action="muted" className="rounded-full px-4 w-fit">
                  <BadgeText>{genre}</BadgeText>
                </Badge>
              ))}
            </View>

            <View className="flex flex-row gap-2">
              <Icon as={CalendarIcon} />
              <Text className="m-0 text-neutral-100 w-fit">
                {formatarData(media.release_date, media.is_movie ? "filme" : "serie")}
              </Text>
            </View>
          </View>

          <RatingSection media={media} handleRatingChange={handleRatingChange}></RatingSection>

          <View className="flex flex-col gap-2">
            <Text className="m-0 text-lg font-bold text-white">Sinopse</Text>
            <Text className="text-white text-base">{media.description}</Text>
          </View>

          <View className="flex flex-col gap-2">
            <Text className="m-0 text-lg font-bold text-white">Elenco</Text>

            <FlashList
              data={media.cast || []}
              horizontal
              showsHorizontalScrollIndicator={false}
              estimatedItemSize={200}
              renderItem={renderCastItem}
              keyExtractor={(item) => String(item.name)}
            />
          </View>
        </LinearGradient>
      </Animated.View>
    );
  });
  HeaderComponent.displayName = "HeaderComponent";

  const renderHeader = useCallback(() => {
    return <HeaderComponent media={media} handleRatingChange={handleRatingChange} />
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [media]);

  if (!media) return (
    <View className="w-[95%] self-center my-2">
      <Skeleton
        colorMode="dark"
        width={'100%'}
        height={600}
        radius={24}
      />
    </View>
  );

  return (
    <View className="flex flex-1 bg-black pt-20">
      {!media ? (
        <View className="px-4 py-8 gap-6 pt-24">
          <Skeleton colorMode="dark" height={300} radius={24} />
          <Skeleton colorMode="dark" height={40} radius={12} />
          <Skeleton colorMode="dark" height={40} radius={12} />
        </View>
      ) : (
        <FlashList
          ref={listRef}
          renderItem={null}
          data={[]}
          estimatedItemSize={100}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const CastCard = React.memo(({ item }: { item: CastMember }) => (
  <View
    className="flex flex-col gap-2 rounded-3xl border border-neutral-700 mr-4"
    style={{ width: 200 }}
  >
    <Image
      source={`https://image.tmdb.org/t/p/original/${item?.profile_path}`}
      style={{
        width: 198,
        aspectRatio: 2 / 3,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}
      cachePolicy="memory-disk"
      recyclingKey={String(item.name)}
      transition={0}
      contentFit="cover"
      placeholder="B0JH:g-;fQ_3fQfQ"
    />
    <View className="flex flex-col px-4 pb-4 h-20">
      <Text className="text-white font-bold text-base">{item.name}</Text>
      <Text className="text-neutral-100 text-base">{item.character_name}</Text>
    </View>
  </View>
));
CastCard.displayName = "CastCard";
