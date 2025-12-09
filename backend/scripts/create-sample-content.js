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
        var badges, _i, badges_1, badge, trustBadges, _a, trustBadges_1, badge, products, testimonials, _b, testimonials_1, testimonial, flashSaleProducts, flashSale, blogPosts, _c, blogPosts_1, post;
        var _d, _e, _f, _g, _h;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    console.log("Creating sample content for Juelle Hair Ghana...");
                    // 1. Create Badge Templates
                    console.log("Creating badge templates...");
                    badges = [
                        {
                            name: "NEW",
                            label: "New",
                            color: "#10B981",
                            textColor: "#FFFFFF",
                            style: "rounded",
                            isPredefined: true,
                            isActive: true,
                        },
                        {
                            name: "BEST",
                            label: "Best Seller",
                            color: "#F59E0B",
                            textColor: "#FFFFFF",
                            style: "rounded",
                            isPredefined: true,
                            isActive: true,
                        },
                        {
                            name: "SALE",
                            label: "Sale",
                            color: "#EF4444",
                            textColor: "#FFFFFF",
                            style: "rounded",
                            isPredefined: true,
                            isActive: true,
                        },
                        {
                            name: "GLUELESS",
                            label: "Glueless",
                            color: "#8B5CF6",
                            textColor: "#FFFFFF",
                            style: "rounded",
                            isPredefined: false,
                            isActive: true,
                        },
                        {
                            name: "PREMIUM",
                            label: "Premium",
                            color: "#EC4899",
                            textColor: "#FFFFFF",
                            style: "rounded",
                            isPredefined: false,
                            isActive: true,
                        },
                    ];
                    _i = 0, badges_1 = badges;
                    _j.label = 1;
                case 1:
                    if (!(_i < badges_1.length)) return [3 /*break*/, 4];
                    badge = badges_1[_i];
                    return [4 /*yield*/, prisma.badgeTemplate.upsert({
                            where: { name: badge.name },
                            update: badge,
                            create: badge,
                        })];
                case 2:
                    _j.sent();
                    _j.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    console.log("✅ Created badge templates");
                    // 2. Create Trust Badges
                    console.log("Creating trust badges...");
                    trustBadges = [
                        {
                            title: "Free Shipping",
                            description: "Free shipping on orders over GH₵ 950",
                            icon: "🚚",
                            image: null,
                            link: null,
                            isActive: true,
                            position: 1,
                        },
                        {
                            title: "Secure Payment",
                            description: "100% secure payment with Paystack",
                            icon: "🔒",
                            image: null,
                            link: null,
                            isActive: true,
                            position: 2,
                        },
                        {
                            title: "Easy Returns",
                            description: "30-day return policy",
                            icon: "↩️",
                            image: null,
                            link: null,
                            isActive: true,
                            position: 3,
                        },
                        {
                            title: "Authentic Products",
                            description: "100% authentic hair products",
                            icon: "✓",
                            image: null,
                            link: null,
                            isActive: true,
                            position: 4,
                        },
                        {
                            title: "Customer Support",
                            description: "24/7 WhatsApp support",
                            icon: "💬",
                            image: null,
                            link: null,
                            isActive: true,
                            position: 5,
                        },
                    ];
                    _a = 0, trustBadges_1 = trustBadges;
                    _j.label = 5;
                case 5:
                    if (!(_a < trustBadges_1.length)) return [3 /*break*/, 8];
                    badge = trustBadges_1[_a];
                    return [4 /*yield*/, prisma.trustBadge.create({
                            data: badge,
                        })];
                case 6:
                    _j.sent();
                    _j.label = 7;
                case 7:
                    _a++;
                    return [3 /*break*/, 5];
                case 8:
                    console.log("✅ Created trust badges");
                    return [4 /*yield*/, prisma.product.findMany({
                            take: 5,
                            where: { isActive: true },
                        })];
                case 9:
                    products = _j.sent();
                    // 4. Create Testimonials
                    console.log("Creating testimonials...");
                    testimonials = [
                        {
                            customerName: "Ama Mensah",
                            customerEmail: "ama.mensah@example.com",
                            customerImage: null,
                            rating: 5,
                            review: "I absolutely love my Bobbi Boss ponytail! The quality is amazing and it looks so natural. Shipping was fast and the customer service was excellent. Will definitely order again!",
                            productId: ((_d = products[0]) === null || _d === void 0 ? void 0 : _d.id) || null,
                            isApproved: true,
                            isFeatured: true,
                            position: 1,
                        },
                        {
                            customerName: "Efua Asante",
                            customerEmail: "efua.asante@example.com",
                            customerImage: null,
                            rating: 5,
                            review: "Best hair extensions I've ever bought! The Sensationnel lace wig is so comfortable and looks exactly like my natural hair. Highly recommend Juelle Hair!",
                            productId: ((_e = products[1]) === null || _e === void 0 ? void 0 : _e.id) || null,
                            isApproved: true,
                            isFeatured: true,
                            position: 2,
                        },
                        {
                            customerName: "Akosua Osei",
                            customerEmail: "akosua.osei@example.com",
                            customerImage: null,
                            rating: 5,
                            review: "The FreeTress braiding hair is perfect for my protective styles. Great quality, soft texture, and holds well. Great value for money!",
                            productId: ((_f = products[2]) === null || _f === void 0 ? void 0 : _f.id) || null,
                            isApproved: true,
                            isFeatured: true,
                            position: 3,
                        },
                        {
                            customerName: "Yaa Boateng",
                            customerEmail: "yaa.boateng@example.com",
                            customerImage: null,
                            rating: 4,
                            review: "Love the variety of colors available. The hair blends perfectly with my natural hair. Only wish there were more length options, but overall very satisfied!",
                            productId: ((_g = products[3]) === null || _g === void 0 ? void 0 : _g.id) || null,
                            isApproved: true,
                            isFeatured: false,
                            position: 4,
                        },
                        {
                            customerName: "Adjoa Kwarteng",
                            customerEmail: "adjoa.kwarteng@example.com",
                            customerImage: null,
                            rating: 5,
                            review: "Excellent customer service! They helped me choose the perfect wig for my face shape. The glueless lace wig is a game changer - so easy to install!",
                            productId: ((_h = products[4]) === null || _h === void 0 ? void 0 : _h.id) || null,
                            isApproved: true,
                            isFeatured: false,
                            position: 5,
                        },
                    ];
                    _b = 0, testimonials_1 = testimonials;
                    _j.label = 10;
                case 10:
                    if (!(_b < testimonials_1.length)) return [3 /*break*/, 13];
                    testimonial = testimonials_1[_b];
                    return [4 /*yield*/, prisma.testimonial.create({
                            data: testimonial,
                        })];
                case 11:
                    _j.sent();
                    _j.label = 12;
                case 12:
                    _b++;
                    return [3 /*break*/, 10];
                case 13:
                    console.log("✅ Created testimonials");
                    // 5. Create Flash Sale
                    console.log("Creating flash sale...");
                    return [4 /*yield*/, prisma.product.findMany({
                            take: 6,
                            where: { isActive: true },
                        })];
                case 14:
                    flashSaleProducts = _j.sent();
                    return [4 /*yield*/, prisma.flashSale.create({
                            data: {
                                title: "Black Friday Mega Sale",
                                description: "Get up to 30% off on selected hair products! Limited time offer.",
                                startDate: new Date(),
                                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                                discountPercent: 30.0,
                                isActive: true,
                            },
                        })];
                case 15:
                    flashSale = _j.sent();
                    if (!(flashSaleProducts.length > 0)) return [3 /*break*/, 17];
                    return [4 /*yield*/, prisma.flashSaleProduct.createMany({
                            data: flashSaleProducts.map(function (product) { return ({
                                flashSaleId: flashSale.id,
                                productId: product.id,
                            }); }),
                            skipDuplicates: true,
                        })];
                case 16:
                    _j.sent();
                    _j.label = 17;
                case 17:
                    console.log("✅ Created flash sale");
                    // 6. Create Blog Posts
                    console.log("Creating blog posts...");
                    blogPosts = [
                        {
                            title: "How to Care for Your Lace Wig: A Complete Guide",
                            slug: "how-to-care-for-your-lace-wig-complete-guide",
                            excerpt: "Learn the essential tips and tricks to maintain your lace wig and keep it looking fresh and natural for longer.",
                            content: "\n# How to Care for Your Lace Wig: A Complete Guide\n\nLace wigs are a fantastic way to change up your look, but they require proper care to maintain their quality and longevity. Here's everything you need to know about caring for your lace wig.\n\n## Daily Maintenance\n\n### Brushing and Detangling\n- Always use a wide-tooth comb or a wig brush designed for synthetic or human hair\n- Start from the ends and work your way up to prevent breakage\n- Be gentle, especially around the lace front area\n\n### Washing Your Wig\n- Wash your wig every 2-3 weeks, or more frequently if you use a lot of products\n- Use sulfate-free shampoo and conditioner\n- Gently massage the shampoo into the hair, avoiding the lace\n- Rinse thoroughly with cool water\n\n## Storage Tips\n\n- Store your wig on a wig stand or mannequin head to maintain its shape\n- Keep it away from direct sunlight and heat sources\n- Use a satin or silk bag to prevent tangling\n\n## Common Mistakes to Avoid\n\n1. **Using regular hair products** - Always use products specifically designed for wigs\n2. **Brushing when wet** - This can cause breakage and damage\n3. **Sleeping in your wig** - Remove it before bed to extend its lifespan\n4. **Using heat without protection** - Always use heat protectant if styling with heat\n\n## Pro Tips\n\n- Invest in a good wig cap to protect your natural hair\n- Rotate between multiple wigs to extend their lifespan\n- Get your wig professionally styled if you're unsure\n\nWith proper care, your lace wig can last for months or even years!\n      ",
                            featuredImage: null,
                            authorName: "Juelle Hair Team",
                            category: "Hair Care Tips",
                            tags: ["lace wig", "wig care", "hair care", "tutorial"],
                            isPublished: true,
                            publishedAt: new Date(),
                            seoTitle: "Complete Guide to Lace Wig Care | Juelle Hair Ghana",
                            seoDescription: "Learn how to properly care for your lace wig with our comprehensive guide. Tips for washing, styling, and maintaining your wig.",
                        },
                        {
                            title: "5 Protective Styles Using Braiding Hair",
                            slug: "5-protective-styles-using-braiding-hair",
                            excerpt: "Discover five beautiful protective hairstyles you can create with braiding hair to protect your natural hair while looking fabulous.",
                            content: "\n# 5 Protective Styles Using Braiding Hair\n\nProtective styles are essential for maintaining healthy hair growth. Here are five stunning styles you can achieve with braiding hair from Juelle Hair.\n\n## 1. Box Braids\n\nBox braids are a classic protective style that never goes out of fashion. They're versatile, low-maintenance, and perfect for any occasion.\n\n**What you'll need:**\n- FreeTress or Bobbi Boss braiding hair\n- Edge control\n- Hair oil\n\n**Installation time:** 4-6 hours\n\n## 2. Passion Twists\n\nPassion twists offer a softer, more natural look than traditional braids. They're perfect for those who want a protective style with a modern twist.\n\n**What you'll need:**\n- Passion twist braiding hair\n- Styling gel\n- Hair clips\n\n## 3. Crochet Braids\n\nCrochet braids are quick to install and offer endless styling possibilities. Perfect for beginners!\n\n**Benefits:**\n- Quick installation (1-2 hours)\n- Versatile styling options\n- Easy to maintain\n\n## 4. Faux Locs\n\nFaux locs give you the look of traditional locs without the commitment. They're stylish and protective.\n\n## 5. Knotless Braids\n\nKnotless braids are gentler on your scalp and edges. They're the perfect protective style for those with sensitive scalps.\n\n## Maintenance Tips\n\n- Moisturize your scalp regularly\n- Protect your hair at night with a satin bonnet\n- Don't keep styles in for more than 8-10 weeks\n\nChoose the style that best fits your lifestyle and hair goals!\n      ",
                            featuredImage: null,
                            authorName: "Juelle Hair Team",
                            category: "Styling Tips",
                            tags: ["protective styles", "braiding hair", "hairstyles", "hair care"],
                            isPublished: true,
                            publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                            seoTitle: "5 Protective Styles with Braiding Hair | Juelle Hair",
                            seoDescription: "Discover five beautiful protective hairstyles using braiding hair. Step-by-step guides for box braids, passion twists, and more.",
                        },
                        {
                            title: "Choosing the Right Hair Color: A Complete Guide",
                            slug: "choosing-right-hair-color-complete-guide",
                            excerpt: "Not sure which hair color to choose? Our comprehensive guide will help you find the perfect shade to match your skin tone and style.",
                            content: "\n# Choosing the Right Hair Color: A Complete Guide\n\nSelecting the perfect hair color can be overwhelming with so many options available. Here's how to choose the right shade for you.\n\n## Understanding Color Numbers\n\nHair colors are typically numbered:\n- **1B** - Off Black (most common)\n- **2** - Darkest Brown\n- **4** - Medium Brown\n- **27** - Strawberry Blonde\n- **30** - Light Auburn\n- **613** - Lightest Blonde\n\n## Matching Your Skin Tone\n\n### Warm Undertones\nIf you have warm undertones (yellow, golden, or peachy), consider:\n- Colors 27, 30, 33\n- Warm browns and auburns\n- Golden highlights\n\n### Cool Undertones\nIf you have cool undertones (pink, blue, or red), consider:\n- Colors 1B, 2, 4\n- Ash browns\n- Cool-toned highlights\n\n## Popular Color Choices\n\n### 1B (Off Black)\n- Most versatile color\n- Matches most natural hair\n- Perfect for beginners\n\n### 4 (Medium Brown)\n- Natural-looking\n- Easy to blend\n- Great for highlights\n\n### 27 (Strawberry Blonde)\n- Bold and vibrant\n- Perfect for summer\n- Great for highlights\n\n## Tips for First-Time Buyers\n\n1. **Start with 1B** if you're unsure - it's the safest choice\n2. **Consider your natural hair color** - choose something close for easier blending\n3. **Think about maintenance** - lighter colors may require more upkeep\n4. **Check return policies** - some colors can't be returned once opened\n\n## Mixing Colors\n\nDon't be afraid to mix colors for a custom look! Many customers mix:\n- 1B and 2 for depth\n- 4 and 27 for dimension\n- Multiple shades for highlights\n\nNeed help choosing? Contact our customer service team for personalized recommendations!\n      ",
                            featuredImage: null,
                            authorName: "Juelle Hair Team",
                            category: "Buying Guide",
                            tags: ["hair color", "buying guide", "styling", "tips"],
                            isPublished: true,
                            publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
                            seoTitle: "How to Choose the Right Hair Color | Juelle Hair Ghana",
                            seoDescription: "Complete guide to choosing the perfect hair color. Learn about color numbers, skin tone matching, and popular color choices.",
                        },
                        {
                            title: "Why Choose Glueless Lace Wigs?",
                            slug: "why-choose-glueless-lace-wigs",
                            excerpt: "Discover the benefits of glueless lace wigs and why they're becoming the preferred choice for wig wearers everywhere.",
                            content: "\n# Why Choose Glueless Lace Wigs?\n\nGlueless lace wigs are revolutionizing the wig industry. Here's why they're the best choice for both beginners and experienced wig wearers.\n\n## What Are Glueless Lace Wigs?\n\nGlueless lace wigs are designed to be installed without adhesives. They typically feature:\n- Adjustable straps\n- Combs for secure attachment\n- Pre-plucked hairlines\n- Baby hairs for natural look\n\n## Benefits of Glueless Wigs\n\n### 1. Easy Installation\n- No messy glues or adhesives\n- Quick to put on and take off\n- Perfect for beginners\n\n### 2. Scalp-Friendly\n- No irritation from adhesives\n- Allows your scalp to breathe\n- Better for sensitive skin\n\n### 3. Versatile Styling\n- Can be styled in multiple ways\n- Easy to switch up your look\n- No commitment to one style\n\n### 4. Cost-Effective\n- No need to buy adhesives\n- Longer lifespan with proper care\n- Better value for money\n\n## Installation Tips\n\n1. **Prepare your hair** - Braid or flatten your natural hair\n2. **Wear a wig cap** - Protects your hair and provides grip\n3. **Adjust the straps** - Find the perfect fit\n4. **Secure with combs** - Use the built-in combs for extra security\n5. **Style as desired** - Part, curl, or straighten as you like\n\n## Maintenance\n\n- Remove before sleeping\n- Store on a wig stand\n- Wash regularly with wig-specific products\n- Avoid excessive heat\n\n## Popular Glueless Wig Styles\n\n- **360 Lace Wigs** - Full perimeter lace\n- **Lace Front Wigs** - Lace only at the front\n- **Full Lace Wigs** - Complete lace coverage\n\nReady to try a glueless wig? Browse our collection of premium glueless lace wigs!\n      ",
                            featuredImage: null,
                            authorName: "Juelle Hair Team",
                            category: "Product Guide",
                            tags: ["glueless wigs", "lace wigs", "wig guide", "hair extensions"],
                            isPublished: true,
                            publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
                            seoTitle: "Benefits of Glueless Lace Wigs | Juelle Hair",
                            seoDescription: "Discover why glueless lace wigs are the best choice. Learn about easy installation, scalp-friendly design, and versatile styling options.",
                        },
                    ];
                    _c = 0, blogPosts_1 = blogPosts;
                    _j.label = 18;
                case 18:
                    if (!(_c < blogPosts_1.length)) return [3 /*break*/, 21];
                    post = blogPosts_1[_c];
                    return [4 /*yield*/, prisma.blogPost.upsert({
                            where: { slug: post.slug },
                            update: post,
                            create: post,
                        })];
                case 19:
                    _j.sent();
                    _j.label = 20;
                case 20:
                    _c++;
                    return [3 /*break*/, 18];
                case 21:
                    console.log("✅ Created blog posts");
                    console.log("\n🎉 All sample content created successfully!");
                    console.log("\nSummary:");
                    console.log("- ".concat(badges.length, " Badge Templates"));
                    console.log("- ".concat(trustBadges.length, " Trust Badges"));
                    console.log("- ".concat(testimonials.length, " Testimonials"));
                    console.log("- 1 Flash Sale with ".concat(flashSaleProducts.length, " products"));
                    console.log("- ".concat(blogPosts.length, " Blog Posts"));
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
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
