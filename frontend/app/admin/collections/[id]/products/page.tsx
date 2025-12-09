import { AdminLayout } from "@/components/admin/admin-layout";
import { CollectionProductsManager } from "@/components/admin/collection-products-manager";

export default function CollectionProductsPage({ params }: { params: { id: string } }) {
  return (
    <AdminLayout>
      <CollectionProductsManager collectionId={params.id} />
    </AdminLayout>
  );
}
