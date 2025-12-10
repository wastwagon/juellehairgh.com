import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminAttributes } from "@/components/admin/admin-attributes";

export const dynamic = 'force-dynamic';

export default function AdminAttributesPage() {
  return (
    <AdminLayout>
      <AdminAttributes />
    </AdminLayout>
  );
}
