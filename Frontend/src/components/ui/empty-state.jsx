import * as React from "react"
import { cn } from "@/lib/utils"

function EmptyState({
    icon,
    title,
    description,
    action,
    className,
    ...props
}) {
    return (
        <div
            data-slot="empty-state"
            className={cn(
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border-dashed p-6 text-center text-balance md:p-12",
                className
            )}
            {...props}
        >
            {icon && (
                <div className="flex shrink-0 items-center justify-center mb-2 text-muted-foreground">
                    {icon}
                </div>
            )}
            <div className="flex max-w-sm flex-col items-center gap-2 text-center">
                {title && (
                    <h3 className="text-lg font-medium tracking-tight">{title}</h3>
                )}
                {description && (
                    <p className="text-muted-foreground text-sm/relaxed">{description}</p>
                )}
            </div>
            {action && (
                <div className="flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance">
                    {action}
                </div>
            )}
        </div>
    )
}

export { EmptyState }
