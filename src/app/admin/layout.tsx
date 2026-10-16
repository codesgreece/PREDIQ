import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";
import { getSessionUser } from "@/lib/auth/session";

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
    <div className="flex min-h-screen bg-[#080D0C]">
      <div className="hidden md:block">
        <AdminSidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-white/5 px-4 py-3 md:hidden">
          <AdminSidebar />
        </div>
        <div className="flex-1 px-4 py-6 md:px-8">
          <p className="mb-4 text-xs text-[var(--text-muted)]">
            Signed in as {user.email}
          </p>
          {children}
        </div>
      </div>
    </div>
  );
}
