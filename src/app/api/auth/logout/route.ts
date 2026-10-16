import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  destroySession,
  getSessionUser,
} from "@/lib/auth/session";
import { assertCsrf } from "@/lib/auth/csrf";
import { writeAuditLog } from "@/lib/audit";
import { handleApiError, jsonOk } from "@/lib/api";

export async function POST(request: Request) {
  try {
    await assertCsrf(request);
    const user = await getSessionUser();
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (token) await destroySession(token);
    if (user) {
      await writeAuditLog({
        actorId: user.id,
        action: "LOGOUT",
        entityType: "AdminUser",
        entityId: user.id,
        summary: "Administrator logged out",
      });
    }
    const response = jsonOk({ ok: true });
    response.cookies.set(SESSION_COOKIE, "", {
      httpOnly: true,
      path: "/",
      expires: new Date(0),
    });
    return response;
  } catch (err) {
    return handleApiError(err);
  }
}
