"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import type { DriverDocument } from "./types";

const DOCUMENT_TYPES = [
  { value: "license", label: "License" },
  { value: "insurance", label: "Insurance" },
  { value: "vehicle_registration", label: "Vehicle Registration" },
  { value: "background_check", label: "Background Check" },
  { value: "other", label: "Other" },
];

function documentLabel(type: string): string {
  return DOCUMENT_TYPES.find((t) => t.value === type)?.label ?? type;
}

function fileName(path: string): string {
  return path.split("/").pop() ?? path;
}

export function DocumentUpload({ driverId, documents, uploadPath, viewPath }: { driverId: number; documents: DriverDocument[]; uploadPath?: string; viewPath?: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [type, setType] = useState("license");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function upload() {
    if (!file) {
      setError("Choose a file first.");
      return;
    }
    setUploading(true);
    setError(null);
    setMessage(null);
    try {
      const form = new FormData();
      form.append("type", type);
      form.append("file", file);
      const res = await fetch(uploadPath ?? `/api/drivers/${driverId}/documents`, { method: "POST", body: form });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "Upload failed.");
      }
      setMessage(`${documentLabel(type)} uploaded.`);
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function openDocument(doc: DriverDocument) {
    try {
      const res = await fetch(viewPath ? `${viewPath}/${doc.id}` : `/api/drivers/${driverId}/documents/${doc.id}`);
      if (!res.ok) throw new Error("Could not open document.");
      const body = (await res.json()) as { url: string };
      window.open(body.url, "_blank");
    } catch {
      setError("Could not open document.");
    }
  }

  return (
    <div className="space-y-4">
      {documents.length > 0 && (
        <ul className="divide-y divide-line rounded-xl border border-line">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink-900">{documentLabel(doc.type)}</p>
                <p className="truncate text-sm text-ink-500">{fileName(doc.file_path)}</p>
              </div>
              <Button variant="ghost" className="min-h-[44px] px-3 text-sm" onClick={() => openDocument(doc)}>
                View
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[180px] flex-1">
          <Select
            label="Document type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={DOCUMENT_TYPES}
          />
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="min-h-[44px] flex-1 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-paper file:px-3 file:py-2 file:text-sm file:font-semibold"
        />
        <Button loading={uploading} disabled={!file} onClick={upload}>
          Upload Doc
        </Button>
      </div>

      {file && <p className="text-sm text-ink-500">Selected: {file.name}</p>}
      {error && <p role="alert" className="text-sm font-medium text-bad-fg">{error}</p>}
      {message && <p role="status" className="text-sm font-medium text-ok-fg">{message}</p>}
    </div>
  );
}
