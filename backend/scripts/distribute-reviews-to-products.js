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
// Short review comments (some can be empty for rating-only reviews)
var shortReviews = [
    "Excellent quality!",
    "Very satisfied with my purchase.",
    "Great product, highly recommend!",
    "Love it!",
    "Perfect for my needs.",
    "Amazing quality and fast shipping.",
    "Will definitely order again!",
    "Exceeded my expectations.",
    "Great value for money.",
    "Highly recommend this product!",
    "", // Empty for rating-only
    "", // Empty for rating-only
    "", // Empty for rating-only
    "", // Empty for rating-only
    "", // Empty for rating-only
];
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var products, users, productReviewCounts, reviewCountMap, totalReviewsAdded, targetMinReviews, targetMaxReviews, _i, products_1, product, currentCount, targetCount, reviewsNeeded, i, randomUser, existingReview, hasText, reviewText, finalCounts, distribution, sortedDistribution, totalReviews;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("🚀 Starting review distribution to products...\n");
                    return [4 /*yield*/, prisma.product.findMany({
                            where: { isActive: true },
                            select: { id: true, title: true, slug: true },
                        })];
                case 1:
                    products = _a.sent();
                    if (products.length === 0) {
                        console.error("❌ No active products found!");
                        return [2 /*return*/];
                    }
                    console.log("\uD83D\uDCE6 Found ".concat(products.length, " active products\n"));
                    return [4 /*yield*/, prisma.user.findMany({
                            where: { role: "CUSTOMER" },
                            select: { id: true, name: true, email: true },
                        })];
                case 2:
                    users = _a.sent();
                    if (users.length === 0) {
                        console.error("❌ No users found! Please create users first.");
                        return [2 /*return*/];
                    }
                    console.log("\uD83D\uDC65 Found ".concat(users.length, " existing users\n"));
                    return [4 /*yield*/, prisma.review.groupBy({
                            by: ["productId"],
                            where: { isVerified: true },
                            _count: { id: true },
                        })];
                case 3:
                    productReviewCounts = _a.sent();
                    reviewCountMap = new Map();
                    productReviewCounts.forEach(function (item) {
                        reviewCountMap.set(item.productId, item._count.id);
                    });
                    console.log("\uD83D\uDCCA Current review distribution:\n");
                    productReviewCounts.forEach(function (item) {
                        var product = products.find(function (p) { return p.id === item.productId; });
                        if (product) {
                            console.log("  ".concat(product.title, ": ").concat(item._count.id, " reviews"));
                        }
                    });
                    console.log("");
                    totalReviewsAdded = 0;
                    targetMinReviews = 2;
                    targetMaxReviews = 6;
                    _i = 0, products_1 = products;
                    _a.label = 4;
                case 4:
                    if (!(_i < products_1.length)) return [3 /*break*/, 12];
                    product = products_1[_i];
                    currentCount = reviewCountMap.get(product.id) || 0;
                    targetCount = Math.floor(Math.random() * (targetMaxReviews - targetMinReviews + 1)) + targetMinReviews;
                    reviewsNeeded = Math.max(0, targetCount - currentCount);
                    if (!(reviewsNeeded > 0)) return [3 /*break*/, 10];
                    console.log("\uD83D\uDCDD Adding ".concat(reviewsNeeded, " reviews to: ").concat(product.title, " (currently has ").concat(currentCount, ")"));
                    i = 0;
                    _a.label = 5;
                case 5:
                    if (!(i < reviewsNeeded)) return [3 /*break*/, 9];
                    randomUser = users[Math.floor(Math.random() * users.length)];
                    return [4 /*yield*/, prisma.review.findFirst({
                            where: {
                                userId: randomUser.id,
                                productId: product.id,
                            },
                        })];
                case 6:
                    existingReview = _a.sent();
                    if (existingReview) {
                        console.log("  \u26A0\uFE0F  User ".concat(randomUser.name, " already reviewed this product, skipping..."));
                        return [3 /*break*/, 8];
                    }
                    hasText = Math.random() > 0.3;
                    reviewText = hasText
                        ? shortReviews[Math.floor(Math.random() * shortReviews.length)]
                        : "";
                    // Create review
                    return [4 /*yield*/, prisma.review.create({
                            data: {
                                userId: randomUser.id,
                                productId: product.id,
                                rating: 5, // All 5-star
                                title: hasText && reviewText ? reviewText.substring(0, 50) : undefined,
                                comment: hasText && reviewText ? reviewText : undefined,
                                isVerified: true,
                            },
                        })];
                case 7:
                    // Create review
                    _a.sent();
                    totalReviewsAdded++;
                    console.log("  \u2705 Added review by ".concat(randomUser.name).concat(hasText ? ": \"".concat(reviewText, "\"") : " (rating only)"));
                    _a.label = 8;
                case 8:
                    i++;
                    return [3 /*break*/, 5];
                case 9: return [3 /*break*/, 11];
                case 10:
                    console.log("\u2713 ".concat(product.title, " already has ").concat(currentCount, " reviews (target: ").concat(targetCount, ")"));
                    _a.label = 11;
                case 11:
                    _i++;
                    return [3 /*break*/, 4];
                case 12: return [4 /*yield*/, prisma.review.groupBy({
                        by: ["productId"],
                        where: { isVerified: true },
                        _count: { id: true },
                    })];
                case 13:
                    finalCounts = _a.sent();
                    console.log("\n\u2705 Complete! Added ".concat(totalReviewsAdded, " new reviews\n"));
                    console.log("\uD83D\uDCCA Final review distribution:\n");
                    distribution = new Map();
                    finalCounts.forEach(function (item) {
                        var count = item._count.id;
                        distribution.set(count, (distribution.get(count) || 0) + 1);
                    });
                    sortedDistribution = Array.from(distribution.entries()).sort(function (a, b) { return a[0] - b[0]; });
                    sortedDistribution.forEach(function (_a) {
                        var reviewCount = _a[0], productCount = _a[1];
                        console.log("  ".concat(productCount, " products with ").concat(reviewCount, " review").concat(reviewCount !== 1 ? "s" : ""));
                    });
                    return [4 /*yield*/, prisma.review.count({
                            where: { isVerified: true },
                        })];
                case 14:
                    totalReviews = _a.sent();
                    console.log("\n\uD83D\uDCC8 Total verified reviews: ".concat(totalReviews));
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
