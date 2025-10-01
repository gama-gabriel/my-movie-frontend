import { useUser } from "@clerk/clerk-expo";
import { UserResource } from "@clerk/types";
import { useQuery } from "@tanstack/react-query";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Loading = () => (
  <SafeAreaView edges={['top']} className="flex-1 justify-center items-center bg-black">
    <View className="flex flex-col justify-center items-center gap-2">
      <ActivityIndicator size="large" color="#df9eff" className="bg-black" />
      <Text className="text-white">Validando usuário</Text>
    </View>
  </SafeAreaView>
)

const postCheckUser = async (id: string) => {
  console.log("chamou")
  const response = await fetch('https://mymovie-nhhq.onrender.com/user/check_user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id: id }),
  });

  console.log(response)
  if (!response.ok) throw Error('Network response was not ok');
  const data = await response.json();
  console.warn(data)
  return data;
}

const createUser = async (user: UserResource) => {
  const response = await fetch('https://mymovie-nhhq.onrender.com/user/new_user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ clerk_id: user.id, email: user.emailAddresses[0].emailAddress, name: user.firstName + " " + user.lastName, password: "password" }),
  });

  console.log(response)
  if (!response.ok) throw Error('Network response was not ok');
  const data = await response.json();
  console.warn(data)
  return data;
}

export default function Onboarding() {
  const { user } = useUser()
  const [idToCheck, setIdToCheck] = useState<string | null>(null)

  const { data: userExists, isLoading, error } = useQuery({
    queryKey: ['check-user-existence', idToCheck],
    queryFn: () => postCheckUser(idToCheck!), 
    enabled: !!idToCheck, 
    retry: false,
  })

  const { data: createdUser, error: errorCreatingUser, isLoading: isCreatingUser } = useQuery({
    queryKey: ['createUser', userExists],
    queryFn: () => createUser(user!), 
    enabled: !userExists?.exists, 
    retry: false,
  })

  useEffect(() => {
    if (user) {
      console.log(user.id)
      setIdToCheck(user.id)
    }
  }, [user, idToCheck])

  if (error || errorCreatingUser) {
    if (error) {
      console.error("Error checking user existence:", error);
    }
    if (errorCreatingUser) {
      console.error("Error creating user:", errorCreatingUser);
    }
    console.error("Error:", error || errorCreatingUser);
    console.log("returning on error")
    return <Loading />
  }

  if (isLoading || isCreatingUser) {
    console.log("returning on loading")
    return <Loading />
  }

  if (userExists?.exists) {
    return <Redirect href="/(home)" />
  }

  if (!userExists?.exists && createdUser) {
    console.log("User created successfully, redirecting to onboarding");
    return <Redirect href="/(auth)/home" />
  }

  if (!userExists?.exists) {
    console.log("User does not exist, creating user...");
    return <Loading/>
  }

  return null;
}