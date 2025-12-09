-- Setup Flash Sale with 10 Products
-- Get category IDs
DO $$
DECLARE
  wigs_cat_id UUID := (SELECT id FROM categories WHERE slug = 'lace-wigs' LIMIT 1);
  braids_cat_id UUID := (SELECT id FROM categories WHERE slug = 'braids' LIMIT 1);
  clipins_cat_id UUID := (SELECT id FROM categories WHERE slug = 'clip-ins' LIMIT 1);
  haircare_cat_id UUID := (SELECT id FROM categories WHERE slug = 'wig-care' LIMIT 1);
  shopall_cat_id UUID := (SELECT id FROM categories WHERE name ILIKE '%all%' LIMIT 1);
  flash_sale_id UUID;
  product_id UUID;
BEGIN
  -- Create/Update Flash Sale
  INSERT INTO flash_sales (id, title, description, "startDate", "endDate", "discountPercent", "isActive", "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), '⚡ Christmas Mega Sale', 'Celebrate the holidays with amazing deals! Up to 30% off on selected hair products. Perfect gifts for yourself or loved ones!', NOW(), '2025-12-31 23:59:59'::TIMESTAMP, 30.00, true, NOW(), NOW())
  ON CONFLICT DO NOTHING
  RETURNING id INTO flash_sale_id;

  IF flash_sale_id IS NULL THEN
    SELECT id INTO flash_sale_id FROM flash_sales WHERE "isActive" = true LIMIT 1;
    UPDATE flash_sales SET 
      title = '⚡ Christmas Mega Sale',
      description = 'Celebrate the holidays with amazing deals! Up to 30% off on selected hair products. Perfect gifts for yourself or loved ones!',
      "endDate" = '2025-12-31 23:59:59'::TIMESTAMP,
      "discountPercent" = 30.00,
      "updatedAt" = NOW()
    WHERE id = flash_sale_id;
  END IF;

  -- Clear existing products from flash sale
  DELETE FROM flash_sale_products WHERE "flashSaleId" = flash_sale_id;

  -- Create/Update Products and add to flash sale
  -- 1. Premium Lace Front Wig - Black
  INSERT INTO products (id, title, slug, description, "categoryId", "priceGhs", "compareAtPriceGhs", sku, stock, "isActive", images, badges, "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), 'Premium Lace Front Wig - Black', 'premium-lace-front-wig-black', 'Premium quality lace front wig in black. Natural looking hairline with comfortable cap construction.', COALESCE(wigs_cat_id, shopall_cat_id), 315.00, 450.00, 'SKU-PLFW-BLK-' || EXTRACT(EPOCH FROM NOW())::BIGINT, 100, true, '{}', '{}', NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET "priceGhs" = 315.00, "compareAtPriceGhs" = 450.00, "updatedAt" = NOW()
  RETURNING id INTO product_id;
  INSERT INTO flash_sale_products ("flashSaleId", "productId", "createdAt") VALUES (flash_sale_id, product_id, NOW()) ON CONFLICT DO NOTHING;

  -- 2. Zury Sis Crochet Braid
  INSERT INTO products (id, title, slug, description, "categoryId", "priceGhs", "compareAtPriceGhs", sku, stock, "isActive", images, badges, "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), 'Zury Sis Crochet Braid - V11 Boho CURLY 12/13/14 inch', 'zury-sis-crochet-braid-v11-boho-curly', 'Beautiful boho curly crochet braid hair in 12/13/14 inch lengths. Perfect for protective styling.', COALESCE(braids_cat_id, shopall_cat_id), 315.00, 450.00, 'SKU-ZURY-' || EXTRACT(EPOCH FROM NOW())::BIGINT, 100, true, '{}', '{}', NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET "priceGhs" = 315.00, "compareAtPriceGhs" = 450.00, "updatedAt" = NOW()
  RETURNING id INTO product_id;
  INSERT INTO flash_sale_products ("flashSaleId", "productId", "createdAt") VALUES (flash_sale_id, product_id, NOW()) ON CONFLICT DO NOTHING;

  -- 3. African Pride Braid Sheen Spray
  INSERT INTO products (id, title, slug, description, "categoryId", "priceGhs", "compareAtPriceGhs", sku, stock, "isActive", images, badges, "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), 'African Pride Braid Sheen Spray 12oz', 'african-pride-braid-sheen-spray-12oz', 'Keep your braids looking fresh and shiny with this nourishing braid sheen spray. Rosemary & mint formula.', COALESCE(haircare_cat_id, shopall_cat_id), 136.50, 195.00, 'SKU-AP-BSS-' || EXTRACT(EPOCH FROM NOW())::BIGINT, 100, true, '{}', '{}', NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET "priceGhs" = 136.50, "compareAtPriceGhs" = 195.00, "updatedAt" = NOW()
  RETURNING id INTO product_id;
  INSERT INTO flash_sale_products ("flashSaleId", "productId", "createdAt") VALUES (flash_sale_id, product_id, NOW()) ON CONFLICT DO NOTHING;

  -- 4. Outre X-Pression LiL Looks 3X Crochet Braid
  INSERT INTO products (id, title, slug, description, "categoryId", "priceGhs", "compareAtPriceGhs", sku, stock, "isActive", images, badges, "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), 'Outre X-Pression LiL Looks 3X Crochet Braid - SPRINGY AFR...', 'outre-xpression-lil-looks-3x-crochet-braid', 'Springy afro-textured crochet braid hair. Easy to install and style. Natural looking texture.', COALESCE(braids_cat_id, shopall_cat_id), 525.00, 750.00, 'SKU-OUTRE-' || EXTRACT(EPOCH FROM NOW())::BIGINT, 100, true, '{}', '{}', NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET "priceGhs" = 525.00, "compareAtPriceGhs" = 750.00, "updatedAt" = NOW()
  RETURNING id INTO product_id;
  INSERT INTO flash_sale_products ("flashSaleId", "productId", "createdAt") VALUES (flash_sale_id, product_id, NOW()) ON CONFLICT DO NOTHING;

  -- 5. Outre Human Hair Blend Big Beautiful Hair Clip In 9
  INSERT INTO products (id, title, slug, description, "categoryId", "priceGhs", "compareAtPriceGhs", sku, stock, "isActive", images, badges, "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), 'Outre Human Hair Blend Big Beautiful Hair Clip In 9 - 4A...', 'outre-human-hair-blend-clip-in-9', 'Human hair blend clip-in extensions in 4A texture. Instant volume and length. Easy to apply.', COALESCE(clipins_cat_id, shopall_cat_id), 455.00, 650.00, 'SKU-OUTRE-CLIP-' || EXTRACT(EPOCH FROM NOW())::BIGINT, 100, true, '{}', '{}', NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET "priceGhs" = 455.00, "compareAtPriceGhs" = 650.00, "updatedAt" = NOW()
  RETURNING id INTO product_id;
  INSERT INTO flash_sale_products ("flashSaleId", "productId", "createdAt") VALUES (flash_sale_id, product_id, NOW()) ON CONFLICT DO NOTHING;

  -- 6. Mane Concept Mega Brazilian Human Hair Blend Braids
  INSERT INTO products (id, title, slug, description, "categoryId", "priceGhs", "compareAtPriceGhs", sku, stock, "isActive", images, badges, "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), 'Mane Concept Mega Brazilian Human Hair Blend Braids -...', 'mane-concept-mega-brazilian-braids', 'Premium Brazilian human hair blend braids. Full density for a natural, voluminous look.', COALESCE(braids_cat_id, shopall_cat_id), 840.00, 1200.00, 'SKU-MANE-' || EXTRACT(EPOCH FROM NOW())::BIGINT, 100, true, '{}', '{}', NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET "priceGhs" = 840.00, "compareAtPriceGhs" = 1200.00, "updatedAt" = NOW()
  RETURNING id INTO product_id;
  INSERT INTO flash_sale_products ("flashSaleId", "productId", "createdAt") VALUES (flash_sale_id, product_id, NOW()) ON CONFLICT DO NOTHING;

  -- 7. Vivica A Fox 100% Brazilian Human Hair Blend Drawstring
  INSERT INTO products (id, title, slug, description, "categoryId", "priceGhs", "compareAtPriceGhs", sku, stock, "isActive", images, badges, "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), 'Vivica A Fox 100% Brazilian Human Hair Blend Drawstring...', 'vivica-a-fox-brazilian-hair-blend-drawstring', 'Luxurious Brazilian human hair blend drawstring ponytail. Easy to install and style.', COALESCE(wigs_cat_id, shopall_cat_id), 350.00, 500.00, 'SKU-VIVICA-' || EXTRACT(EPOCH FROM NOW())::BIGINT, 100, true, '{}', '{}', NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET "priceGhs" = 350.00, "compareAtPriceGhs" = 500.00, "updatedAt" = NOW()
  RETURNING id INTO product_id;
  INSERT INTO flash_sale_products ("flashSaleId", "productId", "createdAt") VALUES (flash_sale_id, product_id, NOW()) ON CONFLICT DO NOTHING;

  -- 8. Sensationnel Curls Kinks Textured Glueless HD 13x6
  INSERT INTO products (id, title, slug, description, "categoryId", "priceGhs", "compareAtPriceGhs", sku, stock, "isActive", images, badges, "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), 'Sensationnel Curls Kinks Textured Glueless HD 13x6...', 'sensationnel-curls-kinks-textured-glueless-hd', 'Glueless HD lace wig with curls and kinks texture. Natural looking hairline. 13x6 lace part.', COALESCE(wigs_cat_id, shopall_cat_id), 840.00, 1200.00, 'SKU-SENS-' || EXTRACT(EPOCH FROM NOW())::BIGINT, 100, true, '{}', '{}', NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET "priceGhs" = 840.00, "compareAtPriceGhs" = 1200.00, "updatedAt" = NOW()
  RETURNING id INTO product_id;
  INSERT INTO flash_sale_products ("flashSaleId", "productId", "createdAt") VALUES (flash_sale_id, product_id, NOW()) ON CONFLICT DO NOTHING;

  -- 9. Wild Growth Never Before Now Growth Hair Oil
  INSERT INTO products (id, title, slug, description, "categoryId", "priceGhs", "compareAtPriceGhs", sku, stock, "isActive", images, badges, "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), 'NEW! Wild Growth "Never Before Now Growth" Hair Oil ...', 'wild-growth-never-before-now-growth-hair-oil', 'Revolutionary hair growth oil formula. Promotes healthy hair growth and strengthens hair follicles.', COALESCE(haircare_cat_id, shopall_cat_id), 129.50, 185.00, 'SKU-WG-' || EXTRACT(EPOCH FROM NOW())::BIGINT, 100, true, '{}', '{}', NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET "priceGhs" = 129.50, "compareAtPriceGhs" = 185.00, "updatedAt" = NOW()
  RETURNING id INTO product_id;
  INSERT INTO flash_sale_products ("flashSaleId", "productId", "createdAt") VALUES (flash_sale_id, product_id, NOW()) ON CONFLICT DO NOTHING;

  -- 10. Sensationnel OCEAN WAVE 30 inches BUTTA Human Hair
  INSERT INTO products (id, title, slug, description, "categoryId", "priceGhs", "compareAtPriceGhs", sku, stock, "isActive", images, badges, "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), 'Sensationnel OCEAN WAVE 30 inches BUTTA Human Hair...', 'sensationnel-ocean-wave-30-inches-butta', 'Beautiful ocean wave texture in 30 inches. Butta human hair blend for a silky, natural look.', COALESCE(braids_cat_id, shopall_cat_id), 350.00, 500.00, 'SKU-SENS-OW-' || EXTRACT(EPOCH FROM NOW())::BIGINT, 100, true, '{}', '{}', NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET "priceGhs" = 350.00, "compareAtPriceGhs" = 500.00, "updatedAt" = NOW()
  RETURNING id INTO product_id;
  INSERT INTO flash_sale_products ("flashSaleId", "productId", "createdAt") VALUES (flash_sale_id, product_id, NOW()) ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Flash Sale created/updated with 10 products!';
END $$;
