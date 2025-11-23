import { Icon } from '@/components/ui/icon';
import { neutral100, neutral700, neutral900, primary, primaryDark, primaryLight } from '@/constants/constants';
import { SignedIn } from '@clerk/clerk-expo'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeftIcon, BookmarkIcon, ChevronLeftIcon, ChevronRightIcon, ClapperboardIcon, SearchIcon, StarIcon } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react'
import { View, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, withSpring } from 'react-native-reanimated'
import { AnimatedButton } from '../components/AnimatedButton';
import { ButtonIcon, ButtonText } from '@/components/ui/button';

const Informacoes = () => {

  const steps = [
    {
      id: 1,
      title: "Como funciona o MyMovie?",
      description:
        "O MyMovie é uma plataforma inteligente de recomendação de filmes e séries que aprende com suas preferências.",
      icon: ClapperboardIcon,
    },
    {
      id: 2,
      title: "Influência das Avaliações",
      description:
        "Cada avaliação que você dá (estrelas) influencia diretamente o algoritmo de recomendação. Quanto mais você avalia, melhores ficam as sugestões personalizadas para você. Avaliar filmes que você gostou e não gostou ajuda o sistema a entender melhor seu gosto.",
      icon: StarIcon,
    },
    {
      id: 3,
      title: "Pesquisa de Produções",
      description:
        "Use a aba 'Procurar' para encontrar filmes e séries específicas. Você pode filtrar por gêneros e tipo. A busca avançada torna fácil descobrir exatamente o que você está procurando.",
      icon: SearchIcon,
    },
    {
      id: 4,
      title: "Salvar filmes e séries",
      description:
        "Clique no ícone de marcador em qualquer filme para salvá-lo em sua lista. Esses itens salvos ficarão acessíveis e ajudam a personalizar suas recomendações. Você pode gerenciar sua lista a qualquer momento.",
      icon: BookmarkIcon,
    },
  ]

  const opacity = useSharedValue(0);
  const translateX = useSharedValue(20);

  useFocusEffect(
    useCallback(() => {
      setCurrentStep(0)
      opacity.value = withTiming(1, { duration: 600 })
      translateX.value = withTiming(0, { duration: 600 })
      return () => {
        opacity.value = 0
        translateX.value = 20
      }
    }, [opacity, translateX])
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  const router = useRouter()
  const params = useLocalSearchParams<{ from: 'pesquisa' | 'home' | 'perfil' }>();

  const [currentStep, setCurrentStep] = useState(0)
  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  const IndicatorDot = ({ index }: { index: number }) => {
    const isActive = index === currentStep;
    const indicatorWidth = useSharedValue(isActive ? 32 : 8);
    const indicatorOpacity = useSharedValue(isActive ? 1 : 0.4);

    useEffect(() => {
      indicatorWidth.value = withSpring(isActive ? 32 : 8, { damping: 15, stiffness: 150 });
      indicatorOpacity.value = withTiming(isActive ? 1 : 0.4, { duration: 200 });
    }, [isActive, indicatorWidth, indicatorOpacity]);

    const indicatorStyle = useAnimatedStyle(() => ({
      width: indicatorWidth.value,
      opacity: indicatorOpacity.value,
    }));

    return (
      <Animated.View
        style={indicatorStyle}
        className={`h-2 rounded-full ${isActive ? 'bg-primary-light' : 'bg-neutral-500'
          }`}
      />
    );
  };

  const CarouselIndicator = () => {
    return (
      <View className="flex-row gap-2 justify-center items-center">
        {steps.map((_, index) => (
          <IndicatorDot key={index} index={index} />
        ))}
      </View>
    );
  };

  const avancar = () => {
    if (params.from !== undefined) {
      router.replace('/home')
      return
    }

    router.replace('/primeira-avaliacao')
  }

  return (
    <SignedIn>
      <Animated.View className="flex flex-1 px-4" style={animatedStyle}>
        {params.from !== undefined &&
          <View className='flex flex-row pt-6'>
            <AnimatedButton
              inactiveColor={neutral900}
              activeColor={neutral700}
              variant='solid'
              size='lg'
              className='p-4'
              onPress={() => router.replace(`/(tabs)/${params.from}`)}
            >
              <ButtonIcon as={ArrowLeftIcon} color={neutral100} size={24} />
            </AnimatedButton>
          </View>
        }

        <View className='flex-1 bg-black flex items-center justify-center'>
          <Animated.View
            className='flex flex-col w-[90%] items-center justify-center gap-6'
          >
            <View className='bg-primary-light/25 p-8 rounded-full'>
              <Icon as={step.icon} color={primaryLight} size={64} className='text-primary-light' />
            </View>

            <View className='items-center justify-center flex flex-col gap-2'>
              <Text className='text-white font-bold text-center text-3xl'>{step.title}</Text>
              <Text className='text-neutral-100 text-center'>{step.description}</Text>
            </View>
          </Animated.View>
        </View>

        <View className='pb-6'>
          <CarouselIndicator />
        </View>

        <View className='flex flex-row gap-2 pb-8 justify-between'>
          <View>
            <AnimatedButton
              inactiveColor={'transparent'}
              activeColor={neutral900}
              variant='solid'
              size='xl'
              className='border border-neutral-500 disabled:opacity-50'
              disabled={currentStep === 0}
              onPress={() => setCurrentStep(currentStep - 1)}
            >
              <ButtonIcon as={ChevronLeftIcon} color={neutral100} />
            </AnimatedButton>
          </View>

          {isLastStep ? (
            <>

              <View className='flex-1'>
                <AnimatedButton
                  inactiveColor={primary}
                  activeColor={primaryDark}
                  variant='solid'
                  size='xl'
                  onPress={avancar}
                >
                  <ButtonText className='text-white pl-4'>Começar a explorar</ButtonText>
                </AnimatedButton>
              </View>
            </>
          ) : (
            <>

              <AnimatedButton
                inactiveColor={primary}
                activeColor={primaryDark}
                variant='solid'
                size='xl'
                onPress={() => setCurrentStep(currentStep + 1)}
              >
                <ButtonIcon as={ChevronRightIcon} color={'white'} />
              </AnimatedButton>
            </>
          )}
        </View>
      </Animated.View>
    </SignedIn>
  )
}

export default Informacoes