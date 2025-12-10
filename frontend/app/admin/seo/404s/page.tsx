import { AdminLayout } from "@/components/admin/admin-layout";
import { Error404Monitor } from "@/components/admin/seo/error-404-monitor";

export const dynamic = 'force-dynamic';

export default function AdminSEO404sPage() {
  return (
    <AdminLayout>
      <Error404Monitor />
    </AdminLayout>
  );
}
