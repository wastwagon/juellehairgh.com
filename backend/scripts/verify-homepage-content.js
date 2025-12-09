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
var axios_1 = require("axios");
var prisma = new client_1.PrismaClient();
var API_BASE = "http://localhost:3001/api";
function verifyContent() {
    return __awaiter(this, void 0, void 0, function () {
        var blogResponse, blogData, error_1, flashSaleResponse, flashSale, error_2, blogCount, flashSaleCount, flashSaleProducts, requiredBlogPosts, requiredFlashSaleProducts;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("🔍 Verifying homepage content...\n");
                    // 1. Verify Blog Posts
                    console.log("📝 Checking Blog Posts...");
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.get("".concat(API_BASE, "/blog?published=true&limit=4"))];
                case 2:
                    blogResponse = _b.sent();
                    blogData = blogResponse.data;
                    if (blogData.posts && blogData.posts.length > 0) {
                        console.log("  \u2705 Found ".concat(blogData.posts.length, " published blog posts:"));
                        blogData.posts.forEach(function (post, index) {
                            console.log("     ".concat(index + 1, ". \"").concat(post.title, "\" (").concat(post.category, ") - Published: ").concat(post.publishedAt));
                        });
                    }
                    else {
                        console.log("  ⚠️  No published blog posts found!");
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _b.sent();
                    console.log("  \u274C Error fetching blog posts: ".concat(error_1.message));
                    return [3 /*break*/, 4];
                case 4:
                    // 2. Verify Flash Sale
                    console.log("\n🎄 Checking Flash Sale...");
                    _b.label = 5;
                case 5:
                    _b.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, axios_1.default.get("".concat(API_BASE, "/flash-sales/active"))];
                case 6:
                    flashSaleResponse = _b.sent();
                    flashSale = flashSaleResponse.data;
                    if (flashSale) {
                        console.log("  \u2705 Flash Sale found: \"".concat(flashSale.title, "\""));
                        console.log("     - Description: ".concat(flashSale.description));
                        console.log("     - Discount: ".concat(flashSale.discountPercent, "%"));
                        console.log("     - Products: ".concat(((_a = flashSale.products) === null || _a === void 0 ? void 0 : _a.length) || 0));
                        console.log("     - End Date: ".concat(flashSale.endDate));
                        if (flashSale.products && flashSale.products.length > 0) {
                            console.log("     - Product List:");
                            flashSale.products.slice(0, 5).forEach(function (item, index) {
                                var product = item.product;
                                console.log("       ".concat(index + 1, ". ").concat(product.title, " - GHC").concat(product.priceGhs, " (was GHC").concat(product.compareAtPriceGhs, ")"));
                            });
                            if (flashSale.products.length > 5) {
                                console.log("       ... and ".concat(flashSale.products.length - 5, " more products"));
                            }
                        }
                    }
                    else {
                        console.log("  ⚠️  No active flash sale found!");
                    }
                    return [3 /*break*/, 8];
                case 7:
                    error_2 = _b.sent();
                    console.log("  \u274C Error fetching flash sale: ".concat(error_2.message));
                    return [3 /*break*/, 8];
                case 8:
                    // 3. Verify Database Content
                    console.log("\n💾 Checking Database Content...");
                    return [4 /*yield*/, prisma.blogPost.count({
                            where: { isPublished: true },
                        })];
                case 9:
                    blogCount = _b.sent();
                    console.log("  \u2705 Published blog posts in database: ".concat(blogCount));
                    return [4 /*yield*/, prisma.flashSale.count({
                            where: { isActive: true },
                        })];
                case 10:
                    flashSaleCount = _b.sent();
                    console.log("  \u2705 Active flash sales in database: ".concat(flashSaleCount));
                    return [4 /*yield*/, prisma.flashSaleProduct.count({
                            where: {
                                flashSale: { isActive: true },
                            },
                        })];
                case 11:
                    flashSaleProducts = _b.sent();
                    console.log("  \u2705 Products in active flash sale: ".concat(flashSaleProducts));
                    // 4. Check for required content
                    console.log("\n📋 Content Summary:");
                    requiredBlogPosts = 4;
                    requiredFlashSaleProducts = 10;
                    if (blogCount >= requiredBlogPosts) {
                        console.log("  \u2705 Blog Posts: ".concat(blogCount, "/").concat(requiredBlogPosts, " (\u2713)"));
                    }
                    else {
                        console.log("  \u26A0\uFE0F  Blog Posts: ".concat(blogCount, "/").concat(requiredBlogPosts, " (Need ").concat(requiredBlogPosts - blogCount, " more)"));
                    }
                    if (flashSaleProducts >= requiredFlashSaleProducts) {
                        console.log("  \u2705 Flash Sale Products: ".concat(flashSaleProducts, "/").concat(requiredFlashSaleProducts, " (\u2713)"));
                    }
                    else {
                        console.log("  \u26A0\uFE0F  Flash Sale Products: ".concat(flashSaleProducts, "/").concat(requiredFlashSaleProducts, " (Need ").concat(requiredFlashSaleProducts - flashSaleProducts, " more)"));
                    }
                    console.log("\n✅ Verification complete!");
                    console.log("\n💡 Next Steps:");
                    console.log("   1. Open http://localhost:3000 in your browser");
                    console.log("   2. Scroll down to see 'Latest News & Updates' section");
                    console.log("   3. Scroll further to see '⚡ Christmas Mega Sale' section");
                    console.log("   4. Verify all content is displaying correctly");
                    return [2 /*return*/];
            }
        });
    });
}
verifyContent()
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
