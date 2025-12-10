import { AdminLayout } from "@/components/admin/admin-layout";
import { RedirectManager } from "@/components/admin/seo/redirect-manager";

export const dynamic = 'force-dynamic';

export default function AdminSEORedirectsPage() {
  return (
    <AdminLayout>
      <RedirectManager />
    </AdminLayout>
  );
}
