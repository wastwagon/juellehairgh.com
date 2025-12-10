import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminDiscountCodes } from "@/components/admin/admin-discount-codes";

export const dynamic = 'force-dynamic';

export default function AdminDiscountCodesPage() {
  return (
    <AdminLayout>
      <AdminDiscountCodes />
    </AdminLayout>
  );
}
