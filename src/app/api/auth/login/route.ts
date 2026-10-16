import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import {
  SESSION_COOKIE,
  createSession,
  sessionCookieOptions,
} from "@/lib/auth/session";
import { assertCsrf, ensureCsrfCookie } from "@/lib/auth/csrf";
import { loginSchema } from "@/lib/validations/auth";
import { rateLimit } from "@/lib/rate-limit";
import { writeAuditLog } from "@/lib/audit";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";

export async function GET() {
  const token = await ensureCsrfCookie();
  return jsonOk({ csrfToken: token });
}

export async function POST(request: Request) {
  try {
    await assertCsrf(request);
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const limited = rateLimit({
      key: `login:${ip}`,
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });
    if (!limited.ok) {
      return jsonError("Too many login attempts", 429, {
        retryAfterSec: limited.retryAfterSec,
      });
    }

    const body = loginSchema.parse(await request.json());
    const user = await prisma.adminUser.findUnique({
      where: { email: body.email.toLowerCase() },
    });
    if (!user || !user.isActive) {
      return jsonError("Invalid credentials", 401);
    }
    const valid = await verifyPassword(body.password, user.passwordHash);
    if (!valid) return jsonError("Invalid credentials", 401);

    const { token, expiresAt } = await createSession({
      userId: user.id,
      ipAddress: ip,
      userAgent: request.headers.get("user-agent"),
    });

    await prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    await writeAuditLog({
      actorId: user.id,
      action: "LOGIN",
      entityType: "AdminUser",
      entityId: user.id,
      summary: "Administrator logged in",
      ipAddress: ip,
    });

    const response = NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, name: user.name },
    });
    response.cookies.set(
      SESSION_COOKIE,
      token,
      sessionCookieOptions(expiresAt),
    );
    return response;
  } catch (err) {
    return handleApiError(err);
  }
}
