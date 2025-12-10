import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminCategories } from "@/components/admin/admin-categories";

export const dynamic = 'force-dynamic';

export default function AdminCategoriesPage() {
  return (
    <AdminLayout>
      <AdminCategories />
    </AdminLayout>
  );
}
