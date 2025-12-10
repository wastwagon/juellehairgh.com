import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminBanners } from "@/components/admin/admin-banners";

export const dynamic = 'force-dynamic';

export default function AdminBannersPage() {
  return (
    <AdminLayout>
      <AdminBanners />
    </AdminLayout>
  );
}
