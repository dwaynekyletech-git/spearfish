import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 uppercase tracking-wider",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:translate-y-[-2px] hover:shadow-[0_0_30px_rgba(255,191,0,0.5)] rounded-none border-2 border-primary",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-none",
        outline: "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground hover:translate-y-[-2px] rounded-none",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-2 border-border rounded-none",
        ghost: "hover:bg-accent/10 hover:text-accent rounded-none",
        link: "text-primary underline-offset-4 hover:underline",
        glow: "bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] text-primary-foreground hover:shadow-[0_0_40px_rgba(255,191,0,0.6)] hover:scale-105 rounded-none border-2 border-primary",
      },
      size: {
        default: "h-12 px-8 py-3",
        sm: "h-10 px-6",
        lg: "h-16 px-12 text-lg",
        icon: "h-12 w-12",
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
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
