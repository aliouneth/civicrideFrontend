"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    __DRIVER_APPROVED__: boolean;
  }
}

export function RequireApproved({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isApproved = window.__DRIVER_APPROVED__ === true;

  useEffect(() => {
    if (!isApproved) {
      router.push("/driver/account");
    }
  }, [isApproved, router]);

  if (!isApproved) {
    return null;
  }

  return <>{children}</>;
}