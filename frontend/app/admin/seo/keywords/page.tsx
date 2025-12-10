import { AdminLayout } from "@/components/admin/admin-layout";
import { KeywordRankTracker } from "@/components/admin/seo/keyword-rank-tracker";

export const dynamic = 'force-dynamic';

export default function AdminSEOKeywordsPage() {
  return (
    <AdminLayout>
      <KeywordRankTracker />
    </AdminLayout>
  );
}
