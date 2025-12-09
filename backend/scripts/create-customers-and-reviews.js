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
var bcrypt = require("bcryptjs");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var customersData, allProducts, findMatchingProduct, usersCreated, reviewsCreated, _i, customersData_1, customerData, user, hashedPassword, _a, _b, reviewData, product, existingReview, error_1, deborahReview, deborahUser, hashedPassword, totalUsers, totalReviews;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log("👥 Creating customers and reviews from images...\n");
                    customersData = [
                        // From first image set
                        {
                            name: "Ama Serwaa",
                            email: "ama.serwaa@example.com",
                            phone: "+233241234567",
                            reviews: [
                                {
                                    title: "Perfect for box braids!",
                                    comment: "This braiding hair is excellent quality! It's soft, doesn't tangle, and looks very natural. I've used it for box braids multiple times and they always come out perfect. The hair holds well and doesn't shed. Great value for money. The consistency is excellent. I'll definitely be ordering more!",
                                    rating: 5,
                                    productKeywords: ["braiding", "braid", "box"],
                                },
                            ],
                        },
                        {
                            name: "Esi Boateng",
                            email: "esi.boateng@example.com",
                            phone: "+233241234568",
                            reviews: [
                                {
                                    title: "Saves so much time!",
                                    comment: "These pre-looped crochet braids are a game changer! Installation was super quick and they look amazing. The texture is perfect and they've held up really well. My protective style looks professional. The quality is excellent and they're easy to maintain. Will definitely order again for my next protective style!",
                                    rating: 5,
                                    productKeywords: ["crochet", "pre-looped"],
                                },
                            ],
                        },
                        {
                            name: "Akosua Osei",
                            email: "akosua.osei@example.com",
                            phone: "+233241234569",
                            reviews: [
                                {
                                    title: "Absolutely stunning quality!",
                                    comment: "This HD lace front wig is incredible! The lace is so transparent and undetectable. The hair quality is premium and it's very comfortable to wear all day. I've worn it multiple times and it still looks brand new. The color matches perfectly and it's easy to style. Highly recommend to anyone looking for a quality wig!",
                                    rating: 5,
                                    productKeywords: ["lace", "wig", "HD"],
                                },
                                {
                                    title: "Best braiding hair I've tried!",
                                    comment: "This braiding hair is top quality! It's soft, doesn't tangle, and looks very natural. I've used it for various protective styles and it always comes out perfect. The hair holds well and doesn't shed. Excellent value for money. The quality is consistent throughout. Highly recommend!",
                                    rating: 5,
                                    productKeywords: ["braiding", "braid"],
                                },
                            ],
                        },
                        {
                            name: "Akua Danso",
                            email: "akua.danso@example.com",
                            phone: "+233241234570",
                            reviews: [
                                {
                                    title: "Perfect ponytail extension!",
                                    comment: "This ponytail extension is gorgeous! The quality is excellent and it looks very natural. Easy to attach and stays secure. The hair is soft and manageable. I've received so many compliments. Perfect for quick styling when I need to look put together fast. Will definitely order more in different colors!",
                                    rating: 5,
                                    productKeywords: ["ponytail", "extension"],
                                },
                            ],
                        },
                        // From second image set
                        {
                            name: "Efua Asante",
                            email: "efua.asante@example.com",
                            phone: "+233241234571",
                            reviews: [
                                {
                                    title: "Keeps my braids looking fresh!",
                                    comment: "This spray is a game changer! It keeps my braids shiny and moisturized without making them greasy. The scent is pleasant and it doesn't leave any residue. My braids look brand new even after weeks of wear. I use it daily and it's become an essential part of my hair care routine. Highly recommend for anyone with braids or extensions!",
                                    rating: 5,
                                    productKeywords: ["spray", "braid", "sheen"],
                                },
                            ],
                        },
                        {
                            name: "Adjoa Kwarteng",
                            email: "adjoa.kwarteng@example.com",
                            phone: "+233241234572",
                            reviews: [
                                {
                                    title: "Perfect for protective styling!",
                                    comment: "These crochet braids are amazing! They installed easily, look very natural, and have held up well over the past 2 months. The texture is perfect and they're not too heavy. My natural hair is thriving underneath. The quality is excellent for the price and they're easy to maintain. Will definitely order again in different colors!",
                                    rating: 5,
                                    productKeywords: ["crochet", "braid"],
                                },
                            ],
                        },
                        {
                            name: "Abena Owusu",
                            email: "abena.owusu@example.com",
                            phone: "+233241234573",
                            reviews: [
                                {
                                    title: "Absolutely love this wig!",
                                    comment: "I've been wearing this lace front wig for 3 months now and it still looks amazing. The quality is excellent, very natural looking, and easy to style. The lace is undetectable and the hair feels soft and manageable. The color matches perfectly and it's comfortable to wear all day. Shipping was fast and the customer service was excellent. Highly recommend to anyone looking for a quality wig!",
                                    rating: 5,
                                    productKeywords: ["lace", "wig", "front"],
                                },
                            ],
                        },
                        {
                            name: "Maame Adjei",
                            email: "maame.adjei@example.com",
                            phone: "+233241234574",
                            reviews: [
                                {
                                    title: "Perfect for quick styling!",
                                    comment: "This half wig is perfect for when I need a quick style! It blends seamlessly with my natural hair and looks very natural. The quality is great and it's easy to install. I use it all the time for quick looks. The clips are secure and comfortable. Love how versatile it is!",
                                    rating: 5,
                                    productKeywords: ["half", "wig", "clip"],
                                },
                            ],
                        },
                        // From third image set
                        {
                            name: "Serwaa Asare",
                            email: "serwaa.asare@example.com",
                            phone: "+233241234575",
                            reviews: [
                                {
                                    title: "Most comfortable wig ever!",
                                    comment: "This glueless wig is so comfortable! I can wear it all day without any irritation. The quality is excellent and it looks very natural. The cap construction is perfect. I've received so many compliments. The hair quality is premium. Highly recommend to anyone looking for comfort and style!",
                                    rating: 5,
                                    productKeywords: ["glueless", "wig"],
                                },
                            ],
                        },
                        {
                            name: "Gilbert",
                            email: "gilbert@example.com",
                            phone: "+233241234576",
                            reviews: [
                                {
                                    title: "Love the texture!",
                                    comment: "These pre-fluffed crochet braids are fantastic! The texture is exactly what I wanted and they saved me so much time. The quality is great and they've lasted well. Easy to install and maintain. My protective style looks professional and natural. Will order more colors for variety!",
                                    rating: 5,
                                    productKeywords: ["crochet", "pre-fluffed", "braid"],
                                },
                            ],
                        },
                        {
                            name: "Kukua Asare",
                            email: "kukua.asare@example.com",
                            phone: "+233241234577",
                            reviews: [
                                {
                                    title: "Keeps my hair smooth all day!",
                                    comment: "This anti-frizz serum is amazing! It keeps my hair smooth and shiny without making it greasy. The formula is lightweight and doesn't weigh my hair down. My hair looks great even in humid weather. I use it daily and it's become essential. Love how it makes my hair manageable and frizz-free!",
                                    rating: 5,
                                    productKeywords: ["serum", "anti-frizz", "frizz"],
                                },
                            ],
                        },
                    ];
                    return [4 /*yield*/, prisma.product.findMany({
                            where: { isActive: true },
                            take: 100,
                        })];
                case 1:
                    allProducts = _c.sent();
                    console.log("\uD83D\uDCE6 Found ".concat(allProducts.length, " active products\n"));
                    findMatchingProduct = function (keywords) {
                        var _loop_1 = function (keyword) {
                            var product = allProducts.find(function (p) {
                                var _a;
                                return p.title.toLowerCase().includes(keyword.toLowerCase()) ||
                                    ((_a = p.description) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(keyword.toLowerCase()));
                            });
                            if (product)
                                return { value: product };
                        };
                        for (var _i = 0, keywords_1 = keywords; _i < keywords_1.length; _i++) {
                            var keyword = keywords_1[_i];
                            var state_1 = _loop_1(keyword);
                            if (typeof state_1 === "object")
                                return state_1.value;
                        }
                        // Fallback to first available product
                        return allProducts[0];
                    };
                    usersCreated = 0;
                    reviewsCreated = 0;
                    _i = 0, customersData_1 = customersData;
                    _c.label = 2;
                case 2:
                    if (!(_i < customersData_1.length)) return [3 /*break*/, 17];
                    customerData = customersData_1[_i];
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 15, , 16]);
                    return [4 /*yield*/, prisma.user.findUnique({
                            where: { email: customerData.email },
                        })];
                case 4:
                    user = _c.sent();
                    if (!!user) return [3 /*break*/, 7];
                    return [4 /*yield*/, bcrypt.hash("Customer123!", 10)];
                case 5:
                    hashedPassword = _c.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                email: customerData.email,
                                password: hashedPassword,
                                name: customerData.name,
                                phone: customerData.phone,
                                role: "CUSTOMER",
                                emailVerified: true,
                            },
                        })];
                case 6:
                    user = _c.sent();
                    usersCreated++;
                    console.log("  \u2705 Created user: ".concat(customerData.name));
                    return [3 /*break*/, 8];
                case 7:
                    console.log("  \u2139\uFE0F  User exists: ".concat(customerData.name));
                    _c.label = 8;
                case 8:
                    _a = 0, _b = customerData.reviews;
                    _c.label = 9;
                case 9:
                    if (!(_a < _b.length)) return [3 /*break*/, 14];
                    reviewData = _b[_a];
                    product = findMatchingProduct(reviewData.productKeywords);
                    if (!product) {
                        console.log("  \u26A0\uFE0F  No product found for review: ".concat(reviewData.title));
                        return [3 /*break*/, 13];
                    }
                    return [4 /*yield*/, prisma.review.findFirst({
                            where: {
                                userId: user.id,
                                productId: product.id,
                                title: reviewData.title,
                            },
                        })];
                case 10:
                    existingReview = _c.sent();
                    if (!!existingReview) return [3 /*break*/, 12];
                    return [4 /*yield*/, prisma.review.create({
                            data: {
                                userId: user.id,
                                productId: product.id,
                                rating: reviewData.rating,
                                title: reviewData.title,
                                comment: reviewData.comment,
                                isVerified: true, // All reviews from images are verified
                            },
                        })];
                case 11:
                    _c.sent();
                    reviewsCreated++;
                    console.log("    \u2705 Created review: \"".concat(reviewData.title, "\" for ").concat(product.title));
                    return [3 /*break*/, 13];
                case 12:
                    console.log("    \u2139\uFE0F  Review exists: \"".concat(reviewData.title, "\""));
                    _c.label = 13;
                case 13:
                    _a++;
                    return [3 /*break*/, 9];
                case 14: return [3 /*break*/, 16];
                case 15:
                    error_1 = _c.sent();
                    console.log("  \u274C Error with ".concat(customerData.name, ":"), error_1.message);
                    return [3 /*break*/, 16];
                case 16:
                    _i++;
                    return [3 /*break*/, 2];
                case 17: return [4 /*yield*/, prisma.review.findFirst({
                        where: { title: "Excellent Quality" },
                        include: { user: true },
                    })];
                case 18:
                    deborahReview = _c.sent();
                    if (!(deborahReview && !deborahReview.user)) return [3 /*break*/, 22];
                    console.log("\n⚠️  Found review without user (Deborah D.)");
                    return [4 /*yield*/, prisma.user.findUnique({
                            where: { email: "deborah@example.com" },
                        })];
                case 19:
                    deborahUser = _c.sent();
                    if (!!deborahUser) return [3 /*break*/, 22];
                    return [4 /*yield*/, bcrypt.hash("Customer123!", 10)];
                case 20:
                    hashedPassword = _c.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                email: "deborah@example.com",
                                password: hashedPassword,
                                name: "Deborah D.",
                                role: "CUSTOMER",
                                emailVerified: true,
                            },
                        })];
                case 21:
                    _c.sent();
                    console.log("  ✅ Created user for Deborah D.");
                    _c.label = 22;
                case 22: return [4 /*yield*/, prisma.user.count({
                        where: { role: "CUSTOMER" },
                    })];
                case 23:
                    totalUsers = _c.sent();
                    return [4 /*yield*/, prisma.review.count()];
                case 24:
                    totalReviews = _c.sent();
                    console.log("\n✅ Customers and Reviews Creation Complete!");
                    console.log("   - Users created: ".concat(usersCreated));
                    console.log("   - Reviews created: ".concat(reviewsCreated));
                    console.log("   - Total customers: ".concat(totalUsers));
                    console.log("   - Total reviews: ".concat(totalReviews));
                    console.log("\n🌐 View at:");
                    console.log("   📱 Admin Customers: http://localhost:8002/admin/customers");
                    console.log("   📱 Admin Reviews: http://localhost:8002/admin/reviews");
                    console.log("   🌍 Frontend: http://localhost:8002 (scroll to 'What Our Customers Say')");
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
