"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
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
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var bcrypt = require("bcrypt");
var prisma = new client_1.PrismaClient();
// Natural 5-star product reviews for hair products
var reviewTemplates = [
    {
        name: "Ama Mensah",
        email: "ama.mensah@example.com",
        productTitle: "Premium Lace Front Wig",
        title: "Absolutely love this wig!",
        comment: "I've been wearing this lace front wig for 3 months now and it still looks amazing. The quality is excellent, very natural looking, and easy to style. The lace is undetectable and the hair feels soft and manageable. Highly recommend!",
    },
    {
        name: "Efua Asante",
        email: "efua.asante@example.com",
        productTitle: "Zury Sis Crochet Braid",
        title: "Perfect for protective styling!",
        comment: "These crochet braids are amazing! They installed easily, look very natural, and have held up well over the past 2 months. The texture is perfect and they're not too heavy. My natural hair is thriving underneath. Will definitely order again!",
    },
    {
        name: "Akosua Osei",
        email: "akosua.osei@example.com",
        productTitle: "African Pride Braid Sheen Spray",
        title: "Keeps my braids looking fresh!",
        comment: "This spray is a game changer! It keeps my braids shiny and moisturized without making them greasy. The scent is pleasant and it doesn't leave any residue. My braids look brand new even after weeks of wear. Highly recommend for anyone with braids!",
    },
    {
        name: "Adjoa Kwarteng",
        email: "adjoa.kwarteng@example.com",
        title: "Great quality clip-in extensions!",
        comment: "These clip-in extensions blend perfectly with my natural hair. The texture matches well and they're easy to install. The quality is excellent for the price. I've worn them multiple times and they still look great. Very satisfied with my purchase!",
    },
    {
        name: "Yaa Boateng",
        email: "yaa.boateng@example.com",
        productTitle: "Outre X-Pression Crochet Braid",
        title: "Love the texture and durability!",
        comment: "These crochet braids are fantastic! The texture is exactly what I wanted and they've lasted much longer than I expected. Easy to install and maintain. My friends keep asking where I got them from. Will definitely be ordering more colors!",
    },
    {
        name: "Maame Adjei",
        email: "maame.adjei@example.com",
        productTitle: "Sensationnel Lace Front Wig",
        title: "Most natural looking wig I've owned!",
        comment: "This wig is absolutely stunning! The lace front is so natural and undetectable. The hair quality is excellent and it's very comfortable to wear. I've received so many compliments. The color matches perfectly and it's easy to style. Worth every cedi!",
    },
    {
        name: "Abena Owusu",
        email: "abena.owusu@example.com",
        productTitle: "Bobbi Boss Braiding Hair",
        title: "Perfect for box braids!",
        comment: "This braiding hair is soft, doesn't tangle easily, and looks very natural. I've used it for box braids and they came out beautifully. The hair holds well and doesn't shed. Great value for money. I'll definitely be ordering more!",
    },
    {
        name: "Akua Danso",
        email: "akua.danso@example.com",
        productTitle: "Outre Human Hair Blend Clip-In",
        title: "Amazing quality extensions!",
        comment: "These clip-in extensions are fantastic! They blend seamlessly with my natural hair and the quality is excellent. Easy to install and remove. The hair feels soft and looks very natural. I've worn them multiple times and they still look great. Highly recommend!",
    },
    {
        name: "Esi Ampofo",
        email: "esi.ampofo@example.com",
        productTitle: "Simply Stylin Wig Spray",
        title: "Keeps my wigs looking brand new!",
        comment: "This wig spray is a must-have! It keeps my synthetic wigs looking fresh and prevents them from getting frizzy. The formula is lightweight and doesn't leave any buildup. My wigs look brand new even after months of wear. Excellent product!",
    },
    {
        name: "Afi Mensah",
        email: "afi.mensah@example.com",
        productTitle: "Freetress Crochet Braids",
        title: "Love the pre-fluffed texture!",
        comment: "These crochet braids are perfect! The pre-fluffed texture saves me so much time and they look amazing. The quality is great and they've held up well. Easy to install and maintain. My protective style looks professional. Will order again!",
    },
    {
        name: "Kukua Asare",
        email: "kukua.asare@example.com",
        productTitle: "Mane Concept Braiding Hair",
        title: "Best braiding hair I've used!",
        comment: "This braiding hair is top quality! It's soft, doesn't tangle, and looks very natural. I've used it for various protective styles and it always comes out perfect. The hair holds well and doesn't shed. Great value for money. Highly recommend!",
    },
    {
        name: "Serwaa Bonsu",
        email: "serwaa.bonsu@example.com",
        productTitle: "Vivica A. Fox Ponytail",
        title: "Perfect ponytail extension!",
        comment: "This ponytail extension is gorgeous! The quality is excellent and it looks very natural. Easy to attach and stays secure. The hair is soft and manageable. I've received so many compliments. Perfect for quick styling. Will definitely order more!",
    },
    {
        name: "Ama Serwaa",
        email: "ama.serwaa@example.com",
        productTitle: "Sensationnel Butta HD Lace Front Wig",
        title: "Absolutely stunning quality!",
        comment: "This HD lace front wig is incredible! The lace is so transparent and undetectable. The hair quality is premium and it's very comfortable to wear all day. I've worn it multiple times and it still looks brand new. Highly recommend!",
    },
    {
        name: "Efua Mensah",
        email: "efua.mensah@example.com",
        productTitle: "Outre X-Pression Pre-Loop Crochet Braid",
        title: "Saves so much time!",
        comment: "These pre-looped crochet braids are a game changer! Installation was super quick and they look amazing. The texture is perfect and they've held up really well. My protective style looks professional. Will definitely order again!",
    },
    {
        name: "Akosua Adjei",
        email: "akosua.adjei@example.com",
        productTitle: "Bobbi Boss Synthetic Braiding Hair",
        title: "Perfect for box braids!",
        comment: "This braiding hair is excellent quality! It's soft, doesn't tangle, and looks very natural. I've used it for box braids multiple times and they always come out perfect. Great value for money. Highly recommend!",
    },
    {
        name: "Adjoa Ampofo",
        email: "adjoa.ampofo@example.com",
        productTitle: "Simply Stylin Anti-Frizz Serum",
        title: "Keeps my hair smooth all day!",
        comment: "This anti-frizz serum is amazing! It keeps my hair smooth and shiny without making it greasy. The formula is lightweight and doesn't weigh my hair down. My hair looks great even in humid weather. Love it!",
    },
    {
        name: "Yaa Owusu",
        email: "yaa.owusu@example.com",
        productTitle: "Freetress Pre-Fluffed Crochet Braids",
        title: "Love the texture!",
        comment: "These pre-fluffed crochet braids are fantastic! The texture is exactly what I wanted and they saved me so much time. The quality is great and they've lasted well. Easy to install and maintain. Will order more colors!",
    },
    {
        name: "Maame Asante",
        email: "maame.asante@example.com",
        productTitle: "Mane Concept Human Hair Blend Braids",
        title: "Best braiding hair I've tried!",
        comment: "This braiding hair is top quality! It's soft, doesn't tangle, and looks very natural. I've used it for various protective styles and it always comes out perfect. The hair holds well and doesn't shed. Excellent value!",
    },
    {
        name: "Abena Danso",
        email: "abena.danso@example.com",
        productTitle: "Sensationnel Cloud9 Glueless Wig",
        title: "Most comfortable wig ever!",
        comment: "This glueless wig is so comfortable! I can wear it all day without any irritation. The quality is excellent and it looks very natural. The cap construction is perfect. I've received so many compliments. Highly recommend!",
    },
    {
        name: "Akua Kwarteng",
        email: "akua.kwarteng@example.com",
        productTitle: "Outre Synthetic Half Wig",
        title: "Perfect for quick styling!",
        comment: "This half wig is perfect for when I need a quick style! It blends seamlessly with my natural hair and looks very natural. The quality is great and it's easy to install. I use it all the time. Love it!",
    },
    {
        name: "Esi Boateng",
        email: "esi.boateng@example.com",
        productTitle: "African Pride Braid Sheen Spray",
        title: "Keeps my braids looking fresh!",
        comment: "This braid sheen spray is essential! It keeps my braids shiny and moisturized without making them greasy. The scent is pleasant and it doesn't leave any residue. My braids look brand new even after weeks. Highly recommend!",
    },
    {
        name: "Afi Osei",
        email: "afi.osei@example.com",
        productTitle: "Zury Sis Synthetic Crochet Braid",
        title: "Amazing texture and quality!",
        comment: "These crochet braids are fantastic! The texture is perfect and they look very natural. Installation was easy and they've held up really well. My protective style looks professional. Will definitely order more!",
    },
    {
        name: "Kukua Mensah",
        email: "kukua.mensah@example.com",
        productTitle: "Bobbi Boss Ponytail Extension",
        title: "Perfect for quick styles!",
        comment: "This ponytail extension is gorgeous! The quality is excellent and it looks very natural. Easy to attach and stays secure. The hair is soft and manageable. I've received so many compliments. Perfect for quick styling!",
    },
    {
        name: "Serwaa Asare",
        email: "serwaa.asare@example.com",
        productTitle: "Sensationnel Human Hair Blend Wig",
        title: "Most natural looking wig!",
        comment: "This human hair blend wig is absolutely stunning! The quality is excellent and it looks very natural. It's comfortable to wear and easy to style. I've received so many compliments. Worth every cedi!",
    },
    {
        name: "Ama Adjei",
        email: "ama.adjei@example.com",
        productTitle: "Outre X-Pression Twisted Up Crochet Braid",
        title: "Love the unique texture!",
        comment: "These twisted crochet braids are amazing! The texture is unique and looks very natural. Installation was easy and they've held up really well. My protective style looks professional. Will order more colors!",
    },
    {
        name: "Efua Ampofo",
        email: "efua.ampofo@example.com",
        productTitle: "Freetress Synthetic Braiding Hair",
        title: "Perfect for protective styles!",
        comment: "This braiding hair is excellent quality! It's soft, doesn't tangle, and looks very natural. I've used it for various protective styles and they always come out perfect. Great value for money. Highly recommend!",
    },
    {
        name: "Akosua Owusu",
        email: "akosua.owusu@example.com",
        productTitle: "Simply Stylin Wig Detangler",
        title: "Makes detangling so easy!",
        comment: "This wig detangler is a lifesaver! It makes detangling so much easier and faster. The formula is gentle and doesn't damage the hair. My wigs look great after using this. Highly recommend for anyone with wigs!",
    },
    {
        name: "Adjoa Asante",
        email: "adjoa.asante@example.com",
        productTitle: "Mane Concept Crochet Braids",
        title: "Best crochet braids I've used!",
        comment: "These crochet braids are top quality! The texture is perfect and they look very natural. Installation was easy and they've held up really well. My protective style looks professional. Will definitely order more!",
    },
    {
        name: "Yaa Danso",
        email: "yaa.danso@example.com",
        productTitle: "Sensationnel Instant Weave Half Wig",
        title: "Perfect for quick styling!",
        comment: "This instant weave half wig is perfect! It blends seamlessly with my natural hair and looks very natural. The quality is great and it's easy to install. I use it all the time for quick styles. Love it!",
    },
    {
        name: "Maame Kwarteng",
        email: "maame.kwarteng@example.com",
        productTitle: "Bobbi Boss Synthetic Wig",
        title: "Great quality synthetic wig!",
        comment: "This synthetic wig is excellent quality! It looks very natural and is easy to style. The cap construction is comfortable and the hair feels soft. I've worn it multiple times and it still looks great. Highly recommend!",
    },
    {
        name: "Abena Boateng",
        email: "abena.boateng@example.com",
        productTitle: "Outre Human Hair Blend Clip-In Extensions",
        title: "Amazing quality extensions!",
        comment: "These clip-in extensions are fantastic! They blend seamlessly with my natural hair and the quality is excellent. Easy to install and remove. The hair feels soft and looks very natural. I've worn them multiple times and they still look great!",
    },
    {
        name: "Akua Osei",
        email: "akua.osei@example.com",
        productTitle: "Zury Sis Synthetic Braiding Hair",
        title: "Perfect for box braids!",
        comment: "This braiding hair is perfect for box braids! It's soft, doesn't tangle, and looks very natural. I've used it multiple times and the braids always come out perfect. Great value for money. Will definitely order more!",
    },
];
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var products, existingReviewsCount, reviewsNeeded, migratedCount, reviewsToCreate, createdCount, templateIndex, usedProducts, _loop_1, finalCount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("🚀 Starting product reviews creation...\n");
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
                    return [4 /*yield*/, prisma.review.count({
                            where: { isVerified: true },
                        })];
                case 2:
                    existingReviewsCount = _a.sent();
                    console.log("\uD83D\uDCCA Current verified reviews: ".concat(existingReviewsCount, "\n"));
                    reviewsNeeded = 32 - existingReviewsCount;
                    console.log("\u2728 Need to create ".concat(reviewsNeeded, " new reviews (target: 32 total)\n"));
                    migratedCount = 0;
                    reviewsToCreate = Math.max(reviewsNeeded - migratedCount, 0);
                    console.log("\uD83D\uDCDD Creating ".concat(reviewsToCreate, " new reviews...\n"));
                    createdCount = 0;
                    templateIndex = 0;
                    usedProducts = new Set();
                    _loop_1 = function () {
                        var i, template, product, unusedProducts, existingUser, user, hashedPassword, result, existingReview;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    i = templateIndex;
                                    templateIndex++;
                                    template = reviewTemplates[i];
                                    product = products.find(function (p) { var _a; return p.title.toLowerCase().includes(((_a = template.productTitle) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || ""); });
                                    if (!product) {
                                        unusedProducts = products.filter(function (p) { return !usedProducts.has(p.id); });
                                        if (unusedProducts.length > 0) {
                                            product = unusedProducts[Math.floor(Math.random() * unusedProducts.length)];
                                        }
                                        else {
                                            // If all products have been used, reset and use any product
                                            product = products[Math.floor(Math.random() * products.length)];
                                        }
                                    }
                                    // Mark product as used
                                    usedProducts.add(product.id);
                                    return [4 /*yield*/, prisma.$queryRaw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n      SELECT id, email, name FROM users WHERE email = ", " LIMIT 1\n    "], ["\n      SELECT id, email, name FROM users WHERE email = ", " LIMIT 1\n    "])), template.email)];
                                case 1:
                                    existingUser = _b.sent();
                                    user = existingUser[0] || null;
                                    if (!!user) return [3 /*break*/, 4];
                                    return [4 /*yield*/, bcrypt.hash("Password123!", 10)];
                                case 2:
                                    hashedPassword = _b.sent();
                                    return [4 /*yield*/, prisma.$queryRaw(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n        INSERT INTO users (id, email, password, name, role, \"createdAt\", \"updatedAt\")\n        VALUES (gen_random_uuid()::text, ", ", ", ", ", ", 'CUSTOMER', NOW(), NOW())\n        RETURNING id, email, name\n      "], ["\n        INSERT INTO users (id, email, password, name, role, \"createdAt\", \"updatedAt\")\n        VALUES (gen_random_uuid()::text, ", ", ", ", ", ", 'CUSTOMER', NOW(), NOW())\n        RETURNING id, email, name\n      "])), template.email, hashedPassword, template.name)];
                                case 3:
                                    result = _b.sent();
                                    user = result[0];
                                    console.log("  \u2705 Created user: ".concat(user.name));
                                    _b.label = 4;
                                case 4: return [4 /*yield*/, prisma.review.findFirst({
                                        where: {
                                            userId: user.id,
                                            productId: product.id,
                                        },
                                    })];
                                case 5:
                                    existingReview = _b.sent();
                                    if (!!existingReview) return [3 /*break*/, 7];
                                    return [4 /*yield*/, prisma.review.create({
                                            data: {
                                                userId: user.id,
                                                productId: product.id,
                                                rating: 5, // All 5-star
                                                title: template.title,
                                                comment: template.comment,
                                                isVerified: true,
                                            },
                                        })];
                                case 6:
                                    _b.sent();
                                    createdCount++;
                                    console.log("  \u2705 Created review by ".concat(template.name, " for: ").concat(product.title));
                                    return [3 /*break*/, 8];
                                case 7:
                                    console.log("  \u26A0\uFE0F  Review already exists for ".concat(template.name, " and ").concat(product.title));
                                    _b.label = 8;
                                case 8: return [2 /*return*/];
                            }
                        });
                    };
                    _a.label = 3;
                case 3:
                    if (!(createdCount < reviewsNeeded - migratedCount && templateIndex < reviewTemplates.length)) return [3 /*break*/, 5];
                    return [5 /*yield**/, _loop_1()];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 5: return [4 /*yield*/, prisma.review.count({
                        where: { isVerified: true },
                    })];
                case 6:
                    finalCount = _a.sent();
                    console.log("\n\u2705 Complete! Total verified reviews: ".concat(finalCount));
                    console.log("   - Migrated: ".concat(migratedCount));
                    console.log("   - Created: ".concat(createdCount));
                    console.log("   - All reviews are 5-star and verified\n");
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
var templateObject_1, templateObject_2;
