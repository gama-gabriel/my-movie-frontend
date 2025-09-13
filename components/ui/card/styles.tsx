import { isWeb, tva } from '@gluestack-ui/utils/nativewind-utils';

const baseStyle = isWeb ? 'flex flex-col relative z-0' : '';

export const cardStyle = tva({
  base: baseStyle,
  variants: {
    size: {
      sm: 'p-3 rounded',
      md: 'p-4 rounded-md',
      lg: 'p-6 rounded-xl',
    },
    variant: {
      elevated: 'bg-neutral-900/70',
      outline: 'border border-neutral-500 ',
      ghost: 'rounded-none',
      filled: 'bg-neutral-900 border border-neutral-700',
    },
  },
});
