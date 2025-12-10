import { AdminLayout } from "@/components/admin/admin-layout";
import { SeoTemplateManager } from "@/components/admin/seo/seo-template-manager";

export default function SeoTemplatesPage() {
  return (
    <AdminLayout>
      <SeoTemplateManager />
    </AdminLayout>
  );
}
