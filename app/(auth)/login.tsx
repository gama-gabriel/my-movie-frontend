import { ButtonSpinner, ButtonText } from '@/components/ui/button'
import { EyeIcon, EyeOffIcon, InfoIcon } from '@/components/ui/icon'
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input'
import { useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import React from 'react'
import { Keyboard, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import SignInGoogleButton from '../components/SignInGoogleButton'
import { Alert, AlertIcon, AlertText } from '@/components/ui/alert'
import { primary, primaryDark } from '@/constants/constants'
import { AnimatedButton } from '../components/AnimatedButton'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'

const AnimatedAlert = Animated.createAnimatedComponent(Alert);

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter();

  const [email, setEmail] = React.useState('')
  const [emailValido, setEmailValido] = React.useState(true)

  const [senha, setSenha] = React.useState('')
  const [mostrarSenha, setMostrarSenha] = React.useState(false)
  const [senhaValida, setSenhaValida] = React.useState(true)

  const [mensagemErro, setMensagemErro] = React.useState<string | null>(null);

  const [loading, setLoading] = React.useState(false)

  const fadeInStagger = (index: number) =>
    FadeIn
      .duration(250)
      .delay(index * 100)
      .springify()
      .withInitialValues({
        transform: [{ translateY: 20 }],
      })

  const checkEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    setEmailValido(emailRegex.test(email))
    return emailRegex.test(email)
  }

  const checkSenha = (senha: string) => {
    const senhaRegex = /^.{8,64}$/
    setSenhaValida(senhaRegex.test(senha))
    return senhaRegex.test(senha)
  }

  const handleState = () => {
    setMostrarSenha((state) => {
      return !state;
    });
  };

  // Handle the submission of the sign-in form
  const onEntrarPress = async () => {
    if (!isLoaded) return

    checkEmail(email)
    checkSenha(senha)

    if ((checkEmail(email)) && checkSenha(senha)) {
      setLoading(true)

      setMensagemErro(null)

      // Start the sign-in process using the email and password provided
      try {
        const signInAttempt = await signIn.create({
          identifier: email,
          password: senha,
        })

        // If sign-in process is complete, set the created session as active
        // and redirect the user
        if (signInAttempt.status === 'complete') {
          await setActive({ session: signInAttempt.createdSessionId })
          router.replace('/');
        } else {
          // If the status isn't complete, check why. User might need to
          // complete further steps.
          console.error(JSON.stringify(signInAttempt, null, 2))
        }
      } catch (err: any) {
        // See https://clerk.com/docs/custom-flows/error-handling
        // for more info on error handling
        setMensagemErro(err.errors?.[0]?.longMessage || 'Ocorreu um erro. Tente novamente.')
      } finally {
        setLoading(false)
      }
    }


  }

  return (
    <SafeAreaView edges={['top']} className='flex-1 items-center justify-start p-4 bg-black'>
      <Pressable className='w-full h-fit items-center justify-start gap-4' onPress={() => { Keyboard.dismiss() }}>

        <Animated.View className='flex flex-col py-6 gap-4 items-center' entering={fadeInStagger(0)}>
          <Text className="m-0  text-4xl font-bold text-white">
            Bem-vindo
          </Text>
          <Text className="m-0 text-lg text-neutral-100">
            Entre em sua conta para continuar
          </Text>
        </Animated.View>

        <Animated.View entering={fadeInStagger(1)} className='w-full'>
          <SignInGoogleButton />
        </Animated.View>

        <Animated.View className='w-full' entering={fadeInStagger(2)}>
          <View className="relative my-4">
            <View className="relative flex-row justify-center z-10">
              <Text className=" bg-black text-center text-neutral-100 text-sm px-2">
                Ou continue com
              </Text>
            </View>
            <View className="absolute inset-0 flex-row items-center z-0">
              <View className="w-full border-t border-neutral-500" />
            </View>
          </View>
        </Animated.View>

        <Animated.View className='w-full flex flex-col gap-2 pb-6' entering={fadeInStagger(3)}>
          <View className='flex flex-col w-full gap-1'>
            <Text className='text-white pb-1 font-bold ps-4'>E-mail</Text>
            <Input size='xl' isInvalid={!emailValido}>
              <InputField
                type='text'
                value={email}
                onChangeText={(email) => {
                  setEmail(email)
                  setEmailValido(true)
                }}
                autoComplete='email'
                autoCapitalize='none'
                placeholder='seuemail@email.com' />
            </Input>

            <View className="ps-4 pt-1 pb-2">
              {!emailValido && (
                <Animated.Text

                  entering={FadeIn.duration(200).springify().withInitialValues({
                    transform: [{ translateY: 20 }],
                  })}
                  exiting={FadeOut.duration(200).springify().withInitialValues({
                    transform: [{ translateY: -20 }],
                  })}
                  className="text-red-300"
                >
                  E-mail inválido
                </Animated.Text>
              )}
            </View>
          </View>

          <View className='flex flex-col w-full gap-1'>
            <View className='flex flex-row w-full justify-between'>
              <Text className='text-white pb-1 font-bold ps-4'>Senha</Text>
              <View className='flex-row'>
                <Link
                  href={{ pathname: "/(auth)/trocar-senha", params: { comingFrom: 'auth' } }}
                  className='text-primary-light pe-4'>
                  Esqueci minha senha
                </Link>
              </View>
            </View>

            <Input size='xl' isInvalid={!senhaValida}>
              <InputField
                type={mostrarSenha ? 'text' : 'password'}
                value={senha}
                onChangeText={(senha) => {
                  setSenha(senha)
                  setSenhaValida(true)
                }}
                onSubmitEditing={onEntrarPress}
                autoCapitalize='none'
                autoComplete='password'
                placeholder='No mímimo 8 caracteres' />

              <InputSlot className="pr-4" onPress={handleState}>
                <InputIcon as={mostrarSenha ? EyeIcon : EyeOffIcon} />
              </InputSlot>
            </Input>

            <View className="ps-4 pt-1 pb-2">
              {!senhaValida && (
                <Animated.Text
                  entering={FadeIn.duration(200).springify().withInitialValues({
                    transform: [{ translateY: 20 }],
                  })}
                  exiting={FadeOut.duration(200).springify().withInitialValues({
                    transform: [{ translateY: -20 }],
                  })}
                  className="text-red-300"
                >
                  Senha inválida
                </Animated.Text>
              )}
            </View>

            {mensagemErro &&
              <AnimatedAlert
                entering={FadeIn.duration(200).springify().withInitialValues({
                  transform: [{ translateY: 20 }],
                })}
                exiting={FadeOut.duration(200).springify().withInitialValues({
                  transform: [{ translateY: -20 }],
                })}
                action="error"
                className="gap-3 w-full p-4 rounded-3xl">
                <AlertIcon as={InfoIcon} size="xl" className="fill-none text-red-500" />
                <AlertText size="lg" className='text-white pe-4 ps-4 flex-1 flex-wrap'>
                  {mensagemErro}
                </AlertText>
              </AnimatedAlert>
            }

          </View>
        </Animated.View>

        <Animated.View entering={fadeInStagger(4)} className='w-full'>

          <AnimatedButton activeColor={primaryDark} inactiveColor={primary} onPress={onEntrarPress} variant='solid' action='primary' size='xl' className='w-full transition disabled:bg-primary-black'>
            <ButtonSpinner className={loading ? 'data-[active=true]:text-neutral-100' : 'hidden'} color='white' ></ButtonSpinner>
            <ButtonText className='text-white font-bold pl-4 data-[disabled=true]:text-neutral-500'>Continuar</ButtonText>
          </AnimatedButton>

        </Animated.View>


        <Animated.View className='flex flex-col items-center justify-center gap-4 ' entering={fadeInStagger(4)}>
          <View className='flex-row'>
            <Text className='text-white'>Não possui uma conta?</Text>

            <Link href="/(auth)/cadastro">
              <Text className='text-primary-light'> Cadastre-se</Text>
            </Link>
          </View>
        </Animated.View>

      </Pressable>

    </SafeAreaView>
  )
}