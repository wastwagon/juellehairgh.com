import { AdminLayout } from "@/components/admin/admin-layout";
import { AnalyticsEventsViewer } from "@/components/admin/analytics-events-viewer";

export default function AnalyticsEventsPage() {
  return (
    <AdminLayout>
      <AnalyticsEventsViewer />
    </AdminLayout>
  );
}
