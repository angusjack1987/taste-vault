
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-extrabold uppercase tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 active:shadow-none active:translate-x-0 active:translate-y-0 rounded-xl",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "bg-background text-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        ghost: "border-0 shadow-none hover:shadow-none hover:bg-accent/10 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline border-0 shadow-none hover:shadow-none",
        clean: "bg-background border border-border shadow-sm hover:bg-accent/5 text-foreground",
        menu: "bg-transparent hover:bg-accent/10 w-full justify-start text-left font-normal border-0 shadow-none hover:shadow-none",
        // Food-themed color variants
        tomato: "bg-red-500 text-white",
        lettuce: "bg-green-500 text-white",
        cheese: "bg-yellow-400 text-black",
        bread: "bg-amber-200 text-black",
        blueberry: "bg-blue-500 text-white",
        grape: "bg-purple-500 text-white",
        orange: "bg-orange-500 text-white",
        mint: "bg-teal-400 text-white",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        xs: "h-8 rounded-md px-2.5 text-xs",
        xl: "h-12 rounded-md px-9 text-base"
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
