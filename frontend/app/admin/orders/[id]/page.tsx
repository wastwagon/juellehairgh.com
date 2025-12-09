import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminOrderDetail } from "@/components/admin/admin-order-detail";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    id: string;
  };
}

export default function AdminOrderDetailPage({ params }: PageProps) {
  return (
    <AdminLayout>
      <AdminOrderDetail orderId={params.id} />
    </AdminLayout>
  );
}
