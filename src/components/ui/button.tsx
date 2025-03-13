
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:-translate-y-[2px] active:translate-y-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow hover:shadow-vibrant",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow hover:shadow-md",
        outline:
          "border-2 border-input bg-background hover:bg-accent/20 hover:text-accent-foreground shadow-sm hover:shadow",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow hover:shadow-vibrant",
        ghost: "hover:bg-accent/10 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        fun: "bg-gradient-to-r from-sunshine-400 via-sunshine-500 to-sunshine-600 text-charcoal-800 shadow-sm hover:shadow-vibrant hover:opacity-90",
        mint: "bg-seafoam-500 text-white hover:bg-seafoam-400 shadow-sm hover:shadow-vibrant",
        ocean: "bg-ocean-500 text-white hover:bg-ocean-400 shadow-sm hover:shadow-vibrant",
        berry: "bg-berry-500 text-white hover:bg-berry-400 shadow-sm hover:shadow-vibrant",
        sunshine: "bg-sunshine-500 text-charcoal-800 hover:bg-sunshine-400 shadow-sm hover:shadow-vibrant",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
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
