import { useMediaStore } from "@/hooks/useMediaStore";
import { View, Text, ScrollView } from "react-native"
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Badge, BadgeText } from "@/components/ui/badge";
import { Heading } from "lucide-react-native";
import { Button, ButtonText } from "@/components/ui/button";

export default function Detalhe() {
  const media = useMediaStore((state) => state.media);

  console.log(media)

  return (
    <View className="flex flex-1 pt-20">
      <ScrollView className="flex flex-col">

        <Image
          source={`https://image.tmdb.org/t/p/w300/${media?.poster_path}`}
          style={{ width: "100%", aspectRatio: 2 / 3 }}
          cachePolicy="memory-disk"
          recyclingKey={media?.id}
          contentFit="cover"
          transition={{ duration: 100, timing: 'ease-in' }}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,1)']}
          locations={[0, 0.2, 0.3]}
          className="-mt-60 pt-24 flex flex-col gap-8 px-4 pb-12"
        >
          <View className="flex flex-col gap-4">
            <Text className="m-0 text-4xl font-bold text-white w-fit">
              {media?.title}
            </Text>
            <View className="flex flex-row gap-4">
              <Badge size="lg" variant="solid" action="muted" className='rounded-full px-4 w-fit'>
                <BadgeText>{media?.is_movie ? "Filme" : "Série"}</BadgeText>
              </Badge>

              <Badge size="lg" variant="solid" action="muted" className='rounded-full px-4 w-fit'>
                <BadgeText>{media?.is_movie ? "Filme" : "Série"}</BadgeText>
              </Badge>

              <Badge size="lg" variant="solid" action="muted" className='rounded-full px-4'>
                <BadgeText>{media?.is_movie ? "Filme" : "Série"}</BadgeText>
              </Badge>
            </View>

          </View>

          <Button
            className='w-full'
            variant="pr"
          >
            <ButtonText>Avaliar</ButtonText>
          </Button>





          <View className="flex flex-col gap-2">
            <Text className="m-0 text-lg font-bold text-white">
              Sinopse
            </Text>

            <Text className="text-white text-base">
              {media?.description}
            </Text>
          </View>

        </LinearGradient>
      </ScrollView>
    </View>

  )
}
