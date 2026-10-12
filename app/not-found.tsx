import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg p-6 text-center">
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-ink-500">The ride or page you asked for does not exist in this agency.</p>
      <Link href="/dashboard" className="mt-4 inline-block">
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  );
}
