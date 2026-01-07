import { AdminLayout } from "@/components/admin/admin-layout";
import { ProductFormPage } from "@/components/admin/product-form-page";

export default function EditProductPage({ params }: { params: { id: string } }) {
  return (
    <AdminLayout>
      <ProductFormPage productId={params.id} />
    </AdminLayout>
  );
}

