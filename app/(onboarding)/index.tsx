import { useUser } from "@clerk/clerk-expo";
import { UserResource } from "@clerk/types";
import { useMutation } from "@tanstack/react-query";
import { Redirect, useLocalSearchParams } from "expo-router";
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

const createUser = async (user: UserResource, username: string | undefined) => {
  const createdName = username ? username : user.fullName
  const response = await fetch('https://mymovie-nhhq.onrender.com/user/new_user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      clerk_id: user.id, 
      email: user.emailAddresses[0].emailAddress, 
      name: createdName
    }),
  });
  console.log(response)
  if (!response.ok) throw Error('Network response was not ok');
  const data = await response.json();
  console.warn(data)
  await user.reload()
  return data;
}

export default function Onboarding() {
  const { user } = useUser()
  const { username } = useLocalSearchParams<{ username?: string }>();
  const [shouldRedirectToHome, setShouldRedirectToHome] = useState(false);
  const [shouldRedirectToInfo, setShouldRedirectToInfo] = useState(false);
  
  const checkUserMutation = useMutation({
    mutationFn: (id: string) => postCheckUser(id),
    onSuccess: (data) => {
      console.log("User check result:", data);
      if (data.exists) {
        setShouldRedirectToHome(true);
      } else {
        if (user) {
          createUserMutation.mutate({ user, username });
        }
      }
    },
    onError: (error) => {
      console.error("Error checking user existence:", error);
    }
  });

  const createUserMutation = useMutation({
    mutationFn: ({ user, username }: { user: UserResource; username: string | undefined }) => 
      createUser(user, username),
    onSuccess: (data) => {
      console.log("User created successfully:", data);
      setShouldRedirectToInfo(true);
    },
    onError: (error) => {
      console.error("Error creating user:", error);
    }
  });

  useEffect(() => {
    if (user && !checkUserMutation.data && !checkUserMutation.isPending) {
      console.log("Checking user:", user.id);
      checkUserMutation.mutate(user.id);
    }
  }, [user, checkUserMutation]);

  if (checkUserMutation.isPending || createUserMutation.isPending) {
    console.log("Loading...");
    return <Loading />
  }

  if (checkUserMutation.isError || createUserMutation.isError) {
    console.error("Error:", checkUserMutation.error || createUserMutation.error);
    return <Loading />
  }

  if (shouldRedirectToHome) {
    return <Redirect href="/(tabs)/home" />
  }

  if (shouldRedirectToInfo) {
    return <Redirect href="/(tabs)/informacoes" />
  }

  return <Loading />;
}