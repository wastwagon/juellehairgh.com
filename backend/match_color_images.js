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
// Common color name mappings and their potential image paths
var colorImageMap = {
    'black': ['/swatches/black.png', '/swatches/black.jpg', '/colors/black.png', '/colors/black.jpg', 'black.png', 'black.jpg'],
    'brown': ['/swatches/brown.png', '/swatches/brown.jpg', '/colors/brown.png', '/colors/brown.jpg', 'brown.png', 'brown.jpg'],
    'blonde': ['/swatches/blonde.png', '/swatches/blonde.jpg', '/colors/blonde.png', '/colors/blonde.jpg', 'blonde.png', 'blonde.jpg'],
    'red': ['/swatches/red.png', '/swatches/red.jpg', '/colors/red.png', '/colors/red.jpg', 'red.png', 'red.jpg'],
    'blue': ['/swatches/blue.png', '/swatches/blue.jpg', '/colors/blue.png', '/colors/blue.jpg', 'blue.png', 'blue.jpg'],
    'green': ['/swatches/green.png', '/swatches/green.jpg', '/colors/green.png', '/colors/green.jpg', 'green.png', 'green.jpg'],
    'purple': ['/swatches/purple.png', '/swatches/purple.jpg', '/colors/purple.png', '/colors/purple.jpg', 'purple.png', 'purple.jpg'],
    'burgundy': ['/swatches/burgundy.png', '/swatches/burgundy.jpg', '/colors/burgundy.png', '/colors/burgundy.jpg', 'burgundy.png', 'burgundy.jpg'],
    'honey': ['/swatches/honey.png', '/swatches/honey.jpg', '/colors/honey.png', '/colors/honey.jpg', 'honey.png', 'honey.jpg'],
    'caramel': ['/swatches/caramel.png', '/swatches/caramel.jpg', '/colors/caramel.png', '/colors/caramel.jpg', 'caramel.png', 'caramel.jpg'],
    'mocha': ['/swatches/mocha.png', '/swatches/mocha.jpg', '/colors/mocha.png', '/colors/mocha.jpg', 'mocha.png', 'mocha.jpg'],
    'auburn': ['/swatches/auburn.png', '/swatches/auburn.jpg', '/colors/auburn.png', '/colors/auburn.jpg', 'auburn.png', 'auburn.jpg'],
    'hazelnut': ['/swatches/hazelnut.png', '/swatches/hazelnut.jpg', '/colors/hazelnut.png', '/colors/hazelnut.jpg', 'hazelnut.png', 'hazelnut.jpg'],
    'chocolate': ['/swatches/chocolate.png', '/swatches/chocolate.jpg', '/colors/chocolate.png', '/colors/chocolate.jpg', 'chocolate.png', 'chocolate.jpg'],
    'sand': ['/swatches/sand.png', '/swatches/sand.jpg', '/colors/sand.png', '/colors/sand.jpg', 'sand.png', 'sand.jpg'],
    'gold': ['/swatches/gold.png', '/swatches/gold.jpg', '/colors/gold.png', '/colors/gold.jpg', 'gold.png', 'gold.jpg'],
    'copper': ['/swatches/copper.png', '/swatches/copper.jpg', '/colors/copper.png', '/colors/copper.jpg', 'copper.png', 'copper.jpg'],
};
function matchColorImages() {
    return __awaiter(this, void 0, void 0, function () {
        var colorAttribute, variantsWithImages, variantImageMap, termsWithImages, updated, skipped, _i, _a, term, termNameLower, imageUrl, _b, _c, _d, variantColor, image, _e, _f, _g, colorKey, imagePaths, error_1;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    console.log('🔍 Checking for color swatch images and matching to color terms...\n');
                    return [4 /*yield*/, prisma.productAttribute.findFirst({
                            where: {
                                name: { equals: 'Color', mode: 'insensitive' },
                            },
                            include: {
                                terms: true,
                            },
                        })];
                case 1:
                    colorAttribute = _h.sent();
                    if (!!colorAttribute) return [3 /*break*/, 3];
                    console.log('❌ Color attribute not found');
                    return [4 /*yield*/, prisma.$disconnect()];
                case 2:
                    _h.sent();
                    return [2 /*return*/];
                case 3:
                    console.log("\u2705 Found Color attribute with ".concat(colorAttribute.terms.length, " terms\n"));
                    return [4 /*yield*/, prisma.productVariant.findMany({
                            where: {
                                image: { not: null },
                                name: { contains: 'color', mode: 'insensitive' },
                            },
                            select: {
                                value: true,
                                image: true,
                            },
                            take: 100,
                        })];
                case 4:
                    variantsWithImages = _h.sent();
                    console.log("\uD83D\uDCE6 Found ".concat(variantsWithImages.length, " product variants with color images\n"));
                    variantImageMap = new Map();
                    variantsWithImages.forEach(function (v) {
                        if (v.value && v.image) {
                            var key = v.value.toLowerCase().trim();
                            if (!variantImageMap.has(key)) {
                                variantImageMap.set(key, v.image);
                            }
                        }
                    });
                    console.log('📋 Variant color-to-image mappings:');
                    variantImageMap.forEach(function (image, color) {
                        console.log("   ".concat(color, " \u2192 ").concat(image));
                    });
                    console.log('');
                    return [4 /*yield*/, prisma.productAttributeTerm.findMany({
                            where: {
                                attributeId: colorAttribute.id,
                                image: { not: null },
                            },
                        })];
                case 5:
                    termsWithImages = _h.sent();
                    console.log("\uD83D\uDDBC\uFE0F  Found ".concat(termsWithImages.length, " color terms that already have images\n"));
                    updated = 0;
                    skipped = 0;
                    _i = 0, _a = colorAttribute.terms;
                    _h.label = 6;
                case 6:
                    if (!(_i < _a.length)) return [3 /*break*/, 13];
                    term = _a[_i];
                    termNameLower = term.name.toLowerCase().trim();
                    // Skip if already has image
                    if (term.image) {
                        skipped++;
                        return [3 /*break*/, 12];
                    }
                    imageUrl = null;
                    // Direct match
                    if (variantImageMap.has(termNameLower)) {
                        imageUrl = variantImageMap.get(termNameLower);
                    }
                    else {
                        // Partial match (e.g., "honey blonde" contains "honey")
                        for (_b = 0, _c = variantImageMap.entries(); _b < _c.length; _b++) {
                            _d = _c[_b], variantColor = _d[0], image = _d[1];
                            if (termNameLower.includes(variantColor) || variantColor.includes(termNameLower)) {
                                imageUrl = image;
                                break;
                            }
                        }
                    }
                    // Try color name mapping
                    if (!imageUrl) {
                        for (_e = 0, _f = Object.entries(colorImageMap); _e < _f.length; _e++) {
                            _g = _f[_e], colorKey = _g[0], imagePaths = _g[1];
                            if (termNameLower.includes(colorKey)) {
                                // Check if any of these paths might exist (we'll need to verify)
                                // For now, we'll use the first path as a suggestion
                                imageUrl = imagePaths[0];
                                break;
                            }
                        }
                    }
                    if (!imageUrl) return [3 /*break*/, 11];
                    _h.label = 7;
                case 7:
                    _h.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, prisma.productAttributeTerm.update({
                            where: { id: term.id },
                            data: { image: imageUrl },
                        })];
                case 8:
                    _h.sent();
                    console.log("\u2705 Updated \"".concat(term.name, "\" with image: ").concat(imageUrl));
                    updated++;
                    return [3 /*break*/, 10];
                case 9:
                    error_1 = _h.sent();
                    console.error("\u274C Error updating \"".concat(term.name, "\":"), error_1);
                    return [3 /*break*/, 10];
                case 10: return [3 /*break*/, 12];
                case 11:
                    console.log("\u26A0\uFE0F  No image found for \"".concat(term.name, "\""));
                    _h.label = 12;
                case 12:
                    _i++;
                    return [3 /*break*/, 6];
                case 13:
                    console.log("\n\uD83D\uDCCA Summary:");
                    console.log("   \u2705 Updated: ".concat(updated, " terms"));
                    console.log("   \u23ED\uFE0F  Skipped (already have images): ".concat(skipped, " terms"));
                    console.log("   \u26A0\uFE0F  No image found: ".concat(colorAttribute.terms.length - updated - skipped, " terms"));
                    return [4 /*yield*/, prisma.$disconnect()];
                case 14:
                    _h.sent();
                    return [2 /*return*/];
            }
        });
    });
}
matchColorImages().catch(console.error);
