import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminAnalytics } from "@/components/admin/admin-analytics";

export const dynamic = 'force-dynamic';

export default function AdminAnalyticsPage() {
  return (
    <AdminLayout>
      <AdminAnalytics />
    </AdminLayout>
  );
}
