import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

// Thin BFF proxy: attaches the httpOnly token + tenant cookie server-side so
// client components never handle credentials. Forwards status codes as-is.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000/api/v1";

async function proxy(request: NextRequest, path: string[]) {
  const store = await cookies();
  const joined = path.join("/");
  // Public auth endpoints must work without a session cookie (login/register).
  // The agency dropdown on the registration page also needs public access.
  // Everything else still requires the httpOnly cr_token cookie.
  const isPublicAuth = joined === "auth/login" || joined === "auth/register";
  const isPublicAgencies = request.method === "GET" && joined === "agencies";
  const isPublic = isPublicAuth || isPublicAgencies;
  const token = store.get("cr_token")?.value;
  if (!token && !isPublic) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  // For public auth, forward the caller-supplied tenant header (register form,
  // platform login sends X-Tenant: ""). Authed calls keep using the cookie.
  const tenant = isPublicAuth
    ? (request.headers.get("x-tenant") ?? store.get("cr_tenant")?.value ?? "")
    : (store.get("cr_tenant")?.value ?? "");

  const url = `${API_BASE}/${path.join("/")}${request.nextUrl.search}`;
  const body = ["GET", "HEAD"].includes(request.method)
    ? undefined
    : await request.arrayBuffer();

  const upstream = await fetch(url, {
    method: request.method,
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "X-Tenant": tenant,
      ...(body ? { "Content-Type": request.headers.get("content-type") ?? "application/json" } : {}),
    },
    body,
  });

  const data = await upstream.arrayBuffer();
  return new NextResponse(data, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
  });
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(req, (await ctx.params).path);
}
export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(req, (await ctx.params).path);
}
export async function PUT(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(req, (await ctx.params).path);
}
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(req, (await ctx.params).path);
}
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(req, (await ctx.params).path);
}
