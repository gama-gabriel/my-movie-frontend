import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native";
import { CheckIcon, CircleAlertIcon, InfoIcon } from "lucide-react-native";
import { Toast, useToast } from "@/components/ui/toast";
import { danger, success, warning } from "@/constants/constants";

const toastColors = {
  success: "border-success/75",
  error: "border-danger/75",
  warning: "border-warning/75",
};

const toastIcons = {
  success: CheckIcon,
  error: CircleAlertIcon,
  warning: InfoIcon,
};

export const useToastVariant = () => {
  const toast = useToast();

  const show = React.useCallback(
    (message: string, type: "success" | "error" | "warning" = "success") => {
      const id = Math.random().toString();
      if (toast.isActive(id)) return;

      const Icon = toastIcons[type];
      const borderClass = toastColors[type];

      toast.show({
        id,
        placement: "bottom",
        duration: 3000,
        render: ({ id }) => {
          const uniqueToastId = "toast-" + id;
          return (
            <SafeAreaView
              edges={["bottom", "left", "right"]}
              className="pb-4 flex"
            >
              <Toast
                nativeID={uniqueToastId}
                action={type}
                variant="outline"
                className={`flex flex-row gap-4 px-6 py-4 items-center w-[95%] mx-auto ${borderClass}`}
              >
                <Icon
                  color={
                    type === "success"
                      ? success
                      : type === "error"
                      ? danger
                      : warning
                  }
                />
                <Text className="text-white w-[90%] bg-blue-500">{message}</Text>
              </Toast>
            </SafeAreaView>
          );
        },
      });
    },
    [toast]
  );

  return { show };
};
