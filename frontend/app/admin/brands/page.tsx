import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminBrands } from "@/components/admin/admin-brands";

export const dynamic = 'force-dynamic';

export default function AdminBrandsPage() {
  return (
    <AdminLayout>
      <AdminBrands />
    </AdminLayout>
  );
}
