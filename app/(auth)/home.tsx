import { ButtonText } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import SignInGoogleButton from '../components/SignInGoogleButton'
import { AnimatedButton } from '../components/AnimatedButton'
import { primary, primaryDark, secondary } from '@/constants/constants'
import Animated, { FadeIn } from 'react-native-reanimated'

export default function Page() {
  const router = useRouter();

  const redirectLogin = () => {
    router.push('/(auth)/login')
  }

  const redirectCadastro = () => {
    router.push('/(auth)/cadastro')
  }

  const fadeInStagger = (index: number) =>
    FadeIn
      .duration(250)
      .delay(index * 120)
      .springify()
      .withInitialValues({
        transform: [{ translateY: 20 }],
      })

  return (
    <SafeAreaView edges={['top']} className='flex-1 items-center justify-start gap-4 p-4 bg-black'>
      <Animated.View
        entering={FadeIn.duration(100).springify().withInitialValues({
          transform: [{ translateY: 20 }],
        })}
        className='flex-1 items-center justify-center gap-4 py-4 bg-black'>
        <Heading size='4xl'>MyMovie</Heading>
      </Animated.View>

      <Animated.View
        entering={FadeIn.duration(200).springify().withInitialValues({
          transform: [{ translateY: 20 }],
        })}
        className='items-center justify-center gap-6 py-12 w-full'>
        <Animated.View entering={fadeInStagger(0)} className='w-full'>
          <SignInGoogleButton />
        </Animated.View>

        <Animated.View entering={fadeInStagger(1)} className='w-full'>
          <AnimatedButton activeColor={primaryDark} inactiveColor={primary} size='xl' className='w-full' onPress={redirectLogin}>
            <ButtonText className='text-white'>Entrar</ButtonText>
          </AnimatedButton>
        </Animated.View>

        <Animated.View entering={fadeInStagger(2)} className='w-full'>
          <AnimatedButton activeColor={`${secondary}80`} inactiveColor={secondary} size='xl' className='w-full' onPress={redirectCadastro}>
            <ButtonText className='text-white'>Criar conta</ButtonText>
          </AnimatedButton>
        </Animated.View>

      </Animated.View>
    </SafeAreaView>


  )
}
