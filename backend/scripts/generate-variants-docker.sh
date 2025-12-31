#!/bin/bash

# Generate variants from attributes using Docker exec
# This works when database is in Docker and not accessible via localhost

echo "🔄 Generating ProductVariants from ProductAttributes..."
echo ""

# Get Color attribute ID and terms
COLOR_ATTR_ID=$(docker-compose exec -T postgres psql -U postgres -d juellehair -t -c "SELECT id FROM product_attributes WHERE name = 'Color' LIMIT 1;" | tr -d ' ')
LENGTH_ATTR_ID=$(docker-compose exec -T postgres psql -U postgres -d juellehair -t -c "SELECT id FROM product_attributes WHERE name = 'Length' LIMIT 1;" | tr -d ' ')

if [ -z "$COLOR_ATTR_ID" ] && [ -z "$LENGTH_ATTR_ID" ]; then
  echo "❌ No Color or Length attributes found!"
  exit 1
fi

echo "✅ Found Color attribute: $COLOR_ATTR_ID"
echo "✅ Found Length attribute: $LENGTH_ATTR_ID"
echo ""

# Get products without variants
PRODUCTS=$(docker-compose exec -T postgres psql -U postgres -d juellehair -t -c "SELECT id FROM products WHERE \"isActive\" = true AND NOT EXISTS (SELECT 1 FROM product_variants WHERE \"productId\" = products.id);" | tr -d ' ')

PRODUCT_COUNT=$(echo "$PRODUCTS" | grep -v '^$' | wc -l | tr -d ' ')
echo "📦 Found $PRODUCT_COUNT products without variants"
echo ""

if [ "$PRODUCT_COUNT" -eq 0 ]; then
  echo "✅ All products already have variants!"
  exit 0
fi

# Generate variants for each product
CREATED=0
for PRODUCT_ID in $PRODUCTS; do
  if [ -z "$PRODUCT_ID" ]; then
    continue
  fi
  
  # Get product price and stock
  PRODUCT_DATA=$(docker-compose exec -T postgres psql -U postgres -d juellehair -t -A -F'|' -c "SELECT \"priceGhs\", COALESCE(stock, 0) FROM products WHERE id = '$PRODUCT_ID';")
  PRICE=$(echo "$PRODUCT_DATA" | cut -d'|' -f1)
  STOCK=$(echo "$PRODUCT_DATA" | cut -d'|' -f2)
  
  # Create Color variants
  if [ ! -z "$COLOR_ATTR_ID" ]; then
    COLOR_TERMS=$(docker-compose exec -T postgres psql -U postgres -d juellehair -t -A -F'|' -c "SELECT id, name, COALESCE(image, '') FROM product_attribute_terms WHERE \"attributeId\" = '$COLOR_ATTR_ID';")
    
    for TERM in $COLOR_TERMS; do
      if [ -z "$TERM" ]; then continue; fi
      TERM_ID=$(echo "$TERM" | cut -d'|' -f1)
      TERM_NAME=$(echo "$TERM" | cut -d'|' -f2)
      TERM_IMAGE=$(echo "$TERM" | cut -d'|' -f3)
      
      docker-compose exec -T postgres psql -U postgres -d juellehair -c "INSERT INTO product_variants (id, \"productId\", name, value, \"priceGhs\", stock, image) VALUES (gen_random_uuid(), '$PRODUCT_ID', 'Color', '$TERM_NAME', $PRICE, $STOCK, $(if [ -z "$TERM_IMAGE" ]; then echo 'NULL'; else echo "'$TERM_IMAGE'"; fi)) ON CONFLICT DO NOTHING;" > /dev/null 2>&1
      CREATED=$((CREATED + 1))
    done
  fi
  
  # Create Length variants
  if [ ! -z "$LENGTH_ATTR_ID" ]; then
    LENGTH_TERMS=$(docker-compose exec -T postgres psql -U postgres -d juellehair -t -A -F'|' -c "SELECT name FROM product_attribute_terms WHERE \"attributeId\" = '$LENGTH_ATTR_ID';")
    
    for TERM_NAME in $LENGTH_TERMS; do
      if [ -z "$TERM_NAME" ]; then continue; fi
      docker-compose exec -T postgres psql -U postgres -d juellehair -c "INSERT INTO product_variants (id, \"productId\", name, value, \"priceGhs\", stock, image) VALUES (gen_random_uuid(), '$PRODUCT_ID', 'Length', '$TERM_NAME', $PRICE, $STOCK, NULL) ON CONFLICT DO NOTHING;" > /dev/null 2>&1
      CREATED=$((CREATED + 1))
    done
  fi
  
  echo "✅ Created variants for product: $PRODUCT_ID"
done

echo ""
echo "✅ Created $CREATED variants total"
echo "💡 Products should now show as variable products!"

