import { AnimatedButton } from '@/app/components/AnimatedButton'
import { ButtonSpinner, ButtonText } from '@/components/ui/button'
import React, { useState } from 'react'
import { View, Text } from 'react-native'
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Alert, AlertIcon, AlertText } from '@/components/ui/alert';
import { EyeIcon, EyeOffIcon, InfoIcon } from 'lucide-react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { primary, primaryDark } from '@/constants/constants';
import { useToastVariant } from '@/hooks/useToastVariant';

const AnimatedAlert = Animated.createAnimatedComponent(Alert);

const AlterarSenha = () => {

  const toast = useToastVariant()
  const router = useRouter()

  const { user } = useUser()

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = React.useState('')
  const [novaSenhaConfirmada, setNovaSenhaConfirmada] = React.useState('')
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = React.useState(false)
  const [mostrarNovaSenha, setMostrarNovaSenha] = React.useState(false)
  const [senhaValida, setSenhaValida] = React.useState(true)
  const [senhaAtualValida, setSenhaAtualValida] = React.useState(true)
  const [senhasIguais, setSenhasIguais] = React.useState(true)

  const [loading, setLoading] = React.useState(false)
  const [mensagemErro, setMensagemErro] = React.useState('')

  const handleNovaSenhaState = () => {
    setMostrarNovaSenha((state) => {
      return !state;
    });
  };

  const handleSenhaAtualState = () => {
    setMostrarSenhaAtual((state) => {
      return !state;
    });
  };

  const checkSenhaAtual = (senha: string): boolean => {
    const senhaRegex = /^.{8,64}$/
    setSenhaAtualValida(senhaRegex.test(senha))
    return senhaRegex.test(senha)
  }

  const checkSenha = (senha: string): boolean => {
    const senhaRegex = /^.{8,64}$/
    setSenhaValida(senhaRegex.test(senha))
    return senhaRegex.test(senha)
  }

  const checkSenhasIguais = (): boolean => {
    setSenhasIguais(novaSenha === novaSenhaConfirmada)
    return novaSenha === novaSenhaConfirmada
  }

  const handleChangePassword = async () => {

    const validacaoSenhaAtual = checkSenhaAtual(senhaAtual)
    const validacaoSenha = checkSenha(novaSenha)
    const validacaoSenhasIguais = checkSenhasIguais()

    if (!validacaoSenha || !validacaoSenhasIguais || !validacaoSenhaAtual) {
      return;
    }

    setLoading(true)
    setMensagemErro('')

    try {
      await user?.updatePassword({
        currentPassword: senhaAtual,
        newPassword: novaSenha,
      });

      setTimeout(() => {
        router.dismissAll()
      }, 100);

      toast.show("Senha alterada com sucesso!", "success")

    } catch (err: any) {
      setMensagemErro(err.errors[0]?.longMessage || 'Ocorreu um erro desconhecido. Tente novamente.')
      console.error('Error updating password:', err);
    } finally {
      setLoading(false)
    }
  };

  return (
    <View className="flex flex-1 pt-20 px-4">

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
        <View className='flex flex-col py-6 items-center'>
          <Text className="m-0 text-4xl font-bold text-white">
            Alterar senha
          </Text>
        </View>



        <Animated.View
          entering={FadeIn.duration(200).springify().withInitialValues({
            transform: [{ translateY: 20 }],
          })}
          exiting={FadeOut.duration(200).springify().withInitialValues({
            transform: [{ translateY: -20 }],
          })}
          className="flex flex-col w-full gap-4">
          <Alert action="info" className="gap-3 w-full p-4 rounded-3xl">
            <AlertIcon as={InfoIcon} size="xl" className="fill-none text-blue-500" />
            <AlertText size="lg" className='text-white pe-4 ps-4 flex-1 flex-wrap'>
              Informe sua senha atual e sua nova senha
            </AlertText>
          </Alert>

          <View className='flex flex-col w-full gap-1'>
            <Text className='text-white pb-1 ps-4 font-bold'>Senha atual</Text>

            <Input size='xl' isInvalid={!senhaAtualValida}>
              <InputField
                className='flex-1'
                value={senhaAtual}
                onChangeText={(password) => {
                  setSenhaAtual(password)
                  setSenhaAtualValida(true)
                }}
                type={mostrarSenhaAtual ? 'text' : 'password'}
                autoCapitalize='none'
                autoComplete='password'
                placeholder='No mímimo 8 caracteres' />

              <InputSlot className="pr-6" onPress={handleSenhaAtualState}>
                <InputIcon as={mostrarSenhaAtual ? EyeIcon : EyeOffIcon} />
              </InputSlot>
            </Input>

            {!senhaAtualValida && (
              <View className="ps-4 pt-1 pb-2">
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
              </View>
            )}

          </View>

          <View className='flex flex-col w-full gap-1'>
            <Text className='text-white pb-1 ps-4 font-bold'>Nova senha</Text>

            <Input size='xl' isInvalid={!senhaValida}>
              <InputField
                className='flex-1'
                value={novaSenha}
                onChangeText={(password) => {
                  setNovaSenha(password)
                  setSenhaValida(true)
                  setSenhasIguais(true)
                }}
                type={mostrarNovaSenha ? 'text' : 'password'}
                autoCapitalize='none'
                autoComplete='password'
                placeholder='No mímimo 8 caracteres' />

              <InputSlot className="pr-6" onPress={handleNovaSenhaState}>
                <InputIcon as={mostrarNovaSenha ? EyeIcon : EyeOffIcon} />
              </InputSlot>
            </Input>

            {!senhaValida && (
              <View className="ps-4 pt-1 pb-2">
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
              </View>
            )}

          </View>

          <View className='flex flex-col w-full gap-1 pb-6'>
            <Text className='text-white pb-1 ps-4 font-bold'>Confirmar nova senha</Text>

            <Input size='xl' isInvalid={!senhasIguais}>
              <InputField
                className='flex-1'
                value={novaSenhaConfirmada}
                onChangeText={(password) => {
                  setNovaSenhaConfirmada(password)
                  setSenhasIguais(true)
                }}
                onBlur={() => checkSenhasIguais()}
                type={mostrarNovaSenha ? 'text' : 'password'}
                autoCapitalize='none'
                autoComplete='password'
                placeholder='No mímimo 8 caracteres' />

              <InputSlot className="pr-6" onPress={handleNovaSenhaState}>
                <InputIcon as={mostrarNovaSenha ? EyeIcon : EyeOffIcon} />
              </InputSlot>
            </Input>

            {!senhasIguais && (
              <View className="ps-4 pt-1 pb-2">
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
              </View>
            )}

            {mensagemErro &&
              <AnimatedAlert
                entering={FadeIn.duration(100).springify().withInitialValues({
                  transform: [{ translateY: 20 }],
                })}
                exiting={FadeOut.duration(100).springify().withInitialValues({
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

          <AnimatedButton activeColor={primaryDark} inactiveColor={primary} variant='solid' size='xl' className='w-full' onPress={handleChangePassword}>
            <ButtonSpinner className={loading ? 'data-[active=true]:text-neutral-100' : 'hidden'} color='white' ></ButtonSpinner>
            <ButtonText className='text-white font-bold pl-4 data-[disabled=true]:text-neutral-500'>Alterar senha</ButtonText>
          </AnimatedButton>

        </Animated.View>
      </KeyboardAwareScrollView>
    </View >
  )
}

export default AlterarSenha