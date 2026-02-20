import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminHeroBanner } from "@/components/admin/admin-hero-banner";

export const dynamic = "force-dynamic";

export default function AdminHeroBannerPage() {
  return (
    <AdminLayout>
      <AdminHeroBanner />
    </AdminLayout>
  );
}
