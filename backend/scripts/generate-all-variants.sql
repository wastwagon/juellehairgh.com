-- Generate ProductVariants from ProductAttributes for ALL products
-- Run: docker-compose exec -T postgres psql -U postgres -d juellehair < backend/scripts/generate-all-variants.sql

-- Get attribute IDs
DO $$
DECLARE
    color_attr_id UUID;
    length_attr_id UUID;
    product_record RECORD;
    color_term RECORD;
    length_term RECORD;
    variant_count INTEGER;
BEGIN
    -- Get Color attribute ID
    SELECT id INTO color_attr_id FROM product_attributes WHERE name = 'Color' LIMIT 1;
    
    -- Get Length attribute ID
    SELECT id INTO length_attr_id FROM product_attributes WHERE name = 'Length' LIMIT 1;
    
    RAISE NOTICE 'Color Attribute ID: %', color_attr_id;
    RAISE NOTICE 'Length Attribute ID: %', length_attr_id;
    
    -- Loop through all active products
    FOR product_record IN 
        SELECT id, "priceGhs", COALESCE(stock, 0) as stock, slug, title
        FROM products 
        WHERE "isActive" = true
        AND NOT EXISTS (
            SELECT 1 FROM product_variants WHERE "productId" = products.id
        )
    LOOP
        variant_count := 0;
        
        -- Create Color variants
        IF color_attr_id IS NOT NULL THEN
            FOR color_term IN 
                SELECT id, name, image 
                FROM product_attribute_terms 
                WHERE "attributeId"::text = color_attr_id::text
            LOOP
                INSERT INTO product_variants (
                    id, "productId", name, value, "priceGhs", stock, image, "createdAt", "updatedAt"
                ) VALUES (
                    gen_random_uuid(),
                    product_record.id,
                    'Color',
                    color_term.name,
                    product_record."priceGhs",
                    product_record.stock,
                    color_term.image,
                    NOW(),
                    NOW()
                ) ON CONFLICT DO NOTHING;
                
                variant_count := variant_count + 1;
            END LOOP;
        END IF;
        
        -- Create Length variants
        IF length_attr_id IS NOT NULL THEN
            FOR length_term IN 
                SELECT id, name 
                FROM product_attribute_terms 
                WHERE "attributeId"::text = length_attr_id::text
            LOOP
                INSERT INTO product_variants (
                    id, "productId", name, value, "priceGhs", stock, image, "createdAt", "updatedAt"
                ) VALUES (
                    gen_random_uuid(),
                    product_record.id,
                    'Length',
                    length_term.name,
                    product_record."priceGhs",
                    product_record.stock,
                    NULL,
                    NOW(),
                    NOW()
                ) ON CONFLICT DO NOTHING;
                
                variant_count := variant_count + 1;
            END LOOP;
        END IF;
        
        RAISE NOTICE 'Product: % - Created % variants', product_record.slug, variant_count;
    END LOOP;
    
    RAISE NOTICE 'Done!';
END $$;

-- Verify results
SELECT 
    COUNT(DISTINCT "productId") as products_with_variants,
    COUNT(*) as total_variants,
    name,
    COUNT(*) as count
FROM product_variants
GROUP BY name
ORDER BY count DESC;

