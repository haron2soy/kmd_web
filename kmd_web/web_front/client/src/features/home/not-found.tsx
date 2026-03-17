import { Card, CardContent } from "@/shared/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 text-center">
          
          <div className="flex items-center justify-center mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">
              404 Page Not Found
            </h1>
          </div>

          <p className="mt-2 text-sm text-gray-600">
            The page you are looking for does not exist or may have been moved.
          </p>

          {/* 👇 ACTION BUTTON */}
          <Link href="/">
            <button className="mt-6 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition">
              Go to Home
            </button>
          </Link>

        </CardContent>
      </Card>
    </div>
  );
}