import { getSessionUser } from "@/lib/auth/session";
import { ensureCsrfCookie } from "@/lib/auth/csrf";
import { jsonOk } from "@/lib/api";

export async function GET() {
  const [user, csrfToken] = await Promise.all([
    getSessionUser(),
    ensureCsrfCookie(),
  ]);
  return jsonOk({ user, csrfToken });
}
