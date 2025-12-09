"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var blogPosts, _i, blogPosts_1, postData, existing, now, endDate, flashSale, allProducts, currentProductIds_1, availableProducts, targetCount, needed, productsToAdd, flashSaleProducts, updatedCount, _a, flashSaleProducts_1, flashSaleProduct, product, currentPrice, originalPrice, discount, salePrice, finalFlashSale;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("🚀 Creating homepage content from screenshots...\n");
                    // ============================================
                    // 1. CREATE BLOG POSTS
                    // ============================================
                    console.log("📝 Creating blog posts...");
                    blogPosts = [
                        {
                            title: "How to Care for Your Lace Wig: A Complete Guide",
                            slug: "how-to-care-for-your-lace-wig-complete-guide",
                            excerpt: "Learn the essential tips and tricks to maintain your lace wig and keep it looking fresh and natural for longer.",
                            content: "\n# How to Care for Your Lace Wig: A Complete Guide\n\nTaking care of your lace wig is essential to maintain its beauty and longevity. Here are some essential tips and tricks to keep your lace wig looking fresh and natural for longer.\n\n## Washing Your Lace Wig\n\n1. **Use the Right Products**: Always use sulfate-free shampoos and conditioners specifically designed for synthetic or human hair wigs.\n2. **Gentle Washing**: Wash your wig in cool water, gently massaging the shampoo through the hair strands.\n3. **Condition Properly**: Apply conditioner from mid-shaft to ends, avoiding the roots and lace.\n\n## Styling Tips\n\n- Use low heat settings when styling\n- Avoid excessive brushing\n- Store your wig on a wig stand when not in use\n- Protect from direct sunlight and heat\n\n## Maintenance\n\nRegular maintenance will extend the life of your lace wig significantly. Follow these guidelines for best results.\n      ",
                            category: "Hair Care Tips",
                            tags: ["wig care", "maintenance", "tips"],
                            isPublished: true,
                            publishedAt: new Date("2025-12-06"),
                            authorName: "Juelle Hair Team",
                        },
                        {
                            title: "5 Protective Styles Using Braiding Hair",
                            slug: "5-protective-styles-using-braiding-hair",
                            excerpt: "Discover five beautiful protective hairstyles you can create with braiding hair to protect your natural hair while looking fabulous.",
                            content: "\n# 5 Protective Styles Using Braiding Hair\n\nProtective hairstyles are essential for maintaining healthy natural hair. Here are five beautiful styles you can create with braiding hair.\n\n## 1. Box Braids\n\nClassic and timeless, box braids offer excellent protection and versatility.\n\n## 2. Cornrows\n\nPerfect for a sleek, low-maintenance look that protects your edges.\n\n## 3. Twists\n\nGentle on your hair while providing a beautiful, natural look.\n\n## 4. Crochet Braids\n\nQuick installation with endless styling possibilities.\n\n## 5. Faux Locs\n\nAchieve the loc look without the long-term commitment.\n\nEach of these styles offers unique benefits for protecting your natural hair while keeping you looking fabulous!\n      ",
                            category: "Styling Tips",
                            tags: ["protective styles", "braiding", "hairstyles"],
                            isPublished: true,
                            publishedAt: new Date("2025-12-04"),
                            authorName: "Juelle Hair Team",
                        },
                        {
                            title: "Choosing the Right Hair Color: A Complete Guide",
                            slug: "choosing-right-hair-color-complete-guide",
                            excerpt: "Not sure which hair color to choose? Our comprehensive guide will help you find the perfect shade to match your skin tone and style.",
                            content: "\n# Choosing the Right Hair Color: A Complete Guide\n\nFinding the perfect hair color can be overwhelming with so many options available. Our comprehensive guide will help you find the perfect shade to match your skin tone and style.\n\n## Understanding Your Skin Tone\n\n### Warm Undertones\n- Look for golden, honey, or caramel tones\n- Avoid ashy or cool colors\n\n### Cool Undertones\n- Opt for ash, platinum, or cool brown shades\n- Avoid warm, golden tones\n\n### Neutral Undertones\n- You can pull off both warm and cool tones\n- Experiment with different shades\n\n## Color Selection Tips\n\n1. **Consider Your Lifestyle**: Choose colors that match your daily routine\n2. **Maintenance Level**: Some colors require more upkeep than others\n3. **Seasonal Changes**: Consider how colors look in different lighting\n4. **Professional Setting**: Ensure your color choice is appropriate for your workplace\n\n## Popular Color Options\n\n- **Natural Black**: Classic and timeless\n- **Brown Shades**: Versatile and low-maintenance\n- **Highlights**: Add dimension without full commitment\n- **Bold Colors**: Express your personality with vibrant shades\n\nWith this guide, you'll be able to choose the perfect hair color that complements your skin tone and reflects your personal style!\n      ",
                            category: "Buying Guide",
                            tags: ["hair color", "styling", "guide"],
                            isPublished: true,
                            publishedAt: new Date("2025-12-01"),
                            authorName: "Juelle Hair Team",
                            // Note: Featured image would need to be uploaded separately
                        },
                        {
                            title: "Why Choose Glueless Lace Wigs?",
                            slug: "why-choose-glueless-lace-wigs",
                            excerpt: "Discover the benefits of glueless lace wigs and why they're becoming the preferred choice for wig wearers everywhere.",
                            content: "\n# Why Choose Glueless Lace Wigs?\n\nGlueless lace wigs are revolutionizing the wig industry, offering convenience and comfort like never before. Discover why they're becoming the preferred choice for wig wearers everywhere.\n\n## Benefits of Glueless Lace Wigs\n\n### 1. Easy Application\n- No messy adhesives required\n- Quick installation process\n- Perfect for beginners\n\n### 2. Comfortable Wear\n- Breathable construction\n- Lightweight design\n- No irritation from adhesives\n\n### 3. Versatile Styling\n- Can be styled in multiple ways\n- Easy to remove and reapply\n- Perfect for daily wear\n\n### 4. Hair Protection\n- Protects your natural hair\n- Allows for easy maintenance\n- Reduces damage from styling\n\n## Who Should Consider Glueless Wigs?\n\n- First-time wig wearers\n- Those with sensitive skin\n- People who want quick style changes\n- Anyone looking for low-maintenance options\n\nGlueless lace wigs offer the perfect combination of style, comfort, and convenience. Experience the difference today!\n      ",
                            category: "Product Guide",
                            tags: ["glueless wigs", "lace wigs", "benefits"],
                            isPublished: true,
                            publishedAt: new Date("2025-11-29"),
                            authorName: "Juelle Hair Team",
                        },
                    ];
                    _i = 0, blogPosts_1 = blogPosts;
                    _b.label = 1;
                case 1:
                    if (!(_i < blogPosts_1.length)) return [3 /*break*/, 7];
                    postData = blogPosts_1[_i];
                    return [4 /*yield*/, prisma.blogPost.findUnique({
                            where: { slug: postData.slug },
                        })];
                case 2:
                    existing = _b.sent();
                    if (!existing) return [3 /*break*/, 4];
                    console.log("  \u26A0\uFE0F  Blog post \"".concat(postData.title, "\" already exists, updating..."));
                    return [4 /*yield*/, prisma.blogPost.update({
                            where: { id: existing.id },
                            data: {
                                title: postData.title,
                                excerpt: postData.excerpt,
                                content: postData.content,
                                category: postData.category,
                                tags: postData.tags,
                                isPublished: postData.isPublished,
                                publishedAt: postData.publishedAt,
                                authorName: postData.authorName,
                            },
                        })];
                case 3:
                    _b.sent();
                    console.log("  \u2705 Updated: ".concat(postData.title));
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, prisma.blogPost.create({
                        data: postData,
                    })];
                case 5:
                    _b.sent();
                    console.log("  \u2705 Created: ".concat(postData.title));
                    _b.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 1];
                case 7:
                    console.log("\n✅ Blog posts created/updated successfully!\n");
                    // ============================================
                    // 2. CREATE/UPDATE CHRISTMAS MEGA SALE
                    // ============================================
                    console.log("🎄 Creating/updating Christmas Mega Sale...");
                    now = new Date();
                    endDate = new Date("2025-12-31T23:59:59Z");
                    return [4 /*yield*/, prisma.flashSale.findFirst({
                            where: { isActive: true },
                            include: {
                                products: true,
                            },
                        })];
                case 8:
                    flashSale = _b.sent();
                    if (!flashSale) return [3 /*break*/, 10];
                    console.log("  \uD83D\uDCCB Found existing flash sale: \"".concat(flashSale.title, "\""));
                    console.log("  \uD83D\uDD04 Updating to Christmas Mega Sale...");
                    return [4 /*yield*/, prisma.flashSale.update({
                            where: { id: flashSale.id },
                            data: {
                                title: "⚡ Christmas Mega Sale",
                                description: "Celebrate the holidays with amazing deals! Up to 30% off on selected hair products. Perfect gifts for yourself or loved ones!",
                                startDate: now,
                                endDate: endDate,
                                discountPercent: 30.0,
                                isActive: true,
                            },
                        })];
                case 9:
                    _b.sent();
                    console.log("  \u2705 Updated flash sale");
                    return [3 /*break*/, 12];
                case 10:
                    console.log("  \u2795 Creating new flash sale...");
                    return [4 /*yield*/, prisma.flashSale.create({
                            data: {
                                title: "⚡ Christmas Mega Sale",
                                description: "Celebrate the holidays with amazing deals! Up to 30% off on selected hair products. Perfect gifts for yourself or loved ones!",
                                startDate: now,
                                endDate: endDate,
                                discountPercent: 30.0,
                                isActive: true,
                            },
                            include: {
                                products: true,
                            },
                        })];
                case 11:
                    flashSale = _b.sent();
                    console.log("  \u2705 Created flash sale");
                    _b.label = 12;
                case 12: return [4 /*yield*/, prisma.product.findMany({
                        where: { isActive: true },
                        take: 50,
                    })];
                case 13:
                    allProducts = _b.sent();
                    if (!(allProducts.length === 0)) return [3 /*break*/, 14];
                    console.log("  ⚠️  No active products found. Please create products first.");
                    return [3 /*break*/, 23];
                case 14:
                    currentProductIds_1 = flashSale.products.map(function (p) { return p.productId; });
                    availableProducts = allProducts.filter(function (p) { return !currentProductIds_1.includes(p.id); });
                    targetCount = 10;
                    needed = Math.max(0, targetCount - currentProductIds_1.length);
                    productsToAdd = availableProducts.slice(0, needed);
                    if (!(productsToAdd.length > 0)) return [3 /*break*/, 16];
                    console.log("  \u2795 Adding ".concat(productsToAdd.length, " products to flash sale..."));
                    return [4 /*yield*/, prisma.flashSaleProduct.createMany({
                            data: productsToAdd.map(function (product) { return ({
                                flashSaleId: flashSale.id,
                                productId: product.id,
                            }); }),
                            skipDuplicates: true,
                        })];
                case 15:
                    _b.sent();
                    console.log("  \u2705 Added ".concat(productsToAdd.length, " products"));
                    return [3 /*break*/, 17];
                case 16:
                    if (currentProductIds_1.length >= targetCount) {
                        console.log("  \u2705 Flash sale already has ".concat(currentProductIds_1.length, " products"));
                    }
                    else {
                        console.log("  \u26A0\uFE0F  Only ".concat(currentProductIds_1.length, " products in flash sale (target: ").concat(targetCount, ")"));
                    }
                    _b.label = 17;
                case 17: return [4 /*yield*/, prisma.flashSaleProduct.findMany({
                        where: { flashSaleId: flashSale.id },
                        include: { product: true },
                    })];
                case 18:
                    flashSaleProducts = _b.sent();
                    console.log("  \uD83D\uDCB0 Updating product prices for flash sale...");
                    updatedCount = 0;
                    _a = 0, flashSaleProducts_1 = flashSaleProducts;
                    _b.label = 19;
                case 19:
                    if (!(_a < flashSaleProducts_1.length)) return [3 /*break*/, 22];
                    flashSaleProduct = flashSaleProducts_1[_a];
                    product = flashSaleProduct.product;
                    currentPrice = Number(product.priceGhs);
                    if (!(!product.compareAtPriceGhs || Number(product.compareAtPriceGhs) <= currentPrice)) return [3 /*break*/, 21];
                    originalPrice = currentPrice;
                    discount = (originalPrice * 30) / 100;
                    salePrice = originalPrice - discount;
                    return [4 /*yield*/, prisma.product.update({
                            where: { id: product.id },
                            data: {
                                compareAtPriceGhs: originalPrice,
                                priceGhs: salePrice,
                            },
                        })];
                case 20:
                    _b.sent();
                    updatedCount++;
                    _b.label = 21;
                case 21:
                    _a++;
                    return [3 /*break*/, 19];
                case 22:
                    console.log("  \u2705 Updated ".concat(updatedCount, " product prices"));
                    _b.label = 23;
                case 23: return [4 /*yield*/, prisma.flashSale.findUnique({
                        where: { id: flashSale.id },
                        include: {
                            products: {
                                include: {
                                    product: true,
                                },
                            },
                        },
                    })];
                case 24:
                    finalFlashSale = _b.sent();
                    console.log("\n✅ Christmas Mega Sale setup complete!");
                    console.log("   - Title: ".concat(finalFlashSale === null || finalFlashSale === void 0 ? void 0 : finalFlashSale.title));
                    console.log("   - Description: ".concat(finalFlashSale === null || finalFlashSale === void 0 ? void 0 : finalFlashSale.description));
                    console.log("   - Discount: ".concat(finalFlashSale === null || finalFlashSale === void 0 ? void 0 : finalFlashSale.discountPercent, "%"));
                    console.log("   - Products: ".concat(finalFlashSale === null || finalFlashSale === void 0 ? void 0 : finalFlashSale.products.length));
                    console.log("   - End Date: ".concat(finalFlashSale === null || finalFlashSale === void 0 ? void 0 : finalFlashSale.endDate));
                    console.log("\n🎉 All homepage content created successfully!");
                    console.log("\n📋 Summary:");
                    console.log("   - Blog Posts: ".concat(blogPosts.length, " created/updated"));
                    console.log("   - Flash Sale: Created/updated with ".concat((finalFlashSale === null || finalFlashSale === void 0 ? void 0 : finalFlashSale.products.length) || 0, " products"));
                    console.log("\n💡 Note: You may need to upload featured images for blog posts through the admin dashboard.");
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error("❌ Error:", e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
