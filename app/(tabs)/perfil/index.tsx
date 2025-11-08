import SignOutButton from "@/app/components/SignOutButton";
import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from "@/components/ui/alert-dialog";
import { ButtonIcon, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { useToastVariant } from "@/hooks/useToastVariant";
import { protectedFetch } from "@/utils/Auth.utils";
import { SignedIn, SignedOut, useAuth, useUser } from "@clerk/clerk-expo";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Redirect, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Image } from 'expo-image';
import { AnimatedButton } from "../../components/AnimatedButton";
import { danger, neutral100, neutral900 } from "@/constants/constants";
import { KeyRoundIcon, ListIcon, PencilIcon, Trash2Icon, UserRound } from "lucide-react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useMediaRatingsStore } from "@/hooks/useMediaStore";
import { Icon } from "@/components/ui/icon";
import Logo from '@/assets/logo.svg'

export default function Perfil() {

  const queryClient = useQueryClient();
  const toast = useToastVariant()
  const { user } = useUser()
  const [username, setUsername] = useState('')
  const { getToken, signOut } = useAuth()

  const router = useRouter();

  const [mostrarDialogConfirmacao, setMostrarDialogConfirmacao] = React.useState(false);
  const [mostrarDialogExclusao, setMostrarDialogExclusao] = React.useState(false);

  const hasPassword = user?.passwordEnabled;

  const handleClose = () => setMostrarDialogConfirmacao(false);
  const handleCloseExclusao = () => setMostrarDialogExclusao(false);

  const clearStore = useMediaRatingsStore(s => s.clearAll);

  const openDialogExclusao = () => {
    setMostrarDialogConfirmacao(false);
    setMostrarDialogExclusao(true);
  }

  useEffect(() => {
    console.log(user)
    const metadata = user?.publicMetadata
    if (metadata?.username) {
      setUsername(metadata.username as string)
    } else {
      if (user) {
        setUsername(user.fullName!)
      }
    }
  }, [user])


  const opacity = useSharedValue(0);
  const translateX = useSharedValue(20);

  useFocusEffect(
    useCallback(() => {
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

  const excluirUsuarioFn = async (id: string) => {
    console.log("excluindo ", id)
    const response = await protectedFetch('https://mymovie-nhhq.onrender.com/user/delete', getToken, {
      method: 'DELETE',
      body: JSON.stringify({ clerk_id: id }),
    })

    if (!response.ok) throw Error(JSON.stringify(response.body));

    return response.json();
  }

  const excluirMutation = useMutation({
    mutationFn: excluirUsuarioFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images"] });
      clearStore()
    },
  });

  const excluirConta = async () => {
    setMostrarDialogExclusao(false);
    try {
      excluirMutation.mutate(user!.id);
      await signOut();
      router.replace('/(auth)/login')
      toast.show("Conta excluída com sucesso!", "success")
    } catch (err) {
      console.error("Erro ao excluir usuário: ", err)
      toast.show("Erro ao excluir conta. Tente novamente mais tarde.", "error")
    }
  }

  const { status } = excluirMutation

  const DialogConfirmarExcluir = () => {
    return (
      <AlertDialog isOpen={mostrarDialogConfirmacao} onClose={handleClose} size="md">
        <AlertDialogBackdrop />

        <AlertDialogContent className="rounded-3xl bg-black">
          <AlertDialogHeader>
            <Text className="text-white font-bold text-lg py-2">
              Tem certeza que deseja excluir sua conta?
            </Text>
          </AlertDialogHeader>

          <AlertDialogBody className="py-2">
            <Text className="text-white">
              Excluir sua conta é uma ação permanente e não pode ser desfeita.
            </Text>
          </AlertDialogBody>

          <AlertDialogFooter className="py-2">
            <AnimatedButton
              inactiveColor="transparent"
              activeColor={neutral900}
              variant="outline"
              action="secondary"
              className="border border-neutral-500"
              onPress={handleClose}
              size="md"
            >
              <ButtonText>Cancelar</ButtonText>
            </AnimatedButton>

            <AnimatedButton inactiveColor={`${danger}50`} activeColor={`${danger}80`} variant='solid' size='lg' className='border border-danger/75' onPress={openDialogExclusao}>
              <ButtonText>Excluir</ButtonText>
            </AnimatedButton>
          </AlertDialogFooter>

        </AlertDialogContent>
      </AlertDialog>
    )
  }

  const DialogExcluir = () => {
    return (
      <AlertDialog isOpen={mostrarDialogExclusao} onClose={handleCloseExclusao} size="md">
        <AlertDialogBackdrop />

        <AlertDialogContent className="rounded-3xl bg-black">
          <AlertDialogHeader>
            <Text className="text-white font-bold text-lg py-2">
              Confirmar exclusão
            </Text>
          </AlertDialogHeader>

          <AlertDialogBody className="py-2">
            <Text className="text-white">
              Confirme para excluir sua conta.
            </Text>
          </AlertDialogBody>

          <AlertDialogFooter className="py-2">
            <AnimatedButton
              inactiveColor="transparent"
              activeColor={neutral900}
              className="border border-neutral-500"
              variant="outline"
              action="secondary"
              onPress={handleCloseExclusao}
              size="md"
            >
              <ButtonText>Cancelar</ButtonText>
            </AnimatedButton>

            <AnimatedButton inactiveColor={`${danger}50`} activeColor={`${danger}80`} variant='solid' size='lg' className='border border-danger/75' onPress={excluirConta}>
              <ButtonText>Excluir minha conta</ButtonText>
            </AnimatedButton>
          </AlertDialogFooter>

        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <>
      <SignedIn>
        <View
          className="absolute w-full left-0 z-10 h-20 bg-black/70 border-b border-neutral-900"
        >
          <View className="flex-row items-center justify-between p-6 h-20">

            <Logo height={'100%'} preserveAspectRatio="xMinYMin meet" style={{ flex: 1 }}></Logo>
            <Pressable
              onPress={() => router.navigate('/(tabs)/perfil')}
              className="p-3 rounded-full bg-neutral-900"
            >
              <Icon as={UserRound} />
            </Pressable>
          </View>
        </View>
        <Animated.View className="flex flex-1 pt-20 px-4" style={animatedStyle}>
          <ScrollView showsVerticalScrollIndicator={false} className="flex flex-col">
            <View className="flex-1 flex flex-col pt-6 pb-12 gap-8 w-full items-center">
              <Text className="m-0 text-4xl font-bold text-white">
                Meu perfil
              </Text>

              <View className='flex-1 items-center justify-start bg-black w-full h-full gap-4'>

                <View className="flex w-full flex-col items-center gap-4 border border-neutral-700 rounded-3xl py-6">
                  <Image
                    source={user?.imageUrl}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 50
                    }}
                    cachePolicy="memory-disk"
                    contentFit="cover"
                    transition={{ duration: 100, timing: "ease-in" }}
                    placeholder='B0JH:g-;fQ_3fQfQ'
                  />

                  <View className="flex flex-col items-center">
                    <Text className="text-white font-bold text-lg">{username}</Text>
                    <Text className='text-neutral-100'>{user?.emailAddresses[0].emailAddress}</Text>
                  </View>

                </View>

                <View className="flex w-full flex-col gap-4 border border-neutral-700 rounded-3xl py-6 px-6">
                  <Text className="text-white text-xl font-bold">Informações pessoais</Text>

                  <View className="flex flex-col gap-1">
                    <Text className="text-white font-bold text-lg">Nome</Text>
                    <Text className='text-neutral-100'>{username}</Text>
                  </View>

                  <View className="flex flex-col gap-1">
                    <Text className="text-white font-bold text-lg">E-mail</Text>
                    <Text className='text-neutral-100'>{user?.emailAddresses[0].emailAddress}</Text>
                  </View>
                </View>

                <View className="flex w-full flex-col gap-4 border border-neutral-700 rounded-3xl py-6 px-6">
                  <Text className="text-white text-xl font-bold">Ações da conta</Text>

                  <AnimatedButton
                    inactiveColor='transparent'
                    activeColor={neutral900}
                    variant='solid'
                    size='xl'
                    className='w-full border border-neutral-500'
                    onPress={() => setMostrarDialogConfirmacao(true)}
                  >
                    <ButtonIcon as={ListIcon} color={neutral100}></ButtonIcon>
                    <ButtonText className='text-white pl-4'>Minhas avaliações</ButtonText>
                  </AnimatedButton>

                  {hasPassword &&
                    <AnimatedButton
                      inactiveColor='transparent'
                      activeColor={neutral900}
                      variant='solid'
                      size='xl'
                      className='w-full border border-neutral-500'
                      onPress={() => {
                        router.push({ pathname: '/perfil/alterar-senha' })
                      }}
                    >
                      {user?.passwordEnabled ? (
                        <ButtonIcon as={PencilIcon} color={neutral100}></ButtonIcon>
                      ) : (
                        <ButtonIcon as={KeyRoundIcon} color={neutral100}></ButtonIcon>
                      )}
                      <ButtonText className='text-white pl-4'>
                        {user?.passwordEnabled ? 'Alterar senha' : 'Cadastrar senha'}
                      </ButtonText>
                    </AnimatedButton>
                  }

                  <SignOutButton />

                  <AnimatedButton inactiveColor={`${danger}50`} activeColor={`${danger}80`} variant='solid' size='xl' className='w-full border border-danger/75' onPress={() => setMostrarDialogConfirmacao(true)}>
                    <ButtonSpinner className={status === "pending" ? 'data-[active=true]:text-neutral-100' : 'hidden'} color='white' ></ButtonSpinner>
                    <ButtonIcon as={Trash2Icon} color={neutral100}></ButtonIcon>
                    <ButtonText className='text-white pl-4'>Excluir conta</ButtonText>
                  </AnimatedButton>

                </View>

                <DialogExcluir />
                <DialogConfirmarExcluir />

              </View>

            </View>
          </ScrollView>
        </Animated.View >

      </SignedIn >

      <SignedOut>
        <Redirect href='/(auth)/home'></Redirect>
      </SignedOut>
    </>
  )
}