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
var fs = require("fs");
var path = require("path");
var prisma = new client_1.PrismaClient();
function checkAllColorImages() {
    return __awaiter(this, void 0, void 0, function () {
        var variants, variantsWithImages, colorAttribute, termsWithImages, products, colorKeywords, potentialSwatches, uniqueSwatches, publicDir, checkDirs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🔍 Comprehensive check for color swatch images...\n');
                    // 1. Check ProductVariant images
                    console.log('1. Checking ProductVariant images:');
                    return [4 /*yield*/, prisma.productVariant.findMany({
                            where: {
                                name: { contains: 'color', mode: 'insensitive' },
                            },
                            select: {
                                value: true,
                                image: true,
                            },
                        })];
                case 1:
                    variants = _a.sent();
                    console.log("   Found ".concat(variants.length, " color variants"));
                    variantsWithImages = variants.filter(function (v) { return v.image; });
                    console.log("   ".concat(variantsWithImages.length, " have images:"));
                    variantsWithImages.slice(0, 10).forEach(function (v) {
                        console.log("     - ".concat(v.value, " \u2192 ").concat(v.image));
                    });
                    if (variantsWithImages.length > 10) {
                        console.log("     ... and ".concat(variantsWithImages.length - 10, " more"));
                    }
                    // 2. Check ProductAttributeTerm images
                    console.log('\n2. Checking ProductAttributeTerm images:');
                    return [4 /*yield*/, prisma.productAttribute.findFirst({
                            where: { name: { equals: 'Color', mode: 'insensitive' } },
                            include: { terms: true },
                        })];
                case 2:
                    colorAttribute = _a.sent();
                    if (colorAttribute) {
                        termsWithImages = colorAttribute.terms.filter(function (t) { return t.image; });
                        console.log("   Found ".concat(colorAttribute.terms.length, " color terms"));
                        console.log("   ".concat(termsWithImages.length, " have images:"));
                        termsWithImages.slice(0, 10).forEach(function (t) {
                            console.log("     - ".concat(t.name, " \u2192 ").concat(t.image));
                        });
                        if (termsWithImages.length > 10) {
                            console.log("     ... and ".concat(termsWithImages.length - 10, " more"));
                        }
                    }
                    // 3. Check product images that might be color swatches
                    console.log('\n3. Checking product images for potential color references:');
                    return [4 /*yield*/, prisma.product.findMany({
                            select: {
                                title: true,
                                images: true,
                            },
                            take: 50,
                        })];
                case 3:
                    products = _a.sent();
                    colorKeywords = ['black', 'brown', 'blonde', 'red', 'blue', 'green', 'purple', 'caramel', 'honey', 'mocha', 'auburn', 'hazelnut', 'chocolate', 'sand', 'gold', 'copper', 'burgundy'];
                    potentialSwatches = [];
                    products.forEach(function (p) {
                        if (p.images && p.images.length > 0) {
                            var titleLower_1 = p.title.toLowerCase();
                            colorKeywords.forEach(function (keyword) {
                                if (titleLower_1.includes(keyword)) {
                                    p.images.forEach(function (img) {
                                        potentialSwatches.push({ color: keyword, image: img });
                                    });
                                }
                            });
                        }
                    });
                    console.log("   Found ".concat(potentialSwatches.length, " potential color swatch images from product titles"));
                    uniqueSwatches = new Map();
                    potentialSwatches.forEach(function (s) {
                        if (!uniqueSwatches.has(s.color)) {
                            uniqueSwatches.set(s.color, s.image);
                        }
                    });
                    console.log("   Unique colors found: ".concat(uniqueSwatches.size));
                    uniqueSwatches.forEach(function (image, color) {
                        console.log("     - ".concat(color, " \u2192 ").concat(image));
                    });
                    // 4. Check file system for swatch images
                    console.log('\n4. Checking file system for swatch images:');
                    publicDir = path.join(__dirname, '../frontend/public');
                    checkDirs = ['swatches', 'colors', 'color-swatches', 'swatch'];
                    checkDirs.forEach(function (dir) {
                        var dirPath = path.join(publicDir, dir);
                        if (fs.existsSync(dirPath)) {
                            console.log("   \u2705 Found directory: ".concat(dir));
                            var files = fs.readdirSync(dirPath);
                            console.log("      Files: ".concat(files.length));
                            files.slice(0, 10).forEach(function (file) {
                                console.log("        - ".concat(file));
                            });
                        }
                    });
                    return [4 /*yield*/, prisma.$disconnect()];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
checkAllColorImages().catch(console.error);
