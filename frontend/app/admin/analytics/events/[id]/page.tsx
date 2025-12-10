import { AdminLayout } from "@/components/admin/admin-layout";
import { AnalyticsEventDetail } from "@/components/admin/analytics-event-detail";

export default function AnalyticsEventDetailPage({ params }: { params: { id: string } }) {
  return (
    <AdminLayout>
      <AnalyticsEventDetail eventId={params.id} />
    </AdminLayout>
  );
}
