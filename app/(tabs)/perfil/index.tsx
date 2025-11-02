import SignOutButton from "@/app/components/SignOutButton";
import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from "@/components/ui/alert-dialog";
import { Button, ButtonIcon, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { useToastVariant } from "@/hooks/useToastVariant";
import { protectedFetch } from "@/utils/Auth.utils";
import { SignedIn, SignedOut, useAuth, useUser } from "@clerk/clerk-expo";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Redirect, useRouter } from "expo-router";
import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Image } from 'expo-image';
import { AnimatedButton } from "../../components/AnimatedButton";
import { danger, neutral100, neutral900 } from "@/constants/constants";
import { KeyRoundIcon, ListIcon, PencilIcon, Trash2Icon } from "lucide-react-native";

export default function Perfil() {

  const queryClient = useQueryClient();
  const toast = useToastVariant()
  const { user } = useUser()
  const { getToken, signOut } = useAuth()

  const router = useRouter();

  const [mostrarDialogConfirmacao, setMostrarDialogConfirmacao] = React.useState(false);
  const [mostrarDialogExclusao, setMostrarDialogExclusao] = React.useState(false);

  const hasPassword = user?.passwordEnabled;

  const handleClose = () => setMostrarDialogConfirmacao(false);
  const handleCloseExclusao = () => setMostrarDialogExclusao(false);

  const openDialogExclusao = () => {
    setMostrarDialogConfirmacao(false);
    setMostrarDialogExclusao(true);
  }

  const excluirUsuarioFn = async (id: string) => {
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
    },
  });

  const excluirConta = async () => {
    setMostrarDialogExclusao(false);
    try {
      excluirMutation.mutate(user!.id);
      await signOut();
      router.replace('/(auth)/home')
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

        <AlertDialogContent>
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
            <Button
              variant="outline"
              action="secondary"
              onPress={handleClose}
              size="md"
            >
              <ButtonText>Cancelar</ButtonText>
            </Button>

            <Button size="md" onPress={openDialogExclusao} className="bg-red-600 data-[active=true]:bg-red-800">
              <ButtonText>Excluir</ButtonText>
            </Button>
          </AlertDialogFooter>

        </AlertDialogContent>
      </AlertDialog>
    )
  }

  const DialogExcluir = () => {
    return (
      <AlertDialog isOpen={mostrarDialogExclusao} onClose={handleCloseExclusao} size="md">
        <AlertDialogBackdrop />

        <AlertDialogContent>
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
            <Button
              variant="outline"
              action="secondary"
              onPress={handleCloseExclusao}
              size="md"
            >
              <ButtonText>Cancelar</ButtonText>
            </Button>

            <Button size="md" onPress={excluirConta} className="bg-red-600 data-[active=true]:bg-red-800">
              <ButtonText>Excluir minha conta</ButtonText>
            </Button>
          </AlertDialogFooter>

        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <>
      <SignedIn>
        <View className="flex flex-1 pt-20 px-4">
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
                    <Text className="text-white font-bold text-lg">{user?.fullName}</Text>
                    <Text className='text-neutral-100'>{user?.emailAddresses[0].emailAddress}</Text>
                  </View>

                </View>

                <View className="flex w-full flex-col gap-4 border border-neutral-700 rounded-3xl py-6 px-6">
                  <Text className="text-white text-xl font-bold">Informações pessoais</Text>

                  <View className="flex flex-col gap-1">
                    <Text className="text-white font-bold text-lg">Nome</Text>
                    <Text className='text-neutral-100'>{user?.fullName}</Text>
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
        </View >

      </SignedIn >

      <SignedOut>
        <Redirect href='/(auth)/home'></Redirect>
      </SignedOut>
    </>
  )
}