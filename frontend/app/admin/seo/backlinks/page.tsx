import { AdminLayout } from "@/components/admin/admin-layout";
import { BacklinksMonitor } from "@/components/admin/seo/backlinks-monitor";

export const dynamic = 'force-dynamic';

export default function AdminSEOBacklinksPage() {
  return (
    <AdminLayout>
      <BacklinksMonitor />
    </AdminLayout>
  );
}
