import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from "@/components/ui/empty";
import { HomeIcon, CompassIcon } from "lucide-react";
import { Link } from "react-router-dom";

export function NotFound() {
    return (
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background">
            <Empty>
                <EmptyHeader>
                    <EmptyTitle className="mask-b-from-20% mask-b-to-80% font-extrabold text-9xl">
                        404
                    </EmptyTitle>
                    <EmptyDescription className="-mt-8 text-nowrap text-foreground/80">
                        The page you're looking for might have been <br />
                        moved or doesn't exist.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <div className="flex gap-2">
                        <Button asChild>
                            <Link to="/">
                                <HomeIcon
                                    className="size-4 mr-2" data-icon="inline-start" />
                                Go Home
                            </Link>
                        </Button>

                        <Button asChild variant="outline">
                            <Link to="/contact">
                                <CompassIcon
                                    className="size-4 mr-2"
                                    data-icon="inline-start" />{" "}
                                Contact Support
                            </Link>
                        </Button>
                    </div>
                </EmptyContent>
            </Empty>
        </div>
    );
}
