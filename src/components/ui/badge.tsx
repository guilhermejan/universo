import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap [&_svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-transparent bg-universo-black text-white",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border text-foreground",
        success: "border-transparent bg-status-valido/10 text-status-valido",
        info: "border-transparent bg-status-a-conferir/10 text-status-a-conferir",
        warning: "border-transparent bg-status-a-vencer/10 text-status-a-vencer",
        destructive: "border-transparent bg-status-vencido/10 text-status-vencido",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
