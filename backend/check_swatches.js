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
function checkColorSwatches() {
    return __awaiter(this, void 0, void 0, function () {
        var attributeTerms, variants, totalVariantsWithImages;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🔍 Checking for color swatch images in database...\n');
                    // Check ProductAttributeTerm (color swatches)
                    console.log('1. Checking ProductAttributeTerm (attribute-based swatches):');
                    return [4 /*yield*/, prisma.productAttributeTerm.findMany({
                            where: {
                                image: { not: null },
                            },
                            include: {
                                attribute: true,
                            },
                        })];
                case 1:
                    attributeTerms = _a.sent();
                    console.log("   Found ".concat(attributeTerms.length, " attribute terms with images:"));
                    attributeTerms.forEach(function (term) {
                        console.log("   - ".concat(term.attribute.name, ": ").concat(term.name, " \u2192 ").concat(term.image));
                    });
                    // Check ProductVariant (variant-based swatches)
                    console.log('\n2. Checking ProductVariant (variant-based swatches):');
                    return [4 /*yield*/, prisma.productVariant.findMany({
                            where: {
                                image: { not: null },
                            },
                            include: {
                                product: {
                                    select: { title: true, slug: true },
                                },
                            },
                            take: 20, // Limit to first 20
                        })];
                case 2:
                    variants = _a.sent();
                    console.log("   Found ".concat(variants.length, " variants with images (showing first 20):"));
                    variants.forEach(function (variant) {
                        console.log("   - Product: ".concat(variant.product.title));
                        console.log("     Variant: ".concat(variant.name, " = ").concat(variant.value));
                        console.log("     Image: ".concat(variant.image));
                        console.log('');
                    });
                    return [4 /*yield*/, prisma.productVariant.count({
                            where: {
                                image: { not: null },
                            },
                        })];
                case 3:
                    totalVariantsWithImages = _a.sent();
                    console.log("\n\uD83D\uDCCA Summary:");
                    console.log("   - Attribute terms with images: ".concat(attributeTerms.length));
                    console.log("   - Product variants with images: ".concat(totalVariantsWithImages));
                    console.log("   - Total color swatch images: ".concat(attributeTerms.length + totalVariantsWithImages));
                    return [4 /*yield*/, prisma.$disconnect()];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
checkColorSwatches().catch(console.error);
