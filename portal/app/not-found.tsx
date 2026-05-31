import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4">
          <FileQuestion className="text-slate-300" size={56} />
        </div>
        <h1 className="text-5xl font-extrabold text-slate-200 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-slate-700 mb-2">Page not found</h2>
        <p className="text-slate-500 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild variant="outline">
            <Link href="/portal">Client Portal</Link>
          </Button>
          <Button asChild>
            <Link href="/admin">Admin Dashboard</Link>
          </Button>
        </div>
        <p className="mt-8 text-xs text-slate-400">BluuHQ</p>
      </div>
    </div>
  );
}
