"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
      <div className="space-y-6 max-w-md">
        {/* Visual Element */}
        <div className="relative">
          <h1 className="text-9xl font-black text-muted-foreground/20 select-none">
            404
          </h1>
          <p className="absolute inset-0 flex items-center justify-center text-2xl font-bold tracking-tight text-foreground">
            Page not found
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Oops! Nothing here.</h2>
          <p className="text-muted-foreground">
            The page you are looking for doesn&apos;t exist or has been moved to
            another URL.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>

          <Button asChild className="w-full sm:w-auto">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
