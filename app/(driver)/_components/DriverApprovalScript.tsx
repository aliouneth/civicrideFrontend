"use client";

export function DriverApprovalScript({ isApproved }: { isApproved: boolean }) {
  if (typeof window !== "undefined") {
    window.__DRIVER_APPROVED__ = isApproved;
  }
  return null;
}