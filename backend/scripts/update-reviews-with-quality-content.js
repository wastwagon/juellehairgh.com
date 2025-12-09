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
// SEO-optimized, promotional, and authentic review content
var qualityReviewTemplates = [
    {
        title: "Absolutely love this wig!",
        comment: "I've been wearing this lace front wig for 3 months now and it still looks amazing. The quality is excellent, very natural looking, and easy to style. The lace is undetectable and the hair feels soft and manageable. The color matches perfectly and it's comfortable to wear all day. Shipping was fast and the customer service was excellent. Highly recommend to anyone looking for a quality wig!",
    },
    {
        title: "Perfect for protective styling!",
        comment: "These crochet braids are amazing! They installed easily, look very natural, and have held up well over the past 2 months. The texture is perfect and they're not too heavy. My natural hair is thriving underneath. The quality is excellent for the price and they're easy to maintain. Will definitely order again in different colors!",
    },
    {
        title: "Keeps my braids looking fresh!",
        comment: "This spray is a game changer! It keeps my braids shiny and moisturized without making them greasy. The scent is pleasant and it doesn't leave any residue. My braids look brand new even after weeks of wear. I use it daily and it's become an essential part of my hair care routine. Highly recommend for anyone with braids or extensions!",
    },
    {
        title: "Great quality clip-in extensions!",
        comment: "These clip-in extensions blend perfectly with my natural hair. The texture matches well and they're easy to install. The quality is excellent for the price. I've worn them multiple times and they still look great. The clips are secure and comfortable. Perfect for adding volume and length when needed. Very satisfied with my purchase!",
    },
    {
        title: "Love the texture and durability!",
        comment: "These crochet braids are fantastic! The texture is exactly what I wanted and they've lasted much longer than I expected. Easy to install and maintain. My friends keep asking where I got them from. The quality is top-notch and they look very natural. Will definitely be ordering more colors for different styles!",
    },
    {
        title: "Most natural looking wig I've owned!",
        comment: "This wig is absolutely stunning! The lace front is so natural and undetectable. The hair quality is excellent and it's very comfortable to wear. I've received so many compliments. The color matches perfectly and it's easy to style. The cap construction is perfect. Worth every cedi! I'll definitely be ordering more styles from this brand.",
    },
    {
        title: "Perfect for box braids!",
        comment: "This braiding hair is soft, doesn't tangle easily, and looks very natural. I've used it for box braids and they came out beautifully. The hair holds well and doesn't shed. Great value for money. The quality is consistent throughout the pack. I'll definitely be ordering more for my next protective style!",
    },
    {
        title: "Amazing quality extensions!",
        comment: "These clip-in extensions are fantastic! They blend seamlessly with my natural hair and the quality is excellent. Easy to install and remove. The hair feels soft and looks very natural. I've worn them multiple times and they still look great. The clips are strong and secure. Highly recommend for anyone wanting to add length or volume!",
    },
    {
        title: "Keeps my wigs looking brand new!",
        comment: "This wig spray is a must-have! It keeps my synthetic wigs looking fresh and prevents them from getting frizzy. The formula is lightweight and doesn't leave any buildup. My wigs look brand new even after months of wear. I use it regularly and it's made a huge difference in maintaining my wig collection. Excellent product!",
    },
    {
        title: "Love the pre-fluffed texture!",
        comment: "These crochet braids are perfect! The pre-fluffed texture saves me so much time and they look amazing. The quality is great and they've held up well. Easy to install and maintain. My protective style looks professional. The texture is exactly as advertised. Will order again for my next style!",
    },
    {
        title: "Best braiding hair I've used!",
        comment: "This braiding hair is top quality! It's soft, doesn't tangle, and looks very natural. I've used it for various protective styles and it always comes out perfect. The hair holds well and doesn't shed. Great value for money. The consistency is excellent across all packs. Highly recommend for any protective styling needs!",
    },
    {
        title: "Perfect ponytail extension!",
        comment: "This ponytail extension is gorgeous! The quality is excellent and it looks very natural. Easy to attach and stays secure. The hair is soft and manageable. I've received so many compliments. Perfect for quick styling when I need to look put together fast. Will definitely order more in different colors!",
    },
    {
        title: "Absolutely stunning quality!",
        comment: "This HD lace front wig is incredible! The lace is so transparent and undetectable. The hair quality is premium and it's very comfortable to wear all day. I've worn it multiple times and it still looks brand new. The color matches perfectly and it's easy to style. Highly recommend to anyone looking for a quality wig!",
    },
    {
        title: "Saves so much time!",
        comment: "These pre-looped crochet braids are a game changer! Installation was super quick and they look amazing. The texture is perfect and they've held up really well. My protective style looks professional. The quality is excellent and they're easy to maintain. Will definitely order again for my next protective style!",
    },
    {
        title: "Perfect for box braids!",
        comment: "This braiding hair is excellent quality! It's soft, doesn't tangle, and looks very natural. I've used it for box braids multiple times and they always come out perfect. The hair holds well and doesn't shed. Great value for money. The consistency is excellent. I'll definitely be ordering more!",
    },
    {
        title: "Keeps my hair smooth all day!",
        comment: "This anti-frizz serum is amazing! It keeps my hair smooth and shiny without making it greasy. The formula is lightweight and doesn't weigh my hair down. My hair looks great even in humid weather. I use it daily and it's become essential. Love how it makes my hair manageable and frizz-free!",
    },
    {
        title: "Love the texture!",
        comment: "These pre-fluffed crochet braids are fantastic! The texture is exactly what I wanted and they saved me so much time. The quality is great and they've lasted well. Easy to install and maintain. My protective style looks professional and natural. Will order more colors for variety!",
    },
    {
        title: "Best braiding hair I've tried!",
        comment: "This braiding hair is top quality! It's soft, doesn't tangle, and looks very natural. I've used it for various protective styles and it always comes out perfect. The hair holds well and doesn't shed. Excellent value for money. The quality is consistent throughout. Highly recommend!",
    },
    {
        title: "Most comfortable wig ever!",
        comment: "This glueless wig is so comfortable! I can wear it all day without any irritation. The quality is excellent and it looks very natural. The cap construction is perfect. I've received so many compliments. The hair quality is premium. Highly recommend to anyone looking for comfort and style!",
    },
    {
        title: "Perfect for quick styling!",
        comment: "This half wig is perfect for when I need a quick style! It blends seamlessly with my natural hair and looks very natural. The quality is great and it's easy to install. I use it all the time for quick looks. The clips are secure and comfortable. Love how versatile it is!",
    },
];
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var reviews, testUserReviews, updatedCount, templateIndex, reviewsToUpdate, _i, reviewsToUpdate_1, review, currentText, template, finalCount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("🚀 Starting review content update...\n");
                    return [4 /*yield*/, prisma.review.findMany({
                            where: {
                                isVerified: true,
                            },
                            include: {
                                user: {
                                    select: {
                                        name: true,
                                        email: true,
                                    },
                                },
                            },
                            orderBy: {
                                createdAt: "desc",
                            },
                        })];
                case 1:
                    reviews = _a.sent();
                    console.log("\uD83D\uDCCA Found ".concat(reviews.length, " verified reviews\n"));
                    // Remove Test User reviews
                    console.log("🗑️  Removing Test User reviews...");
                    return [4 /*yield*/, prisma.review.findMany({
                            where: {
                                user: {
                                    OR: [
                                        { name: { contains: "Test", mode: "insensitive" } },
                                        { email: { contains: "test", mode: "insensitive" } },
                                    ],
                                },
                            },
                        })];
                case 2:
                    testUserReviews = _a.sent();
                    if (!(testUserReviews.length > 0)) return [3 /*break*/, 4];
                    return [4 /*yield*/, prisma.review.deleteMany({
                            where: {
                                id: { in: testUserReviews.map(function (r) { return r.id; }) },
                            },
                        })];
                case 3:
                    _a.sent();
                    console.log("  \u2705 Removed ".concat(testUserReviews.length, " Test User reviews\n"));
                    return [3 /*break*/, 5];
                case 4:
                    console.log("  ℹ️  No Test User reviews found\n");
                    _a.label = 5;
                case 5:
                    // Update reviews with quality content
                    console.log("📝 Updating reviews with quality content...\n");
                    updatedCount = 0;
                    templateIndex = 0;
                    return [4 /*yield*/, prisma.review.findMany({
                            where: {
                                isVerified: true,
                                user: {
                                    NOT: {
                                        OR: [
                                            { name: { contains: "Test", mode: "insensitive" } },
                                            { email: { contains: "test", mode: "insensitive" } },
                                        ],
                                    },
                                },
                            },
                            include: {
                                user: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                        })];
                case 6:
                    reviewsToUpdate = _a.sent();
                    _i = 0, reviewsToUpdate_1 = reviewsToUpdate;
                    _a.label = 7;
                case 7:
                    if (!(_i < reviewsToUpdate_1.length)) return [3 /*break*/, 10];
                    review = reviewsToUpdate_1[_i];
                    currentText = (review.comment || "") + (review.title || "");
                    if (!(currentText.trim().length < 100)) return [3 /*break*/, 9];
                    template = qualityReviewTemplates[templateIndex % qualityReviewTemplates.length];
                    templateIndex++;
                    return [4 /*yield*/, prisma.review.update({
                            where: { id: review.id },
                            data: {
                                title: template.title,
                                comment: template.comment,
                            },
                        })];
                case 8:
                    _a.sent();
                    updatedCount++;
                    console.log("  \u2705 Updated review by ".concat(review.user.name, ": \"").concat(template.title, "\""));
                    _a.label = 9;
                case 9:
                    _i++;
                    return [3 /*break*/, 7];
                case 10: return [4 /*yield*/, prisma.review.count({
                        where: { isVerified: true },
                    })];
                case 11:
                    finalCount = _a.sent();
                    console.log("\n\u2705 Complete!");
                    console.log("   - Updated ".concat(updatedCount, " reviews with quality content"));
                    console.log("   - Total verified reviews: ".concat(finalCount, "\n"));
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
