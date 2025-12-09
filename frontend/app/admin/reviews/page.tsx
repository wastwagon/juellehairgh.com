import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminReviews } from "@/components/admin/admin-reviews";

export const dynamic = 'force-dynamic';

export default function AdminReviewsPage() {
  return (
    <AdminLayout>
      <AdminReviews />
    </AdminLayout>
  );
}
