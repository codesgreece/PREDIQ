import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { generateCsrfToken, signCsrfToken } from "@/lib/auth/csrf";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/admin");
  const csrfToken = generateCsrfToken();
  const csrfSigned = signCsrfToken(csrfToken);
  return <LoginForm csrfToken={csrfToken} csrfSigned={csrfSigned} />;
}
