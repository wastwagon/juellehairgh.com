import { AdminLayout } from "@/components/admin/admin-layout";
import { BulkSeoOperations } from "@/components/admin/seo/bulk-seo-operations";

export const dynamic = 'force-dynamic';

export default function AdminSEOBulkPage() {
  return (
    <AdminLayout>
      <BulkSeoOperations />
    </AdminLayout>
  );
}
