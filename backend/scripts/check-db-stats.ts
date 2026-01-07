import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  try {
    const productCount = await prisma.product.count();
    const activeProductCount = await prisma.product.count({ where: { isActive: true } });
    const variantCount = await prisma.productVariant.count();
    
    console.log("--- Database Stats ---");
    console.log(`Total Products: ${productCount}`);
    console.log(`Active Products: ${activeProductCount}`);
    console.log(`Total Variants: ${variantCount}`);
    
    if (productCount > 0) {
      const firstProduct = await prisma.product.findFirst();
      console.log("First Product:", JSON.stringify(firstProduct, null, 2));
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

