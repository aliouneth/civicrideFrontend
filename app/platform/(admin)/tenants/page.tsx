import type { Metadata } from "next";
import { TenantsList } from "./TenantsList";

export const metadata = { title: "Platform Admin — Agencies" } satisfies Metadata;

export const dynamic = "force-dynamic";

export default function AgenciesPage() {
  return <TenantsList />;
}
