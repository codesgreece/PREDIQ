import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getSessionUser } from "@/lib/auth/session";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  return (
    <div className="min-h-screen">
      <SiteHeader isAdmin={Boolean(user)} />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
