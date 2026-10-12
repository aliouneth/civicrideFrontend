import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

// Session bridge: login/register pages POST the Laravel-issued token here;
// we persist it in httpOnly cookies the proxy + Server Components read.
export async function POST(request: NextRequest) {
  const { token, tenant } = (await request.json()) as { token?: string; tenant?: string };
  if (!token || tenant === undefined) {
    return NextResponse.json({ message: "token is required; tenant may be empty for platform admins." }, { status: 400 });
  }
  const store = await cookies();
  const opts = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 * 7 };
  store.set("cr_token", token, opts);
  store.set("cr_tenant", tenant, opts);
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const store = await cookies();
  store.delete("cr_token");
  store.delete("cr_tenant");
  return NextResponse.json({ ok: true });
}
