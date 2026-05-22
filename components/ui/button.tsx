import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-product text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virgin-purple focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_[data-icon]]:size-4 [&_[data-icon]]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-virgin-purple text-white hover:bg-virgin-indigo",
        destructive: "bg-virgin-red text-white hover:bg-red-700",
        outline: "border border-neutral-300 bg-white text-neutral-950 hover:bg-neutral-100",
        secondary: "bg-neutral-100 text-neutral-950 hover:bg-neutral-200",
        ghost: "text-neutral-800 hover:bg-neutral-100",
        link: "text-virgin-purple underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-5",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  ),
);
Button.displayName = "Button";

export { Button, buttonVariants };
