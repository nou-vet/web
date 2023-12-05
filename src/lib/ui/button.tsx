import { cva, type VariantProps } from 'class-variance-authority';
import { mergeProps, type JSX } from 'solid-js';
import { tw } from './tw';

const buttonVariants = cva(
  'ring-offset-background focus-visible:ring-outline inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-on-primary hover:bg-primary/90 focus-visible:ring-primary',
        destructive:
          'bg-destructive text-on-destructive hover:bg-destructive/90',
        outline:
          'border-input bg-background hover:bg-accent hover:text-on-accent border',
        secondary: 'bg-secondary text-on-secondary hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-on-accent',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        cta: 'h-16 rounded-full px-8 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

type ButtonVariants = VariantProps<typeof buttonVariants>;
interface ButtonProps
  extends JSX.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariants {}

const Button = (ownProps: ButtonProps) => {
  const props = mergeProps<[ButtonProps, ButtonProps]>(
    { type: 'button' },
    ownProps,
  );
  return (
    <button
      {...props}
      class={tw(
        buttonVariants({
          variant: props.variant,
          size: props.size,
        }),
        props.class,
      )}
    />
  );
};

interface LinkProps
  extends JSX.AnchorHTMLAttributes<HTMLAnchorElement>,
    ButtonVariants {}

export const ButtonLink = (props: LinkProps) => {
  return (
    <a
      {...props}
      class={tw(
        buttonVariants({
          variant: props.variant,
          size: props.size,
        }),
        props.class,
      )}
    />
  );
};

export { Button };
