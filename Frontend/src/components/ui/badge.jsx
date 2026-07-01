import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-[var(--stitch-primary,#11d483)] text-white hover:bg-[var(--stitch-primary-hover,#10b973)]",
                secondary:
                    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive:
                    "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
                outline: "text-foreground",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

/**
 * Badge Component
 *
 * A small label component used to display status, categories, or metadata.
 * Supports multiple variants (default, secondary, destructive, outline) with
 * different color schemes and hover states.
 *
 * @param {Object} props Component props.
 * @param {string} props.className Additional CSS classes.
 * @param {string} props.variant Badge variant style (default, secondary, destructive, outline).
 * @returns {JSX.Element} A badge element.
 *
 * @example
 * <Badge variant="default">New</Badge>
 * @example
 * <Badge variant="destructive">Error</Badge>
 */
function Badge({ className, variant, ...props }) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

 
export { Badge, badgeVariants }
