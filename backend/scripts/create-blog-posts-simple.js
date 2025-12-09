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
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var now, blogPosts, _i, blogPosts_1, postData, post, error_1, visiblePosts;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("📝 Creating blog posts...\n");
                    now = new Date();
                    blogPosts = [
                        {
                            title: "How to Care for Your Lace Wig: A Complete Guide",
                            slug: "how-to-care-for-your-lace-wig-complete-guide",
                            excerpt: "Learn the essential tips and tricks to maintain your lace wig and keep it looking fresh and natural for longer.",
                            content: "# How to Care for Your Lace Wig: A Complete Guide\n\nTaking care of your lace wig is essential to maintain its beauty and longevity.",
                            category: "Hair Care Tips",
                            tags: ["wig care", "maintenance", "tips"],
                            isPublished: true,
                            publishedAt: new Date(now.getTime() - 0),
                            authorName: "Juelle Hair Team",
                        },
                        {
                            title: "5 Protective Styles Using Braiding Hair",
                            slug: "5-protective-styles-using-braiding-hair",
                            excerpt: "Discover five beautiful protective hairstyles you can create with braiding hair to protect your natural hair while looking fabulous.",
                            content: "# 5 Protective Styles Using Braiding Hair\n\nProtective hairstyles are essential for maintaining healthy natural hair.",
                            category: "Styling Tips",
                            tags: ["protective styles", "braiding", "hairstyles"],
                            isPublished: true,
                            publishedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
                            authorName: "Juelle Hair Team",
                        },
                        {
                            title: "Choosing the Right Hair Color: A Complete Guide",
                            slug: "choosing-right-hair-color-complete-guide",
                            excerpt: "Not sure which hair color to choose? Our comprehensive guide will help you find the perfect shade to match your skin tone and style.",
                            content: "# Choosing the Right Hair Color: A Complete Guide\n\nFinding the perfect hair color can be overwhelming.",
                            category: "Buying Guide",
                            tags: ["hair color", "styling", "guide"],
                            isPublished: true,
                            publishedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
                            authorName: "Juelle Hair Team",
                        },
                        {
                            title: "Why Choose Glueless Lace Wigs?",
                            slug: "why-choose-glueless-lace-wigs",
                            excerpt: "Discover the benefits of glueless lace wigs and why they're becoming the preferred choice for wig wearers everywhere.",
                            content: "# Why Choose Glueless Lace Wigs?\n\nGlueless lace wigs are revolutionizing the wig industry.",
                            category: "Product Guide",
                            tags: ["glueless wigs", "lace wigs", "benefits"],
                            isPublished: true,
                            publishedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
                            authorName: "Juelle Hair Team",
                        },
                    ];
                    _i = 0, blogPosts_1 = blogPosts;
                    _a.label = 1;
                case 1:
                    if (!(_i < blogPosts_1.length)) return [3 /*break*/, 6];
                    postData = blogPosts_1[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, prisma.blogPost.upsert({
                            where: { slug: postData.slug },
                            update: __assign({}, postData),
                            create: postData,
                        })];
                case 3:
                    post = _a.sent();
                    console.log("\u2705 ".concat(post.title, " (").concat(post.category, ")"));
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.log("\u274C Error creating ".concat(postData.title, ":"), error_1.message);
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [4 /*yield*/, prisma.blogPost.findMany({
                        where: {
                            isPublished: true,
                            publishedAt: { lte: new Date() },
                        },
                        orderBy: { publishedAt: "desc" },
                        take: 4,
                    })];
                case 7:
                    visiblePosts = _a.sent();
                    console.log("\n\u2705 Created/Updated ".concat(blogPosts.length, " blog posts"));
                    console.log("\u2705 ".concat(visiblePosts.length, " posts are visible on frontend\n"));
                    visiblePosts.forEach(function (post, index) {
                        var _a;
                        console.log("   ".concat(index + 1, ". \"").concat(post.title, "\""));
                        console.log("      Category: ".concat(post.category || "N/A"));
                        console.log("      Published: ".concat(((_a = post.publishedAt) === null || _a === void 0 ? void 0 : _a.toLocaleDateString()) || "N/A", "\n"));
                    });
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
