import React from 'react'
import { Pressable, View } from 'react-native'
import { Icon } from './ui/icon'
import { UserRound } from 'lucide-react-native'
import Logo from '@/assets/logo.svg'
import { useRouter } from 'expo-router'

const Header = ({ paginaAtual, mostrarBotaoPerfil = true }: { paginaAtual?: string, mostrarBotaoPerfil?: boolean }) => {
  const router = useRouter()

  const navegarParaPerfil = () => {
    router.push({
      pathname: "/(tabs)/perfil",
      params: { from: paginaAtual }
    });
  }

  return (
    <View
      className="absolute w-full left-0 z-10 h-20 bg-black/70 border-b border-neutral-900"
    >
      <View className="flex-row items-center justify-between p-6 h-20">

        <Logo height={'100%'} preserveAspectRatio="xMinYMin meet" style={{ flex: 1 }}></Logo>
        {mostrarBotaoPerfil &&
          <Pressable
            onPress={navegarParaPerfil}
            className="p-3 rounded-full bg-neutral-900"
          >
            <Icon as={UserRound} />
          </Pressable>
        }

      </View>
    </View>
  )
}
export default Header