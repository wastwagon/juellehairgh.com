"use client";

import { AdminLayout } from "@/components/admin/admin-layout";
import { EmailTemplatesManager } from "@/components/admin/email-templates-manager";

export const dynamic = 'force-dynamic';

export default function EmailTemplatesPage() {
  return (
    <AdminLayout>
      <EmailTemplatesManager />
    </AdminLayout>
  );
}

