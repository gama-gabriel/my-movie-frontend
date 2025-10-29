import { useMediaRatingsStore, useMediaStore, useRatingStore } from "@/hooks/useMediaStore";
import { View, Text, ScrollView } from "react-native"
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Badge, BadgeText } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { CalendarIcon } from "lucide-react-native";
import { FlashList } from "@shopify/flash-list";
import { useRatingDrawer } from "@/contexts/RatingDrawerContext";
import { StarRating } from "@/components/RatingDrawer";
import { useState } from "react";

export default function Detalhe() {
  const media = useMediaStore((state) => state.media);
  const previousRating = useRatingStore((state) => state.rating);
  const setCurrentRating = useMediaRatingsStore((s) => s.setRating);

  const { onRate } = useRatingDrawer();
  const [rating, setRating] = useState(0);
  // const { openDrawer } = useRatingDrawer();

  const formatarData = (dataString: string | undefined, tipo: string | undefined): string => {
    if (!dataString) return "Data indisponível";

    const meses = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    const data = new Date(dataString);
    const dia = data.getDate();
    const mes = meses[data.getMonth()];
    const ano = data.getFullYear();

    if (tipo === "serie") {
      return `${ano}`;
    }

    return `${dia} de ${mes} de ${ano}`;
  }


  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    onRate(newRating, media!);
    setCurrentRating(media!.id, newRating);
  }

  return (
    <View className="flex flex-1 pt-20">
      <ScrollView className="flex flex-col">

        <Image
          source={`https://image.tmdb.org/t/p/original/${media?.poster_path}`}
          style={{ width: "100%", aspectRatio: 2 / 3 }}
          cachePolicy="memory-disk"
          recyclingKey={media?.id}
          contentFit="cover"
          placeholder={{ blurhash: 'J02$Hej[j[fQM{fQ' }}
          transition={{ duration: 100, timing: 'ease-in' }}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,1)']}
          locations={[0, 0.1, 0.15]}
          className="-mt-60 pt-24 flex flex-col gap-8 px-4 pb-12"
        >
          <View className="flex flex-col gap-4">
            <Text className="m-0 text-4xl font-bold text-white w-fit">
              {media?.title}
            </Text>
            <View className="flex flex-row gap-4">
              {media?.genres.map((genre) => (
                <Badge key={genre} size="lg" variant="solid" action="muted" className='rounded-full px-4 w-fit'>
                  <BadgeText>{genre}</BadgeText>
                </Badge>
              ))}
            </View>

            <View className="flex flex-row gap-2">
              <Icon as={CalendarIcon}></Icon>
              <Text className="m-0  text-neutral-100 w-fit">
                {formatarData(media?.release_date, media?.is_movie ? "filme" : "serie")}
              </Text>
            </View>

          </View>

          {/* <AnimatedButton
            activeColor={primaryDark}
            inactiveColor={primary}
            disabled={rating > 0}
            className='w-full disabled:opacity-50'
            onPress={() => openDrawer(media!)}
          >
            <ButtonIcon as={Star} color="#dddddd" />
            <ButtonText>Avaliar</ButtonText>
          </AnimatedButton> */}
          <View className='flex flex-col gap-2 w-full justify-center items-center'>
            <Text className='text-white text-lg'>Toque em uma estrela para avaliar</Text>
            <StarRating
              maxStars={5}
              size={48}
              rating={previousRating > 0 ? previousRating : rating}
              disabled={previousRating > 0 || rating > 0}
              onRatingChange={handleRatingChange}
            />
          </View>

          <View className="flex flex-col gap-2">
            <Text className="m-0 text-lg font-bold text-white">
              Sinopse
            </Text>

            <Text className="text-white text-base">
              {media?.description}
            </Text>
          </View>

          <View className="flex flex-col gap-2">
            <Text className="m-0 text-lg font-bold text-white">
              Elenco
            </Text>

            <FlashList
              data={media?.cast || []}
              horizontal
              key={media?.id}
              estimatedItemSize={200} // approximate height/width for perf
              keyExtractor={(item, index) => `${item.name}-${index}`}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
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
                    recyclingKey={`${item.name}-${item.character_name}`}
                    contentFit="cover"
                    transition={{ duration: 100, timing: "ease-in" }}
                    placeholder='B0JH:g-;fQ_3fQfQ'
                  />

                  <View className="flex flex-col px-4 pb-4">
                    <Text className="text-white font-bold text-base">{item.name}</Text>
                    <Text className="text-neutral-100 text-base">{item.character_name}</Text>
                  </View>
                </View>
              )}
            />

          </View>

        </LinearGradient>
      </ScrollView>
    </View>

  )
}
