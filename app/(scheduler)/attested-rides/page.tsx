import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AttestedRidesClient } from "./_components/AttestedRidesClient";

// Server wrapper: the client table renders "today" and the attested
// timestamps on the user's clock, handed down from the session cookie.
export default async function AttestedRidesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return <AttestedRidesClient timeZone={session.timezone} />;
}
