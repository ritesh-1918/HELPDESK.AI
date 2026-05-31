import React from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react"

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        console.error("[ErrorBoundary] Caught error:", error, errorInfo)
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null })
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }
            return (
                <div className="flex min-h-[400px] w-full items-center justify-center p-6">
                    <div className="flex flex-col items-center gap-4 text-center max-w-md">
                        <div className="rounded-full bg-destructive/10 p-4">
                            <AlertTriangleIcon className="h-8 w-8 text-destructive" />
                        </div>
                        <h2 className="text-xl font-semibold">Something went wrong</h2>
                        <p className="text-sm text-muted-foreground">
                            {this.props.message || "An unexpected error occurred. Please try again."}
                        </p>
                        <Button onClick={this.handleReset} variant="outline" className="gap-2">
                            <RefreshCwIcon className="h-4 w-4" />
                            Try Again
                        </Button>
                    </div>
                </div>
            )
        }
        return this.props.children
    }
}

export { ErrorBoundary }
