import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminCurrencyRates } from "@/components/admin/admin-currency-rates";

export const dynamic = 'force-dynamic';

export default function AdminCurrencyPage() {
  return (
    <AdminLayout>
      <AdminCurrencyRates />
    </AdminLayout>
  );
}
