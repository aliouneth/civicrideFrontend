"use client";

import { createContext, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";

// Approval is known server-side (driver layout reads the profile). It flows
// down through context so the gate below works during server rendering —
// a `window` global cannot, and would also depend on sibling render order.
const DriverApprovalContext = createContext<boolean>(false);

export function DriverApprovalProvider({
  isApproved,
  children,
}: {
  isApproved: boolean;
  children: React.ReactNode;
}) {
  return <DriverApprovalContext.Provider value={isApproved}>{children}</DriverApprovalContext.Provider>;
}

export function RequireApproved({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isApproved = useContext(DriverApprovalContext);

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
