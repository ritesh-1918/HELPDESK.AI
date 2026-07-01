import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Card Component
 *
 * A container component with rounded corners, border, and shadow. Used as a base
 * for displaying content in a card-like layout. Supports ref forwarding.
 *
 * @param {Object} props Component props.
 * @param {string} props.className Additional CSS classes.
 * @param {React.RefObject} ref Forwarded ref.
 * @returns {JSX.Element} A card container element.
 *
 * @example
 * <Card className="p-4">
 *   <CardHeader>
 *     <CardTitle>Title</CardTitle>
 *   </CardHeader>
 *   <CardContent>Content here</CardContent>
 * </Card>
 */
const Card = React.forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("rounded-xl border bg-card text-card-foreground shadow-sm", className)} {...props} />
))
Card.displayName = "Card"

/**
 * CardHeader Component
 *
 * The header section of a card. Typically contains the CardTitle and CardDescription.
 * Provides padding and vertical spacing for header content.
 *
 * @param {Object} props Component props.
 * @param {string} props.className Additional CSS classes.
 * @param {React.RefObject} ref Forwarded ref.
 * @returns {JSX.Element} A card header element.
 */
const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
))
CardHeader.displayName = "CardHeader"

/**
 * CardTitle Component
 *
 * The title element for a card. Renders as an h3 with large, semibold text.
 * Should be used within CardHeader.
 *
 * @param {Object} props Component props.
 * @param {string} props.className Additional CSS classes.
 * @param {React.RefObject} ref Forwarded ref.
 * @returns {JSX.Element} A card title element.
 */
const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
))
CardTitle.displayName = "CardTitle"

/**
 * CardDescription Component
 *
 * A description element for a card. Renders as a paragraph with muted text color.
 * Should be used within CardHeader below CardTitle.
 *
 * @param {Object} props Component props.
 * @param {string} props.className Additional CSS classes.
 * @param {React.RefObject} ref Forwarded ref.
 * @returns {JSX.Element} A card description element.
 */
const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
))
CardDescription.displayName = "CardDescription"

/**
 * CardContent Component
 *
 * The main content area of a card. Provides padding for content below the header.
 * Should be used after CardHeader within a Card.
 *
 * @param {Object} props Component props.
 * @param {string} props.className Additional CSS classes.
 * @param {React.RefObject} ref Forwarded ref.
 * @returns {JSX.Element} A card content element.
 */
const CardContent = React.forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

/**
 * CardFooter Component
 *
 * The footer section of a card. Typically contains action buttons or additional metadata.
 * Provides padding and flex layout for footer content.
 *
 * @param {Object} props Component props.
 * @param {string} props.className Additional CSS classes.
 * @param {React.RefObject} ref Forwarded ref.
 * @returns {JSX.Element} A card footer element.
 */
const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
