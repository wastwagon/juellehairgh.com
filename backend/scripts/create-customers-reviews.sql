-- Create Customers and Reviews from Images
-- Note: Using bcrypt hash for password "Customer123!" = $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

DO $$
DECLARE
  user_id UUID;
  product_id UUID;
  review_id UUID;
  default_password TEXT := '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
BEGIN
  -- 1. Ama Serwaa
  INSERT INTO users (id, email, password, name, phone, role, "emailVerified", "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), 'ama.serwaa@example.com', default_password, 'Ama Serwaa', '+233241234567', 'CUSTOMER', true, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET name = 'Ama Serwaa', "updatedAt" = NOW()
  RETURNING id INTO user_id;
  
  SELECT id INTO product_id FROM products WHERE "isActive" = true AND (LOWER(title) LIKE '%braid%' OR LOWER(description) LIKE '%braid%') LIMIT 1;
  IF product_id IS NULL THEN SELECT id INTO product_id FROM products WHERE "isActive" = true LIMIT 1; END IF;
  
  INSERT INTO reviews (id, "userId", "productId", rating, title, comment, "isVerified", "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), user_id, product_id, 5, 'Perfect for box braids!', 'This braiding hair is excellent quality! It''s soft, doesn''t tangle, and looks very natural. I''ve used it for box braids multiple times and they always come out perfect. The hair holds well and doesn''t shed. Great value for money. The consistency is excellent. I''ll definitely be ordering more!', true, NOW(), NOW())
  ON CONFLICT DO NOTHING;

  -- 2. Esi Boateng
  INSERT INTO users (id, email, password, name, phone, role, "emailVerified", "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), 'esi.boateng@example.com', default_password, 'Esi Boateng', '+233241234568', 'CUSTOMER', true, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET name = 'Esi Boateng', "updatedAt" = NOW()
  RETURNING id INTO user_id;
  
  SELECT id INTO product_id FROM products WHERE "isActive" = true AND (LOWER(title) LIKE '%crochet%' OR LOWER(description) LIKE '%crochet%') LIMIT 1;
  IF product_id IS NULL THEN SELECT id INTO product_id FROM products WHERE "isActive" = true LIMIT 1; END IF;
  
  INSERT INTO reviews (id, "userId", "productId", rating, title, comment, "isVerified", "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), user_id, product_id, 5, 'Saves so much time!', 'These pre-looped crochet braids are a game changer! Installation was super quick and they look amazing. The texture is perfect and they''ve held up really well. My protective style looks professional. The quality is excellent and they''re easy to maintain. Will definitely order again for my next protective style!', true, NOW(), NOW())
  ON CONFLICT DO NOTHING;

  -- 3. Akosua Osei (first review)
  INSERT INTO users (id, email, password, name, phone, role, "emailVerified", "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), 'akosua.osei@example.com', default_password, 'Akosua Osei', '+233241234569', 'CUSTOMER', true, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET name = 'Akosua Osei', "updatedAt" = NOW()
  RETURNING id INTO user_id;
  
  SELECT id INTO product_id FROM products WHERE "isActive" = true AND (LOWER(title) LIKE '%lace%' OR LOWER(title) LIKE '%wig%' OR LOWER(description) LIKE '%lace%wig%') LIMIT 1;
  IF product_id IS NULL THEN SELECT id INTO product_id FROM products WHERE "isActive" = true LIMIT 1; END IF;
  
  INSERT INTO reviews (id, "userId", "productId", rating, title, comment, "isVerified", "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), user_id, product_id, 5, 'Absolutely stunning quality!', 'This HD lace front wig is incredible! The lace is so transparent and undetectable. The hair quality is premium and it''s very comfortable to wear all day. I''ve worn it multiple times and it still looks brand new. The color matches perfectly and it''s easy to style. Highly recommend to anyone looking for a quality wig!', true, NOW(), NOW())
  ON CONFLICT DO NOTHING;

  -- 4. Akosua Osei (second review)
  SELECT id INTO user_id FROM users WHERE email = 'akosua.osei@example.com';
  SELECT id INTO product_id FROM products WHERE "isActive" = true AND (LOWER(title) LIKE '%braid%' OR LOWER(description) LIKE '%braid%') LIMIT 1;
  IF product_id IS NULL THEN SELECT id INTO product_id FROM products WHERE "isActive" = true LIMIT 1; END IF;
  
  INSERT INTO reviews (id, "userId", "productId", rating, title, comment, "isVerified", "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), user_id, product_id, 5, 'Best braiding hair I''ve tried!', 'This braiding hair is top quality! It''s soft, doesn''t tangle, and looks very natural. I''ve used it for various protective styles and it always comes out perfect. The hair holds well and doesn''t shed. Excellent value for money. The quality is consistent throughout. Highly recommend!', true, NOW(), NOW())
  ON CONFLICT DO NOTHING;

  -- 5. Akua Danso
  INSERT INTO users (id, email, password, name, phone, role, "emailVerified", "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), 'akua.danso@example.com', default_password, 'Akua Danso', '+233241234570', 'CUSTOMER', true, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET name = 'Akua Danso', "updatedAt" = NOW()
  RETURNING id INTO user_id;
  
  SELECT id INTO product_id FROM products WHERE "isActive" = true AND (LOWER(title) LIKE '%ponytail%' OR LOWER(description) LIKE '%ponytail%') LIMIT 1;
  IF product_id IS NULL THEN SELECT id INTO product_id FROM products WHERE "isActive" = true LIMIT 1; END IF;
  
  INSERT INTO reviews (id, "userId", "productId", rating, title, comment, "isVerified", "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), user_id, product_id, 5, 'Perfect ponytail extension!', 'This ponytail extension is gorgeous! The quality is excellent and it looks very natural. Easy to attach and stays secure. The hair is soft and manageable. I''ve received so many compliments. Perfect for quick styling when I need to look put together fast. Will definitely order more in different colors!', true, NOW(), NOW())
  ON CONFLICT DO NOTHING;

  -- 6. Efua Asante
  INSERT INTO users (id, email, password, name, phone, role, "emailVerified", "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), 'efua.asante@example.com', default_password, 'Efua Asante', '+233241234571', 'CUSTOMER', true, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET name = 'Efua Asante', "updatedAt" = NOW()
  RETURNING id INTO user_id;
  
  SELECT id INTO product_id FROM products WHERE "isActive" = true AND (LOWER(title) LIKE '%spray%' OR LOWER(title) LIKE '%sheen%' OR LOWER(description) LIKE '%spray%') LIMIT 1;
  IF product_id IS NULL THEN SELECT id INTO product_id FROM products WHERE "isActive" = true LIMIT 1; END IF;
  
  INSERT INTO reviews (id, "userId", "productId", rating, title, comment, "isVerified", "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), user_id, product_id, 5, 'Keeps my braids looking fresh!', 'This spray is a game changer! It keeps my braids shiny and moisturized without making them greasy. The scent is pleasant and it doesn''t leave any residue. My braids look brand new even after weeks of wear. I use it daily and it''s become an essential part of my hair care routine. Highly recommend for anyone with braids or extensions!', true, NOW(), NOW())
  ON CONFLICT DO NOTHING;

  -- 7. Adjoa Kwarteng
  INSERT INTO users (id, email, password, name, phone, role, "emailVerified", "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), 'adjoa.kwarteng@example.com', default_password, 'Adjoa Kwarteng', '+233241234572', 'CUSTOMER', true, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET name = 'Adjoa Kwarteng', "updatedAt" = NOW()
  RETURNING id INTO user_id;
  
  SELECT id INTO product_id FROM products WHERE "isActive" = true AND (LOWER(title) LIKE '%crochet%' OR LOWER(description) LIKE '%crochet%') LIMIT 1;
  IF product_id IS NULL THEN SELECT id INTO product_id FROM products WHERE "isActive" = true LIMIT 1; END IF;
  
  INSERT INTO reviews (id, "userId", "productId", rating, title, comment, "isVerified", "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), user_id, product_id, 5, 'Perfect for protective styling!', 'These crochet braids are amazing! They installed easily, look very natural, and have held up well over the past 2 months. The texture is perfect and they''re not too heavy. My natural hair is thriving underneath. The quality is excellent for the price and they''re easy to maintain. Will definitely order again in different colors!', true, NOW(), NOW())
  ON CONFLICT DO NOTHING;

  -- 8. Abena Owusu
  INSERT INTO users (id, email, password, name, phone, role, "emailVerified", "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), 'abena.owusu@example.com', default_password, 'Abena Owusu', '+233241234573', 'CUSTOMER', true, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET name = 'Abena Owusu', "updatedAt" = NOW()
  RETURNING id INTO user_id;
  
  SELECT id INTO product_id FROM products WHERE "isActive" = true AND (LOWER(title) LIKE '%lace%' OR LOWER(title) LIKE '%wig%' OR LOWER(description) LIKE '%lace%wig%') LIMIT 1;
  IF product_id IS NULL THEN SELECT id INTO product_id FROM products WHERE "isActive" = true LIMIT 1; END IF;
  
  INSERT INTO reviews (id, "userId", "productId", rating, title, comment, "isVerified", "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), user_id, product_id, 5, 'Absolutely love this wig!', 'I''ve been wearing this lace front wig for 3 months now and it still looks amazing. The quality is excellent, very natural looking, and easy to style. The lace is undetectable and the hair feels soft and manageable. The color matches perfectly and it''s comfortable to wear all day. Shipping was fast and the customer service was excellent. Highly recommend to anyone looking for a quality wig!', true, NOW(), NOW())
  ON CONFLICT DO NOTHING;

  -- 9. Maame Adjei
  INSERT INTO users (id, email, password, name, phone, role, "emailVerified", "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), 'maame.adjei@example.com', default_password, 'Maame Adjei', '+233241234574', 'CUSTOMER', true, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET name = 'Maame Adjei', "updatedAt" = NOW()
  RETURNING id INTO user_id;
  
  SELECT id INTO product_id FROM products WHERE "isActive" = true AND (LOWER(title) LIKE '%half%' OR LOWER(title) LIKE '%wig%' OR LOWER(title) LIKE '%clip%' OR LOWER(description) LIKE '%half%wig%') LIMIT 1;
  IF product_id IS NULL THEN SELECT id INTO product_id FROM products WHERE "isActive" = true LIMIT 1; END IF;
  
  INSERT INTO reviews (id, "userId", "productId", rating, title, comment, "isVerified", "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), user_id, product_id, 5, 'Perfect for quick styling!', 'This half wig is perfect for when I need a quick style! It blends seamlessly with my natural hair and looks very natural. The quality is great and it''s easy to install. I use it all the time for quick looks. The clips are secure and comfortable. Love how versatile it is!', true, NOW(), NOW())
  ON CONFLICT DO NOTHING;

  -- 10. Serwaa Asare
  INSERT INTO users (id, email, password, name, phone, role, "emailVerified", "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), 'serwaa.asare@example.com', default_password, 'Serwaa Asare', '+233241234575', 'CUSTOMER', true, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET name = 'Serwaa Asare', "updatedAt" = NOW()
  RETURNING id INTO user_id;
  
  SELECT id INTO product_id FROM products WHERE "isActive" = true AND (LOWER(title) LIKE '%glueless%' OR LOWER(description) LIKE '%glueless%') LIMIT 1;
  IF product_id IS NULL THEN SELECT id INTO product_id FROM products WHERE "isActive" = true LIMIT 1; END IF;
  
  INSERT INTO reviews (id, "userId", "productId", rating, title, comment, "isVerified", "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), user_id, product_id, 5, 'Most comfortable wig ever!', 'This glueless wig is so comfortable! I can wear it all day without any irritation. The quality is excellent and it looks very natural. The cap construction is perfect. I''ve received so many compliments. The hair quality is premium. Highly recommend to anyone looking for comfort and style!', true, NOW(), NOW())
  ON CONFLICT DO NOTHING;

  -- 11. Gilbert
  INSERT INTO users (id, email, password, name, phone, role, "emailVerified", "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), 'gilbert@example.com', default_password, 'Gilbert', '+233241234576', 'CUSTOMER', true, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET name = 'Gilbert', "updatedAt" = NOW()
  RETURNING id INTO user_id;
  
  SELECT id INTO product_id FROM products WHERE "isActive" = true AND (LOWER(title) LIKE '%crochet%' OR LOWER(title) LIKE '%pre-fluffed%' OR LOWER(description) LIKE '%crochet%') LIMIT 1;
  IF product_id IS NULL THEN SELECT id INTO product_id FROM products WHERE "isActive" = true LIMIT 1; END IF;
  
  INSERT INTO reviews (id, "userId", "productId", rating, title, comment, "isVerified", "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), user_id, product_id, 5, 'Love the texture!', 'These pre-fluffed crochet braids are fantastic! The texture is exactly what I wanted and they saved me so much time. The quality is great and they''ve lasted well. Easy to install and maintain. My protective style looks professional and natural. Will order more colors for variety!', true, NOW(), NOW())
  ON CONFLICT DO NOTHING;

  -- 12. Kukua Asare
  INSERT INTO users (id, email, password, name, phone, role, "emailVerified", "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), 'kukua.asare@example.com', default_password, 'Kukua Asare', '+233241234577', 'CUSTOMER', true, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET name = 'Kukua Asare', "updatedAt" = NOW()
  RETURNING id INTO user_id;
  
  SELECT id INTO product_id FROM products WHERE "isActive" = true AND (LOWER(title) LIKE '%serum%' OR LOWER(title) LIKE '%frizz%' OR LOWER(description) LIKE '%serum%' OR LOWER(description) LIKE '%frizz%') LIMIT 1;
  IF product_id IS NULL THEN SELECT id INTO product_id FROM products WHERE "isActive" = true LIMIT 1; END IF;
  
  INSERT INTO reviews (id, "userId", "productId", rating, title, comment, "isVerified", "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), user_id, product_id, 5, 'Keeps my hair smooth all day!', 'This anti-frizz serum is amazing! It keeps my hair smooth and shiny without making it greasy. The formula is lightweight and doesn''t weigh my hair down. My hair looks great even in humid weather. I use it daily and it''s become essential. Love how it makes my hair manageable and frizz-free!', true, NOW(), NOW())
  ON CONFLICT DO NOTHING;

  -- Ensure Deborah D. user exists
  INSERT INTO users (id, email, password, name, phone, role, "emailVerified", "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), 'deborah@example.com', default_password, 'Deborah D.', '+233241234578', 'CUSTOMER', true, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET name = 'Deborah D.', "updatedAt" = NOW();

  RAISE NOTICE 'Customers and reviews created successfully!';
END $$;

