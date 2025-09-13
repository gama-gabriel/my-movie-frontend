'use client';
import { createInput } from '@gluestack-ui/core/input/creator';
import {
  tva,
  useStyleContext,
  withStyleContext,
} from '@gluestack-ui/utils/nativewind-utils';
import React from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { PrimitiveIcon, UIIcon } from '@gluestack-ui/core/icon/creator';
import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';
import { cssInterop } from 'nativewind';

const SCOPE = 'INPUT';

const UIInput = createInput({
  Root: withStyleContext(View, SCOPE),
  Icon: UIIcon,
  Slot: Pressable,
  Input: TextInput,
});

cssInterop(PrimitiveIcon, {
  className: {
    target: 'style',
    nativeStyleToProp: {
      height: true,
      width: true,
      fill: true,
      color: 'classNameColor',
      stroke: true,
    },
  },
});

const inputStyle = tva({
  base: 'border-secondary-light flex-row overflow-hidden rounded-full content-center data-[hover=true]:border-outline-400 data-[focus=true]:border-primary data-[focus=true]:hover:border-primary data-[disabled=true]:opacity-40 data-[disabled=true]:hover:border-neutral-500 items-center autofill:bg-transparent',

  variants: {
    size: {
      xl: 'h-auto',
      lg: 'h-auto',
      md: 'h-auto',
      sm: 'h-auto',
    },

    variant: {
      underlined:
        'rounded-full border-b data-[invalid=true]:border-red-400 data-[invalid=true]:data-[focus=true]:border-red-500',

      outline:
        'rounded-full border data-[invalid=true]:border-red-400 data-[invalid=true]:data-[focus=true]:border-red-500',

      rounded:
        'rounded-full border data-[invalid=true]:border-red-400 data-[invalid=true]:data-[focus=true]:border-red-500',
    },
  },
});

const inputIconStyle = tva({
  base: 'justify-center items-center text-typography-400 fill-none',
  parentVariants: {
    size: {
      '2xs': 'h-3 w-3',
      'xs': 'h-3.5 w-3.5',
      'sm': 'h-4 w-4',
      'md': 'h-[18px] w-[18px]',
      'lg': 'h-5 w-5',
      'xl': 'h-6 w-6',
    },
  },
});

const inputSlotStyle = tva({
  base: 'justify-center items-center web:disabled:cursor-not-allowed',
});

const inputFieldStyle = tva({
  base: 'flex-1 py-3 px-6 text-white placeholder:text-neutral-500 h-auto ios:leading-[0px] web:cursor-text web:data-[disabled=true]:cursor-not-allowed',

  parentVariants: {
    variant: {
      underlined: 'web:outline-0 web:outline-none px-0',
      outline: 'web:outline-0 web:outline-none',
      rounded: 'web:outline-0 web:outline-none px-4',
    },

    size: {
      '2xs': 'text-base',
      'xs': 'text-base',
      'sm': 'text-base',
      'md': 'text-base',
      'lg': 'text-base',
      'xl': 'text-base',
      '2xl': 'text-base',
      '3xl': 'text-base',
      '4xl': 'text-base',
      '5xl': 'text-base',
      '6xl': 'text-base',
    },
  },
});

type IInputProps = React.ComponentProps<typeof UIInput> &
  VariantProps<typeof inputStyle> & { className?: string };
const Input = React.forwardRef<React.ComponentRef<typeof UIInput>, IInputProps>(
  function Input(
    { className, variant = 'outline', size = 'md', ...props },
    ref
  ) {
    return (
      <UIInput
        ref={ref}
        {...props}
        className={inputStyle({ variant, size, class: className })}
        context={{ variant, size }}
      />
    );
  }
);

type IInputIconProps = React.ComponentProps<typeof UIInput.Icon> &
  VariantProps<typeof inputIconStyle> & {
    className?: string;
    height?: number;
    width?: number;
  };

const InputIcon = React.forwardRef<
  React.ComponentRef<typeof UIInput.Icon>,
  IInputIconProps
>(function InputIcon({ className, size, ...props }, ref) {
  const { size: parentSize } = useStyleContext(SCOPE);

  if (typeof size === 'number') {
    return (
      <UIInput.Icon
        ref={ref}
        {...props}
        className={inputIconStyle({ class: className })}
        size={size}
      />
    );
  } else if (
    (props.height !== undefined || props.width !== undefined) &&
    size === undefined
  ) {
    return (
      <UIInput.Icon
        ref={ref}
        {...props}
        className={inputIconStyle({ class: className })}
      />
    );
  }
  return (
    <UIInput.Icon
      ref={ref}
      {...props}
      className={inputIconStyle({
        parentVariants: {
          size: parentSize,
        },
        class: className,
      })}
    />
  );
});

type IInputSlotProps = React.ComponentProps<typeof UIInput.Slot> &
  VariantProps<typeof inputSlotStyle> & { className?: string };

const InputSlot = React.forwardRef<
  React.ComponentRef<typeof UIInput.Slot>,
  IInputSlotProps
>(function InputSlot({ className, ...props }, ref) {
  return (
    <UIInput.Slot
      ref={ref}
      {...props}
      className={inputSlotStyle({
        class: className,
      })}
    />
  );
});

type IInputFieldProps = React.ComponentProps<typeof UIInput.Input> &
  VariantProps<typeof inputFieldStyle> & { className?: string };

const InputField = React.forwardRef<
  React.ComponentRef<typeof UIInput.Input>,
  IInputFieldProps
>(function InputField({ className, ...props }, ref) {
  const { variant: parentVariant, size: parentSize } = useStyleContext(SCOPE);

  return (
    <UIInput.Input
      ref={ref}
      {...props}
      className={inputFieldStyle({
        parentVariants: {
          variant: parentVariant,
          size: parentSize,
        },
        class: className,
      })}
    />
  );
});

Input.displayName = 'Input';
InputIcon.displayName = 'InputIcon';
InputSlot.displayName = 'InputSlot';
InputField.displayName = 'InputField';

export { Input, InputField, InputIcon, InputSlot };

