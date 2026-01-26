"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Error boundaries for the root layout must be their own HTML document
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Global Error:", error);
    }, [error]);

    return (
        <html lang="en">
            <body>
                <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="p-4 bg-red-50 rounded-full">
                                <AlertCircle className="h-12 w-12 text-red-500" />
                            </div>
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Something went wrong!
                        </h1>

                        <p className="text-gray-600 mb-6">
                            We encountered a critical error. Our team has been notified.
                            Please try refreshing the page.
                        </p>

                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={() => reset()}
                                className="w-full bg-black hover:bg-gray-800 text-white"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Try Again
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => window.location.href = "/"}
                                className="w-full"
                            >
                                Go to Homepage
                            </Button>
                        </div>

                        {/* Show error digest for debugging if available */}
                        {error.digest && (
                            <p className="mt-8 text-xs text-gray-400 font-mono">
                                Error ID: {error.digest}
                            </p>
                        )}
                    </div>
                </div>
            </body>
        </html>
    );
}
