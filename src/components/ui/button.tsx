
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-extrabold uppercase tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border-2 border-black",
  {
    variants: {
      variant: {
        default: "bg-[#FFA6F6] hover:bg-[#fa8cef] active:bg-[#f774ea]",
        destructive: "bg-red-500 text-destructive-foreground",
        outline: "bg-background text-foreground hover:bg-accent/10",
        secondary: "bg-[#A6FAFF] hover:bg-[#79F7FF] active:bg-[#53f2fc]",
        ghost: "border-0 shadow-none hover:shadow-none hover:bg-accent/10 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline border-0 shadow-none hover:shadow-none",
        clean: "bg-background border border-border shadow-sm hover:bg-accent/5 text-foreground",
        menu: "bg-transparent hover:bg-accent/10 w-full justify-start text-left font-normal border-0 shadow-none hover:shadow-none",
        // Food-themed color variants
        add: "bg-[#FFA6F6] hover:bg-[#fa8cef] active:bg-[#f774ea]",
        edit: "bg-[#A6FAFF] hover:bg-[#79F7FF] active:bg-[#53f2fc]",
        settings: "bg-[#B8FF9F] hover:bg-[#9dfc7c] active:bg-[#7df752]",
        // New food-themed variants
        tomato: "bg-[#FF6B6B] hover:bg-[#FF5252] active:bg-[#FF3838]",
        lettuce: "bg-[#BADC58] hover:bg-[#A6C44A] active:bg-[#96B83C]",
        cheese: "bg-[#FFDA6B] hover:bg-[#FFD152] active:bg-[#FFC838]",
        bread: "bg-[#E1C699] hover:bg-[#D4B784] active:bg-[#C7A770]",
        blueberry: "bg-[#A29BFE] hover:bg-[#8C84FE] active:bg-[#766DFE]",
      },
      shape: {
        square: "",
        rounded: "rounded-md",
        circle: "rounded-full",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-xl px-3",
        lg: "h-11 rounded-xl px-8",
        icon: "h-10 w-10",
        xs: "h-8 rounded-xl px-2.5 text-xs",
        xl: "h-12 rounded-xl px-9 text-base"
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "rounded",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, shape, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, shape, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
