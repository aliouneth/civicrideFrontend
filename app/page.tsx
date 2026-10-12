import { redirect } from "next/navigation";
import { getCurrentUser, roleHome } from "@/lib/auth";

// Root entry: drivers land in the mobile shell, everyone else on the board.
export default async function Home() {
  const user = await getCurrentUser();
  redirect(user ? roleHome(user.role.name) : "/login");
}
