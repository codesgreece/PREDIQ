import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { getEnv } from "@/lib/env";

export const CSRF_COOKIE = "prediq_csrf";
export const CSRF_HEADER = "x-csrf-token";

export function generateCsrfToken(): string {
  return randomBytes(24).toString("hex");
}

export function signCsrfToken(token: string): string {
  const secret = getEnv().CSRF_SECRET;
  const sig = createHmac("sha256", secret).update(token).digest("hex");
  return `${token}.${sig}`;
}

export function verifyCsrfToken(signed: string | null | undefined): boolean {
  if (!signed) return false;
  const [token, sig] = signed.split(".");
  if (!token || !sig) return false;
  const expected = createHmac("sha256", getEnv().CSRF_SECRET)
    .update(token)
    .digest("hex");
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function ensureCsrfCookie(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CSRF_COOKIE)?.value;
  if (existing && verifyCsrfToken(existing)) {
    return existing.split(".")[0]!;
  }
  const token = generateCsrfToken();
  const signed = signCsrfToken(token);
  cookieStore.set(CSRF_COOKIE, signed, {
    httpOnly: false,
    secure: getEnv().NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  return token;
}

export async function assertCsrf(request: Request): Promise<void> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(CSRF_COOKIE)?.value;
  const headerValue = request.headers.get(CSRF_HEADER);
  if (!verifyCsrfToken(cookieValue)) {
    throw new CsrfError();
  }
  const cookieToken = cookieValue!.split(".")[0]!;
  if (!headerValue || headerValue !== cookieToken) {
    throw new CsrfError();
  }
}

export class CsrfError extends Error {
  status = 403;
  constructor(message = "Invalid CSRF token") {
    super(message);
    this.name = "CsrfError";
  }
}
