import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";
import { getSessionUser } from "@/lib/auth/session";
import { el } from "@/lib/i18n/el";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="admin-shell flex">
      <div className="sticky top-0 hidden h-screen md:block">
        <AdminSidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-[var(--border)] px-3 py-2.5 md:hidden">
          <AdminSidebar compact />
        </div>
        <div className="flex-1 px-3 py-4 md:px-5 md:py-5">
          <p className="mb-3 text-xs text-[var(--text-muted)]">
            {el.admin.signedInAs} {user.email}
          </p>
          {children}
        </div>
      </div>
    </div>
  );
}
