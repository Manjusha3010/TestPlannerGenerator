import { NextResponse } from "next/server";

export function apiError(e: unknown, status = 400): NextResponse {
  const msg = e instanceof Error ? e.message : String(e);
  return NextResponse.json({ detail: msg }, { status });
}
