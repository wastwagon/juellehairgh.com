-- CreateTable
CREATE TABLE "banner_categories" (
    "id" TEXT NOT NULL,
    "bannerId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "banner_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "banner_categories_bannerId_idx" ON "banner_categories"("bannerId");

-- CreateIndex
CREATE INDEX "banner_categories_categoryId_idx" ON "banner_categories"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "banner_categories_bannerId_categoryId_key" ON "banner_categories"("bannerId", "categoryId");

-- AddForeignKey
ALTER TABLE "banner_categories" ADD CONSTRAINT "banner_categories_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "banners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banner_categories" ADD CONSTRAINT "banner_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

