import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const dynamic = 'force-dynamic';

export default function AdminPage() {
  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  );
}
