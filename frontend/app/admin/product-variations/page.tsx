import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminProductVariations } from "@/components/admin/admin-product-variations";

export const dynamic = 'force-dynamic';

export default function AdminProductVariationsPage() {
  return (
    <AdminLayout>
      <AdminProductVariations />
    </AdminLayout>
  );
}
