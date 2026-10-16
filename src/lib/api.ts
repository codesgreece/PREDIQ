import { NextResponse } from "next/server";
import { AuthError } from "@/lib/auth/session";
import { CsrfError } from "@/lib/auth/csrf";
import { ZodError } from "zod";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, { status: 200, ...init });
}

export function jsonError(message: string, status = 400, extra?: object) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function handleApiError(err: unknown) {
  if (err instanceof AuthError) return jsonError(err.message, err.status);
  if (err instanceof CsrfError) return jsonError(err.message, err.status);
  if (err instanceof ZodError) {
    return jsonError("Validation failed", 400, {
      issues: err.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    });
  }
  if (err instanceof Error) {
    return jsonError(err.message, 400);
  }
  return jsonError("Unexpected error", 500);
}
