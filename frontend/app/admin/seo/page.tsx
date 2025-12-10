import { AdminLayout } from "@/components/admin/admin-layout";
import { SeoDashboard } from "@/components/admin/seo/seo-dashboard";

export const dynamic = 'force-dynamic';

export default function AdminSEOPage() {
  return (
    <AdminLayout>
      <SeoDashboard />
    </AdminLayout>
  );
}
