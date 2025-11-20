import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native";
import { CheckIcon, CircleAlertIcon, InfoIcon } from "lucide-react-native";
import { Toast, useToast } from "@/components/ui/toast";
import { danger, success, warning } from "@/constants/constants";
import { ToastPlacement } from "@gluestack-ui/core/lib/esm/toast/creator/types";

const toastIcons = {
  success: CheckIcon,
  error: CircleAlertIcon,
  warning: InfoIcon,
};

const borderColors = {
  success: success,
  error: danger,
  warning: warning,
};

export const useToastVariant = () => {
  const toast = useToast();

  const show = React.useCallback(
    (message: string, type: "success" | "error" | "warning" = "success", placement: ToastPlacement = 'bottom') => {
      const id = Math.random().toString();
      if (toast.isActive(id)) return;

      const Icon = toastIcons[type];

      toast.show({
        id,
        placement,
        duration: 3000,
        render: ({ id }) => {
          const uniqueToastId = "toast-" + id;
          return (
            <SafeAreaView
              edges={["bottom", "left", "right", 'top']}
              className=" flex"
            >
              <Toast
                nativeID={uniqueToastId}
                action={type}
                variant="outline"
                style={{
                  borderWidth: 1,
                  borderColor: borderColors[type],
                }}
                className='flex flex-row gap-4 px-6 py-4 items-center w-[95%] mx-auto'
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
                <Text className="text-white w-[90%]">{message}</Text>
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
