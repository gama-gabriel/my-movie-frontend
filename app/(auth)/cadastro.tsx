import { ButtonSpinner, ButtonText } from '@/components/ui/button'
import { EyeIcon, EyeOffIcon, InfoIcon } from '@/components/ui/icon'
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input'
import { useSignUp, useUser } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import * as React from 'react'
import { Keyboard, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import SignInGoogleButton from '../components/SignInGoogleButton'
import { Alert, AlertIcon, AlertText } from '@/components/ui/alert'
import { AnimatedButton } from '../components/AnimatedButton'
import { primary, primaryDark } from '@/constants/constants'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const AnimatedAlert = Animated.createAnimatedComponent(Alert);

export default function Cadastro() {
  const { isLoaded, signUp, setActive } = useSignUp()

  const { user } = useUser();

  const router = useRouter();

  const [nome, setNome] = React.useState('')
  const [nomeValido, setNomeValido] = React.useState(true)

  const [email, setEmail] = React.useState('')
  const [emailValido, setEmailValido] = React.useState(true)

  const [senha, setSenha] = React.useState('')
  const [senhaConfirmada, setSenhaConfirmada] = React.useState('')
  const [mostrarSenha, setMostrarSenha] = React.useState(false)
  const [senhaValida, setSenhaValida] = React.useState(true)
  const [senhasIguais, setSenhasIguais] = React.useState(true)

  const [pendingVerification, setPendingVerification] = React.useState(false)
  const [codigo, setCodigo] = React.useState('')
  const [codigoValido, setCodigoValido] = React.useState(true)

  const [mensagemErroCadastro, setMensagemErroCadastro] = React.useState('')
  const [mensagemErroCodigo, setMensagemErroCodigo] = React.useState('')

  const [loading, setLoading] = React.useState(false)

  const checkNome = (nome: string): boolean => {
    setNomeValido(nome.length > 0)
    return nome.length > 0
  }

  const checkEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    setEmailValido(emailRegex.test(email))
    return emailRegex.test(email)
  }

  const checkSenha = (senha: string): boolean => {
    setSenha(senha)
    const senhaRegex = /^.{8,64}$/
    setSenhaValida(senhaRegex.test(senha))
    return senhaRegex.test(senha)
  }

  const changeSenhaConfirmada = (password: string) => {
    setSenhaConfirmada(password)
    checkSenhasIguais()
  }

  const checkSenhasIguais = (): boolean => {
    setSenhasIguais(senha === senhaConfirmada)
    return senha === senhaConfirmada
  }

  const checkCodigo = (newCode: string): boolean => {
    setCodigo(String(newCode))
    const codigoRegex = /^\d{6}$/
    setCodigoValido(codigoRegex.test(newCode))
    return codigoRegex.test(newCode)
  }

  const handleState = () => {
    setMostrarSenha((state) => {
      return !state;
    });
  };

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    const validacaoNome = checkNome(nome)
    const validacaoEmail = checkEmail(email)
    const validacaoSenha = checkSenha(senha)
    const validacaoSenhasIguais = checkSenhasIguais()
    if (!validacaoNome || !validacaoEmail || !validacaoSenha || !validacaoSenhasIguais) return

    if (!isLoaded) return

    setLoading(true)
    setMensagemErroCadastro('')

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress: email,
        password: senha,
      })

      if (user) {
        await user.update({
          firstName: nome.split(' ')[0],
          lastName: nome.split(' ').slice(1).join(' '),
        });
      }
      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true)
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      setMensagemErroCadastro(err.errors[0]?.longMessage || 'Ocorreu um erro desconhecido. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return

    const validacaoCodigo = checkCodigo(codigo)
    if (!validacaoCodigo) return

    setLoading(true)
    setMensagemErroCodigo('')

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: codigo,
      })

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId })
        await
          router.replace({
            pathname: '/(onboarding)',
            params: { username: nome }
          })
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2))
      }
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      setMensagemErroCodigo(err.errors[0]?.longMessage || 'Ocorreu um erro desconhecido. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (pendingVerification) {
    return (
      <SafeAreaView edges={['top']} className='flex-1 items-center justify-start p-4 bg-black'>
        <Pressable className='w-full h-full items-center justify-start gap-4' onPress={() => { Keyboard.dismiss() }}>
          <View className='flex flex-col py-6 items-center'>
            <Text className="m-0 text-4xl font-bold text-white">
              Verificar e-mail
            </Text>
          </View>

          <View className="rounded-2xl items-start px-4 w-full gap-6">
            <Alert action="info" className="gap-3 w-full p-4 rounded-3xl">
              <AlertIcon as={InfoIcon} size="xl" className="fill-none text-blue-500" />
              <AlertText size="lg" className='text-white pe-4 ps-4 flex-1 flex-wrap'>
                O seu código de verificação foi enviado ao e-mail {email}
              </AlertText>
            </Alert>

            <View className='flex flex-col w-full gap-1'>

              <Text className='text-white pb-1 ps-4 font-bold w-fit'>Código de verificação</Text>
              <Input size='xl' isInvalid={!codigoValido}>
                <InputField
                  className='flex-1'
                  keyboardType='numeric'
                  autoCapitalize="none"
                  value={codigo}
                  placeholder="Digite o seu código de verificação"
                  onChangeText={(code) => {
                    setCodigo(code)
                    setCodigoValido(true)
                  }}
                  onSubmitEditing={onVerifyPress}
                  type='text'
                />
              </Input>

              <View className="ps-4 pt-0 pb-2">
                {!codigoValido && (
                  <Animated.Text
                    entering={FadeIn.duration(200).springify().withInitialValues({
                      transform: [{ translateY: 20 }],
                    })}
                    exiting={FadeOut.duration(200).springify().withInitialValues({
                      transform: [{ translateY: -20 }],
                    })}
                    className="text-red-300"
                  >
                    Código inválido
                  </Animated.Text>
                )}
              </View>
            </View>

            {mensagemErroCodigo &&
              <AnimatedAlert action="error" className="gap-3 w-full p-4 rounded-3xl">
                <AlertIcon as={InfoIcon} size="xl" className="fill-none text-danger" />
                <AlertText size="lg" className='text-white pe-4 ps-4 flex-1 flex-wrap'>
                  {mensagemErroCodigo}
                </AlertText>
              </AnimatedAlert>
            }

            <AnimatedButton activeColor={primaryDark} inactiveColor={primary} onPress={onVerifyPress} variant='solid' action='primary' size='xl' className='w-full transition disabled:bg-primary-black'>
              <ButtonSpinner className={loading ? 'data-[active=true]:text-neutral-100' : 'hidden'} color='white'></ButtonSpinner>
              <ButtonText className='text-white font-bold pl-4 data-[disabled=true]:text-neutral-500'>Verificar código</ButtonText>
            </AnimatedButton>
          </View>

        </Pressable>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView edges={['top']} className='flex-1 bg-black p-4'>
      <KeyboardAwareScrollView
        contentContainerStyle={{ padding: 0 }}
        enableAutomaticScroll={true}
        enableResetScrollToCoords={false}
        extraScrollHeight={80}
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, backgroundColor: 'black', padding: 0, margin: 0 }}
      >

        <View className='flex flex-1 w-full items-center justify-start gap-4 pb-12'>
          <View className='flex flex-col py-6 gap-4 items-center'>
            <Text className="m-0  text-4xl font-bold text-white">
              Criar conta
            </Text>
            <Text className="m-0 text-lg text-neutral-100">
              Cadastre-se para começar a usar o MyMovie
            </Text>
          </View>

          <SignInGoogleButton />

          <View className='w-full'>
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
          </View>

          <View className='w-full flex flex-col gap-2 pb-6'>
            <View className='flex flex-col w-full gap-1'>
              <Text className='text-white pb-1 ps-4 font-bold'>Nome</Text>
              <Input size='xl' isInvalid={!nomeValido}>
                <InputField
                  className='flex-1'
                  autoCapitalize="none"
                  value={nome}
                  placeholder="Seu nome de usuário"
                  spellCheck={false}
                  onChangeText={(nome) => {
                    setNome(nome)
                    setNomeValido(true)
                  }}
                  type='text'
                  autoComplete='name'
                />
              </Input>
              <View className="ps-4 pt-1 pb-2">
                {!nomeValido && (
                  <Animated.Text
                    entering={FadeIn.duration(200).springify().withInitialValues({
                      transform: [{ translateY: 20 }],
                    })}
                    exiting={FadeOut.duration(200).springify().withInitialValues({
                      transform: [{ translateY: -20 }],
                    })}
                    className="text-red-300"
                  >
                    Nome inválido
                  </Animated.Text>
                )}
              </View>

            </View>

            <View className='flex flex-col w-full gap-1'>
              <Text className='text-white pb-1 ps-4 font-bold'>E-mail</Text>
              <Input size='xl' isInvalid={!emailValido}>
                <InputField
                  className='flex-1'
                  autoCapitalize="none"
                  value={email}
                  placeholder="seuemail@email.com"
                  onChangeText={(email) => {
                    setEmail(email)
                    setEmailValido(true)
                  }}
                  type='text'
                  autoComplete='email'
                />
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
              <Text className='text-white pb-1 ps-4 font-bold'>Senha</Text>

              <Input size='xl' isInvalid={!senhaValida}>
                <InputField
                  className='flex-1'
                  value={senha}
                  onChangeText={(password) => {
                    setSenha(password)
                    setSenhaValida(true)
                    setSenhasIguais(true)
                  }}
                  type={mostrarSenha ? 'text' : 'password'}
                  autoCapitalize='none'
                  autoComplete='password'
                  placeholder='No mímimo 8 caracteres' />

                <InputSlot className="pr-6" onPress={handleState}>
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

            </View>

            <View className='flex flex-col w-full gap-1'>
              <Text className='text-white pb-1 ps-4 font-bold'>Confirmar senha</Text>

              <Input size='xl' isInvalid={!senhasIguais}>
                <InputField
                  className='flex-1'
                  value={senhaConfirmada}
                  onChangeText={(password) => {
                    changeSenhaConfirmada(password)
                    setSenhasIguais(true)
                  }}
                  onBlur={() => checkSenhasIguais()}
                  type={mostrarSenha ? 'text' : 'password'}
                  onSubmitEditing={onSignUpPress}
                  autoCapitalize='none'
                  autoComplete='password'
                  placeholder='No mímimo 8 caracteres' />

                <InputSlot className="pr-6" onPress={handleState}>
                  <InputIcon as={mostrarSenha ? EyeIcon : EyeOffIcon} />
                </InputSlot>
              </Input>

              <View className="ps-4 pt-1 pb-2">
                {!senhasIguais && (
                  <Animated.Text

                    entering={FadeIn.duration(200).springify().withInitialValues({
                      transform: [{ translateY: 20 }],
                    })}
                    exiting={FadeOut.duration(200).springify().withInitialValues({
                      transform: [{ translateY: -20 }],
                    })}
                    className="text-red-300"
                  >
                    Senhas não conferem
                  </Animated.Text>
                )}
              </View>

              {mensagemErroCadastro &&
                <AnimatedAlert
                  entering={FadeIn.duration(100).springify().withInitialValues({
                    transform: [{ translateY: 20 }],
                  })}
                  exiting={FadeOut.duration(100).springify().withInitialValues({
                    transform: [{ translateY: -20 }],
                  })}
                  action="error"
                  className="gap-3 w-full p-4 rounded-3xl">
                  <AlertIcon as={InfoIcon} size="xl" className="fill-none text-danger" />
                  <AlertText size="lg" className='text-white pe-4 ps-4 flex-1 flex-wrap'>
                    {mensagemErroCadastro}
                  </AlertText>
                </AnimatedAlert>
              }

            </View>
          </View>

          <AnimatedButton activeColor={primaryDark} inactiveColor={primary} onPress={onSignUpPress} variant='solid' action='primary' size='xl' className='w-full'>
            <ButtonSpinner className={loading ? 'data-[active=true]:text-neutral-100' : 'hidden'} color='white'></ButtonSpinner>
            <ButtonText className='text-white font-bold pl-4 data-[disabled=true]:text-neutral-500'>Continuar</ButtonText>
          </AnimatedButton>

          <View className='flex-row'>
            <Text className='text-white'>Já possui uma conta?</Text>

            <Link href="/(auth)/login">
              <Text className='text-primary-light'> Entrar</Text>
            </Link>
          </View>
        </View>

      </KeyboardAwareScrollView>

    </SafeAreaView>
  )
}