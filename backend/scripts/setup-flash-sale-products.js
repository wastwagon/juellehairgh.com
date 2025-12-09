"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var getCategoryId, wigsCategoryId, braidingCategoryId, extensionsCategoryId, hairCareCategoryId, productData, productIds, _i, productData_1, data, existing, updated, categoryId, productData_2, created, error_1, now, endDate, flashSale, finalFlashSale;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("🎄 Setting up Christmas Mega Sale with 10 products...\n");
                    getCategoryId = function (name, fallbackName) { return __awaiter(_this, void 0, void 0, function () {
                        var slug, category, fallbackSlug;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    slug = name.toLowerCase().replace(/\s+/g, "-");
                                    return [4 /*yield*/, prisma.category.findUnique({
                                            where: { slug: slug },
                                        })];
                                case 1:
                                    category = _a.sent();
                                    if (!(!category && fallbackName)) return [3 /*break*/, 3];
                                    fallbackSlug = fallbackName.toLowerCase().replace(/\s+/g, "-");
                                    return [4 /*yield*/, prisma.category.findUnique({
                                            where: { slug: fallbackSlug },
                                        })];
                                case 2:
                                    category = _a.sent();
                                    _a.label = 3;
                                case 3:
                                    if (!!category) return [3 /*break*/, 5];
                                    return [4 /*yield*/, prisma.category.findFirst({
                                            where: { name: { contains: "All", mode: "insensitive" } },
                                        })];
                                case 4:
                                    // Use "Shop All" as fallback
                                    category = _a.sent();
                                    _a.label = 5;
                                case 5:
                                    if (!category) {
                                        throw new Error("Category not found: ".concat(name));
                                    }
                                    return [2 /*return*/, category.id];
                            }
                        });
                    }); };
                    return [4 /*yield*/, getCategoryId("Lace Wigs", "Wigs")];
                case 1:
                    wigsCategoryId = _a.sent();
                    return [4 /*yield*/, getCategoryId("Braids", "Braiding Hair")];
                case 2:
                    braidingCategoryId = _a.sent();
                    return [4 /*yield*/, getCategoryId("Clip-ins", "Extensions")];
                case 3:
                    extensionsCategoryId = _a.sent();
                    return [4 /*yield*/, getCategoryId("Wig Care", "Hair Care")];
                case 4:
                    hairCareCategoryId = _a.sent();
                    productData = [
                        {
                            title: "Premium Lace Front Wig - Black",
                            slug: "premium-lace-front-wig-black",
                            priceGhs: 315.00,
                            compareAtPriceGhs: 450.00, // Original price (30% off = 315)
                            description: "Premium quality lace front wig in black. Natural looking hairline with comfortable cap construction.",
                            categoryId: wigsCategoryId,
                            isActive: true,
                        },
                        {
                            title: "Zury Sis Crochet Braid - V11 Boho CURLY 12/13/14 inch",
                            slug: "zury-sis-crochet-braid-v11-boho-curly",
                            priceGhs: 315.00,
                            compareAtPriceGhs: 450.00,
                            description: "Beautiful boho curly crochet braid hair in 12/13/14 inch lengths. Perfect for protective styling.",
                            categoryId: braidingCategoryId,
                            isActive: true,
                        },
                        {
                            title: "African Pride Braid Sheen Spray 12oz",
                            slug: "african-pride-braid-sheen-spray-12oz",
                            priceGhs: 136.50,
                            compareAtPriceGhs: 195.00,
                            description: "Keep your braids looking fresh and shiny with this nourishing braid sheen spray. Rosemary & mint formula.",
                            categoryId: hairCareCategoryId,
                            isActive: true,
                        },
                        {
                            title: "Outre X-Pression LiL Looks 3X Crochet Braid - SPRINGY AFR...",
                            slug: "outre-xpression-lil-looks-3x-crochet-braid",
                            priceGhs: 525.00,
                            compareAtPriceGhs: 750.00,
                            description: "Springy afro-textured crochet braid hair. Easy to install and style. Natural looking texture.",
                            categoryId: braidingCategoryId,
                            isActive: true,
                        },
                        {
                            title: "Outre Human Hair Blend Big Beautiful Hair Clip In 9 - 4A...",
                            slug: "outre-human-hair-blend-clip-in-9",
                            priceGhs: 455.00,
                            compareAtPriceGhs: 650.00,
                            description: "Human hair blend clip-in extensions in 4A texture. Instant volume and length. Easy to apply.",
                            categoryId: extensionsCategoryId,
                            isActive: true,
                        },
                        {
                            title: "Mane Concept Mega Brazilian Human Hair Blend Braids -...",
                            slug: "mane-concept-mega-brazilian-braids",
                            priceGhs: 840.00,
                            compareAtPriceGhs: 1200.00,
                            description: "Premium Brazilian human hair blend braids. Full density for a natural, voluminous look.",
                            categoryId: braidingCategoryId,
                            isActive: true,
                        },
                        {
                            title: "Vivica A Fox 100% Brazilian Human Hair Blend Drawstring...",
                            slug: "vivica-a-fox-brazilian-hair-blend-drawstring",
                            priceGhs: 350.00,
                            compareAtPriceGhs: 500.00,
                            description: "Luxurious Brazilian human hair blend drawstring ponytail. Easy to install and style.",
                            categoryId: wigsCategoryId,
                            isActive: true,
                        },
                        {
                            title: "Sensationnel Curls Kinks Textured Glueless HD 13x6...",
                            slug: "sensationnel-curls-kinks-textured-glueless-hd",
                            priceGhs: 840.00,
                            compareAtPriceGhs: 1200.00,
                            description: "Glueless HD lace wig with curls and kinks texture. Natural looking hairline. 13x6 lace part.",
                            categoryId: wigsCategoryId,
                            isActive: true,
                        },
                        {
                            title: "NEW! Wild Growth \"Never Before Now Growth\" Hair Oil ...",
                            slug: "wild-growth-never-before-now-growth-hair-oil",
                            priceGhs: 129.50,
                            compareAtPriceGhs: 185.00,
                            description: "Revolutionary hair growth oil formula. Promotes healthy hair growth and strengthens hair follicles.",
                            categoryId: hairCareCategoryId,
                            isActive: true,
                        },
                        {
                            title: "Sensationnel OCEAN WAVE 30 inches BUTTA Human Hair...",
                            slug: "sensationnel-ocean-wave-30-inches-butta",
                            priceGhs: 350.00,
                            compareAtPriceGhs: 500.00,
                            description: "Beautiful ocean wave texture in 30 inches. Butta human hair blend for a silky, natural look.",
                            categoryId: braidingCategoryId,
                            isActive: true,
                        },
                    ];
                    console.log("📦 Creating/updating products...\n");
                    productIds = [];
                    _i = 0, productData_1 = productData;
                    _a.label = 5;
                case 5:
                    if (!(_i < productData_1.length)) return [3 /*break*/, 14];
                    data = productData_1[_i];
                    _a.label = 6;
                case 6:
                    _a.trys.push([6, 12, , 13]);
                    return [4 /*yield*/, prisma.product.findUnique({
                            where: { slug: data.slug },
                        })];
                case 7:
                    existing = _a.sent();
                    if (!existing) return [3 /*break*/, 9];
                    return [4 /*yield*/, prisma.product.update({
                            where: { id: existing.id },
                            data: {
                                title: data.title,
                                priceGhs: data.priceGhs,
                                compareAtPriceGhs: data.compareAtPriceGhs,
                                description: data.description,
                                categoryId: data.categoryId,
                                isActive: data.isActive,
                            },
                        })];
                case 8:
                    updated = _a.sent();
                    productIds.push(updated.id);
                    console.log("  \u2705 Updated: ".concat(data.title));
                    return [3 /*break*/, 11];
                case 9:
                    categoryId = data.categoryId, productData_2 = __rest(data, ["categoryId"]);
                    return [4 /*yield*/, prisma.product.create({
                            data: __assign(__assign({}, productData_2), { categoryId: categoryId, sku: "SKU-".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9)), stock: 100, images: [], badges: [] }),
                        })];
                case 10:
                    created = _a.sent();
                    productIds.push(created.id);
                    console.log("  \u2705 Created: ".concat(data.title));
                    _a.label = 11;
                case 11: return [3 /*break*/, 13];
                case 12:
                    error_1 = _a.sent();
                    console.log("  \u274C Error with ".concat(data.title, ":"), error_1.message);
                    return [3 /*break*/, 13];
                case 13:
                    _i++;
                    return [3 /*break*/, 5];
                case 14:
                    console.log("\n\u2705 Created/updated ".concat(productIds.length, " products\n"));
                    // Create or update flash sale
                    console.log("🎄 Setting up Christmas Mega Sale...\n");
                    now = new Date();
                    endDate = new Date("2025-12-31T23:59:59Z");
                    return [4 /*yield*/, prisma.flashSale.findFirst({
                            where: { isActive: true },
                            include: {
                                products: true,
                            },
                        })];
                case 15:
                    flashSale = _a.sent();
                    if (!flashSale) return [3 /*break*/, 17];
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
                case 16:
                    _a.sent();
                    console.log("  \u2705 Updated flash sale");
                    return [3 /*break*/, 19];
                case 17:
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
                case 18:
                    flashSale = _a.sent();
                    console.log("  \u2705 Created flash sale");
                    _a.label = 19;
                case 19:
                    // Remove existing products from flash sale
                    console.log("  \uD83D\uDDD1\uFE0F  Clearing existing products from flash sale...");
                    return [4 /*yield*/, prisma.flashSaleProduct.deleteMany({
                            where: { flashSaleId: flashSale.id },
                        })];
                case 20:
                    _a.sent();
                    // Add the 10 products to flash sale
                    console.log("  \u2795 Adding ".concat(productIds.length, " products to flash sale..."));
                    return [4 /*yield*/, prisma.flashSaleProduct.createMany({
                            data: productIds.map(function (productId) { return ({
                                flashSaleId: flashSale.id,
                                productId: productId,
                            }); }),
                            skipDuplicates: true,
                        })];
                case 21:
                    _a.sent();
                    console.log("  \u2705 Added ".concat(productIds.length, " products to flash sale"));
                    return [4 /*yield*/, prisma.flashSale.findUnique({
                            where: { id: flashSale.id },
                            include: {
                                products: {
                                    include: {
                                        product: {
                                            select: {
                                                id: true,
                                                title: true,
                                                priceGhs: true,
                                                compareAtPriceGhs: true,
                                            },
                                        },
                                    },
                                },
                            },
                        })];
                case 22:
                    finalFlashSale = _a.sent();
                    console.log("\n✅ Flash Sale Setup Complete!");
                    console.log("   - Title: ".concat(finalFlashSale === null || finalFlashSale === void 0 ? void 0 : finalFlashSale.title));
                    console.log("   - Description: ".concat(finalFlashSale === null || finalFlashSale === void 0 ? void 0 : finalFlashSale.description));
                    console.log("   - Discount: ".concat(finalFlashSale === null || finalFlashSale === void 0 ? void 0 : finalFlashSale.discountPercent, "%"));
                    console.log("   - Products: ".concat(finalFlashSale === null || finalFlashSale === void 0 ? void 0 : finalFlashSale.products.length));
                    console.log("   - End Date: ".concat(finalFlashSale === null || finalFlashSale === void 0 ? void 0 : finalFlashSale.endDate));
                    console.log("\n📋 Products in Flash Sale:");
                    finalFlashSale === null || finalFlashSale === void 0 ? void 0 : finalFlashSale.products.forEach(function (fp, index) {
                        var p = fp.product;
                        console.log("   ".concat(index + 1, ". ").concat(p.title));
                        console.log("      Price: GHC".concat(p.priceGhs, " (Was: GHC").concat(p.compareAtPriceGhs, ")"));
                    });
                    console.log("\n🎉 All done! Flash sale is now visible on frontend!");
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
