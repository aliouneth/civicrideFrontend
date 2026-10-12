"use client";

import { useRouter } from "next/navigation";
import { Button } from "./Button";

export function LogoutButton({
  className = "",
  variant = "ghost",
}: {
  className?: string;
  variant?: "ghost" | "onBrand";
}) {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  }
  return <Button variant={variant} onClick={logout} className={className}>Log out</Button>;
}