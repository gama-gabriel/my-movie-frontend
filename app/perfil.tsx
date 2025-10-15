import SignOutButton from "@/app/components/SignOutButton";
import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from "@/components/ui/alert-dialog";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { protectedFetch } from "@/utils/Auth.utils";
import { SignedIn, SignedOut, useAuth, useUser } from "@clerk/clerk-expo";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Redirect, useRouter } from "expo-router";
import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Perfil() {

  const queryClient = useQueryClient();

  const { user } = useUser()
  const { getToken, signOut } = useAuth()

  const router = useRouter();

  const [mostrarDialogConfirmacao, setMostrarDialogConfirmacao] = React.useState(false);
  const [mostrarDialogExclusao, setMostrarDialogExclusao] = React.useState(false);

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
      await excluirMutation.mutate(user!.id);
      await signOut();
      router.replace('/(auth)/home')
    } catch (err) {
      console.error("Erro ao excluir usuário: ", err)
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
    <SafeAreaView edges={['top']} className='flex-1 items-center justify-start p-4 bg-black'>
      <SignedIn>
        <Heading className="m-0 text-4xl font-bold text-white">
          Perfil
        </Heading>
        <View className='flex-1 items-center justify-start bg-black w-full h-full gap-4'>

          <View className="w-full flex flex-col justify-start pb-4">
            <Heading className="m-0 text-2xl font-bold text-white">
              Meus dados
            </Heading>

            <View className="flex flex-col gap-4">
              <View className="flex flex-col gap-1">
                <Text className='text-white font-bold'>E-mail</Text>
                <Text className='text-white'>{user?.emailAddresses[0].emailAddress}</Text>
              </View>

              {user?.fullName &&
                <View className="flex flex-col gap-1">
                  <Text className='text-white font-bold'>Nome</Text>
                  <Text className='text-white'>{user.fullName}</Text>
                </View>
              }

            </View>
          </View>

          <SignOutButton />

          <Button variant='solid' size='xl' className='w-full bg-red-600 data-[active=true]:bg-red-800' onPress={() => setMostrarDialogConfirmacao(true)}>

            <ButtonSpinner className={status === "pending" ? 'data-[active=true]:text-neutral-100' : 'hidden'} color='white' ></ButtonSpinner>
            <ButtonText className='text-white pl-4'>Excluir conta</ButtonText>
          </Button>
          <DialogConfirmarExcluir />
          <DialogExcluir />

        </View>
      </SignedIn>

      <SignedOut>
        <Redirect href='/(auth)/home'></Redirect>
      </SignedOut>
    </SafeAreaView>
  )
}